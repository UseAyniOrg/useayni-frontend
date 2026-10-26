import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardList,
  GitBranch,
  Layers3,
  Mail,
  Menu,
  ShieldCheck,
  UsersRound,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const contactEmail = import.meta.env.VITE_PUBLIC_CONTACT_EMAIL?.trim() ?? '';

const productAreas = [
  {
    icon: UsersRound,
    title: 'Pessoas e cadastros',
    description: 'Organize membros, perfis, aprovações e informações de cadastro em um só espaço.',
  },
  {
    icon: GitBranch,
    title: 'Hierarquia e responsabilidades',
    description: 'Represente a estrutura da organização com unidades, cargos e mandatos.',
  },
  {
    icon: CalendarDays,
    title: 'Eventos e participação',
    description: 'Divulgue eventos, receba inscrições e registre presença, inclusive por QR Code.',
  },
  {
    icon: ClipboardList,
    title: 'Projetos e atividades',
    description: 'Acompanhe iniciativas, responsáveis, prazos e informações relacionadas ao trabalho da equipe.',
  },
  {
    icon: Layers3,
    title: 'Uma plataforma configurável',
    description: 'Cada organização tem seu próprio espaço, identidade e recursos habilitados conforme sua operação.',
  },
  {
    icon: ShieldCheck,
    title: 'Acesso por função',
    description: 'Separe as experiências de membros, responsáveis e administradores com permissões específicas.',
  },
];

const faqItems = [
  {
    question: 'Para quais organizações o UseAyni é indicado?',
    answer: 'Para associações, entidades de classe, organizações acadêmicas e comunidades que precisam organizar pessoas, responsabilidades e atividades.',
  },
  {
    question: 'O que está incluído na plataforma?',
    answer: 'Os recursos dependem dos módulos habilitados e da configuração de cada organização. A equipe apresenta o escopo adequado durante a conversa comercial.',
  },
  {
    question: 'Quanto custa contratar o UseAyni?',
    answer: 'O plano e os módulos são definidos conforme as necessidades da organização. Entre em contato para conversar sobre escopo e valores.',
  },
  {
    question: 'Como começo?',
    answer: 'Envie uma mensagem pelo formulário. Nossa equipe poderá entender o contexto da organização e orientar os próximos passos.',
  },
];

