import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const RUN_LIVE_PROBE = process.argv.includes('--live');

function walkFiles(dirPath, extensions, out = []) {
  if (!fs.existsSync(dirPath)) return out;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, extensions, out);
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      out.push(full);
    }
  }
  return out;
}

function readRel(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

// ============================================================================
// SECTION 1: SQL RLS, Column-Level Grants, Storage & RPC Audit
// ============================================================================
function auditSqlSecurity() {
  const rlsSql = readRel('supabase/migrations/0002_grants_and_rls.sql');
  const storageSql = readRel('supabase/migrations/0003_storage_buckets_and_policies.sql');
  const rpcSql = readRel('supabase/migrations/0004_rpc_functions.sql');

  const expectedTables = [
    'cms_admins',
    'media_assets',
    'site_settings',
    'site_sections',
    'navigation_items',
    'profile',
    'about_content',
    'education',
    'experiences',
    'experience_details',
    'skill_categories',
    'skills',
    'projects',
    'project_media',
    'certifications',
    'contact_settings',
    'social_links',
    'footer_settings',
    'seo_settings',
    'content_revisions',
  ];

  for (const table of expectedTables) {
    const rlsRe = new RegExp(
      `ALTER\\s+TABLE\\s+public\\.${table}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY\\s*;`,
      'i'
    );
    assert.equal(rlsRe.test(rlsSql), true, `Missing ENABLE ROW LEVEL SECURITY on ${table}`);
  }

  assert.equal(
    /REVOKE\s+ALL\s+ON\s+ALL\s+TABLES\s+IN\s+SCHEMA\s+public\s+FROM\s+PUBLIC,\s*anon,\s*authenticated\s*;/i.test(
      rlsSql
    ),
    true,
    'Missing baseline REVOKE ALL ON ALL TABLES IN SCHEMA public'
  );

  assert.equal(
    /GRANT\s+[^\n;]*ON\s+public\.(cms_admins|content_revisions)\s+TO\s+anon/i.test(rlsSql),
    false,
    'anon must have ZERO grants on cms_admins or content_revisions'
  );

  const anonGrantRegex = /GRANT\s+SELECT\s*\(([\s\S]*?)\)\s*ON\s+public\.([a-z_]+)\s+TO\s+anon\s*;/gi;
  const grantedTables = [];
  for (const match of rlsSql.matchAll(anonGrantRegex)) {
    const colList = match[1];
    const tableName = match[2];
    grantedTables.push(tableName);
    assert.equal(/\bdraft_data\b/i.test(colList), false, `anon cannot read draft_data on ${tableName}`);
    assert.equal(
      /\bhas_unpublished_changes\b/i.test(colList),
      false,
      `anon cannot read has_unpublished_changes on ${tableName}`
    );
    assert.equal(/\buploaded_by\b/i.test(colList), false, `anon cannot read uploaded_by on ${tableName}`);
  }
  assert.ok(grantedTables.length >= 18, `Expected >= 18 column-scoped anon grants, found ${grantedTables.length}`);

  // Storage security checks
  const publicAssetsInsertMatch = storageSql.match(
    /'public-assets'\s*,\s*'public-assets'\s*,\s*true\s*,[\s\S]*?\)/i
  );
  assert.ok(publicAssetsInsertMatch, 'public-assets bucket definition missing');
  assert.equal(
    publicAssetsInsertMatch[0].toLowerCase().includes('image/svg+xml'),
    false,
    'SVG uploads must not be permitted in public-assets'
  );

  const privateDraftsInsertMatch = storageSql.match(
    /'private-drafts'\s*,\s*'private-drafts'\s*,\s*(false|true)/i
  );
  assert.ok(privateDraftsInsertMatch, 'private-drafts bucket definition missing');
  assert.equal(privateDraftsInsertMatch[1].toLowerCase(), 'false', 'private-drafts bucket MUST be non-public');

  const privatePolicyBlocks = storageSql.match(/CREATE POLICY\s+"private_drafts_[\s\S]*?;/gi) || [];
  assert.ok(privatePolicyBlocks.length >= 4, 'Expected private-drafts CRUD policies');
  for (const block of privatePolicyBlocks) {
    assert.equal(/\bTO\s+(public|anon)\b/i.test(block), false, 'private-drafts cannot grant access to public/anon');
    assert.equal(/public\.is_cms_admin\(\)/i.test(block), true, 'private-drafts policies must enforce is_cms_admin()');
  }
  assert.equal(storageSql.includes('%..%'), true, 'Storage policies must reject path traversal');

  // RPC admin guard checks
  const rpcNames = [
    'get_media_asset_usage',
    'get_cms_dashboard_stats',
    'set_project_primary_media',
    'record_content_revision',
  ];
  for (const fn of rpcNames) {
    const fnBodyRe = new RegExp(
      `CREATE\\s+OR\\s+REPLACE\\s+FUNCTION\\s+public\\.${fn}[\\s\\S]*?\\$\\$;`,
      'i'
    );
    const fnMatch = rpcSql.match(fnBodyRe);
    assert.ok(fnMatch, `RPC definition missing for ${fn}`);
    assert.equal(
      /IF\s+NOT\s+public\.is_cms_admin\(\)/i.test(fnMatch[0]),
      true,
      `RPC ${fn} missing is_cms_admin() authorization guard`
    );

    const revokeRe = new RegExp(
      `REVOKE\\s+ALL\\s+ON\\s+FUNCTION\\s+public\\.${fn}\\([^)]*\\)\\s+FROM\\s+PUBLIC,\\s*anon\\s*;`,
      'i'
    );
    assert.equal(revokeRe.test(rpcSql), true, `RPC ${fn} missing REVOKE FROM PUBLIC, anon`);
  }

  console.log('[PASS] Section 1: SQL RLS, Column Grants, Storage & RPC Audit');
}

// ============================================================================
// SECTION 2: Source Code, Security Headers & Static SEO Audit
// ============================================================================
function auditSourceAndHeaders() {
  const sourceFiles = [
    ...walkFiles(path.join(ROOT, 'src'), ['.js', '.jsx']),
    ...walkFiles(path.join(ROOT, 'api'), ['.js', '.mjs']),
  ];

  const forbiddenPatterns = [
    /dangerouslySetInnerHTML/,
    /\.innerHTML\b/,
    /\beval\s*\(/,
    /new\s+Function\b/,
    /SUPABASE_SERVICE_ROLE/,
    /VITE_SUPABASE_SECRET/,
  ];

  for (const filePath of sourceFiles) {
    const content = fs.readFileSync(filePath, 'utf8');
    for (const pattern of forbiddenPatterns) {
      assert.equal(
        pattern.test(content),
        false,
        `Forbidden pattern ${pattern} matched in ${path.relative(ROOT, filePath)}`
      );
    }
  }

  const publicSvc = readRel('src/services/publicPortfolioService.js');
  const publicClient = readRel('src/lib/supabasePublic.js');
  for (const [name, src] of [
    ['publicPortfolioService.js', publicSvc],
    ['supabasePublic.js', publicClient],
  ]) {
    assert.equal(src.includes('supabaseAdmin'), false, `${name} must not reference supabaseAdmin`);
    assert.equal(
      /from\s+['"]@supabase\/supabase-js['"]/.test(src),
      false,
      `${name} must not import @supabase/supabase-js`
    );
    assert.equal(
      /from\s+['"][^'"]*\/cms\//.test(src),
      false,
      `${name} must not import src/cms`
    );
    assert.equal(src.includes(".select('*')"), false, `${name} must not call .select('*')`);
    assert.equal(src.includes('select=*'), false, `${name} must not send select=*`);
  }

  const vercelConfig = JSON.parse(readRel('vercel.json'));
  assert.equal(
    vercelConfig.functions?.['api/render-home.js']?.includeFiles,
    'dist/app.html',
    'vercel.json must bundle dist/app.html into api/render-home.js'
  );

  const globalHeadersRule = (vercelConfig.headers || []).find((h) => h.source === '/(.*)');
  assert.ok(globalHeadersRule, 'vercel.json missing global /(.*) header rule');
  const headerNames = new Set((globalHeadersRule.headers || []).map((h) => h.key));
  for (const requiredHeader of [
    'Content-Security-Policy',
    'Strict-Transport-Security',
    'Permissions-Policy',
    'X-Content-Type-Options',
    'X-Frame-Options',
    'Referrer-Policy',
    'Cross-Origin-Opener-Policy',
  ]) {
    assert.equal(headerNames.has(requiredHeader), true, `vercel.json missing header ${requiredHeader}`);
  }

  for (const noindexRoute of ['/admin', '/admin/(.*)', '/preview', '/app.html']) {
    const rule = (vercelConfig.headers || []).find((h) => h.source === noindexRoute);
    const robotsHeader = rule?.headers?.find((h) => h.key === 'X-Robots-Tag');
    assert.equal(
      Boolean(robotsHeader?.value?.includes('noindex')),
      true,
      `vercel.json missing X-Robots-Tag noindex for ${noindexRoute}`
    );
  }

  const rootRewrite = (vercelConfig.rewrites || []).find((r) => r.source === '/');
  assert.equal(rootRewrite?.destination, '/api/render-home', 'Root rewrite must target /api/render-home');

  const robotsTxt = readRel('public/robots.txt');
  assert.equal(robotsTxt.includes('Disallow: /admin'), true, 'robots.txt must disallow /admin');
  assert.equal(robotsTxt.includes('Disallow: /preview'), true, 'robots.txt must disallow /preview');
  assert.equal(fs.existsSync(path.join(ROOT, 'public/sitemap.xml')), true, 'public/sitemap.xml must exist');

  console.log('[PASS] Section 2: Source Code, Security Headers & Static SEO Audit');
}

// ============================================================================
// SECTION 3: URL Sanitization, Mapper Defense & SEO XSS Assertions
// ============================================================================
async function auditSanitizationAndMapper() {
  const safeUrl = await import(pathToFileURL(path.join(ROOT, 'src/utils/safeUrl.js')).href);
  const { mapRawPortfolioToViewModel } = await import(
    pathToFileURL(path.join(ROOT, 'src/utils/portfolioMapper.js')).href
  );
  const { buildSeoPayload, injectSeoIntoHtml } = await import(
    pathToFileURL(path.join(ROOT, 'api/_lib/seoHtmlInjector.js')).href
  );

  assert.equal(safeUrl.sanitizeExternalUrl('javascript:alert(1)'), '');
  assert.equal(safeUrl.sanitizeExternalUrl('JAVASCRIPT:void(0)'), '');
  assert.equal(safeUrl.sanitizeExternalUrl('data:text/html,<script>alert(1)</script>'), '');
  assert.equal(safeUrl.sanitizeExternalUrl('https://github.com/Rivayy20'), 'https://github.com/Rivayy20');

  assert.equal(safeUrl.sanitizeNavigationHref('javascript:alert(1)', '#'), '#');
  assert.equal(safeUrl.sanitizeNavigationHref('//evil.com/phish', '#'), '#');
  assert.equal(safeUrl.sanitizeNavigationHref('#projects', '#'), '#projects');
  assert.equal(safeUrl.sanitizeNavigationHref('/assets/cv.pdf', '#'), '/assets/cv.pdf');

  assert.equal(safeUrl.sanitizeMediaUrl('data:image/svg+xml,<svg/>'), '');
  assert.equal(safeUrl.sanitizeMediaUrl('vbscript:msgbox(1)'), '');
  assert.equal(safeUrl.sanitizeMediaUrl('/assets/cv.pdf'), '/assets/cv.pdf');
  assert.equal(safeUrl.sanitizeMediaUrl('https://cdn.example/img.webp'), 'https://cdn.example/img.webp');

  assert.equal(safeUrl.sanitizeMailtoEmail('foo@bar.com?bcc=attacker@evil.com'), '');
  assert.equal(safeUrl.sanitizeMailtoEmail('raihan@example.com'), 'raihan@example.com');

  const dirtyRaw = {
    site_settings: {
      id: 1,
      site_url: 'javascript:alert(1)',
      navbar_cta_href: 'vbscript:bad',
      publication_status: 'published',
    },
    navigation_items: [
      { id: 'n1', label: 'Bad', href: 'javascript:alert(1)', display_order: 0, is_visible: true, publication_status: 'published' },
      { id: 'n2', label: 'Projects', href: '#projects', display_order: 1, is_visible: true, publication_status: 'published' },
    ],
    profile: {
      id: 1,
      primary_cta_href: '//evil.com',
      publication_status: 'published',
    },
    projects: [
      {
        id: 'p1',
        slug: 'p1',
        name: 'Proj',
        live_demo_url: 'javascript:alert(1)',
        github_url: 'data:text/plain,bad',
        display_order: 0,
        is_visible: true,
        publication_status: 'published',
      },
    ],
    certifications: [
      {
        id: 'c1',
        title: 'Cert',
        issuer: 'Org',
        verification_url: 'javascript:alert(2)',
        display_order: 0,
        is_visible: true,
        publication_status: 'published',
      },
    ],
    contact_settings: {
      id: 1,
      email: 'bad@x.com?subject=hack',
      publication_status: 'published',
    },
    social_links: [
      { id: 's1', platform: 'github', label: 'Bad', url: 'javascript:alert(1)', display_order: 0, is_visible: true, publication_status: 'published' },
      { id: 's2', platform: 'github', label: 'Good', url: 'https://github.com/Rivayy20', display_order: 1, is_visible: true, publication_status: 'published' },
    ],
    seo_settings: {
      id: 1,
      canonical_url: 'javascript:alert(1)',
      publication_status: 'published',
    },
  };

  const vm = mapRawPortfolioToViewModel(dirtyRaw, {}, undefined, { mode: 'published' });
  assert.equal(vm.settings.siteUrl, 'https://raihan-portfolio-two.vercel.app/');
  assert.equal(vm.settings.navbarCtaHref, '#contact');
  assert.equal(vm.navigation[0].href, '#');
  assert.equal(vm.navigation[1].href, '#projects');
  assert.equal(vm.hero.primaryCtaHref, '#projects');
  assert.equal(vm.projects[0].links.liveDemo, '');
  assert.equal(vm.projects[0].links.github, '');
  assert.equal(vm.certifications[0].verificationUrl, '');
  assert.equal(vm.contact.email, '');
  assert.equal(vm.socialLinks.length, 1);
  assert.equal(vm.socialLinks[0].url, 'https://github.com/Rivayy20');
  assert.equal(vm.seo.canonicalUrl, 'https://raihan-portfolio-two.vercel.app/');

  const appHtml = readRel('dist/app.html');
  const seoPayload = buildSeoPayload({
    seo: {
      seo_title: 'Test "Quote" </script><script>alert(1)</script>',
      meta_description: 'Desc & "test"',
      structured_data_extra: {
        __proto__: { polluted: true },
        '@type': 'Fake',
        knowsAbout: ['</script><script>xss()</script>'],
      },
    },
  });
  const injected = injectSeoIntoHtml(appHtml, seoPayload);
  assert.equal(injected.includes('<script>alert(1)</script>'), false);
  assert.equal(injected.includes('<script>xss()</script>'), false);
  assert.equal(injected.includes('\\u003c/script\\u003e'), true);
  assert.equal(({}).polluted, undefined);

  console.log('[PASS] Section 3: URL Sanitization, Mapper Defense & SEO XSS Assertions');
}

// ============================================================================
// SECTION 4: Built Public Entry + Preload Isolation & Size Budget (`dist/`)
// ============================================================================
function auditBuildArtifacts() {
  const appHtmlPath = path.join(ROOT, 'dist/app.html');
  assert.equal(fs.existsSync(appHtmlPath), true, 'dist/app.html not found — run build first');
  const appHtml = fs.readFileSync(appHtmlPath, 'utf8');

  const eagerAssetPaths = new Set();
  for (const m of appHtml.matchAll(/<script\b[^>]*\bsrc=["'](\/assets\/[^"']+\.js)["']/gi)) {
    eagerAssetPaths.add(m[1]);
  }
  for (const m of appHtml.matchAll(/<link\b[^>]*\brel=["']modulepreload["'][^>]*>/gi)) {
    const hrefMatch = m[0].match(/\bhref=["'](\/assets\/[^"']+\.js)["']/i);
    if (hrefMatch) eagerAssetPaths.add(hrefMatch[1]);
  }

  assert.ok(eagerAssetPaths.size >= 1, 'Expected at least 1 eager JS chunk in dist/app.html');

  const forbiddenTokens = [
    'razh-cms-auth',
    'AuthProvider',
    'ProtectedAdminRoute',
    'LoginPage',
    'supabaseAdmin',
    'cms_admins',
    'signInWithPassword',
    'assetMigrationService',
    'previewPortfolioService',
    'revisionRepository',
    'ZodError',
    'draft_data',
    'has_unpublished_changes',
  ];

  for (const webPath of eagerAssetPaths) {
    const rel = webPath.replace(/^\//, '');
    const fullPath = path.join(ROOT, 'dist', rel);
    assert.equal(fs.existsSync(fullPath), true, `Missing referenced asset: ${rel}`);
    const js = fs.readFileSync(fullPath, 'utf8');
    for (const token of forbiddenTokens) {
      assert.equal(js.includes(token), false, `Security/isolation leak "${token}" found in eager asset ${rel}`);
    }
  }

  const assetsDir = path.join(ROOT, 'dist/assets');
  const allJsFiles = fs.readdirSync(assetsDir).filter((f) => f.endsWith('.js'));
  const MAX_CHUNK_BYTES = 500 * 1024;
  let largestName = '';
  let largestBytes = 0;

  for (const fileName of allJsFiles) {
    const size = fs.statSync(path.join(assetsDir, fileName)).size;
    if (size > largestBytes) {
      largestBytes = size;
      largestName = fileName;
    }
    assert.equal(
      size < MAX_CHUNK_BYTES,
      true,
      `JS chunk ${fileName} exceeds 500 KiB budget (${(size / 1024).toFixed(2)} KiB)`
    );
  }

  console.log(
    `[PASS] Section 4: Bundle Isolation (${eagerAssetPaths.size} eager chunks, 0 leaks) & Size Budget (largest: ${largestName} = ${(largestBytes / 1024).toFixed(1)} KiB < 500 KiB)`
  );
}

// ============================================================================
// SECTION 5: Optional Live Supabase Anonymous Security Probe (`--live`)
// ============================================================================
function resolveEnvVarFromEnvOrDotEnv(key, dotEnvMap) {
  return (process.env[key] || dotEnvMap[key] || '').trim();
}

function readLocalDotEnvMap() {
  const dotEnvPath = path.join(ROOT, '.env');
  const map = {};
  if (!fs.existsSync(dotEnvPath)) return map;
  const content = fs.readFileSync(dotEnvPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx > 0) {
      const k = trimmed.slice(0, idx).trim();
      const v = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      map[k] = v;
    }
  }
  return map;
}

async function runLiveAnonymousProbes() {
  const dotEnv = readLocalDotEnvMap();
  const baseUrl = resolveEnvVarFromEnvOrDotEnv('VITE_SUPABASE_URL', dotEnv).replace(/\/+$/, '');
  const anonKey = resolveEnvVarFromEnvOrDotEnv('VITE_SUPABASE_PUBLISHABLE_KEY', dotEnv);

  if (!baseUrl || !anonKey) {
    throw new Error('--live probe requires VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
  }

  const headers = {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    Accept: 'application/json',
  };

  const blockedRestGets = [
    '/rest/v1/cms_admins?select=*',
    '/rest/v1/content_revisions?select=*',
    '/rest/v1/site_settings?select=draft_data',
    '/rest/v1/projects?select=has_unpublished_changes',
    '/rest/v1/media_assets?select=uploaded_by',
  ];

  for (const endpoint of blockedRestGets) {
    const res = await fetch(`${baseUrl}${endpoint}`, { method: 'GET', headers });
    assert.equal(
      res.status === 401 || res.status === 403,
      true,
      `Expected 401/403 on anon GET ${endpoint}, received ${res.status}`
    );
  }

  const insertRes = await fetch(`${baseUrl}/rest/v1/projects`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug: 'qa-probe', name: 'QA Probe' }),
  });
  assert.equal(
    insertRes.status === 401 || insertRes.status === 403,
    true,
    `Expected 401/403 on anon INSERT projects, received ${insertRes.status}`
  );

  const rpcRes = await fetch(`${baseUrl}/rest/v1/rpc/get_cms_dashboard_stats`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: '{}',
  });
  assert.equal(
    rpcRes.status === 401 || rpcRes.status === 403,
    true,
    `Expected 401/403 on anon RPC get_cms_dashboard_stats, received ${rpcRes.status}`
  );

  const storageUploadRes = await fetch(
    `${baseUrl}/storage/v1/object/public-assets/profile/qa-probe.png`,
    {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'image/png',
      },
      body: new Uint8Array([137, 80, 78, 71]),
    }
  );
  assert.equal(
    [400, 401, 403].includes(storageUploadRes.status),
    true,
    `Expected 400/401/403 on anon storage upload, received ${storageUploadRes.status}`
  );

  const privateReadRes = await fetch(
    `${baseUrl}/storage/v1/object/authenticated/private-drafts/test`,
    { method: 'GET', headers }
  );
  assert.equal(
    [400, 401, 403, 404].includes(privateReadRes.status),
    true,
    `Expected unauthorized status on private-drafts anon read, received ${privateReadRes.status}`
  );

  const publicOkRes = await fetch(
    `${baseUrl}/rest/v1/site_settings?select=id,brand_name&id=eq.1`,
    { method: 'GET', headers }
  );
  assert.equal(publicOkRes.status, 200, `Expected 200 on allowed public site_settings read, got ${publicOkRes.status}`);

  console.log('[PASS] Section 5: Live Supabase Anonymous RLS & Storage Security Probes');
}

async function main() {
  auditSqlSecurity();
  auditSourceAndHeaders();
  await auditSanitizationAndMapper();
  auditBuildArtifacts();

  if (RUN_LIVE_PROBE) {
    await runLiveAnonymousProbes();
  } else {
    console.log('[INFO] Offline QA complete. Pass --live to run live anonymous Supabase RLS/Storage probes.');
  }
}

main().catch((err) => {
  console.error('[FAIL] Security QA Audit:', err?.message || err);
  process.exit(1);
});
