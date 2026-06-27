"use client";

import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", phone: "" });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.name.trim() && form.phone.trim()) {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-xl font-semibold text-gray-800">Рахмет, {form.name}!</p>
        <p className="text-gray-500">Жақын арада сізбен хабарласамыз.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium text-gray-700">
          Аты-жөніңіз
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Мысалы: Айгүл Бекова"
          value={form.name}
          onChange={handleChange}
          className="rounded-xl border border-gray-200 px-4 py-3 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="phone" className="text-sm font-medium text-gray-700">
          Телефон нөмірі
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          placeholder="+7 (___) ___-__-__"
          value={form.phone}
          onChange={handleChange}
          className="rounded-xl border border-gray-200 px-4 py-3 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400"
        />
      </div>
      <button
        type="submit"
        className="mt-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700 active:scale-95"
      >
        Жіберу
      </button>
    </form>
  );
}
