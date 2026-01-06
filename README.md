# 🏢 Real Estate Broker App

Sistema completo para corretores de imóveis com gestão de clientes, notificações em equipe, relatórios e analytics.

## ✨ Funcionalidades

### 🏠 Gestão de Clientes
- Cadastro de clientes com informações completas
- Registro de contatos e visitas
- Histórico de interações
- Status de acompanhamento

### 👥 Gestão de Equipe
- Cadastro de corretores
- Definição de metas individuais
- Acompanhamento de performance
- Sistema de permissões

### 📊 Relatórios e Analytics
- Dashboard com métricas em tempo real
- Relatórios de performance da equipe
- Gráficos interativos (leads, visitas, negócios)
- Exportação para Excel/Google Sheets
- **Acesso universal para todos os corretores**

### 🔔 Sistema de Notificações
- Notificações individuais
- **Envio para todo o grupo**
- Tipos: info, alerta, sucesso, meta, sistema
- Marcação como lida/não lida

### 🔐 Segurança
- Login com Firebase Authentication
- Verificação de email obrigatória
- Controle de sessão
- Rate limiting e proteção contra força bruta

## 🚀 Como Usar

### Como Site (Web)
1. Faça o deploy da pasta `build/` em qualquer plataforma de hospedagem
2. Configure as variáveis de ambiente do Firebase
3. Acesse através da URL

### Como Aplicativo Desktop
1. Execute `npm install` para instalar dependências
2. Execute `npm run electron-pack` para gerar o executável
3. Encontre o arquivo `.exe` na pasta `dist/`

## 🛠️ Tecnologias

- **Frontend:** React 18 + TypeScript
- **Estilização:** Tailwind CSS
- **Gráficos:** Recharts
- **Ícones:** Lucide React
- **Autenticação:** Firebase Authentication
- **Database:** Firebase Firestore
- **Desktop:** Electron
- **Build:** Create React App

## 📋 Pré-requisitos

- Node.js 16+
- npm ou yarn
- Conta Firebase (para autenticação e database)

## 🔧 Instalação Local

```bash
# Clonar repositório
git clone https://github.com/SEU_USUARIO/real-estate-broker-app.git

# Entrar na pasta
cd real-estate-broker-app

# Instalar dependências
npm install

# Iniciar desenvolvimento
npm start

# Gerar build para produção
npm run build

# Gerar executável desktop
npm run electron-pack
```

## 🌐 Deploy

### Opções Gratuitas
- **Vercel:** Arraste a pasta `build/`
- **Netlify:** Arraste a pasta `build/`
- **GitHub Pages:** Configure nas settings do repositório
- **Firebase Hosting:** Integração direta com Firebase

### Opções Pagas
- **Hostinger/GoDaddy:** Upload dos arquivos da pasta `build/`

## 📱 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── Analytics.tsx
│   ├── NotificationCenter.tsx
│   ├── TeamReports.tsx
│   └── ...
├── contexts/           # Contextos React
│   ├── AuthContext.tsx
│   └── TeamContext.tsx
├── services/          # Lógica de negócio
│   └── TeamService.ts
├── utils/             # Utilitários
├── types/             # Tipos TypeScript
└── firebase.ts         # Configuração Firebase
```

## 🔐 Configuração Firebase

1. Crie um projeto no Firebase Console
2. Ative Authentication (Email/Password)
3. Crie Firestore Database
4. Copie as credenciais para o arquivo `.env`

```
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
```

## 📊 Screenshots

*[Adicionar screenshots do aplicativo]*

## 👥 Contribuição

Contribuições são bem-vindas! Por favor:

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adicionando nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a MIT License.

## 📞 Contato

Desenvolvido com ❤️ para corretores de imóveis

---

**Nota:** Este é um projeto demonstrativo com funcionalidades completas para gestão imobiliária.
