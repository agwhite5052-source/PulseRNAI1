const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

function scoreBurnout(ci, shifts = []) {
  let total = 0;
  if (ci) {
    total += (ci.stress_level / 10) * 25;
    total += ((10 - ci.sleep_quality) / 10) * 20;
    total += (ci.patient_load / 10) * 15;
    total += Math.min(ci.missed_breaks / 4, 1) * 10;
  }
  const overtime = shifts.filter((s) => s.is_overtime).length;
  total += Math.min(overtime / 3, 1) * 15;
  const maxConsec = shifts.length ? Math.max(...shifts.map((s) => s.consecutive_days || 0)) : 0;
  total += Math.min(maxConsec / 5, 1) * 15;
  return Math.min(Math.round(total), 100);
}

function tierOf(score) {
  if (score <= 25) return 'Low';
  if (score <= 50) return 'Moderate';
  if (score <= 75) return 'Elevated';
  return 'High';
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [checkIns, shifts, feedback, prefs] = await Promise.all([
      db.asServiceRole.entities.CheckIn.list('-created_date', 500),
      db.asServiceRole.entities.Shift.list('-created_date', 500),
      db.asServiceRole.entities.Feedback.list('-created_date', 200),
      db.asServiceRole.entities.ShiftPreference.list('-created_date', 200),
    ]);

    const byNurse = {};
    (checkIns || []).forEach((ci) => {
      const name = ci.nurse_name || 'Unassigned';
      if (!byNurse[name]) byNurse[name] = [];
      byNurse[name].push(ci);
    });

    const latestScores = Object.entries(byNurse).map(([name, cis]) => {
      const sorted = cis.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      const nurseShifts = (shifts || []).filter((s) => (s.nurse_name || 'Unassigned') === name);
      return { name, score: scoreBurnout(sorted[0], nurseShifts) };
    });

    const burnoutDistribution = ['Low', 'Moderate', 'Elevated', 'High'].map((level) => ({
      level,
      count: latestScores.filter((s) => tierOf(s.score) === level).length,
    }));

    const byDate = {};
    (checkIns || []).forEach((ci) => {
      const d = new Date(ci.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!byDate[d]) byDate[d] = { scores: [], fatigue: [] };
      byDate[d].scores.push(scoreBurnout(ci, []));
      byDate[d].fatigue.push(ci.fatigue_level);
    });
    const wellnessTrend = Object.entries(byDate)
      .map(([date, v]) => ({
        date,
        avgScore: Math.round(v.scores.reduce((a, b) => a + b, 0) / v.scores.length),
        avgFatigue: +(v.fatigue.reduce((a, b) => a + b, 0) / v.fatigue.length).toFixed(1),
      }))
      .slice(-12);

    const fatigueTrend = wellnessTrend.map((w) => ({ date: w.date, fatigue: w.avgFatigue }));

    const themeMap = {};
    (feedback || []).forEach((f) => {
      const t = f.theme || 'other';
      if (!themeMap[t]) themeMap[t] = { theme: t, count: 0, sentiment: { positive: 0, neutral: 0, negative: 0 } };
      themeMap[t].count++;
      themeMap[t].sentiment[f.sentiment || 'neutral']++;
    });
    const feedbackThemes = Object.values(themeMap).sort((a, b) => b.count - a.count);

    const shiftByDate = {};
    (shifts || []).forEach((s) => {
      const d = new Date(s.date || s.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!shiftByDate[d]) shiftByDate[d] = { patientLoad: [], hours: 0, overtimeHours: 0, overtimeShifts: 0 };
      shiftByDate[d].patientLoad.push(s.patient_load || 5);
      shiftByDate[d].hours += s.hours || 0;
      shiftByDate[d].overtimeHours += s.overtime_hours || 0;
      if (s.is_overtime) shiftByDate[d].overtimeShifts++;
    });
    const staffingPressure = Object.entries(shiftByDate)
      .map(([date, v]) => ({
        date,
        avgPatientLoad: +(v.patientLoad.reduce((a, b) => a + b, 0) / v.patientLoad.length).toFixed(1),
        totalHours: v.hours,
      }))
      .slice(-12);
    const overtimeTrend = Object.entries(shiftByDate)
      .map(([date, v]) => ({ date, overtimeHours: v.overtimeHours, overtimeShifts: v.overtimeShifts }))
      .slice(-12);

    const atRisk = latestScores.filter((s) => tierOf(s.score) === 'Elevated' || tierOf(s.score) === 'High').length;
    const retentionRisk = {
      atRisk,
      total: latestScores.length,
      rate: latestScores.length ? Math.round((atRisk / latestScores.length) * 100) : 0,
    };

    let interventions = [];
    try {
      const prompt = `You are a healthcare workforce wellness advisor. Based on this department data, suggest 3-4 concise, actionable interventions a charge nurse or manager could take THIS WEEK. Be specific and practical. Avoid medical advice. Return as a JSON object with an "interventions" array of strings.

Data:
- Nurses tracked: ${latestScores.length}
- Burnout distribution: ${burnoutDistribution.map((d) => d.level + ': ' + d.count).join(', ')}
- Avg burnout score trend: ${wellnessTrend.map((w) => w.avgScore).join(' -> ')}
- Top feedback themes: ${feedbackThemes.slice(0, 3).map((t) => t.theme + ' (' + t.count + ')').join(', ')}
- Overtime shifts recent: ${overtimeTrend.reduce((a, o) => a + o.overtimeShifts, 0)}
- Retention risk: ${retentionRisk.atRisk} of ${retentionRisk.total} nurses at elevated/high risk`;
      const result = await db.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: { interventions: { type: 'array', items: { type: 'string' } } },
        },
      });
      interventions = result?.interventions || [];
    } catch (e) {
      interventions = [];
    }

    return Response.json({
      wellnessTrend,
      burnoutDistribution,
      fatigueTrend,
      feedbackThemes,
      staffingPressure,
      overtimeTrend,
      retentionRisk,
      schedulePreferences: prefs || [],
      interventions,
      nurseCount: latestScores.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}