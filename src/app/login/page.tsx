import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Вход",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ next?: string; error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next = "/profile", error } = await searchParams;
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-5 py-6">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold tracking-tight">Вход в FishKZ</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-stone-500">
          Без паролей: пришлём ссылку для входа на почту. Вход нужен только для
          размещения объявлений — каталог открыт всем.
        </p>
      </div>
      {error === "link" && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
          Ссылка устарела или уже была использована. Запросите новую — и
          открывайте её на том же устройстве, где вводили e-mail.
        </p>
      )}
      <LoginForm next={next.startsWith("/") ? next : "/profile"} />
    </div>
  );
}
