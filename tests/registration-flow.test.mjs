import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const require = createRequire(import.meta.url);
function load(path, dependencies = {}, globals = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  });
  const exports = {};
  vm.runInNewContext(outputText, { exports, require: name => dependencies[name] ?? require(name), ...globals });
  return exports;
}

test('editor da home envia tema e secoes no contrato esperado pelo backend', async () => {
  const calls = [];
  const { orgHomeService } = load('../src/services/orgHomeService.ts', { '@/lib/api': { api: {
    put: async (path, body) => { calls.push({ path, body }); return { data: { saved: true } }; },
  } } });
  const config = { theme: { font_family: 'Poppins', logo_asset_id: 'logo-id' }, seo: {}, social_links: {}, contact: {} };
  const editableSection = {
    id: '11111111-1111-4111-8111-111111111111', type: 'HERO', order_index: 0,
    enabled: true, title: 'Apresentação', subtitle: '', config: { slides: [] },
  };
  const sections = Array.from({ length: 9 }, (_, order_index) => ({
    ...editableSection, order_index,
    organization_id: 'organization-one', updated_by: 'account-one',
    created_at: '2026-10-24T12:00:00Z', updated_at: '2026-10-24T13:00:00Z',
  }));
  await orgHomeService.saveDraft({ config, sections });
  await orgHomeService.saveDraft({ config, sections }, 'organization-one');
  assert.equal(calls[0].path, '/org-home/admin');
  assert.equal(calls[1].path, '/org-home/admin/organizations/organization-one');
  assert.equal(calls[0].body.config, undefined);
  assert.equal(calls[0].body.theme.font_family, 'Poppins');
  assert.equal(calls[0].body.theme.logo_asset_id, 'logo-id');
  for (const { body } of calls) {
    assert.equal(body.sections.length, 9);
    body.sections.forEach((section, order_index) => {
      assert.equal(JSON.stringify(section), JSON.stringify({ ...editableSection, order_index }));
      for (const key of ['organization_id', 'updated_by', 'created_at', 'updated_at']) assert.equal(key in section, false);
    });
  }
  assert.equal(sections[0].organization_id, 'organization-one');
  await orgHomeService.saveDraft({ config, sections: [{ ...editableSection, id: undefined }] });
  assert.equal('id' in calls[2].body.sections[0], false);
});

test('formulario da home aceita fontes e imagens validas e recusa links sem HTTPS', () => {
  const { editorFormSchema } = load('../src/schemas/orgHomeSchema.ts');
  const values = {
    theme: { primary_color: '#0e79b2', secondary_color: '#0d1b2a', background_color: '#020617', logo_background_color: '#0d1b2a', logo_asset_id: '', favicon_asset_id: '', font_family: 'Poppins' },
    seo: { title: '', description: '', og_image_asset_id: '' },
    social_links: { instagram: '', linkedin: '', facebook: '', youtube: '', tiktok: '' },
    contact: { address: '', phone: '', whatsapp: '', email: '', map_url: '' },
  };
  assert.equal(editorFormSchema.safeParse(values).success, true);
  for (const font of ['Inter', 'Lato', 'Poppins']) assert.equal(editorFormSchema.safeParse({ ...values, theme: { ...values.theme, font_family: font } }).success, true);
  assert.equal(editorFormSchema.safeParse({ ...values, social_links: { ...values.social_links, instagram: 'http://example.com' } }).success, false);
  assert.equal(editorFormSchema.safeParse({ ...values, social_links: { ...values.social_links, instagram: 'https://example.com' } }).success, true);
  assert.equal(editorFormSchema.safeParse({ ...values, theme: { ...values.theme, logo_asset_id: 'arquivo-invalido' } }).success, false);
});

test('data/hora de evento converte ISO para horario local e volta sem deslocar o instante', () => {
  const { fromDateTimeLocal, toDateTimeLocal } = load('../src/utils/dateTime.ts');
  const original = '2026-10-28T22:30:00.000Z';
  const localValue = toDateTimeLocal(original);
  assert.equal(localValue.length, 16);
  assert.equal(new Date(fromDateTimeLocal(localValue)).toISOString(), original);
});

test('erros de API mostram a causa do upload e os campos rejeitados da home', () => {
  const { apiErrorMessage } = load('../src/utils/apiError.ts', {}, { Error });
  assert.equal(apiErrorMessage({ response: { data: { message: 'Armazenamento desabilitado.' } } }, 'Falha'), 'Armazenamento desabilitado.');
  assert.match(apiErrorMessage({ response: { data: { message: 'Configuração inválida.', issues: [{ path: 'image_alt', message: 'Informe texto alternativo.' }] } } }, 'Falha'), /image_alt: Informe texto alternativo/);
  assert.match(apiErrorMessage(new Error('Network Error'), 'Falha'), /origem permitida/);
  assert.equal(apiErrorMessage(null, 'Falha'), 'Falha');
});

