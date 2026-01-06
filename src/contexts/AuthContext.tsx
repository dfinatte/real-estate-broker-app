import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { SessionSecurity } from '../utils/sessionSecurity';
import { TeamService } from '../services/TeamService';

interface User {
  uid: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  sessionWarning: boolean;
  extendSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionWarning, setSessionWarning] = useState(false);

  // Função para estender sessão
  const extendSession = () => {
    setSessionWarning(false);
    SessionSecurity.updateLastActivity();
    if (user) {
      SessionSecurity.resetSession(
        () => handleSessionTimeout(),
        () => setSessionWarning(true)
      );
    }
  };

  // Função de logout melhorada
  const logout = useCallback(async () => {
    try {
      SessionSecurity.clearSessionMonitoring();
      SessionSecurity.clearSessionData();
      await signOut(auth);
      setUser(null);
      setSessionWarning(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }, []);

  // Função para timeout de sessão
  const handleSessionTimeout = useCallback(() => {
    console.warn('Sessão expirada por inatividade');
    logout();
  }, [logout]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (!user.emailVerified) {
          try {
            SessionSecurity.clearSessionMonitoring();
            SessionSecurity.clearSessionData();
            await signOut(auth);
          } catch (error) {
            console.warn('Erro ao finalizar sessão de usuário não verificado:', error);
          }
          setUser(null);
          setSessionWarning(false);
          setLoading(false);
          return;
        }

        try {
          await TeamService.garantirCorretorParaUsuario({
            uid: user.uid,
            email: user.email || ''
          });

          const permissaoExistente = await TeamService.obterPermissao(user.uid);
          if (!permissaoExistente) {
            await TeamService.definirPermissao(user.uid, 'corretor');
          } else {
            // Forçar atualização das permissões para garantir acesso às novas funcionalidades
            await TeamService.definirPermissao(user.uid, permissaoExistente.role || 'corretor');
          }
        } catch (error) {
          console.warn('Erro ao garantir dados iniciais do usuário:', error);
        }

        setUser({
          uid: user.uid,
          email: user.email || ''
        });
        
        // Inicializar segurança de sessão quando usuário logar
        SessionSecurity.initializeSession();
        
        // Verificar múltiplas sessões
        if (SessionSecurity.detectMultipleSessions(user.uid)) {
          console.warn('Múltiplas sessões detectadas');
        }
        
        // Iniciar monitoramento de sessão
        SessionSecurity.startSessionMonitoring(
          handleSessionTimeout,
          () => setSessionWarning(true)
        );
        
        SessionSecurity.updateLastActivity();

      } else {
        setUser(null);
        SessionSecurity.clearSessionMonitoring();
        SessionSecurity.clearSessionData();
        setSessionWarning(false);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      SessionSecurity.clearSessionMonitoring();
    };
  }, [handleSessionTimeout]);

  const value = {
    user,
    loading,
    logout,
    sessionWarning,
    extendSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
