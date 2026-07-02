"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { beginSession } from "@/app/actions";

const CARDS = [
  {
    title: "Aqui, só palavras",
    body: "Sem fotos, sem seguidores, sem fama. Um lugar para dizer o que você sente — e ler o que outras pessoas sentem.",
  },
  {
    title: "Regras da casa",
    body: "Acolha, não ataque. Ódio é banido. Política fica do lado de fora. Fale de você, da sua vida, dos seus dias.",
  },
  {
    title: "Você é um número",
    body: "Sem nome. Sem foto. Sem fama. Você recebe um número aleatório e ninguém sabe quem você é — nem precisa saber.",
  },
];

// amostra estática e honesta do produto — visitante vê antes de aceitar
const AMOSTRAS = [
  {
    numero: "#4821",
    tipo: "Desabafo",
    corpo:
      "Hoje foi um dia difícil. Acordei sem vontade de nada, mas fui trabalhar mesmo assim. Pequenas vitórias.",
    rodape: "🤝 12 acolhimentos · 3 respostas",
  },
  {
    numero: "#9137",
    tipo: "Conquista",
    corpo:
      "Passei na entrevista! Três meses tentando. Ainda não caiu a ficha.",
    rodape: "😊 24 acolhimentos",
  },
];

// erros chegam como código na URL; nunca exibimos mensagem técnica crua
const ERROS: Record<string, string> = {
  auth: "Não conseguimos criar sua conta agora. Respira — e tenta de novo em instantes.",
};

export function Onboarding({ erro }: { erro?: string }) {
  const [step, setStep] = useState(erro ? CARDS.length - 1 : 0);
  const last = step === CARDS.length - 1;
  const erroMsg = erro ? (ERROS[erro] ?? ERROS.auth) : null;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-8 px-6 py-12">
      <header className="text-center">
        <h1 className="font-serif text-4xl lowercase tracking-tight">ecoa</h1>
        <p className="mt-1 text-sm text-muted">sua voz, sem rosto</p>
      </header>

      <section className="rounded-2xl border border-hairline bg-card p-8 shadow-sm">
        <h2 className="font-serif text-2xl">{CARDS[step].title}</h2>
        <p className="mt-4 leading-relaxed text-muted">{CARDS[step].body}</p>

        <div className="mt-8 flex items-center justify-center gap-2">
          {CARDS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${
                i === step ? "bg-accent" : "bg-hairline"
              }`}
            />
          ))}
        </div>
      </section>

      {erroMsg && (
        <p
          role="alert"
          className="rounded-xl border border-red-400/40 bg-card px-4 py-3 text-sm text-red-500"
        >
          {erroMsg}
        </p>
      )}

      {!last ? (
        <button
          onClick={() => setStep(step + 1)}
          className="rounded-xl bg-accent px-6 py-3.5 font-medium text-white transition-opacity hover:opacity-90"
        >
          Continuar
        </button>
      ) : (
        <form action={beginSession} className="flex flex-col gap-4">
          <label className="flex items-start gap-3 text-sm text-muted">
            <input
              type="checkbox"
              name="accept"
              required
              className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
            />
            <span>
              Tenho 16 anos ou mais e aceito as regras da comunidade e a
              política de privacidade.
            </span>
          </label>
          <p className="text-xs text-muted">
            Leia antes, se quiser:{" "}
            <a
              href="/regras"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline"
            >
              regras da comunidade
            </a>{" "}
            ·{" "}
            <a
              href="/privacidade"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline"
            >
              política de privacidade
            </a>
          </p>
          <StartButton />
        </form>
      )}

      <section aria-label="Como é por dentro">
        <h2 className="text-center text-sm text-muted">Como é por dentro</h2>
        <div className="mt-3 flex flex-col gap-3">
          {AMOSTRAS.map((a) => (
            <article
              key={a.numero}
              className="rounded-2xl border border-hairline bg-card p-4"
            >
              <header className="flex items-center justify-between gap-2 text-sm">
                <span>
                  <span className="font-medium">Usuário {a.numero}</span>{" "}
                  <span className="text-muted">· {a.tipo}</span>
                </span>
                <span className="rounded-full border border-hairline px-2 text-[10px] uppercase text-muted">
                  exemplo
                </span>
              </header>
              <p className="mt-2 whitespace-pre-wrap font-serif leading-relaxed">
                {a.corpo}
              </p>
              <p className="mt-3 text-xs text-muted">{a.rodape}</p>
            </article>
          ))}
        </div>
      </section>

      <p className="text-center text-xs text-muted">
        Nenhum dado pessoal é pedido. Nenhum mesmo.
      </p>

      <p className="text-center">
        <a
          href="/bem-vindo/recuperar"
          className="text-xs text-muted underline hover:text-accent"
        >
          Já tenho uma conta → recuperar
        </a>
      </p>
    </main>
  );
}

// desabilita durante o submit — duplo toque criava duas contas anônimas
function StartButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-accent px-6 py-3.5 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Criando sua conta…" : "Começar"}
    </button>
  );
}
