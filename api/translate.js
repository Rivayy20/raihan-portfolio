import {
  DEFAULT_GEMINI_MODELS,
  translateEntriesMap,
} from './_lib/translator.js';

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  const body = JSON.stringify(payload);
  if (typeof res.send === 'function') {
    return res.send(body);
  }
  res.end(body);
  return undefined;
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string') {
    return JSON.parse(req.body);
  }

  const chunks = [];
  let totalBytes = 0;
  const MAX_BYTES = 256 * 1024;

  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buf.length;
    if (totalBytes > MAX_BYTES) {
      throw new Error('Request payload too large.');
    }
    chunks.push(buf);
  }

  const raw = Buffer.concat(chunks).toString('utf8').trim();
  return raw ? JSON.parse(raw) : {};
}

async function verifyCmsAdminToken(jwt) {
  const supabaseUrl = (
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    ''
  )
    .trim()
    .replace(/\/+$/, '');
  const publishableKey = (
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    ''
  ).trim();

  if (!supabaseUrl || !publishableKey) {
    return {
      ok: false,
      status: 500,
      error: 'Supabase configuration missing on server.',
    };
  }

  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    method: 'GET',
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${jwt}`,
      Accept: 'application/json',
    },
  });

  if (!userRes.ok) {
    return {
      ok: false,
      status: 401,
      error: 'Invalid or expired administrator session.',
    };
  }

  const userData = await userRes.json();
  if (!userData?.id) {
    return { ok: false, status: 401, error: 'Unable to verify user identity.' };
  }

  const adminRes = await fetch(
    `${supabaseUrl}/rest/v1/cms_admins?select=user_id&user_id=eq.${encodeURIComponent(
      userData.id
    )}&is_active=eq.true&limit=1`,
    {
      method: 'GET',
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${jwt}`,
        Accept: 'application/json',
      },
    }
  );

  if (!adminRes.ok) {
    return {
      ok: false,
      status: 403,
      error: 'Administrator verification failed.',
    };
  }

  const adminRows = await adminRes.json();
  if (!Array.isArray(adminRows) || adminRows.length === 0) {
    return {
      ok: false,
      status: 403,
      error: 'Forbidden: CMS administrator access required.',
    };
  }

  return { ok: true, userId: userData.id };
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed.' });
  }

  const authHeader = String(req.headers?.authorization || '');
  const match = /^Bearer\s+(.+)$/i.exec(authHeader);
  if (!match?.[1]) {
    return sendJson(res, 401, { error: 'Missing Authorization bearer token.' });
  }

  try {
    const authCheck = await verifyCmsAdminToken(match[1].trim());
    if (!authCheck.ok) {
      return sendJson(res, authCheck.status, { error: authCheck.error });
    }

    const geminiApiKey = (process.env.GEMINI_API_KEY || '').trim();
    const geminiModel = (process.env.GEMINI_MODEL || '').trim();

    if (req.method === 'GET') {
      return sendJson(res, 200, {
        geminiConfigured: Boolean(geminiApiKey),
        provider: geminiApiKey ? 'gemini' : 'google-gtx',
        preferredModel: geminiModel || DEFAULT_GEMINI_MODELS[0],
      });
    }

    const body = await readJsonBody(req);
    const {
      entries = {},
      sourceLocale = 'en',
      targetLocale = 'id',
    } = body || {};

    const result = await translateEntriesMap({
      entries,
      sourceLocale,
      targetLocale,
      geminiApiKey,
      geminiModel,
    });

    return sendJson(res, 200, {
      translations: result.translations,
      provider: result.provider,
      model: result.model || null,
      fallbackReason: result.fallbackReason || null,
      count: Object.keys(result.translations).length,
    });
  } catch (err) {
    return sendJson(res, 400, {
      error: err?.message || 'Failed to translate portfolio entries.',
    });
  }
}
