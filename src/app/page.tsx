
"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
    // Removed automatic redirect to signin to prevent infinite loop
  }, [session, router, status]);

  if (status === "loading") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="text-xl">Cargando...</div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Fundación Biodiversidad
        </h1>
        <p className="text-xl text-center max-w-2xl">
          Portal de Gestión de Indicadores de Biodiversidad
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/auth/signin"
            className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
