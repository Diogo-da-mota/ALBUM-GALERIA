# Estrutura do Projeto - ALBUM GALERIA

Esta documentação apresenta a organização do projeto baseada nas rotas e funcionalidades específicas de cada área.

## 📁 Estrutura Principal

```
├── src/                           # Código fonte principal
│   ├── components/               # Componentes React reutilizáveis
│   │   ├── admin/               # Componentes específicos da área admin (rotas /admin/*)
│   │   │   ├── AdminSidebar.tsx      # Sidebar da área administrativa
│   │   │   ├── PedidoCard.tsx        # Card de exibição de pedidos
│   │   │   └── configuracoes/        # Componentes da rota /admin/configuracoes
│   │   │       ├── ImagemTab.tsx         # Aba de configuração de imagem/logo
│   │   │       └── PerfilTab.tsx         # Aba de configuração de perfil
│   │   ├── identificacao/       # Componentes de identificação de cliente (rota /site)
│   │   │   └── IdentificacaoCliente.tsx  # Formulário de identificação para clientes
│   │   ├── layout/              # Componentes de layout geral
│   │   │   ├── PageLayout.tsx           # Layout padrão das páginas internas
│   │   │   └── PublicPageLayout.tsx     # Layout das páginas públicas (/site/*)
│   │   ├── navigation/          # Componentes de navegação
│   │   │   └── ProgressBar.tsx          # Barra de progresso do fluxo de pedido
│   │   ├── ui/                  # Componentes UI base (shadcn/ui + customizados)
│   │   │   ├── AdminLoginModal.tsx      # Modal de login administrativo
│   │   │   ├── ImageCropper.tsx         # Componente de recorte de imagens
│   │   │   ├── RadioGroup.tsx           # Grupo de botões radio customizado
│   │   │   ├── SelectionCard.tsx        # Card de seleção usado no fluxo de pedido
│   │   │   ├── UserAvatar.tsx           # Avatar/logo do usuário
│   │   │   ├── accordion.tsx            # Componente accordion (shadcn/ui)
│   │   │   ├── alert-dialog.tsx         # Dialog de alerta (shadcn/ui)
│   │   │   ├── alert.tsx                # Componente de alerta (shadcn/ui)
│   │   │   ├── button.tsx               # Botão base (shadcn/ui)
│   │   │   ├── card.tsx                 # Card base (shadcn/ui)
│   │   │   ├── dialog.tsx               # Dialog base (shadcn/ui)
│   │   │   ├── input.tsx                # Input base (shadcn/ui)
│   │   │   ├── tabs.tsx                 # Abas (shadcn/ui)
│   │   │   ├── toast.tsx                # Toast de notificação (shadcn/ui)
│   │   │   └── ... (outros componentes shadcn/ui)
│   │   ├── PrivateRoute.tsx     # Componente de proteção de rotas
│   │   └── ProtectedRoute.tsx   # Componente alternativo de proteção de rotas
│   ├── layouts/                 # Layouts principais da aplicação
│   │   ├── AdminLayout.tsx             # Layout da área administrativa (/admin/*)
│   │   └── PublicLayout.tsx            # Layout da área pública (/site/*)
│   ├── pages/                   # Páginas da aplicação
│   │   ├── admin/               # Páginas da área administrativa (rotas /admin/*)
│   │   │   ├── Dashboard.tsx            # Dashboard administrativo (/admin)
│   │   │   ├── Albuns.tsx               # Gestão de álbuns (/admin/albuns)
│   │   │   ├── Estojos.tsx              # Gestão de estojos (/admin/estojos)
│   │   │   ├── Precos.tsx               # Gestão de preços (/admin/precos)
│   │   │   ├── Feedbacks.tsx            # Visualização de feedbacks (/admin/feedbacks)
│   │   │   ├── Configuracoes.tsx        # Configurações gerais (/admin/configuracoes)
│   │   │   ├── reajustes.tsx            # Página de reajustes de preços
│   │   │   └── index.ts                 # Index de exportação
│   │   ├── Login.tsx            # Página de login (rota / e /login)
│   │   ├── Register.tsx         # Página de registro (/register)
│   │   ├── PublicIndex.tsx      # Página inicial pública (/site)
│   │   ├── Index.tsx            # Página de seleção de álbuns (/albuns)
│   │   ├── Size.tsx             # Página de seleção de tamanho (/tamanho e /site/tamanho)
│   │   ├── Pages.tsx            # Página de seleção de páginas (/paginas e /site/paginas)
│   │   ├── Finish.tsx           # Página de acabamento/laminação (/laminacao e /site/laminacao)
│   │   ├── Case.tsx             # Página de seleção de estojo (/estojo e /site/estojo)
│   │   ├── Summary.tsx          # Página de resumo do pedido (/resumo, /pedido, /site/resumo, /site/pedido)
│   │   ├── PhotographerDashboard.tsx    # Dashboard do fotógrafo (/photographer)
│   │   ├── Laminacao.tsx        # Página alternativa de laminação
│   │   └── NotFound.tsx         # Página de erro 404
│   ├── hooks/                   # Hooks customizados
│   │   ├── useAlbumPrices.ts           # Hook para gerenciamento de preços de álbuns
│   │   ├── useImageUpload.ts           # Hook para upload de imagens
│   │   ├── use-mobile.tsx              # Hook para detecção de dispositivo móvel
│   │   └── use-toast.ts                # Hook para sistema de notificações
│   ├── contexts/                # Contextos React
│   │   └── AvatarContext.tsx           # Contexto para gerenciamento de avatar/logo
│   ├── lib/                     # Bibliotecas e integrações
│   │   ├── supabase.ts                 # Configuração do Supabase
│   │   ├── utils.ts                    # Utilitários gerais
│   │   └── initialData.ts              # Dados iniciais da aplicação
│   ├── store/                   # Gerenciamento de estado
│   │   └── orderStore.ts               # Store para pedidos
│   ├── types/                   # Definições de tipos TypeScript
│   │   └── database.types.ts           # Tipos do banco de dados
│   ├── utils/                   # Utilitários e funções auxiliares
│   │   └── priceCalculator.ts          # Calculadora de preços
│   ├── App.tsx                  # Componente principal com configuração de rotas
│   └── main.tsx                 # Ponto de entrada da aplicação
├── public/                      # Arquivos estáticos públicos
│   ├── favicon.ico             # Ícone da aplicação
│   ├── placeholder.svg         # Imagem placeholder
│   └── robots.txt              # Arquivo robots.txt para SEO
├── docs/                        # Documentação do projeto
│   └── 45 prompt               # Documentação de prompts
├── PRD.md                       # Documento de Requisitos do Produto
├── ALBUM_PRO.md                 # Documentação técnica do projeto
├── PRICING_LOGIC.md             # Documentação da lógica de preços
└── README.md                    # Documentação principal
```

