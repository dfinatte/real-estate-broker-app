import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

// Função para criar dados iniciais de teste
export const criarDadosIniciais = async () => {
  try {
    // Criar corretores de exemplo
    const corretoresRef = collection(db, 'corretores');
    
    const corretoresExemplo = [
      {
        nome: 'João Silva',
        email: 'joao@imobiliaria.com',
        telefone: '(11) 98765-4321',
        status: 'online',
        leadsHoje: 8,
        leadsMes: 45,
        visitasHoje: 3,
        visitasMes: 28,
        negociosMes: 4,
        ticketMedio: 580000,
        metaLeads: 50,
        metaVisitas: 30,
        ultimaAtividade: '2024-01-05 15:30',
        especialidade: 'Residencial',
        dataCadastro: new Date().toISOString(),
        role: 'corretor',
        ativo: true
      },
      {
        nome: 'Maria Santos',
        email: 'maria@imobiliaria.com',
        telefone: '(11) 97654-3210',
        status: 'offline',
        leadsHoje: 5,
        leadsMes: 38,
        visitasHoje: 2,
        visitasMes: 22,
        negociosMes: 3,
        ticketMedio: 420000,
        metaLeads: 40,
        metaVisitas: 25,
        ultimaAtividade: '2024-01-05 14:20',
        especialidade: 'Comercial',
        dataCadastro: new Date().toISOString(),
        role: 'corretor',
        ativo: true
      },
      {
        nome: 'Carlos Oliveira',
        email: 'carlos@imobiliaria.com',
        telefone: '(11) 96543-2109',
        status: 'ausente',
        leadsHoje: 12,
        leadsMes: 52,
        visitasHoje: 4,
        visitasMes: 31,
        negociosMes: 6,
        ticketMedio: 750000,
        metaLeads: 45,
        metaVisitas: 28,
        ultimaAtividade: '2024-01-05 12:15',
        especialidade: 'Alto Padrão',
        dataCadastro: new Date().toISOString(),
        role: 'gerente',
        ativo: true
      },
      {
        nome: 'Ana Costa',
        email: 'ana@imobiliaria.com',
        telefone: '(11) 95432-1098',
        status: 'reuniao',
        leadsHoje: 6,
        leadsMes: 41,
        visitasHoje: 2,
        visitasMes: 25,
        negociosMes: 2,
        ticketMedio: 380000,
        metaLeads: 40,
        metaVisitas: 25,
        ultimaAtividade: '2024-01-05 16:45',
        especialidade: 'Residencial',
        dataCadastro: new Date().toISOString(),
        role: 'corretor',
        ativo: true
      }
    ];

    // Adicionar corretores ao Firestore
    for (const corretor of corretoresExemplo) {
      await addDoc(corretoresRef, corretor);
    }

    console.log('Dados iniciais criados com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao criar dados iniciais:', error);
    return false;
  }
};

// Função para verificar se já existem dados
export const verificarDadosExistentes = async () => {
  try {
    const corretoresRef = collection(db, 'corretores');
    const q = query(corretoresRef, limit(1));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Erro ao verificar dados existentes:', error);
    return false;
  }
};
