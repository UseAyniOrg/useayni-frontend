import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

type LegalDocumentKind = 'privacy' | 'terms';

const legalSections: Record<LegalDocumentKind, Array<{ title: string; paragraphs: string[] }>> = {
  privacy: [
    {
      title: '1. Sobre esta política',
      paragraphs: [
        'Esta política descreve, em termos gerais, como o UseAyni trata informações ao oferecer ferramentas de gestão para organizações, membros e participantes de atividades. O tratamento concreto também depende das configurações e dos avisos apresentados por cada organização.',
        'A organização que utiliza a plataforma define quais cadastros, campos, módulos e atividades oferece. Para dados tratados em nome da organização, ela pode atuar como controladora e o UseAyni como operador, conforme o contrato e a legislação aplicável.',
      ],
    },
    {
      title: '2. Informações tratadas',
      paragraphs: [
        'Podem ser tratados dados de conta e identificação, como nome e email; dados de contato e perfil, como telefone, CPF ou informações acadêmicas quando solicitados; vínculos, funções e permissões; e dados relacionados a inscrições, presença, formulários, projetos e atividades.',
        'A plataforma também processa arquivos e imagens enviados pelos usuários, registros técnicos de acesso e informações necessárias para proteger e operar os serviços. Os campos efetivamente solicitados variam por organização e funcionalidade.',
      ],
    },
    {
      title: '3. Finalidades e compartilhamento',
      paragraphs: [
        'As informações são usadas para autenticar contas, manter vínculos com organizações, oferecer os módulos habilitados, administrar inscrições e participações, exibir conteúdo autorizado e manter a segurança e a operação da plataforma.',
        'Dados de perfil podem ser compartilhados com uma organização para cadastro ou participação. O reaproveitamento de informações entre organizações depende da escolha e confirmação da pessoa, conforme apresentado no fluxo correspondente. Respostas específicas de inscrição são destinadas à atividade para a qual foram fornecidas.',
        'O UseAyni não vende dados pessoais. Informações podem ser compartilhadas com prestadores necessários à hospedagem, armazenamento, comunicação ou segurança do serviço, sujeitos a obrigações adequadas de proteção, e quando exigido por lei.',
      ],
    },
    {
      title: '4. Retenção e segurança',
      paragraphs: [
        'As informações são mantidas pelo período necessário às finalidades do serviço, às instruções da organização, às obrigações legais e à resolução de disputas. Prazos concretos podem depender do contrato da organização e de exigências legais.',
        'Adotamos medidas técnicas e organizacionais compatíveis com a natureza dos dados para reduzir riscos de acesso, alteração, perda ou divulgação não autorizados. Nenhum serviço conectado à internet pode garantir segurança absoluta.',
      ],
    },
    {
      title: '5. Direitos e solicitações',
      paragraphs: [
        'A pessoa titular pode solicitar confirmação de tratamento, acesso, correção, informações sobre compartilhamento, anonimização, bloqueio ou eliminação quando aplicável, além de exercer os demais direitos previstos na legislação de proteção de dados.',
        'Quando os dados estiverem sob gestão de uma organização, a solicitação pode precisar ser encaminhada a ela. Para dúvidas sobre a plataforma, escreva para o contato indicado nesta página.',
      ],
    },
    {
      title: '6. Atualizações e contato',
      paragraphs: [
        'Esta política pode ser atualizada para refletir mudanças nos serviços, nas práticas de tratamento ou na legislação. A versão vigente será publicada nesta página.',
        'Para questões relacionadas aos dados tratados em nome de uma organização, entre em contato com o administrador responsável por esse espaço. Para outras solicitações de privacidade, utilize o canal de contato oficial do UseAyni.',
      ],
    },
  ],
  terms: [
    {
      title: '1. Escopo do serviço',
      paragraphs: [
        'O UseAyni oferece software para apoiar organizações na gestão de membros, estrutura, permissões, eventos, inscrições, presença, projetos, atividades e outros módulos disponibilizados na plataforma.',
        'Os recursos disponíveis, limites, suporte e condições comerciais dependem do plano, do contrato e da configuração de cada organização. A apresentação pública não substitui uma proposta ou contrato específico.',
      ],
    },
    {
      title: '2. Contas e acesso',
      paragraphs: [
        'O usuário deve fornecer informações corretas, manter suas credenciais sob sigilo e comunicar uso não autorizado da conta. O acesso a recursos depende do perfil, dos vínculos e das permissões concedidas pela organização.',
        'Administradores são responsáveis por gerenciar usuários, permissões, formulários e conteúdos da organização de acordo com a legislação, seus regulamentos e os avisos fornecidos às pessoas participantes.',
      ],
    },
    {
      title: '3. Conteúdo e dados da organização',
      paragraphs: [
        'A organização e seus usuários permanecem responsáveis pelo conteúdo, arquivos, cadastros e instruções que inserem na plataforma, incluindo a existência de base legal e autorização necessárias para esse uso.',
        'O uso de informações para cadastro, inscrição, presença ou compartilhamento entre organizações deve respeitar as escolhas apresentadas no serviço e a política de privacidade aplicável.',
      ],
    },
    {
      title: '4. Uso aceitável',
      paragraphs: [
        'Não é permitido usar o serviço para fins ilícitos, violar direitos de terceiros, tentar obter acesso não autorizado, interferir na disponibilidade da plataforma ou enviar conteúdo malicioso, fraudulento ou abusivo.',
        'O UseAyni pode investigar relatos, adotar medidas proporcionais para proteger pessoas e serviços e, quando necessário, restringir ou suspender acessos em conformidade com a lei e com os contratos aplicáveis.',
      ],
    },
    {
      title: '5. Disponibilidade e mudanças',
      paragraphs: [
        'A plataforma pode passar por manutenção, atualizações ou interrupções. Recursos podem evoluir, ser corrigidos ou deixar de ser oferecidos, respeitadas as condições contratuais aplicáveis.',
        'O UseAyni não garante resultados específicos de gestão, participação, carreira ou desempenho decorrentes do uso do software. A organização decide como aplicar os recursos e responde por suas próprias atividades.',
      ],
    },
    {
      title: '6. Planos, encerramento e contato',
      paragraphs: [
        'Preços, cobrança, renovação, cancelamento, limites e suporte são definidos na proposta ou contrato aplicável à organização. Em caso de conflito, prevalecem as condições acordadas entre as partes naquilo que for permitido por lei.',
        'Estes termos podem ser atualizados quando necessário. Dúvidas sobre contratação ou uso podem ser encaminhadas à equipe UseAyni pelo canal de contato oficial ou ao administrador do espaço da organização.',
      ],
    },
  ],
};

