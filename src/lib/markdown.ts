import sanitizeHtml from "sanitize-html";
import { marked } from "marked";

type TableTokenLike = {
  header?: string;
  rows?: string;
};

type TableRowTokenLike = {
  text?: string;
};

type TableCellTokenLike = {
  text?: string;
  header?: boolean;
  align?: "left" | "right" | "center" | null;
};

type HeadingTokenLike = {
  tokens?: Array<{ text?: string }>;
  depth?: number;
};

const renderer = new marked.Renderer();

renderer.table = ((token: unknown) => {
  const value = token as TableTokenLike;
  const header = typeof value.header === "string" ? value.header : "";
  const rows = typeof value.rows === "string" ? value.rows : "";
  return `
    <div class="my-8 overflow-x-auto rounded-xl border border-gray-200 shadow-lg dark:border-gray-700">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/60 dark:to-purple-950/60">
          ${header}
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}) as typeof renderer.table;

renderer.tablerow = ((token: unknown) => {
  const value = token as TableRowTokenLike | string;
  const text = typeof value === "string" ? value : value.text ?? "";
  return `<tr class="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60">${text}</tr>`;
}) as typeof renderer.tablerow;

renderer.tablecell = ((token: unknown) => {
  const value = token as TableCellTokenLike | string;
  const text = typeof value === "string" ? value : value.text ?? "";
  const header = typeof value === "string" ? false : Boolean(value.header);
  const align = typeof value === "string" ? null : (value.align ?? null);
  const tag = header ? "th" : "td";
  const alignStyle = align ? ` style="text-align:${align}"` : "";
  const classes = header
    ? "px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-gray-100"
    : "px-6 py-4 text-sm text-gray-700 dark:text-gray-300";
  return `<${tag} class="${classes}"${alignStyle}>${text}</${tag}>`;
}) as typeof renderer.tablecell;

renderer.heading = ((token: unknown) => {
  const value = token as HeadingTokenLike;
  const text = Array.isArray(value.tokens)
    ? value.tokens.map((piece) => piece.text ?? "").join("")
    : "";
  const depth = typeof value.depth === "number" ? value.depth : 1;
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const sizeClasses: Record<number, string> = {
    1: "mt-12 mb-6 text-4xl font-bold text-gray-900 dark:text-white",
    2: "mt-10 mb-5 border-b border-gray-200 pb-3 text-3xl font-bold text-gray-900 dark:border-gray-700 dark:text-white",
    3: "mt-8 mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-100",
    4: "mt-6 mb-3 text-xl font-semibold text-gray-700 dark:text-gray-200",
    5: "mt-4 mb-2 text-lg font-medium text-gray-700 dark:text-gray-300",
    6: "mt-3 mb-2 text-base font-medium text-gray-600 dark:text-gray-400",
  };
  const tag = Math.max(1, Math.min(6, depth));
  return `<h${tag} id="${slug}" class="${sizeClasses[tag]}">${text}</h${tag}>`;
}) as typeof renderer.heading;

marked.use({
  renderer,
  gfm: true,
  breaks: true,
});

export function normalizeMarkdownTables(markdown: string): string {
  return markdown
    .replace(/\|([^\n|]+\|[^\n]*)\s+\|---/g, "|$1\n|---")
    .replace(/\|\s*\n\s*\|/g, "|\n|");
}

export async function markdownToHtml(markdown: string): Promise<string> {
  const processed = normalizeMarkdownTables(markdown);

  const raw = await marked.parse(processed);

  if (typeof raw !== "string") {
    throw new Error("Markdown parsing failed");
  }

  return sanitizeHtml(raw, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "img",
      "del",
      "pre",
      "code",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "div",
      "span",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "loading"],
      th: ["colspan", "rowspan", "style", "class"],
      td: ["colspan", "rowspan", "style", "class"],
      "*": ["class", "id", "style"],
    },
    allowVulnerableTags: false,
  });
}
