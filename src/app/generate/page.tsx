"use client";

import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";

function WordIcon() {
  return (
    <svg viewBox="0 0 22 22" className="h-4 w-4 shrink-0" aria-hidden="true">
      <rect width="22" height="22" rx="3" fill="#2B579A"/>
      <text x="11" y="16" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="Arial, sans-serif">W</text>
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg viewBox="0 0 34 22" className="h-4 w-auto shrink-0" aria-hidden="true">
      <rect width="34" height="22" rx="3" fill="#DC2626"/>
      <text x="17" y="16" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial, sans-serif">PDF</text>
    </svg>
  );
}

const SUBJECTS = [
  "Қазақ тілі", "Қазақ әдебиеті", "Орыс тілі", "Орыс әдебиеті",
  "Ағылшын тілі", "Математика", "Алгебра", "Геометрия", "Информатика",
  "Физика", "Химия", "Биология", "География", "Қазақстан тарихы",
  "Дүниежүзі тарихы", "Жаратылыстану", "Дүниетану", "Өзін-өзі тану",
  "Музыка", "Бейнелеу өнері", "Дене шынықтыру", "Технология",
];

const LESSON_TYPES = [
  "Жаңа білімді меңгеру", "Бекіту", "Қайталау",
  "Аралас сабақ", "БЖБ сабағы",
];

type FormState = {
  teacherName: string;
  subject: string;
  grade: string;
  topic: string;
  lessonType: string;
  duration: string;
  assessmentType: string;
  specialNeeds: string;
};

const INITIAL_FORM: FormState = {
  teacherName: "",
  subject: "",
  grade: "5",
  topic: "",
  lessonType: "Жаңа білімді меңгеру",
  duration: "40 минут",
  assessmentType: "Тек қалыптастырушы бағалау",
  specialNeeds: "Жоқ",
};

