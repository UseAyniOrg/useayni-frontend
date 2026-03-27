import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface AuthContextType {
  memberId: string | null;
  setMemberId: (id: string | null) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [memberId, setMemberIdState] = useState<string | null>(() => {
    // Recuperar memberId do localStorage na inicialização
    try {
      const stored = localStorage.getItem('memberId');
      return stored || null;
    } catch {
      return null;
    }
  });

  const setMemberId = useCallback((id: string | null) => {
    setMemberIdState(id);
    // Persistir no localStorage
    if (id) {
      try {
        localStorage.setItem('memberId', id);
      } catch {
        console.error('Failed to save memberId to localStorage');
      }
    } else {
      try {
        localStorage.removeItem('memberId');
      } catch {
        console.error('Failed to remove memberId from localStorage');
      }
    }
  }, []);

  const clearAuth = useCallback(() => {
    setMemberId(null);
  }, [setMemberId]);

  const value: AuthContextType = {
    memberId,
    setMemberId,
    clearAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
