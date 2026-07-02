import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { renderMarkdown } from "@/lib/markdown";
import type { Page } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

async function getPage(slug: string) {
  const supabase = await createClient();
  const { data: page } = await supabase
    .from("pages")
    .select("slug, title, content_md")
    .eq("slug", slug)
    .maybeSingle<Page>();
  return page;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  return { title: page ? page.title : "Страница не найдена" };
}

export default async function InfoPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();

  return (
    <article className="flex flex-col gap-4">{renderMarkdown(page.content_md)}</article>
  );
}
