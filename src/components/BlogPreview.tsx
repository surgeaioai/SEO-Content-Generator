


"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { normalizeMarkdownTables } from "@/lib/markdown";

type BlogPreviewProps = {
  markdown: string;
};

export const BlogPreview = React.forwardRef<HTMLDivElement, BlogPreviewProps>(
  function BlogPreview({ markdown }, ref) {
    const normalizedMarkdown = React.useMemo(
      () => normalizeMarkdownTables(markdown),
      [markdown],
    );

    return (
      <div ref={ref}>
        <article className="prose prose-zinc max-w-none font-serif text-base leading-relaxed dark:prose-invert">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              table: ({ children }) => (
                <div className="my-8 overflow-x-auto rounded-xl border border-gray-200 shadow-lg dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/60 dark:to-purple-950/60">
                  {children}
                </thead>
              ),
              tr: ({ children }) => (
                <tr className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60">
                  {children}
                </tr>
              ),
              th: ({ children }) => (
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-gray-100">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                  {children}
                </td>
              ),
            }}
          >
            {normalizedMarkdown}
          </ReactMarkdown>
        </article>
      </div>
    );
  },
);
