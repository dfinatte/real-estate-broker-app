import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import { Corretor, Meta, Performance, Notificacao, Permissao, Atividade } from '../types/team';

export class TeamService {
  private static readonly COLLECTIONS = {
    CORRETORES: 'corretores',
    METAS: 'metas',
    PERFORMANCE: 'performance',
    NOTIFICACOES: 'notificacoes',
    PERMISSOES: 'permissoes'
  };

  // CORRETORES
  static async garantirCorretorParaUsuario(params: {
    uid: string;
    email: string;
    nome?: string;
  }): Promise<void> {
    const docRef = doc(db, this.COLLECTIONS.CORRETORES, params.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return;

    const agora = new Date().toISOString();
    const nome = (params.nome?.trim() || params.email.split('@')[0] || 'Corretor').trim();

    const corretor: Corretor = {
      id: params.uid,
      uid: params.uid,
      nome,
      email: params.email,
      telefone: '',
      status: 'offline',
      leadsHoje: 0,
      leadsMes: 0,
      visitasHoje: 0,
      visitasMes: 0,
      negociosMes: 0,
      ticketMedio: 0,
      metaLeads: 50,
      metaVisitas: 30,
      ultimaAtividade: agora,
      especialidade: 'Residencial',
      dataCadastro: agora,
      ativo: true,
      role: 'corretor'
    };

    await setDoc(docRef, corretor);
  }

  static async criarCorretor(corretor: Omit<Corretor, 'id'>): Promise<Corretor> {
    const id = doc(collection(db, this.COLLECTIONS.CORRETORES)).id;
    const novoCorretor: Corretor = {
      ...corretor,
      id,
      dataCadastro: new Date().toISOString(),
      ativo: true
    };

    await setDoc(doc(db, this.COLLECTIONS.CORRETORES, id), novoCorretor);
    return novoCorretor;
  }

  static async atualizarCorretor(id: string, dados: Partial<Corretor>): Promise<void> {
    const docRef = doc(db, this.COLLECTIONS.CORRETORES, id);
    await updateDoc(docRef, {
      ...dados,
      atualizadoEm: new Date().toISOString()
    });
  }

  static async deletarCorretor(id: string): Promise<void> {
    await deleteDoc(doc(db, this.COLLECTIONS.CORRETORES, id));
  }

  static async obterCorretor(id: string): Promise<Corretor | null> {
    const docRef = doc(db, this.COLLECTIONS.CORRETORES, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as Corretor;
    }
    return null;
  }

  static async obterTodosCorretores(): Promise<Corretor[]> {
    const q = query(
      collection(db, this.COLLECTIONS.CORRETORES),
      orderBy('nome')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Corretor);
  }

  static observarCorretores(params: {
    onChange: (corretores: Corretor[]) => void;
    onError?: (error: unknown) => void;
  }): () => void {
    const q = query(
      collection(db, this.COLLECTIONS.CORRETORES),
      where('ativo', '==', true),
      orderBy('nome')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        params.onChange(snapshot.docs.map((d) => d.data() as Corretor));
      },
      (error) => {
        params.onError?.(error);
      }
    );
  }

