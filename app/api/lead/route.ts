import { NextResponse } from "next/server";

// Куда уходят лиды (все шаги необязательны, включаются переменными окружения):
//  1) лог сервера (Vercel → Logs)
//  2) Supabase: SUPABASE_URL + SUPABASE_SERVICE_KEY → строка в таблице leads
//  3) Telegram: TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID → сообщение менеджеру
//  4) вебхук: LEAD_WEBHOOK_URL (Supabase Edge Function, n8n, Zapier, CRM)
export async function POST(req: Request) {
  const lead = await req.json();
  console.log("[LinGo lead]", JSON.stringify(lead));

  const tasks: Promise<unknown>[] = [];
  const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_CHAT_ID: chat, LEAD_WEBHOOK_URL: hook } = process.env;

  const { SUPABASE_URL: sbUrl, SUPABASE_SERVICE_KEY: sbKey } = process.env;
  if (sbUrl && sbKey) {
    tasks.push(fetch(`${sbUrl.replace(/\/$/, "")}/rest/v1/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", apikey: sbKey, Prefer: "return=minimal",
        ...(sbKey.startsWith("eyJ") ? { Authorization: `Bearer ${sbKey}` } : {}),
      },
      body: JSON.stringify({
        name: lead.name, phone: lead.phone, goal: lead.goal, score: lead.score,
        level: lead.level, answers: lead.answers, created_at: lead.date,
      }),
    }).then(async (r) => { if (!r.ok) console.error("[LinGo lead] supabase", r.status, await r.text()); }));
  }

  if (token && chat) {
    const text = `🎯 Новый лид LinGo\nИмя: ${lead.name}\nТелефон: ${lead.phone}\nЦель: ${lead.goal}\nУровень: ${lead.level} (${lead.score}/20)`;
    tasks.push(fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: chat, text }),
    }));
  }
  if (hook) {
    tasks.push(fetch(hook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(lead) }));
  }
  await Promise.allSettled(tasks);
  return NextResponse.json({ ok: true });
}