export default function PublicHomePage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const submitContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = [
      `Nome: ${name}`,
      `Organização: ${organization}`,
      `Email para retorno: ${email}`,
      '',
      message,
    ].join('\n');
    window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(`Quero conhecer o UseAyni - ${organization}`)}&body=${encodeURIComponent(body)}`;
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
          <a href="#inicio" aria-label="UseAyni, início" className="shrink-0">
            <img src="/Ayni.svg" alt="UseAyni" className="h-9 w-auto" />
          </a>
          <nav className="hidden items-center gap-7 text-sm text-slate-600 md:flex" aria-label="Navegação principal">
            <a href="#produto" className="transition-colors hover:text-slate-950">Plataforma</a>
            <a href="#recursos" className="transition-colors hover:text-slate-950">Recursos</a>
            <a href="#perguntas" className="transition-colors hover:text-slate-950">Perguntas</a>
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <Button variant="ghost" onClick={() => navigate('/login')}>Entrar</Button>
            <Button asChild>
              <a href="#contato">Conversar com a equipe</a>
            </Button>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
        {menuOpen && (
          <nav className="border-t bg-white px-5 py-4 md:hidden" aria-label="Navegação móvel">
            <div className="mx-auto flex max-w-7xl flex-col gap-2">
              <a href="#produto" onClick={closeMenu} className="rounded-md px-3 py-2 text-sm hover:bg-muted">Plataforma</a>
              <a href="#recursos" onClick={closeMenu} className="rounded-md px-3 py-2 text-sm hover:bg-muted">Recursos</a>
              <a href="#perguntas" onClick={closeMenu} className="rounded-md px-3 py-2 text-sm hover:bg-muted">Perguntas</a>
              <Button variant="ghost" className="justify-start" onClick={() => { navigate('/login'); closeMenu(); }}>Entrar</Button>
              <Button asChild className="mt-1"><a href="#contato" onClick={closeMenu}>Conversar com a equipe</a></Button>
            </div>
          </nav>
        )}
      </header>

      <section id="inicio" className="overflow-hidden border-b bg-[#f4f8f7]">
        <div className="mx-auto grid min-h-[620px] max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="max-w-2xl">
            <p className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              Gestão para organizações com membros
            </p>
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Mais organização para quem move a comunidade.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Pessoas, estrutura e atividades conectadas em uma plataforma configurada para a realidade da sua organização.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <a href="#contato">Quero conhecer o UseAyni <ArrowRight className="size-4" /></a>
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
                Acessar minha organização
              </Button>
            </div>
            <p className="mt-4 text-sm text-slate-500">Planos e recursos são definidos conforme o contexto de cada organização.</p>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:justify-self-end">
            <div className="absolute -inset-5 -z-10 rounded-[2rem] bg-emerald-900/10 blur-2xl" />
            <Card className="overflow-hidden border-slate-200 bg-white shadow-xl shadow-slate-900/10">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <div className="flex items-center gap-3">
                  <img src="/Ayni.svg" alt="" className="h-7 w-auto" />
                  <span className="h-5 w-px bg-slate-200" />
                  <span className="text-sm font-medium text-slate-700">Painel da organização</span>
                </div>
                <span className="size-2 rounded-full bg-emerald-500" aria-label="Plataforma" />
              </div>
              <CardContent className="p-5 sm:p-6">
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Visão da equipe</p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight">Tudo em contexto</h2>
                  </div>
                  <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">Por organização</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { icon: UsersRound, title: 'Pessoas', detail: 'Cadastros e vínculos' },
                    { icon: GitBranch, title: 'Estrutura', detail: 'Unidades e responsabilidades' },
                    { icon: CalendarDays, title: 'Eventos', detail: 'Inscrições e presença' },
                    { icon: ClipboardList, title: 'Atividades', detail: 'Projetos e acompanhamento' },
                  ].map(({ icon: Icon, title, detail }) => (
                    <div key={title} className="flex min-h-24 items-start gap-3 rounded-lg border bg-slate-50/70 p-4">
                      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-white text-emerald-800 shadow-sm ring-1 ring-slate-200">
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-slate-900">{title}</span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">{detail}</span>
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-start gap-3 rounded-lg border border-emerald-900/10 bg-emerald-50/70 p-4">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-800" />
                  <p className="text-sm leading-6 text-emerald-950">Módulos e permissões acompanham a estrutura de cada organização.</p>
                </div>
              </CardContent>
            </Card>
            <p className="mt-3 text-center text-xs text-slate-500">Uma visão ilustrativa dos espaços disponíveis na plataforma.</p>
          </div>
        </div>
      </section>

      <section id="produto" className="border-b py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-emerald-800">Uma base comum para o trabalho da organização</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">Menos informação espalhada. Mais clareza no dia a dia.</h2>
          </div>
          <div className="space-y-5 text-base leading-7 text-slate-600">
            <p>O UseAyni reúne os fluxos que ajudam uma organização a cuidar das pessoas, organizar responsabilidades e acompanhar iniciativas.</p>
            <p>Administradores configuram a estrutura e os módulos disponíveis. Membros acessam seus próprios espaços e participações, conforme os vínculos e permissões definidos.</p>
            <p>O resultado é um ambiente de trabalho compartilhado, sem presumir que todas as organizações funcionem do mesmo jeito.</p>
          </div>
        </div>
      </section>

      <section id="recursos" className="border-b bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold text-emerald-800">Recursos da plataforma</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">O essencial para coordenar pessoas e iniciativas.</h2>
            <p className="mt-4 leading-7 text-slate-600">A disponibilidade de cada módulo pode variar conforme o plano contratado e a configuração da organização.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {productAreas.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="border-slate-200 bg-white shadow-none">
                <CardHeader className="pb-3">
                  <span className="mb-2 grid size-10 place-items-center rounded-md bg-emerald-50 text-emerald-800">
                    <Icon className="size-5" />
                  </span>
                  <CardTitle className="text-lg">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-6">{description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="perguntas" className="border-b py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="text-sm font-semibold text-emerald-800">Dúvidas comuns</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Antes de conversar.</h2>
          </div>
          <div className="divide-y">
            {faqItems.map((item) => (
              <details key={item.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-medium text-slate-900 [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <ChevronDown className="size-4 shrink-0 text-slate-500 transition-transform group-open:rotate-180" />
                </summary>
                <p className="max-w-2xl pt-3 pr-8 text-sm leading-6 text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="contato" className="bg-[#123f38] text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="max-w-lg">
            <p className="text-sm font-semibold text-emerald-200">Vamos conversar</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">Conte um pouco sobre sua organização.</h2>
            <p className="mt-5 leading-7 text-emerald-50/80">Nossa equipe pode apresentar os recursos, entender seu contexto e conversar sobre planos e próximos passos.</p>
            {contactEmail && (
              <a className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white underline decoration-white/40 underline-offset-4 hover:decoration-white" href={`mailto:${contactEmail}`}>
                <Mail className="size-4" /> {contactEmail}
              </a>
            )}
          </div>
          <Card className="border-white/15 bg-white text-slate-950 shadow-xl">
            <CardHeader>
              <CardTitle>Solicite uma conversa</CardTitle>
              <CardDescription>{contactEmail
                ? 'Ao enviar, seu aplicativo de email será aberto com a mensagem preparada. O site não envia nem armazena este formulário.'
                : 'O canal de contato comercial ainda não está configurado.'}</CardDescription>
            </CardHeader>
            <CardContent>
              {contactEmail ? (
                <form className="grid gap-4" onSubmit={submitContact}>
                  <label className="grid gap-1.5 text-sm font-medium" htmlFor="contact-name">
                    Seu nome
                    <Input id="contact-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
                  </label>
                  <label className="grid gap-1.5 text-sm font-medium" htmlFor="contact-organization">
                    Organização
                    <Input id="contact-organization" value={organization} onChange={(event) => setOrganization(event.target.value)} autoComplete="organization" required />
                  </label>
                  <label className="grid gap-1.5 text-sm font-medium" htmlFor="contact-email">
                    Email para retorno
                    <Input id="contact-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
                  </label>
                  <label className="grid gap-1.5 text-sm font-medium" htmlFor="contact-message">
                    O que você precisa organizar?
                    <Textarea id="contact-message" value={message} onChange={(event) => setMessage(event.target.value)} className="min-h-24 resize-y" required />
                  </label>
                  <Button type="submit" className="w-full">Preparar email para a equipe <ArrowRight className="size-4" /></Button>
                </form>
              ) : (
                <p role="status" className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                  Para ativar o contato comercial, configure o email público da equipe no ambiente de publicação.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="bg-slate-950 text-slate-300">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1fr_auto_auto]">
          <div className="max-w-sm">
            <img src="/Ayni.svg" alt="UseAyni" className="h-9 w-auto brightness-0 invert" />
            <p className="mt-4 text-sm leading-6 text-slate-400">Tecnologia para organizações que precisam coordenar pessoas, responsabilidades e iniciativas.</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Plataforma</h2>
            <div className="mt-3 flex flex-col gap-2 text-sm text-slate-400">
              <a href="#produto" className="hover:text-white">Visão geral</a>
              <a href="#recursos" className="hover:text-white">Recursos</a>
              <Link to="/login" className="hover:text-white">Entrar</Link>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Informações legais</h2>
            <div className="mt-3 flex flex-col gap-2 text-sm text-slate-400">
              <Link to="/politica-de-privacidade" className="hover:text-white">Política de Privacidade</Link>
              <Link to="/termos-de-uso" className="hover:text-white">Termos de Uso</Link>
              {contactEmail && <a href={`mailto:${contactEmail}`} className="hover:text-white">Contato</a>}
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <p className="mx-auto max-w-7xl px-5 py-5 text-xs text-slate-500 sm:px-8">© {new Date().getFullYear()} UseAyni. Todos os direitos reservados.</p>
        </div>
      </footer>
    </main>
  );
}