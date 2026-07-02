"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DRAFT_KEY } from "@/components/composer-form";

// a publicação confirmada é o momento certo de aposentar o rascunho local
export function PublishedNotice() {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
    // tira ?publicado=1 da URL — o aviso não deve voltar num refresh
    router.replace("/", { scroll: false });
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <p
      role="status"
      className={`mt-4 rounded-xl bg-card px-4 py-3 text-sm text-accent transition-opacity duration-700 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      Publicado. Alguém vai te ler. 💙
    </p>
  );
}
