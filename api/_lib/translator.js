const MAX_ENTRIES = 250;
const MAX_TOTAL_CHARS = 60000;
const GEMINI_TIMEOUT_MS = 25000;

export const DEFAULT_GEMINI_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.5-flash-lite',
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
];

export const PROTECTED_TERMS = [
  'Raihan Azka Hidayat',
  'Telkom University',
  'Web-Skill Network',
  'Tailwind CSS',
  'Spider-Verse',
  'Mecca Swim',
  'JavaScript',
  'TypeScript',
  'Spider-Man',
  'Bootstrap',
  'PostgreSQL',
  'Instagram',
  'LinkedIn',
  'Supabase',
  'Next.js',
  'Laravel',
  'Blender',
  'GitHub',
  'Vercel',
  'Unity',
  'React',
  'MySQL',
  'HTML',
  'RAZH',
  'CSS',
  'PHP',
  'C#',
];

function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function protectTerms(text) {
  const input = String(text ?? '');
  if (!input) return { masked: '', tokens: [] };

  const tokens = [];
  let masked = input;
  const sorted = [...PROTECTED_TERMS].sort((a, b) => b.length - a.length);

  for (const term of sorted) {
    const pattern =
      term === 'C#'
        ? /(^|[^\w])(C#)(?=[^\w]|$)/g
        : new RegExp(`\\b(${escapeRegExp(term)})\\b`, 'g');

    masked = masked.replace(pattern, (...args) => {
      const idx = tokens.length;
      const placeholder = `ZXTERM${idx}XZ`;
      if (term === 'C#') {
        const prefix = args[1] || '';
        tokens.push(args[2]);
        return `${prefix}${placeholder}`;
      }
      tokens.push(args[1]);
      return placeholder;
    });
  }

  return { masked, tokens };
}

export function restoreTerms(text, tokens = []) {
  let output = String(text ?? '');
  for (let i = 0; i < tokens.length; i++) {
    const tokenRe = new RegExp(`ZXTERM\\s*${i}\\s*XZ`, 'gi');
    output = output.replace(tokenRe, () => tokens[i]);
  }
  return output;
}

function validateEntriesPayload(entries) {
  if (!entries || typeof entries !== 'object' || Array.isArray(entries)) {
    throw new Error('Entries payload must be a plain object.');
  }

  const normalized = {};
  let count = 0;
  let totalChars = 0;

  for (const [key, value] of Object.entries(entries)) {
    if (!key || typeof key !== 'string') continue;
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    const text = String(value ?? '');
    count += 1;
    if (count > MAX_ENTRIES) {
      throw new Error(`Too many translation keys (max ${MAX_ENTRIES}).`);
    }
    totalChars += text.length;
    if (totalChars > MAX_TOTAL_CHARS) {
      throw new Error(`Translation payload exceeds ${MAX_TOTAL_CHARS} characters.`);
    }
    normalized[key] = text;
  }

  return normalized;
}

function parseGeminiJsonPayload(rawText) {
  let cleaned = String(rawText || '').trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }
  const parsed = JSON.parse(cleaned);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Gemini returned invalid JSON structure.');
  }
  return parsed;
}

async function translateChunkWithGeminiModel({
  chunkObj,
  sourceName,
  targetName,
  apiKey,
  model,
}) {
  const prompt = [
    `You are a professional bilingual software portfolio translator (${sourceName} -> ${targetName}).`,
    `Return ONLY a valid JSON object with the exact same keys as the input JSON.`,
    `Rules:`,
    `1. Translate each value naturally, concisely, and professionally in ${targetName}.`,
    `2. Keep brand names, personal names, organization names, and programming/tech terms unchanged (${PROTECTED_TERMS.slice(0, 14).join(', ')}, etc.).`,
    `3. Preserve newline characters (\\n) and intentional casing style (e.g. short uppercase headings if appropriate).`,
    `4. Never omit any key.`,
    `Input JSON:`,
    JSON.stringify(chunkObj),
  ].join('\n');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        model
      )}:generateContent`,
      {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.json().catch(() => null);
      const errDetail = errBody?.error?.message || `HTTP ${response.status}`;
      throw new Error(`${model}: ${errDetail}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error(`${model}: empty translation output`);
    }

    const parsed = parseGeminiJsonPayload(rawText);
    const out = {};
    for (const k of Object.keys(chunkObj)) {
      out[k] =
        typeof parsed[k] === 'string' && parsed[k].trim() ? parsed[k] : chunkObj[k];
    }
    return out;
  } finally {
    clearTimeout(timer);
  }
}

async function translateWithGemini({
  keys,
  values,
  sourceLocale,
  targetLocale,
  apiKey,
  preferredModel = '',
}) {
  const sourceName = sourceLocale === 'id' ? 'Indonesian' : 'English';
  const targetName = targetLocale === 'id' ? 'Indonesian' : 'English';

  const candidates = [];
  for (const candidate of [preferredModel, ...DEFAULT_GEMINI_MODELS]) {
    const clean = String(candidate || '').trim();
    if (clean && !candidates.includes(clean)) {
      candidates.push(clean);
    }
  }

  const CHUNK_SIZE = 55;
  const errors = [];

  for (const model of candidates) {
    try {
      const out = {};
      for (let i = 0; i < keys.length; i += CHUNK_SIZE) {
        const chunkObj = {};
        for (let j = i; j < Math.min(i + CHUNK_SIZE, keys.length); j++) {
          chunkObj[keys[j]] = values[j];
        }
        const chunkOut = await translateChunkWithGeminiModel({
          chunkObj,
          sourceName,
          targetName,
          apiKey,
          model,
        });
        Object.assign(out, chunkOut);
      }
      return { translations: out, model };
    } catch (err) {
      errors.push(err?.message || `${model}: failed`);
    }
  }

  throw new Error(errors[0] || 'All Gemini models failed.');
}

