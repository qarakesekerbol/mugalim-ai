import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  PageOrientation,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

type DocxChild = Paragraph | Table;

const BLACK = "000000";
const GRAY_HEADER_BG = "F3F4F6";  // кесте бас жолы — ашық сұр
const GRAY_ROW_ALT = "F9FAFB";   // кезектесетін жолдар
const GRAY_BORDER = "000000";    // кесте шекаралары — қара
const FONT = "Times New Roman";
const SIZE_BODY = 20; // 10pt — кесте ішінде ыңғайлы
const SIZE_H1 = 32;  // 16pt
const SIZE_H2 = 26;  // 13pt
const SIZE_H3 = 24;  // 12pt

// A4 landscape, 10mm margin — нақты мазмұн ені (twips)
const CONTENT_WIDTH = 15700;

// Баған санына сай нақты DXA ендері (жиынтығы = CONTENT_WIDTH)
function getColWidths(colCount: number): number[] {
  switch (colCount) {
    case 2: return [3700, 12000];                          // ақпарат кестесі
    case 3: return [4200, 9200, 2300];                     // БЖБ критерий кестесі
    case 5: return [2200, 5000, 4200, 2500, 1800];         // сабақ барысы (ЕБҚсыз)
    case 6: return [1800, 4200, 3500, 2200, 2200, 1800];   // сабақ барысы (ЕБҚмен)
    default: {
      const w = Math.floor(CONTENT_WIDTH / colCount);
      return Array(colCount).fill(w);
    }
  }
}

function isSeparatorRow(line: string): boolean {
  const cells = line.split("|").slice(1, -1);
  return cells.length > 0 && cells.every((c) => /^[\s:\-]+$/.test(c));
}

function stripHtml(text: string): string {
  return text.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "");
}

function parseInline(text: string, textColor = "000000"): TextRun[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts
    .filter((p) => p.length > 0)
    .flatMap((part) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return [
          new TextRun({
            text: part.slice(2, -2),
            bold: true,
            size: SIZE_BODY,
            color: textColor,
            font: FONT,
          }),
        ];
      }
      // Handle newline from <br/>
      return part.split("\n").flatMap((segment, i, arr) => {
        const run: TextRun[] = [];
        if (segment) {
          run.push(
            new TextRun({ text: segment, size: SIZE_BODY, color: textColor, font: FONT })
          );
        }
        if (i < arr.length - 1) {
          run.push(new TextRun({ break: 1 }));
        }
        return run;
      });
    });
}

function parseCellParagraphs(rawText: string, isHeader: boolean): Paragraph[] {
  const textColor = BLACK;
  const cleaned = stripHtml(rawText);
  const lines = cleaned.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    return [new Paragraph({ children: [new TextRun({ text: "" })] })];
  }
  return lines.map(
    (line) =>
      new Paragraph({
        children: parseInline(line.trim(), textColor),
        spacing: { after: 40 },
      })
  );
}

function buildTable(tableLines: string[]): Table | null {
  const dataLines = tableLines.filter((l) => !isSeparatorRow(l));
  if (dataLines.length === 0) return null;

  const parseRow = (line: string): string[] =>
    line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());

  const rows = dataLines.map(parseRow);
  const colCount = Math.max(...rows.map((r) => r.length));
  const colWidths = getColWidths(colCount); // нақты DXA (twips) ендер

  const borderDef = { style: BorderStyle.SINGLE, size: 6, color: GRAY_BORDER };

  const tableRows = rows.map((row, rowIdx) => {
    const isHeader = rowIdx === 0;
    const cells = Array.from({ length: colCount }, (_, ci) => {
      const cellText = row[ci] ?? "";
      return new TableCell({
        children: parseCellParagraphs(cellText, isHeader),
        shading: isHeader
          ? { type: ShadingType.SOLID, fill: GRAY_HEADER_BG, color: GRAY_HEADER_BG }
          : rowIdx % 2 === 0
          ? undefined
          : { type: ShadingType.SOLID, fill: GRAY_ROW_ALT, color: GRAY_ROW_ALT },
        width: { size: colWidths[ci], type: WidthType.DXA },
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        borders: {
          top: borderDef,
          bottom: borderDef,
          left: borderDef,
          right: borderDef,
        },
      });
    });
    return new TableRow({ children: cells, tableHeader: isHeader });
  });

  return new Table({
    rows: tableRows,
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    borders: {
      top: borderDef,
      bottom: borderDef,
      left: borderDef,
      right: borderDef,
      insideHorizontal: borderDef,
      insideVertical: borderDef,
    },
  });
}

