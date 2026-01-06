import React, { useEffect, useState } from 'react';
import ClientRegistration from './components/ClientRegistration';
import { ClientSummary } from './components/ClientSummary';
import { ClientDetail } from './components/ClientDetail';
import { Dashboard } from './components/Dashboard';
import Analytics from './components/Analytics';
import TeamManagement from './components/TeamManagement';
import NotificationCenter from './components/NotificationCenter';
import TeamReports from './components/TeamReports';
import { Client, ContactRecord, VisitRecord } from './types';
import { useAuth } from './contexts/AuthContext';

type View = 'registration' | 'summary' | 'detail' | 'dashboard' | 'analytics' | 'team' | 'notifications' | 'reports';

function App() {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const raw = localStorage.getItem('reb_clients_v1');
      return raw ? (JSON.parse(raw) as Client[]) : [];
    } catch {
      return [];
    }
  });
  const [contactRecords, setContactRecords] = useState<ContactRecord[]>(() => {
    try {
      const raw = localStorage.getItem('reb_contact_records_v1');
      return raw ? (JSON.parse(raw) as ContactRecord[]) : [];
    } catch {
      return [];
    }
  });
  const [visitRecords, setVisitRecords] = useState<VisitRecord[]>(() => {
    try {
      const raw = localStorage.getItem('reb_visit_records_v1');
      return raw ? (JSON.parse(raw) as VisitRecord[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('reb_clients_v1', JSON.stringify(clients));
    } catch {
      // ignore
    }
  }, [clients]);

  useEffect(() => {
    try {
      localStorage.setItem('reb_contact_records_v1', JSON.stringify(contactRecords));
    } catch {
      // ignore
    }
  }, [contactRecords]);

  useEffect(() => {
    try {
      localStorage.setItem('reb_visit_records_v1', JSON.stringify(visitRecords));
    } catch {
      // ignore
    }
  }, [visitRecords]);

  const resetLocalData = () => {
    const confirmed = window.confirm('Deseja zerar todos os dados locais (clientes, contatos e visitas)?');
    if (!confirmed) return;

    try {
      localStorage.removeItem('reb_clients_v1');
      localStorage.removeItem('reb_contact_records_v1');
      localStorage.removeItem('reb_visit_records_v1');
    } catch {
      // ignore
    }

    setSelectedClient(null);
    setClients([]);
    setContactRecords([]);
    setVisitRecords([]);
    setCurrentView('dashboard');
  };

  const handleClientRegister = (clientData: Omit<Client, 'id' | 'dataCadastro' | 'qtdeVisitas' | 'ultimaAtualizacao' | 'dataUltimaVisita' | 'saidasRealizadas' | 'ultimaMovimentacao'>) => {
    const newClient: Client = {
      ...clientData,
      id: Date.now().toString(),
      dataCadastro: new Date().toLocaleDateString('pt-BR'),
      qtdeVisitas: 0,
      ultimaAtualizacao: new Date().toLocaleDateString('pt-BR'),
      dataUltimaVisita: new Date().toLocaleDateString('pt-BR'),
      saidasRealizadas: 0,
      ultimaMovimentacao: new Date().toLocaleDateString('pt-BR'),
    };
    setClients(prev => [...prev, newClient]);
    setCurrentView('summary');
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setCurrentView('detail');
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClients(prev => prev.map(client => 
      client.id === updatedClient.id ? updatedClient : client
    ));
    setSelectedClient(updatedClient);
  };

  const handleAddContactRecord = (record: Omit<ContactRecord, 'id'>) => {
    const newRecord: ContactRecord = {
      ...record,
      id: Date.now().toString(),
    };
    setContactRecords((prev: ContactRecord[]) => [...prev, newRecord]);
    
    if (selectedClient) {
      const updatedClient = {
        ...selectedClient,
        ultimaMovimentacao: new Date().toLocaleDateString('pt-BR'),
        ultimaAtualizacao: new Date().toLocaleDateString('pt-BR'),
      };
      handleUpdateClient(updatedClient);
    }
  };

  const handleAddVisitRecord = (record: Omit<VisitRecord, 'id'>) => {
    const newRecord: VisitRecord = {
      ...record,
      id: Date.now().toString(),
    };
    setVisitRecords((prev: VisitRecord[]) => [...prev, newRecord]);
    
    if (selectedClient) {
      const updatedClient = {
        ...selectedClient,
        qtdeVisitas: selectedClient.qtdeVisitas + 1,
        dataUltimaVisita: record.data,
        ultimaMovimentacao: new Date().toLocaleDateString('pt-BR'),
        ultimaAtualizacao: new Date().toLocaleDateString('pt-BR'),
        saidasRealizadas: selectedClient.saidasRealizadas + record.codImoveis.length,
      };
      handleUpdateClient(updatedClient);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard clients={clients} />;
      
      case 'registration':
        return <ClientRegistration onClientRegister={handleClientRegister} />;
      
      case 'summary':
        return <ClientSummary clients={clients} onClientSelect={handleClientSelect} />;
      
      case 'detail':
        return selectedClient ? (
          <ClientDetail 
            client={selectedClient} 
            onUpdateClient={handleUpdateClient}
            onBack={() => setCurrentView('summary')}
            contactRecords={contactRecords}
            visitRecords={visitRecords}
            onAddContactRecord={handleAddContactRecord}
            onAddVisitRecord={handleAddVisitRecord}
          />
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600">Selecione um cliente para ver os detalhes.</p>
          </div>
        );
      
      case 'analytics':
        return <Analytics clients={clients} contactRecords={contactRecords} visitRecords={visitRecords} />;
      
      case 'team':
        return <TeamManagement />;
      
      case 'notifications':
        return <NotificationCenter />;
      
      case 'reports':
        return <TeamReports />;
      
      default:
        return <Dashboard clients={clients} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gray-800 text-white p-4 mb-6">
        <div className="container mx-auto flex flex-col gap-4 md:flex-row md:items-center">
          <h1 className="text-xl font-bold shrink-0">Sistema para Corretores</h1>
          <div className="flex flex-wrap items-center gap-2 md:gap-4 md:flex-1">
              <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-4 py-2 rounded transition duration-200 ${
                currentView === 'dashboard' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              Diagnóstico
            </button>
            <button
              onClick={() => setCurrentView('registration')}
              className={`px-4 py-2 rounded transition duration-200 ${
                currentView === 'registration' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              Novo Cliente
            </button>
            <button
              onClick={() => setCurrentView('summary')}
              className={`px-4 py-2 rounded transition duration-200 ${
                currentView === 'summary' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              Resumo Clientes
            </button>
            <button
              onClick={() => setCurrentView('analytics')}
              className={`px-4 py-2 rounded transition duration-200 ${
                currentView === 'analytics' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              📊 Gráficos
            </button>
            <button
              onClick={() => setCurrentView('team')}
              className={`px-4 py-2 rounded transition duration-200 ${
                currentView === 'team' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              👥 Equipe
            </button>
            <button
              onClick={() => setCurrentView('notifications')}
              className={`px-4 py-2 rounded transition duration-200 ${
                currentView === 'notifications' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
                🔔 Notificações
            </button>
            <button
              onClick={() => setCurrentView('reports')}
              className={`px-4 py-2 rounded transition duration-200 ${
                currentView === 'reports' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
                📈 Relatórios
            </button>
            {selectedClient && (
              <>
                <button
                  onClick={() => setCurrentView('detail')}
                  className={`px-4 py-2 rounded transition duration-200 ${
                    currentView === 'detail' ? 'bg-blue-600' : 'hover:bg-gray-700'
                  }`}
                >
                  Detalhes Cliente
                </button>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 md:pl-4 md:border-l md:border-gray-600 shrink-0 md:ml-auto">
            {user?.email && (
              <span className="text-sm text-gray-200 hidden md:inline">{user.email}</span>
            )}
            <button
              onClick={resetLocalData}
              className="px-4 py-2 rounded transition duration-200 bg-gray-600 hover:bg-gray-700"
            >
              Zerar Dados
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 rounded transition duration-200 bg-red-600 hover:bg-red-700"
            >
              Sair
            </button>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-6">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
