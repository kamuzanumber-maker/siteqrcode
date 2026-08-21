/* ================================================================
   CONFIG.JS — Configuração centralizada
   ================================================================
   Edite APENAS estas duas linhas para alterar a senha e o destino.
   Após editar, faça push para o GitHub e o Cloudflare re-deploya.
   O QR Code não precisa mudar.
   ================================================================

   ⚠️  AVISO DE SEGURANÇA:
   A senha aqui fica visível no código-fonte da página.
   Para proteção real, use Cloudflare Pages Functions:
   - Ative USE_WORKER = true
   - Configure PAGE_PASSWORD e REDIRECT_URL nas env vars do
     Cloudflare Dashboard → Pages → Settings → Environment variables
   ================================================================ */

const CONFIG = {
  PASSWORD:     "6969",
  REDIRECT_URL: "https://nextcloud.cloud-qr.com.br/index.php/s/WtYAnCgN9G7Pesr",
  USE_WORKER:   false,   // true = valida no servidor (Cloudflare Worker)
  JUMPS_NEEDED: 10,      // quantos pulos para vencer o jogo
};
