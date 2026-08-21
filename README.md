# 🔒 Site Protegido por Senha — QR Code

Página de acesso protegida por senha, com design glassmorphism fofo e moderno.
Criada para ser o destino fixo de um QR Code: o QR Code nunca muda, só o destino.

---

## Estrutura de arquivos

```
siteqrcode/
├── index.html      ← página principal (design + lógica frontend)
├── _worker.js      ← Cloudflare Worker (validação segura no servidor)
├── _headers        ← cabeçalhos de segurança HTTP
├── _redirects      ← fallback SPA para Cloudflare Pages
├── wrangler.toml   ← config opcional para deploy via CLI
└── README.md       ← este arquivo
```

---

## Modos de uso

Existem **duas formas** de configurar o projeto. Escolha a que melhor se encaixa na sua necessidade.

### Modo 1 — Frontend puro (mais simples)

A senha e o link ficam no `index.html`. Funciona em qualquer hospedagem estática (GitHub Pages, Netlify, Cloudflare Pages sem Worker).

> ⚠️ **Limitação:** alguém com conhecimento técnico pode encontrar a senha e o link inspecionando o código-fonte da página.
> Use este modo apenas se o conteúdo não for altamente sensível.

**Como configurar:**

Abra `index.html` e edite as duas linhas no topo do `<script>`:

```js
const PASSWORD     = "MINHA_SENHA";
const REDIRECT_URL = "https://MEU-LINK-DO-NEXTCLOUD";
```

---

### Modo 2 — Cloudflare Worker (recomendado)

A validação da senha ocorre **no servidor**. O link do Nextcloud **nunca aparece no código-fonte** enviado ao navegador antes da senha ser verificada.

**Como configurar:**

1. Defina as variáveis de ambiente no Cloudflare Dashboard:
   - `PAGE_PASSWORD`  → sua senha
   - `REDIRECT_URL`   → seu link do Nextcloud

   > Dashboard → Pages → `<seu projeto>` → Settings → Environment variables

2. Ative a integração do Worker no `index.html`:
   Substitua o bloco de verificação local pelo comentário já presente no código:

   ```js
   // Troque o bloco de verificação local por:
   const res  = await fetch('/api/verify', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ password: value })
   });
   const data = await res.json();
   if (data.ok) {
     window.location.href = data.redirectUrl;
   } else {
     // mostrar erro
   }
   ```

   E remova (ou deixe em branco) `PASSWORD` e `REDIRECT_URL` do `index.html`.

---

## Deploy no Cloudflare Pages (recomendado)

### Via GitHub (mais fácil)

1. Crie um repositório no GitHub e envie os arquivos:
   ```bash
   git init
   git add .
   git commit -m "first commit"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
   git push -u origin main
   ```

2. Acesse [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.

3. Selecione o repositório, deixe as configurações de build em branco (projeto estático) e clique em **Save and Deploy**.

4. Copie a URL gerada (ex: `https://siteqrcode.pages.dev`) e aponte o QR Code para ela.

5. A cada `git push`, o Cloudflare re-faz o deploy automaticamente.

### Via CLI (alternativa)

```bash
npm install -g wrangler
wrangler login
wrangler pages deploy . --project-name=siteqrcode
```

---

## Deploy no GitHub Pages (Modo 1 apenas)

> O GitHub Pages não suporta Workers. Use-o apenas com o Modo 1 (frontend puro).

1. Vá em **Settings** → **Pages** → Source: `main` / `/ (root)`.
2. Aguarde o deploy e use a URL gerada no QR Code.

---

## Como alterar a senha ou o link no futuro

| Modo | O que fazer |
|------|-------------|
| Frontend puro | Edite `PASSWORD` e/ou `REDIRECT_URL` em `index.html` e faça push |
| Cloudflare Worker | Altere as env vars no Dashboard — sem precisar de push |

O QR Code **não precisa ser refeito** em nenhum dos casos, pois a URL do site não muda.

---

## Segurança — resumo rápido

| Proteção | Modo 1 | Modo 2 (Worker) |
|----------|--------|-----------------|
| Link oculto antes da senha | ❌ | ✅ |
| Senha não fica no HTML | ❌ | ✅ (via env var) |
| Proteção contra timing attacks | parcial | ✅ |
| Delay anti-brute-force | ✅ (frontend) | ✅ (servidor) |
| Cabeçalhos de segurança HTTP | ✅ | ✅ |

> Para dados muito sensíveis, considere usar a autenticação nativa do Nextcloud (link com token de expiração ou autenticação OAuth2).

---

## Personalização rápida

Todas as cores e estilos ficam nas variáveis CSS no topo do `<style>` em `index.html`:

```css
:root {
  --pink:  #f9a8c9;
  --lilac: #c9b8f5;
  --blue:  #a8d8f9;
  /* ... */
}
```

Título da aba e favicon: edite a tag `<title>` e o `<link rel="icon">` no `<head>`.
