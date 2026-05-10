"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  Code,
  Copy,
  Download,
  FileText,
  Eye,
  ListTree,
  Share2,
} from "lucide-react";

import { BlogPreview } from "@/components/BlogPreview";
import { Button } from "@/components/ui/button";
import { downloadBlogAsDocx } from "@/lib/generateDocx";
import type { GeneratedBlog, Project } from "@/types";

const cleanBlogContent = (content: string): string => {
  return content
    .replace(/✅\s*/g, "")
    .replace(/❌\s*/g, "")
    .replace(/^([*\-]\s*)[\u{1F300}-\u{1FAFF}]\s*/gmu, "$1")
    .replace(/  +/g, " ")
    .trim();
};

export function ResultClient() {
  const params = useParams();
  const projectId = String(params.projectId ?? "");
  const [project, setProject] = useState<Project | null>(null);
  const [blog, setBlog] = useState<GeneratedBlog | null>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "markdown" | "html">("preview");
  const [copied, setCopied] = useState<"markdown" | "html" | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/generate-blog?projectId=${projectId}`, {
          credentials: "include",
        });
        const data: unknown = await res.json();
        if (!res.ok) {
          throw new Error(
            data &&
              typeof data === "object" &&
              "error" in data &&
              typeof (data as { error: unknown }).error === "string"
              ? (data as { error: string }).error
              : "Blog not found",
          );
        }
        if (cancelled) return;
        const payload = data as { blog: GeneratedBlog; project: Project };
        setProject(payload.project);
        setBlog(payload.blog);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load this blog post.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const handleCopy = async (kind: "markdown" | "html") => {
    if (!blog) return;
    try {
      const text = kind === "markdown" ? blog.markdown : blog.html;
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      window.setTimeout(() => setCopied(""), 2000);
    } catch {
      setError("Clipboard access was blocked. Copy manually.");
    }
  };

  const handleDownload = async () => {
    if (!blog) return;
    try {
      const markdownContent = blog.markdown;
      const blogTitle = blog.h1 || project?.keyword || "SEO Blog Post";
      await downloadBlogAsDocx(markdownContent, blogTitle, project?.keyword);
    } catch {
      setError("Download failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <motion.div
          animate={{ rotate: 360 }}
          className="h-12 w-12 rounded-full border-4 border-indigo-200 border-t-indigo-600"
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="mx-auto max-w-2xl p-8 text-sm text-destructive">
        {error || "Blog not found."}
      </div>
    );
  }

  const seoScore = blog.seoScore ?? blog.qualityReport?.score ?? 95;
  const cleanedMarkdown = cleanBlogContent(blog.markdown || "");
  const cleanedHtml = cleanBlogContent(blog.html || "");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link className="flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" href="/">
              <ArrowLeft className="h-4 w-4" />
              New Project
            </Link>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 dark:text-white">Blog Generated Successfully</h1>
                <p className="text-xs text-slate-500">
                  {blog.wordCount} words · {blog.readingTime} min read · {blog.generationTimeSec ?? 90}s
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => handleCopy("markdown")}>
              {copied === "markdown" ? <CheckCircle className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied === "markdown" ? "Copied!" : "Copy MD"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleCopy("html")}>
              {copied === "html" ? <CheckCircle className="mr-2 h-4 w-4" /> : <Code className="mr-2 h-4 w-4" />}
              Copy HTML
            </Button>
            <Button size="sm" variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Publish
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              <div className="flex">
                {[
                  { id: "preview", label: "Preview", icon: Eye },
                  { id: "markdown", label: "Markdown", icon: FileText },
                  { id: "html", label: "HTML", icon: Code },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? "border-b-2 border-indigo-600 bg-indigo-50/50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                    onClick={() => setActiveTab(tab.id as "preview" | "markdown" | "html")}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-[600px] p-8 lg:p-12">
              {activeTab === "preview" ? (
                <BlogPreview markdown={cleanedMarkdown} />
              ) : null}
              {activeTab === "markdown" ? (
                <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-6 font-mono text-sm dark:bg-slate-800">
                  {cleanedMarkdown}
                </pre>
              ) : null}
              {activeTab === "html" ? (
                <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-6 font-mono text-sm dark:bg-slate-800">
                  {cleanedHtml}
                </pre>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-1">
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900"
            initial={{ opacity: 0, x: 20 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white">SEO Score</h3>
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-4xl font-black text-transparent">
                {seoScore}
              </div>
            </div>
            <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${seoScore}%` }} />
            </div>
            <div className="space-y-2 text-sm">
              {(blog.qualityReport?.checks ?? []).map((check) => (
                <div key={check.name} className="flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-300">{check.name}</span>
                  {check.passed ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <div className="h-4 w-4 rounded-full border-2 border-slate-300 dark:border-slate-600" />}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900"
            initial={{ opacity: 0, x: 20 }}
            transition={{ delay: 0.1 }}
          >
            <div className="mb-4 flex items-center gap-2">
              <ListTree className="h-5 w-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 dark:text-white">Article Outline</h3>
            </div>
            <nav className="max-h-96 space-y-1 overflow-y-auto">
              {blog.headingStructure.map((heading, i) => (
                <a
                  key={`${heading.level}-${i}-${heading.text}`}
                  className={`block rounded-lg py-2 text-sm transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400 ${
                    heading.level === 1 ? "px-3 font-bold text-slate-900 dark:text-white" : heading.level === 2 ? "pl-3 font-medium text-slate-700 dark:text-slate-300" : "pl-6 text-slate-600 dark:text-slate-400"
                  }`}
                  href={`#${heading.text.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                >
                  {heading.text}
                </a>
              ))}
            </nav>
          </motion.div>

          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900"
            initial={{ opacity: 0, x: 20 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="mb-4 font-bold text-slate-900 dark:text-white">Google Preview</h3>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
              <div className="mb-1 text-xs text-slate-500">
                {project?.keyword ? `${project.keyword.toLowerCase()}.com › blog` : "yoursite.com › blog"}
              </div>
              <div className="mb-1 line-clamp-2 cursor-pointer text-base font-medium text-blue-600 hover:underline dark:text-blue-400">
                {blog.metaTitle || blog.h1}
              </div>
              <div className="line-clamp-3 text-sm text-slate-600 dark:text-slate-400">{blog.metaDescription}</div>
            </div>
          </motion.div>

          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 text-white shadow-xl"
            initial={{ opacity: 0, x: 20 }}
            transition={{ delay: 0.3 }}
          >
            <div className="grid grid-cols-2 gap-4">
              <div><div className="text-3xl font-black">{blog.wordCount || 0}</div><div className="text-sm opacity-90">Words</div></div>
              <div><div className="text-3xl font-black">{blog.readingTime || 0}</div><div className="text-sm opacity-90">Min read</div></div>
              <div><div className="text-3xl font-black">{blog.headingStructure.length || 0}</div><div className="text-sm opacity-90">Headings</div></div>
              <div><div className="text-3xl font-black">{blog.generationTimeSec || 90}s</div><div className="text-sm opacity-90">Generated</div></div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
