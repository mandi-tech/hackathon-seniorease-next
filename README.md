<h1 align="center">
  Hackaton - Fase 5: SeniorEase
</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2.4-000000?logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2.5-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Ant_Design-6.3.7-0170FE?logo=antdesign&logoColor=white" alt="Ant Design" />
  <img src="https://img.shields.io/badge/GraphQL-Apollo_Client-E10098?logo=graphql&logoColor=white" alt="Apollo Client" />
  <img src="https://img.shields.io/badge/Storybook-10.4.0-FF4785?logo=storybook&logoColor=white" alt="Storybook" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.2.4-38BDF8?logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Status-Completo-green" alt="Status" />
</p>

> Aplicação Web robusta para gerenciamento financeiro pessoal desenvolvida em Next.js (App Router). O sistema conta com autenticação segura, dashboard com indicadores visuais de performance, extratos detalhados com filtros via URL e uma arquitetura focada em componentização isolada documentada no Storybook.

## 📑 Sumário

- 📱 [Sobre o projeto](#sobre)
- 🛠 [Tecnologias](#tecnologias)
- ✨ [Funcionalidades](#funcionalidades)
- 🏗 [Arquitetura e Padrões](#arquitetura)
- 📂 [Estrutura do Projeto](#estrutura)
- 🎨 [Design Tokens & Sistema de Temas](#design-system)
- 🚀 [Executando o projeto](#exe)
- 🎥 [Demonstração](#demonstracao)
- 👥 [Equipe](#equipe)

---

> [!TIP]
> É possível navegar pelos tópicos da nossa documentação de forma mais facilitada! [Basta acessar a nossa wiki.](https://github.com/mandi-tech/tc4-next-refactor/wiki)

---

<span id="sobre">

## 📱 Sobre o projeto

Este projeto foi desenvolvido como parte do **Hackaton - Fase 05** da Pós Tech.

A aplicação foi planejada sob a ótica de engenharia de software modular, unindo o ecossistema reativo do **React** e do **Next.js** à segurança de tipos do **TypeScript**. Além de entregar regras de negócio financeiras, o projeto destaca-se por possuir um catálogo visual estrito que documenta desde os átomos fundamentais de design (tokens de cor, espaçamento, sombras) até os organismos de dados complexos (gráficos e modais integrados com GraphQL).

---

<span id="tecnologias">

## 🛠 Tecnologias

A stack de ferramentas do projeto compreende as seguintes tecnologias:

### Core Frontend
- **Next.js (App Router)** — Divisão estrutural de rotas através de grupos de rotas (layouts de autenticação e dashboard).
- **TypeScript** — Tipagem estrita de contratos de dados, interfaces e propriedades de componentes.

### Camada de Rede & Dados (API)
- **Apollo Client (GraphQL)** — Cliente unificado para gerenciar requisições de Queries e Mutations, controle automático de cache e injeção de dados assíncronos.

### Interface & Estilização
- **Ant Design (AntD)** — Componentes de UI de alta fidelidade (Formulários, Inputs, DatePickers, Modais).
- **Tailwind CSS** — Utilitários de estilização atômica para agilidade e consistência visual.

### Documentação & Ferramental
- **Storybook** — Suite de isolamento visual para desenvolvimento, validação de estados de componentes e testes rápidos de layouts.

---

<span id="funcionalidades">

## ✨ Funcionalidades

### 🔐 Autenticação e Segurança
- **Proteção de Rotas:** Utilização de `auth-guard.tsx` para assegurar que apenas usuários validados acessem o ecossistema interno.
- **Interfaces Dedicadas:** Fluxos isolados e modulares para o formulário de Login (`LoginForm`) e registro de novas contas (`RegisterForm`).

### 📊 Dashboard e Visualização de Indicadores
- **Gráficos Avançados:** Exibição analítica de movimentações por meio de gráficos combinados (`ComposedChart`) e gráficos de rosca (`DonutChart`).
- **Sumários em Cards:** Componentes flexíveis de cartões (`Card`) para apresentar receitas, despesas e saldos consolidados.

### 💸 Extrato e Filtros Reativos
- **Sincronização via URL:** Barra de `Filtros` acoplada diretamente à URL da aplicação através de parâmetros de busca (`searchParams`), mantendo o estado permanente a recarregamentos.
- **Tabela Estruturada:** Listagem de transações com componentes dinâmicos de dados (`Table`).

### ➕ Cadastro e Modificação de Registros
- **Modal Multifuncional:** O `ModalTransacao` gerencia de forma inteligente a criação e edição de transações, efetuando o mapeamento reativo de categorias (entradas ou saídas) de acordo com o tipo escolhido.

---

<span id="arquitetura">

## 🏗 Arquitetura e Padrões

O projeto foi organizado com base em responsabilidades isoladas e no ecossistema nativo do Next.js App Router:

1. **Roteamento Baseado em Grupos (Routing Groups):** Divisão clara usando diretórios entre parênteses — `(auth)` para escopos de entrada e `(dashboard)` para a aplicação principal — evitando impactos cruzados em layouts.
2. **Separação UI vs. Features:** 
   - A pasta `components/ui` agrupa componentes visuais puros e primitivos (`Button`, `Card`, `Table`).
   - A pasta `components/features` centraliza componentes que dependem de estado de negócio ou chamadas de API (`modals`, `filtros`, `auth`).
3. **Desacoplamento de Dados com Custom Hooks:** Toda a lógica de comunicação GraphQL está encapsulada em ganchos reutilizáveis dentro da pasta `hooks/` (`use-transacoes.ts`, `use-dashboard.ts`), mantendo os componentes visuais focados estritamente em renderização.

---

<span id="estrutura">

## 📂 Estrutura do Projeto

```text
src/
├───app/                          # Sistema de rotas e layouts do Next.js
│   ├───(auth)/                   # Grupo de rotas públicas de Autenticação (Login/Cadastro)
│   └───(dashboard)/              # Grupo de rotas privadas (Painel e Extrato)
├───components/                   # Módulos e Componentes reutilizáveis de interface
│   ├───features/                 # Componentes acoplados a regras e lógica de negócio
│   │   ├───auth/                 # Guardas de autenticação e formulários estruturados
│   │   ├───filtros/              # Componente de filtros de busca amarrados à URL
│   │   └───modals/               # Modal híbrido de criação e modificação de transações
│   └───ui/                       # Primitivos visuais puros baseados no Ant Design
│       ├───Button/
|       ├───Card/                 # Elementos de micro-interação e wrappers
│       ├───Charts/               # Abstrações de gráficos (Composed e Donut)
│       ├───SidebarMenu/
|       └───Topbar/               # Peças estruturais e de navegação de layouts
├───context/                      # Contextos de controle global de estado (ex: Sidebar open/close)
├───graphql/                      # Camada de definição do esquema GraphQL (Queries e Mutations)
├───hooks/                        # React Hooks customizados para isolar chamadas de dados
├───libs/                         # Infraestrutura de dados, utilitários e definições globais
│   ├───types/                    # Interfaces centrais de tipagem TypeScript
│   └───utils/                    # Validadores, formatadores e helpers auxiliares
└───styles/                       # Arquivos globais de estilos e tokens de design do sistema
    └───theme/                    # Subdivisões explícitas dos tokens documentados no Storybook
        ├───borderRadius/
        ├───colors/
        ├───shadows/
        ├───spacing/
        └───typhography/
```

---

<span id="design-system">

## 🎨 Design System

O projeto possui uma arquitetura de **Design System própria**, responsável por centralizar a identidade visual e os componentes de forma escalável através de:

- ✨ **Tokens Visuais:** Definições estritas de estilo para evitar valores arbitrários (*magic numbers*).
- 🧩 **Componentes Reutilizáveis:** Componentes puros baseados nas fundações do Ant Design.
- 🎨 **Temas:** Extensões semânticas amarradas ao Tailwind CSS e arquivos de configuração.

### 🎨 Tokens

Localizados em: `src/styles/theme/`

#### Cores (`colors/`)
- `theme.colors.primary` — Cor de destaque da marca (ações principais e links).
- `theme.colors.secondary` — Tons de suporte para hierarquia visual secundária.
- `theme.colors.success` — Indicador positivo (receitas, saldos positivos).
- `theme.colors.error` — Indicador de atenção (despesas, validações de erro).
- `theme.colors.background` — Base de fundo da aplicação.
- `theme.colors.surface` — Fundo de elementos flutuantes (cards, modais).

#### Espaçamento (`spacing/`)
- `theme.spacing.xs` — Ajustes mínimos e paddings internos pequenos.
- `theme.spacing.sm` — Distância entre elementos de um mesmo bloco.
- `theme.spacing.md` — Margem padrão entre blocos de conteúdo.
- `theme.spacing.lg` — Espaçamento entre seções estruturais.
- `theme.spacing.xl` — Respiro para layouts de grandes áreas.

#### Tipografia & Bordas (`typhography/` e `borderRadius/`)
- `theme.typography.title` — Títulos de páginas e sumários.
- `theme.typography.body` — Textos corridos e descrições de tabelas.
- `theme.typography.button` — Rótulos de ações e micro-interações.
- `theme.borderRadius.md` — Arredondamento padrão para botões e inputs.
  
---

<span id="exe">

## 🚀 Executando o Projeto

### 1. Instalar as dependências do projeto
```Bash
npm install
# ou
yarn install
```

### 2. Configurar o Ambiente
Crie um arquivo .env na raiz do projeto e configure a URL de conexão para o seu endpoint GraphQL ativo:

```
NEXT_PUBLIC_API_URL=https://tc4-backend-graphql-production.up.railway.app/graphql/
```
> [!TIP]
> Se preferir, é possível rodar o projeto [tc4-backend-graphql](https://github.com/mandi-tech/tc4-backend-graphql) e utiliza-lo localmente substituindo o NEXT_PUBLIC_API_URL pela do servidor local. Por padrão, será http://localhost:8080/

### 3. Executar o servidor de desenvolvimento
```Bash
npm run dev
# ou
yarn dev
```

Acesse http://localhost:3000 no seu navegador para ver a aplicação rodando.

---

<span id="demonstracao">

## 🎥 Demonstração
O vídeo abaixo apresenta o fluxo completo da aplicação web: telas de autenticação e proteção de rotas, navegação responsiva, filtragem via parâmetros na URL, abertura e validação do formulário no modal, além de um tour completo pelo ecossistema de componentes e tokens documentados dentro do Storybook:

[Assista ao Vídeo de Demonstração no YouTube](https://www.youtube.com/watch?v=THis5gU93Ck)

---

<span id="equipe">

## 👥 Equipe - Grupo 05

| RM | Nome | LinkedIn | GitHub | 
| :-------: | :--: | :---------:|:-------: | 
| RM367409 | Isabelle Dias Ribeiro Silva|[![Linkedin Badge](https://img.shields.io/badge/Linkedin-blue?style=flat-square&logo=Linkedin&logoColor=white)](https://www.linkedin.com/in/drisabelles) | [![GitHub Badge](https://img.shields.io/badge/GitHub-111217?style=flat-square&logo=github&logoColor=white)](https://github.com/drisabelles)| 
| RM367047 | Mariana Ayumi Tamay | [![Linkedin Badge](https://img.shields.io/badge/Linkedin-blue?style=flat-square&logo=Linkedin&logoColor=white)](https://www.linkedin.com/in/marianatamay) | [![GitHub Badge](https://img.shields.io/badge/GitHub-111217?style=flat-square&logo=github&logoColor=white)](https://github.com/Mariayumi)
