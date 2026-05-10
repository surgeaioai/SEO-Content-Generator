"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  FileText,
  GitCompare,
  List,
  Loader2,
  Newspaper,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loadingStages = [
  "Fetching SERP results…",
  "Scraping headings from URLs…",
  "Processing data…",
  "Almost there…",
];

export function KeywordInputForm() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [contentType, setContentType] = useState("blog");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [error, setError] = useState("");

  const readApiPayload = async (response: Response): Promise<unknown> => {
    const raw = await response.text();
    if (!raw) return null;
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      return raw;
    }
  };

  const isDisabled = useMemo(() => {
    return !keyword.trim() || !location.trim() || isLoading;
  }, [isLoading, keyword, location]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    setLoadingStage(0);

    const stageInterval = window.setInterval(() => {
      setLoadingStage((prev) => Math.min(prev + 1, loadingStages.length - 1));
    }, 8000);

    try {
      const response = await fetch("/api/scrape-serp", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, location, contentType }),
      });

      const payload = await readApiPayload(response);

      if (!response.ok) {
        const message = (() => {
          if (
            payload &&
            typeof payload === "object" &&
            "error" in payload &&
            typeof (payload as { error: unknown }).error === "string"
          ) {
            return (payload as { error: string }).error;
          }
          if (response.status === 404) {
            return "API route not found: /api/scrape-serp";
          }
          if (typeof payload === "string" && payload.toLowerCase().includes("doctype")) {
            return "Server returned HTML instead of JSON. Please restart dev server and retry.";
          }
          return `Request failed (${response.status})`;
        })();
        throw new Error(message);
      }

      const projectId =
        payload &&
        typeof payload === "object" &&
        "projectId" in payload &&
        typeof (payload as { projectId: unknown }).projectId === "string"
          ? (payload as { projectId: string }).projectId
          : null;

      if (!projectId) {
        throw new Error("Missing project id");
      }

      router.push(`/analyze/${projectId}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Request failed";
      setError(message);
      setIsLoading(false);
    } finally {
      window.clearInterval(stageInterval);
    }
  };

  return (
    <form className="flex h-full w-full flex-col gap-5" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {contentTypes.map((type) => (
          <button
            key={type.id}
            className={`cursor-pointer rounded-xl border p-4 text-left transition-all duration-200 hover:shadow-md ${
              contentType === type.id
                ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200"
                : "border-gray-200 bg-white hover:border-indigo-300"
            }`}
            type="button"
            onClick={() => setContentType(type.id)}
          >
            <type.icon className="mb-2 h-4 w-4 text-indigo-500" />
            <div className="text-sm font-semibold text-slate-900">{type.name}</div>
            <div className="mt-1 text-xs text-slate-500">{type.description}</div>
            <div className="mt-2 text-xs text-indigo-600">{type.avgWords} words</div>
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-slate-700" htmlFor="keyword">Keyword</Label>
          <Input
            id="keyword"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-indigo-300"
            placeholder="e.g., best running shoes for flat feet"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-700" htmlFor="location">Location</Label>
          <Input
            id="location"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-indigo-300"
            placeholder="e.g., United States, Mumbai, London"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            required
            disabled={isLoading}
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Button className="h-14 w-full gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 py-4 text-white transition-all duration-200 hover:scale-[1.02]" disabled={isDisabled} size="lg" type="submit">
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {loadingStages[loadingStage]}
          </>
        ) : (
          <>
            Analyze SERP
            <ArrowRight className="size-4" />
          </>
        )}
      </Button>
    </form>
  );
}

const contentTypes = [
  {
    id: "blog",
    name: "Blog Post",
    icon: FileText,
    description: "Long-form articles",
    avgWords: "2000-3000",
  },
  {
    id: "listicle",
    name: "Listicle",
    icon: List,
    description: "Top 10/20 style",
    avgWords: "1500-2500",
  },
  {
    id: "comparison",
    name: "Comparison",
    icon: GitCompare,
    description: "X vs Y guides",
    avgWords: "2500-4000",
  },
  {
    id: "howto",
    name: "How-to Guide",
    icon: BookOpen,
    description: "Step-by-step",
    avgWords: "2000-3500",
  },
  {
    id: "review",
    name: "Product Review",
    icon: Star,
    description: "In-depth reviews",
    avgWords: "2500-4000",
  },
  {
    id: "news",
    name: "News Article",
    icon: Newspaper,
    description: "Time-sensitive",
    avgWords: "800-1500",
  },
];
