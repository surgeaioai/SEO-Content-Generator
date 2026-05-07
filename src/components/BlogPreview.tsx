


"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
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
            rehypePlugins={[rehypeRaw]}
            components={{
              table: ({ children }) => (
                <div className="table-wrapper my-6 overflow-x-auto rounded-xl border border-gray-200 shadow-lg dark:border-gray-700">
                  <table className="w-full border-collapse text-sm">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-gray-900 text-white">
                  {children}
                </thead>
              ),
              tbody: ({ children }) => (
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {children}
                </tbody>
              ),
              tr: ({ children }) => (
                <tr className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60">
                  {children}
                </tr>
              ),
              th: ({ children }) => (
                <th className="border border-gray-700 px-4 py-3 text-left font-semibold text-white">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border border-gray-200 px-4 py-3 text-gray-700 dark:border-gray-700 dark:text-gray-300">
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
