import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

function environment(url) {
  const window = { location: new URL(url) };
  const jar = new Map();
  const writes = [];
  const document = {
    get cookie() { return [...jar.entries()].map(([key, value]) => `${key}=${value}`).join('; '); },
    set cookie(value) {
      writes.push(value);
      const [pair] = value.split(';');
      const index = pair.indexOf('=');
      const name = pair.slice(0, index);
      if (value.includes('expires=Thu, 01 Jan 1970')) jar.delete(name);
      else jar.set(name, pair.slice(index + 1));
    },
  };
  function load(path, dependencies = {}) {
    const source = readFileSync(new URL(path, import.meta.url), 'utf8');
    const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
    const exports = {};
    vm.runInNewContext(outputText, { exports, window, document, URL, URLSearchParams, require: (name) => {
      assert.ok(name in dependencies, `Dependência inesperada: ${name}`);
      return dependencies[name];
    } });
    return exports;
  }
  const context = load('../src/lib/auth/accessContext.ts');
  const cookies = load('../src/lib/auth/cookies.ts', { './accessContext': context });
  return { context, cookies, writes, navigate: (next) => { window.location = new URL(next); } };
}

test('tenant vem do host ou rota organizacional, nunca de query string', () => {
  const env = environment('http://localhost:5173/admin');
  assert.equal(env.context.resolveTenantSlug(), null);
  assert.equal(env.context.currentAccessContext(), 'platform');
  env.navigate('http://creajrpr.localhost:5173/admin');
  assert.equal(env.context.resolveTenantSlug(), 'creajrpr');
  assert.equal(env.context.currentAccessContext(), 'organization');
  env.navigate('http://creajrpr.localhost:5173/login');
  assert.equal(env.context.currentAccessContext(), 'member');
  env.navigate('http://localhost:5173/admin');
  assert.equal(env.context.resolveTenantSlug(), null);
  env.navigate('http://localhost:5173/home?org=creajrpr');
  assert.equal(env.context.resolveTenantSlug(), null);
  env.navigate('http://localhost:5173/o/creajrpr');
  assert.equal(env.context.resolveTenantSlug(), 'creajrpr');
});

test('primeira requisição pública identifica tenant no subdomínio sem consultar TenantProvider', () => {
  const env = environment('http://creajrpr.localhost:5173/eventos/engravatados-no-orla-1---in-pato-branco-parana-2p18s');
  const headers = new Map();
  env.context.applyTenantHeader(headers);
  assert.equal(headers.get('X-Org-Slug'), 'creajrpr');
  env.navigate('http://localhost:5173/eventos/encontro?org=associacao');
  env.context.applyTenantHeader(headers);
  assert.equal(headers.has('X-Org-Slug'), false);
  env.navigate('https://creajrpr.useayni.com/eventos/encontro?org=outra');
  env.context.applyTenantHeader(headers);
  assert.equal(headers.get('X-Org-Slug'), 'creajrpr');
  env.navigate('http://localhost:5173/admin/login');
  env.context.applyTenantHeader(headers);
  assert.equal(headers.has('X-Org-Slug'), false);
});

test('cookies de cada contexto e tenant coexistem e logout não apaga outras sessões', () => {
  const env = environment('http://localhost:5173/admin');
  env.cookies.setCookie('accessToken', 'platform-token');
  env.navigate('http://creajrpr.localhost:5173/admin');
  env.cookies.setCookie('accessToken', 'admin-token');
  env.cookies.setCookie('refreshToken', 'admin-refresh');
  env.navigate('http://creajrpr.localhost:5173/home');
  env.cookies.setCookie('accessToken', 'member-token');
  assert.equal(env.cookies.getCookie('accessToken'), 'member-token');
  env.cookies.removeCookie('accessToken');
  assert.equal(env.cookies.getCookie('accessToken'), null);
  env.navigate('http://creajrpr.localhost:5173/admin');
  assert.equal(env.cookies.getCookie('accessToken'), 'admin-token');
  assert.equal(env.cookies.getCookie('refreshToken'), 'admin-refresh');
  env.navigate('http://outra.localhost:5173/admin');
  assert.equal(env.cookies.getCookie('accessToken'), null);
  env.navigate('http://localhost:5173/admin');
  assert.equal(env.cookies.getCookie('accessToken'), 'platform-token');
});

test('hostname da organização é autoritativo e URLs locais usam prefixo de tenant', () => {
  const env = environment('http://creajrpr.localhost:5173/admin?org=outra');
  assert.equal(env.context.resolveTenantSlug(), 'creajrpr');
  env.navigate('http://localhost:5173/admin?org=creajrpr');
  assert.equal(env.context.resolveTenantSlug(), null);
  assert.equal(env.context.tenantUrl('creajrpr', '/home?org=outra'), 'http://localhost:5173/o/creajrpr/home');
  assert.equal(env.context.tenantUrl('associacao', '/o/creajrpr/home'), 'http://localhost:5173/o/associacao/home');
  env.navigate('https://creajrpr.useayni.com/admin');
  assert.equal(env.context.tenantUrl('associacao', '/home'), 'https://associacao.useayni.com/home');
});

test('senha inicial preserva contexto e retorno aceita apenas eventos locais', () => {
  const env = environment('http://creajrpr.localhost:5173/definir-senha?access=organization');
  assert.equal(env.context.currentAccessContext(), 'organization');
  assert.equal(env.context.safeReturnTo('/eventos/encontro'), '/eventos/encontro');
  for (const target of ['https://outro.example', '//outro.example', '/admin', '/eventos/\\outro', '/eventos//outro']) {
    assert.equal(env.context.safeReturnTo(target), null);
  }
});

test('cookies emitidos pelo domínio raiz podem ser lidos pelo suporte no subdomínio', () => {
  const env = environment('https://useayni.com/admin');
  env.cookies.setCookie('accessToken', 'platform-token');
  assert.match(env.writes[0], /accessToken_platform_global=platform-token/);
  assert.match(env.writes[0], /domain=\.useayni\.com/);
  assert.match(env.writes[0], /; secure/);
  env.cookies.removeCookie('accessToken');
  assert.match(env.writes[1], /domain=\.useayni\.com/);
});

test('cookies locais permanecem no host base para rotas com prefixo de tenant', () => {
  const env = environment('http://localhost:5173/login');
  env.cookies.setCookie('accessToken', 'member-token');
  assert.doesNotMatch(env.writes[0], /domain=/);
});
