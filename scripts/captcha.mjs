import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const secretFile = path.join(root, '.captcha-secret');

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const TTL_SEC = 600;

function secret() {
  const fromEnv = process.env.CAPTCHA_SECRET;
  if (fromEnv) return fromEnv;
  try {
    const existing = fs.readFileSync(secretFile, 'utf8').trim();
    if (existing) return existing;
  } catch {
    /* create below */
  }
  const created = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(secretFile, created, { mode: 0o600 });
  return created;
}

function b64url(value) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function b64urlDecode(value) {
  const pad = value.length % 4 === 0 ? '' : '='.repeat(4 - (value.length % 4));
  return Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64').toString('utf8');
}

export function normalizeAnswer(value) {
  return String(value || '')
    .replace(/\s+/g, '')
    .toUpperCase();
}

function sign(payload) {
  return crypto.createHmac('sha256', secret()).update(payload).digest('hex');
}

function safeEqual(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function createChallenge() {
  let code = '';
  for (let i = 0; i < 5; i += 1) {
    code += ALPHABET[crypto.randomInt(ALPHABET.length)];
  }
  const exp = Math.floor(Date.now() / 1000) + TTL_SEC;
  const hash = crypto.createHash('sha256').update(code).digest('hex');
  const payload = `${exp}:${hash}`;
  return { token: `${b64url(payload)}.${sign(payload)}`, svg: renderSvg(code) };
}

export function verifyChallenge(token, answer) {
  if (typeof token !== 'string' || !token.includes('.')) return false;
  const dot = token.lastIndexOf('.');
  let payload = '';
  try {
    payload = b64urlDecode(token.slice(0, dot));
  } catch {
    return false;
  }
  if (!safeEqual(sign(payload), token.slice(dot + 1))) return false;
  const sep = payload.indexOf(':');
  if (sep < 1) return false;
  const exp = Number(payload.slice(0, sep));
  const hash = payload.slice(sep + 1);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  const got = crypto.createHash('sha256').update(normalizeAnswer(answer)).digest('hex');
  return safeEqual(hash, got);
}

function renderSvg(code) {
  const w = 168;
  const h = 56;
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`,
    '<rect width="100%" height="100%" fill="#f3f6f8"/>',
  ];
  for (let i = 0; i < 6; i += 1) {
    const x1 = crypto.randomInt(0, w);
    const y1 = crypto.randomInt(0, h);
    const x2 = crypto.randomInt(0, w);
    const y2 = crypto.randomInt(0, h);
    parts.push(
      `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#9bb0c0" stroke-width="1"/>`,
    );
  }
  for (let i = 0; i < 16; i += 1) {
    const cx = crypto.randomInt(0, w);
    const cy = crypto.randomInt(0, h);
    parts.push(`<circle cx="${cx}" cy="${cy}" r="1" fill="#7f93a3"/>`);
  }
  for (let i = 0; i < code.length; i += 1) {
    const x = 14 + i * 30 + crypto.randomInt(-2, 3);
    const y = 38 + crypto.randomInt(-4, 5);
    const rot = crypto.randomInt(-22, 23);
    parts.push(
      `<text x="${x}" y="${y}" transform="rotate(${rot} ${x} ${y})" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" fill="#1d3b53">${code[i]}</text>`,
    );
  }
  parts.push('</svg>');
  return parts.join('');
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

export function attachCaptchaDevApi(server) {
  server.middlewares.use(async (req, res, next) => {
    const url = (req.url || '').split('?')[0];
    if (url !== '/api/captcha.php') {
      next();
      return;
    }
    try {
      if (req.method === 'GET') {
        const { token, svg } = createChallenge();
        sendJson(res, 200, { token, svg });
        return;
      }
      if (req.method === 'POST') {
        let data = {};
        try {
          data = JSON.parse((await readBody(req)) || '{}');
        } catch {
          sendJson(res, 400, { ok: false });
          return;
        }
        sendJson(res, 200, { ok: verifyChallenge(data.token, data.answer) });
        return;
      }
      res.statusCode = 405;
      res.end();
    } catch {
      sendJson(res, 500, { ok: false });
    }
  });
}