function parseMarkdown(markdown: string): DocxChild[] {
  const lines = markdown.split("\n");
  const elements: DocxChild[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") { i++; continue; }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      elements.push(new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GRAY_BORDER } },
        spacing: { before: 200, after: 200 },
      }));
      i++;
      continue;
    }

    // H1
    if (line.startsWith("# ")) {
      elements.push(new Paragraph({
        children: [new TextRun({ text: line.slice(2), bold: true, size: SIZE_H1, color: BLACK, font: FONT })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 280 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GRAY_BORDER } },
      }));
      i++;
      continue;
    }

    // H2
    if (line.startsWith("## ")) {
      elements.push(new Paragraph({
        children: [new TextRun({ text: line.slice(3), bold: true, size: SIZE_H2, color: BLACK, font: FONT })],
        spacing: { before: 280, after: 120 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GRAY_BORDER } },
      }));
      i++;
      continue;
    }

    // H3
    if (line.startsWith("### ")) {
      elements.push(new Paragraph({
        children: [new TextRun({ text: line.slice(4), bold: true, size: SIZE_H3, font: FONT })],
        spacing: { before: 200, after: 100 },
      }));
      i++;
      continue;
    }

    // Table — collect consecutive | lines
    if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      const table = buildTable(tableLines);
      if (table) {
        elements.push(table);
        elements.push(new Paragraph({ spacing: { after: 160 } }));
      }
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      elements.push(new Paragraph({
        children: parseInline(line.slice(2)),
        indent: { left: 720 },
        spacing: { before: 120, after: 120 },
        border: { left: { style: BorderStyle.SINGLE, size: 12, color: GRAY_BORDER } },
      }));
      i++;
      continue;
    }

    // Unordered list
    if (line.startsWith("- ") || line.startsWith("• ")) {
      elements.push(new Paragraph({
        children: parseInline(line.slice(2)),
        bullet: { level: 0 },
        spacing: { after: 60 },
      }));
      i++;
      continue;
    }

    // Ordered list
    const orderedMatch = line.match(/^(\d+)\.\s(.+)/);
    if (orderedMatch) {
      elements.push(new Paragraph({
        children: parseInline(orderedMatch[2]),
        numbering: { reference: "default-numbering", level: 0 },
        spacing: { after: 60 },
      }));
      i++;
      continue;
    }

    // Regular paragraph
    if (line.trim()) {
      elements.push(new Paragraph({
        children: parseInline(line),
        spacing: { after: 120 },
      }));
    }
    i++;
  }

  return elements;
}

export async function generateDocx(
  markdown: string,
  subject: string,
  grade: string,
  topic: string
): Promise<Blob> {
  const children = parseMarkdown(markdown);

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "default-numbering",
          levels: [
            {
              level: 0,
              format: "decimal",
              text: "%1.",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: { indent: { left: 440, hanging: 260 } },
                run: { font: FONT, size: SIZE_BODY },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.LANDSCAPE,
              width: 16839,  // A4 landscape ені (twips)
              height: 11907, // A4 landscape биіктігі (twips)
            },
            margin: { top: 567, right: 567, bottom: 567, left: 567 }, // 10mm
          },
        },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}
