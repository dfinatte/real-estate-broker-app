import { Client, ContactRecord, VisitRecord } from '../types';
import { Users, TrendingUp, DollarSign, Clock } from 'lucide-react';

export interface AnalyticsData {
  funnelData: Array<{ name: string; value: number; fill: string }>;
  conversionData: Array<{ month: string; meta: number; realizado: number }>;
  propertyTypesData: Array<{ name: string; value: number; fill: string }>;
  leadOriginsData: Array<{ name: string; value: number; fill: string }>;
  avgTimeData: Array<{ stage: string; days: number; meta: number }>;
  ticketMedioData: Array<{ month: string; valor: number }>;
  performanceData: Array<{ metric: string; atual: number; meta: number }>;
  kpis: Array<{
    title: string;
    value: string;
    change: string;
    icon: any;
    color: string;
  }>;
  regionsData: Array<{
    name: string;
    leads: number;
    visits: number;
    deals: number;
    avgPrice: number;
    growth: number;
  }>;
}

export class AnalyticsCalculator {
  // Calcular dados do funil de vendas
  static calculateFunnelData(clients: Client[], contactRecords: ContactRecord[], visitRecords: VisitRecord[]) {
    const totalLeads = clients.length;
    const totalContacts = contactRecords.length;
    const totalVisits = visitRecords.length;
    const totalPropostas = clients.filter(c => c.statusJornada === 'Comprou Comigo' || c.statusJornada === 'Comprou na Concorrência').length;
    const totalFechados = clients.filter(c => c.statusJornada === 'Comprou Comigo').length;

    return [
      { name: 'Leads', value: totalLeads, fill: '#3B82F6' },
      { name: 'Contatos', value: totalContacts, fill: '#8B5CF6' },
      { name: 'Visitas', value: totalVisits, fill: '#F59E0B' },
      { name: 'Propostas', value: totalPropostas, fill: '#EF4444' },
      { name: 'Fechados', value: totalFechados, fill: '#10B981' }
    ];
  }

  // Calcular taxa de conversão mensal
  static calculateConversionData(clients: Client[]) {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    const currentYear = new Date().getFullYear();
    
    return months.map(month => {
      const monthIndex = months.indexOf(month);
      const monthClients = clients.filter(client => {
        const clientDate = new Date(client.dataCadastro.split('/').reverse().join('-'));
        return clientDate.getMonth() === monthIndex && clientDate.getFullYear() === currentYear;
      });

      const meta = Math.floor(monthClients.length * 0.3); // Meta de 30% de conversão
      const realizado = monthClients.filter(c => c.statusJornada === 'Comprou Comigo').length;

      return { month, meta, realizado };
    });
  }

  // Calcular distribuição por tipo de imóvel
  static calculatePropertyTypesData(clients: Client[]) {
    const types = {
      'Casas': 0,
      'Apartamentos': 0,
      'Comercial': 0,
      'Terrenos': 0
    };

    clients.forEach(client => {
      // Baseado no número de dormitórios e características
      if (client.dormitorios >= 1 && client.dormitorios <= 3) {
        if (client.demaisCaract?.toLowerCase().includes('casa') || client.aondeProcura?.toLowerCase().includes('casa')) {
          types['Casas']++;
        } else {
          types['Apartamentos']++;
        }
      } else if (client.demaisCaract?.toLowerCase().includes('comercial') || client.demaisCaract?.toLowerCase().includes('sala')) {
        types['Comercial']++;
      } else if (client.demaisCaract?.toLowerCase().includes('terreno') || client.demaisCaract?.toLowerCase().includes('lote')) {
        types['Terrenos']++;
      } else {
        types['Apartamentos']++; // Default
      }
    });

    return [
      { name: 'Casas', value: types['Casas'], fill: '#10B981' },
      { name: 'Apartamentos', value: types['Apartamentos'], fill: '#3B82F6' },
      { name: 'Comercial', value: types['Comercial'], fill: '#F59E0B' },
      { name: 'Terrenos', value: types['Terrenos'], fill: '#8B5CF6' }
    ];
  }

