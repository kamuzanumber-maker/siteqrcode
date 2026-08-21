/**
 * ================================================================
 *  Cloudflare Pages Function — POST /api/verify
 * ================================================================
 *  Valida a senha no servidor. O link do Nextcloud nunca aparece
 *  no código-fonte da página antes da senha ser verificada.
 *
 *  ── CONFIGURAÇÃO (recomendada) ──────────────────────────────
 *  Cloudflare Dashboard → Pages → <projeto> →
 *    Settings → Environment variables → Production
 *
 *      PAGE_PASSWORD = 6969
 *      REDIRECT_URL  = https://nextcloud.cloud-qr.com.br/index.php/s/WtYAnCgN9G7Pesr
 *
 *  ── Fallback (se as env vars não estiverem definidas) ────────
 *  Os valores abaixo são usados automaticamente.
 * ================================================================
 */

const DEFAULT_PASSWORD     = "6969";
const DEFAULT_REDIRECT_URL = "https://nextcloud.cloud-qr.com.br/index.php/s/WtYAnCgN9G7Pesr";

const JSON_HEADERS = {
  "Content-Type":           "application/json",
  "X-Content-Type-Options": "nosniff",
  "Cache-Control":          "no-store",
  "Referrer-Policy":        "no-referrer",
};

export async function onRequestPost(context) {
  return handleVerify(context.request, context.env);
}

export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, message: "Método não permitido." }), {
      status: 405,
      headers: { ...JSON_HEADERS, Allow: "POST" },
    });
  }
  return handleVerify(context.request, context.env);
}

async function handleVerify(request, env) {
  const contentLength = parseInt(request.headers.get("Content-Length") || "0");
  if (contentLength > 512) {
    return jsonResponse({ ok: false, message: "Requisição inválida." }, 400);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, message: "JSON inválido." }, 400);
  }

  const submitted = String(body?.password ?? "").trim();
  if (!submitted) {
    return jsonResponse({ ok: false, message: "Senha não informada." }, 400);
  }

  const correctPassword = env?.PAGE_PASSWORD  ?? DEFAULT_PASSWORD;
  const redirectUrl     = env?.REDIRECT_URL   ?? DEFAULT_REDIRECT_URL;

  /* Comparação em tempo constante */
  const encoder = new TextEncoder();
  const pad     = (s) => s.padEnd(256, "\0").slice(0, 256);
  const aBytes  = encoder.encode(pad(submitted));
  const bBytes  = encoder.encode(pad(correctPassword));

  let diff = 0;
  for (let i = 0; i < aBytes.length; i++) diff |= aBytes[i] ^ bBytes[i];

  const isCorrect = diff === 0 && submitted.length === correctPassword.length;

  if (isCorrect) {
    return jsonResponse({ ok: true, redirectUrl }, 200);
  }

  await new Promise(r => setTimeout(r, 300 + Math.random() * 200));
  return jsonResponse({ ok: false, message: "Senha incorreta." }, 401);
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}
