import Link from "next/link";

// trilho lateral do desktop — só informação calma, nada que dispute atenção
export function SideRail() {
  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-2xl border border-hairline bg-card p-5 text-sm">
        <h2 className="font-serif text-lg lowercase">ecoa</h2>
        <p className="mt-2 leading-relaxed text-muted">
          Um lugar anônimo para dizer o que você sente. Sem seguidores, sem
          fama, sem rosto.
        </p>
        <p className="mt-3 text-xs">
          <Link href="/regras" className="text-accent hover:underline">
            regras da comunidade
          </Link>{" "}
          ·{" "}
          <Link href="/privacidade" className="text-accent hover:underline">
            política de privacidade
          </Link>
        </p>
      </section>

      <section className="rounded-2xl border border-hairline bg-card p-5 text-sm">
        <p className="leading-relaxed text-muted">
          Precisa de apoio agora? CVV —{" "}
          <a href="tel:188" className="text-accent hover:underline">
            ligue 188
          </a>{" "}
          (24h, gratuito) ·{" "}
          <a
            href="https://cvv.org.br"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            cvv.org.br
          </a>
        </p>
      </section>

      <section className="rounded-2xl border border-hairline bg-card p-5 text-sm">
        <p className="leading-relaxed text-muted">
          Sem pressa. O ECOA não mede seu tempo aqui. 🌱
        </p>
      </section>
    </div>
  );
}
