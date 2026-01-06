import React, { useState } from 'react';
import { Client } from '../types';

interface ClientSummaryProps {
  clients: Client[];
  onClientSelect: (client: Client) => void;
}

export const ClientSummary: React.FC<ClientSummaryProps> = ({ clients, onClientSelect }) => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof Client; direction: 'asc' | 'desc' } | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterTemperatura, setFilterTemperatura] = useState<string>('todos');

  const handleSort = (key: keyof Client) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredClients = clients.filter(client => {
    const statusMatch = filterStatus === 'todos' || client.status === filterStatus;
    const temperaturaMatch = filterTemperatura === 'todos' || client.temperatura === filterTemperatura;
    return statusMatch && temperaturaMatch;
  });

  const sortedClients = React.useMemo(() => {
    let sortableClients = [...filteredClients];
    if (sortConfig !== null) {
      sortableClients.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableClients;
  }, [filteredClients, sortConfig]);

  const getTemperaturaColor = (temperatura: string) => {
    switch (temperatura) {
      case 'quente': return 'bg-red-500 text-white';
      case 'morno': return 'bg-pink-400 text-white';
      case 'frio': return 'bg-blue-500 text-white';
      case 'precisa-vender': return 'bg-gray-500 text-white';
      default: return 'bg-gray-300 text-black';
    }
  };

  const getVisitasColor = (qtde: number) => {
    if (qtde >= 5) return 'bg-green-500 text-white';
    if (qtde >= 3) return 'bg-yellow-500 text-white';
    return 'bg-gray-300 text-black';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Resumo Clientes</h2>
        
        <div className="bg-red-600 text-white p-3 rounded mb-4">
          <p className="font-bold">ATENÇÃO!!! Esta tabela é preenchida de forma automática. NÃO TENTE EDITAR OS DADOS!</p>
        </div>
        
        <div className="text-sm text-gray-600 mb-4">
          <p>Aqui você terá um panorama geral da sua carteira de cliente. No cabeçario, ao lado do titulo da coluna tem um simbolo de seta/triângulo para baixo. Esta opção te permite realizar filtros, como por exemplo, te mostrar apenas os clientes que estão em jornada na coluna Status, ou ainda, na coluna do nome, organizar a lista em ordem alfabética.</p>
        </div>

        <div className="flex gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos</option>
              <option value="Em jornada">Em jornada</option>
              <option value="novo">Novo</option>
              <option value="inativo">Inativo</option>
              <option value="concluido">Concluído</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Temperatura</label>
            <select
              value={filterTemperatura}
              onChange={(e) => setFilterTemperatura(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos</option>
              <option value="quente">Quente</option>
              <option value="morno">Morno</option>
              <option value="frio">Frio</option>
              <option value="precisa-vender">Precisa Vender</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th 
                className="px-4 py-2 text-left cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('dataCadastro')}
              >
                Data Cadastro {sortConfig?.key === 'dataCadastro' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
              </th>
              <th 
                className="px-4 py-2 text-left cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('nome')}
              >
                Nome {sortConfig?.key === 'nome' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
              </th>
              <th className="px-4 py-2 text-left">Telefone</th>
              <th 
                className="px-4 py-2 text-left cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('temperatura')}
              >
                Temperatura {sortConfig?.key === 'temperatura' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
              </th>
              <th 
                className="px-4 py-2 text-left cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('dataUltimaVisita')}
              >
                Data da Última Visita {sortConfig?.key === 'dataUltimaVisita' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
              </th>
              <th 
                className="px-4 py-2 text-left cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('ultimaAtualizacao')}
              >
                Última Atualização {sortConfig?.key === 'ultimaAtualizacao' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
              </th>
              <th 
                className="px-4 py-2 text-left cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('qtdeVisitas')}
              >
                Qtde. Visitas {sortConfig?.key === 'qtdeVisitas' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
              </th>
              <th className="px-4 py-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sortedClients.map((client) => (
              <tr key={client.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{client.dataCadastro}</td>
                <td className="px-4 py-2">
                  <button 
                    onClick={() => onClientSelect(client)}
                    className="text-blue-600 hover:underline"
                  >
                    {client.nome}
                  </button>
                </td>
                <td className="px-4 py-2">{client.telefone}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getTemperaturaColor(client.temperatura)}`}>
                    {client.temperatura === 'precisa-vender' ? 'Precisa Vender' : 
                     client.temperatura.charAt(0).toUpperCase() + client.temperatura.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-2">{client.dataUltimaVisita}</td>
                <td className={`px-4 py-2 ${client.ultimaAtualizacao === client.dataUltimaVisita ? 'text-red-600 font-semibold' : ''}`}>
                  {client.ultimaAtualizacao}
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getVisitasColor(client.qtdeVisitas)}`}>
                    {client.qtdeVisitas}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <button 
                    onClick={() => onClientSelect(client)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Ver Detalhes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