const contactEmail = import.meta.env.VITE_PUBLIC_CONTACT_EMAIL?.trim() ?? '';

export default function LegalDocumentPage({ kind }: { kind: LegalDocumentKind }) {
  const isPrivacy = kind === 'privacy';
  const title = isPrivacy ? 'Política de Privacidade' : 'Termos de Uso';

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
          <Link to="/" aria-label="Voltar à página inicial"><img src="/Ayni.svg" alt="UseAyni" className="h-9 w-auto" /></Link>
          <Button asChild variant="outline" size="sm"><Link to="/"><ArrowLeft className="size-4" />Página inicial</Link></Button>
        </div>
      </header>
      <article className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
        <p className="text-sm font-semibold text-emerald-800">UseAyni</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-slate-500">Última atualização: 25 de outubro de 2026</p>
        <p className="mt-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          Este documento é uma referência geral baseada nos fluxos atuais do UseAyni. As condições da organização e os contratos específicos podem complementar estas informações. O texto deve ser revisado por assessoria jurídica antes de ser adotado como documento definitivo.
        </p>
        <div className="mt-10 space-y-9">
          {legalSections[kind].map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>
              <div className="mt-3 space-y-3 text-[15px] leading-7 text-slate-600">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph.includes('VITE_PUBLIC_CONTACT_EMAIL')
                    ? <>{paragraph.split('VITE_PUBLIC_CONTACT_EMAIL')[0]}<a href={`mailto:${contactEmail}`} className="font-medium text-emerald-800 underline underline-offset-4">{contactEmail}</a>{paragraph.split('VITE_PUBLIC_CONTACT_EMAIL')[1]}</>
                    : paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
      <footer className="border-t bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>© {new Date().getFullYear()} UseAyni</span>
          {contactEmail && <a href={`mailto:${contactEmail}`} className="hover:text-slate-900">Contato: {contactEmail}</a>}
        </div>
      </footer>
    </main>
  );
}