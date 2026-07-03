import type { ReactNode } from "react";

export function EmptyState({
  emoji = "🎣",
  title,
  children,
}: {
  emoji?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white px-6 py-10 text-center ring-1 ring-stone-200">
      <div aria-hidden className="text-4xl">
        {emoji}
      </div>
      <p className="mt-3 font-bold text-stone-800">{title}</p>
      {children && <div className="mt-1.5 text-sm text-stone-500">{children}</div>}
    </div>
  );
}
