import React, { useState } from 'react';
import { ContactRecord } from '../types';

interface ContactRecordsProps {
  clientId: string;
  contactRecords: ContactRecord[];
  onAddContactRecord: (record: Omit<ContactRecord, 'id'>) => void;
}

export const ContactRecords: React.FC<ContactRecordsProps> = ({ 
  clientId, 
  contactRecords, 
  onAddContactRecord 
}) => {
  const [newRecord, setNewRecord] = useState({
    data: '',
    forma: '',
    comentarios: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRecord.data && newRecord.forma) {
      onAddContactRecord({
        clientId,
        ...newRecord
      });
      setNewRecord({ data: '', forma: '', comentarios: '' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewRecord(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-red-50 p-6 rounded-lg shadow-md border-2 border-red-200">
      <h3 className="text-xl font-bold mb-4 text-red-800">Registro_Contatos</h3>
      
      <div className="mb-6">
        <div className="grid grid-cols-12 gap-2 mb-4">
          <div className="col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
            <input
              type="date"
              name="data"
              value={newRecord.data}
              onChange={handleChange}
              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Forma</label>
            <select
              name="forma"
              value={newRecord.forma}
              onChange={handleChange}
              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Selecione...</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Ligação">Ligação</option>
              <option value="E-mail">E-mail</option>
              <option value="Presencial">Presencial</option>
              <option value="Rede Social">Rede Social</option>
            </select>
          </div>
          <div className="col-span-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Comentários</label>
            <input
              type="text"
              name="comentarios"
              value={newRecord.comentarios}
              onChange={handleChange}
              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
        
        <button
          onClick={handleSubmit}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-200"
        >
          Adicionar Contato
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-red-100">
            <tr>
              <th className="px-4 py-2 text-left text-red-800">Data</th>
              <th className="px-4 py-2 text-left text-red-800">Forma</th>
              <th className="px-4 py-2 text-left text-red-800">Comentários</th>
            </tr>
          </thead>
          <tbody>
            {contactRecords
              .filter(record => record.clientId === clientId)
              .map((record) => (
                <tr key={record.id} className="border-b bg-white">
                  <td className="px-4 py-2">{record.data}</td>
                  <td className="px-4 py-2">{record.forma}</td>
                  <td className="px-4 py-2">{record.comentarios}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
