import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Вход",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next = "/profile" } = await searchParams;
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-5 py-6">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold tracking-tight">Вход в FishKZ</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-stone-500">
          Без паролей: пришлём одноразовый код на почту. Вход нужен только для
          размещения объявлений — каталог открыт всем.
        </p>
      </div>
      <LoginForm next={next.startsWith("/") ? next : "/profile"} />
    </div>
  );
}
