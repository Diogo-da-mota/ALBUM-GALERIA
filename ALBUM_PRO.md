# Documentação Técnica - Album Pro

## 1. Introdução

Este sistema é voltado para fotógrafos que desejam oferecer álbuns personalizados aos seus clientes. Ele foi desenvolvido em **React** com **Supabase** como backend, incluindo autenticação, banco de dados e armazenamento de arquivos.

---

## 2. Arquitetura do Sistema

### 🖼️ Frontend (React + Vite)
- SPA com rotas como `/`, `/admin`, `/painel`, `/tamanho`
- Usa `localStorage` para armazenar dados de sessão
- Estilização com TailwindCSS e CSS Modules
- Componentes principais: `Gallery`, `AdminDashboard`, `PhotographerDashboard`, `Login`

### 🛠️ Backend (Supabase)
- Autenticação via `supabase.auth`
- Banco de dados PostgreSQL com tabelas customizadas
- Row Level Security (RLS) ativado
- Trigger para sincronizar `auth.users` com `public.users`

---

## 3. Autenticação e Acesso

### 🔐 Login
- Rota raiz (`/`) exibe o formulário de login
- Autenticação com email e senha via `signInWithPassword`
- Após login:
  - Admins são redirecionados para `/admin`
  - Fotógrafos para `/painel`
- Sessão e role são salvas em `localStorage`

### 👤 Tabela `users`
- Campos: `id`, `email`, `role`, `created_at`
- Papel (`role`): `admin` ou `user`
- Criada via trigger `handle_new_user` no `auth.users`

---

## 4. Banco de Dados (Supabase)

### 📊 Tabelas
| Tabela              | Descrição                                           |
|---------------------|-----------------------------------------------------|
| `albums`            | Lista de álbuns com preços e reajustes              |
| `pedidos`           | Pedidos feitos pelos clientes                       |
| `order_summaries`   | Resumos com imagens e detalhes                      |
| `imagens`           | Imagens de álbuns e estojos                         |
| `users`             | Perfil de usuários com role                         |

### 🔐 RLS (Row Level Security)
- Ativado nas tabelas
- Política: `(user_id = auth.uid() OR is_admin(auth.uid()))`
- Permissões:
  - Usuários só acessam seus próprios dados
  - Admin acessa tudo

---

## 5. Regras de Negócio e Cálculos

### 🎯 Preço de Álbuns
- Cada álbum tem um `valor_base` e `reajuste_base (%)`
- Cada tamanho tem uma `proporção`
- Preço final:
```ts
preco_final = valor_base × proporção × (1 + reajuste_base / 100)
```

### 📝 Regras
- Tamanhos `10x15` e `15x10` usam diretamente o `valor_base`, sem reajuste
- Todos os outros tamanhos aplicam reajuste à proporção

---

## 6. Rotas

### `/`
- Página de login para fotógrafos e admin

### `/admin`
- Acesso exclusivo para `role = admin`
- Seções:
  - Painel de Reajuste de Preços
  - Upload de imagens para álbuns e estojos
  - Navbar: Dashboard / Reajustes / Álbuns / Estojos

### `/painel`
- Painel dos fotógrafos (`role = user`)
- Exibe pedidos, imagens e configurações pessoais (em desenvolvimento)

### `/tamanho`
- Página onde o cliente escolhe o tamanho e o preço é recalculado
- Usa `localStorage.selectedAlbum` para o cálculo dinâmico

---

## 7. Estrutura de Componentes

### 📦 Componentes Globais
- `Login.tsx`: autenticação
- `ProtectedRoute.tsx`: proteção de rota por role
- `Navbar.tsx`: navegação dinâmica baseada em sessão

### 📁 Páginas
- `Gallery.tsx`: galeria principal
- `AdminDashboard.tsx`: gestão admin
- `PhotographerDashboard.tsx`: painel do fotógrafo
- `Size.tsx`: seleção de tamanho e preço

---

## 8. Supabase Policies SQL (exemplo)

```sql
create policy "Allow admin or owner"
on public.albums
for all
using (
  user_id = auth.uid() OR
  (select role from users where id = auth.uid()) = 'admin'
)
with check (
  user_id = auth.uid()
);
```

---

## 9. Melhorias Futuras (Roadmap)

- [ ] Upload direto de pedidos pelo cliente
- [ ] Painel detalhado para fotógrafos (com resumo e imagens)
- [ ] Estatísticas no painel admin
- [ ] Suporte a múltiplos idiomas

---

## 10. Comandos Úteis

### Desenvolvimento
```bash
npm run dev     # Inicia servidor de desenvolvimento
npm run build   # Gera build de produção
npm run preview # Visualiza build local
```

### Variáveis de Ambiente
```env
VITE_SUPABASE_URL=sua_url
VITE_SUPABASE_ANON_KEY=sua_chave
```

---

*Última atualização: [DATA_ATUAL]* 