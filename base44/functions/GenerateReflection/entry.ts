const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const entries = Array.isArray(body.entries) ? body.entries : null;

    let journalText = '';
    if (entries) {
      journalText = entries.map((e) => `- ${e.content || ''}`).join('\n');
    } else {
      const recent = await db.entities.JournalEntry.list('-created_date', 10);
      journalText = (recent || [])
        .map((e) => `- ${e.content || ''}`)
        .join('\n');
    }

    if (!journalText.trim()) {
      return Response.json({
        reflection:
          "I don't have any journal entries to reflect on yet. Start writing a few notes about your day, and I'll offer a supportive reflection based on what you share.",
      });
    }

    const prompt = `You are a compassionate wellness coach for nurses. Based on the following journal entries, write a short, warm, non-clinical reflection (3-4 sentences). Acknowledge what the nurse is experiencing, gently highlight any patterns (stress, fatigue, sleep, workload), and offer one practical, supportive suggestion. Do NOT make medical diagnoses or give medical advice. Speak in second person, kindly.

Journal entries:
${journalText}`;

    const result = await db.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
    });

    return Response.json({ reflection: typeof result === 'string' ? result : result?.response || result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}