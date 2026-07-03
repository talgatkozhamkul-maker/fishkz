import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Markdown } from "@/components/markdown";
import { getPageBySlug, getPages } from "@/lib/data";

export const revalidate = 1800;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const pages = await getPages();
  return pages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  return { title: page ? page.title : "Страница не найдена" };
}

export default async function InfoPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) notFound();

  // Если контент не начинается с заголовка — выводим title страницы (аудит)
  const hasHeading = page.content_md.trimStart().startsWith("#");

  return (
    <article className="mx-auto w-full max-w-2xl">
      {!hasHeading && (
        <h1 className="mb-4 text-2xl font-extrabold tracking-tight">
          {page.title}
        </h1>
      )}
      <Markdown>{page.content_md}</Markdown>
    </article>
  );
}
