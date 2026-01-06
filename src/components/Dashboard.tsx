import React from 'react';
import { Client } from '../types';
import { TrendingUp, Users, AlertTriangle, Activity, Calendar, Target } from 'lucide-react';

interface DashboardProps {
  clients: Client[];
}

export const Dashboard: React.FC<DashboardProps> = ({ clients }) => {
  // Calculate funnel metrics
  const journeyStatus = clients.reduce((acc, client) => {
    acc[client.statusJornada] = (acc[client.statusJornada] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalClients = clients.length;
  const journeyPercentage = totalClients > 0 ? 
    Object.entries(journeyStatus).map(([status, count]) => ({
      status,
      count,
      percentage: ((count / totalClients) * 100).toFixed(1)
    })) : [];

  // Filter recent leads (last 60 days)
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  
  const recentLeads = clients.filter(client => {
    const cadastroDate = new Date(client.dataCadastro.split('/').reverse().join('-'));
    return cadastroDate >= sixtyDaysAgo;
  });

  // Health indicators
  const fifteenDaysAgo = new Date();
  fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

  const inactiveClients = clients.filter(client => {
    const lastUpdate = new Date(client.ultimaAtualizacao.split('/').reverse().join('-'));
    return lastUpdate < fifteenDaysAgo;
  });

  const activeClients = clients.filter(client => {
    const lastUpdate = new Date(client.ultimaAtualizacao.split('/').reverse().join('-'));
    return lastUpdate >= fifteenDaysAgo;
  });

  // Temperature distribution
  const temperatureStats = clients.reduce((acc, client) => {
    acc[client.temperatura] = (acc[client.temperatura] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em Jornada': return 'bg-blue-500';
      case 'Pausa': return 'bg-yellow-500';
      case 'Desistiu': return 'bg-gray-500';
      case 'Comprou Comigo': return 'bg-green-500';
      case 'Comprou na Concorrência': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getTemperatureColor = (temp: string) => {
    switch (temp.toLowerCase()) {
      case 'quente': return 'text-red-600';
      case 'morno': return 'text-yellow-600';
      case 'frio': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Diagnóstico da Carteira</h2>
        <p className="text-gray-600">Painel de Controle e Inteligência de Negócio</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Clientes</p>
              <p className="text-2xl font-bold text-gray-800">{totalClients}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Leads Recentes (60 dias)</p>
              <p className="text-2xl font-bold text-green-600">{recentLeads.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Clientes Ativos</p>
              <p className="text-2xl font-bold text-blue-600">{activeClients.length}</p>
            </div>
            <Activity className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inativos (+15 dias)</p>
              <p className="text-2xl font-bold text-red-600">{inactiveClients.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Funnel Metrics */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Métricas de Funil
        </h3>
        <div className="space-y-3">
          {journeyPercentage.map(({ status, count, percentage }) => (
            <div key={status} className="flex items-center">
              <div className="w-32 text-sm text-gray-700">{status}</div>
              <div className="flex-1 mx-4">
                <div className="bg-gray-200 rounded-full h-6 relative">
                  <div 
                    className={`${getStatusColor(status)} h-6 rounded-full flex items-center justify-end pr-2`}
                    style={{ width: `${percentage}%` }}
                  >
                    <span className="text-xs text-white font-medium">{count}</span>
                  </div>
                </div>
              </div>
              <div className="w-16 text-right text-sm font-medium text-gray-700">
                {percentage}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Temperature Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2" />
          Distribuição de Temperatura
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(temperatureStats).map(([temp, count]) => (
            <div key={temp} className="text-center p-4 border rounded-lg">
              <p className={`text-2xl font-bold ${getTemperatureColor(temp)}`}>{count}</p>
              <p className="text-sm text-gray-600">{temp}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Leads Alert */}
      {recentLeads.length > 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <Calendar className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-blue-700 font-medium mb-2">
                {recentLeads.length} novos leads entraram nos últimos 60 dias:
              </p>
              <div className="space-y-1">
                {recentLeads.map(client => (
                  <div key={client.id} className="text-sm text-blue-600">
                    • <span className="font-medium">{client.nome}</span> - {client.dataCadastro} ({client.canalAquisicao})
                  </div>
                ))}
              </div>
              <p className="text-xs text-blue-600 mt-2">
                Mantenha o foco no atendimento para garantir conversão.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Inactive Clients Alert */}
      {inactiveClients.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-red-700 font-medium mb-2">
                {inactiveClients.length} clientes inativos há mais de 15 dias:
              </p>
              <div className="space-y-1">
                {inactiveClients.slice(0, 5).map(client => (
                  <div key={client.id} className="text-sm text-red-600">
                    • <span className="font-medium">{client.nome}</span> - última atualização: {client.ultimaAtualizacao}
                  </div>
                ))}
                {inactiveClients.length > 5 && (
                  <div className="text-xs text-red-500">
                    ... e mais {inactiveClients.length - 5} clientes
                  </div>
                )}
              </div>
              <p className="text-xs text-red-600 mt-2">
                Considere retomar o contato para reengajar.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Health Summary */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Saúde da Carteira</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Oxigenados (Visita recente)</h4>
            <div className="space-y-1">
              {clients
                .filter(client => client.qtdeVisitas > 0)
                .slice(0, 5)
                .map(client => (
                  <div key={client.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{client.nome}</span>
                    <span className="text-green-600 font-medium">{client.qtdeVisitas} visitas</span>
                  </div>
                ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Sem Movimento</h4>
            <div className="space-y-1">
              {inactiveClients.slice(0, 5).map(client => (
                <div key={client.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{client.nome}</span>
                  <span className="text-red-600 font-medium">
                    {client.ultimaAtualizacao}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
