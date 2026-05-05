export interface QualityReport {
  score: number;
  checks: {
    name: string;
    passed: boolean;
    message: string;
  }[];
  warnings: string[];
}

export function validateBlogQuality(
  markdown: string,
  keyword: string,
  targetWords: number,
): QualityReport {
  const checks: QualityReport["checks"] = [];
  const warnings: string[] = [];

  const words = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
  const wordCountOK = targetWords > 0
    ? Math.abs(words - targetWords) / targetWords < 0.15
    : true;
  checks.push({
    name: "Word Count",
    passed: wordCountOK,
    message: `${words} words (target: ${targetWords})`,
  });

  const h1Count = (markdown.match(/^# .+$/gm) || []).length;
  checks.push({
    name: "Single H1",
    passed: h1Count === 1,
    message: `Found ${h1Count} H1 tags`,
  });

  const h1Match = markdown.match(/^# (.+)$/m);
  const keywordInH1 = h1Match
    ? h1Match[1].toLowerCase().includes(keyword.toLowerCase())
    : false;
  checks.push({
    name: "Keyword in H1",
    passed: keywordInH1,
    message: keywordInH1 ? "Keyword present in H1" : "Add keyword to H1",
  });

  const hasTable = /\|.*\|.*\|/.test(markdown);
  checks.push({
    name: "Has Tables",
    passed: hasTable,
    message: hasTable ? "Tables included" : "Consider adding comparison tables",
  });

  const hasFAQ = /## .*FAQ|## Frequently/i.test(markdown);
  checks.push({
    name: "FAQ Section",
    passed: hasFAQ,
    message: hasFAQ ? "FAQ section present" : "Missing FAQ section",
  });

  const hasQuickAnswer = /Quick Answer/i.test(markdown);
  checks.push({
    name: "Quick Answer Box",
    passed: hasQuickAnswer,
    message: hasQuickAnswer ? "Quick Answer included" : "Add Quick Answer box",
  });

  const hasKeyTakeaways = /Key Takeaway/i.test(markdown);
  checks.push({
    name: "Key Takeaways",
    passed: hasKeyTakeaways,
    message: hasKeyTakeaways ? "Key Takeaways included" : "Missing Key Takeaways",
  });

  if (!hasTable) warnings.push("Add at least one relevant comparison/process table.");
  if (!hasQuickAnswer) warnings.push("Add a Quick Answer callout near the top.");

  const passedCount = checks.filter((c) => c.passed).length;
  const score = Math.round((passedCount / checks.length) * 100);

  return { score, checks, warnings };
}