test('upload de logo usa o escopo correto e envia o arquivo binario sem JSON', async () => {
  const calls = [];
  class TestFile {
    constructor(parts, name, options) {
      this.name = name; this.type = options.type;
      this.size = parts.reduce((total, part) => total + (part.size ?? part.byteLength), 0);
    }
  }
  const { mediaService } = load('../src/services/mediaService.ts', {
    'browser-image-compression': { default: async file => file },
    '@/lib/api': { api: {
      post: async (path, body) => { calls.push({ method: 'POST', path, body }); return { data: { asset_id: 'logo-one' } }; },
      put: async (path, body, options) => { calls.push({ method: 'PUT', path, body, options }); },
    } },
  }, { File: TestFile, document: { createElement: () => ({ toDataURL: () => 'data:image/webp;base64,test' }) } });
  const source = new TestFile([new Uint8Array(16)], 'logo.png', { type: 'image/png' });
  await mediaService.upload(source, 'org-home-logo', () => {}, 'PUBLIC');
  await mediaService.upload(source, 'org-home-logo', () => {}, 'PUBLIC', 'organization-one');
  assert.equal(calls[0].path, '/media/uploads');
  assert.equal(calls[0].body.visibility, 'PUBLIC');
  assert.equal(calls[1].path, '/media/uploads/logo-one/content');
  assert.equal(calls[1].options.headers['Content-Type'], 'image/webp');
  assert.equal(calls[1].options.transformRequest[0](calls[1].body), calls[1].body);
  assert.equal(calls[2].path, '/org-home/admin/organizations/organization-one/media/uploads');
  assert.equal(calls[3].path, '/org-home/admin/organizations/organization-one/media/logo-one/content');
});

test('paginacao limita paginas, ajusta tamanho e busca ignora acentos', () => {
  const { paginateItems, normalizeQuery } = load('../src/utils/pagination.ts');
  const items = Array.from({ length: 61 }, (_, index) => index + 1);
  assert.equal(paginateItems(items, 2, 25).items.join(','), items.slice(25, 50).join(','));
  assert.equal(paginateItems(items, 99, 25).page, 3);
  assert.equal(paginateItems(items.slice(0, 3), 3, 25).page, 1);
  assert.equal(paginateItems([], 5, 25).total, 0);
  assert.equal(paginateItems([], 5, 25).pages, 1);
  assert.equal(paginateItems(items, -3, 0).pageSize, 1);
  assert.equal(paginateItems(items, NaN, Infinity).page, 1);
  assert.equal(normalizeQuery('  JOÃO Ágata  '), 'joao agata');
});

test('tabela compartilhada renderiza apenas a pagina atual e controles acessiveis', () => {
  const pagination = load('../src/utils/pagination.ts');
  const hooks = load('../src/hooks/usePagination.ts', { '@/utils/pagination': pagination });
  const { DataTable } = load('../src/components/ui/data-table.tsx', {
    '@/utils/pagination': pagination, '@/hooks/usePagination': hooks,
    '@/components/ui/button': { Button: 'button' }, '@/components/ui/input': { Input: 'input' },
  });
  const rows = Array.from({ length: 61 }, (_, index) => ({ id: String(index), name: `Pessoa ${index + 1}` }));
  const markup = renderToStaticMarkup(React.createElement(DataTable, { rows, label: 'pessoas',
    search: row => row.name, columns: [{ key: 'name', header: 'Nome', cell: row => row.name }] }));
  assert.equal((markup.match(/<tbody>[\s\S]*?<\/tbody>/)?.[0].match(/<tr/g) ?? []).length, 25);
  assert.match(markup, /Buscar em pessoas/);
  assert.match(markup, /Paginação de pessoas/);
  assert.match(markup, /Página 1 de 3/);
  assert.match(markup, /scope="col"/);
  assert.doesNotMatch(markup, />Pessoa 26</);
});

