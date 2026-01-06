import React, { useState } from 'react';
import { Client } from '../types';

interface ClientRegistrationProps {
  onClientRegister: (client: Omit<Client, 'id' | 'dataCadastro' | 'qtdeVisitas' | 'ultimaAtualizacao' | 'dataUltimaVisita' | 'saidasRealizadas' | 'ultimaMovimentacao'>) => void;
}

const ClientRegistration: React.FC<ClientRegistrationProps> = ({ onClientRegister }) => {
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    dataChegada: '',
    canalAquisicao: '',
    oQueProcura: '',
    aondeProcura: '',
    budgetInformado: 0,
    informacoesAdicionais: '',
    temperatura: 'morno' as const,
    status: 'novo',
    prazoCompra: '',
    budgetAjustado: 0,
    dormitorios: 0,
    suites: 0,
    banheiros: 0,
    vagasGaragem: 0,
    demaisCaract: '',
    comentarios: '',
    comissaoContrato: 6,
    minhaComissao: 3
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClientRegister({
      ...formData,
      statusJornada: 'Em Jornada',
      dataVenda: '',
      enResponsavel: '',
      observacoes: '',
      dataPrevReceb: '',
      dataRecebimento: '',
      codigoImovel: '',
      valorVenda: 0,
      valorPrevisto: 0,
      valorRecebido: 0
    });
    
    // Reset form
    setFormData({
      nome: '',
      telefone: '',
      dataChegada: '',
      canalAquisicao: '',
      oQueProcura: '',
      aondeProcura: '',
      budgetInformado: 0,
      informacoesAdicionais: '',
      temperatura: 'morno',
      status: 'novo',
      prazoCompra: '',
      budgetAjustado: 0,
      dormitorios: 0,
      suites: 0,
      banheiros: 0,
      vagasGaragem: 0,
      demaisCaract: '',
      comentarios: '',
      comissaoContrato: 6,
      minhaComissao: 3
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('budget') || name.includes('comissao') || name.includes('dormitorios') || name.includes('suites') || name.includes('banheiros') || name.includes('vagas') ? Number(value) : value
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Novo Cliente</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <input
              type="tel"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Chegada</label>
            <input
              type="date"
              name="dataChegada"
              value={formData.dataChegada}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Canal de Aquisição</label>
            <select
              name="canalAquisicao"
              value={formData.canalAquisicao}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecione...</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Ligação">Ligação</option>
              <option value="Indicação">Indicação</option>
              <option value="Redes Sociais">Redes Sociais</option>
              <option value="Site">Site</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">O que procura?</label>
            <input
              type="text"
              name="oQueProcura"
              value={formData.oQueProcura}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aonde Procura?</label>
            <input
              type="text"
              name="aondeProcura"
              value={formData.aondeProcura}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget Informado</label>
            <input
              type="number"
              name="budgetInformado"
              value={formData.budgetInformado}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temperatura</label>
            <select
              name="temperatura"
              value={formData.temperatura}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="quente">Quente</option>
              <option value="morno">Morno</option>
              <option value="frio">Frio</option>
              <option value="precisa-vender">Precisa Vender</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Informações Adicionais</label>
          <textarea
            name="informacoesAdicionais"
            value={formData.informacoesAdicionais}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 font-medium"
        >
          Cadastrar
        </button>
      </form>
    </div>
  );
};

export default ClientRegistration;
