import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { TeamService } from '../services/TeamService';
import { Corretor, Meta, Performance, Notificacao, Permissao } from '../types/team';
import { useAuth } from './AuthContext';

interface TeamContextType {
  // Estado
  corretores: Corretor[];
  metas: Meta[];
  performances: Performance[];
  notificacoes: Notificacao[];
  permissaoUsuario: Permissao | null;
  loading: boolean;
  error: string | null;

  // Ações - Corretores
  carregarCorretores: () => Promise<void>;
  criarCorretor: (corretor: Omit<Corretor, 'id'>) => Promise<Corretor>;
  atualizarCorretor: (id: string, dados: Partial<Corretor>) => Promise<void>;
  deletarCorretor: (id: string) => Promise<void>;
  atualizarStatusCorretor: (id: string, status: Corretor['status']) => Promise<void>;

  // Ações - Metas
  carregarMetas: (corretorId?: string) => Promise<void>;
  criarMeta: (meta: Omit<Meta, 'id'>) => Promise<Meta>;

  // Ações - Performance
  registrarPerformance: (performance: Omit<Performance, 'id'>) => Promise<Performance>;
  carregarPerformances: (corretorId: string, dias?: number) => Promise<void>;

  // Ações - Notificações
  carregarNotificacoes: (naoLidas?: boolean) => Promise<void>;
  criarNotificacao: (notificacao: Omit<Notificacao, 'id'>) => Promise<Notificacao>;
  criarNotificacaoGrupo: (notificacao: Omit<Notificacao, 'id' | 'destinatarioId'>) => Promise<Notificacao[]>;
  marcarNotificacaoLida: (id: string) => Promise<void>;

  // Ações - Permissões
  carregarPermissaoUsuario: () => Promise<void>;
  definirPermissaoUsuario: (role: 'admin' | 'gerente' | 'corretor') => Promise<void>;

  // Utilitários
  verificarPermissao: (permissao: keyof Permissao['permissoes']) => boolean;
  registrarAtividade: (corretorId: string, atividade: Omit<Notificacao, 'id' | 'dataCriacao' | 'lida'>) => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};

interface TeamProviderProps {
  children: ReactNode;
}

