import { QUESTIONS } from "./questions";
import type { Level, Question } from "./questions";

export const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1"];
export const LEVEL_NAMES: Record<Level, string> = {
  A1: "Beginner", A2: "Elementary", B1: "Intermediate", B2: "Upper-Intermediate", C1: "Advanced",
};
export const GOALS = ["Для работы", "Для учёбы", "Для путешествий", "Для общения", "Хочу свободно говорить", "Другое"] as const;
export type Goal = (typeof GOALS)[number];

export interface AnswerRecord { questionId: number; level: Level; selected: string; correct: boolean }
export interface Lead {
  name: string; phone: string; goal: Goal | ""; score: number; level: Level; date: string; answers: AnswerRecord[];
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 4 вопроса на каждый уровень, всё перемешано, варианты ответов тоже. */
export function buildTest(): Question[] {
  const picked = LEVELS.flatMap((lvl) => shuffle(QUESTIONS.filter((q) => q.level === lvl)).slice(0, 4));
  return shuffle(picked).map((q) => ({ ...q, options: shuffle(q.options) }));
}

/** Идём снизу вверх: уровень засчитывается при ≥3/4 верных; ≤1/4 верных — стоп. */
export function evaluate(answers: AnswerRecord[]): { level: Level; score: number } {
  let level: Level = "A1";
  for (const lvl of LEVELS) {
    const ok = answers.filter((a) => a.level === lvl && a.correct).length;
    if (ok >= 3) level = lvl;
    else if (ok <= 1) break;
  }
  return { level, score: answers.filter((a) => a.correct).length };
}

const GOAL_TIPS: Record<string, string> = {
  "Для работы": "Для работы вам будет полезно развивать разговорную речь, профессиональную лексику и уверенность в общении.",
  "Для учёбы": "Для учёбы важно укреплять грамматику, академическую лексику и навыки аудирования и письма.",
  "Для путешествий": "Для путешествий стоит тренировать живой разговор, понимание на слух и полезные повседневные фразы.",
  "Для общения": "Для общения лучше всего прокачивать разговорную практику, лексику и понимание живой речи.",
  "Хочу свободно говорить": "Чтобы говорить свободно, вам нужна регулярная разговорная практика и уверенность в спонтанной речи.",
  "Другое": "Мы подберём программу под вашу цель: разговорная практика, грамматика и лексика.",
};
export const recommendation = (level: Level, goal: string) =>
  `Ваш текущий уровень — ${level}. ${GOAL_TIPS[goal] ?? GOAL_TIPS["Другое"]}`;

export function whatsappLink(lead: Lead): string {
  const num = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, "");
  const text = `Здравствуйте! Я прошёл тест LinGo.\nМой уровень: ${lead.level}.\nРезультат: ${lead.score}/20.\nМоя цель: ${lead.goal}.\nХочу узнать о пробном уроке.`;
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}

export const shareText = (level: Level, url: string) =>
  `Я прошёл тест LinGo и получил уровень ${level} 🎉\n\nА какой уровень английского у тебя?\n\nПройди тест LinGo: ${url}`;

/** Единая точка сохранения лида: localStorage + API (/api/lead → webhook/CRM). */
export async function saveLead(lead: Lead): Promise<void> {
  try {
    const all = JSON.parse(localStorage.getItem("lingo_leads") || "[]");
    localStorage.setItem("lingo_leads", JSON.stringify([...all, lead]));
  } catch {}
  try {
    await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(lead) });
  } catch {}
}
