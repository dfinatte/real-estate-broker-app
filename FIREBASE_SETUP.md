# Configuração do Firebase para o App Imobiliário

## Passo 1: Criar Projeto Firebase
1. Acesse https://console.firebase.google.com
2. Clique em "Adicionar projeto"
3. Nome do projeto: `real-estate-broker-app`
4. Continue e configure o Google Analytics (opcional)

## Passo 2: Configurar Autenticação
1. No menu esquerdo, vá em "Authentication"
2. Clique em "Começar"
3. Ative "Email/Senha"
4. Salve as configurações

## Passo 3: Configurar Firestore Database
1. No menu esquerdo, vá em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Iniciar em modo de teste" (para desenvolvimento)
4. Escolha um local para os dados (recomendado: `us-central1`)
5. Clique em "Criar"

## Passo 4: Obter Credenciais
1. No menu esquerdo, clique no ícone de engrenagem ⚙️ > "Configurações do projeto"
2. Na seção "Seus apps", clique no ícone da Web (</>)
3. Nome do app: `Real Estate App`
4. Clique em "Registrar app"
5. Copie as credenciais (firebaseConfig)

## Passo 5: Atualizar Configuração no App
Substitua as credenciais no arquivo `src/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO_ID",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

## Passo 6: Configurar Regras de Segurança
No Firestore Database > Regras, substitua com:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários só podem acessar seus próprios dados
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Estrutura de Dados no Firebase

```
users/
  {userId}/
    clients/
      {clientId}/
        - nome: string
        - telefone: string
        - email: string
        - etc...
    contactRecords/
      {recordId}/
        - clientId: string
        - data: string
        - etc...
    visitRecords/
      {recordId}/
        - clientId: string
        - data: string
        - etc...
```

## Funcionalidades Implementadas

✅ Login/Cadastro com email e senha
✅ Autenticação automática
✅ Salvar dados na nuvem
✅ Proteção de dados por usuário
✅ Logout

## Teste Local

1. Após configurar o Firebase, execute:
```bash
npm start
```

2. Teste o cadastro e login

## Plano Gratuito Firebase

- **Armazenamento**: 1GB
- **Transferência**: 10GB/mês
- **Leituras**: 50.000/dia
- **Escritas**: 20.000/dia
- **Usuários**: Ilimitados

Perfeito para pequenos imobiliárias!
