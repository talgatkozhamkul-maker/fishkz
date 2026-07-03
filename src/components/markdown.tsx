import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Безопасный рендер markdown: react-markdown БЕЗ rehype-raw — сырой HTML
// не исполняется (правило из аудита безопасности). Применять только к
// админскому контенту (pages); пользовательские поля выводим как plain text.
export function Markdown({ children }: { children: string }) {
  return (
    <div className="space-y-4 leading-relaxed text-stone-700 [&_a]:font-semibold [&_a]:text-teal-700 [&_a]:underline [&_blockquote]:rounded-xl [&_blockquote]:bg-amber-50 [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:text-amber-900 [&_h1]:text-2xl [&_h1]:font-extrabold [&_h1]:tracking-tight [&_h1]:text-stone-900 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-stone-900 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-stone-900 [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-bold [&_strong]:text-stone-900 [&_ul]:list-disc [&_ul]:pl-5">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
