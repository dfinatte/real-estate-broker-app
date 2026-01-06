# 🚀 Como Fazer Upload para o GitHub

## 📋 Passo a Passo Completo

### 1️⃣ Instalar Git (se ainda não tiver)
1. Baixe: https://git-scm.com/download/win
2. Instale com opções padrão
3. Reinicie o computador

### 2️⃣ Criar Repositório no GitHub
1. Acesse: https://github.com
2. Clique em "New repository" (botão verde)
3. Nome: `real-estate-broker-app`
4. Descrição: "Sistema para Corretores de Imóveis"
5. Marque "Public"
6. Clique em "Create repository"

### 3️⃣ Configurar Git Localmente
Abra o terminal na pasta do projeto e execute:

```bash
# Iniciar repositório Git
git init

# Configurar seu nome (substitua com seus dados)
git config user.name "Seu Nome"
git config user.email "seu.email@exemplo.com"

# Adicionar todos os arquivos
git add .

# Fazer primeiro commit
git commit -m "🚀 Initial commit - Real Estate Broker App"

# Adicionar repositório remoto (substitua SEU_USUARIO)
git remote add origin https://github.com/SEU_USUARIO/real-estate-broker-app.git

# Enviar para o GitHub
git push -u origin main
```

### 4️⃣ Arquivos Importantes para Upload
✅ **Não enviar para GitHub:**
- `node_modules/` (pasta muito grande)
- `build/` (pode ser gerada localmente)
- `.env` (contém senhas/chaves)
- `dist/` (executáveis)

✅ **Criar arquivo .gitignore:**
Crie um arquivo `.gitignore` com:
```
node_modules/
build/
dist/
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

### 5️⃣ Deploy Automático (Opcional)
Após subir para GitHub, você pode:
1. **Vercel:** Conecte seu GitHub ao Vercel
2. **Netlify:** Conecte seu GitHub ao Netlify
3. **GitHub Pages:** Ative nas configurações do repositório

## 🌐 Links Úteis
- GitHub: https://github.com
- Vercel: https://vercel.com
- Netlify: https://netlify.com

## 📱 Resultado Final
Após o upload, seu app estará disponível em:
`https://SEU_USUARIO.github.io/real-estate-broker-app/`
