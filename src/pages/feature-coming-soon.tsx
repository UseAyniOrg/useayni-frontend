import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTenant } from '@/contexts/TenantContext';

export default function FeatureComingSoon({ featureSlug }: { featureSlug: 'sponsors' | 'talent_network' }) {
  // A future talent directory must show member profiles, biographies, and CVs only after explicit opt-in.
  const { tenant, isFeatureEnabled } = useTenant();
  const enabled = isFeatureEnabled(featureSlug);
  const title = featureSlug === 'sponsors' ? 'Parceiros' : 'Rede de talentos';

  return (
    <main className="grid min-h-screen place-items-center bg-[#020617] px-6 text-slate-100">
      <section className="max-w-lg space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">{tenant?.name ?? 'UseAyni'}</p>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="leading-7 text-slate-300">
          {enabled
            ? 'Esta área está sendo preparada e estará disponível em breve.'
            : 'Este recurso ainda não está habilitado para a organização.'}
        </p>
        <Link className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200" to="/">
          <ArrowLeft className="h-4 w-4" /> Voltar para a home
        </Link>
      </section>
    </main>
  );
}