async function fetchGoogleGtxSingle(text, sourceLocale, targetLocale) {
  const params = new URLSearchParams({
    client: 'gtx',
    sl: sourceLocale,
    tl: targetLocale,
    dt: 't',
    q: text,
  });

  const response = await fetch(
    `https://translate.googleapis.com/translate_a/single?${params.toString()}`,
    {
      method: 'GET',
      headers: { Accept: 'application/json' },
    }
  );

  if (!response.ok) {
    throw new Error(`Free translator HTTP ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data) || !Array.isArray(data[0])) {
    throw new Error('Unexpected translator response format.');
  }

  return data[0].map((seg) => (Array.isArray(seg) ? seg[0] || '' : '')).join('');
}

async function translateBatchGtx(batchItems, sourceLocale, targetLocale) {
  if (batchItems.length === 0) return {};
  if (batchItems.length === 1) {
    const item = batchItems[0];
    const { masked, tokens } = protectTerms(item.text);
    const translated = await fetchGoogleGtxSingle(masked, sourceLocale, targetLocale);
    return { [item.key]: restoreTerms(translated, tokens).trim() || item.text };
  }

  const protectedList = batchItems.map((item) => ({
    ...item,
    ...protectTerms(item.text),
  }));

  const sep = (idx) => `[[[ZXSEG${idx}ZX]]]`;
  const joined = protectedList
    .map((item, idx) => (idx === 0 ? item.masked : `${sep(idx)}\n${item.masked}`))
    .join('\n');

  const translatedJoined = await fetchGoogleGtxSingle(
    joined,
    sourceLocale,
    targetLocale
  );

  const pieces = [];
  let cursor = translatedJoined;
  let splitValid = true;

  for (let idx = 1; idx < protectedList.length; idx++) {
    const markerRe = new RegExp(`\\[\\[\\[\\s*ZXSEG\\s*${idx}\\s*ZX\\s*\\]\\]\\]`, 'i');
    const match = markerRe.exec(cursor);
    if (!match) {
      splitValid = false;
      break;
    }
    pieces.push(cursor.slice(0, match.index).trim());
    cursor = cursor.slice(match.index + match[0].length);
  }
  pieces.push(cursor.trim());

  if (splitValid && pieces.length === protectedList.length) {
    const result = {};
    for (let i = 0; i < protectedList.length; i++) {
      const restored = restoreTerms(pieces[i], protectedList[i].tokens).trim();
      result[protectedList[i].key] = restored || protectedList[i].text;
    }
    return result;
  }

  // Individual fallback if a batch separator was mangled
  const result = {};
  for (const item of protectedList) {
    const single = await fetchGoogleGtxSingle(
      item.masked,
      sourceLocale,
      targetLocale
    );
    const restored = restoreTerms(single, item.tokens).trim();
    result[item.key] = restored || item.text;
  }
  return result;
}

async function translateWithGoogleGtx({ keys, values, sourceLocale, targetLocale }) {
  const out = {};
  const batches = [];
  let currentBatch = [];
  let currentLen = 0;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const text = values[i];
    if (!text.trim()) {
      out[key] = text;
      continue;
    }

    if (
      currentBatch.length >= 12 ||
      (currentBatch.length > 0 && currentLen + text.length > 1350)
    ) {
      batches.push(currentBatch);
      currentBatch = [];
      currentLen = 0;
    }

    currentBatch.push({ key, text });
    currentLen += text.length + 20;
  }

  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  for (const batch of batches) {
    const translatedBatch = await translateBatchGtx(batch, sourceLocale, targetLocale);
    Object.assign(out, translatedBatch);
  }

  return out;
}

export async function translateEntriesMap({
  entries,
  sourceLocale = 'en',
  targetLocale = 'id',
  geminiApiKey = '',
  geminiModel = '',
}) {
  if (sourceLocale !== 'en' && sourceLocale !== 'id') {
    throw new Error('Invalid sourceLocale.');
  }
  if (targetLocale !== 'en' && targetLocale !== 'id') {
    throw new Error('Invalid targetLocale.');
  }

  const normalized = validateEntriesPayload(entries);
  const keys = Object.keys(normalized);
  const values = keys.map((k) => normalized[k]);

  if (keys.length === 0 || sourceLocale === targetLocale) {
    return { translations: normalized, provider: 'identity', model: null };
  }

  const cleanGeminiKey = String(geminiApiKey || '').trim();
  let fallbackReason = null;

  if (cleanGeminiKey) {
    try {
      const geminiResult = await translateWithGemini({
        keys,
        values,
        sourceLocale,
        targetLocale,
        apiKey: cleanGeminiKey,
        preferredModel: geminiModel,
      });
      return {
        translations: geminiResult.translations,
        provider: 'gemini',
        model: geminiResult.model,
        fallbackReason: null,
      };
    } catch (err) {
      fallbackReason = err?.message || 'Gemini unavailable';
    }
  }

  const gtxResult = await translateWithGoogleGtx({
    keys,
    values,
    sourceLocale,
    targetLocale,
  });
  return {
    translations: gtxResult,
    provider: 'google-gtx',
    model: null,
    fallbackReason,
  };
}
