// Serviço de Exportação para Google Sheets

export interface ExportData {
  funnelData: any[];
  conversionData: any[];
  propertyTypesData: any[];
  leadOriginsData: any[];
  avgTimeData: any[];
  ticketMedioData: any[];
  performanceData: any[];
  regionsData: any[];
  kpis: any[];
}

export class ExportService {
  // Gerar CSV para Google Sheets
  static generateCSV(data: ExportData): string {
    const csvContent: string[] = [];
    
    // Header principal
    csvContent.push('RELATÓRIO COMPLETO - ABC PAULISTA IMÓVEIS');
    csvContent.push(`Data de Geração: ${new Date().toLocaleString('pt-BR')}`);
    csvContent.push(`Período: Últimos 30 dias`);
    csvContent.push('');

    // Resumo Executivo
    csvContent.push('RESUMO EXECUTIVO');
    csvContent.push('Métrica,Valor,Variação Mês Anterior,Status');
    data.kpis.forEach(kpi => {
      const status = kpi.change.startsWith('+') ? '✅ Positivo' : '⚠️ Atenção';
      csvContent.push(`"${kpi.title}","${kpi.value}","${kpi.change}","${status}"`);
    });
    csvContent.push('');

    // Funil de Vendas Detalhado
    csvContent.push('FUNIL DE VENDAS - DETALHADO');
    csvContent.push('Etapa,Quantidade,Taxa Conversão,Meta,Desempenho');
    const totalLeads = data.funnelData[0]?.value || 0;
    data.funnelData.forEach((item, index) => {
      const conversionRate = index > 0 ? ((item.value / data.funnelData[index - 1].value) * 100).toFixed(1) : '100.0';
      const meta = Math.floor(totalLeads * (1 - index * 0.2)); // Meta decrescente
      const performance = item.value >= meta ? '✅ Meta Atingida' : '⚠️ Abaixo da Meta';
      csvContent.push(`"${item.name}",${item.value},${conversionRate}%,${meta},"${performance}"`);
    });
    csvContent.push('');

    // Taxa de Conversão Mensal Detalhada
    csvContent.push('TAXA DE CONVERSÃO MENSAL - DETALHADA');
    csvContent.push('Mês,Meta,Realizado,Taxa Real,Desempenho');
    data.conversionData.forEach(item => {
      const taxaReal = item.meta > 0 ? ((item.realizado / item.meta) * 100).toFixed(1) : '0.0';
      const desempenho = item.realizado >= item.meta ? '✅ Meta Atingida' : '⚠️ Abaixo da Meta';
      csvContent.push(`${item.month},${item.meta},${item.realizado},${taxaReal}%,"${desempenho}"`);
    });
    csvContent.push('');

    // Análise de Tipos de Imóveis
    csvContent.push('ANÁLISE DE TIPOS DE IMÓVEIS');
    csvContent.push('Tipo,Quantidade,Percentual do Total,Tendência');
    const totalPropertyTypes = data.propertyTypesData.reduce((sum, item) => sum + item.value, 0);
    data.propertyTypesData.forEach(item => {
      const percent = totalPropertyTypes > 0 ? ((item.value / totalPropertyTypes) * 100).toFixed(1) : '0';
      const tendencia = item.value > totalPropertyTypes * 0.25 ? '📈 Alta Demanda' : '📊 Demanda Regular';
      csvContent.push(`"${item.name}",${item.value},${percent}%,"${tendencia}"`);
    });
    csvContent.push('');

    // Canais de Aquisição - ROI
    csvContent.push('CANAL DE AQUISIÇÃO - ANÁLISE DE ROI');
    csvContent.push('Canal,Leads Gerados,Custo Estimado,ROI,Qualidade');
    const totalOrigins = data.leadOriginsData.reduce((sum, item) => sum + item.value, 0);
    data.leadOriginsData.forEach(item => {
      const custoEstimado = this.estimateChannelCost(item.name);
      const roi = item.value > 0 ? ((item.value / custoEstimado) * 100).toFixed(1) : '0';
      const qualidade = item.value > totalOrigins * 0.2 ? '⭐ Excelente' : item.value > totalOrigins * 0.1 ? '👍 Boa' : '⚠️ Regular';
      csvContent.push(`"${item.name}",${item.value},R$${custoEstimado},${roi}%,"${qualidade}"`);
    });
    csvContent.push('');

    // Tempo Médio por Etapa - Benchmark
    csvContent.push('TEMPO MÉDIO POR ETAPA - BENCHMARK');
    csvContent.push('Etapa,Dias Atuais,Dias Meta,Dias Benchmark,Eficiência');
    data.avgTimeData.forEach(item => {
      const benchmark = this.getBenchmarkTime(item.stage);
      const eficiencia = item.days <= benchmark ? '✅ Eficiente' : '⚠️ Precisa Melhorar';
      csvContent.push(`"${item.stage}",${item.days},${item.meta},${benchmark},"${eficiencia}"`);
    });
    csvContent.push('');

    // Ticket Médio - Evolução
    csvContent.push('TICKET MÉDIO MENSAL - EVOLUÇÃO');
    csvContent.push('Mês,Valor (R$),Meta (R$),Variação %,Projeção');
    data.ticketMedioData.forEach((item, index) => {
      const meta = 500000; // Meta de R$ 500k
      const variacao = index > 0 ? (((item.valor - data.ticketMedioData[index - 1].valor) / data.ticketMedioData[index - 1].valor) * 100).toFixed(1) : '0.0';
      const projecao = item.valor * 1.1; // Projeção de 10% crescimento
      csvContent.push(`${item.month},R$${item.valor.toLocaleString('pt-BR')},R$${meta.toLocaleString('pt-BR')},${variacao}%,R$${projecao.toLocaleString('pt-BR')}`);
    });
    csvContent.push('');

    // Performance Geral - Score
    csvContent.push('PERFORMANCE GERAL - SCORE DETALHADO');
    csvContent.push('Métrica,Atual (%),Meta (%),Score,Prioridade');
    data.performanceData.forEach(item => {
      const score = (item.atual / item.meta * 100).toFixed(0);
      const prioridade = item.atual < item.meta * 0.8 ? '🔴 Alta' : item.atual < item.meta ? '🟡 Média' : '🟢 Baixa';
      csvContent.push(`"${item.metric}",${item.atual},${item.meta},${score}%,"${prioridade}"`);
    });
    csvContent.push('');

    // Mapa de Calor - ABC Paulista Completo
    csvContent.push('MAPA DE CALOR - ABC PAULISTA COMPLETO');
    csvContent.push('Cidade,Leads,Visitas,Negócios,Valor Médio (R$),Crescimento (%),Potencial,Oportunidades');
    data.regionsData.forEach(region => {
      const potencial = region.avgPrice > 400000 ? '🔥 Alto' : region.avgPrice > 300000 ? '📈 Médio' : '📊 Regular';
      const oportunidades = region.growth > 10 ? '🚀 Expansão' : region.growth > 0 ? '📈 Crescimento' : '⚠️ Estável';
      csvContent.push(`"${region.name}",${region.leads},${region.visits},${region.deals},R$${region.avgPrice.toLocaleString('pt-BR')},${region.growth}%,"${potencial}","${oportunidades}"`);
    });

    // Footer
    csvContent.push('');
    csvContent.push('RELATÓRIO GERADO AUTOMATICAMENTE PELO SISTEMA');
    csvContent.push(`Fonte: Sistema de Gestão Imobiliária - ABC Paulista`);
    csvContent.push(`Atualização: ${new Date().toLocaleString('pt-BR')}`);

    return csvContent.join('\n');
  }

