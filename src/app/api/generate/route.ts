import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

// Файл payload типтері (client-тен келеді)
type FilePayload =
  | { type: "text"; text: string; name: string }
  | { type: "image"; mimeType: "image/jpeg" | "image/png" | "image/gif" | "image/webp"; base64: string; name: string }
  | { type: "pdf"; base64: string; name: string };

// Anthropic API контент блоктары
type ApiImageBlock = {
  type: "image";
  source: { type: "base64"; media_type: "image/jpeg" | "image/png" | "image/gif" | "image/webp"; data: string };
};
type ApiDocBlock = {
  type: "document";
  source: { type: "base64"; media_type: "application/pdf"; data: string };
};
type ApiBlock = ApiImageBlock | ApiDocBlock | { type: "text"; text: string };

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function buildPrompt(
  subject: string,
  grade: string,
  topic: string,
  lessonType: string,
  duration: string,
  assessmentType: string,
  specialNeeds: string,
  teacherName: string,
  learningObjectives: string,
  lessonGoal: string,
  suggestedText: string,
  theory: string,
  extraInstructions: string,
  fileInstruction: string
): string {
  const withSEN = specialNeeds === "Иә";
  const withBZhB = assessmentType === "БЖБ қосылсын";
  const durationMin = duration === "45 минут" ? "45" : "40";

  // Мұғалімнің нақты нұсқауларын жинақтау
  const userParts: string[] = [];
  if (lessonGoal) userParts.push(
    `САБАҚТЫҢ МАҚСАТЫ (мұғалімнің нұсқауы — ҚМЖ-ның "Сабақтың мақсаты" жолына МІНДЕТТІ ТҮР​ДЕ дәл осыны жаз, өзгертпе):\n${lessonGoal}`
  );
  if (suggestedText) userParts.push(
    `САБАҚҚА КІРГІЗІЛЕТІН МӘТІН / МАЗМҰН (мұғалімнің нұсқауы — осы мазмұнды сабақтың орта бөліміне кіргіз):\n${suggestedText}`
  );
  if (theory) userParts.push(
    `ТЕОРИЯ / ЕРЕЖЕ / ФОРМУЛА (мұғалімнің нұсқауы — осыны сабақта міндетті ескер):\n${theory}`
  );
  if (extraInstructions) userParts.push(
    `ҚОСЫМША НҰСҚАУЛАР (мұғалімнің талабы — ҚМЖ бойы осыларды ескер):\n${extraInstructions}`
  );
  if (fileInstruction) userParts.push(fileInstruction);
  const userSection = userParts.length > 0
    ? `\nМҰҒАЛІМНІҢ НАҚТЫ НҰСҚАУЛАРЫ (ең жоғары басымдық — дәл орында):\n${userParts.join("\n\n")}\n`
    : "";

  const senColumn = withSEN ? " ЕБҚ қолдауы |" : "";
  const senHeader = withSEN ? " ЕБҚ қолдауы |" : "";
  const senSep = withSEN ? ":--|" : "";
  const senCell = (text: string) => withSEN ? ` ${text} |` : "";

  const bzhabSection = withBZhB
    ? `
## Бағалау критерийлері (БЖБ — 10 балл)

| Критерий | Дескриптор | Балл |
|:--|:--|:--:|
| [1-критерий: тақырыпқа сай] | Оқушы [не орындайды — 1-деңгей] | 2 |
| [2-критерий] | Оқушы [не орындайды — 2-деңгей] | 3 |
| [3-критерий] | Оқушы [не орындайды — 3-деңгей] | 3 |
| [4-критерий: жоғары деңгей] | Оқушы [не орындайды — жоғары деңгей] | 2 |
| **Барлығы** | | **10** |

## БЖБ тапсырмалары

**1-тапсырма (2 балл)**
[Тақырып бойынша базалық деңгей тапсырмасы — нақты мәтінмен]

**2-тапсырма (3 балл)**
[Орташа деңгей тапсырмасы — нақты мәтінмен]

**3-тапсырма (3 балл)**
[Орташа-жоғары деңгей тапсырмасы]

**4-тапсырма (2 балл)**
[Жоғары деңгей тапсырмасы — шығармашылық немесе сыни ойлауды талап ету]
`
    : "";

  return `Сен Қазақстан мектебінің тәжірибелі мұғалімісің. Төменде берілген параметрлер бойынша РЕСМИ ҚМЖ (Қысқа мерзімді жоспар) жаса.
${userSection}
Параметрлер:
- Пән: ${subject}
- Сынып: ${grade}
- Тақырып: ${topic}
- Сабақ түрі: ${lessonType}
- Сабақ ұзақтығы: ${durationMin} минут
- Бағалау түрі: ${assessmentType}
- ЕБҚ қолдауы: ${specialNeeds}

Нәтижені ТІКЕЛЕЙ мына Markdown форматында жаз — ешқандай қосымша түсіндірме қоспа:

---

# Қысқа мерзімді жоспар

| | |
|:--|:--|
| **Бөлім:** | [Оқу бағдарламасының тиісті бөлімі] |
| **Мұғалімнің аты-жөні:** | ${teacherName || "___"} |
| **Күні:** | |
| **Сынып:** | ${grade}, Қатысқандар: ___ Қатыспағандар: ___ |
| **Сабақ тақырыбы:** | ${topic} |
| **Сабақ түрі:** | ${lessonType} |
| **Оқу мақсаттары:** | ${learningObjectives ? learningObjectives.replace(/\n/g, "<br/>") : `${grade}.X.X.X — [бірінші оқу мақсатының толық мәтіні]<br/>${grade}.X.X.X — [екінші оқу мақсатының толық мәтіні]`} |
| **Сабақтың мақсаты:** | 1. [Барлық оқушылар орындай алатын мақсат]<br/>2. [Оқушылардың басым бөлігі орындай алатын мақсат]<br/>3. [Кейбір оқушылар орындай алатын мақсат — жоғары деңгей] |
| **Бағалау критерийі:** | [Оқушы нені орындаса мақсатқа жеткен деп есептеледі — 2–3 нақты критерий] |
| **Тілдік мақсат:** | Оқушылар [тілдік дағды: оқу / жазу / сөйлеу / тыңдау] арқылы [не жасайды] |
| **Негізгі сөздер мен тіркестер:** | [5–7 термин, үтірмен бөлінген] |
| **Диалог / жазылым үшін тілдік бірліктер:** | «Менің ойымша, ...»<br/>«Мен келісемін, себебі ...»<br/>[Тақырыпқа сай тағы 1 үлгі] |
| **Алдыңғы оқу:** | [Оқушылар бұл тақырыпты оқымас бұрын не білуі керек] |

## Сабақтың барысы

| Кезең / Уақыт | Мұғалім әрекеті | Оқушы әрекеті |${senHeader} Бағалау | Ресурстар |
|:--|:--|:--|${senSep}:--|:--|
| **Сабақтың басы**<br/>(Қызығушылықты ояту)<br/>0–7 мин | **Ұйымдастыру (1 мин):**<br/>«Сәлеметсіздер ме! Отырыңыздар.»<br/><br/>**Ынталандыру (3 мин):**<br/>[Тақырыпқа байланысты қызықты сұрақ немесе факт. Мысалы: «Бүгін біз ... туралы білеміз. Сіздерше, ...?»]<br/><br/>**Алдыңғы білімді белсендіру (3 мин):**<br/>[Алдыңғы тақырыпқа 1–2 сұрақ. Жылдам тапсырма.] | [Оқушылар мұғалімнің сұрақтарына жауап береді. Пікір алмасады.] |${senCell("[Суреттер, сызбалар немесе нақты заттар арқылы қолдау]")} [Ауызша жауап арқылы бақылау] | Тақтай, суреттер |
| **Сабақтың ортасы**<br/>(Мағынаны тану)<br/>7–33 мин | **Жаңа білімді түсіндіру (10 мин):**<br/>[Мұғалім жаңа тақырыпты кесте, сызба немесе мысалдармен түсіндіреді. Нақты 2–3 мысал келтіреді.]<br/><br/>**Жұптық / топтық жұмыс (10 мин):**<br/>[Тапсырманың нақты мәтіні. «Жұпта талқылаңыздар: ...» немесе «Топта ... жасаңыздар»]<br/><br/>**Деңгейлік тапсырмалар (6 мин):**<br/>— I деңгей: [Базалық тапсырма]<br/>— II деңгей: [Орташа тапсырма]<br/>— III деңгей: [Жоғары деңгей тапсырмасы] | [Мұғалімді тыңдайды, конспект жазады. Жұпта / топта жұмыс жасайды. Деңгейлік тапсырмаларды орындайды.] |${senCell("[Жұмыс парақтары, мысал алгоритм, нақты нұсқаулар]")} [Топтық жұмысты бақылау. Дескриптор бойынша өзара бағалау.] | Оқулық, жұмыс дәптері, раздатка |
| **Сабақтың соңы**<br/>(Рефлексия)<br/>33–${durationMin} мин | **Қорытындылау (3 мин):**<br/>«Бүгін не үйрендік?»<br/>[2–3 қорытынды сұрақ.]<br/><br/>**Рефлексия (2 мин):**<br/>[«Светофор» / «Бармақ» / «3–2–1» әдісі]<br/><br/>**Үй тапсырмасы (1 мин):**<br/>[Нақты үй тапсырмасы: оқулық беті немесе тапсырма нөмірі] | [Сабақты қорытындылайды. Рефлексия жасайды. Үй тапсырмасын жазып алады.] |${senCell("[Жеке қолдау, ауызша нұсқаулар]")} [Рефлексия арқылы өзін-өзі бағалау] | Дәптер |

${bzhabSection}
> **Ескертпе:** Бұл жоспар ${subject} пәнінің ${grade}-сынып оқу бағдарламасына сәйкес жасалған. ${withBZhB ? "БЖБ тапсырмалары сабаққа бейімделіп жазылған." : ""}

Барлық жақша [ ] ішіндегі мәтінді осы нақты пән, сынып және тақырып үшін мазмұнмен толтыр. Тек қазақша жаз. Ресми мектеп тіліне сай болсын.

МАҢЫЗДЫ ЕРЕЖЕЛЕР:
- Барлық кестелер мен бөлімдерді ТОЛЫҚ аяқта — ешбір жол немесе өріс жартылай қалмасын.${learningObjectives ? `\n- "Оқу мақсаттары" жолына ДӘЛМЕ-ДӘЛ мұғалімнің жазғанын қолдан: "${learningObjectives.replace(/\n/g, " | ")}" — кодтарды, мәтінді өзгертпе.` : ""}
- БЖБ бағалау кестесі болса, барлық балдардың қосындысы ДӘЛМЕ-ДӘЛ 10 болсын.
- Нәтиже аяқталмай тоқтама — соңғы "Ескертпе" жолы жазылғанша барлығы толық болсын.
- "Оқу мақсаттары" жолына Қазақстан МЖМБС (мемлекеттік жалпыға міндетті білім беру стандарты) бойынша ${subject} пәні ${grade}-сынып оқу бағдарламасының осы тақырыпқа тікелей қатысты 1–2 оқу мақсатын нақты ресми код форматында жаз: [сынып].[бөлім].[тармақ].[нөмір] — [мақсаттың толық қазақша мәтіні]. Мысалы: Математика 5-сынып үшін 5.1.1.1 — Натурал сандар жиынын, олардың қасиеттерін түсіну; Информатика 7-сынып үшін 7.3.1.1 — Алгоритмдік конструкцияларды программалау тілінде жазу. Кодтар мен мақсат мәтіндері осы нақты пән, сынып және тақырыпқа сай болсын.
- "Бөлім" жолына бөлімнің нөмірін де қос: мысалы "1-бөлім: Сандар және есептеулер".`;
}

