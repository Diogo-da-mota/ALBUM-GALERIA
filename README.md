# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/8cbbbc6b-f515-4ccd-9a21-a216b686e4ed

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/8cbbbc6b-f515-4ccd-9a21-a216b686e4ed) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/8cbbbc6b-f515-4ccd-9a21-a216b686e4ed) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

# Sistema de Álbum/Galeria

## Funcionalidades

### Sistema de Avatar/Logo
- Upload e gerenciamento de avatar/logo da empresa/usuário.
- Recorte interativo de imagem (proporção 1:1) via `ImageCropper`.
- Atualização da URL base no banco de dados e `localStorage`.
- **Exibição centralizada e consistente:** O avatar/logo é exibido de forma padronizada em toda a aplicação (Sidebar, Formulários de Configuração, telas de Login, Identificação do Cliente) graças ao uso combinado do `AvatarContext` e `UserAvatar`.
- **Cache-busting automático centralizado:** O `AvatarContext` adiciona automaticamente um parâmetro de versão (`?v=timestamp`) à URL do avatar, garantindo que a imagem mais recente seja exibida após qualquer atualização, sem que os componentes individuais precisem se preocupar com isso.
- Suporte aos formatos de imagem mais comuns (JPG, PNG, GIF), com conversão para PNG no upload (lógica atual no `PerfilTab`).
- Validação de tamanho e tipo de arquivo no cliente via `useImageUpload`.
- Preview da imagem selecionada e/ou recortada antes de salvar.
- Fallback para um ícone padrão (`User`) caso o usuário não possua avatar, gerenciado pelo `UserAvatar`.

### Componentes Principais

#### AvatarContext (`src/contexts/AvatarContext.tsx`)
**Ponto central para o estado do avatar.** Ele:
- Armazena a URL *base* do avatar (lida inicialmente do `localStorage`).
- **Gera e fornece a `avatarUrl` final:** Esta URL, consumida pelos componentes, **já inclui o parâmetro de versão para cache-busting**. Os componentes **não devem** adicionar cache-busting manualmente.
- Disponibiliza a função `updateAvatar` que atualiza a URL base e dispara uma nova versão (novo timestamp), forçando a atualização visual em todos os `UserAvatar` que consomem o contexto.

#### UserAvatar (`src/components/ui/UserAvatar.tsx`)
**Componente padrão e recomendado para exibir avatares/logos.**
- **Consome diretamente `avatarUrl` do `AvatarContext` por padrão**, simplificando o uso e evitando prop drilling.
- Permite opcionalmente receber uma `avatarUrl` via prop, útil para exibir previews locais temporários (como em `PerfilTab` e `ImagemTab` antes do salvamento).
- Suporta diferentes tamanhos (`sm`, `md`, `lg`) via prop `size`.
- Renderiza automaticamente um ícone de usuário (`User`) como fallback se nenhuma URL válida for fornecida (seja do contexto ou prop).
- Inclui tratamento básico de erro (`onError`) para ocultar a imagem quebrada e mostrar o fallback caso ocorra falha no carregamento.

#### ImagemTab (`src/components/admin/configuracoes/ImagemTab.tsx`)
Componente na área de configurações para upload e recorte da logo principal.
- **Exibição:** Utiliza `UserAvatar`, que mostra a logo atual vinda do `AvatarContext`, a menos que uma imagem tenha sido recortada localmente (nesse caso, a prop `avatarUrl` com o preview local é passada ao `UserAvatar`).
- **Ações:** Permite selecionar nova imagem, recortar via `ImageCropper`, e salvar. Ao salvar, usa `useImageUpload` e chama `updateAvatar` do contexto para atualizar a imagem globalmente.

#### PerfilTab (`src/components/admin/configuracoes/PerfilTab.tsx`)
Componente na área de configurações para gerenciar dados do perfil e avatar do usuário.
- **Exibição:** Utiliza `UserAvatar`, que mostra o avatar atual vindo do `AvatarContext`, a menos que um novo arquivo tenha sido selecionado (nesse caso, a prop `avatarUrl` com o preview local é passada ao `UserAvatar`).
- **Ações:** Permite selecionar novo avatar (sem recorte obrigatório), salvar imagem (com lógica de conversão para PNG e remoção de arquivos antigos) e atualizar `AvatarContext` via `updateAvatar`. Salva também outros dados do perfil.

#### ImageCropper (`src/components/ui/ImageCropper.tsx`)
Componente modal para recorte de imagem (usa `react-image-crop`).
- Interface para recortar com proporção fixa 1:1. Retorna um `Blob`.

#### Login (`src/pages/Login.tsx`)
Página de login principal.
- **Exibição:** Utiliza `UserAvatar` para exibir o avatar/logo. Como não passa a prop `avatarUrl`, o `UserAvatar` consome diretamente a URL do `AvatarContext` (mostrando o avatar do último usuário logado ou o fallback).

#### AdminLoginModal (`src/components/ui/AdminLoginModal.tsx`)
Modal de login para acesso rápido à área administrativa (disponível em outras telas).
- **Exibição:** Similar à página de Login, usa `UserAvatar` consumindo a URL do `AvatarContext`.

#### IdentificacaoCliente (`src/components/identificacao/IdentificacaoCliente.tsx`)
Formulário para clientes não identificados.
- **Exibição:** Exibe o avatar/logo no cabeçalho utilizando `UserAvatar`, que consome a URL do `AvatarContext`.

### Hooks Customizados

#### useImageUpload (`