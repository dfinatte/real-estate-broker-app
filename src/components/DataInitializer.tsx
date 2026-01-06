import React, { useState, useEffect } from 'react';
import { criarDadosIniciais, verificarDadosExistentes } from '../utils/setupInitialData';

const DataInitializer: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      setMessage('Verificando dados existentes...');
      
      try {
        const hasData = await verificarDadosExistentes();
        
        if (!hasData) {
          setMessage('Criando dados iniciais...');
          const success = await criarDadosIniciais();
          
          if (success) {
            setMessage('✅ Dados criados com sucesso! Recarregando...');
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } else {
            setMessage('❌ Erro ao criar dados iniciais');
          }
        } else {
          setMessage('✅ Dados já existem no sistema');
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      } catch (error) {
        console.error('Erro na inicialização:', error);
        setMessage('❌ Erro ao inicializar dados');
      }
      
      setLoading(false);
    };

    initializeData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className={`mb-4 ${loading ? 'animate-spin' : ''}`}>
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Inicializando Sistema
          </h2>
          <p className="text-gray-600 mb-6">{message}</p>
          
          {!loading && message.includes('Dados já existem') && (
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ir para o Sistema
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataInitializer;
