import "./style.css";
import { Button } from "./components/ui/button";
import {
  Users,
  LayoutDashboard,
  FileText,
  BarChart3,
  Rocket,
  Layers,
} from "lucide-react";
import { useNavigate } from "react-router-dom";



export default function Main() {
  const navigate = useNavigate();
  return (
    <main className="ayni-home absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_60%) ">
      <section className="relative w-full h-screen flex items-center justify-center bg-gradient-to-br from-black via-slate-900 to-black text-white overflow-hidden">

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />


        <div className="relative z-10 max-w-4xl px-6 text-center flex flex-col items-center">
          <div className="w-44 mb-6">
            <img src="/AyniLogoHero.png" alt="Ayni Hero" draggable={false} />
          </div>

          <span className="mb-4 text-xs tracking-widest uppercase text-gray-400 border border-gray-700 px-3 py-1 rounded-full">
            Plataforma do CREA JR
          </span>

          <h1 className="text-4xl md:text-5xl font-semibold leading-tight mb-6 zilap-futuria">
            Tecnologia para integrar
            <br />
            colaborar e evoluir a
            <br />
            engenharia universitaria
          </h1>

          <p className="text-gray-400 max-w-2xl text-lg mb-10 leading-relaxed">
            Uma plataforma unificada para gestão de projetos, equipes e aprendizado prático,
            conectando alunos, coordenações e o futuro profissional da engenharia.
          </p>

          <div className="flex gap-4 flex-wrap justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/credenciais")}
              className="bg-gradient-to-r from-slate-200 to-white text-black font-medium px-8 py-6 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
            >
              Entrar na plataforma
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="px-8 py-6 rounded-xl border border-gray-700 text-gray-300 backdrop-blur-md bg-white/5 hover:bg-white/10 hover:border-gray-500 hover:text-white transition-all duration-300"
            >
              Conhecer o projeto
            </Button>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}

      <section className="relative py-20 px-6 bg-[#00030a] flex flex-row justify-center border-t border-gray-800 overflow-hidden">
        <div className="relative py-24 px-6 w-[40%]">
          <div className="max-w-4xl mx-auto text-center">

            <span className="text-xs tracking-widest uppercase text-white">
              Contexto
            </span>

            <h2 className="text-3xl md:text-4xl font-semibold mt-4 mb-6 text-white">
              O problema que enfrentamos hoje
            </h2>

            <p className="text-gray-400 text-lg leading-relaxed">
              Projetos descentralizados, informações espalhadas e retrabalho administrativo
              comprometem a eficiência. A gestão acadêmica perde visibilidade e o potencial
              dos alunos acaba sendo subutilizado ao longo do processo.
            </p>
          </div>
        </div>

        {/* O QUE É */}
        <div className="relative py-24 px-6 w-[40%]">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-xs tracking-widest uppercase text-white">
              Solução
            </span>

            <h2 className="text-3xl md:text-4xl font-semibold mt-4 mb-6 text-white">
              O que é o Ayni?
            </h2>

            <p className="text-gray-400 text-lg leading-relaxed">
              O Ayni é uma plataforma integrada de gestão e colaboração para engenharia,
              centralizando projetos, equipes, documentação e métricas em um único ambiente.
              Um ecossistema acessível, transparente e orientado a dados.
            </p>
          </div>
        </div>
      </section>

      {/* MISSÃO */}
      <section className="relative py-28 px-6 bg-[#00030a] flex flex-row justify-center overflow-hidden">

        {/* fundo decorativo */}
       <div className="absolute left-[-400px] top-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full overflow-hidden border border-blue-500/20 shadow-2xl">
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.7),rgba(255,255,255,0.2)_40%,transparent_75%)] blur-2xl opacity-80" />
          <img
            src="/images/creajr.png"
            alt="Comunidade CREA Jr"
            className="relative z-10 w-full h-full object-cover"
          />

        </div>

        <div className="relative z-10 max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          {/* LEFT - CARDS */}
          <div className="relative flex flex-col items-center gap-6">

            {/* MISSÃO */}
            <div className="w-64 p-6 ">
              <h3 className="text-blue-400 text-sm tracking-widest mb-2">MISSÃO</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Conectar acadêmicos de engenharia do Paraná em uma rede colaborativa,
                fortalecendo comunidades e ampliando oportunidades.
              </p>
            </div>

            {/* VISÃO */}
            <div className="w-64 p-6  translate-x-10">
              <h3 className="text-blue-400 text-sm tracking-widest mb-2">VISÃO</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Ser a principal rede de integração da engenharia universitária no Paraná,
                conectando pessoas, ideias e iniciativas.
              </p>
            </div>

            {/* VALORES */}
            <div className="w-64 p-6 -translate-x-10">
              <h3 className="text-blue-400 text-sm tracking-widest mb-2">VALORES</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Colaboração, protagonismo, transparência e crescimento coletivo como base
                da construção da rede.
              </p>
            </div>

          </div>

          {/* RIGHT - TEXTO PRINCIPAL */}
          <div className="text-center md:text-left">

            <span className="text-xs tracking-widest uppercase text-gray-500">
              Institucional
            </span>

            <h2 className="text-4xl md:text-5xl font-semibold mt-4 mb-6 text-white leading-tight">
              A base que sustenta
              <br />
              o UseAyni
            </h2>

            <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
              O UseAyni nasce com o propósito de integrar o ecossistema do CREA Jr,
              transformando comunidades isoladas em uma rede conectada, organizada e
              ativa. Mais do que uma plataforma, é uma estrutura para fortalecer a
              engenharia universitária e ampliar seu impacto em todo o Paraná.
            </p>

          </div>

        </div>

      </section>
      {/* FUNCIONALIDADES */}
      <section className="relative py-10 px-6 bg-[#00030a] flex flex-col items-center">

        <div className="max-w-6xl mx-auto text-center mb-16">
          <span className="text-xs tracking-widest uppercase text-white">
            Plataforma
          </span>

          <h2 className="text-3xl md:text-4xl font-semibold mt-4 text-white">
            Funcionalidades principais
          </h2>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* CARD */}
          <div className="group p-6 rounded-2xl border border-gray-800 bg-white/5 backdrop-blur-md hover:border-gray-600 transition-all duration-300">
            <Users className="mb-4 text-gray-300 group-hover:text-white transition" />
            <h3 className="text-lg font-medium mb-2 text-white">Gestão de equipes</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Times, permissões e perfis organizados para refletir a realidade acadêmica e profissional.
            </p>
          </div>

          <div className="group p-6 rounded-2xl border border-gray-800 bg-white/5 backdrop-blur-md hover:border-gray-600 transition-all duration-300">
            <LayoutDashboard className="mb-4 text-gray-300 group-hover:text-white transition" />
            <h3 className="text-lg font-medium mb-2 text-white">Projetos e boards</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Espaços com templates, entregas e histórico completo de evolução.
            </p>
          </div>

          <div className="group p-6 rounded-2xl border border-gray-800 bg-white/5 backdrop-blur-md hover:border-gray-600 transition-all duration-300">
            <Layers className="mb-4 text-gray-300 group-hover:text-white transition" />
            <h3 className="text-lg font-medium mb-2 text-white  ">Playground colaborativo</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Ambiente para experimentação e aprendizado prático com rastreabilidade.
            </p>
          </div>

          <div className="group p-6 rounded-2xl border border-gray-800 bg-white/5 backdrop-blur-md hover:border-gray-600 transition-all duration-300">
            <FileText className="mb-4 text-gray-300 group-hover:text-white transition" />
            <h3 className="text-lg font-medium mb-2 text-white">Documentação central</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Guias, tutoriais e documentação viva integrada ao fluxo do projeto.
            </p>
          </div>

          <div className="group p-6 rounded-2xl border border-gray-800 bg-white/5 backdrop-blur-md hover:border-gray-600 transition-all duration-300">
            <BarChart3 className="mb-4 text-gray-300 group-hover:text-white transition" />
            <h3 className="text-lg font-medium mb-2 text-white  ">Métricas e painéis</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Dados reais de progresso e desempenho para tomada de decisão.
            </p>
          </div>

          <div className="group p-6 rounded-2xl border border-gray-800 bg-white/5 backdrop-blur-md hover:border-gray-600 transition-all duration-300">
            <Rocket className="mb-4 text-gray-300 group-hover:text-white transition" />
            <h3 className="text-lg font-medium mb-2 text-white">Preparação profissional</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Portfólios e histórico de projetos com evidências reais para o mercado.
            </p>
          </div>

        </div>
      </section>

      <div className="bg-black text-white">

        {/* IMPACTO */}
        <section className="relative py-24 px-6 bg-[#00030a]">

          <div className="max-w-5xl mx-auto text-center mb-16">
            <span className="text-xs tracking-widest uppercase text-gray-500">
              Resultado
            </span>

            <h2 className="text-3xl md:text-4xl font-semibold mt-4">
              Impacto esperado
            </h2>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">

            {[
              "Mais eficiência na gestão acadêmica",
              "Maior engajamento e qualidade nas entregas",
              "Alunos preparados para ambientes profissionais reais",
              "Decisões orientadas por dados",
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-6 rounded-2xl border border-gray-800 bg-white/5 backdrop-blur-md hover:border-gray-600 transition-all duration-300"
              >
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-white/10 text-sm">
                  ✓
                </div>

                <p className="text-gray-300 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="relative py-28 px-6 overflow-hidden bg-[#00030a]">

          {/* glow sutil de fundo */}

          <div className="relative z-10 max-w-4xl mx-auto text-center">

            <h2 className="text-3xl md:text-5xl font-semibold leading-tight mb-6">
              Construído para o presente.
              <br />
              Pensado para o futuro.
            </h2>

            <p className="text-gray-400 text-lg mb-10 leading-relaxed">
              O Ayni nasce dentro do CREA JR para se tornar o ecossistema digital da
              engenharia universitária.
            </p>

            <Button
              size="lg"
              className="bg-gradient-to-r from-slate-200 to-white text-black font-medium px-10 py-6 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.03] transition-all duration-300"
            >
              Participar do piloto
            </Button>

            {/* detalhe visual inferior */}
            <div className="mt-12 text-xs text-gray-500 tracking-wide">
              Vagas limitadas para instituições parceiras
            </div>
          </div>
        </section>

      </div>

      <footer className="relative border-t border-gray-900 bg-[#00030a] text-gray-300 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="flex items-center gap-4">
              <img src="/AyniLogoHero.png" alt="Ayni" className="w-28" />
              <div>
                <p className="text-white font-semibold">Ayni</p>
                <p className="text-sm text-gray-400">Plataforma do CREA JR</p>
              </div>
            </div>

            <div className="flex gap-8">
              <div>
                <h4 className="text-sm text-gray-400 mb-2">Navegação</h4>
                <ul className="text-sm space-y-2">
                  <li>
                    <a href="/credenciais" className="hover:text-white">
                      Entrar
                    </a>
                  </li>
                  <li>
                    <a href="#funcionalidades" className="hover:text-white">
                      Funcionalidades
                    </a>
                  </li>
                  <li>
                    <a href="#impacto" className="hover:text-white">
                      Impacto
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm text-gray-400 mb-2">Contato</h4>
                <p className="text-sm">contato@creajr.edu.br</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-12 text-sm text-gray-500 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>© {new Date().getFullYear()} Ayni — Todos os direitos reservados</div>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white">
                Política de Privacidade
              </a>
              <a href="#" className="hover:text-white">
                Termos
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
