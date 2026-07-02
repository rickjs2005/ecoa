import Link from "next/link";

export default function Ajuda() {
  return (
    <main>
      <h1 className="font-serif text-2xl">Ajuda</h1>

      <section className="mt-6 rounded-2xl border border-accent/40 bg-card p-6">
        <h2 className="font-medium">🆘 Precisa de apoio agora?</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          O CVV (Centro de Valorização da Vida) oferece apoio emocional
          gratuito, 24 horas por dia, com total sigilo.
        </p>
        <p className="mt-3 font-serif text-xl">
          Ligue <a href="tel:188" className="text-accent">188</a>
        </p>
        <p className="mt-1 text-sm text-muted">
          Ou converse por chat em{" "}
          <a
            href="https://cvv.org.br"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline"
          >
            cvv.org.br
          </a>
        </p>
      </section>

      <section className="mt-8 flex flex-col gap-6 text-sm leading-relaxed">
        <div>
          <h3 className="font-medium">Como funciona o anonimato</h3>
          <p className="mt-1 text-muted">
            Você é identificado apenas por um número aleatório. Não pedimos
            nome, e-mail, telefone nem foto. Não existe página pública com seu
            histórico — tocar no número de alguém não mostra os posts dessa
            pessoa. Anonimato, porém, não é impunidade: conteúdo que viola as
            regras é removido e contas abusivas são suspensas.
          </p>
        </div>

        <div>
          <h3 className="font-medium">Regras da comunidade</h3>
          <p className="mt-1 text-muted">
            Proibido: discurso de ódio, ameaças, assédio, conteúdo sexual,
            spam, exposição de dados de terceiros, incentivo à autolesão e
            propaganda política de qualquer tipo. O ECOA é um espaço para
            sentimentos e experiências pessoais — não para campanhas.{" "}
            <Link href="/regras" className="text-accent underline">
              Leia as regras completas
            </Link>
            .
          </p>
        </div>

        <div>
          <h3 className="font-medium">Como funciona a moderação</h3>
          <p className="mt-1 text-muted">
            Todo texto passa por uma checagem automática antes de ir ao ar.
            Conteúdos denunciados pela comunidade são revisados; ao atingir
            denúncias de 3 pessoas diferentes, o conteúdo é ocultado
            preventivamente até revisão. Quem desabafa sobre a própria dor
            nunca é punido — é acolhido.
          </p>
        </div>

        <div>
          <h3 className="font-medium">Seus dados (LGPD)</h3>
          <p className="mt-1 text-muted">
            Coletamos o mínimo possível: seu número, seus textos e o
            necessário para operar o serviço. Você pode excluir sua conta a
            qualquer momento em{" "}
            <Link href="/voce" className="text-accent underline">
              Você
            </Link>{" "}
            — a exclusão é definitiva e apaga tudo o que você escreveu.{" "}
            <Link href="/privacidade" className="text-accent underline">
              Leia a política de privacidade completa
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
