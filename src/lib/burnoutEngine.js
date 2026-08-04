// Explainable Burnout Engine — deterministic, weighted scoring.
// No medical claims. Every contribution is traceable to an input.

export const BURNOUT_TIERS = [
  { max: 25, level: "Low", text: "text-emerald-600", bg: "bg-emerald-500", soft: "bg-emerald-50", bar: "bg-emerald-500", description: "You're in a healthy range. Keep up the good work." },
  { max: 50, level: "Moderate", text: "text-amber-600", bg: "bg-amber-500", soft: "bg-amber-50", bar: "bg-amber-500", description: "Some early signs of strain. Consider small adjustments." },
  { max: 75, level: "Elevated", text: "text-orange-600", bg: "bg-orange-500", soft: "bg-orange-50", bar: "bg-orange-500", description: "Elevated risk detected. Prioritize recovery and rest." },
  { max: 100, level: "High", text: "text-rose-600", bg: "bg-rose-500", soft: "bg-rose-50", bar: "bg-rose-500", description: "High risk detected. Please consider seeking support." }
];

export function getBurnoutTier(score) {
  return BURNOUT_TIERS.find((t) => score <= t.max) || BURNOUT_TIERS[BURNOUT_TIERS.length - 1];
}

export function calculateBurnoutScore(checkIn, shifts = []) {
  const factors = [];

  if (checkIn) {
    factors.push({
      key: "stress", label: "Stress", weight: 25,
      score: Math.round((checkIn.stress_level / 10) * 25),
      detail: `Stress level ${checkIn.stress_level}/10`
    });
    factors.push({
      key: "sleep", label: "Low Sleep", weight: 20,
      score: Math.round(((10 - checkIn.sleep_quality) / 10) * 20),
      detail: `Sleep quality ${checkIn.sleep_quality}/10`
    });
    factors.push({
      key: "patientLoad", label: "Patient Load", weight: 15,
      score: Math.round((checkIn.patient_load / 10) * 15),
      detail: `Patient load ${checkIn.patient_load}/10`
    });
    factors.push({
      key: "missedBreaks", label: "Missed Breaks", weight: 10,
      score: Math.round(Math.min(checkIn.missed_breaks / 4, 1) * 10),
      detail: `${checkIn.missed_breaks} missed break(s) this week`
    });
  }

  const overtimeShifts = shifts.filter((s) => s.is_overtime).length;
  factors.push({
    key: "overtime", label: "Overtime", weight: 15,
    score: Math.round(Math.min(overtimeShifts / 3, 1) * 15),
    detail: `${overtimeShifts} overtime shift(s)`
  });

  const maxConsec = shifts.length ? Math.max(...shifts.map((s) => s.consecutive_days || 0)) : 0;
  factors.push({
    key: "consecutiveDays", label: "Consecutive Days", weight: 15,
    score: Math.round(Math.min(maxConsec / 5, 1) * 15),
    detail: `${maxConsec} consecutive day(s) worked`
  });

  const total = factors.reduce((sum, f) => sum + f.score, 0);
  const tier = getBurnoutTier(total);
  const contributingFactors = factors.filter((f) => f.score > 0).sort((a, b) => b.score - a.score);

  return { score: Math.min(total, 100), tier, factors, contributingFactors };
}

export function calculateBurnoutTrend(checkIns = []) {
  return [...checkIns]
    .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
    .map((ci) => {
      const result = calculateBurnoutScore(ci, []);
      return {
        date: new Date(ci.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        score: result.score,
        stress: ci.stress_level,
        sleep: ci.sleep_quality,
        fatigue: ci.fatigue_level
      };
    });
}