# Plano de tabelas, busca e paginacao

Escopo: aplicacao Ayni (`src/pages` e listas reutilizaveis em `src/components`).
Nao altera permissoes nem os contratos existentes das APIs.

## Regras

- Listas operacionais usam tabela, busca antes de paginar e 10/25/50/100 itens por pagina.
- Controles exibem intervalo, total, pagina atual, primeira/anterior/proxima/ultima pagina.
- Alterar busca ou tamanho retorna a primeira pagina; remover itens limita a pagina ao total restante.
- Busca textual ignora acentos e caixa. Acoes, detalhes e campos existentes sao preservados.
- Tabelas possuem cabecalhos acessiveis e rolagem horizontal em telas pequenas.
- Paginacao local nao reduz o volume baixado da API. Onde ja existe paginacao remota, ela e mantida.
- Formularios, editores ordenaveis e menus nao sao listas de consulta: nao paginar campos nem perder contexto de edicao.

## Mapeamento e ordem de execucao

| Etapa | Local | Aplicacao |
| --- | --- | --- |
| 1 | Leitor QR da presenca | Camera continua, processamento serial, bloqueio de QR repetido, parada explicita e limpeza ao sair |
| 2 | Presencas por sessao | Tabela por nome cadastrado, busca sem acentos, status e checkbox de presenca, paginacao local |
| 2 | Sessoes de presenca do gestor | Busca e paginacao das sessoes, mantendo painel de leitura e exclusao confirmada |
| 2 | Minha presenca no evento publico | Paginacao das sessoes; manter QR individual em painel proprio |
| 3 | Pessoas da miscelanea | Manter filtros avancados, ordenacao, detalhes e paginacao existentes; padronizar controles |
| 3 | Inscricoes externas | Mesmo componente de Pessoas, mantendo todos os dados e acoes |
| 3 | Solicitacoes de participacao | Tabela com pessoa, titulo, mensagem, data, status e acoes; busca e paginacao |
| 3 | Convites pendentes | Tabela com nome, vencimento, status e cancelamento; busca e paginacao |
| 3 | Lista de espera | Tabela com posicao, pessoa, data e promocao; busca e paginacao sem reordenar a fila |
| 3 | Miscelaneas filhas | Tabela unificada com tipo, titulo, status, data e acesso; busca e paginacao |
| 4 | Gestao administrativa de membros: todos/pendentes | Tabelas independentes com nome, email, status, papeis e acoes; busca e paginacao |
| 4 | Gestao legada de papeis | Tabela de membros; manter dialogo de papeis e permissoes |
| 4 | Aprovacoes de cadastro | Tabela com contatos, dados academicos e acoes; preservar editar/aprovar/rejeitar |
| 5 | Listagem de miscelaneas | Tabela operacional e controles de pagina/tamanho; manter filtros e paginacao no servidor |
| 5 | Meus eventos | Tabela com evento, data, inscricao e acesso; busca e paginacao |
| 6 | Plataforma: organizacoes | Tabela existente com busca e paginacao local |
| 6 | Plataforma: resultados de importacao | Tabela paginada com email, resultado, senha temporaria e reemissao preservados |
| 6 | Plataforma: historico de alteracoes | Tabela paginada com ator, ID, acao, rota, motivo e data |
| 6 | Hierarquia: cargos | Tabela com tipo de unidade, investidura, duracao, suplencia, papeis e edicao |
| 6 | Hierarquia: mandatos gerais/por unidade | Tabelas paginadas com membro, cargo, unidade, datas, status e acoes |
| 6 | Hierarquia: unidades | Manter arvore para contexto pai/filho e adicionar consulta tabular paginada de todas as unidades |
| 7 | Seletor de padrinho | Ja possui tabela, busca e paginacao; preservar |
| 7 | Buscadores de membros/miscelaneas/autocompletes | Preservar escolha contextual e busca; limitar/paginar resultados carregados onde nao ha limite remoto |

## Excecoes deliberadas

- Pagina publica da organizacao: hero, galeria, patrocinadores, links e noticias sao conteudo editorial, nao cadastros administrativos.
- Editores de pagina publica, perfis, campos de cadastro, regras de escopo e formularios: campos/itens precisam permanecer no contexto de edicao e ordenacao.
- Navegacao, abas, badges de papeis e opcoes finitas de configuracao nao recebem paginacao.
- Paginas de metas, historico, planejamento e tarefas sem listagem implementada nao recebem uma tabela ficticia.
- Paginacao remota nova para endpoints que retornam arrays exige contrato coordenado com todos os consumidores; nao mudar silenciosamente o formato da API nesta entrega.

## Verificacao

- Testes de QR continuo, duplicatas, requisicoes concorrentes e liberacao da camera.
- Testes puros de busca, limites, pagina vazia, mudanca de tamanho e reducao de resultados.
- Testes no navegador para busca por nome, multiplos check-ins, pagina seguinte, busca em paginas posteriores e layout mobile.
- Typecheck, testes existentes e build de producao.

## Andamento

- Etapas 1 a 7 concluidas, respeitando as excecoes e os limites de API descritos acima.
- Buscadores de membros e miscelaneas preservam os limites remotos de 10 e 8 resultados; o padrinho preserva 5 itens por pagina.
- O seletor generico sem limite remoto recebeu busca sem acentos e paginacao, mantendo foco e selecao entre paginas.

## Resultado da verificacao

- `npm run test:registration-flow`: 10 testes aprovados, incluindo QR continuo, pausa, falha de validacao, duplicatas, limpeza de stream, tabela e limites de paginacao.
- `npm run test:access-context`: 6 testes aprovados.
- `tsc --noEmit` e `npm run build`: aprovados. Permanecem os avisos existentes de Browserslist, anotacoes do Zod e tamanho de bundle.
- Navegador com 61 pessoas e 31 sessoes: nome fora da primeira pagina localizado por busca sem acentos, retorno a primeira pagina ao filtrar, tamanhos de pagina e navegacao verificados.
- Camera simulada: tres presencas com uma unica abertura, sem repetir o mesmo QR, continuando apos token invalido e liberando a camera ao parar.
- Reducao de 61 para 3 registros corrigiu automaticamente a pagina visivel.
- Seletor com 61 opcoes: proxima pagina, busca sem acentos, escolha e fechamento verificados.
- Presenca revisada visualmente em desktop e verificada em viewport mobile de 390 px, sem extravasamento horizontal da pagina.
- Nao foram feitas operacoes em dados reais nem validada uma camera fisica. Permissoes e disponibilidade da camera continuam dependendo do dispositivo e de HTTPS/localhost.