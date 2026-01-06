import React, { useState, useEffect } from 'react';
import { 
  Bell, CheckCircle, AlertTriangle, Info, 
  X, Send, MessageSquare, Calendar,
  User, Filter, Search
} from 'lucide-react';
import { useTeam } from '../contexts/TeamContext';
import { Notificacao } from '../types/team';

const NotificationCenter: React.FC = () => {
  const {
    notificacoes,
    loading,
    carregarNotificacoes,
    marcarNotificacaoLida,
    criarNotificacao,
    criarNotificacaoGrupo,
    verificarPermissao,
    carregarPermissaoUsuario,
    definirPermissaoUsuario
  } = useTeam();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState<'todas' | 'nao-lidas' | 'lidas'>('nao-lidas');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    destinatarioId: '',
    titulo: '',
    mensagem: '',
    tipo: 'info' as Notificacao['tipo'],
    enviarParaGrupo: false
  });

  // Carregar notificações
  useEffect(() => {
    carregarNotificacoes(filter === 'nao-lidas');
  }, [carregarNotificacoes, filter]);

  // Filtrar notificações
  const filteredNotificacoes = notificacoes.filter(notif => {
    const matchesSearch = notif.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notif.mensagem.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'todas' || 
                         (filter === 'nao-lidas' && !notif.lida) ||
                         (filter === 'lidas' && notif.lida);
    
    return matchesSearch && matchesFilter;
  });

  // Marcar como lida
  const handleMarcarLida = async (id: string) => {
    await marcarNotificacaoLida(id);
    await carregarNotificacoes(filter === 'nao-lidas');
  };

  // Criar nova notificação
  const handleCriarNotificacao = async () => {
    if (!formData.titulo || !formData.mensagem) return;

    if (formData.enviarParaGrupo) {
      // Enviar para todo o grupo
      try {
        await criarNotificacaoGrupo({
          titulo: formData.titulo,
          mensagem: formData.mensagem,
          tipo: formData.tipo,
          lida: false,
          dataCriacao: new Date().toISOString()
        });

        // Reset form
        setFormData({
          destinatarioId: '',
          titulo: '',
          mensagem: '',
          tipo: 'info',
          enviarParaGrupo: false
        });
        setShowCreateForm(false);
        await carregarNotificacoes(filter === 'nao-lidas');
      } catch (error) {
        console.error('Erro ao criar notificação para o grupo:', error);
      }
    } else {
      // Enviar para destinatário específico
      if (!formData.destinatarioId) return;

      try {
        await criarNotificacao({
          destinatarioId: formData.destinatarioId,
          titulo: formData.titulo,
          mensagem: formData.mensagem,
          tipo: formData.tipo,
          lida: false,
          dataCriacao: new Date().toISOString()
        });

        // Reset form
        setFormData({
          destinatarioId: '',
          titulo: '',
          mensagem: '',
          tipo: 'info',
          enviarParaGrupo: false
        });
        setShowCreateForm(false);
        await carregarNotificacoes(filter === 'nao-lidas');
      } catch (error) {
        console.error('Erro ao criar notificação:', error);
      }
    }
  };

  // Obter ícone baseado no tipo
  const getNotificationIcon = (tipo: Notificacao['tipo']) => {
    switch (tipo) {
      case 'sucesso': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'alerta': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'meta': return <CheckCircle className="w-5 h-5 text-purple-600" />;
      case 'sistema': return <Info className="w-5 h-5 text-blue-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  // Obter cor de fundo baseada no tipo
  const getNotificationBgColor = (tipo: Notificacao['tipo']) => {
    switch (tipo) {
      case 'sucesso': return 'bg-green-50 border-green-200';
      case 'alerta': return 'bg-yellow-50 border-yellow-200';
      case 'meta': return 'bg-purple-50 border-purple-200';
      case 'sistema': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const naoLidasCount = notificacoes.filter(n => !n.lida).length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="w-8 h-8 text-blue-600" />
              {naoLidasCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {naoLidasCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Central de Notificações</h1>
              <p className="text-gray-600 mt-1">
                {naoLidasCount > 0 ? `${naoLidasCount} notificações não lidas` : 'Nenhuma notificação nova'}
              </p>
            </div>
          </div>
          
          {verificarPermissao('enviarNotificacoes') && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Send className="w-4 h-4" />
              Nova Notificação
            </button>
          )}

          {/* Botão temporário para habilitar permissões */}
          {!verificarPermissao('enviarNotificacoes') && (
            <button
              onClick={async () => {
                await definirPermissaoUsuario('corretor');
                await carregarPermissaoUsuario();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              title="Clique para habilitar permissões de notificação"
            >
              <Send className="w-4 h-4" />
              Habilitar Notificações
            </button>
          )}
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar notificações..."
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('todas')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'todas' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todas ({notificacoes.length})
            </button>
            <button
              onClick={() => setFilter('nao-lidas')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'nao-lidas' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Não Lidas ({naoLidasCount})
            </button>
            <button
              onClick={() => setFilter('lidas')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'lidas' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Lidas ({notificacoes.length - naoLidasCount})
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Notificações */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredNotificacoes.length === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'Nenhuma notificação encontrada para sua busca.' : 
               filter === 'nao-lidas' ? 'Nenhuma notificação não lida.' :
               'Nenhuma notificação encontrada.'}
            </p>
          </div>
        ) : (
          filteredNotificacoes.map((notificacao) => (
            <div
              key={notificacao.id}
              className={`bg-white rounded-xl p-6 shadow-sm border transition-all hover:shadow-md ${
                !notificacao.lida ? getNotificationBgColor(notificacao.tipo) : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {getNotificationIcon(notificacao.tipo)}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`font-semibold ${!notificacao.lida ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notificacao.titulo}
                      </h3>
                      {!notificacao.lida && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                          Nova
                        </span>
                      )}
                    </div>
                    
                    <p className={`${!notificacao.lida ? 'text-gray-800' : 'text-gray-600'} mb-3`}>
                      {notificacao.mensagem}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(notificacao.dataCriacao).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      
                      {notificacao.dataLeitura && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Lida em {new Date(notificacao.dataLeitura).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {!notificacao.lida && (
                    <button
                      onClick={() => handleMarcarLida(notificacao.id)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Marcar Lida
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Formulário de Nova Notificação */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Criar Nova Notificação</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-4">
                  <input
                    type="checkbox"
                    checked={formData.enviarParaGrupo}
                    onChange={(e) => setFormData({ ...formData, enviarParaGrupo: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  Enviar para todo o grupo
                </label>
              </div>

              {!formData.enviarParaGrupo && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destinatário (UID do usuário)
                  </label>
                  <input
                    type="text"
                    value={formData.destinatarioId}
                    onChange={(e) => setFormData({ ...formData, destinatarioId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="UID do usuário"
                    required={!formData.enviarParaGrupo}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Título da notificação"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem
                </label>
                <textarea
                  value={formData.mensagem}
                  onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Mensagem detalhada..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as Notificacao['tipo'] })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="info">Informação</option>
                  <option value="alerta">Alerta</option>
                  <option value="sucesso">Sucesso</option>
                  <option value="meta">Meta</option>
                  <option value="sistema">Sistema</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleCriarNotificacao}
                disabled={(!formData.enviarParaGrupo && !formData.destinatarioId) || !formData.titulo || !formData.mensagem}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {formData.enviarParaGrupo ? 'Enviar para Todo o Grupo' : 'Enviar Notificação'}
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