function SelectField({
  label, value, onChange, options, required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-900 text-sm bg-white"
      >
        {required && value === "" && (
          <option value="" disabled>— таңдаңыз —</option>
        )}
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

export default function GeneratePage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [downloading, setDownloading] = useState<"docx" | null>(null);

  const set = (key: keyof FormState) => (v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Қате шықты");
        return;
      }

      // Streaming режимі — мәтін бірте-бірте шығады
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      setResult("");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setResult(accumulated);
      }
      accumulated += decoder.decode();
      setResult(accumulated);
    } catch {
      setError("Интернет байланысын тексеріңіз");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const safeFilename = (s: string) => s.replace(/[\\/:*?"<>|]/g, "_").slice(0, 40);

  const handleDownloadDocx = async () => {
    if (!result || downloading) return;
    setDownloading("docx");
    try {
      const { generateDocx } = await import("./docxGenerator");
      const blob = await generateDocx(result, form.subject, form.grade, form.topic);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ҚМЖ_${safeFilename(form.subject)}_${form.grade}_${safeFilename(form.topic)}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      console.error("DOCX error:", e);
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadPdf = () => {
    handlePrint();
  };

  const handlePrint = () => {
    const existing = document.getElementById("__print_page__");
    if (existing) existing.remove();
    const style = document.createElement("style");
    style.id = "__print_page__";
    style.textContent = `@page { size: A4 ${orientation}; margin: 10mm; }`;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => {
      const el = document.getElementById("__print_page__");
      if (el) el.remove();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">
            ShyraqAI
          </Link>
          <span className="text-sm text-gray-500 font-medium">ҚМЖ генераторы</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Page header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-2 rounded-full mb-4">
            <span>✦</span> AI арқылы ресми ҚМЖ
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ҚМЖ жасаушы</h1>
          <p className="text-gray-500">
            Параметрлерді таңдаңыз — Қазақстанның ресми үлгісіне сай жоспар шығады
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Мұғалімнің аты-жөні */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Мұғалімнің аты-жөні
              </label>
              <input
                type="text"
                placeholder="мысалы: Аузезова Ажар"
                value={form.teacherName}
                onChange={(e) => set("teacherName")(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-900 placeholder-gray-400 text-sm"
              />
            </div>

            {/* Row 1: Пән + Сынып */}
            <div className="grid sm:grid-cols-2 gap-4">
              <SelectField
                label="Пән"
                value={form.subject}
                onChange={set("subject")}
                options={SUBJECTS}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Сынып <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.grade}
                  onChange={(e) => set("grade")(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-900 text-sm bg-white"
                >
                  {Array.from({ length: 11 }, (_, i) => i + 1).map((g) => (
                    <option key={g} value={String(g)}>{g}-сынып</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Сабақ түрі + Ұзақтығы */}
            <div className="grid sm:grid-cols-2 gap-4">
              <SelectField
                label="Сабақ түрі"
                value={form.lessonType}
                onChange={set("lessonType")}
                options={LESSON_TYPES}
              />
              <SelectField
                label="Сабақ ұзақтығы"
                value={form.duration}
                onChange={set("duration")}
                options={["40 минут", "45 минут"]}
              />
            </div>

            {/* Row 3: Бағалау + ЕБҚ */}
            <div className="grid sm:grid-cols-2 gap-4">
              <SelectField
                label="Бағалау түрі"
                value={form.assessmentType}
                onChange={set("assessmentType")}
                options={["Тек қалыптастырушы бағалау", "БЖБ қосылсын"]}
              />
              <SelectField
                label="ЕБҚ қолдауы керек пе?"
                value={form.specialNeeds}
                onChange={set("specialNeeds")}
                options={["Жоқ", "Иә"]}
              />
            </div>

            {/* Бағалау белгісі */}
            {form.assessmentType === "БЖБ қосылсын" && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm text-amber-700">
                <span>⭐</span>
                Нәтижеде БЖБ тапсырмалары мен бағалау кестесі де шығады
              </div>
            )}

            {/* Тақырып */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Сабақ тақырыбы <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="мысалы: Бөлшек сандарды қосу"
                value={form.topic}
                onChange={(e) => set("topic")(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-900 placeholder-gray-400 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !form.subject}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Жасалып жатыр...
                </>
              ) : (
                <>✦ ҚМЖ жасау</>
              )}
            </button>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-red-700 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Result */}
        {result !== null && (
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden print-area">

            {/* Action bar */}
            <div className="no-print flex flex-wrap items-center justify-between gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-white/80 text-sm font-medium shrink-0">📋 Дайын ҚМЖ</span>
                <span className="text-white/50 text-xs truncate hidden sm:block">
                  {form.subject} · {form.grade}-сынып · {form.topic}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {/* Orientation toggle */}
                <div className="flex rounded-lg overflow-hidden border border-white/30 text-xs font-medium">
                  <button
                    onClick={() => setOrientation("portrait")}
                    title="Кітаптық (тік)"
                    className={`flex items-center gap-1 px-2.5 py-1.5 transition-colors ${
                      orientation === "portrait"
                        ? "bg-white text-blue-600"
                        : "text-white/80 hover:bg-white/15"
                    }`}
                  >
                    <svg viewBox="0 0 10 14" className="w-2.5 h-3.5 fill-current shrink-0">
                      <rect x="0.75" y="0.75" width="8.5" height="12.5" rx="0.75" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    <span className="hidden sm:inline">Тік</span>
                  </button>
                  <button
                    onClick={() => setOrientation("landscape")}
                    title="Альбомдық (көлденең)"
                    className={`flex items-center gap-1 px-2.5 py-1.5 transition-colors ${
                      orientation === "landscape"
                        ? "bg-white text-blue-600"
                        : "text-white/80 hover:bg-white/15"
                    }`}
                  >
                    <svg viewBox="0 0 14 10" className="w-3.5 h-2.5 fill-current shrink-0">
                      <rect x="0.75" y="0.75" width="12.5" height="8.5" rx="0.75" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    <span className="hidden sm:inline">Көлденең</span>
                  </button>
                </div>

                {/* Copy */}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                >
                  {copied ? <>✓ Көшірілді</> : <>📋 <span className="hidden sm:inline">Көшіру</span></>}
                </button>

                {/* Word download */}
                <button
                  onClick={handleDownloadDocx}
                  disabled={!!downloading}
                  title="Word (.docx) жүктеу"
                  className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 disabled:opacity-60 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                >
                  {downloading === "docx" ? (
                    <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                  ) : <WordIcon />}
                  <span className="hidden sm:inline">Word</span>
                </button>

                {/* PDF download */}
                <button
                  onClick={handleDownloadPdf}
                  title="Басып шығару диалогында 'PDF ретінде сақтау' таңдаңыз"
                  className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                >
                  <PdfIcon /> <span className="hidden sm:inline">PDF</span>
                </button>

                {/* Print */}
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                >
                  🖨️ <span className="hidden sm:inline">Басып шығару</span>
                </button>
              </div>
            </div>

            {/* Document content */}
            <div className="px-6 sm:px-10 py-8" style={{ fontSize: "15px", lineHeight: "1.7" }}>
              {loading && (
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-4 no-print">
                  <span className="inline-block w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
                  <span>ҚМЖ жасалуда...</span>
                </div>
              )}
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeRaw, rehypeKatex]}
                components={{
                  h1: ({ children }) => (
                    <h1 style={{ fontSize: "18px" }} className="font-bold text-gray-900 mt-2 mb-4 pb-2 border-b border-gray-400 text-center">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 style={{ fontSize: "14px" }} className="font-bold text-gray-900 mt-6 mb-2 uppercase tracking-wide">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 style={{ fontSize: "13px" }} className="font-bold text-gray-900 mt-4 mb-1">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-900 mb-2">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="mb-3 space-y-1 pl-1">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-3 space-y-1 pl-5 list-decimal">{children}</ol>
                  ),
                  li: ({ children, ...props }) => {
                    const isOrdered = (props as { ordered?: boolean }).ordered;
                    return isOrdered ? (
                      <li className="text-gray-900 leading-relaxed">{children}</li>
                    ) : (
                      <li className="text-gray-900 flex items-start gap-2">
                        <span className="mt-[7px] shrink-0 w-1.5 h-1.5 rounded-full bg-gray-600" />
                        <span>{children}</span>
                      </li>
                    );
                  },
                  strong: ({ children }) => (
                    <strong className="font-semibold text-gray-900">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-gray-700">{children}</em>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="my-3 pl-4 pr-3 py-2 border-l-2 border-gray-400 text-gray-700 italic">
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-3 border border-gray-400">
                      <table className="w-full border-collapse text-sm">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-gray-100 text-gray-900">{children}</thead>
                  ),
                  th: ({ children }) => (
                    <th className="px-3 py-2 text-left font-bold text-[13px] border border-gray-400">
                      {children}
                    </th>
                  ),
                  tbody: ({ children }) => <tbody>{children}</tbody>,
                  tr: ({ children }) => (
                    <tr className="border-b border-gray-300 last:border-0">
                      {children}
                    </tr>
                  ),
                  td: ({ children }) => (
                    <td className="px-3 py-2 text-gray-900 align-top border border-gray-300 text-[13px]">
                      {children}
                    </td>
                  ),
                  code: ({ children, className }) => {
                    const isBlock = className?.includes("language-");
                    return isBlock ? (
                      <code className="block bg-gray-100 text-gray-900 border border-gray-300 rounded p-3 text-[13px] font-mono my-3 overflow-x-auto">
                        {children}
                      </code>
                    ) : (
                      <code className="bg-gray-100 text-gray-900 border border-gray-200 rounded px-1.5 py-0.5 text-[13px] font-mono">
                        {children}
                      </code>
                    );
                  },
                  hr: () => <hr className="my-4 border-gray-300" />,
                }}
              >
                {result}
              </ReactMarkdown>
            </div>

            {/* Footer */}
            <div className="no-print px-8 sm:px-10 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
              <span>ShyraqAI · ҚМЖ генераторы</span>
              <span>{form.subject} · {form.grade}-сынып · {form.lessonType}</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
