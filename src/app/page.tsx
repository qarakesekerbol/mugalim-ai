import ContactForm from "@/app/components/ContactForm";

const benefits = [
  {
    icon: (
      <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Жылдамдық",
    desc: "Секундтар ішінде нәтиже аласыз. Сабаққа дайындалу уақыты 10 есе қысқарады.",
  },
  {
    icon: (
      <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Оңай қолдану",
    desc: "Арнайы техникалық білімсіз-ақ пайдалануға болады. Интерфейс қарапайым және түсінікті.",
  },
  {
    icon: (
      <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    title: "Жоғары сапа",
    desc: "Мемлекеттік білім стандарттарына сай, сауатты және толыққанды материалдар.",
  },
  {
    icon: (
      <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Уақыт үнемдеу",
    desc: "Құжат дайындауға кететін сағаттарды үнемдеп, оқушыларға көбірек уақыт бөліңіз.",
  },
];

const features = [
  {
    icon: "📋",
    title: "ҚМЖ жасау",
    desc: "Күнтізбелік-мерзімдік жоспарды автоматты түрде кез келген пән мен сынып үшін дайындаңыз.",
  },
  {
    icon: "✅",
    title: "Тест құрастыру",
    desc: "Тақырып бойынша бірнеше деңгейдегі сұрақтар мен жауаптары бар тест жасаңыз.",
  },
  {
    icon: "✍️",
    title: "Эссе және жазба жұмыстары",
    desc: "Эссе тақырыптарын, үлгі жауаптарды және бағалау критерийлерін алыңыз.",
  },
  {
    icon: "📊",
    title: "Презентация дайындау",
    desc: "Сабаққа арналған слайд жоспарын және мазмұнын жылдам дайындаңыз.",
  },
  {
    icon: "🎮",
    title: "Сабаққа ойындар",
    desc: "Оқушыларды тартатын интерактивті ойындар мен белсенді тапсырмалар жасаңыз.",
  },
];

const reviews = [
  {
    text: "Mugalim.ai маған ҚМЖ дайындауға кететін уақытты 3 есе қысқартты. Енді сол уақытты оқушыларыма арнаймын!",
    name: "Айгүл Сейткали",
    subject: "Қазақ тілі мен әдебиеті мұғалімі",
    initials: "АС",
  },
  {
    text: "Тест жасау бұрын маған өте қиын болатын. Қазір бірнеше минутта дайын болады. Керемет платформа!",
    name: "Дәурен Омаров",
    subject: "Математика мұғалімі",
    initials: "ДО",
  },
  {
    text: "Оқушыларыма арналған ойындар мен белсенді тапсырмаларды жасау үшін тамаша құрал. Ұсынамын!",
    name: "Жанар Бекова",
    subject: "Ағылшын тілі мұғалімі",
    initials: "ЖБ",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white font-sans text-gray-800">

      {/* Навигация */}
      <nav className="sticky top-0 z-50 border-b border-blue-50 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold text-blue-600">Mugalim.ai</span>
          <a
            href="#contact"
            className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Тегін бастау
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 px-6 py-24 text-white md:py-36">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-white" />
          <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-white" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <span className="mb-4 inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            🇰🇿 Қазақстан мұғалімдеріне арналған
          </span>
          <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            Мұғалімнің жұмысын
            <br />
            <span className="text-yellow-300">жеңілдететін</span> AI көмекші
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-blue-100 md:text-xl">
            ҚМЖ, тест, эссе, презентация — бәрін секундтар ішінде дайындаңыз.
            Уақытыңызды оқушыларыңызға арнаңыз.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="#contact"
              className="rounded-2xl bg-white px-8 py-4 text-lg font-bold text-blue-600 shadow-lg transition hover:shadow-xl hover:scale-105 active:scale-100"
            >
              Тегін бастау →
            </a>
            <a
              href="#features"
              className="rounded-2xl border-2 border-white/50 px-8 py-4 text-lg font-semibold text-white transition hover:bg-white/10"
            >
              Мүмкіндіктерді көру
            </a>
          </div>
        </div>
      </section>

      {/* Артықшылықтар */}
      <section className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">
              Неліктен Mugalim.ai?
            </h2>
            <p className="mx-auto max-w-xl text-gray-500">
              Мыңдаған мұғалімдер уақытын үнемдеп, жұмысын жақсартты
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md hover:-translate-y-1"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Мүмкіндіктер */}
      <section id="features" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">
              Не істей аламыз?
            </h2>
            <p className="mx-auto max-w-xl text-gray-500">
              Педагогикалық жұмыстың барлық түрі — бір жерде
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((item) => (
              <div
                key={item.title}
                className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >
                <span className="text-3xl">{item.icon}</span>
                <div>
                  <h3 className="mb-1 font-bold text-gray-900">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
            {/* Көбірек жоспарда */}
            <div className="flex gap-4 rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-6">
              <span className="text-3xl">🚀</span>
              <div>
                <h3 className="mb-1 font-bold text-blue-700">Жақында тағы да...</h3>
                <p className="text-sm leading-relaxed text-blue-500">
                  Жаңа мүмкіндіктер үнемі қосылып отырады. Бірінші болып хабардар болыңыз!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Пікірлер */}
      <section className="bg-gradient-to-br from-blue-50 to-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">
              Мұғалімдер не дейді?
            </h2>
            <p className="mx-auto max-w-xl text-gray-500">
              Нақты мұғалімдердің нақты пікірлері
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {reviews.map((r) => (
              <div
                key={r.name}
                className="flex flex-col gap-5 rounded-2xl bg-white p-7 shadow-sm transition hover:shadow-md"
              >
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="flex-1 leading-relaxed text-gray-600">&ldquo;{r.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                    {r.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.subject}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Өтініш формасы */}
      <section id="contact" className="px-6 py-20">
        <div className="mx-auto max-w-lg">
          <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-100 md:p-10">
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-3xl font-bold text-gray-900">Тегін бастаңыз</h2>
              <p className="text-gray-500">
                Мәліметіңізді қалдырыңыз — біз сізге жеке байланысамыз
              </p>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col items-center gap-6 md:flex-row md:justify-between">
            <div>
              <p className="mb-1 text-xl font-bold text-blue-600">Mugalim.ai</p>
              <p className="text-sm text-gray-400">Мұғалімдерге арналған AI платформасы</p>
            </div>
            <div className="flex flex-col items-center gap-3 text-sm text-gray-500 md:items-end">
              <a href="mailto:info@mugalim.ai" className="flex items-center gap-2 transition hover:text-blue-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                info@mugalim.ai
              </a>
              <a href="tel:+77001234567" className="flex items-center gap-2 transition hover:text-blue-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +7 700 123 45 67
              </a>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Mugalim.ai — Барлық құқықтар қорғалған
          </div>
        </div>
      </footer>

    </main>
  );
}
