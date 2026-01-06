import React, { useState } from 'react';
import { VisitRecord } from '../types';

interface VisitRecordsProps {
  clientId: string;
  visitRecords: VisitRecord[];
  onAddVisitRecord: (record: Omit<VisitRecord, 'id'>) => void;
}

export const VisitRecords: React.FC<VisitRecordsProps> = ({ 
  clientId, 
  visitRecords, 
  onAddVisitRecord 
}) => {
  const [newRecord, setNewRecord] = useState({
    data: '',
    codImoveis: ['', '', '', '', '', ''],
    status: '',
    comentarios: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRecord.data && newRecord.status) {
      const filteredImoveis = newRecord.codImoveis.filter(cod => cod.trim() !== '');
      onAddVisitRecord({
        clientId,
        data: newRecord.data,
        codImoveis: filteredImoveis,
        status: newRecord.status,
        comentarios: newRecord.comentarios
      });
      setNewRecord({ 
        data: '', 
        codImoveis: ['', '', '', '', '', ''], 
        status: '', 
        comentarios: '' 
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('codImovel')) {
      const index = parseInt(name.replace('codImovel', '')) - 1;
      const newCodImoveis = [...newRecord.codImoveis];
      newCodImoveis[index] = value;
      setNewRecord(prev => ({ ...prev, codImoveis: newCodImoveis }));
    } else {
      setNewRecord(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="bg-green-50 p-6 rounded-lg shadow-md border-2 border-green-200">
      <h3 className="text-xl font-bold mb-4 text-green-800">Registro_Visitas</h3>
      
      <div className="mb-6">
        <div className="grid grid-cols-12 gap-2 mb-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
            <input
              type="date"
              name="data"
              value={newRecord.data}
              onChange={handleChange}
              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <div key={num} className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cód. Imóvel {num}</label>
              <input
                type="text"
                name={`codImovel${num}`}
                value={newRecord.codImoveis[num - 1]}
                onChange={handleChange}
                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={`APT${num}`}
              />
            </div>
          ))}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={newRecord.status}
              onChange={handleChange}
              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Selecione...</option>
              <option value="Agendada">Agendada</option>
              <option value="Realizada">Realizada</option>
              <option value="Cancelada">Cancelada</option>
              <option value="Remarcada">Remarcada</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Comentários</label>
            <input
              type="text"
              name="comentarios"
              value={newRecord.comentarios}
              onChange={handleChange}
              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
        
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition duration-200"
        >
          Adicionar Visita
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-green-100">
            <tr>
              <th className="px-4 py-2 text-left text-green-800">Data</th>
              <th className="px-2 py-2 text-left text-green-800">Cód. Imóvel 1</th>
              <th className="px-2 py-2 text-left text-green-800">Cód. Imóvel 2</th>
              <th className="px-2 py-2 text-left text-green-800">Cód. Imóvel 3</th>
              <th className="px-2 py-2 text-left text-green-800">Cód. Imóvel 4</th>
              <th className="px-2 py-2 text-left text-green-800">Cód. Imóvel 5</th>
              <th className="px-2 py-2 text-left text-green-800">Cód. Imóvel 6</th>
              <th className="px-4 py-2 text-left text-green-800">Status</th>
              <th className="px-4 py-2 text-left text-green-800">Comentários</th>
            </tr>
          </thead>
          <tbody>
            {visitRecords
              .filter(record => record.clientId === clientId)
              .map((record) => (
                <tr key={record.id} className="border-b bg-white">
                  <td className="px-4 py-2">{record.data}</td>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <td key={index} className="px-2 py-2">
                      {record.codImoveis[index] || '-'}
                    </td>
                  ))}
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      record.status === 'Realizada' ? 'bg-green-500 text-white' :
                      record.status === 'Agendada' ? 'bg-blue-500 text-white' :
                      record.status === 'Cancelada' ? 'bg-red-500 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">{record.comentarios}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
