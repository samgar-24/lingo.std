"use client";
import { useState } from "react";
import type { Question } from "@/lib/questions";
import {
  GOALS, LEVEL_NAMES, AnswerRecord, Goal, Lead, buildTest, evaluate, recommendation, saveLead, whatsappLink,
} from "@/lib/quiz";

type Step = "welcome" | "contact" | "goal" | "quiz" | "loading" | "result";

const btn = "w-full rounded-2xl py-4 text-lg font-semibold transition active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100";
const primary = `${btn} bg-brand text-white shadow-lg shadow-brand/25 active:bg-brand-dark`;
const ghost = `${btn} border-2 border-brand text-brand active:bg-brand-soft`;

function Logo() {
  // Оригинальный файл без изменений; лишние белые поля скрыты кадрированием контейнера.
  return (
    <div className="relative mx-auto aspect-[5/2] w-64 overflow-hidden" role="img" aria-label="LinGo language academy">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/lingo-logo.jpg" alt="" className="absolute max-w-none" style={{ width: "200%", left: "-50%", top: "-226%" }} />
    </div>
  );
}

export default function Home() {
  const [step, setStep] = useState<Step>("welcome");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [goal, setGoal] = useState<Goal | "">("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);

  const digits = phone.replace(/\D/g, "");
  const contactOk = name.trim().length >= 2 && digits.length >= 10 && digits.length <= 15;

  function start() {
    setQuestions(buildTest()); setIdx(0); setAnswers([]); setPicked(null); setStep("quiz");
  }

  function answer(opt: string) {
    if (picked) return;
    const q = questions[idx];
    setPicked(opt);
    const next = [...answers, { questionId: q.id, level: q.level, selected: opt, correct: opt === q.correctAnswer }];
    setTimeout(async () => {
      if (idx < 19) { setAnswers(next); setIdx(idx + 1); setPicked(null); return; }
      setStep("loading");
      const { level, score } = evaluate(next);
      const l: Lead = { name: name.trim(), phone, goal, score, level, date: new Date().toISOString(), answers: next };
      await Promise.all([saveLead(l), new Promise((r) => setTimeout(r, 1200))]);
      setLead(l); setStep("result");
    }, 300);
  }

  function share() {
    if (!lead) return;
    window.open(whatsappLink(lead), "_blank");
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-6 pb-8 pt-8">
      {step === "welcome" && (
        <section className="fade-up flex flex-1 flex-col justify-between">
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <Logo />
            <h1 className="mt-10 text-[32px] font-bold leading-tight">Узнай свой уровень английского</h1>
            <p className="mt-4 text-xl text-neutral-600">Бесплатный тест из 20 вопросов</p>
            <p className="mt-2 text-base text-neutral-400">Займёт около 5 минут</p>
          </div>
          <button className={primary} onClick={() => setStep("contact")}>Определить уровень</button>
        </section>
      )}

      {step === "contact" && (
        <section className="fade-up flex flex-1 flex-col">
          <h2 className="mt-6 text-3xl font-bold">Сначала представьтесь</h2>
          <div className="mt-8 space-y-4">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя" autoComplete="given-name"
              className="w-full rounded-2xl border-2 border-neutral-200 px-5 py-4 text-lg outline-none transition focus:border-brand" />
            <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s()-]/g, ""))} placeholder="Номер телефона"
              type="tel" inputMode="tel" autoComplete="tel"
              className="w-full rounded-2xl border-2 border-neutral-200 px-5 py-4 text-lg outline-none transition focus:border-brand" />
          </div>
          <div className="mt-auto pt-8">
            <button className={primary} disabled={!contactOk} onClick={() => setStep("goal")}>Продолжить</button>
          </div>
        </section>
      )}

      {step === "goal" && (
        <section className="fade-up flex flex-1 flex-col">
          <h2 className="mt-6 text-3xl font-bold">Для чего вам нужен английский?</h2>
          <div className="mt-6 space-y-3">
            {GOALS.map((g) => (
              <button key={g} onClick={() => setGoal(g)}
                className={`w-full rounded-2xl border-2 px-5 py-4 text-left text-lg font-medium transition active:scale-[0.98] ${goal === g ? "border-brand bg-brand-soft text-brand" : "border-neutral-200"}`}>
                {g}
              </button>
            ))}
          </div>
          <div className="mt-auto pt-8">
            <button className={primary} disabled={!goal} onClick={start}>Начать тест</button>
          </div>
        </section>
      )}

      {step === "quiz" && questions[idx] && (
        <section className="flex flex-1 flex-col">
          <p className="text-base font-medium text-neutral-500">Вопрос {idx + 1} из 20</p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
            <div className="h-full rounded-full bg-brand transition-all duration-300" style={{ width: `${((idx + (picked ? 1 : 0)) / 20) * 100}%` }} />
          </div>
          <div key={idx} className="slide-in flex flex-1 flex-col">
            <h2 className="mt-10 text-2xl font-semibold leading-snug">{questions[idx].question}</h2>
            <div className="mt-auto space-y-3 pt-8">
              {questions[idx].options.map((o) => (
                <button key={o} disabled={!!picked && picked !== o} onClick={() => answer(o)}
                  className={`w-full rounded-2xl border-2 px-5 py-4 text-left text-lg font-medium transition active:scale-[0.98] disabled:opacity-40 ${picked === o ? "border-brand bg-brand-soft text-brand" : "border-neutral-200"}`}>
                  {o}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {step === "loading" && (
        <section className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-soft border-t-brand" />
          <p className="mt-6 text-lg text-neutral-500">Считаем результат…</p>
        </section>
      )}

      {step === "result" && lead && (
        <section className="fade-up">
          <h2 className="mt-4 text-center text-3xl font-bold">Тест завершён 🎉</h2>
          <div className="mt-6 rounded-3xl bg-brand-soft p-6 text-center">
            <p className="text-base text-neutral-600">Ваш примерный уровень</p>
            <p className="mt-1 text-7xl font-extrabold text-brand">{lead.level}</p>
            <p className="mt-1 text-xl font-medium">{LEVEL_NAMES[lead.level]}</p>
            <p className="mt-4 text-lg text-neutral-700">{lead.score} из 20 правильных ответов</p>
          </div>
          <p className="mt-3 text-center text-sm text-neutral-400">Это предварительная оценка уровня и не заменяет полноценное тестирование.</p>
          <p className="mt-5 text-lg leading-relaxed">{recommendation(lead.level, lead.goal)}</p>

          <div className="mt-8 rounded-3xl border-2 border-brand/20 p-5 text-center">
            <h3 className="text-xl font-bold">Хотите улучшить свой английский?</h3>
            <p className="mt-2 text-neutral-600">Попробуйте обучение в LinGo на бесплатном пробном уроке.</p>
            <a href={whatsappLink(lead)} target="_blank" rel="noopener noreferrer" className={`${primary} mt-5 block`}>Записаться на пробный урок</a>
          </div>

          <button className={`${ghost} mt-4`} onClick={share}>Поделиться результатом</button>
        </section>
      )}
    </main>
  );
}