function scannerHarness(getUserMedia, onRead) {
  const slots = [];
  let cursor = 0;
  let effects = [];
  let callback;
  let stopped = 0;
  let paused = false;
  const reads = [];
  const controls = { stop() { stopped++; } };
  const hooks = {
    useRef(value) { const index = cursor++; return slots[index] ??= { current: value }; },
    useState(value) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = value;
      return [slots[index], next => { slots[index] = typeof next === 'function' ? next(slots[index]) : next; }];
    },
    useEffect(effect, dependencies) {
      const index = cursor++;
      const previous = slots[index];
      if (previous && dependencies.every((value, offset) => Object.is(value, previous.dependencies[offset]))) return;
      effects.push(() => { previous?.cleanup?.(); slots[index] = { dependencies, cleanup: effect() }; });
    },
  };
  class Reader {
    async decodeFromStream(stream, video, onResult) { callback = onResult; return controls; }
  }
  const { AttendanceQrScanner } = load('../src/components/miscellaneous/AttendanceQrScanner.tsx', {
    react: hooks, '@/components/ui/button': { Button: 'button' }, '@zxing/browser': { BrowserQRCodeReader: Reader },
  }, { navigator: { mediaDevices: { getUserMedia } } });
  const nodes = (element) => !element || typeof element !== 'object' ? []
    : [element, ...React.Children.toArray(element.props?.children).flatMap(nodes)];
  const render = () => {
    cursor = 0;
    const tree = nodes(AttendanceQrScanner({ disabled: false, paused, onRead: async token => { reads.push(token); await onRead?.(token); } }));
    const video = tree.find(node => node.type === 'video');
    if (video) video.props.ref.current = {};
    const pending = effects; effects = []; pending.forEach(effect => effect());
    return tree;
  };
  const toggle = () => { render().find(node => node.type === 'button').props.onClick(); render(); };
  return { render, toggle, reads, controls, get stopped() { return stopped; },
    setPaused: value => { paused = value; render(); },
    decode: (result, error) => callback(result, error, controls) };
}

test('pausar validacoes nao fecha a camera e uma falha permite o proximo codigo', async () => {
  const scanner = scannerHarness(async () => ({ getTracks: () => [{ stop() {} }] }), async token => {
    if (token === 'invalid') throw new Error('Token invalido');
  });
  scanner.toggle();
  await new Promise(resolve => setImmediate(resolve));
  scanner.setPaused(true);
  scanner.decode({ getText: () => 'paused' });
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(scanner.reads, []);
  assert.ok(scanner.render().some(node => node.type === 'video'));
  scanner.setPaused(false);
  scanner.decode({ getText: () => 'invalid' });
  await new Promise(resolve => setImmediate(resolve));
  assert.ok(scanner.render().some(node => node.type === 'video'));
  scanner.decode({ getText: () => 'valid' });
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(scanner.reads, ['invalid', 'valid']);
  assert.equal(scanner.stopped, 0);
  scanner.toggle();
});

test('câmera permanece aberta, valida vários códigos e ignora repetições do mesmo QR', async () => {
  let released = 0;
  const scanner = scannerHarness(async () => ({ getTracks: () => [{ stop() { released++; } }] }));
  scanner.toggle();
  await new Promise(resolve => setImmediate(resolve));
  scanner.decode(undefined, { name: 'MinifiedError', getKind: () => 'NotFoundException' });
  assert.ok(scanner.render().some(node => node.type === 'video'));
  assert.equal(released, 0);
  scanner.decode({ getText: () => 'opaque-token' });
  scanner.decode({ getText: () => 'concurrent-token' });
  await new Promise(resolve => setImmediate(resolve));
  scanner.decode({ getText: () => 'opaque-token' });
  scanner.decode({ getText: () => 'another-token' });
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(scanner.reads, ['opaque-token', 'another-token']);
  assert.ok(scanner.render().some(node => node.type === 'video'));
  assert.equal(released, 0);
  scanner.toggle();
  assert.ok(released > 0);
  assert.ok(scanner.stopped > 0);
  assert.ok(!scanner.render().some(node => node.type === 'video'));
});

test('câmera é liberada mesmo se a permissão chegar após fechar o leitor', async () => {
  let allowCamera;
  let released = 0;
  const scanner = scannerHarness(() => new Promise(resolve => { allowCamera = resolve; }));
  scanner.toggle();
  await new Promise(resolve => setImmediate(resolve));
  scanner.toggle();
  allowCamera({ getTracks: () => [{ stop() { released++; } }] });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(released, 1);
  assert.ok(!scanner.render().some(node => node.type === 'video'));
});

