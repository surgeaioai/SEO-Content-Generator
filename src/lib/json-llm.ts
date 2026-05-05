export function stripCodeFences(text: string) {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

export function parseJsonFromLlm<T>(text: string): T {
  const cleaned = stripCodeFences(text);
  return JSON.parse(cleaned) as T;
}
