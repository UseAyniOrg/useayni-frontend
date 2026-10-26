import { useEffect, useState } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { orgHomeService } from '@/services/orgHomeService';
import { resolveTenantSlug } from '@/lib/auth/accessContext';

interface Props {
  title?: string;
  message?: string;
}

export default function NotFoundPage({ title, message }: Props) {
  const { tenant, isLoading, errorKind } = useTenant();
  const tenantSlug = resolveTenantSlug();
  const [homeLogo, setHomeLogo] = useState('');

  useEffect(() => {
    let active = true;
    setHomeLogo('');
    if (!tenant?.slug) return () => { active = false; };
    orgHomeService.getPublic(tenant.slug)
      .then((home) => { if (active) setHomeLogo(home.config.theme.logo_url || ''); })
      .catch(() => { if (active) setHomeLogo(''); });
    return () => { active = false; };
  }, [tenant?.slug]);

  if (isLoading) {
    return <main className="grid min-h-screen place-items-center bg-slate-50 text-slate-500">Carregando organização...</main>;
  }

  const tenantUnavailable = Boolean(tenantSlug && !tenant);
  const tenantCheckFailed = Boolean(tenantUnavailable && errorKind === 'LOAD_FAILED');
  const defaultTitle = tenantUnavailable ? 'Organização indisponível' : 'Página não encontrada';
  const defaultMessage = tenantUnavailable
    ? `A organização "${tenantSlug}" não existe ou pode não estar mais acessível. Isso pode ocorrer, por exemplo, por pendência de pagamento, descontinuação pela equipe organizadora ou eventual descumprimento das normas da plataforma.${tenantCheckFailed ? ' Também não foi possível confirmar o endereço agora.' : ''} Se acredita que isso é um engano, tente novamente mais tarde ou entre em contato com o suporte UseAyni.`
    : tenant
        ? `Esta página não existe na página pública de ${tenant.name}. Confira o endereço ou volte para a organização.`
        : 'Esta página não existe no sistema UseAyni. Confira o endereço ou acesse a plataforma.';
  const logoUrl = tenant ? homeLogo || tenant.theme.logo_url : '/Ayni.svg';

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6 py-16 text-slate-900">
      <section className="w-full max-w-xl text-center">
        <a href={tenant ? '/' : 'https://www.useayni.com/'} className="mb-12 inline-flex min-h-12 items-center justify-center">
          {logoUrl ? (
            <img src={logoUrl} alt={tenant ? `Logo de ${tenant.name}` : 'UseAyni'} className="max-h-16 max-w-56 object-contain" />
          ) : (
            <span className="text-xl font-semibold text-slate-800">{tenant?.name}</span>
          )}
        </a>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
          {tenantUnavailable ? 'Organização não encontrada ou indisponível' : 'Erro 404'}
        </p>
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{title ?? defaultTitle}</h1>
        <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-slate-600">{message ?? defaultMessage}</p>
        <a
          href={tenant ? '/' : 'https://www.useayni.com/'}
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-md bg-sky-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-2"
        >
          {tenant ? 'Voltar para a organização' : 'Ir para UseAyni'}
        </a>
      </section>
    </main>
  );
}