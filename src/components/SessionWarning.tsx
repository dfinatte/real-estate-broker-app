import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SessionWarning: React.FC = () => {
  const { sessionWarning, extendSession } = useAuth();

  if (!sessionWarning) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-lg shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Clock className="h-5 w-5 text-orange-400" />
          </div>
          <div className="ml-3 flex-1">
            <div className="flex items-center">
              <h3 className="text-sm font-medium text-orange-800">
                Sessão expirando em breve
              </h3>
            </div>
            <div className="mt-2 text-sm text-orange-700">
              <p>
                Sua sessão expirará em 5 minutos devido à inatividade. 
                Deseja estender a sessão?
              </p>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={extendSession}
                className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 transition-colors"
              >
                Estender Sessão
              </button>
              <button
                onClick={() => {
                  // Usuário pode ignorar o aviso
                }}
                className="bg-orange-200 text-orange-800 px-3 py-1 rounded text-sm hover:bg-orange-300 transition-colors"
              >
                Ignorar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionWarning;
