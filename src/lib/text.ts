export function sanitizePlainText(input: string) {
  return input.replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
}
