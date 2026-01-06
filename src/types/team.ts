export interface Corretor {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  status: 'online' | 'offline' | 'ausente' | 'reuniao';
  leadsHoje: number;
  leadsMes: number;
  visitasHoje: number;
  visitasMes: number;
  negociosMes: number;
  ticketMedio: number;
  metaLeads: number;
  metaVisitas: number;
  ultimaAtividade: string;
  foto?: string;
  especialidade: string;
  dataCadastro: string;
  uid?: string; // Referência ao usuário de autenticação
  ativo: boolean;
  role: 'admin' | 'gerente' | 'corretor';
}

export interface Meta {
  id: string;
  corretorId: string;
  mes: string; // Formato: YYYY-MM
  metaLeads: number;
  metaVisitas: number;
  metaNegocios: number;
  metaReceita: number;
  criadaEm: string;
  atualizadaEm: string;
}

export interface Performance {
  id: string;
  corretorId: string;
  data: string; // Formato: YYYY-MM-DD
  leadsGerados: number;
  visitasRealizadas: number;
  negociosFechados: number;
  receitaGerada: number;
  tempoOnline: number; // minutos
  atividades: Atividade[];
}

export interface Atividade {
  id: string;
  tipo: 'lead' | 'visita' | 'negocio' | 'contato' | 'outro';
  descricao: string;
  dataHora: string;
  clienteId?: string;
  valor?: number;
}

export interface Notificacao {
  id: string;
  destinatarioId: string;
  remetenteId?: string;
  titulo: string;
  mensagem: string;
  tipo: 'info' | 'alerta' | 'sucesso' | 'meta' | 'sistema';
  lida: boolean;
  dataCriacao: string;
  dataLeitura?: string;
  acao?: {
    tipo: 'link' | 'funcao';
    valor: string;
  };
}

export interface Permissao {
  uid: string;
  role: 'admin' | 'gerente' | 'corretor';
  permissoes: {
    visualizarEquipe: boolean;
    gerenciarEquipe: boolean;
    verRelatorios: boolean;
    gerenciarMetas: boolean;
    enviarNotificacoes: boolean;
    acessarTodosDados: boolean;
  };
}
