# Industrial Safety Monitor — Sistema IoT com ESP32, Supabase & Vercel

Sistema de monitoramento e telemetria industrial em tempo real para operadores e capacetes inteligentes (IoT), com dashboard interativo, persistência em nuvem com **Supabase (PostgreSQL)** e deploy automático na **Vercel**.

---

## Tecnologias

- **Frontend:** React 19, TypeScript, Vite 6, Tailwind CSS 4
- **Interface & Visualização:** React Leaflet (mapa geoespacial), Lucide React (ícones), Motion (animações)
- **Banco de Dados em Nuvem:** Supabase (PostgreSQL com RLS, Triggers e Índices)
- **Hardware / IoT:** ESP32 (Wi-Fi, sensor MPU6050, GPS TinyGPSPlus, SW-420, FC-04)
- **Deploy:** Vercel (CI/CD nativo com GitHub)

---

## Estrutura do Repositório

```
Teste_IAstudio2.0/
├── src/                          # Código-fonte React/TypeScript
│   ├── components/               # Modais de gestão, Dashboard, Mapa, etc.
│   │   ├── Dashboard.tsx         # Dashboard operacional principal
│   │   ├── Map.tsx               # Rastreamento geográfico em tempo real
│   │   ├── HelmetManagementModal.tsx   # Gestão e calibração de capacetes
│   │   ├── EmployeeManagementModal.tsx # Cadastro e monitoramento de funcionários
│   │   ├── UserManagementModal.tsx     # Controle de acesso e permissões (RBAC)
│   │   ├── SafetyAnalyticsModal.tsx    # Conformidade NR-06 / NR-12 e laudos TCC
│   │   └── Login.tsx / Register.tsx    # Autenticação de usuários
│   ├── services/
│   │   ├── supabaseClient.ts     # Cliente Supabase com detecção inteligente
│   │   └── dataService.ts        # Camada resiliente (Supabase + LocalStorage Fallback)
│   ├── types.ts                  # Interfaces TypeScript compartilhadas
│   ├── App.tsx                   # Componente central do sistema
│   └── main.tsx                  # Ponto de entrada React
├── public/                       # Favicon e arquivos estáticos
├── esp32/                        # Firmware do microcontrolador
│   └── Codigo_Teste_API.ino      # Código C++ para o ESP32 com sensores
├── api-sensores-local/           # Servidor local Express para testes de telemetria
│   ├── server.js                 # API Express (POST /api/dados)
│   └── package.json              # Dependências do servidor local
├── supabase_schema.sql           # Schema SQL completo (tabelas, RLS e seeds)
├── vercel.json                   # Configuração de roteamento SPA da Vercel
├── vite.config.ts                # Configuração do Vite
├── package.json                  # Dependências e scripts do frontend
├── .env.example                  # Template de variáveis de ambiente
├── .gitignore                    # Arquivos ignorados pelo Git (node_modules, .env)
├── iniciar_servidor.bat          # Script para rodar servidor localmente
└── iniciar_tunel_ngrok.bat       # Script para criar túnel ngrok
```

---

## 1. Configuração do Supabase (Banco de Dados em Nuvem)

1. Acesse [supabase.com](https://supabase.com) e crie ou abra seu projeto.
2. No menu lateral esquerdo, clique em **SQL Editor**.
3. Clique em **New query**.
4. Copie todo o conteúdo do arquivo [`supabase_schema.sql`](supabase_schema.sql) deste repositório e cole no editor.
5. Clique em **Run** (ou `Ctrl + Enter`).
   - O script criará as tabelas `companies`, `users`, `helmets`, `employees`, `safety_guidelines` e `accident_events`.
   - Também aplicará políticas de segurança (RLS) e dados iniciais de demonstração (Seed).
6. Vá em **Project Settings** (ícone de engrenagem) → **API**:
   - Copie o **Project URL** (ex: `https://xyzcompany.supabase.co`).
   - Copie a chave **anon public** (`Project API keys` → `anon` / `public`).

---

## 2. Deploy na Vercel (Conexão via GitHub)

### Passo 1: Suba o código para o seu repositório no GitHub
```bash
git add .
git commit -m "feat: preparar projeto para Vercel e Supabase"
git push -u origin main
```

### Passo 2: Importe o projeto na Vercel
1. Acesse [vercel.com](https://vercel.com) e conecte sua conta do GitHub.
2. Clique em **"Add New..."** → **"Project"**.
3. Localize e selecione o repositório do projeto.
4. A Vercel detectará automaticamente que é um projeto **Vite**:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `./` (raiz)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### Passo 3: Configure as Variáveis de Ambiente no Vercel
Antes de clicar em Deploy, expanda a seção **Environment Variables** e adicione:

| Chave | Valor | Descrição |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://seu-id.supabase.co` | URL do seu projeto no Supabase |
| `VITE_SUPABASE_ANON_KEY` | `sua-chave-anon-publica` | Chave pública anônima do Supabase |
| `VITE_API_URL` | *(opcional)* | URL do túnel ngrok/servidor se usar ESP32 físico via internet |

5. Clique em **"Deploy"**. Em menos de 1 minuto seu dashboard estará no ar!

---

## 3. Execução em Desenvolvimento Local

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis Locais
Crie ou edite o arquivo `.env` na raiz:
```env
VITE_SUPABASE_URL=https://seu-id.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
VITE_API_URL=
```

### 3. Iniciar o Servidor Local
Você pode clicar duas vezes em `iniciar_servidor.bat` ou rodar no terminal:
```bash
npm run dev
```
Acesse no navegador: `http://localhost:3000` (ou a porta informada pelo Vite).

---

## 4. Credenciais de Acesso Padrão

| Perfil | Usuário | Senha | Função |
|---|---|---|---|
| **Admin Geral (Master)** | `adminmaster` | `123456` | Acesso total a todas as configurações |
| **Admin Empresa** | `Gbxm` | `123456` | Gestão de capacetes, operadores e auditorias |
| **Visualizador** | `visualizador` | `123456` | Acesso apenas para leitura |

---

## 5. Integração com o ESP32

1. Abra o arquivo [`esp32/Codigo_Teste_API.ino`](esp32/Codigo_Teste_API.ino) na Arduino IDE.
2. Ajuste o Wi-Fi (`ssid` e `password`).
3. Configure o endereço de envio `apiURL` apontando para o seu IP local (ex: `http://192.168.0.xxx:3000/api/dados`) ou URL pública gerada pelo ngrok.
4. Faça o upload para a placa ESP32.
