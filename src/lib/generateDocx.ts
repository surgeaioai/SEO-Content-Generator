import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  convertInchesToTwip,
  UnderlineType,
  LevelFormat,
} from "docx";
import { saveAs } from "file-saver";

// ─── COLORS ───────────────────────────────────────────────
const BLACK = "000000";
const DARK_GRAY = "333333";
const MEDIUM_GRAY = "555555";
const LIGHT_GRAY = "F5F5F5";
const TABLE_HEADER_BG = "222222";
const TABLE_HEADER_TEXT = "FFFFFF";
const TABLE_BORDER = "CCCCCC";
const DIVIDER_COLOR = "DDDDDD";
const ACCENT = "4A4A4A";

// ─── FONT ──────────────────────────────────────────────────
const FONT = "Calibri";
const BODY_SIZE = 22; // 11pt
const H1_SIZE = 32; // 16pt
const H2_SIZE = 26; // 13pt
const H3_SIZE = 24; // 12pt
const TITLE_SIZE = 40; // 20pt

// ─── HELPERS ──────────────────────────────────────────────

function makeTitle(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({
      text,
      bold: true,
      font: FONT,
      size: TITLE_SIZE,
      color: BLACK
    })],
    spacing: { before: 0, after: 240 },
    alignment: AlignmentType.LEFT,
  });
}

function makeKeywordLine(keyword: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({
      text: `Keyword: ${keyword}`,
      italics: true,
      font: FONT,
      size: BODY_SIZE,
      color: MEDIUM_GRAY
    })],
    spacing: { after: 200 },
  });
}

function makeDivider(): Paragraph {
  return new Paragraph({
    text: "",
    border: {
      bottom: {
        color: DIVIDER_COLOR,
        space: 1,
        style: BorderStyle.SINGLE,
        size: 4
      },
    },
    spacing: { before: 100, after: 300 },
  });
}

function makeH1(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({
      text,
      bold: true,
      font: FONT,
      size: H1_SIZE,
      color: BLACK
    })],
    spacing: { before: 400, after: 160 },
    border: {
      bottom: {
        color: DIVIDER_COLOR,
        space: 1,
        style: BorderStyle.SINGLE,
        size: 2
      },
    },
  });
}

function makeH2(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({
      text,
      bold: true,
      font: FONT,
      size: H2_SIZE,
      color: DARK_GRAY
    })],
    spacing: { before: 320, after: 120 },
  });
}

function makeH3(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({
      text,
      bold: true,
      font: FONT,
      size: H3_SIZE,
      color: DARK_GRAY
    })],
    spacing: { before: 240, after: 80 },
  });
}

function makeBody(runs: TextRun[]): Paragraph {
  return new Paragraph({
    children: runs,
    spacing: { after: 160 },
  });
}

function makeBullet(text: string, level = 0): Paragraph {
  return new Paragraph({
    children: parseInlineMarkdown(text),
    bullet: { level },
    spacing: { after: 80 },
    indent: { left: convertInchesToTwip(0.25 * (level + 1)) },
  });
}

function makeNumbered(text: string): Paragraph {
  return new Paragraph({
    children: parseInlineMarkdown(text),
    numbering: { reference: "default-numbering", level: 0 },
    spacing: { after: 80 },
  });
}

function makeBlockquote(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({
      text: text.replace(/^>\s*/, ""),
      italics: true,
      font: FONT,
      size: BODY_SIZE,
      color: MEDIUM_GRAY
    })],
    indent: { left: convertInchesToTwip(0.5) },
    border: {
      left: {
        color: ACCENT,
        space: 8,
        style: BorderStyle.SINGLE,
        size: 12
      },
    },
    spacing: { before: 120, after: 120 },
  });
}

function makeHR(): Paragraph {
  return new Paragraph({
    text: "",
    border: {
      bottom: {
        color: DIVIDER_COLOR,
        space: 1,
        style: BorderStyle.SINGLE,
        size: 4
      },
    },
    spacing: { before: 200, after: 200 },
  });
}

// ─── INLINE MARKDOWN PARSER ───────────────────────────────
function parseInlineMarkdown(text: string): TextRun[] {
  const runs: TextRun[] = [];
  // Remove markdown links but keep text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  const parts = text.split(/(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith("***") && part.endsWith("***")) {
      runs.push(new TextRun({
        text: part.slice(3, -3),
        bold: true,
        italics: true,
        font: FONT,
        size: BODY_SIZE,
        color: BLACK
      }));
    } else if (part.startsWith("**") && part.endsWith("**")) {
      runs.push(new TextRun({
        text: part.slice(2, -2),
        bold: true,
        font: FONT,
        size: BODY_SIZE,
        color: BLACK
      }));
    } else if (part.startsWith("*") && part.endsWith("*")) {
      runs.push(new TextRun({
        text: part.slice(1, -1),
        italics: true,
        font: FONT,
        size: BODY_SIZE,
        color: BLACK
      }));
    } else if (part.startsWith("`") && part.endsWith("`")) {
      runs.push(new TextRun({
        text: part.slice(1, -1),
        font: "Courier New",
        size: BODY_SIZE,
        color: ACCENT,
        shading: {
          type: ShadingType.CLEAR,
          fill: LIGHT_GRAY
        }
      }));
    } else {
      runs.push(new TextRun({
        text: part,
        font: FONT,
        size: BODY_SIZE,
        color: BLACK
      }));
    }
  }
  return runs;
}

