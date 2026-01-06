import React, { useState } from 'react';
import { MapPin, TrendingUp, Users, Home } from 'lucide-react';

interface RegionData {
  name: string;
  leads: number;
  visits: number;
  deals: number;
  avgPrice: number;
  growth: number;
  color: string;
}

const HeatMap: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const regionsData: RegionData[] = [
    { name: 'Santo André', leads: 0, visits: 0, deals: 0, avgPrice: 0, growth: 0, color: 'bg-blue-500' },
    { name: 'São Bernardo', leads: 0, visits: 0, deals: 0, avgPrice: 0, growth: 0, color: 'bg-green-500' },
    { name: 'São Caetano', leads: 0, visits: 0, deals: 0, avgPrice: 0, growth: 0, color: 'bg-yellow-500' },
    { name: 'Diadema', leads: 0, visits: 0, deals: 0, avgPrice: 0, growth: 0, color: 'bg-orange-500' },
    { name: 'Mauá', leads: 0, visits: 0, deals: 0, avgPrice: 0, growth: 0, color: 'bg-red-500' },
    { name: 'Ribeirão Pires', leads: 0, visits: 0, deals: 0, avgPrice: 0, growth: 0, color: 'bg-purple-500' },
    { name: 'Rio Grande da Serra', leads: 0, visits: 0, deals: 0, avgPrice: 0, growth: 0, color: 'bg-pink-500' },
    { name: 'Suzano', leads: 0, visits: 0, deals: 0, avgPrice: 0, growth: 0, color: 'bg-indigo-500' }
  ];

  const getIntensityColor = (value: number, max: number) => {
    const intensity = value / max;
    if (intensity > 0.8) return 'bg-red-600';
    if (intensity > 0.6) return 'bg-orange-500';
    if (intensity > 0.4) return 'bg-yellow-500';
    if (intensity > 0.2) return 'bg-green-500';
    return 'bg-blue-500';
  };

  const maxLeads = Math.max(...regionsData.map(r => r.leads));

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">🗺️ Mapa de Calor - ABC Paulista</h2>
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">Clique para detalhes</span>
        </div>
      </div>

      {/* Grid de Regiões */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {regionsData.map((region) => (
          <div
            key={region.name}
            onClick={() => setSelectedRegion(region.name)}
            className={`relative p-4 rounded-lg cursor-pointer transition-all transform hover:scale-105 ${region.color} bg-opacity-20 border-2 border-current`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-900">{region.name}</span>
              <div className={`w-3 h-3 rounded-full ${region.color}`}></div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{region.leads}</div>
            <div className="text-xs text-gray-600">leads</div>
            <div className={`mt-1 text-xs font-medium ${
              region.growth > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {region.growth > 0 ? '+' : ''}{region.growth}%
            </div>
          </div>
        ))}
      </div>

      {/* Detalhes da Região Selecionada */}
      {selectedRegion && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">📍 {selectedRegion}</h3>
            <button
              onClick={() => setSelectedRegion(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          {(() => {
            const region = regionsData.find(r => r.name === selectedRegion);
            if (!region) return null;
            
            return (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-xs text-gray-600">Leads</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900">{region.leads}</div>
                </div>
                
                <div className="bg-white p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Home className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-gray-600">Visitas</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900">{region.visits}</div>
                </div>
                
                <div className="bg-white p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                    <span className="text-xs text-gray-600">Negócios</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900">{region.deals}</div>
                </div>
                
                <div className="bg-white p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-600">Ticket Médio</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900">
                    R${(region.avgPrice / 1000).toFixed(0)}K
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Legenda */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Intensidade:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-xs">Baixa</span>
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-xs">Média</span>
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-xs">Alta</span>
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span className="text-xs">Crítica</span>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          Total ABC: {regionsData.reduce((sum, r) => sum + r.leads, 0)} leads
        </div>
      </div>
    </div>
  );
};

export default HeatMap;
