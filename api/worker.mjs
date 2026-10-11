import { Readable } from "node:stream";
import worker from "../dist/server/index.js";
import { createVercelDatabase } from "../vercel-db.mjs";

const encoder = new TextEncoder();
const oauthCookie = "cappadocia_oauth";
const sessionCookie = "__Host-cappadocia_session";
const sessionTtl = 7 * 24 * 60 * 60;

function base64url(bytes) {
  return Buffer.from(bytes).toString("base64url");
}
function decodeJson(value) {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
}
function cookieValue(header, name) {
  for (const part of (header || "").split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return "";
}
async function hmac(secret, value) {
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET must contain at least 32 characters.");
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return base64url(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}
function equal(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}
async function signedCookie(secret, payload) {
  const value = base64url(encoder.encode(JSON.stringify(payload)));
  return `${value}.${await hmac(secret, value)}`;
}
async function readSignedCookie(secret, value) {
  if (!secret || !value) return null;
  const [payload, signature] = (value || "").split(".");
  if (!payload || !equal(signature, await hmac(secret, payload))) return null;
  try { return decodeJson(payload); } catch { return null; }
}
function secureCookie(name, value, maxAge, path = "/") {
  return `${name}=${value}; Path=${path}; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}
function redirect(location, headers = {}) {
  const responseHeaders = new Headers({ location, "cache-control": "no-store" });
  for (const [name, value] of Object.entries(headers)) {
    if (name.toLowerCase() === "set-cookie") {
      for (const cookie of Array.isArray(value) ? value : [value]) responseHeaders.append("set-cookie", cookie);
    } else {
      responseHeaders.set(name, value);
    }
  }
  return new Response(null, { status: 303, headers: responseHeaders });
}
function safeReturnTo(value) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") ? value : "/admin/";
}
function publicOrigin(env) {
  const value = env.PUBLIC_ORIGIN || (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : "");
  if (!value) throw new Error("PUBLIC_ORIGIN is not configured.");
  return new URL(value).origin;
}
function missingAuthResponse() {
  return new Response("Yönetici girişi henüz yapılandırılmadı. Vercel ortam değişkenlerinde Google OAuth ayarlarını tamamlayın.", {
    status: 503, headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" },
  });
}
function randomToken(size = 32) {
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  return base64url(bytes);
}
async function startGoogle(request, env) {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.ADMIN_OWNER_EMAIL || !env.AUTH_SECRET) return missingAuthResponse();
  const url = new URL(request.url);
  const origin = publicOrigin(env);
  const state = randomToken(24), nonce = randomToken(24), verifier = randomToken(48);
  const data = await signedCookie(env.AUTH_SECRET, { state, nonce, verifier, returnTo: safeReturnTo(url.searchParams.get("return_to")), exp: Date.now() + 600_000 });
  const callback = `${origin}/auth/google/callback`;
  const challenge = base64url(await crypto.subtle.digest("SHA-256", encoder.encode(verifier)));
  const authorization = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorization.search = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: callback,
    response_type: "code",
    scope: "openid email profile",
    state,
    nonce,
    code_challenge: challenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();
  return redirect(authorization.toString(), { "set-cookie": secureCookie(oauthCookie, data, 600, "/auth/google/callback") });
}
async function verifyIdToken(token, env, expectedNonce) {
  const [head, body, signature] = String(token || "").split(".");
  if (!head || !body || !signature) throw new Error("Google sign-in token is invalid.");
  const header = decodeJson(head), claims = decodeJson(body);
  if (header.alg !== "RS256" || !header.kid) throw new Error("Google sign-in algorithm is not allowed.");
  const response = await fetch("https://www.googleapis.com/oauth2/v3/certs", { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error("Could not verify Google signing key.");
  const keys = await response.json();
  const jwk = keys.keys?.find((key) => key.kid === header.kid && key.kty === "RSA");
  if (!jwk) throw new Error("Google signing key was not found.");
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, Buffer.from(signature, "base64url"), encoder.encode(`${head}.${body}`));
  const issuerOk = ["https://accounts.google.com", "accounts.google.com"].includes(claims.iss);
  if (!valid || !issuerOk || claims.aud !== env.GOOGLE_CLIENT_ID || claims.exp * 1000 <= Date.now() || claims.nonce !== expectedNonce || claims.email_verified !== true) {
    throw new Error("Google sign-in token could not be verified.");
  }
  if (String(claims.email || "").toLowerCase() !== String(env.ADMIN_OWNER_EMAIL || "").trim().toLowerCase()) {
    throw new Error("Bu Google hesabının yönetici erişimi yok.");
  }
  return { id: claims.sub, email: claims.email, name: claims.name || claims.email };
}
async function googleCallback(request, env) {
  const fail = (message) => new Response(message, { status: 403, headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow", "set-cookie": secureCookie(oauthCookie, "", 0, "/auth/google/callback") } });
  try {
    const url = new URL(request.url);
    const stateData = await readSignedCookie(env.AUTH_SECRET, cookieValue(request.headers.get("cookie"), oauthCookie));
    if (!stateData || stateData.exp <= Date.now() || stateData.state !== url.searchParams.get("state")) return fail("Oturum doğrulaması başarısız. Lütfen yeniden giriş yapın.");
    if (url.searchParams.has("error") || !url.searchParams.get("code")) return fail("Google ile giriş tamamlanamadı.");
    const callback = `${publicOrigin(env)}/auth/google/callback`;
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        code: url.searchParams.get("code"),
        code_verifier: stateData.verifier,
        grant_type: "authorization_code",
        redirect_uri: callback,
      }),
    });
    if (!tokenResponse.ok) return fail("Google ile giriş doğrulanamadı. Yeniden deneyin.");
    const tokenData = await tokenResponse.json();
    const user = await verifyIdToken(tokenData.id_token, env, stateData.nonce);
    const session = await signedCookie(env.AUTH_SECRET, { ...user, exp: Math.floor(Date.now() / 1000) + sessionTtl });
    return redirect(stateData.returnTo, {
      "set-cookie": [secureCookie(oauthCookie, "", 0, "/auth/google/callback"), secureCookie(sessionCookie, session, sessionTtl)],
    });
  } catch {
    return fail("Google ile giriş sırasında bir hata oluştu. Lütfen yeniden deneyin.");
  }
}
async function readSession(request, env) {
  const value = cookieValue(request.headers.get("cookie"), sessionCookie);
  const session = await readSignedCookie(env.AUTH_SECRET, value);
  if (!session || session.exp <= Math.floor(Date.now() / 1000)) return null;
  if (String(session.email || "").toLowerCase() !== String(env.ADMIN_OWNER_EMAIL || "").trim().toLowerCase()) return null;
  return session;
}
function withAdminIdentity(request, session) {
  const headers = new Headers(request.headers);
  headers.set("oai-authenticated-user-id", session.id);
  headers.set("oai-authenticated-user-email", session.email);
  headers.set("oai-authenticated-user-full-name-encoding", "percent-encoded-utf-8");
  headers.set("oai-authenticated-user-full-name", encodeURIComponent(session.name || session.email));
  return new Request(request, { headers });
}
async function toFetchRequest(req, url) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers || {})) {
    if (Array.isArray(value)) headers.set(key, value.join(", "));
    else if (value !== undefined) headers.set(key, String(value));
  }
  const method = String(req.method || "GET").toUpperCase();
  const body = method === "GET" || method === "HEAD" ? undefined : Readable.toWeb(req);
  return new Request(url, { method, headers, body, ...(body ? { duplex: "half" } : {}) });
}
async function sendResponse(res, response) {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    if (key !== "set-cookie") res.setHeader(key, value);
  });
  const cookies = response.headers.getSetCookie?.();
  const combinedCookie = response.headers.get("set-cookie");
  if (cookies?.length) res.setHeader("set-cookie", cookies);
  else if (combinedCookie) res.setHeader("set-cookie", combinedCookie);
  if (!response.body) { res.end(); return; }
  res.end(Buffer.from(await response.arrayBuffer()));
}

export default async function handler(req, res) {
  try {
    const host = req.headers?.host || "localhost";
    const original = new URL(req.url || "/", `https://${host}`);
    const routedPath = original.searchParams.get("__path");
    if (routedPath) {
      original.pathname = routedPath.startsWith("/") ? routedPath : `/${routedPath}`;
      original.searchParams.delete("__path");
    }
    const path = original.pathname;
    const env = { ...process.env, DB: createVercelDatabase(process.env) };

    if (path === "/auth/google/start") return await sendResponse(res, await startGoogle(new Request(original), env));
    if (path === "/auth/google/callback") return await sendResponse(res, await googleCallback(new Request(original, { headers: { cookie: req.headers?.cookie || "" } }), env));
    if (path === "/auth/logout" || path === "/signout-with-chatgpt") {
      return await sendResponse(res, redirect("/", { "set-cookie": secureCookie(sessionCookie, "", 0) }));
    }
    if (path === "/signin-with-chatgpt") {
      const target = new URL("/auth/google/start", original);
      target.searchParams.set("return_to", safeReturnTo(original.searchParams.get("return_to")));
      return await sendResponse(res, redirect(target.toString()));
    }

    let request = await toFetchRequest(req, original);
    const session = await readSession(request, env);
    if (session) request = withAdminIdentity(request, session);
    const response = await worker.fetch(request, env, {});
    return await sendResponse(res, response);
  } catch (error) {
    console.error("Vercel request failed", error?.name || "Error");
    res.statusCode = 503;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.setHeader("cache-control", "no-store");
    res.end("Site şu anda kullanılamıyor. Sunucu yapılandırmasını kontrol edin.");
  }
}
