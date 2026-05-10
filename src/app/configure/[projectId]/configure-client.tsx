"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Project } from "@/types";

type ConfigureClientProps = {
  projectId: string;
};

const generationMessages = [
  "Analyzing topic...",
  "Generating content...",
  "Optimizing heading structure...",
  "Finalizing output...",
  "Almost done...",
];

const brandVoices = [
  { id: "professional", name: "Professional", desc: "Authoritative and industry expert" },
  { id: "friendly", name: "Friendly", desc: "Warm and conversational" },
  { id: "playful", name: "Playful", desc: "Fun, witty, and casual" },
  { id: "technical", name: "Technical", desc: "Detailed and jargon-rich" },
  { id: "storytelling", name: "Storytelling", desc: "Narrative and engaging" },
  { id: "persuasive", name: "Persuasive", desc: "Action-oriented and conversion-focused" },
] as const;

function parseLines(input: string) {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseCommaList(input: string) {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function voiceIcon(id: (typeof brandVoices)[number]["id"]) {
  switch (id) {
    case "professional":
      return "Target";
    case "friendly":
      return "Smile";
    case "playful":
      return "Fun";
    case "technical":
      return "Tech";
    case "storytelling":
      return "Story";
    case "persuasive":
      return "Drive";
    default:
      return "Tone";
  }
}

export function ConfigureClient({ projectId }: ConfigureClientProps) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loadError, setLoadError] = useState("");
  const [wordCount, setWordCount] = useState(2000);
  const [brandGuidelines, setBrandGuidelines] = useState("");
  const [brandVoice, setBrandVoice] = useState<(typeof brandVoices)[number]["id"]>("professional");
  const [customKeywordsRaw, setCustomKeywordsRaw] = useState("");
  const [internalLinksRaw, setInternalLinksRaw] = useState("");
  const [targetKeywordsRaw, setTargetKeywordsRaw] = useState("");
  const [ctasRaw, setCtasRaw] = useState("");
  const [quickMode, setQuickMode] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/scrape-serp?projectId=${projectId}`, {
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Project not found");
        }
        const data = (await res.json()) as Project;
        if (cancelled) return;
        setProject(data);
        if (!data.selectedAngle) {
          setLoadError("Select a content angle before configuring generation.");
        }
      } catch {
        if (!cancelled) {
          setLoadError("We could not load this project. Start from the home page.");
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  useEffect(() => {
    if (!isGenerating || !quickMode) return;
    const id = window.setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % generationMessages.length);
      setProgress((prev) => Math.min(95, prev + 2));
    }, 1800);
    return () => window.clearInterval(id);
  }, [isGenerating, quickMode]);

  const readingMinutes = useMemo(() => Math.max(1, Math.round(wordCount / 200)), [wordCount]);

  const recommendedWordCount = useMemo(() => {
    const intent = project?.intentAnalysis;
    if (!intent) return 3200;
    return Math.min(
      5000,
      Math.max(2000, Math.round((intent.mustCoverTopics.length * 380) / 100) * 100),
    );
  }, [project]);

  const selectedVoiceName = useMemo(
    () => brandVoices.find((voice) => voice.id === brandVoice)?.name ?? "Professional",
    [brandVoice],
  );

  const handleGenerate = async () => {
    if (!project?.selectedAngle) return;
    setSubmitError("");
    setIsGenerating(true);
    setMessageIndex(0);
    setProgress(quickMode ? 3 : 10);

    const internalLinks = parseLines(internalLinksRaw);
    for (const link of internalLinks) {
      try {
        new URL(link);
      } catch {
        setSubmitError("Internal links must be valid URLs (one per line).");
        setIsGenerating(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/generate-blog", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          wordCount,
          quickMode,
          brandGuidelines: brandGuidelines.trim() || undefined,
          brandVoice,
          contentType: project?.contentType ?? "blog",
          customKeywords: parseCommaList(customKeywordsRaw).length ? parseCommaList(customKeywordsRaw) : undefined,
          internalLinks: internalLinks.length ? internalLinks : undefined,
          targetKeywords: parseCommaList(targetKeywordsRaw).length ? parseCommaList(targetKeywordsRaw) : undefined,
          ctas: parseLines(ctasRaw).length ? parseLines(ctasRaw) : undefined,
        }),
      });

      const data: unknown = await res.json();
      if (!res.ok) {
        const message =
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Generation failed";
        throw new Error(message);
      }

      setProgress(100);
      router.push(`/result/${projectId}`);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Generation failed. Try again.");
      setIsGenerating(false);
      setProgress(0);
    }
  };

  if (loadError && !project) {
    return <div className="mx-auto max-w-3xl p-8 text-sm text-destructive">{loadError}</div>;
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <div className="border-b border-[#E2E8F0] bg-gradient-to-br from-indigo-50 to-violet-50 px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 flex items-center gap-2 text-sm text-[#94A3B8]">
            <span>Analysis</span>
            <span>&gt;</span>
            <span>Select Angle</span>
            <span>&gt;</span>
            <span className="font-medium text-indigo-600">Configure</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-[#0F172A]">Configure your blog post</h1>
          <p className="text-base text-[#475569]">Tune length, voice, and on-page elements before generation starts.</p>
        </div>
      </div>

      <motion.div animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-3xl space-y-6 px-6 py-10 pb-32" initial={{ opacity: 0, y: 8 }} transition={{ duration: 0.25 }}>
        {loadError ? <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-900">{loadError}</div> : null}

        {project?.selectedAngle ? (
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Selected Angle</span>
              <span className="text-sm text-[#94A3B8] underline transition-colors hover:text-indigo-600">Change angle</span>
            </div>
            <div className="mb-2 flex items-start justify-between gap-3">
              <h2 className="text-xl font-bold text-[#0F172A]">{project.selectedAngle.title}</h2>
              <Sparkles className="size-5 shrink-0 text-indigo-500" />
            </div>
            <p className="mb-4 text-sm leading-relaxed text-[#475569]">{project.selectedAngle.angle}</p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">{project.selectedAngle.targetFormat}</span>
              <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">{project.selectedAngle.estimatedDifficulty}</span>
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-[#0F172A]">Word count</h3>
            <p className="text-sm text-[#475569]">Choose content length</p>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[2000, 3500, 5000].map((preset) => {
              const selected = wordCount === preset;
              const helper = preset === 2000 ? "Fast publish-ready draft" : preset === 3500 ? "In-depth coverage" : "Comprehensive guide";
              return (
                <div key={preset} className={`cursor-pointer rounded-xl p-4 transition-all ${selected ? "border-2 border-indigo-500 bg-indigo-50" : "border border-[#E2E8F0] bg-white hover:border-indigo-300 hover:bg-indigo-50/30"}`} onClick={() => setWordCount(preset)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setWordCount(preset); } }} role="button" tabIndex={0}>
                  <div className="text-xl font-bold text-[#0F172A]">{preset} words</div>
                  <div className="mt-1 text-xs text-[#475569]">{helper}</div>
                  {selected ? <div className="ml-auto mt-2 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500"><span className="text-[10px] text-white">v</span></div> : null}
                </div>
              );
            })}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-[#475569]">Or choose custom length</label>
            <input type="range" min="2000" max="5000" step="100" value={wordCount} onChange={(event) => setWordCount(Number(event.target.value))} className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#E2E8F0] accent-indigo-600 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:shadow-md" />
            <div className="flex justify-between text-xs text-[#94A3B8]"><span>2000</span><span className="font-semibold text-indigo-600">Current: {wordCount} words</span><span>5000</span></div>
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
            <span className="text-lg text-indigo-500">i</span>
            <div>
              <p className="text-sm font-semibold text-indigo-700">Suggested: {recommendedWordCount} words</p>
              <p className="mt-0.5 text-xs text-indigo-500">Based on SERP depth - Est. reading time: {readingMinutes} min</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-[#0F172A]">Quick mode</h3>
              <p className="mt-1 text-sm text-[#475569]">Faster single-pass generation (~1-2 min). Turn off for detailed mode.</p>
            </div>
            <Switch id="quick-mode" checked={quickMode} disabled={isGenerating} onCheckedChange={setQuickMode} className="data-[state=checked]:bg-indigo-600" />
          </div>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <div className="mb-4"><h3 className="text-lg font-semibold text-[#0F172A]">SEO inputs</h3><p className="mt-1 text-sm text-[#475569]">These are added as secondary keywords in generation.</p></div>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#475569]" htmlFor="custom-keywords">Custom keywords <span className="ml-1 font-normal text-[#94A3B8]">(optional, comma-separated)</span></label>
              <Input id="custom-keywords" className="w-full rounded-xl border border-[#E2E8F0] px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500" placeholder="coffee machine, espresso maker, brewing tips" value={customKeywordsRaw} onChange={(event) => setCustomKeywordsRaw(event.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#475569]" htmlFor="keywords">Target keywords <span className="ml-1 font-normal text-[#94A3B8]">(optional, comma-separated)</span></label>
              <Input id="keywords" className="w-full rounded-xl border border-[#E2E8F0] px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500" placeholder="running shoes, flat feet, cushioning" value={targetKeywordsRaw} onChange={(event) => setTargetKeywordsRaw(event.target.value)} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <div className="mb-5"><h3 className="text-lg font-semibold text-[#0F172A]">Brand voice</h3><p className="mt-1 text-sm text-[#475569]">Pick the tone that best matches your audience.</p></div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {brandVoices.map((voice) => (
              <button key={voice.id} className={`rounded-xl p-4 text-left transition-all ${brandVoice === voice.id ? "border-2 border-indigo-500 bg-indigo-50" : "border border-[#E2E8F0] bg-white hover:border-indigo-300 hover:bg-indigo-50/30"}`} type="button" onClick={() => setBrandVoice(voice.id)}>
                <div className="mb-1 flex items-center gap-2"><span className="text-xs text-indigo-600">{voiceIcon(voice.id)}</span><span className="text-sm font-semibold text-[#0F172A]">{voice.name}</span></div>
                <p className="text-xs text-[#475569]">{voice.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between"><div><h3 className="text-lg font-semibold text-[#0F172A]">Brand guidelines</h3><p className="mt-1 text-sm text-[#475569]">Give the AI context about your brand voice.</p></div><span className="text-xs text-[#94A3B8]">{brandGuidelines.length} chars</span></div>
          <Textarea className="min-h-[120px] w-full resize-none rounded-xl border border-[#E2E8F0] px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500" id="brand" placeholder="e.g., Brand voice: friendly and authoritative. Avoid jargon. Mention our 30-day guarantee..." value={brandGuidelines} onChange={(event) => setBrandGuidelines(event.target.value)} />
          <p className="mt-2 text-xs text-[#94A3B8]">Optional - leave blank to use default brand voice above.</p>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <div className="mb-4"><h3 className="text-lg font-semibold text-[#0F172A]">Internal links <span className="ml-2 text-xs font-normal text-[#94A3B8]">(optional)</span></h3><p className="mt-1 text-sm text-[#475569]">One URL per line - AI will naturally link to these.</p></div>
          <Textarea className="min-h-[120px] w-full resize-none rounded-xl border border-[#E2E8F0] px-4 py-3 font-mono text-sm text-[#0F172A] placeholder:text-[#94A3B8] transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500" id="links" placeholder={"https://example.com/pricing\nhttps://example.com/contact"} rows={4} value={internalLinksRaw} onChange={(event) => setInternalLinksRaw(event.target.value)} />
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <div className="mb-4"><h3 className="text-lg font-semibold text-[#0F172A]">CTAs <span className="ml-2 text-xs font-normal text-[#94A3B8]">(optional, one per line)</span></h3><p className="mt-1 text-sm text-[#475569]">Calls-to-action to naturally include in the post.</p></div>
          <Textarea className="min-h-[120px] w-full resize-none rounded-xl border border-[#E2E8F0] px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500" id="ctas" placeholder="Book a fitting\nJoin our newsletter" rows={3} value={ctasRaw} onChange={(event) => setCtasRaw(event.target.value)} />
        </div>

        {submitError ? <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{submitError}</div> : null}

        {isGenerating ? (
          <div className="space-y-2 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-sm"><span>{quickMode ? generationMessages[messageIndex] : "Detailed generation in progress..."}</span><span>{progress}%</span></div>
            <Progress value={progress} />
          </div>
        ) : null}
      </motion.div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E2E8F0] bg-white/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <div className="hidden text-sm text-[#475569] md:block">
            <span className="font-semibold text-[#0F172A]">{wordCount} words</span>{" · "}<span>{selectedVoiceName} voice</span>{" · "}<span>Est. {readingMinutes} min read</span>
          </div>
          <Button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-10 py-4 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto" disabled={isGenerating || !project?.selectedAngle} onClick={handleGenerate} type="button">
            {isGenerating ? <><Loader2 className="size-4 animate-spin" />{quickMode ? "Generating (quick mode)..." : generationMessages[messageIndex]}</> : <><span>Generate blog post</span><span>Lightning</span></>}
          </Button>
        </div>
      </div>

      {isGenerating ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="max-w-md space-y-3 rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-lg">
            <Loader2 className="mx-auto size-8 animate-spin text-primary" />
            <p className="text-sm font-medium">{quickMode ? generationMessages[messageIndex] : generationMessages[(messageIndex + 2) % generationMessages.length]}</p>
            <p className="text-xs text-muted-foreground">{quickMode ? "Quick mode is enabled. Most blogs finish in about 1-2 minutes." : "Detailed mode can take several minutes. Please keep this tab open."}</p>
            <div className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"><CheckCircle2 className="size-3.5" />Generation in progress</div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