export async function POST(request: Request) {
  try {
    const {
      subject, grade, topic, lessonType, duration, assessmentType, specialNeeds, teacherName,
      learningObjectives = "", lessonGoal = "", suggestedText = "", theory = "", extraInstructions = "",
      fileData,
    }: {
      subject: string; grade: string; topic: string; lessonType?: string;
      duration?: string; assessmentType?: string; specialNeeds?: string; teacherName?: string;
      learningObjectives?: string; lessonGoal?: string; suggestedText?: string; theory?: string; extraInstructions?: string;
      fileData?: FilePayload;
    } = await request.json();

    if (!subject || !grade || !topic) {
      return NextResponse.json(
        { error: "Пән, сынып және тақырыпты толтырыңыз" },
        { status: 400 }
      );
    }

    // Жүктелген файлдан нұсқаулар мен API блоктарын дайында
    let fileInstruction = "";
    const extraBlocks: ApiBlock[] = [];

    if (fileData) {
      if (fileData.type === "text") {
        fileInstruction =
          `ЖҮКТЕЛГЕН МӘТІН ФАЙЛЫ ("${fileData.name}") — осы файл мазмұнын ҚМЖ-ды жасауда МІНДЕТТІ негізге ал:\n${fileData.text}`;
      } else if (fileData.type === "image") {
        fileInstruction =
          `ЖҮКТЕЛГЕН СУРЕТ ("${fileData.name}") — жоғарыдағы суретті (оқулық беті, тапсырма немесе мәтін) толық оқы және ҚМЖ-ны дәл сол мазмұнды негізге алып жаса.`;
        extraBlocks.push({
          type: "image",
          source: { type: "base64", media_type: fileData.mimeType, data: fileData.base64 },
        });
      } else if (fileData.type === "pdf") {
        fileInstruction =
          `ЖҮКТЕЛГЕН PDF ФАЙЛЫ ("${fileData.name}") — жоғарыдағы PDF-тің мазмұнын толық оқы және ҚМЖ-ны дәл сол материалға негіздеп жаса.`;
        extraBlocks.push({
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: fileData.base64 },
        });
      }
    }

    const prompt = buildPrompt(
      subject,
      grade,
      topic,
      lessonType || "Жаңа білімді меңгеру",
      duration || "40 минут",
      assessmentType || "Тек қалыптастырушы бағалау",
      specialNeeds || "Жоқ",
      teacherName || "",
      learningObjectives,
      lessonGoal,
      suggestedText,
      theory,
      extraInstructions,
      fileInstruction
    );

    // Контент: сурет/PDF болса алдымен медиа блок, сосын мәтін
    const msgContent: ApiBlock[] = [
      ...extraBlocks,
      { type: "text", text: prompt },
    ];

    type StreamEvent = { type: string; delta?: { type?: string; text?: string } };
    let stream: AsyncIterable<StreamEvent>;
    try {
      stream = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 8000,
        stream: true,
        // ApiBlock[] SDK ContentBlockParam[] жиынына сәйкес — cast қажет
        messages: [{ role: "user", content: msgContent as Parameters<typeof client.messages.create>[0]["messages"][0]["content"] }],
      }) as AsyncIterable<StreamEvent>;
    } catch (error) {
      console.error("Anthropic API error:", error);
      return NextResponse.json(
        { error: "Қате шықты. API кілтін тексеріп, қайталап көріңіз." },
        { status: 500 }
      );
    }

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta?.type === "text_delta" &&
              event.delta.text
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("Request parse error:", error);
    return NextResponse.json(
      { error: "Сұраныс қателі. Қайталап көріңіз." },
      { status: 400 }
    );
  }
}