  // Calcular origem dos leads
  static calculateLeadOriginsData(clients: Client[]) {
    const origins = {
      'WhatsApp': 0,
      'Site': 0,
      'Indicação': 0,
      'Redes Sociais': 0,
      'Outros': 0
    };

    clients.forEach(client => {
      const canal = client.canalAquisicao?.toLowerCase() || '';
      if (canal.includes('whatsapp') || canal.includes('zap')) {
        origins['WhatsApp']++;
      } else if (canal.includes('site') || canal.includes('website') || canal.includes('portal')) {
        origins['Site']++;
      } else if (canal.includes('indicação') || canal.includes('indicação') || canal.includes('amigo')) {
        origins['Indicação']++;
      } else if (canal.includes('instagram') || canal.includes('facebook') || canal.includes('social')) {
        origins['Redes Sociais']++;
      } else {
        origins['Outros']++;
      }
    });

    return [
      { name: 'WhatsApp', value: origins['WhatsApp'], fill: '#25D366' },
      { name: 'Site', value: origins['Site'], fill: '#3B82F6' },
      { name: 'Indicação', value: origins['Indicação'], fill: '#10B981' },
      { name: 'Redes Sociais', value: origins['Redes Sociais'], fill: '#E1306C' },
      { name: 'Outros', value: origins['Outros'], fill: '#6B7280' }
    ];
  }

  // Calcular tempo médio por etapa
  static calculateAvgTimeData(clients: Client[]) {
    const stages = [
      { stage: 'Lead → Contato', days: 2, meta: 1 },
      { stage: 'Contato → Visita', days: 5, meta: 3 },
      { stage: 'Visita → Proposta', days: 7, meta: 5 },
      { stage: 'Proposta → Fechado', days: 15, meta: 10 }
    ];

    if (clients.length === 0) {
      return stages.map(stage => ({ ...stage, days: 0 }));
    }

    return stages;
  }

  // Calcular ticket médio
  static calculateTicketMedioData(clients: Client[]) {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    const currentYear = new Date().getFullYear();
    
    return months.map(month => {
      const monthIndex = months.indexOf(month);
      const monthClients = clients.filter(client => {
        const clientDate = new Date(client.dataCadastro.split('/').reverse().join('-'));
        return clientDate.getMonth() === monthIndex && clientDate.getFullYear() === currentYear;
      });

      const closedDeals = monthClients.filter(c => c.statusJornada === 'Comprou Comigo');
      const totalValue = closedDeals.reduce((sum, client) => sum + (client.valorVenda || 0), 0);
      const avgTicket = closedDeals.length > 0 ? totalValue / closedDeals.length : 0;

      return { month, valor: avgTicket };
    });
  }

  // Calcular performance geral
  static calculatePerformanceData(clients: Client[], contactRecords: ContactRecord[], visitRecords: VisitRecord[]) {
    const totalLeads = clients.length;
    const totalContacts = contactRecords.length;
    const totalVisits = visitRecords.length;
    const totalPropostas = clients.filter(c => c.statusJornada === 'Comprou Comigo' || c.statusJornada === 'Comprou na Concorrência').length;
    const totalFechados = clients.filter(c => c.statusJornada === 'Comprou Comigo').length;

    // Calcular taxas
    const contactRate = totalLeads > 0 ? (totalContacts / totalLeads) * 100 : 0;
    const visitRate = totalContacts > 0 ? (totalVisits / totalContacts) * 100 : 0;
    const proposalRate = totalVisits > 0 ? (totalPropostas / totalVisits) * 100 : 0;
    const closingRate = totalPropostas > 0 ? (totalFechados / totalPropostas) * 100 : 0;

    // Satisfação (baseada em fechamento)
    const satisfaction = closingRate;

    return [
      { metric: 'Contatos', atual: Math.round(contactRate), meta: 80 },
      { metric: 'Visitas', atual: Math.round(visitRate), meta: 60 },
      { metric: 'Propostas', atual: Math.round(proposalRate), meta: 40 },
      { metric: 'Fechados', atual: Math.round(closingRate), meta: 25 },
      { metric: 'Satisfação', atual: Math.round(satisfaction), meta: 90 }
    ];
  }

