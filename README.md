<h1 align="center">
  Hackathon - Pós Tech FIAP: SeniorEase
</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2.9-000000?logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.0-38BDF8?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Ant_Design-6.4.4-0170FE?logo=antdesign&logoColor=white" alt="Ant Design" />
  <img src="https://img.shields.io/badge/Supabase-SSR-3ECF8E?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Vitest-3.2.7-6E9F18?logo=vitest&logoColor=white" alt="Vitest" />
  <img src="https://img.shields.io/badge/Status-Completo-green" alt="Status" />
</p>

> Aplicação Web focada em **Acessibilidade Digital para Idosos** em ambientes
> acadêmicos e profissionais, desenvolvida com **Next.js (App Router)**. A
> plataforma propicia autonomia, previsibilidade e conforto cognitivo por meio
> de ajustes de legibilidade, interface simplificada, gerenciador de tarefas
> guiado e preferências persistentes.

---

## 📑 Sumário

- 📱 [Sobre o Projeto](#sobre)
- 🛠 [Tecnologias](#tecnologias)
- ✨ [Funcionalidades Principais](#funcionalidades)
- 🏗 [Arquitetura e Boas Práticas](#arquitetura)
- 📂 [Estrutura do Projeto](#estrutura)
- 🧪 [Testes e Qualidade](#testes)
- 🚀 [Executando o Projeto](#executando)
- 🎥 [Demonstração](#demonstracao)
- 👥 [Equipe](#equipe)

---

<span id="sobre">

## 📱 Sobre o Projeto

Projeto final do **Hackathon - Pós-Tech FIAP (Front-End Engineering)** em
parceria fictícia com a instituição _FIAP Inclusive_.

O **SeniorEase** foi idealizado para mitigar as barreiras digitais enfrentadas
pela terceira idade — como redução de acuidade visual, perda gradual de memória
e dificuldades na coordenação motora fina. A solução entrega uma interface
adaptável, com alto contraste, fontes ajustáveis, navegação preditiva e
confirmações reforçadas para evitar ações acidentais.

---

<span id="tecnologias">

## 🛠 Tecnologias

A stack do projeto é composta por:

### Core & Frameworks

- **Next.js 16 (App Router & Turbopack)** — Roteamento baseado no sistema de
  arquivos, renderização otimizada e middlewares.
- **React 19** — Construção de componentes reativos e gerenciamento de estado.
- **TypeScript** — Tipagem estrita de contratos de dados, props e utilitários.

### Backend & Autenticação

- **Supabase (`@supabase/supabase-js` & `@supabase/ssr`)** — Autenticação
  segura, banco de dados PostgreSQL e persistência de preferências do usuário.

### Interface & Estilização

- **Tailwind CSS v4** — Estilização utilitária atômica e responsiva.
- **Ant Design (AntD v6)** — Componentes de UI acessíveis e estruturados.
- **Lucide React** — Iconografia clara, legível e de alto contraste.

### Testes & Qualidade

- **Vitest & React Testing Library** — Testes unitários e de integração de
  componentes.
- **Playwright** — Testes End-to-End (E2E) simulando fluxos completos de
  navegação.

---

<span id="funcionalidades">

## ✨ Funcionalidades Principais

### ⚙️ 1. Painel de Personalização da Experiência

- **Ajuste Dinâmico de Legibilidade:** Redimensionamento de fontes (pequeno,
  médio, grande, extra grande) e espaçamento entre linhas/elementos.
- **Modos de Contraste:** Alternância rápida para alto contraste ou modo de
  leitura confortável.
- **Simplificação de Interface:** Alternância entre Modo Básico (foco total na
  tarefa) e Modo Avançado.
- **Proteção Cognitiva:** Confirmações adicionais antes de executar ações
  destrutivas ou críticas.

### 📋 2. Organizador de Atividades Simplificado

- **Lista de Tarefas Descomplicada:** Visualização limpa e intuitiva das
  pendências diárias e acadêmicas.
- **Fluxo Guiado Passo a Passo:** Detalhamento de etapas de execução com
  feedbacks visuais claros e positivos ao concluir.
- **Lembretes e Histórico:** Alertas em linguagem clara e registro acessível de
  atividades finalizadas.

### 👤 3. Perfil do Usuário e Persistência de Preferências

- **Salvar na Nuvem:** Todas as preferências de acessibilidade e configurações
  de conta ficam sincronizadas via Supabase para que o idoso mantenha sua
  experiência configurada em qualquer dispositivo.

---

<span id="arquitetura">

## 🏗 Arquitetura e Boas Práticas

- **Clean Architecture & Separation of Concerns:** Camada de UI desacoplada das
  regras de negócio e chamadas ao Supabase.
- **Design de Componentes Acessíveis:** Botões e áreas de clique ampliadas
  (mínimo 48x48px), contraste em conformidade com as diretrizes WCAG e navegação
  previsível.
- **Feedback Visual Reforçado:** Indicadores claros de status, mensagens
  explicativas de erro e sucesso sem uso exclusivo de cores para diferenciação.

---

<span id="estrutura">

## 📂 Estrutura do Projeto

```text
src/
├── app/                          # Rotas e Páginas do Next.js (App Router)
│   ├── (auth)/                   # Páginas públicas (Login e Cadastro)
│   ├── acessibilidade/           # Painel dedicado a ajustes de contraste e fontes
│   ├── perfil/                   # Perfil e configurações do usuário
│   └── tarefas/                  # Organizador e detalhes de tarefas
├── components/                   # Componentes reutilizáveis
│   ├── features/                 # Componentes com lógica de negócio (Acessibilidade, Tarefas, Auth)
│   └── ui/                       # Componentes primitivos puros de interface
├── context/                      # React Context para preferências de acessibilidade globais
├── hooks/                        # Custom Hooks para Supabase, temas e gerenciamento de estado
├── libs/                         # Configuração do cliente Supabase e helpers
└── styles/                       # Estilos globais e extensões do Tailwind CSS

```

---

<span id="testes">

## 🧪 Testes e Qualidade O projeto conta com uma suíte abrangente de testes para

garantir a estabilidade e acessibilidade:

```
# Executar testes unitários com Vitest
npm run test

# Executar suíte de testes E2E com Playwright
npm run test:e2e

# Abrir a interface visual do Playwright
npm run test:e2e:ui
```

---

<span id="executando">

## 🚀 Executando o Projeto

1. Clonar o repositório e instalar dependências Bash git clone
   [https://github.com/mandi-tech/hackathon-seniorease-next.git](https://github.com/mandi-tech/hackathon-seniorease-next.git)
   cd hackathon-seniorease-next npm install
2. Configurar Variáveis de Ambiente Crie um arquivo .env.local na raiz do
   projeto com as credenciais do seu projeto Supabase:

```
  NEXT_PUBLIC_SUPABASE_URL=[https://seu-projeto.supabase.co](https://seu-projeto.supabase.co)
  NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

3. Executar o Servidor de Desenvolvimento

```
  npm run dev
```

Acesse http://localhost:3000 no seu navegador para testar a aplicação
localmente.

---

<span id="demonstracao">

## 🎥 Demonstração

[Vídeo de demonstração](https://github.com/mandi-tech/hackathon-seniorease-next.git)

[Link do projeto em Produção](http://54.167.224.119/)

---

<span id="equipe">

## 👥 Equipe - Grupo 05

|    RM    |            Nome             |                                                                         LinkedIn                                                                          |                                                                   GitHub                                                                    |
| :------: | :-------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------: |
| RM367409 | Isabelle Dias Ribeiro Silva | [![Linkedin Badge](https://img.shields.io/badge/Linkedin-blue?style=flat-square&logo=Linkedin&logoColor=white)](https://www.linkedin.com/in/drisabelles)  | [![GitHub Badge](https://img.shields.io/badge/GitHub-111217?style=flat-square&logo=github&logoColor=white)](https://github.com/drisabelles) |
| RM367047 |     Mariana Ayumi Tamay     | [![Linkedin Badge](https://img.shields.io/badge/Linkedin-blue?style=flat-square&logo=Linkedin&logoColor=white)](https://www.linkedin.com/in/marianatamay) |  [![GitHub Badge](https://img.shields.io/badge/GitHub-111217?style=flat-square&logo=github&logoColor=white)](https://github.com/Mariayumi)  |
