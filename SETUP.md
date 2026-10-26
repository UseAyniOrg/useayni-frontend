# Setup do Projeto - Ayni Frontend

## Acesso inicial e administração de organizações

- No SuperAdmin, crie e ative a organização. Na ficha, clique em **Emitir acesso
  de administrador** e entregue o email, a senha temporária e a URL de
  `/admin/login` da organização por um canal seguro. Apenas preencher o email
  na criação não cria acesso automaticamente.
- No primeiro acesso, o usuário confirma seu nome e define uma senha pessoal.
  Depois faz login novamente. Contas existentes mantêm a senha atual.
- `/admin/gestao-membros` usa a gestão de membros da organização, com criação de
  acesso por email disponível para administradores e suporte.
- A ficha do SuperAdmin aceita listas TXT/CSV de até 500 emails, mostra o
  resultado por linha e disponibiliza o modelo CSV. Não há envio automático
  de emails. Campos adicionais da planilha não são importados nesta versão.
- **Biblioteca e importação de hierarquias** permite selecionar, baixar,
  personalizar e importar JSON de centro acadêmico, entidade de classe ou
  associação comercial. A importação é aditiva e recusa slugs existentes,
  sem substituir estruturas.
- Ative o módulo Hierarquia e informe um motivo para **Gerenciar hierarquia,
  cargos e mandatos como suporte**. A sessão temporária é auditada.
- O backend precisa da migração `TemporaryPasswordSetup`. Consulte o contrato
  completo e as limitações em `API_ROUTES.md` no projeto backend.

## Editor da home pública

- Consulte [ARTES-PUBLICAS.md](ARTES-PUBLICAS.md) para as dimensoes recomendadas
  no Figma para a home publica e a pagina de evento.

- Administradores da organização editam a própria home; o SuperAdmin seleciona
  a organização. A sessão de suporte continua limitada à organização autorizada.
- As fontes Inter, Lato e Poppins são servidas localmente por pacotes Fontsource.
  A prévia usa a fonte e o logo selecionados, sem precisar salvar primeiro.
- Logo, favicon, banners, parceiros e imagem de compartilhamento aceitam PNG,
  JPEG e WebP. O frontend comprime as imagens e envia o conteúdo pela API.
  A organização precisa do módulo `media_storage`, de cota disponível e de R2
  configurado no backend. Credenciais nunca devem ser colocadas no frontend.
- Imagens de banners e parceiros exigem texto alternativo antes de publicar.
  Links externos e redes sociais usam HTTPS. Falhas mostram a mensagem e os
  campos informados pela API, em vez de apenas o código HTTP.
- Aguarde os uploads antes de salvar/publicar. A troca de organização também
  fica bloqueada durante o envio, para não associar imagens à organização errada.
- O salvamento envia `theme`, `seo`, `social_links`, `contact` e `sections`
  na raiz do payload. Favicon e metadados de compartilhamento são aplicados
  quando a home pública é carregada.
- Em desenvolvimento, o backend aceita origens HTTP de loopback e subdomínios
  `.localhost` em portas alternativas, incluindo 5180. Em produção, origens
  adicionais precisam de `ALLOWED_ORIGINS`; a liberação local automática não se aplica.
- Reinicie/reimplante o backend e execute `npm install` no frontend ao atualizar.
  O proxy/reverse proxy `/m/...` deve encaminhar as imagens públicas ao backend.

## Sessões independentes e divulgação de eventos

- **SuperAdmin:** `http://localhost:5173/admin/login`.
- **Admin da organização:** `http://creajrpr.localhost:5173/admin/login`.
- **Membro/comunidade:** `http://creajrpr.localhost:5173/login`.
- O mesmo email usa a mesma senha pessoal, mas cada acesso tem sua própria
  sessão e permissões. Entrar como membro não concede permissões administrativas;
  ser SuperAdmin não substitui o vínculo de admin na organização.
- Após atualizar, faça login novamente: sessões antigas sem contexto não são
  aceitas. Os cookies novos são separados por contexto e organização.
- No localhost, o suporte também pode usar `?org=<slug>`. A navegação mantém esse
  parâmetro; o localhost aberto diretamente, sem `org`, continua sendo a
  plataforma, mesmo depois de visitar outra organização.
- Miscelâneas criadas no suporte pertencem à organização selecionada e aparecem
  para seus administradores, que podem geri-las sem se adicionar como donos.
- Para divulgar um evento ativo, abra seu detalhe e clique em **Publicar
  inscrições**. Em **Ver página e compartilhar**, abra a apresentação pública
  com descrição, data, local, mídias, vagas e formulário.
- Visitantes escolhem entrar com conta existente, cadastrar-se como comunidade
  externa ou solicitar cadastro interno. O retorno ao evento é mantido após
  login/cadastro; cadastro interno pendente não é aprovado automaticamente.
- Usuários com sessão pessoal são reconhecidos e confirmam a participação sem
  informar a senha de novo. Inscrição existente, período fechado e lotação são
  apresentados explicitamente. O servidor confirma a disponibilidade no envio.
- Não há disparo de email neste fluxo.
- Links públicos abertos diretamente identificam a organização pelo endereço
  em cada requisição, sem depender do carregamento prévio da página inicial.
  Novos slugs de eventos normalizam acentos e separadores; URLs já publicadas
  são preservadas.

Validação: `npm run test:access-context` verifica resolução da URL, isolamento de
cookies, retorno seguro e domínio dos cookies em produção; `npm run build`
valida TypeScript e gera a aplicação.

