# PRD - Álbum Galeria

## 📝 Visão Geral do Produto

O Álbum Galeria é uma plataforma web para fotógrafos gerenciarem e venderem seus álbuns fotográficos, permitindo que seus clientes personalizem e façam pedidos de álbuns de forma autônoma.

## 👥 Personas

### Fotógrafo (Admin)
- Profissional que precisa gerenciar preços e configurações dos álbuns
- Necessita de um painel administrativo para controle total do sistema
- Precisa visualizar e gerenciar pedidos

### Cliente (Usuário Final)
- Pessoa que deseja personalizar e encomendar um álbum fotográfico
- Busca uma experiência intuitiva de customização
- Precisa visualizar preços e opções de forma clara

## 🎯 Funcionalidades Principais

### Área Pública (/site)
1. **Seleção de Álbum**
   - Visualização de modelos disponíveis
   - Preços base de cada modelo
   - Imagens demonstrativas

2. **Personalização do Álbum**
   - Seleção de tamanho
   - Escolha do número de páginas
   - Opções de acabamento (laminação)
   - Seleção de estojo (opcional)

3. **Resumo do Pedido**
   - Visualização de todas as escolhas
   - Cálculo do preço final
   - Confirmação do pedido

### Área Administrativa (/admin)
1. **Gestão de Álbuns**
   - Cadastro de modelos
   - Upload de imagens
   - Definição de preços base
   - Configuração de reajustes

2. **Gestão de Preços**
   - Reajuste de valores base
   - Reajuste por lâmina
   - Precificação de estojos

3. **Visualização do Site**
   - Botão para abrir site em nova aba
   - Verificação das alterações em tempo real

### Área do Fotógrafo (/photographer)
1. **Gestão de Pedidos**
   - Visualização de pedidos recebidos
   - Status de produção
   - Histórico de pedidos

## 🔒 Autenticação e Segurança

### Sistema de Login
- Login com email/senha
- Recuperação de senha
- Níveis de acesso (admin/user)

### Proteção de Rotas
- Rotas públicas (/site/*)
- Rotas administrativas protegidas (/admin)
- Rotas do fotógrafo protegidas (/photographer)

## 💻 Especificações Técnicas

### Frontend
- React com TypeScript
- Tailwind CSS para estilização
- Shadcn/ui para componentes
- React Router para navegação

### Backend
- Supabase para autenticação
- Banco de dados PostgreSQL
- Storage para imagens
- RLS (Row Level Security) para segurança

### Integrações
- Supabase Auth
- Supabase Storage
- Supabase Database

## 📱 Responsividade

- Layout adaptativo para desktop e tablets
- Navegação otimizada para diferentes dispositivos
- Componentes responsivos

## 🔄 Fluxo de Pedido

1. Cliente acessa /site
2. Seleciona modelo do álbum
3. Escolhe tamanho
4. Define número de páginas
5. Seleciona acabamento
6. Opcional: escolhe estojo
7. Revisa pedido
8. Confirma encomenda

## 🎨 Design System

### Cores
- Fundo escuro: #0B0F17
- Elementos: #1A1F2E
- Botões primários: blue-600
- Botões destrutivos: red-600
- Textos: white/gray-200

### Tipografia
- Títulos: 2xl/3xl com font-semibold
- Textos: base/lg
- Botões: com ícones à esquerda

### Componentes
- Cards para seleção
- Botões com estados hover
- Modais para ações importantes
- Formulários padronizados

## 🔄 Ciclo de Vida do Pedido

1. **Criação**
   - Cliente finaliza personalização
   - Sistema gera número do pedido
   - Notificação para admin

2. **Processamento**
   - Admin revisa pedido
   - Confirma especificações
   - Inicia produção

3. **Finalização**
   - Produto é finalizado
   - Cliente é notificado
   - Pedido é arquivado

## 📈 Métricas de Sucesso

1. **Engajamento**
   - Taxa de conclusão de pedidos
   - Tempo médio de personalização
   - Páginas mais visitadas

2. **Performance**
   - Tempo de carregamento
   - Taxa de erro
   - Uptime do sistema

## 🔜 Roadmap Futuro

### Fase 1 - MVP
- ✅ Sistema de autenticação
- ✅ Gestão de álbuns
- ✅ Fluxo de pedido básico

### Fase 2 - Melhorias
- Sistema de notificações
- Histórico detalhado de pedidos
- Relatórios de vendas

### Fase 3 - Expansão
- Integração com pagamentos
- App mobile para fotógrafos
- Sistema de avaliações

## 📋 Requisitos Não-Funcionais

1. **Performance**
   - Carregamento inicial < 3s
   - Resposta do servidor < 1s
   - Otimização de imagens

2. **Segurança**
   - Dados criptografados
   - Backup diário
   - Logs de atividades

3. **Disponibilidade**
   - Uptime > 99.9%
   - Manutenções programadas
   - Monitoramento 24/7

## 🔍 Considerações Finais

Este PRD é um documento vivo que será atualizado conforme o produto evolui. Todas as funcionalidades descritas devem ser implementadas seguindo as melhores práticas de desenvolvimento e mantendo o foco na experiência do usuário. 