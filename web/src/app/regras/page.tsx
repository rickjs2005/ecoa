import Link from "next/link";

export const metadata = {
  title: "Regras da comunidade — ecoa",
};

export default function Regras() {
  return (
    <main className="mx-auto w-full max-w-xl px-6 py-10">
      <Link href="/" className="text-sm text-muted hover:text-accent">
        ← Voltar ao ECOA
      </Link>

      <h1 className="mt-6 font-serif text-3xl">Regras da comunidade</h1>
      <p className="mt-2 text-sm text-muted">
        O ECOA existe para uma coisa só: acolher o que você sente.
      </p>

      <section className="mt-8 rounded-2xl border border-accent/40 bg-card p-6 text-sm leading-relaxed">
        <h2 className="font-medium">A regra de ouro</h2>
        <p className="mt-2 text-muted">
          Acolha como você gostaria de ser acolhido. Aqui dentro, todo mundo é
          só um número — e atrás de cada número existe uma pessoa inteira.
        </p>
      </section>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed">
        <section>
          <h2 className="font-medium">O que é bem-vindo 💙</h2>
          <p className="mt-1 text-muted">
            Sentimentos, desabafos, medos, conquistas, gratidão, luto, dúvidas,
            experiências do seu dia. Opiniões pessoais sobre a sua própria
            vida. Perguntas para a comunidade. Alegria também — o ECOA não é
            só para dias difíceis.
          </p>
        </section>

        <section>
          <h2 className="font-medium">O que não tem espaço aqui 🚫</h2>
          <ul className="mt-1 flex flex-col gap-1.5 text-muted">
            <li>• Discurso de ódio de qualquer tipo: racismo, xenofobia, homofobia, transfobia, machismo, intolerância religiosa, capacitismo.</li>
            <li>• Ameaças, assédio ou incitação à violência.</li>
            <li>• Pornografia e conteúdo sexual explícito.</li>
            <li>• Exposição de dados de outras pessoas (nome, telefone, endereço...).</li>
            <li>• Incentivo à autolesão ou ao suicídio de outras pessoas.</li>
            <li>• Conteúdo criminoso, golpes, venda de qualquer coisa.</li>
            <li>• Spam, correntes, links e propaganda.</li>
            <li>• Política partidária: campanha, candidato, partido, convocação para atos. Não é censura de opinião — é escopo: o ECOA é sobre a sua vida, não sobre eleições.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-medium">Se você está em sofrimento</h2>
          <p className="mt-1 text-muted">
            Falar sobre a própria dor — inclusive pensamentos muito difíceis —
            <strong className="text-foreground"> nunca é punido aqui</strong>.
            Você será acolhido, não silenciado. E existe apoio profissional
            gratuito, 24h: <strong className="text-foreground">CVV, ligue 188</strong>{" "}
            ou cvv.org.br.
          </p>
        </section>

        <section>
          <h2 className="font-medium">Como a moderação funciona</h2>
          <p className="mt-1 text-muted">
            Todo texto passa por uma checagem automática antes de ir ao ar.
            Conteúdos denunciados pela comunidade são ocultados
            preventivamente quando várias pessoas diferentes denunciam, até
            revisão. Violações levam à remoção do conteúdo e, em caso de
            reincidência ou gravidade, à suspensão da conta. Anonimato não é
            impunidade.
          </p>
        </section>

        <section>
          <h2 className="font-medium">Seu controle</h2>
          <p className="mt-1 text-muted">
            Você pode desativar respostas em qualquer post seu (&quot;só quero
            ser ouvido&quot;), ocultar respostas específicas no seu post,
            denunciar qualquer conteúdo e excluir o que escreveu a qualquer
            momento.
          </p>
        </section>
      </div>
    </main>
  );
}
