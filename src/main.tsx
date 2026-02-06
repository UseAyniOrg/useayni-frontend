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
    <main className="ayni-home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <span className="badge">Plataforma do creaJR</span>
          <h1>
            Ayni — tecnologia para integrar, colaborar e evoluir
            <br />a engenharia universitária do Paraná
          </h1>
          <p>
            Uma plataforma unificada para gestão de projetos, equipes e
            aprendizado prático, conectando alunos, coordenações e o futuro
            profissional.
          </p>

          <div className="hero-actions">
            <Button size="lg" onClick={() => navigate("/credenciais")}>
              Entrar na plataforma
            </Button>
            <Button size="lg" variant="outline">
              Conhecer o projeto
            </Button>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="section muted">
        <h2>O problema que enfrentamos hoje</h2>
        <p className="section-text">
          Projetos descentralizados, informações espalhadas, retrabalho
          administrativo e pouca visibilidade real do desenvolvimento dos
          alunos. A gestão acadêmica sofre, e o potencial dos estudantes se
          perde no caminho.
        </p>
      </section>

      {/* O QUE É O AYNI */}
      <section className="section">
        <h2>O que é o Ayni?</h2>
        <p className="section-text">
          O Ayni é uma plataforma integrada de gestão e colaboração voltada para
          alunos de engenharia. Ele centraliza projetos, equipes, documentação,
          métricas e aprendizado prático em um único ambiente acessível,
          transparente e orientado a dados.
        </p>
      </section>

      {/* FUNCIONALIDADES */}
      <section className="section section grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="feature">
          <Users />
          <h3>Gestão de equipes</h3>
          <p>
            Times, permissões, perfis e planos organizados para refletir a
            realidade acadêmica e profissional.
          </p>
        </div>

        <div className="feature">
          <LayoutDashboard />
          <h3>Projetos e boards</h3>
          <p>
            Espaços de projeto com templates, artefatos, entregas e histórico
            completo de evolução.
          </p>
        </div>

        <div className="feature">
          <Layers />
          <h3>Playground colaborativo</h3>
          <p>
            Ambiente para experimentação, iteração e aprendizado prático com
            rastreabilidade.
          </p>
        </div>

        <div className="feature">
          <FileText />
          <h3>Documentação central</h3>
          <p>
            Tutoriais, guias, changelog e documentação viva integrada ao fluxo
            do projeto.
          </p>
        </div>

        <div className="feature">
          <BarChart3 />
          <h3>Métricas e painéis</h3>
          <p>
            Dados reais de progresso, uso de recursos e desempenho para tomada
            de decisão.
          </p>
        </div>

        <div className="feature">
          <Rocket />
          <h3>Preparação profissional</h3>
          <p>
            Portfólios, histórico de projetos e evidências reais de competência
            para o mercado.
          </p>
        </div>
      </section>

      {/* IMPACTO */}
      <section className="section muted">
        <h2>Impacto esperado</h2>
        <ul className="impact-list">
          <li>✔ Mais eficiência na gestão acadêmica</li>
          <li>✔ Maior engajamento e qualidade nas entregas</li>
          <li>✔ Alunos preparados para ambientes profissionais reais</li>
          <li>✔ Decisões orientadas por dados</li>
        </ul>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Construído para o presente. Pensado para o futuro.</h2>
        <p>
          O Ayni nasce dentro do creaJR para se tornar o ecossistema digital da
          engenharia universitária.
        </p>
        <Button size="lg">Participar do piloto</Button>
      </section>
    </main>
  );
}
