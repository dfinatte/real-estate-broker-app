import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  Target, Clock,
  DollarSign, Download, Award, Calendar
} from 'lucide-react';
import { useTeam } from '../contexts/TeamContext';

const TeamReports: React.FC = () => {
  const { corretores, performances, carregarPerformances } = useTeam();
  
  const [selectedPeriod, setSelectedPeriod] = useState<'7' | '15' | '30' | '90'>('30');

  // Carregar dados quando mudar o período ou quando houver mudanças nos corretores
  useEffect(() => {
    const loadData = async () => {
      if (corretores.length > 0) {
        try {
          // Carregar performances de todos os corretores para garantir dados atualizados
          for (const corretor of corretores) {
            await carregarPerformances(corretor.id, parseInt(selectedPeriod));
          }
        } catch (error) {
          console.error('Erro ao carregar dados:', error);
        }
      }
    };

    loadData();
    
    // Configurar intervalo para atualização automática a cada 30 segundos
    const interval = setInterval(loadData, 30000);
    
    return () => clearInterval(interval);
  }, [corretores, selectedPeriod, carregarPerformances]);

  // Métricas reais baseadas nas performances
  const metrics = useMemo(() => {
    const totalLeads = performances.reduce((sum, p) => sum + p.leadsGerados, 0);
    const totalVisitas = performances.reduce((sum, p) => sum + p.visitasRealizadas, 0);
    const totalNegocios = performances.reduce((sum, p) => sum + p.negociosFechados, 0);
    const totalReceita = performances.reduce((sum, p) => sum + p.receitaGerada, 0);

    return {
      totalLeads,
      totalVisitas,
      totalNegocios,
      totalReceita,
      avgTicketMedio: totalNegocios > 0 ? totalReceita / totalNegocios : 0,
      taxaConversao: totalLeads > 0 ? (totalNegocios / totalLeads) * 100 : 0,
      visitasPorLead: totalLeads > 0 ? totalVisitas / totalLeads : 0
    };
  }, [performances]);

  // Dados para gráficos baseados nas performances
  const getChartData = () => {
    return corretores.map(corretor => {
      const perfCorretor = performances.filter(p => p.corretorId === corretor.id);
      const leads = perfCorretor.reduce((sum, p) => sum + p.leadsGerados, 0);
      const visitas = perfCorretor.reduce((sum, p) => sum + p.visitasRealizadas, 0);
      const negocios = perfCorretor.reduce((sum, p) => sum + p.negociosFechados, 0);
      const receita = perfCorretor.reduce((sum, p) => sum + p.receitaGerada, 0);

      return {
        name: corretor.nome.split(' ')[0],
        leads,
        visitas,
        negocios,
        receita,
        metaLeads: corretor.metaLeads,
        metaVisitas: corretor.metaVisitas,
        metaProgress: corretor.metaLeads > 0 ? Math.round((leads / corretor.metaLeads) * 100) : 0
      };
    });
  };

  const getPerformanceData = () => {
    const days = parseInt(selectedPeriod);
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      
      const dayPerformances = performances.filter(p => {
        const pDate = new Date(p.data);
        return pDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) === dateStr;
      });

      data.push({
        date: dateStr,
        leads: dayPerformances.reduce((sum, p) => sum + p.leadsGerados, 0),
        visitas: dayPerformances.reduce((sum, p) => sum + p.visitasRealizadas, 0),
        negocios: dayPerformances.reduce((sum, p) => sum + p.negociosFechados, 0)
      });
    }
    
    return data;
  };

  const getDistributionData = () => {
    const especialidades = corretores.reduce((acc, corretor) => {
      acc[corretor.especialidade] = (acc[corretor.especialidade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(especialidades).map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / corretores.length) * 100)
    }));
  };

  // KPIs gerais (agora usamos metrics)
  // const totalLeads = corretores.reduce((sum, c) => sum + c.leadsMes, 0);
  // const totalVisitas = corretores.reduce((sum, c) => sum + c.visitasMes, 0);
  // const totalNegocios = corretores.reduce((sum, c) => sum + c.negociosMes, 0);
  // const totalReceita = corretores.reduce((sum, c) => sum + (c.ticketMedio * c.negociosMes), 0);
  // const avgTicketMedio = corretores.length > 0 ? totalReceita / totalNegocios : 0;

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // Todos os usuários agora têm acesso aos relatórios
  // A verificação de permissão foi removida para permitir acesso universal

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📊 Relatórios da Equipe</h1>
            <p className="text-gray-600 mt-1">Análise detalhada de performance e métricas</p>
          </div>
          
          <div className="flex gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="15">Últimos 15 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
            </select>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* KPIs Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 text-blue-600" />
            <span className="text-sm font-medium text-green-600">
              {metrics.totalLeads > 0 ? '+' : ''}
              {metrics.totalLeads}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{metrics.totalLeads}</h3>
          <p className="text-sm text-gray-600 mt-1">Total de Leads</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-green-600" />
            <span className="text-sm font-medium text-green-600">
              {metrics.totalVisitas > 0 ? '+' : ''}
              {metrics.totalVisitas}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{metrics.totalVisitas}</h3>
          <p className="text-sm text-gray-600 mt-1">Total de Visitas</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Award className="w-8 h-8 text-purple-600" />
            <span className="text-sm font-medium text-green-600">
              {metrics.totalNegocios > 0 ? '+' : ''}
              {metrics.totalNegocios}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{metrics.totalNegocios}</h3>
          <p className="text-sm text-gray-600 mt-1">Negócios Fechados</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-orange-600" />
            <span className="text-sm font-medium text-green-600">
              {metrics.totalReceita > 0 ? '+' : ''}
              R${(metrics.totalReceita / 1000).toFixed(0)}K
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            R${(metrics.totalReceita / 1000000).toFixed(1)}M
          </h3>
          <p className="text-sm text-gray-600 mt-1">Receita Total</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Performance por Corretor */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Performance por Corretor</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="leads" fill="#3B82F6" name="Leads" />
              <Bar dataKey="visitas" fill="#10B981" name="Visitas" />
              <Bar dataKey="negocios" fill="#8B5CF6" name="Negócios" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Evolução Temporal */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Evolução Temporal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getPerformanceData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="leads" stroke="#3B82F6" name="Leads" strokeWidth={2} />
              <Line type="monotone" dataKey="visitas" stroke="#10B981" name="Visitas" strokeWidth={2} />
              <Line type="monotone" dataKey="negocios" stroke="#8B5CF6" name="Negócios" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribuição por Especialidade */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Distribuição por Especialidade</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={getDistributionData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getDistributionData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Top Performers</h3>
          <div className="space-y-3">
            {getChartData()
              .sort((a, b) => b.leads - a.leads)
              .slice(0, 5)
              .map((corretor, index) => (
                <div key={corretor.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-600' : 'bg-blue-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{corretor.name}</p>
                      <p className="text-sm text-gray-600">Leads: {corretor.leads}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{corretor.leads}</p>
                    <p className="text-xs text-gray-600">leads</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Métricas de Eficiência */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Métricas de Eficiência</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Taxa de Conversão</span>
                <span className="text-sm font-bold text-green-600">
                  {metrics.taxaConversao.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(metrics.taxaConversao, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Ticket Médio</span>
                <span className="text-sm font-bold text-purple-600">
                  R${(metrics.avgTicketMedio / 1000).toFixed(0)}K
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((metrics.avgTicketMedio / 1000000) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Visitas/Lead</span>
                <span className="text-sm font-bold text-blue-600">
                  {metrics.visitasPorLead.toFixed(1)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(metrics.visitasPorLead * 20, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer com informações de atualização */}
      <div className="mt-8 bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-center">
          <Calendar className="w-5 h-5 text-gray-400 mr-2" />
          <span className="text-sm text-gray-600">
            Última atualização: {new Date().toLocaleString('pt-BR')}
          </span>
          <span className="text-xs text-green-600 ml-2">• Auto-atualização ativada</span>
        </div>
      </div>
    </div>
  );
};

export default TeamReports;
