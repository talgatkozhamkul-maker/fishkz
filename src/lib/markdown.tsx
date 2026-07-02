import { Fragment, type ReactNode } from "react";

// Минимальный безопасный рендерер Markdown без внешних зависимостей.
// Поддерживает заголовки (#, ##, ###) и абзацы. Текст выводится как обычный
// текст React (без dangerouslySetInnerHTML), поэтому HTML-инъекции невозможны.
// Когда понадобится полноценный Markdown (списки, ссылки, жирный) — заменим на
// библиотеку по согласованию.
export function renderMarkdown(md: string): ReactNode {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push(
      <p key={`p-${blocks.length}`} className="text-zinc-700">
        {paragraph.join(" ")}
      </p>,
    );
    paragraph = [];
  };

  for (const line of lines) {
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      flushParagraph();
      const level = heading[1].length;
      const text = heading[2];
      if (level === 1) {
        blocks.push(
          <h1
            key={`h-${blocks.length}`}
            className="text-2xl font-semibold tracking-tight"
          >
            {text}
          </h1>,
        );
      } else if (level === 2) {
        blocks.push(
          <h2 key={`h-${blocks.length}`} className="text-xl font-semibold">
            {text}
          </h2>,
        );
      } else {
        blocks.push(
          <h3 key={`h-${blocks.length}`} className="text-lg font-medium">
            {text}
          </h3>,
        );
      }
      continue;
    }

    if (line.trim() === "") {
      flushParagraph();
    } else {
      paragraph.push(line.trim());
    }
  }
  flushParagraph();

  return <Fragment>{blocks}</Fragment>;
}
