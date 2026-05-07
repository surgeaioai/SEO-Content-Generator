"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeadingsList } from "@/components/HeadingsList";
import { PageTypeBreakdown } from "@/components/PageTypeBreakdown";
import type { IntentAnalysis, SerpResult } from "@/types";

type AnalysisDashboardProps = {
  keyword: string;
  location: string;
  serpResults: SerpResult[];
  intent?: IntentAnalysis;
};

function pageTypeBadgeClass(pageType?: string) {
  switch (pageType) {
    case "Blog Post":
      return "border-indigo-100 bg-indigo-50 text-indigo-700";
    case "Service Page":
      return "border-emerald-100 bg-emerald-50 text-emerald-800";
    case "Product Page":
      return "border-amber-100 bg-amber-50 text-amber-900";
    case "Comparison Page":
      return "border-violet-100 bg-violet-50 text-violet-800";
    default:
      return "border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]";
  }
}

export function AnalysisDashboard({
  keyword,
  location,
  serpResults,
  intent,
}: AnalysisDashboardProps) {
  const tableRef = useRef<HTMLDivElement | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalResults = serpResults.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);

  const currentResults = useMemo(
    () =>
      serpResults.slice(
        (safePage - 1) * itemsPerPage,
        safePage * itemsPerPage,
      ),
    [safePage, serpResults],
  );

  const startIdx = totalResults === 0 ? 0 : (safePage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(safePage * itemsPerPage, totalResults);

  useEffect(() => {
    console.log("Total SERP results:", serpResults.length);
    console.log("Current page:", safePage);
    console.log("Total pages:", totalPages);
    console.log("Showing:", currentResults.length, "results");
  }, [currentResults.length, safePage, serpResults.length, totalPages]);

  const handleNext = () => {
    if (safePage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      tableRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (safePage > 1) {
      setCurrentPage((prev) => prev - 1);
      tableRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const breakdown =
    intent?.pageTypeBreakdown ??
    serpResults.reduce<Record<string, number>>((acc, row) => {
      const type = row.pageType ?? "Unknown";
      acc[type] = (acc[type] ?? 0) + 1;
      return acc;
    }, {});

  return (
    <Tabs className="w-full" defaultValue="serp">
      <TabsList className="flex w-full flex-wrap justify-start gap-1 rounded-xl bg-[#F8FAFC] p-1">
        <TabsTrigger value="serp">SERP overview</TabsTrigger>
        <TabsTrigger value="types">Page types</TabsTrigger>
        <TabsTrigger value="headings">Headings</TabsTrigger>
      </TabsList>

      <TabsContent className="mt-4 space-y-3" value="serp">
        <p className="text-sm text-[#475569]">
          Keyword <span className="font-medium text-[#0F172A]">{keyword}</span>{" "}
          · Location{" "}
          <span className="font-medium text-[#0F172A]">{location}</span>
        </p>
        <div ref={tableRef} className="overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>H1</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentResults.map((row) => (
                <TableRow key={row.url}>
                  <TableCell className="font-mono text-xs">{row.position}</TableCell>
                  <TableCell className="max-w-[140px] truncate text-xs">
                    {row.domain}
                  </TableCell>
                  <TableCell className="max-w-[260px] text-sm">
                    <a
                      className="text-indigo-600 underline-offset-4 hover:underline"
                      href={row.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {row.title}
                    </a>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge className={pageTypeBadgeClass(row.pageType)} variant="outline">
                      {row.pageType ?? "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate text-xs text-[#475569]">
                    {row.headings?.h1?.[0] ?? (row.scrapedSuccessfully ? "—" : "Unreachable")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col gap-3 rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#475569] sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing {startIdx}-{endIdx} of {totalResults} results
          </p>
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg border border-[#CBD5E1] px-3 py-1.5 font-medium text-[#0F172A] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={safePage === 1}
              onClick={handlePrevious}
              type="button"
            >
              ← Previous
            </button>
            <span className="rounded-lg bg-[#0F172A] px-3 py-1.5 text-xs font-semibold text-white">
              Page {safePage} of {totalPages}
            </span>
            <button
              className="rounded-lg border border-[#CBD5E1] px-3 py-1.5 font-medium text-[#0F172A] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={safePage === totalPages}
              onClick={handleNext}
              type="button"
            >
              Next →
            </button>
          </div>
        </div>
      </TabsContent>

      <TabsContent className="mt-4" value="types">
        <PageTypeBreakdown breakdown={breakdown} />
      </TabsContent>

      <TabsContent className="mt-4" value="headings">
        <HeadingsList serpResults={serpResults} />
      </TabsContent>

    </Tabs>
  );
}