## 🛣️ Mapeamento de Rotas por Funcionalidade

### 📊 Área Administrativa (`/admin/*`)
- **Layout**: `AdminLayout.tsx`
- **Componentes**: `components/admin/`
- **Páginas**: `pages/admin/`
- **Rotas**:
  - `/admin` → Dashboard administrativo
  - `/admin/albuns` → Gestão de álbuns
  - `/admin/estojos` → Gestão de estojos
  - `/admin/precos` → Gestão de preços
  - `/admin/feedbacks` → Visualização de feedbacks
  - `/admin/configuracoes` → Configurações gerais

### 🌐 Área Pública (`/site/*`)
- **Layout**: `PublicLayout.tsx`
- **Componentes**: `components/identificacao/`, `components/layout/PublicPageLayout.tsx`
- **Páginas**: Páginas reutilizadas do fluxo principal
- **Rotas**:
  - `/site` → Seleção inicial de álbum (PublicIndex.tsx)
  - `/site/tamanho` → Seleção de tamanho
  - `/site/paginas` → Seleção de páginas
  - `/site/laminacao` → Seleção de acabamento
  - `/site/estojo` → Seleção de estojo
  - `/site/resumo` → Resumo do pedido
  - `/site/pedido` → Confirmação do pedido

### 📸 Área do Fotógrafo (`/photographer`)
- **Página**: `PhotographerDashboard.tsx`
- **Funcionalidade**: Dashboard exclusivo para fotógrafos

### 🔐 Autenticação
- **Rotas**: `/`, `/login`, `/register`
- **Páginas**: `Login.tsx`, `Register.tsx`
- **Componentes**: `PrivateRoute.tsx`, `ProtectedRoute.tsx`

### 🛒 Fluxo de Pedido (rotas protegidas)
- **Rotas**: `/albuns`, `/tamanho`, `/paginas`, `/laminacao`, `/estojo`, `/resumo`, `/pedido`
- **Layout**: `PageLayout.tsx`
- **Componentes**: `navigation/ProgressBar.tsx`, `ui/SelectionCard.tsx`

## 📝 Observações

- Componentes em `ui/` são principalmente do shadcn/ui com algumas customizações
- Páginas são reutilizadas entre rotas públicas (`/site/*`) e protegidas
- Sistema de autenticação baseado em roles (admin/user)
- Layout responsivo com componentes adaptativos para diferentes dispositivos