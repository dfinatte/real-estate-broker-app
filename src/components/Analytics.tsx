import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarRadiusAxis, Radar,
  Area, AreaChart, Funnel, FunnelChart
} from 'recharts';
import { 
  TrendingUp, Users, Home, DollarSign, 
  Clock, Phone, Target, Activity, Calendar, Download, FileSpreadsheet
} from 'lucide-react';
import HeatMap from './HeatMap';
import { ExportService } from '../utils/exportService';
import { AnalyticsCalculator } from '../utils/analyticsCalculator';
import { Client, ContactRecord, VisitRecord } from '../types';

interface AnalyticsProps {
  clients: Client[];
  contactRecords: ContactRecord[];
  visitRecords: VisitRecord[];
}

const Analytics: React.FC<AnalyticsProps> = ({ clients, contactRecords, visitRecords }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [isExporting, setIsExporting] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(() => 
    AnalyticsCalculator.calculateAllAnalytics(clients, contactRecords, visitRecords)
  );

  // Atualizar dados quando os clientes mudam
  useEffect(() => {
    setAnalyticsData(AnalyticsCalculator.calculateAllAnalytics(clients, contactRecords, visitRecords));
  }, [clients, contactRecords, visitRecords]);

  const {
    funnelData,
    conversionData,
    propertyTypesData,
    leadOriginsData,
    avgTimeData,
    ticketMedioData,
    performanceData,
    kpis
  } = analyticsData;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Função de exportação para Google Sheets
  const handleExportToGoogleSheets = async () => {
    setIsExporting(true);
    
    try {
      const exportData = {
        ...analyticsData,
        regionsData: AnalyticsCalculator.calculateRegionsData(clients)
      };

      await ExportService.exportToGoogleSheets(exportData);
      
      // Mostrar mensagem de sucesso
      alert('✅ Dados exportados com sucesso!\n\n1. O arquivo CSV foi baixado automaticamente\n2. Uma nova aba do Google Sheets foi aberta\n3. Importe o arquivo CSV para visualizar os dados');
      
    } catch (error) {
      console.error('Erro na exportação:', error);
      alert('❌ Erro ao exportar dados. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📊 Analytics - ABC Paulista</h1>
            <p className="text-gray-600 mt-2">Métricas e insights para imobiliária no ABC Paulista</p>
          </div>
          <div className="flex gap-2">
            {['7d', '30d', '90d', '1y'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {period === '7d' && '7 dias'}
                {period === '30d' && '30 dias'}
                {period === '90d' && '90 dias'}
                {period === '1y' && '1 ano'}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <kpi.icon className={`w-8 h-8 ${kpi.color}`} />
                <span className={`text-sm font-medium ${
                  kpi.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {kpi.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{kpi.value}</h3>
              <p className="text-sm text-gray-600 mt-1">{kpi.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Grid de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Funil de Vendas */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">🎯 Funil de Vendas</h2>
            <Target className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <FunnelChart>
              <Tooltip content={<CustomTooltip />} />
              <Funnel dataKey="value" data={funnelData} />
            </FunnelChart>
          </ResponsiveContainer>
        </div>

        {/* 2. Taxa de Conversão Mensal */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">📈 Taxa de Conversão</h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={conversionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="meta" stroke="#EF4444" name="Meta" strokeWidth={2} />
              <Line type="monotone" dataKey="realizado" stroke="#10B981" name="Realizado" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 3. Distribuição por Tipo de Imóvel */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">🏠 Tipos de Imóveis</h2>
            <Home className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={propertyTypesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {propertyTypesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 4. Origem dos Leads */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">📱 Origem dos Leads</h2>
            <Phone className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={leadOriginsData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {leadOriginsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 5. Tempo Médio de Conversão */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">⏰ Tempo por Etapa</h2>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={avgTimeData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="stage" type="category" width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="days" fill="#F59E0B" name="Atual" />
              <Bar dataKey="meta" fill="#EF4444" name="Meta" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 6. Ticket Médio */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">💰 Ticket Médio</h2>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={ticketMedioData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                content={<CustomTooltip />}
                formatter={(value: any) => [`R$${value.toLocaleString('pt-BR')}`, 'Valor']}
              />
              <Area type="monotone" dataKey="valor" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 7. Performance Radar */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">🎯 Performance Geral</h2>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={performanceData}>
              <PolarGrid />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Atual" dataKey="atual" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              <Radar name="Meta" dataKey="meta" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 8. Mapa de Calor */}
        <div className="lg:col-span-2">
          <HeatMap />
        </div>

      </div>

      {/* Footer Analytics */}
      <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              Última atualização: {new Date().toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Dados dos últimos {selectedPeriod}</span>
            <div className="flex gap-2">
              <button
                onClick={handleExportToGoogleSheets}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileSpreadsheet className="w-4 h-4" />
                {isExporting ? 'Exportando...' : '� Google Sheets'}
              </button>
              <button
                onClick={() => {
                const exportData = {
                  ...analyticsData,
                  regionsData: AnalyticsCalculator.calculateRegionsData(clients)
                };
                  ExportService.downloadCSV(ExportService.generateCSV(exportData), 'relatorio-abc-paulista-excel');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                📥 Excel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