// ─── TABLE PARSER ─────────────────────────────────────────
function parseMarkdownTable(lines: string[]): Table | null {
  const tableLines = lines.filter(l => l.trim().startsWith("|"));
  if (tableLines.length < 2) return null;

  const rows = tableLines
    .filter(l => !l.match(/^\|[\s\-|]+\|$/))
    .map(l =>
      l
        .split("|")
        .slice(1, -1)
        .map(cell => cell.trim())
    );

  if (rows.length === 0) return null;

  const tableRows = rows.map((row, rowIndex) => {
    const isHeader = rowIndex === 0;
    return new TableRow({
      children: row.map(cell =>
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({
                text: cell,
                bold: isHeader,
                color: isHeader ? TABLE_HEADER_TEXT : BLACK,
                font: FONT,
                size: BODY_SIZE,
              })],
              alignment: AlignmentType.LEFT,
            }),
          ],
          shading: isHeader
            ? { type: ShadingType.CLEAR, color: TABLE_HEADER_BG, fill: TABLE_HEADER_BG }
            : undefined,
          margins: {
            top: 80,
            bottom: 80,
            left: 120,
            right: 120,
          },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: TABLE_BORDER },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: TABLE_BORDER },
            left: { style: BorderStyle.SINGLE, size: 1, color: TABLE_BORDER },
            right: { style: BorderStyle.SINGLE, size: 1, color: TABLE_BORDER },
          },
        })
      ),
    });
  });

  return new Table({
    rows: tableRows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    margins: { top: 80, bottom: 80, left: 0, right: 0 },
  });
}

// ─── MAIN EXPORT ──────────────────────────────────────────
export async function downloadBlogAsDocx(
  content: string,
  title: string,
  keyword?: string
) {
  content = content
    .replace(/✅\s*/g, "")
    .replace(/❌\s*/g, "")
    .replace(/^([*\-]\s*)[\u{1F300}-\u{1FAFF}]\s*/gmu, "$1");

  const lines = content.split("\n");
  const docChildren: (Paragraph | Table)[] = [];

  // Header
  docChildren.push(makeTitle(title || "Blog Post"));
  if (keyword) docChildren.push(makeKeywordLine(keyword));
  docChildren.push(makeDivider());

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines (but add spacing via paragraph spacing)
    if (!trimmed) { i++; continue; }

    // H1
    if (trimmed.startsWith("# ")) {
      docChildren.push(makeH1(trimmed.slice(2)));
      i++; continue;
    }
    // H2
    if (trimmed.startsWith("## ")) {
      docChildren.push(makeH2(trimmed.slice(3)));
      i++; continue;
    }
    // H3
    if (trimmed.startsWith("### ")) {
      docChildren.push(makeH3(trimmed.slice(4)));
      i++; continue;
    }
    // H4
    if (trimmed.startsWith("#### ")) {
      docChildren.push(makeH3(trimmed.slice(5)));
      i++; continue;
    }
    // Horizontal rule
    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      docChildren.push(makeHR());
      i++; continue;
    }
    // Blockquote
    if (trimmed.startsWith("> ")) {
      docChildren.push(makeBlockquote(trimmed));
      i++; continue;
    }
    // Table — collect all table lines
    if (trimmed.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      const table = parseMarkdownTable(tableLines);
      if (table) {
        docChildren.push(new Paragraph({ text: "", spacing: { before: 160 } }));
        docChildren.push(table);
        docChildren.push(new Paragraph({ text: "", spacing: { after: 160 } }));
      }
      continue;
    }
    // Bullet point
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      docChildren.push(makeBullet(trimmed.slice(2)));
      i++; continue;
    }
    // Numbered list
    if (/^\d+\.\s/.test(trimmed)) {
      docChildren.push(makeNumbered(trimmed.replace(/^\d+\.\s/, "")));
      i++; continue;
    }
    // Regular paragraph
    const runs = parseInlineMarkdown(trimmed);
    if (runs.length > 0) docChildren.push(makeBody(runs));
    i++;
  }

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "default-numbering",
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: "%1.",
              alignment: AlignmentType.START,
              style: {
                paragraph: {
                  indent: {
                    left: convertInchesToTwip(0.25),
                    hanging: convertInchesToTwip(0.25)
                  },
                },
                run: { font: FONT, size: BODY_SIZE },
              },
            },
          ],
        },
      ],
    },
    styles: {
      default: {
        document: {
          run: { font: FONT, size: BODY_SIZE, color: BLACK },
          paragraph: { spacing: { line: 276 } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        children: docChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `${(title || "blog-post")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 60)}.docx`;
  saveAs(blob, fileName);
}
