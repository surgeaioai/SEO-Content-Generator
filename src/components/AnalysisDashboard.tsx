"use client";

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
        <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white">
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
              {serpResults.map((row) => (
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
