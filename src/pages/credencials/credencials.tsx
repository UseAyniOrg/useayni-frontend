import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import SignIn from '@/components/auth/signin';
import SignUp from '@/components/auth/signup';
import { ForgotPassword } from '@/components/auth/forgot-password';
import { useTenant } from '@/contexts/TenantContext';
import { orgHomeService } from '@/services/orgHomeService';

export default function Credentials() {
  const { tenant } = useTenant();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [padrinhoSlug, setPadrinhoSlug] = useState<string | null>(null);
  const [sponsorMemberId, setSponsorMemberId] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password'>('login');
  const [organizationLogo, setOrganizationLogo] = useState('');
  const [logoBackgroundColor, setLogoBackgroundColor] = useState('#0d1b2a');

  useEffect(() => {
    let active = true;
    setOrganizationLogo('');
    setLogoBackgroundColor('#0d1b2a');
    if (!tenant?.slug) return () => { active = false; };
    orgHomeService.getPublic(tenant.slug)
      .then(home => {
        if (!active) return;
        setOrganizationLogo(home.config.theme.logo_url || '');
        setLogoBackgroundColor(home.config.theme.logo_background_color || tenant.theme.primary_color || '#0d1b2a');
      })
      .catch(() => { if (active) setOrganizationLogo(''); });
    return () => { active = false; };
  }, [tenant?.slug]);

  useEffect(() => {
    setPadrinhoSlug(searchParams.get('padrinho'));
    setSponsorMemberId(searchParams.get('memberId'));
    if (location.pathname === '/login' || location.pathname === '/admin/login') setMode('login');
    else if (location.pathname === '/cadastro') setMode('signup');
    else if (location.pathname === '/recuperar-senha') setMode('forgot-password');
  }, [searchParams, location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-alice-blue to-bright-snow p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          {tenant ? (
            <div className="flex h-24 min-w-56 max-w-full items-center justify-center rounded-md px-6 py-3" style={{ backgroundColor: logoBackgroundColor }}>
              {organizationLogo || tenant.theme.logo_url ? (
                <img src={organizationLogo || tenant.theme.logo_url} alt={`Logo de ${tenant.name}`} className="h-16 max-w-56 object-contain" />
              ) : <span className="text-xl font-semibold text-white">{tenant.name}</span>}
            </div>
          ) : <img src="/Ayni.svg" alt="UseAyni" className="h-16 w-auto" />}
        </div>
        {mode === 'login' && <SignIn />}
        {mode === 'signup' && <SignUp padrinhoSlug={padrinhoSlug} sponsorMemberId={sponsorMemberId} />}
        {mode === 'forgot-password' && <ForgotPassword />}
      </div>
    </div>
  );
}