  // Estimar custo por canal
  private static estimateChannelCost(channel: string): number {
    const costs: Record<string, number> = {
      'WhatsApp': 50,
      'Site': 500,
      'Indicação': 0,
      'Redes Sociais': 300,
      'Outros': 200
    };
    return costs[channel] || 100;
  }

  // Obter tempo benchmark por etapa
  private static getBenchmarkTime(stage: string): number {
    const benchmarks: Record<string, number> = {
      'Lead → Contato': 1,
      'Contato → Visita': 3,
      'Visita → Proposta': 5,
      'Proposta → Fechado': 10
    };
    return benchmarks[stage] || 5;
  }

  // Download do CSV
  static downloadCSV(csvContent: string, filename: string = 'relatorio-abc-paulista'): void {
    const BOM = '\uFEFF'; // Para suporte a caracteres especiais
    const csvWithBOM = BOM + csvContent;
    
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Gerar URL para Google Sheets
  static generateGoogleSheetsURL(): string {
    return `https://docs.google.com/spreadsheets/d/create?new=true&usp=sheets_web&headers=false&title=Relatório ABC Paulista - ${new Date().toLocaleDateString('pt-BR')}`;
  }

  // Exportar para Google Sheets
  static async exportToGoogleSheets(data: ExportData): Promise<void> {
    try {
      const csvContent = this.generateCSV(data);
      
      // Download automático do CSV
      this.downloadCSV(csvContent);
      
      // Abrir Google Sheets para importação
      setTimeout(() => {
        const googleSheetsURL = this.generateGoogleSheetsURL();
        window.open(googleSheetsURL, '_blank');
      }, 1000);
      
      console.log('Dados exportados com sucesso!');
      
    } catch (error) {
      console.error('Erro ao exportar para Google Sheets:', error);
      throw error;
    }
  }
}