  static async obterCorretoresPorStatus(status: string): Promise<Corretor[]> {
    const q = query(
      collection(db, this.COLLECTIONS.CORRETORES),
      where('status', '==', status),
      where('ativo', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Corretor);
  }

  // METAS
  static async criarMeta(meta: Omit<Meta, 'id'>): Promise<Meta> {
    const id = doc(collection(db, this.COLLECTIONS.METAS)).id;
    const novaMeta: Meta = {
      ...meta,
      id,
      criadaEm: new Date().toISOString(),
      atualizadaEm: new Date().toISOString()
    };

    await setDoc(doc(db, this.COLLECTIONS.METAS, id), novaMeta);
    return novaMeta;
  }

  static async obterMetasCorretor(corretorId: string, mes?: string): Promise<Meta[]> {
    let q = query(
      collection(db, this.COLLECTIONS.METAS),
      where('corretorId', '==', corretorId)
    );

    if (mes) {
      q = query(q, where('mes', '==', mes));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Meta);
  }

  // PERFORMANCE
  static async registrarPerformance(performance: Omit<Performance, 'id'>): Promise<Performance> {
    const id = doc(collection(db, this.COLLECTIONS.PERFORMANCE)).id;
    const novaPerformance: Performance = {
      ...performance,
      id
    };

    await setDoc(doc(db, this.COLLECTIONS.PERFORMANCE, id), novaPerformance);
    return novaPerformance;
  }

  static async obterPerformanceCorretor(corretorId: string, dias: number = 30): Promise<Performance[]> {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - dias);

    const q = query(
      collection(db, this.COLLECTIONS.PERFORMANCE),
      where('corretorId', '==', corretorId),
      where('data', '>=', dataLimite.toISOString().split('T')[0]),
      orderBy('data', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Performance);
  }

  static async obterPerformanceHoje(corretorId: string): Promise<Performance | null> {
    const hoje = new Date().toISOString().split('T')[0];
    const q = query(
      collection(db, this.COLLECTIONS.PERFORMANCE),
      where('corretorId', '==', corretorId),
      where('data', '==', hoje),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as Performance;
    }
    return null;
  }

  // NOTIFICAÇÕES
  static async criarNotificacao(notificacao: Omit<Notificacao, 'id'>): Promise<Notificacao> {
    const id = doc(collection(db, this.COLLECTIONS.NOTIFICACOES)).id;
    const novaNotificacao: Notificacao = {
      ...notificacao,
      id,
      dataCriacao: new Date().toISOString(),
      lida: false
    };

    await setDoc(doc(db, this.COLLECTIONS.NOTIFICACOES, id), novaNotificacao);
    return novaNotificacao;
  }

  static async criarNotificacaoGrupo(notificacao: Omit<Notificacao, 'id' | 'destinatarioId'>): Promise<Notificacao[]> {
    // Obter todos os corretores ativos
    const corretores = await this.obterTodosCorretores();
    const notificacoesCriadas: Notificacao[] = [];

    // Criar uma notificação para cada corretor
    for (const corretor of corretores) {
      const id = doc(collection(db, this.COLLECTIONS.NOTIFICACOES)).id;
      const novaNotificacao: Notificacao = {
        ...notificacao,
        id,
        destinatarioId: corretor.id,
        dataCriacao: new Date().toISOString(),
        lida: false
      };

      await setDoc(doc(db, this.COLLECTIONS.NOTIFICACOES, id), novaNotificacao);
      notificacoesCriadas.push(novaNotificacao);
    }

    return notificacoesCriadas;
  }

  static async obterNotificacoesUsuario(usuarioId: string, naoLidas: boolean = false): Promise<Notificacao[]> {
    let q = query(
      collection(db, this.COLLECTIONS.NOTIFICACOES),
      where('destinatarioId', '==', usuarioId),
      orderBy('dataCriacao', 'desc')
    );

    if (naoLidas) {
      q = query(q, where('lida', '==', false));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Notificacao);
  }

  static async marcarNotificacaoLida(id: string): Promise<void> {
    await updateDoc(doc(db, this.COLLECTIONS.NOTIFICACOES, id), {
      lida: true,
      dataLeitura: new Date().toISOString()
    });
  }

  // PERMISSÕES
  static async definirPermissao(uid: string, role: 'admin' | 'gerente' | 'corretor'): Promise<void> {
    const permissoesPadrao = {
      admin: {
        visualizarEquipe: true,
        gerenciarEquipe: true,
        verRelatorios: true,
        gerenciarMetas: true,
        enviarNotificacoes: true,
        acessarTodosDados: true
      },
      gerente: {
        visualizarEquipe: true,
        gerenciarEquipe: true,
        verRelatorios: true,
        gerenciarMetas: true,
        enviarNotificacoes: true,
        acessarTodosDados: false
      },
      corretor: {
        visualizarEquipe: true,
        gerenciarEquipe: false,
        verRelatorios: true,
        gerenciarMetas: true,
        enviarNotificacoes: true,
        acessarTodosDados: true
      }
    };

    const permissao: Permissao = {
      uid,
      role,
      permissoes: permissoesPadrao[role]
    };

    await setDoc(doc(db, this.COLLECTIONS.PERMISSOES, uid), permissao);
  }

  static async obterPermissao(uid: string): Promise<Permissao | null> {
    const docRef = doc(db, this.COLLECTIONS.PERMISSOES, uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as Permissao;
    }
    return null;
  }

  // MÉTODOS UTILITÁRIOS
  static async atualizarStatusCorretor(corretorId: string, status: Corretor['status']): Promise<void> {
    await this.atualizarCorretor(corretorId, {
      status,
      ultimaAtividade: new Date().toISOString()
    });
  }

  static async registrarAtividade(corretorId: string, atividade: Omit<Atividade, 'id'>): Promise<void> {
    const hoje = new Date().toISOString().split('T')[0];
    const performanceHoje = await this.obterPerformanceHoje(corretorId);

    if (performanceHoje) {
      const novasAtividades = [...performanceHoje.atividades, {
        ...atividade,
        id: doc(collection(db, this.COLLECTIONS.PERFORMANCE)).id
      }];

      await updateDoc(doc(db, this.COLLECTIONS.PERFORMANCE, performanceHoje.id), {
        atividades: novasAtividades
      });
    } else {
      await this.registrarPerformance({
        corretorId,
        data: hoje,
        leadsGerados: 0,
        visitasRealizadas: 0,
        negociosFechados: 0,
        receitaGerada: 0,
        tempoOnline: 0,
        atividades: [{
          ...atividade,
          id: doc(collection(db, this.COLLECTIONS.PERFORMANCE)).id,
          tipo: atividade.tipo,
          descricao: atividade.descricao,
          dataHora: atividade.dataHora
        }]
      });
    }
  }
}