## Presença por QR Code e tabelas de pessoas

- O participante abre a sessão de presença no evento (página pública autenticada
  ou detalhe interno) e apresenta o QR Code à equipe. O código só fica disponível
  para inscritos, durante uma sessão do tipo QR Code aberta.
- Na aba **Presença**, a equipe seleciona a sessão e usa **Ler QR Code pela câmera**.
  A câmera exige permissão e HTTPS ou localhost. Também é possível selecionar uma
  imagem do QR ou colar o código manualmente. O processamento da imagem é local.
- O servidor valida inscrição, sessão, prazo e uso único. Atualizar a página não
  invalida um código ainda válido; após confirmação, a presença fica registrada.
- As abas **Pessoas** e **Inscrições públicas** exibem tabelas. Clique no nome
  para abrir o detalhe; use a busca geral para procurar, por exemplo, `eng` em
  nomes, emails, tipos de cadastro e respostas. O contador mostra o total que
  corresponde aos filtros, não apenas a página atual.
- Combine filtros por campo (contém, não contém, igual, começa com,
  informado/não informado e intervalo de datas), ordene pelos cabeçalhos e
  escolha a quantidade por página. A busca ignora acentos e maiúsculas.
- Pessoas presentes nas listas de responsáveis e participantes aparecem uma
  única vez em **Pessoas**. Contatos, CPF e respostas são reservados à gestão;
  participantes comuns recebem apenas identidade básica e participação.

## Tipos de cadastro e reutilização de dados

- Admin e SuperAdmin configuram **Tipos de cadastro** em `/admin/perfis-externos`,
  usando o layout administrativo com sidebar. No SuperAdmin, selecione a organização.
  O admin da organização abre diretamente a gestão de miscelâneas, sem uma tela
  intermediária de atalhos; se o módulo estiver desabilitado, abre a gestão de membros.
- Cada tipo tem nome, descrição e campos próprios (texto, email, número, data,
  opções ou confirmação), opcionais ou obrigatórios. Exemplos: Básico, Universitário,
  Empresário. Nome/email já são básicos; telefone e CPF são opcionais (CPF segue
  obrigatório se uma configuração anterior da organização assim exigir).
  O CPF é validado pelos dígitos verificadores. O cadastro inclui confirmação de
  senha, e `-` é aceito como caractere especial.
  Não existe uma seleção acadêmica fixa adicional na inscrição pública.
  Os mesmos tipos aparecem em `/cadastro` e na inscrição dos eventos.
  A configuração é persistida nas configurações da organização, sem migração.
- Para reaproveitar uma informação entre organizações, mantenha a mesma chave
  estável, rótulo, formato e opções. Não use a mesma chave com outro significado.
  A pessoa vê os valores compatíveis preenchidos e completa os ausentes antes de
  autorizar o compartilhamento com a nova organização.
- A conta e senha são únicas. Login externo funciona em `/login`, inclusive
  quando a pessoa ainda não tem vínculo com a organização de destino.
  Esse acesso fica restrito às próprias inscrições até a inscrição criar seu vínculo
  de comunidade; não concede acesso interno ou administrativo.
- Após entrar, a pessoa externa acessa **Meus eventos** em `/minhas-inscricoes`.
  `/perfil-externo` apenas redireciona para essa lista, sem editor de perfil separado.
  Após uma inscrição, a página pública continua exibindo todas as informações do
  evento e não mostra um novo formulário de inscrição. O login retorna ao evento.
  Participantes autenticados acessam ali as sessões e o código de presença,
  validado pela equipe; sessões manuais não geram código.
- **Dados específicos deste evento** podem ser criados e editados pela mesma
  interface. Respostas anteriores são preservadas. Quando houver perguntas novas
  ou respostas incompatíveis, a página pública e a miscelânea interna mostram um
  aviso para completar os dados, sem refazer a inscrição.
  Perguntas opcionais novas podem ser deixadas vazias após a confirmação do
  formulário, sem gerar avisos repetidos. Dados removidos do formulário continuam
  preservados no histórico da inscrição.
- O mapa enviado como imagem é exibido diretamente na página do evento,
  sem depender de abrir uma URL PNG em outra aba.
- `/cadastro` é o cadastro interno da organização. A consulta pública de seus
  campos não exige login; a aprovação segue as regras da organização.

Validação adicional: `npm run test:registration-flow` cobre senha com hífen,
CPF e seleção dos campos compartilhados por tipo de cadastro.
No desenvolvimento, o proxy de mídia corresponde somente a `/m` e `/m/...`,
não a qualquer rota iniciada por `m`; assim `/miscelaneas/...` e
`/minhas-inscricoes` também podem ser abertas diretamente ou recarregadas.

## 📦 Instalação de Dependências

```bash
npm install --save-dev \
  @sentry/react \
  eslint \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  eslint-config-prettier \
  prettier \
  jest \
  ts-jest \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  @types/jest \
  identity-obj-proxy \
  husky \
  lint-staged

npm install zod
```

## 🔧 Configurar Husky

```bash
npx husky init
echo "npx lint-staged" > .husky/pre-commit
```

## 🌐 Variáveis de Ambiente

Adicione ao `.env`:
```
VITE_SENTRY_DSN=your_sentry_dsn_here
```

## 📝 Scripts do Package.json

Adicione ao `package.json`:
```json
{
  "scripts": {
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css,md}\"",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

## 🎯 Importar Sentry

No `src/main.tsx`, adicione no topo:
```typescript
import './sentry.config';
```
