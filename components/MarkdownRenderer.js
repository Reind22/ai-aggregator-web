"use client";

/**
 * MarkdownRenderer — рендер ответов модели: markdown (GFM) + LaTeX ($...$ / $$...$$).
 */
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export default function MarkdownRenderer({ content }) {
  return (
    <div className="md-answer text-gray-200 [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:font-bold [&_h3]:mt-3 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:my-2 [&_li]:my-0.5 [&_p]:my-2 [&_a]:text-[#00FF00] [&_a]:underline [&_code]:bg-black/40 [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.9em] [&_pre]:bg-black/50 [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre]:my-2 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_blockquote]:border-l-2 [&_blockquote]:border-[#00CC00]/50 [&_blockquote]:pl-3 [&_blockquote]:text-gray-400 [&_table]:border-collapse [&_table]:my-2 [&_th]:border [&_th]:border-white/20 [&_th]:px-2 [&_th]:py-1 [&_td]:border [&_td]:border-white/20 [&_td]:px-2 [&_td]:py-1 [&_.katex]:text-[1.02em] [&_.katex-display]:my-3 [&_.katex-display]:overflow-x-auto">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, output: "html" }]]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