export const TeamProvider: React.FC<TeamProviderProps> = ({ children }) => {
  const { user } = useAuth();
  
  // Estado
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [metas, setMetas] = useState<Meta[]>([]);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [permissaoUsuario, setPermissaoUsuario] = useState<Permissao | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Funções de loading e erro
  const startLoading = () => {
    setLoading(true);
    setError(null);
  };

  const stopLoading = () => {
    setLoading(false);
  };

  const handleError = (error: any, message: string) => {
    console.error(message, error);
    setError(message);
    setLoading(false);
  };

  // CORRETORES
  const carregarCorretores = useCallback(async () => {
    try {
      startLoading();
      const dados = await TeamService.obterTodosCorretores();
      setCorretores(dados);
    } catch (error) {
      handleError(error, 'Erro ao carregar corretores');
    } finally {
      stopLoading();
    }
  }, []);

  const criarCorretor = async (corretor: Omit<Corretor, 'id'>): Promise<Corretor> => {
    try {
      const novoCorretor = await TeamService.criarCorretor(corretor);
      setCorretores(prev => [...prev, novoCorretor]);
      return novoCorretor;
    } catch (error) {
      handleError(error, 'Erro ao criar corretor');
      throw error;
    }
  };

  const atualizarCorretor = async (id: string, dados: Partial<Corretor>) => {
    try {
      await TeamService.atualizarCorretor(id, dados);
      setCorretores(prev => 
        prev.map(corretor => 
          corretor.id === id ? { ...corretor, ...dados } : corretor
        )
      );
    } catch (error) {
      handleError(error, 'Erro ao atualizar corretor');
    }
  };

  const deletarCorretor = async (id: string) => {
    try {
      await TeamService.deletarCorretor(id);
      setCorretores(prev => prev.filter(corretor => corretor.id !== id));
    } catch (error) {
      handleError(error, 'Erro ao deletar corretor');
    }
  };

  const atualizarStatusCorretor = async (id: string, status: Corretor['status']) => {
    try {
      await TeamService.atualizarStatusCorretor(id, status);
      setCorretores(prev => 
        prev.map(corretor => 
          corretor.id === id ? { ...corretor, status, ultimaAtividade: new Date().toISOString() } : corretor
        )
      );
    } catch (error) {
      handleError(error, 'Erro ao atualizar status do corretor');
    }
  };

  // METAS
  const carregarMetas = async (corretorId?: string) => {
    try {
      startLoading();
      if (corretorId) {
        const dados = await TeamService.obterMetasCorretor(corretorId);
        setMetas(dados);
      } else {
        // Carregar metas de todos os corretores
        const todasMetas: Meta[] = [];
        for (const corretor of corretores) {
          const metasCorretor = await TeamService.obterMetasCorretor(corretor.id);
          todasMetas.push(...metasCorretor);
        }
        setMetas(todasMetas);
      }
    } catch (error) {
      handleError(error, 'Erro ao carregar metas');
    } finally {
      stopLoading();
    }
  };

  const criarMeta = async (meta: Omit<Meta, 'id'>): Promise<Meta> => {
    try {
      const novaMeta = await TeamService.criarMeta(meta);
      setMetas(prev => [...prev, novaMeta]);
      return novaMeta;
    } catch (error) {
      handleError(error, 'Erro ao criar meta');
      throw error;
    }
  };

  // PERFORMANCE
  const registrarPerformance = async (performance: Omit<Performance, 'id'>): Promise<Performance> => {
    try {
      const novaPerformance = await TeamService.registrarPerformance(performance);
      setPerformances(prev => [...prev, novaPerformance]);
      return novaPerformance;
    } catch (error) {
      handleError(error, 'Erro ao registrar performance');
      throw error;
    }
  };

  const carregarPerformances = async (corretorId: string, dias: number = 30) => {
    try {
      startLoading();
      const dados = await TeamService.obterPerformanceCorretor(corretorId, dias);
      setPerformances(dados);
    } catch (error) {
      handleError(error, 'Erro ao carregar performances');
    } finally {
      stopLoading();
    }
  };

  // NOTIFICAÇÕES
  const carregarNotificacoes = useCallback(async (naoLidas: boolean = false) => {
    if (!user) return;
    
    try {
      startLoading();
      const dados = await TeamService.obterNotificacoesUsuario(user.uid, naoLidas);
      setNotificacoes(dados);
    } catch (error) {
      handleError(error, 'Erro ao carregar notificações');
    } finally {
      stopLoading();
    }
  }, [user]);

  const criarNotificacao = async (notificacao: Omit<Notificacao, 'id'>): Promise<Notificacao> => {
    try {
      const novaNotificacao = await TeamService.criarNotificacao(notificacao);
      setNotificacoes(prev => [novaNotificacao, ...prev]);
      return novaNotificacao;
    } catch (error) {
      handleError(error, 'Erro ao criar notificação');
      throw error;
    }
  };

  const criarNotificacaoGrupo = async (notificacao: Omit<Notificacao, 'id' | 'destinatarioId'>): Promise<Notificacao[]> => {
    try {
      const novasNotificacoes = await TeamService.criarNotificacaoGrupo(notificacao);
      setNotificacoes(prev => [...novasNotificacoes, ...prev]);
      return novasNotificacoes;
    } catch (error) {
      handleError(error, 'Erro ao criar notificação para o grupo');
      throw error;
    }
  };

  const marcarNotificacaoLida = useCallback(async (id: string) => {
    try {
      await TeamService.marcarNotificacaoLida(id);
      setNotificacoes(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, lida: true, dataLeitura: new Date().toISOString() } : notif
        )
      );
    } catch (error) {
      handleError(error, 'Erro ao marcar notificação como lida');
    }
  }, []);

  // PERMISSÕES
  const carregarPermissaoUsuario = useCallback(async () => {
    if (!user) return;
    
    try {
      const permissao = await TeamService.obterPermissao(user.uid);
      setPermissaoUsuario(permissao);
    } catch (error) {
      handleError(error, 'Erro ao carregar permissão');
    }
  }, [user]);

  const definirPermissaoUsuario = useCallback(async (role: 'admin' | 'gerente' | 'corretor') => {
    if (!user) return;
    
    try {
      await TeamService.definirPermissao(user.uid, role);
      await carregarPermissaoUsuario();
    } catch (error) {
      handleError(error, 'Erro ao definir permissão do usuário');
    }
  }, [user, carregarPermissaoUsuario]);

  // UTILITÁRIOS
  const verificarPermissao = (permissao: keyof Permissao['permissoes']): boolean => {
    return permissaoUsuario?.permissoes[permissao] || false;
  };

  const registrarAtividade = async (corretorId: string, atividade: Omit<Notificacao, 'id' | 'dataCriacao' | 'lida'>) => {
    try {
      await TeamService.registrarAtividade(corretorId, {
        tipo: atividade.tipo as any,
        descricao: atividade.mensagem,
        dataHora: new Date().toISOString()
      });
    } catch (error) {
      handleError(error, 'Erro ao registrar atividade');
    }
  };

  // Efeitos
  useEffect(() => {
    if (user) {
      carregarCorretores();
      carregarPermissaoUsuario();
      carregarNotificacoes(true); // Carregar apenas não lidas inicialmente
    }
  }, [user, carregarCorretores, carregarPermissaoUsuario, carregarNotificacoes]);

  const value: TeamContextType = {
    // Estado
    corretores,
    metas,
    performances,
    notificacoes,
    permissaoUsuario,
    loading,
    error,

    // Ações
    carregarCorretores,
    criarCorretor,
    atualizarCorretor,
    deletarCorretor,
    atualizarStatusCorretor,
    carregarMetas,
    criarMeta,
    registrarPerformance,
    carregarPerformances,
    carregarNotificacoes,
    criarNotificacao,
    criarNotificacaoGrupo,
    marcarNotificacaoLida,
    carregarPermissaoUsuario,
    definirPermissaoUsuario,
    verificarPermissao,
    registrarAtividade
  };

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
};
