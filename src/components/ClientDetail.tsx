import React, { useState } from 'react';
import { Client, ContactRecord, VisitRecord } from '../types';
import { ContactRecords } from './ContactRecords';
import { VisitRecords } from './VisitRecords';

interface ClientDetailProps {
  client: Client;
  onUpdateClient: (client: Client) => void;
  onBack: () => void;
  contactRecords: ContactRecord[];
  visitRecords: VisitRecord[];
  onAddContactRecord: (record: Omit<ContactRecord, 'id'>) => void;
  onAddVisitRecord: (record: Omit<VisitRecord, 'id'>) => void;
}

export const ClientDetail: React.FC<ClientDetailProps> = ({ 
  client, 
  onUpdateClient, 
  onBack, 
  contactRecords, 
  visitRecords, 
  onAddContactRecord, 
  onAddVisitRecord 
}) => {
  const [formData, setFormData] = useState<Client>(client);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'contacts' | 'visits'>('details');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('budget') || name.includes('comissao') || name.includes('dormitorios') || 
              name.includes('suites') || name.includes('banheiros') || name.includes('vagas') || 
              name.includes('valor') || name.includes('qtde') || name.includes('saidas') ? 
              Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateClient(formData);
    setIsEditing(false);
  };

  const calculateCommission = () => {
    if (formData.valorVenda && formData.minhaComissao) {
      return (formData.valorVenda * formData.minhaComissao) / 100;
    }
    return 0;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Detalhes do Cliente: {client.nome}</h2>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSubmit}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition duration-200"
              >
                Salvar
              </button>
              <button
                onClick={() => {
                  setFormData(client);
                  setIsEditing(false);
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition duration-200"
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
              >
                Editar
              </button>
              <button
                onClick={onBack}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition duration-200"
              >
                Voltar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Dados do Cliente
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'contacts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Histórico de Contatos
          </button>
          <button
            onClick={() => setActiveTab('visits')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'visits'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Controle de Visitas
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">CADASTRO & STATUS</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente</label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input
                type="tel"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Chegada</label>
              <input
                type="date"
                name="dataChegada"
                value={formData.dataChegada}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Canal de Aquisição</label>
              <select
                name="canalAquisicao"
                value={formData.canalAquisicao}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
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
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aonde Procura?</label>
              <input
                type="text"
                name="aondeProcura"
                value={formData.aondeProcura}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget Informado</label>
              <input
                type="number"
                name="budgetInformado"
                value={formData.budgetInformado}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget Ajustado</label>
              <input
                type="number"
                name="budgetAjustado"
                value={formData.budgetAjustado}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temperatura</label>
              <select
                name="temperatura"
                value={formData.temperatura}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="quente">Quente</option>
                <option value="morno">Morno</option>
                <option value="frio">Frio</option>
                <option value="precisa-vender">Precisa Vender</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="novo">Novo</option>
                <option value="Em jornada">Em jornada</option>
                <option value="inativo">Inativo</option>
                <option value="concluido">Concluído</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prazo p/ Compra</label>
              <input
                type="text"
                name="prazoCompra"
                value={formData.prazoCompra}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visitas Realizadas</label>
              <input
                type="number"
                name="qtdeVisitas"
                value={formData.qtdeVisitas}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Saídas Realizadas</label>
              <input
                type="number"
                name="saidasRealizadas"
                value={formData.saidasRealizadas}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Informações Adicionais</label>
            <textarea
              name="informacoesAdicionais"
              value={formData.informacoesAdicionais}
              onChange={handleChange}
              disabled={!isEditing}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>
        </div>

        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Características do Imóvel</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dormitórios</label>
              <input
                type="number"
                name="dormitorios"
                value={formData.dormitorios}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Suítes</label>
              <input
                type="number"
                name="suites"
                value={formData.suites}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Banheiros</label>
              <input
                type="number"
                name="banheiros"
                value={formData.banheiros}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vagas de Garagem</label>
              <input
                type="number"
                name="vagasGaragem"
                value={formData.vagasGaragem}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Demais Caract.</label>
              <input
                type="text"
                name="demaisCaract"
                value={formData.demaisCaract}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>
        </div>

        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Comentários</h3>
          <textarea
            name="comentarios"
            value={formData.comentarios}
            onChange={handleChange}
            disabled={!isEditing}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">VENDA</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data da Venda</label>
              <input
                type="date"
                name="dataVenda"
                value={formData.dataVenda}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">EN Responsável</label>
              <input
                type="text"
                name="enResponsavel"
                value={formData.enResponsavel}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">% Comissão Contrato</label>
              <input
                type="number"
                name="comissaoContrato"
                value={formData.comissaoContrato}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código Imóvel</label>
              <input
                type="text"
                name="codigoImovel"
                value={formData.codigoImovel}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor da Venda</label>
              <input
                type="number"
                name="valorVenda"
                value={formData.valorVenda}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">% Minha Comissão</label>
              <input
                type="number"
                name="minhaComissao"
                value={formData.minhaComissao}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Prev. Receb.</label>
              <input
                type="date"
                name="dataPrevReceb"
                value={formData.dataPrevReceb}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Recebimento</label>
              <input
                type="date"
                name="dataRecebimento"
                value={formData.dataRecebimento}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor Previsto</label>
              <input
                type="number"
                name="valorPrevisto"
                value={calculateCommission()}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              disabled={!isEditing}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>
        </div>
      </form>
      )}

      {activeTab === 'contacts' && (
        <ContactRecords 
          clientId={client.id}
          contactRecords={contactRecords}
          onAddContactRecord={onAddContactRecord}
        />
      )}

      {activeTab === 'visits' && (
        <VisitRecords 
          clientId={client.id}
          visitRecords={visitRecords}
          onAddVisitRecord={onAddVisitRecord}
        />
      )}
    </div>
  );
};
