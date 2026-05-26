import "./style.css";
import { Button } from "./components/ui/button";
import {
  Users,
  LayoutDashboard,
  FileText,
  BarChart3,
  Rocket,
  Layers,
  Menu,
  X,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

export default function Main() {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: -999, y: -999 });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const heroSectionRef = useRef<HTMLDivElement>(null);

  const faqItems = [
    {
      question: "O que é o Ayni e quem pode participar?",
      answer: "O Ayni é uma plataforma integrada de gestão de projetos, equipes e aprendizado prático desenvolvida especificamente para o ecossistema do CREA Jr. Podem participar estudantes de engenharias, coordenações de cursos parceiros e líderes regionais.",
    },
    {
      question: "Como o Ayni ajuda na minha preparação profissional?",
      answer: "A plataforma gera um portfólio curricular com evidências reais de suas atividades acadêmicas e de liderança, consolidando seus projetos concluídos de maneira transparente para que você possa se destacar em processos seletivos.",
    },
    {
      question: "A plataforma é gratuita para as instituições parceiras?",
      answer: "Sim! O Ayni é totalmente gratuito para os acadêmicos de engenharia e instituições conveniadas ao CREA Jr, funcionando como uma rede pública colaborativa focada em evolução mútua.",
    },
    {
      question: "Como posso participar do projeto piloto?",
      answer: "Para aderir ao piloto ou cadastrar a sua instituição regional parceira, basta clicar no botão 'Participar do Piloto' no topo ou rodapé da página e preencher os dados de contato que nossa equipe fará o agendamento.",
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Otimização: Só rodar em telas maiores (desktop) para economizar performance em celulares
      if (window.innerWidth > 768 && heroSectionRef.current) {
        const rect = heroSectionRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    const heroSection = heroSectionRef.current;
    if (heroSection) {
      heroSection.addEventListener("mousemove", handleMouseMove);
      return () => heroSection.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  return (
    <main className="relative min-h-screen w-full bg-[#020617] text-slate-100 overflow-x-hidden selection:bg-blue-500/30 selection:text-blue-200">
      {/* Aurora Glow Effects - Alta fidelidade e sutil */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute top-1/3 right-10 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none animate-drift-slow" />

      {/* Header Sticky Glassmorphic */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-slate-950/80 border-b border-white/10 backdrop-blur-md py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo Ayni */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <img
              src="/AyniLogoHero.png"
              alt="Ayni Logo"
              className="h-8 md:h-10 w-auto hover:scale-105 transition-transform duration-300"
              draggable={false}
            />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <a
              href="#sobre"
              className="hover:text-white transition-colors duration-200 relative group py-1"
            >
              Sobre
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full" />
            </a>
            <a
              href="#funcionalidades"
              className="hover:text-white transition-colors duration-200 relative group py-1"
            >
              Recursos
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full" />
            </a>
            <a
              href="#impacto"
              className="hover:text-white transition-colors duration-200 relative group py-1"
            >
              Impacto
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full" />
            </a>
            <a
              href="#faq"
              className="hover:text-white transition-colors duration-200 relative group py-1"
            >
              FAQ
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full" />
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => navigate("/login")}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200"
            >
              Entrar
            </button>
            <Button
              size="sm"
              onClick={() => navigate("/login")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-lg border border-blue-400/20 shadow-[0_0_15px_rgba(37,99,235,0.15)] hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:scale-[1.02] transition-all duration-300"
            >
              Participar do Piloto
            </Button>
          </div>

          {/* Mobile Hamburguer Toggle */}
          <button
            className="md:hidden text-gray-300 hover:text-white focus:outline-none p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-[72px] bg-slate-950/95 border-b border-white/10 backdrop-blur-lg flex flex-col py-6 px-6 gap-5 z-40 shadow-2xl animate-fade-in">
            <a
              href="#sobre"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-300 hover:text-white text-base font-medium py-1 transition-colors"
            >
              Sobre
            </a>
            <a
              href="#funcionalidades"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-300 hover:text-white text-base font-medium py-1 transition-colors"
            >
              Recursos
            </a>
            <a
              href="#impacto"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-300 hover:text-white text-base font-medium py-1 transition-colors"
            >
              Impacto
            </a>
            <a
              href="#faq"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-300 hover:text-white text-base font-medium py-1 transition-colors"
            >
              FAQ
            </a>
            <hr className="border-white/10 my-1" />
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  navigate("/login");
                  setIsMobileMenuOpen(false);
                }}
                className="text-gray-300 hover:text-white font-medium py-2.5 text-center rounded-lg hover:bg-white/5 transition-all"
              >
                Entrar
              </button>
              <Button
                onClick={() => {
                  navigate("/login");
                  setIsMobileMenuOpen(false);
                }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 rounded-xl border border-blue-400/20 text-center"
              >
                Participar do Piloto
              </Button>
            </div>
          </div>
        )}
      </header>

      <section
        ref={heroSectionRef}
        className="relative w-full min-h-screen pt-28 pb-16 flex items-center justify-center bg-gradient-to-tr from-slate-950 via-slate-900 to-[#02020f] text-white overflow-hidden"
      >
        {/* Mouse Follow Glow - Desativado em mobile por performance */}
        <div
          className={`absolute pointer-events-none w-[450px] h-[450px] rounded-full blur-3xl transition-opacity duration-500 ${
            mousePosition.x === -999 ? "opacity-0" : "opacity-25"
          }`}
          style={{
            background:
              "radial-gradient(circle, rgba(14, 121, 178, 0.4) 0%, rgba(59, 130, 246, 0.1) 50%, transparent 70%)",
            left: `${mousePosition.x}px`,
            top: `${mousePosition.y}px`,
            transform: "translate(-50%, -50%)",
          }}
        />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-70" />

        <div className="relative z-10 max-w-4xl px-6 text-center flex flex-col items-center">
          <div className="w-36 md:w-44 mb-8">
            <img
              src="/AyniLogoHero.png"
              alt="Ayni Hero"
              draggable={false}
              className="w-full h-auto"
            />
          </div>

          <span className="mb-6 text-xs tracking-widest uppercase text-gray-400 border border-gray-700 px-3 py-1 rounded-full">
            Plataforma do CREA JR
          </span>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-6 zilap-futuria text-white">
            Tecnologia para{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(34,211,238,0.15)]">
              integrar
            </span>
            <br className="hidden sm:inline" />{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(14,121,178,0.15)]">
              colaborar
            </span>{" "}
            e{" "}
            <span className="bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(99,102,241,0.15)]">
              evoluir
            </span>
            <br />a engenharia universitaria
          </h1>

          <p className="text-gray-400 max-w-2xl text-sm sm:text-lg mb-10 leading-relaxed font-light">
            Uma plataforma unificada para gestão de projetos, equipes e aprendizado prático,
            conectando alunos, coordenações e o futuro profissional da engenharia.
          </p>

          <div className="flex gap-4 flex-wrap justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/login")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium px-8 py-6 rounded-xl shadow-[0_0_25px_rgba(37,99,235,0.25)] hover:shadow-[0_0_35px_rgba(37,99,235,0.45)] hover:scale-[1.03] transition-all duration-300 border border-blue-400/20"
            >
              Entrar na plataforma
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                document.getElementById("sobre")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-8 py-6 rounded-xl border border-white/10 text-gray-300 backdrop-blur-md bg-white/5 hover:bg-white/10 hover:border-white/30 hover:text-white transition-all duration-300"
            >
              Conhecer o projeto
            </Button>
          </div>
        </div>
      </section>

      {/* PROBLEMA E SOLUÇÃO */}
      <section
        id="sobre"
        className="relative py-24 px-6 bg-[#02020a] border-t border-white/5 overflow-hidden"
      >
        {/* Glow de fundo sutil */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 relative z-10">
          {/* O PROBLEMA CARD */}
          <div className="rounded-3xl p-8 md:p-12 flex flex-col justify-between relative overflow-hidden group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                <AlertTriangle size={22} className="text-cyan-400" />
              </div>
              <span className="text-xs font-semibold tracking-widest uppercase text-cyan-400">
                Contexto
              </span>
              <h3 className="text-2xl md:text-3xl font-bold mt-3 mb-5 text-white tracking-tight">
                O problema que enfrentamos hoje
              </h3>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed font-light">
                Projetos descentralizados, informações espalhadas e retrabalho administrativo
                comprometem a eficiência. A gestão acadêmica perde visibilidade e o potencial dos
                alunos acaba sendo subutilizado ao longo do processo.
              </p>
            </div>
          </div>

          {/* O QUE É CARD */}
          <div className="rounded-3xl p-8 md:p-12 flex flex-col justify-between relative overflow-hidden group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Sparkles size={22} className="text-blue-400" />
              </div>
              <span className="text-xs font-semibold tracking-widest uppercase text-blue-400">
                Solução
              </span>
              <h3 className="text-2xl md:text-3xl font-bold mt-3 mb-5 text-white tracking-tight">
                O que é o Ayni?
              </h3>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed font-light">
                O Ayni é uma plataforma integrada de gestão e colaboração para engenharia,
                centralizando projetos, equipes, documentação e métricas em um único ambiente. Um
                ecossistema acessível, transparente e orientado a dados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MISSÃO */}
      <section className="relative py-28 px-6 bg-[#02020a] border-t border-white/5">
        {/* Glow de fundo */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 items-center">
          {/* IMAGE */}
          <div className="flex justify-center lg:justify-start">
            <div className="w-[320px] h-[320px] md:w-[400px] md:h-[400px] relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500" />
              <div className="w-full h-full rounded-full overflow-hidden border border-white/10 shadow-2xl relative z-10">
                <img
                  src="/images/creajr.png"
                  alt="Comunidade CREA Jr"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  draggable={false}
                />
                <div className="absolute inset-0 rounded-full shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* MIDDLE - CARDS */}
          <div className="relative flex flex-col gap-6 w-full max-w-sm mx-auto">
            {/* MISSÃO */}
            <div className="w-full p-4 rounded-2xl relative group">
              <h3 className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-bold text-xs tracking-widest uppercase mb-2">
                MISSÃO
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed font-light">
                Conectar acadêmicos de engenharia do Paraná em uma rede colaborativa, fortalecendo
                comunidades e ampliando oportunidades.
              </p>
            </div>

            {/* VISÃO */}
            <div className="w-full p-4 rounded-2xl lg:translate-x-6 relative group">
              <h3 className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent font-bold text-xs tracking-widest uppercase mb-2">
                VISÃO
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed font-light">
                Ser a principal rede de integração da engenharia universitária no Paraná,
                conectando pessoas, ideias e iniciativas.
              </p>
            </div>

            {/* VALORES */}
            <div className="w-full p-4 rounded-2xl relative group">
              <h3 className="bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent font-bold text-xs tracking-widest uppercase mb-2">
                VALORES
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed font-light">
                Colaboração, protagonismo, transparência e crescimento coletivo como base da
                construção da rede.
              </p>
            </div>
          </div>

          {/* RIGHT - TEXTO PRINCIPAL */}
          <div className="text-center lg:text-left">
            <span className="text-xs tracking-widest uppercase text-cyan-500 font-semibold">
              Institucional
            </span>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-4 mb-6 text-white leading-tight tracking-tight zilap-futuria">
              A base que sustenta
              <br />
              o <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">UseAyni</span>
            </h2>

            <p className="text-gray-400 text-sm md:text-base leading-relaxed font-light">
              O UseAyni nasce com o propósito de integrar o ecossistema do CREA Jr, transformando
              comunidades isoladas em uma rede conectada, organizada e ativa. Mais do que uma
              plataforma, é uma estrutura para fortalecer a engenharia universitária e ampliar seu
              impacto em todo o Paraná.
            </p>
          </div>
        </div>
      </section>
      {/* FUNCIONALIDADES */}
      <section
        id="funcionalidades"
        className="relative py-28 px-6 bg-[#02020a] border-t border-white/5 flex flex-col items-center overflow-hidden"
      >
        {/* Glow de fundo sutil */}
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center mb-20 relative z-10">
          <span className="text-xs tracking-widest uppercase text-cyan-500 font-semibold">
            Plataforma
          </span>

          <h2 className="text-3xl md:text-5xl font-bold mt-4 mb-4 text-white tracking-tight zilap-futuria">
            Funcionalidades principais
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed font-light">
            Recursos completos integrados para planejar, gerenciar equipes, medir desempenho e
            preparar acadêmicos para os maiores desafios da engenharia real.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {/* GESTÃO DE EQUIPES */}
          <div className="glow-card group p-8 rounded-2xl border border-white/5 relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors duration-300" />
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 group-hover:text-cyan-400 group-hover:border-cyan-500/40 transition-all duration-300">
              <Users size={22} />
            </div>
            <h3 className="text-lg font-bold mb-3 text-white tracking-tight">Gestão de equipes</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-light">
              Times, permissões e perfis organizados com clareza para refletir perfeitamente a
              realidade acadêmica e profissional.
            </p>
          </div>

          {/* PROJETOS E BOARDS */}
          <div className="glow-card group p-8 rounded-2xl border border-white/5 relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors duration-300" />
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 group-hover:text-blue-400 group-hover:border-blue-500/40 transition-all duration-300">
              <LayoutDashboard size={22} />
            </div>
            <h3 className="text-lg font-bold mb-3 text-white tracking-tight">Projetos e boards</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-light">
              Espaços de trabalho modulares com templates ágeis, fluxos de entregas e histórico
              completo de evolução.
            </p>
          </div>

          {/* PLAYGROUND COLABORATIVO */}
          <div className="glow-card group p-8 rounded-2xl border border-white/5 relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-colors duration-300" />
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 group-hover:text-teal-300 group-hover:border-teal-500/40 transition-all duration-300">
              <Layers size={22} />
            </div>
            <h3 className="text-lg font-bold mb-3 text-white tracking-tight">
              Playground colaborativo
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed font-light">
              Ambiente dinâmico para experimentação técnica e aprendizado prático com alta
              rastreabilidade de ações.
            </p>
          </div>

          {/* DOCUMENTAÇÃO CENTRAL */}
          <div className="glow-card group p-8 rounded-2xl border border-white/5 relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors duration-300" />
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 group-hover:text-cyan-400 group-hover:border-cyan-500/40 transition-all duration-300">
              <FileText size={22} />
            </div>
            <h3 className="text-lg font-bold mb-3 text-white tracking-tight">
              Documentação central
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed font-light">
              Manuais estruturados, guias de boas práticas e documentação viva integrada ao fluxo de
              trabalho diário.
            </p>
          </div>

          {/* METRICAS E PAINÉIS */}
          <div className="glow-card group p-8 rounded-2xl border border-white/5 relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors duration-300" />
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 group-hover:text-blue-400 group-hover:border-blue-500/40 transition-all duration-300">
              <BarChart3 size={22} />
            </div>
            <h3 className="text-lg font-bold mb-3 text-white tracking-tight">Métricas e painéis</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-light">
              Dados consolidados de progresso, relatórios detalhados de atividades e painéis para
              apoio em decisões.
            </p>
          </div>

          {/* PREPARAÇÃO PROFISSIONAL */}
          <div className="glow-card group p-8 rounded-2xl border border-white/5 relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-colors duration-300" />
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 group-hover:text-teal-300 group-hover:border-teal-500/40 transition-all duration-300">
              <Rocket size={22} />
            </div>
            <h3 className="text-lg font-bold mb-3 text-white tracking-tight">
              Preparação profissional
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed font-light">
              Criação automática de portfólios curriculares com evidências validadas de atuação em
              projetos.
            </p>
          </div>
        </div>
      </section>

      {/* IMPACTO */}
      <section
        id="impacto"
        className="relative py-28 px-6 bg-[#02020a] border-t border-white/5 overflow-hidden"
      >
        {/* Glow de fundo sutil */}
        <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center mb-20 relative z-10">
          <span className="text-xs tracking-widest uppercase text-cyan-500 font-semibold">
            Resultados
          </span>

          <h2 className="text-3xl md:text-5xl font-bold mt-4 text-white tracking-tight zilap-futuria">
            Impacto esperado
          </h2>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {[
            "Mais eficiência na gestão acadêmica com fluxos de trabalho organizados",
            "Maior engajamento dos estudantes e alta qualidade nas entregas finais",
            "Alunos preparados com portfólios práticos para ambientes profissionais reais",
            "Decisões estratégicas orientadas por relatórios e métricas de dados reais",
          ].map((item, i) => (
            <div
              key={i}
              className="glow-card flex items-start gap-4 p-6 rounded-2xl border border-white/5 transition-all duration-300 group"
            >
              <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-xs group-hover:bg-cyan-500/20 group-hover:text-cyan-300 group-hover:border-cyan-500/50 transition-all duration-300 shadow-[0_0_10px_rgba(14,121,178,0.1)]">
                ✓
              </div>

              <p className="text-gray-300 text-sm md:text-base leading-relaxed font-light group-hover:text-white transition-colors duration-200">
                {item}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section
        id="faq"
        className="relative py-28 px-6 bg-[#02020a] border-t border-white/5 overflow-hidden"
      >
        {/* Glow de fundo sutil */}
        <div className="absolute top-1/2 left-10 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="text-xs tracking-widest uppercase text-cyan-500 font-semibold">
              Suporte
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mt-4 text-white tracking-tight zilap-futuria">
              Perguntas frequentes
            </h2>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="glow-card rounded-2xl overflow-hidden transition-all duration-300 border border-white/5"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none transition-colors duration-200"
                  >
                    <span className="text-white font-medium text-base md:text-lg pr-4">
                      {item.question}
                    </span>
                    <span className={`text-cyan-400 font-bold transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}>
                      <X size={20} className={isOpen ? "text-rose-400" : "text-cyan-400 rotate-45"} />
                    </span>
                  </button>
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? "max-h-[200px] opacity-100 border-t border-white/5" : "max-h-0 opacity-0 pointer-events-none"
                    }`}
                  >
                    <p className="px-6 py-5 text-gray-400 text-sm md:text-base leading-relaxed font-light bg-black/10">
                      {item.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-28 px-6 overflow-hidden bg-[#02020a] border-t border-white/5">
        {/* Glow de fundo sutil */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-6 zilap-futuria">
            Construido para o presente.
            <br />
            Pensado para o futuro.
          </h2>

          <p className="text-gray-400 text-sm sm:text-lg mb-10 leading-relaxed font-light max-w-2xl mx-auto">
            O Ayni nasce dentro do CREA JR para se tornar o ecossistema digital oficial da
            engenharia universitária do Paraná.
          </p>

          <Button
            size="lg"
            onClick={() => navigate("/login")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-10 py-6 rounded-xl shadow-[0_0_25px_rgba(37,99,235,0.25)] hover:shadow-[0_0_35px_rgba(37,99,235,0.45)] hover:scale-[1.03] transition-all duration-300 border border-blue-400/20"
          >
            Participar do piloto
          </Button>

          {/* detalhe visual inferior */}
          <div className="mt-12 text-xs text-gray-500 tracking-wide font-light">
            Vagas limitadas para instituições acadêmicas parceiras nesta regional
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative border-t border-white/5 bg-[#010105] text-gray-400 py-16">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Col 1: Logo & Desc */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <img src="/AyniLogoHero.png" alt="Ayni" className="h-10" />
              </div>
              <p className="text-sm text-gray-400 max-w-sm font-light leading-relaxed">
                Ayni é a plataforma digital do CREA JR Paraná construída para aproximar, integrar e alavancar a colaboração entre acadêmicos, coordenações de cursos e o mercado de engenharia.
              </p>
            </div>
            
            {/* Col 2: Navegação */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Navegação</h4>
              <ul className="text-sm space-y-2.5 font-light">
                <li><a href="#sobre" className="hover:text-white transition-colors">Sobre o Projeto</a></li>
                <li><a href="#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#impacto" className="hover:text-white transition-colors">Impacto Esperado</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">Perguntas Frequentes</a></li>
              </ul>
            </div>
            
            {/* Col 3: Newsletter Futurista */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Fique por dentro</h4>
              <p className="text-xs text-gray-400 font-light">
                Receba novidades e updates sobre o lançamento das vagas do piloto.
              </p>
              <div className="flex gap-2 w-full max-w-sm font-sans">
                <input
                  type="email"
                  placeholder="Seu e-mail acadêmico"
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50 w-full font-light"
                />
                <button 
                  onClick={() => alert("E-mail cadastrado com sucesso!")} 
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2.5 rounded-xl border border-blue-400/20 text-xs transition-colors shrink-0"
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>

          {/* Bottom section */}
          <div className="mt-16 pt-8 border-t border-white/5 text-xs text-gray-500 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>© {new Date().getFullYear()} Ayni — CREA JR Paraná. Todos os direitos reservados.</div>
            <div className="flex gap-6 font-light">
              <a href="#" className="hover:text-white transition-colors">Política de Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
