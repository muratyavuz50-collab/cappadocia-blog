import test from "node:test";
import assert from "node:assert/strict";
const { default: handler } = await import("../api/worker.mjs");

function invoke(url, method = "GET") {
  const response = { headers: {}, statusCode: 200, body: null };
  const req = { url, method, headers: { host: "cappadociablog.test" } };
  const res = {
    set statusCode(value) { response.statusCode = value; },
    setHeader(name, value) { response.headers[name.toLowerCase()] = value; },
    end(body) { response.body = body; },
  };
  return handler(req, res).then(() => response);
}

test("Vercel rewrite restores the admin path and keeps access protected", async () => {
  const response = await invoke("/api/worker?__path=%2Fadmin%2F");
  assert.equal(response.statusCode, 302);
  assert.match(response.headers.location, /signin-with-chatgpt/);
});

test("legacy sign-in URL forwards to the Google auth flow", async () => {
  const response = await invoke("/api/worker?__path=%2Fsignin-with-chatgpt&return_to=%2Fadmin%2F");
  assert.equal(response.statusCode, 303);
  assert.match(response.headers.location, /auth\/google\/start/);
  assert.match(response.headers.location, /return_to=%2Fadmin%2F/);
});

test("Google login fails closed until OAuth credentials are configured", async () => {
  const response = await invoke("/api/worker?__path=%2Fauth%2Fgoogle%2Fstart");
  assert.equal(response.statusCode, 503);
  assert.match(String(response.body), /henüz yapılandırılmadı/);
});

test("admin API rejects requests without a verified Google session", async () => {
  const response = await invoke("/api/worker?__path=%2Fapi%2Fadmin%2Farticles");
  assert.equal(response.statusCode, 401);
  assert.match(String(response.body), /Giriş yapmanız gerekiyor/);
});
