import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import SignIn from '@/components/auth/signin';
import SignUp from '@/components/auth/signup';
import { ForgotPassword } from '@/components/auth/forgot-password';

export default function Credentials() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [padrinhoSlug, setPadrinhoSlug] = useState<string | null>(null);
  const [sponsorMemberId, setSponsorMemberId] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password'>('login');

  useEffect(() => {
    const padrinho = searchParams.get('padrinho');
    const memberId = searchParams.get('memberId');
    setPadrinhoSlug(padrinho);
    setSponsorMemberId(memberId);

    if (location.pathname === '/login') setMode('login');
    else if (location.pathname === '/cadastro') setMode('signup');
    else if (location.pathname === '/recuperar-senha') setMode('forgot-password');
  }, [searchParams, location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-alice-blue to-bright-snow p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img src="/Ayni.svg" alt="Ayni Logo" className="h-16 w-auto" />
        </div>

        {mode === 'login' && <SignIn />}
        {mode === 'signup' && (
          <SignUp padrinhoSlug={padrinhoSlug} sponsorMemberId={sponsorMemberId} />
        )}
        {mode === 'forgot-password' && <ForgotPassword />}
      </div>
    </div>
  );
}
