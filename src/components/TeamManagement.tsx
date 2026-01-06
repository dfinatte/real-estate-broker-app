import React, { useState, useEffect } from 'react';
import { 
  Users, Target, Clock, 
  Phone, Mail, Award, AlertTriangle,
  Activity, DollarSign, Eye, Edit, UserPlus
} from 'lucide-react';
import { useTeam } from '../contexts/TeamContext';
import { Corretor } from '../types/team';
import AddCorretorForm from './AddCorretorForm';

const TeamManagement: React.FC = () => {
  const {
    corretores,
    loading,
    error,
    carregarCorretores,
    criarCorretor,
    verificarPermissao
  } = useTeam();

  const [selectedCorretor, setSelectedCorretor] = useState<Corretor | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    especialidade: 'Residencial',
    metaLeads: 50,
    metaVisitas: 30
  });

  // Carregar dados iniciais
  useEffect(() => {
    carregarCorretores();
  }, [carregarCorretores]);

  // Filtrar corretores
  const filteredCorretores = corretores.filter(corretor => {
    const matchesSearch = corretor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         corretor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'todos' || corretor.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-gray-400';
      case 'ausente': return 'bg-yellow-500';
      case 'reuniao': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return '🟢';
      case 'offline': return '⚪';
      case 'ausente': return '🟡';
      case 'reuniao': return '🔵';
      default: return '⚪';
    }
  };

  // Calcular métricas gerais
  const totalLeadsHoje = corretores.reduce((sum, c) => sum + c.leadsHoje, 0);
  const totalVisitasHoje = corretores.reduce((sum, c) => sum + c.visitasHoje, 0);
  const totalNegociosMes = corretores.reduce((sum, c) => sum + c.negociosMes, 0);
  const onlineCount = corretores.filter(c => c.status === 'online').length;
  const offlineCount = corretores.filter(c => c.status === 'offline').length;

  // Handlers
  const handleCreateCorretor = async () => {
    try {
      await criarCorretor({
        ...formData,
        status: 'offline',
        leadsHoje: 0,
        leadsMes: 0,
        visitasHoje: 0,
        visitasMes: 0,
        negociosMes: 0,
        ticketMedio: 0,
        ultimaAtividade: new Date().toISOString(),
        dataCadastro: new Date().toISOString(),
        ativo: true,
        role: 'corretor'
      });
      
      // Reset form
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        especialidade: 'Residencial',
        metaLeads: 50,
        metaVisitas: 30
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Erro ao criar corretor:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando equipe...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={carregarCorretores}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">👥 Equipe de Corretores</h1>
            <p className="text-gray-600 mt-2">Monitore a performance e atividade da sua equipe em tempo real</p>
          </div>
          {verificarPermissao('gerenciarEquipe') && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Adicionar Corretor
            </button>
          )}
        </div>
      </div>

      {/* KPIs Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-blue-600" />
            <span className="text-sm font-medium text-green-600">+15%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{onlineCount}</h3>
          <p className="text-sm text-gray-600 mt-1">Corretores Online</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 text-green-600" />
            <span className="text-sm font-medium text-green-600">+8%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{totalLeadsHoje}</h3>
          <p className="text-sm text-gray-600 mt-1">Leads Hoje</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-purple-600" />
            <span className="text-sm font-medium text-green-600">+12%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{totalVisitasHoje}</h3>
          <p className="text-sm text-gray-600 mt-1">Visitas Hoje</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-orange-600" />
            <span className="text-sm font-medium text-green-600">+25%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{totalNegociosMes}</h3>
          <p className="text-sm text-gray-600 mt-1">Negócios no Mês</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Corretor</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nome ou email..."
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('todos')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'todos' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todos ({corretores.length})
            </button>
            <button
              onClick={() => setFilterStatus('online')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'online' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Online ({onlineCount})
            </button>
            <button
              onClick={() => setFilterStatus('offline')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'offline' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Offline ({offlineCount})
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Corretores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCorretores.map((corretor) => (
          <div
            key={corretor.id}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => {
              setSelectedCorretor(corretor);
              setShowDetails(true);
            }}
          >
            {/* Header do Card */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(corretor.status)}`}></div>
                <div>
                  <h3 className="font-semibold text-gray-900">{corretor.nome}</h3>
                  <p className="text-sm text-gray-600">{corretor.especialidade}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Status e Contato */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">{getStatusIcon(corretor.status)}</span>
                <span className="text-sm font-medium text-gray-700">{corretor.status}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{corretor.telefone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{corretor.email}</span>
              </div>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-800">Leads</span>
                </div>
                <div className="text-lg font-bold text-blue-900">{corretor.leadsHoje}</div>
                <div className="text-xs text-blue-600">hoje</div>
                <div className="text-sm text-blue-800">{corretor.leadsMes}/50</div>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((corretor.leadsMes / corretor.metaLeads) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-green-800">Visitas</span>
                </div>
                <div className="text-lg font-bold text-green-900">{corretor.visitasHoje}</div>
                <div className="text-xs text-green-600">hoje</div>
                <div className="text-sm text-green-800">{corretor.visitasMes}/{corretor.metaVisitas}</div>
                <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((corretor.visitasMes / corretor.metaVisitas) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-medium text-purple-800">Negócios</span>
                </div>
                <div className="text-lg font-bold text-purple-900">{corretor.negociosMes}</div>
                <div className="text-xs text-purple-600">este mês</div>
                <div className="text-sm text-purple-800">
                  R${(corretor.ticketMedio / 1000).toFixed(0)}K médio
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-medium text-orange-800">Atividade</span>
                </div>
                <div className="text-xs text-orange-600">Última atividade:</div>
                <div className="text-sm font-medium text-orange-900">{corretor.ultimaAtividade}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Detalhes */}
      {showDetails && selectedCorretor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Detalhes do Corretor</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informações Pessoais */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-3">Informações Pessoais</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm"><strong>Nome:</strong> {selectedCorretor.nome}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm"><strong>Email:</strong> {selectedCorretor.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm"><strong>Telefone:</strong> {selectedCorretor.telefone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-gray-400" />
                    <span className="text-sm"><strong>Especialidade:</strong> {selectedCorretor.especialidade}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedCorretor.status)}`}></div>
                    <span className="text-sm"><strong>Status:</strong> {selectedCorretor.status}</span>
                  </div>
                </div>
              </div>

              {/* Métricas Detalhadas */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-3">Métricas de Performance</h3>
                <div className="space-y-3">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">🎯 Leads</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><strong>Hoje:</strong> {selectedCorretor.leadsHoje}</div>
                      <div><strong>Mês:</strong> {selectedCorretor.leadsMes}</div>
                      <div><strong>Meta:</strong> {selectedCorretor.metaLeads}</div>
                      <div><strong>% Meta:</strong> {((selectedCorretor.leadsMes / selectedCorretor.metaLeads) * 100).toFixed(1)}%</div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">🕐 Visitas</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><strong>Hoje:</strong> {selectedCorretor.visitasHoje}</div>
                      <div><strong>Mês:</strong> {selectedCorretor.visitasMes}</div>
                      <div><strong>Meta:</strong> {selectedCorretor.metaVisitas}</div>
                      <div><strong>% Meta:</strong> {((selectedCorretor.visitasMes / selectedCorretor.metaVisitas) * 100).toFixed(1)}%</div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-medium text-purple-900 mb-2">💰 Negócios</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><strong>Mês:</strong> {selectedCorretor.negociosMes}</div>
                      <div><strong>Ticket Médio:</strong> R${(selectedCorretor.ticketMedio / 1000).toFixed(0)}K</div>
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4">
                    <h4 className="font-medium text-orange-900 mb-2">⏰ Atividade</h4>
                    <div className="text-sm">
                      <div><strong>Última Atividade:</strong> {selectedCorretor.ultimaAtividade}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  📧 Enviar Mensagem
                </button>
                <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  📊 Ver Relatório
                </button>
                <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  ⚙️ Configurar Metas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulário de Adicionar Corretor */}
      {showAddForm && (
        <AddCorretorForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreateCorretor}
          onCancel={() => setShowAddForm(false)}
          loading={loading}
        />
      )}
    </div>
  );
};

export default TeamManagement;
