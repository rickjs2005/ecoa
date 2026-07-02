import Link from "next/link";

export const metadata = {
  title: "Política de privacidade — ecoa",
};

export default function Privacidade() {
  return (
    <main className="mx-auto w-full max-w-xl px-6 py-10">
      <Link href="/" className="text-sm text-muted hover:text-accent">
        ← Voltar ao ECOA
      </Link>

      <h1 className="mt-6 font-serif text-3xl">Política de privacidade</h1>
      <p className="mt-2 text-sm text-muted">
        Última atualização: julho de 2026 · Versão beta
      </p>

      <section className="mt-8 rounded-2xl border border-accent/40 bg-card p-6 text-sm leading-relaxed">
        <h2 className="font-medium">Resumo em linguagem humana</h2>
        <ul className="mt-3 flex flex-col gap-2 text-muted">
          <li>• Não pedimos seu nome, e-mail, telefone, foto nem localização. Nunca.</li>
          <li>• Você é apenas um número aleatório. Nem nós sabemos quem você é.</li>
          <li>• Não vendemos dados, não exibimos anúncios e não usamos rastreadores de terceiros.</li>
          <li>• Excluir sua conta apaga de verdade tudo o que você escreveu — sem volta.</li>
        </ul>
      </section>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed">
        <section>
          <h2 className="font-medium">1. O que coletamos</h2>
          <p className="mt-1 text-muted">
            O mínimo para o serviço existir: (a) o número anônimo da sua conta
            e uma credencial técnica de sessão (cookie), criados no seu
            primeiro acesso; (b) os textos que você decide publicar — posts,
            respostas e reações; (c) suas denúncias, se você denunciar algum
            conteúdo. Registros técnicos de acesso (como endereço IP) são
            processados pela nossa infraestrutura de hospedagem por segurança
            e por obrigação legal (Marco Civil da Internet, art. 15), ficam
            separados do conteúdo e expiram automaticamente.
          </p>
        </section>

        <section>
          <h2 className="font-medium">2. O que NÃO coletamos</h2>
          <p className="mt-1 text-muted">
            Nome, CPF, e-mail, telefone, foto, contatos, localização,
            identificadores de publicidade. Não usamos Google Analytics, pixels
            de redes sociais nem qualquer rastreador de terceiros.
          </p>
        </section>

        <section>
          <h2 className="font-medium">3. Para que usamos</h2>
          <p className="mt-1 text-muted">
            Exclusivamente para operar o ECOA: exibir seus textos no feed,
            entregar notificações de respostas e manter a comunidade segura
            (moderação). Seus textos passam por uma checagem automática de
            regras antes de ir ao ar — inclusive, quando disponível, por um
            classificador de inteligência artificial que verifica apenas se o
            texto viola as regras da comunidade. Nenhum conteúdo é usado para
            publicidade ou para criar perfis sobre você.
          </p>
        </section>

        <section>
          <h2 className="font-medium">4. Com quem compartilhamos</h2>
          <p className="mt-1 text-muted">
            Com ninguém para fins comerciais — nunca vendemos nem alugamos
            dados. Os dados residem em provedores de infraestrutura que operam
            sob contrato (hospedagem e banco de dados, com data centers no
            Brasil sempre que possível). Podemos ser obrigados a fornecer
            registros técnicos mediante ordem judicial válida, nos limites da
            lei brasileira.
          </p>
        </section>

        <section>
          <h2 className="font-medium">5. Por quanto tempo guardamos</h2>
          <p className="mt-1 text-muted">
            Seus textos ficam até você apagá-los (cada post pode ser excluído
            individualmente) ou até você excluir a conta. A exclusão da conta,
            disponível na aba &quot;Você&quot;, remove de forma definitiva o
            perfil, os posts, as respostas, as reações e as notificações —
            inclusive o registro de autenticação. Não existe &quot;conta
            desativada&quot;: excluiu, acabou.
          </p>
        </section>

        <section>
          <h2 className="font-medium">6. Seus direitos (LGPD)</h2>
          <p className="mt-1 text-muted">
            Nos termos da Lei Geral de Proteção de Dados (Lei 13.709/2018),
            você pode confirmar o tratamento, acessar seus dados (seus textos
            estão todos visíveis na aba &quot;Você&quot;), corrigi-los
            (excluindo e republicando) e eliminá-los (excluindo posts ou a
            conta inteira, direto no app, sem precisar pedir a ninguém). Por
            sermos um serviço anônimo, não temos como identificar você para
            atender pedidos por outros canais — e isso é proposital: é a sua
            maior proteção.
          </p>
        </section>

        <section>
          <h2 className="font-medium">7. Idade mínima</h2>
          <p className="mt-1 text-muted">O ECOA é para maiores de 16 anos.</p>
        </section>

        <section>
          <h2 className="font-medium">8. Um limite honesto</h2>
          <p className="mt-1 text-muted">
            Os textos publicados são públicos para quem usa o ECOA e passam
            pela moderação — por isso não são criptografados de ponta a ponta.
            Evite incluir no texto informações que possam identificar você ou
            outras pessoas; o próprio app avisa quando percebe um telefone ou
            e-mail antes de publicar.
          </p>
        </section>

        <section>
          <h2 className="font-medium">9. Alterações e contato</h2>
          <p className="mt-1 text-muted">
            O ECOA está em fase beta. Mudanças relevantes nesta política serão
            anunciadas dentro do app antes de entrar em vigor. Dúvidas e
            solicitações podem ser feitas pela página de{" "}
            <Link href="/ajuda" className="text-accent underline">
              Ajuda
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