test('tabela pesquisa eng em respostas e perfis, combina filtros e conta todas as correspondências', () => {
  const { filterPeopleRows, addRegistrationColumns } = load('../src/components/miscellaneous/peopleTableData.ts');
  const columns = new Map();
  const values = { name: 'Ágata', email: 'agata@example.test', date: '2026-05-12T12:30:00Z', phone: '' };
  addRegistrationColumns(values, columns, {
    profile_data: { curso: 'Engenharia Civil' },
    event_registration_schema: [{ key: 'area', label: 'Área de atuação' }, { key: 'vazio', label: 'Sem resposta' }],
  }, { area: 'Construção' });
  assert.equal(columns.get('answers.area').label, 'Evento: Área de atuação');
  assert.equal(columns.has('answers.vazio'), true);
  const rows = [{ id: 'a', name: 'Ágata', values },
    { id: 'b', name: 'Beto', values: { name: 'Beto', 'answers.area': 'ENG elétrica', phone: '123', date: '2026-05-13' } },
    { id: 'c', name: 'Caio', values: { name: 'Caio', 'profile.curso': 'Medicina' } }];
  const matching = (search, filters = []) => filterPeopleRows(rows, search, filters).map(row => row.id).join(',');
  const filter = (column, operator, value = '') => ({ id: 1, column, operator, value });
  assert.equal(matching('eng'), 'a,b');
  assert.equal(matching('AGATA'), 'a');
  assert.equal(matching('eng', [filter('phone', 'empty')]), 'a');
  assert.equal(matching('', [filter('phone', 'not_empty')]), 'b');
  assert.equal(matching('', [filter('name', 'starts_with', 'ag'), filter('answers.area', 'equals', 'construcao')]), 'a');
  assert.equal(matching('', [filter('name', 'not_contains', 'a')]), 'b');
  assert.equal(matching('eng', [filter('date', 'gte', '2026-05-13')]), 'b');
  assert.equal(matching('eng', [filter('date', 'lte', '2026-05-12')]), 'a');
  assert.equal(matching('', [filter('name', 'contains', '')]), 'a,b,c');
  assert.equal(matching(''), 'a,b,c');
});

test('QR de presença gera SVG local com nome acessível e alternativa manual', () => {
  const { AttendanceQrCode } = load('../src/components/miscellaneous/AttendanceQrCode.tsx');
  const token = 'a'.repeat(64);
  const markup = renderToStaticMarkup(React.createElement(AttendanceQrCode, { token }));
  assert.match(markup, /<svg/);
  assert.match(markup, /QR Code para validar sua presença/);
  assert.match(markup, new RegExp(token));
  assert.match(markup, /<details/);
  assert.doesNotMatch(markup, /<img|https?:\/\//);
});

test('senha aceita hífen como especial e preserva os outros requisitos', () => {
  const { validatePassword } = load('../src/utils/password.ts');
  assert.equal(validatePassword('Senha-123').isValid, true);
  assert.equal(validatePassword('Senha!123').isValid, true);
  for (const password of ['Senha123', 'senha-123', 'SENHA-123', 'Senha---', 'Senha -123', 'A-1']) {
    assert.equal(validatePassword(password).isValid, false, password);
  }
});

test('CPF formatado e não formatado têm a mesma validação e verificam dígitos', () => {
  const { validateCPF, formatCPF } = load('../src/utils/cpf.ts');
  assert.equal(validateCPF('52998224725'), true);
  assert.equal(validateCPF(formatCPF('52998224725')), true);
  assert.equal(validateCPF('52998224726'), false);
  assert.equal(validateCPF('11111111111'), false);
});

test('tipo de cadastro exibe só campos configurados sem perfil acadêmico fixo', () => {
  const { RegistrationProfileFields, selectedProfileData } = load('../src/components/auth/RegistrationProfileFields.tsx');
  const profiles = [{ key: 'business', name: 'Empresário', description: 'Dados da empresa', fields: [
    { key: 'empresa', label: 'Empresa', type: 'text', required: true },
    { key: 'email', label: 'Email profissional', type: 'email', required: false },
  ] }];
  const html = renderToStaticMarkup(React.createElement(RegistrationProfileFields, {
    profiles, selected: 'business', onSelect() {}, values: { empresa: 'Empresa de teste' }, onChange() {},
  }));
  assert.equal((html.match(/<select/g) ?? []).length, 1);
  assert.match(html, /Tipo de cadastro/);
  assert.match(html, /Empresa de teste/);
  assert.doesNotMatch(html, /Dados acadêmicos|Perfil acadêmico|Visitante/);
  const payload = selectedProfileData(profiles, 'business', { empresa: 'Empresa de teste', email: '', outro_perfil: 'Não compartilhar' });
  assert.equal(JSON.stringify(payload), JSON.stringify({ empresa: 'Empresa de teste' }));
});
