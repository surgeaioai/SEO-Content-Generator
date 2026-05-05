"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, RefreshCw } from "lucide-react";

import { AnalysisDashboard } from "@/components/AnalysisDashboard";
import { ContentAngleCard } from "@/components/ContentAngleCard";
import { IntentAnalysisSections } from "@/components/IntentAnalysisSections";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { ContentAngle, IntentAnalysis, Project, SerpResult } from "@/types";

type AnalyzeClientProps = {
  projectId: string;
};

async function readJsonError(response: Response) {
  try {
    const data: unknown = await response.json();
    if (data && typeof data === "object" && "error" in data) {
      const err = (data as { error: unknown }).error;
      if (typeof err === "string") return err;
    }
  } catch {
    // ignore
  }
  return "Request failed";
}

export function AnalyzeClient({ projectId }: AnalyzeClientProps) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [serpResults, setSerpResults] = useState<SerpResult[]>([]);
  const [intent, setIntent] = useState<IntentAnalysis | undefined>();
  const [angles, setAngles] = useState<ContentAngle[]>([]);
  const [busy, setBusy] = useState(true);
  const [progress, setProgress] = useState(8);
  const [statusLabel, setStatusLabel] = useState("Loading project…");
  const [error, setError] = useState("");
  const [busyAngleKey, setBusyAngleKey] = useState<string | null>(null);
  const [reanalyzeBusy, setReanalyzeBusy] = useState(false);

  const refreshProject = useCallback(async () => {
    const res = await fetch(`/api/scrape-serp?projectId=${projectId}`);
    if (!res.ok) {
      throw new Error(await readJsonError(res));
    }
    const data = (await res.json()) as Project;
    setProject(data);
    setSerpResults(data.serpResults);
    setIntent(data.intentAnalysis);
    setAngles(data.recommendedAngles ?? []);
    return data;
  }, [projectId]);

  const runPipeline = useCallback(async () => {
    setBusy(true);
    setError("");
    setProgress(10);
    setStatusLabel("Loading project…");

    await refreshProject();

    setStatusLabel("Classifying pages…");
    setProgress(35);
    const classifyRes = await fetch("/api/classify-pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    });
    if (!classifyRes.ok) {
      throw new Error(await readJsonError(classifyRes));
    }
    await refreshProject();

    setStatusLabel("Analyzing search intent…");
    setProgress(60);
    const intentRes = await fetch("/api/analyze-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    });
    if (!intentRes.ok) {
      throw new Error(await readJsonError(intentRes));
    }
    await refreshProject();

    setStatusLabel("Generating content angles…");
    setProgress(85);
    const recRes = await fetch("/api/recommend-angles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    });
    if (!recRes.ok) {
      throw new Error(await readJsonError(recRes));
    }
    await refreshProject();

    setProgress(100);
    setStatusLabel("Ready");
    setBusy(false);
  }, [projectId, refreshProject]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      runPipeline().catch((err: unknown) => {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while analyzing this project.",
        );
        setBusy(false);
      });
    }, 0);

    return () => window.clearTimeout(id);
  }, [runPipeline]);

  const handleReanalyze = async () => {
    if (!project) return;
    setReanalyzeBusy(true);
    setError("");
    try {
      const res = await fetch("/api/scrape-serp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: project.keyword,
          location: project.location,
          projectId,
        }),
      });
      if (!res.ok) {
        throw new Error(await readJsonError(res));
      }
      await runPipeline();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Re-analysis failed. Please retry.",
      );
    } finally {
      setReanalyzeBusy(false);
    }
  };

  const angleKey = (angle: ContentAngle) =>
    `${angle.title}|${angle.angle}|${angle.targetFormat}`;

  const handleSelectAngle = async (angle: ContentAngle) => {
    setBusyAngleKey(angleKey(angle));
    setError("");
    try {
      const res = await fetch("/api/select-angle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, angle }),
      });
      if (!res.ok) {
        throw new Error(await readJsonError(res));
      }
      router.push(`/configure/${projectId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not save your angle.");
    } finally {
      setBusyAngleKey(null);
    }
  };

  if (error && !project) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-7xl space-y-10 px-4 py-10 sm:px-6"
      initial={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex flex-col gap-6 border-b border-[#E2E8F0] pb-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
            SERP Analysis Results
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
              Keyword: <span className="ml-1 font-semibold">{project?.keyword ?? "—"}</span>
            </span>
            <span className="inline-flex items-center rounded-full border border-[#E2E8F0] bg-[#F1F5F9] px-3 py-1 text-xs font-medium text-[#475569]">
              Location: <span className="ml-1 font-semibold">{project?.location ?? "—"}</span>
            </span>
          </div>
        </div>
        <Button
          className="w-full shrink-0 border-indigo-200 text-indigo-600 hover:bg-indigo-50 lg:w-auto"
          disabled={reanalyzeBusy || busy || !project}
          onClick={handleReanalyze}
          type="button"
          variant="outline"
        >
          {reanalyzeBusy ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 size-4" />
          )}
          Re-analyze
        </Button>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {busy ? (
        <div className="space-y-3 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-[#0F172A]">
            <Loader2 className="size-4 animate-spin text-indigo-600" />
            {statusLabel}
          </div>
          <Progress value={progress} />
        </div>
      ) : null}

      {intent ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A] md:text-3xl">Intent insights</h2>
            <p className="text-sm text-[#475569]">
              Summarized from live SERP signals so you can ship something definitively useful.
            </p>
          </div>
          <IntentAnalysisSections intent={intent} />
        </section>
      ) : null}

      {project ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A] md:text-3xl">SERP data & structure</h2>
            <p className="text-sm text-[#475569]">
              Review rankings, page types, and extracted headings from the crawl.
            </p>
          </div>
          <AnalysisDashboard
            intent={intent}
            keyword={project.keyword}
            location={project.location}
            serpResults={serpResults}
          />
        </section>
      ) : null}

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] md:text-3xl">Recommended content angles</h2>
          <p className="text-sm text-[#475569]">
            Pick one angle to configure tone, length, and generation settings.
          </p>
        </div>

        {busy && angles.length === 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="h-80 animate-pulse rounded-2xl border border-[#E2E8F0] bg-[#F1F5F9]"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {angles.map((angle) => (
              <ContentAngleCard
                key={angleKey(angle)}
                angle={angle}
                busy={busyAngleKey === angleKey(angle)}
                disabled={busy}
                onSelect={handleSelectAngle}
              />
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}