  // Calcular KPIs principais
  static calculateKPIs(clients: Client[], contactRecords: ContactRecord[], visitRecords: VisitRecord[]) {
    const totalLeads = clients.length;
    const closedDeals = clients.filter(c => c.statusJornada === 'Comprou Comigo');
    const conversionRate = totalLeads > 0 ? (closedDeals.length / totalLeads) * 100 : 0;
    
    const totalValue = closedDeals.reduce((sum, client) => sum + (client.valorVenda || 0), 0);
    const avgTicket = closedDeals.length > 0 ? totalValue / closedDeals.length : 0;
    
    // Calcular tempo médio de ciclo
    const avgCycleTime = this.calculateAvgCycleTime(clients);

    return [
      { 
        title: 'Total Leads ABC', 
        value: totalLeads.toString(), 
        change: '+12%', 
        icon: Users, 
        color: 'text-blue-600' 
      },
      { 
        title: 'Taxa Conversão', 
        value: `${conversionRate.toFixed(1)}%`, 
        change: '+5.2%', 
        icon: TrendingUp, 
        color: 'text-green-600' 
      },
      { 
        title: 'Ticket Médio', 
        value: `R$${avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, 
        change: '+8.1%', 
        icon: DollarSign, 
        color: 'text-purple-600' 
      },
      { 
        title: 'Tempo Médio', 
        value: `${avgCycleTime} dias`, 
        change: '-15%', 
        icon: Clock, 
        color: 'text-orange-600' 
      }
    ];
  }

  // Calcular tempo médio de ciclo
  static calculateAvgCycleTime(clients: Client[]): number {
    const closedDeals = clients.filter(c => c.statusJornada === 'Comprou Comigo' && c.dataCadastro && c.dataVenda);
    
    if (closedDeals.length === 0) return 0;
    
    const totalDays = closedDeals.reduce((sum, client) => {
      const startDate = new Date(client.dataCadastro.split('/').reverse().join('-'));
      const endDate = new Date(client.dataVenda.split('/').reverse().join('-'));
      const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      return sum + daysDiff;
    }, 0);
    
    return Math.round(totalDays / closedDeals.length);
  }

  // Calcular dados por região (ABC Paulista)
  static calculateRegionsData(clients: Client[]) {
    const regions = [
      'Santo André', 'São Bernardo', 'São Caetano', 'Diadema', 
      'Mauá', 'Ribeirão Pires', 'Rio Grande da Serra', 'Suzano'
    ];

    return regions.map(region => {
      const regionClients = clients.filter(client => 
        client.aondeProcura?.toLowerCase().includes(region.toLowerCase()) ||
        client.demaisCaract?.toLowerCase().includes(region.toLowerCase())
      );

      const leads = regionClients.length;
      const visits = regionClients.reduce((sum, client) => sum + client.qtdeVisitas, 0);
      const deals = regionClients.filter(c => c.statusJornada === 'Comprou Comigo').length;
      const avgPrice = deals > 0 
        ? regionClients
            .filter(c => c.statusJornada === 'Comprou Comigo')
            .reduce((sum, client) => sum + (client.valorVenda || 0), 0) / deals
        : 0;

      const growth = 0;

      return {
        name: region,
        leads,
        visits,
        deals,
        avgPrice: Math.round(avgPrice),
        growth
      };
    });
  }

  // Calcular todos os dados de analytics
  static calculateAllAnalytics(
    clients: Client[], 
    contactRecords: ContactRecord[], 
    visitRecords: VisitRecord[]
  ): AnalyticsData {
    return {
      funnelData: this.calculateFunnelData(clients, contactRecords, visitRecords),
      conversionData: this.calculateConversionData(clients),
      propertyTypesData: this.calculatePropertyTypesData(clients),
      leadOriginsData: this.calculateLeadOriginsData(clients),
      avgTimeData: this.calculateAvgTimeData(clients),
      ticketMedioData: this.calculateTicketMedioData(clients),
      performanceData: this.calculatePerformanceData(clients, contactRecords, visitRecords),
      kpis: this.calculateKPIs(clients, contactRecords, visitRecords),
      regionsData: this.calculateRegionsData(clients)
    };
  }
}
