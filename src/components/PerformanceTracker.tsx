import React, { useState, useEffect } from 'react';
import { 
  Target, Clock, AlertTriangle, 
  Activity, DollarSign, 
  CheckCircle, XCircle
} from 'lucide-react';
import { useTeam } from '../contexts/TeamContext';

interface PerformanceTrackerProps {
  corretorId?: string;
  viewMode?: 'individual' | 'equipe';
}

const PerformanceTracker: React.FC<PerformanceTrackerProps> = ({ 
  corretorId, 
  viewMode = 'individual' 
}) => {
  const {
    corretores,
    carregarPerformances,
    registrarPerformance,
    criarNotificacao,
    verificarPermissao
  } = useTeam();

  const [selectedCorretor, setSelectedCorretor] = useState<string>(corretorId || '');
  const [hojePerformance, setHojePerformance] = useState<any>({
    leadsGerados: 0,
    visitasRealizadas: 0,
    negociosFechados: 0,
    receitaGerada: 0
  });

  const [metaProgress, setMetaProgress] = useState({
    leadsPercent: 0,
    visitasPercent: 0,
    negociosPercent: 0
  });

  // Carregar performances quando selecionar corretor
  useEffect(() => {
    if (selectedCorretor) {
      carregarPerformances(selectedCorretor, 30);
    }
  }, [selectedCorretor, carregarPerformances]);

  // Calcular progresso de metas
  useEffect(() => {
    if (selectedCorretor) {
      const corretor = corretores.find(c => c.id === selectedCorretor);
      if (corretor) {
        setMetaProgress({
          leadsPercent: Math.min((corretor.leadsMes / corretor.metaLeads) * 100, 100),
          visitasPercent: Math.min((corretor.visitasMes / corretor.metaVisitas) * 100, 100),
          negociosPercent: Math.min((corretor.negociosMes / 10) * 100, 100) // Meta padrão de 10 negócios/mês
        });
      }
    }
  }, [selectedCorretor, corretores]);

  // Registrar nova atividade
  const handleRegistrarAtividade = async (tipo: string, valor: number = 1) => {
    if (!selectedCorretor || !verificarPermissao('gerenciarEquipe')) return;

    try {
      const hoje = new Date().toISOString().split('T')[0];
      
      await registrarPerformance({
        corretorId: selectedCorretor,
        data: hoje,
        leadsGerados: tipo === 'lead' ? valor : 0,
        visitasRealizadas: tipo === 'visita' ? valor : 0,
        negociosFechados: tipo === 'negocio' ? valor : 0,
        receitaGerada: tipo === 'receita' ? valor : 0,
        tempoOnline: 0,
        atividades: [{
          id: Date.now().toString(),
          tipo: tipo as any,
          descricao: `${tipo === 'lead' ? 'Lead gerado' : tipo === 'visita' ? 'Visita realizada' : tipo === 'negocio' ? 'Negócio fechado' : 'Receita gerada'}`,
          dataHora: new Date().toISOString(),
          valor: tipo === 'receita' ? valor : undefined
        }]
      });

      // Criar notificação se atingir meta
      const corretor = corretores.find(c => c.id === selectedCorretor);
      if (corretor) {
        if (tipo === 'lead' && corretor.leadsMes >= corretor.metaLeads) {
          await criarNotificacao({
            destinatarioId: corretorId || '',
            titulo: '🎯 Meta de Leads Atingida!',
            mensagem: `Parabéns! Você atingiu sua meta de ${corretor.metaLeads} leads este mês.`,
            tipo: 'sucesso',
            lida: false,
            dataCriacao: new Date().toISOString()
          });
        }
      }

      // Atualizar estado local
      setHojePerformance((prev: any) => ({
        ...prev,
        [tipo === 'lead' ? 'leadsGerados' : tipo === 'visita' ? 'visitasRealizadas' : tipo === 'negocio' ? 'negociosFechados' : 'receitaGerada']: 
          prev[tipo === 'lead' ? 'leadsGerados' : tipo === 'visita' ? 'visitasRealizadas' : tipo === 'negocio' ? 'negociosFechados' : 'receitaGerada'] + valor
      }));

    } catch (error) {
      console.error('Erro ao registrar atividade:', error);
    }
  };

  const getCorretorInfo = () => {
    if (!selectedCorretor) return null;
    return corretores.find(c => c.id === selectedCorretor);
  };

  const corretorInfo = getCorretorInfo();

  if (viewMode === 'individual' && !corretorInfo) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">Selecione um corretor para acompanhar a performance</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {viewMode === 'individual' ? '📊 Performance Individual' : '📈 Performance da Equipe'}
            </h2>
            <p className="text-gray-600 mt-1">
              {viewMode === 'individual' && corretorInfo 
                ? `Acompanhamento em tempo real - ${corretorInfo.nome}`
                : 'Visão geral da equipe'
              }
            </p>
          </div>
          
          {viewMode === 'individual' && (
            <select
              value={selectedCorretor}
              onChange={(e) => setSelectedCorretor(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione um corretor</option>
              {corretores.map(corretor => (
                <option key={corretor.id} value={corretor.id}>
                  {corretor.nome} - {corretor.especialidade}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* KPIs do Dia */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Leads Hoje</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {corretorInfo?.leadsHoje || hojePerformance.leadsGerados}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              Meta: {corretorInfo?.metaLeads || 0}/mês
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6 text-green-600" />
              <span className="text-sm font-medium text-green-800">Visitas Hoje</span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {corretorInfo?.visitasHoje || hojePerformance.visitasRealizadas}
            </div>
            <div className="text-xs text-green-600 mt-1">
              Meta: {corretorInfo?.metaVisitas || 0}/mês
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-6 h-6 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Negócios</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {corretorInfo?.negociosMes || hojePerformance.negociosFechados}
            </div>
            <div className="text-xs text-purple-600 mt-1">Este mês</div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-6 h-6 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Ticket Médio</span>
            </div>
            <div className="text-2xl font-bold text-orange-900">
              R${((corretorInfo?.ticketMedio || 0) / 1000).toFixed(0)}K
            </div>
            <div className="text-xs text-orange-600 mt-1">Por negócio</div>
          </div>
        </div>
      </div>

      {/* Progresso de Metas */}
      {viewMode === 'individual' && corretorInfo && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Progresso das Metas Mensais</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Leads</span>
                <span className="text-sm text-gray-600">
                  {corretorInfo.leadsMes}/{corretorInfo.metaLeads} ({metaProgress.leadsPercent.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    metaProgress.leadsPercent >= 100 ? 'bg-green-600' : 
                    metaProgress.leadsPercent >= 75 ? 'bg-blue-600' : 
                    metaProgress.leadsPercent >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${metaProgress.leadsPercent}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Visitas</span>
                <span className="text-sm text-gray-600">
                  {corretorInfo.visitasMes}/{corretorInfo.metaVisitas} ({metaProgress.visitasPercent.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    metaProgress.visitasPercent >= 100 ? 'bg-green-600' : 
                    metaProgress.visitasPercent >= 75 ? 'bg-blue-600' : 
                    metaProgress.visitasPercent >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${metaProgress.visitasPercent}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Negócios</span>
                <span className="text-sm text-gray-600">
                  {corretorInfo.negociosMes}/10 ({metaProgress.negociosPercent.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    metaProgress.negociosPercent >= 100 ? 'bg-green-600' : 
                    metaProgress.negociosPercent >= 75 ? 'bg-blue-600' : 
                    metaProgress.negociosPercent >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${metaProgress.negociosPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controles Rápidos */}
      {verificarPermissao('gerenciarEquipe') && viewMode === 'individual' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Registrar Atividade</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => handleRegistrarAtividade('lead', 1)}
              className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Target className="w-8 h-8 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">+1 Lead</span>
            </button>

            <button
              onClick={() => handleRegistrarAtividade('visita', 1)}
              className="flex flex-col items-center gap-2 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Clock className="w-8 h-8 text-green-600" />
              <span className="text-sm font-medium text-green-800">+1 Visita</span>
            </button>

            <button
              onClick={() => handleRegistrarAtividade('negocio', 1)}
              className="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <DollarSign className="w-8 h-8 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">+1 Negócio</span>
            </button>

            <button
              onClick={() => {
                const valor = prompt('Valor da receita (R$):');
                if (valor && !isNaN(Number(valor))) {
                  handleRegistrarAtividade('receita', Number(valor));
                }
              }}
              className="flex flex-col items-center gap-2 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <Activity className="w-8 h-8 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">+ Receita</span>
            </button>
          </div>
        </div>
      )}

      {/* Alertas de Desempenho */}
      {viewMode === 'individual' && corretorInfo && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🚨 Alertas de Desempenho</h3>
          
          <div className="space-y-3">
            {metaProgress.leadsPercent < 50 && (
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm text-red-800">
                  ⚠️ Atenção: Meta de leads com menos de 50% do esperado
                </span>
              </div>
            )}

            {metaProgress.visitasPercent < 50 && (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  ⚠️ Meta de visitas abaixo do esperado
                </span>
              </div>
            )}

            {metaProgress.leadsPercent >= 100 && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-800">
                  🎉 Parabéns! Meta de leads atingida!
                </span>
              </div>
            )}

            {metaProgress.visitasPercent >= 100 && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-800">
                  🎉 Excelente! Meta de visitas alcançada!
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceTracker;
