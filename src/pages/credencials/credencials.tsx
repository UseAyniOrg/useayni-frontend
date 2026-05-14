import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import SignIn from "@/components/auth/signin";
import SignUp from "@/components/auth/signup";

export default function Credentials() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [padrinhoSlug, setPadrinhoSlug] = useState<string | null>(null);

  useEffect(() => {
    const mode = searchParams.get("mode");
    const padrinho = searchParams.get("padrinho");
    const isSignupRoute = location.pathname === "/cadastro";

    setIsSignUp(mode === "signup" || isSignupRoute);
    setPadrinhoSlug(padrinho);
  }, [searchParams, location.pathname]);

  const toggleMode = () => {
    setIsSignUp(current => !current);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-alice-blue to-bright-snow p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img src="/Ayni.svg" alt="Ayni Logo" className="h-16 w-auto" />
        </div>

        {isSignUp ? (
          <SignUp onToggle={toggleMode} padrinhoSlug={padrinhoSlug} />
        ) : (
          <SignIn onToggle={toggleMode} />
        )}
      </div>
    </div>
  );
}
