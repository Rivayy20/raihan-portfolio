import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';

const ROOT_DIR = process.cwd();

const MANIFEST = [
  {
    key: 'profile_portrait',
    relPath: 'src/assets/images/profil.png',
    fileName: 'profil.png',
    altMatchNames: ['profil.png', 'profil.webp'],
    mimeType: 'image/png',
    category: 'profile',
    bucketId: 'public-assets',
    folder: 'profile',
    altText: 'Raihan Azka Hidayat Portrait',
  },
  {
    key: 'og_image',
    relPath: 'public/og-image.png',
    fileName: 'og-image.png',
    altMatchNames: ['og-image.png'],
    mimeType: 'image/png',
    category: 'seo',
    bucketId: 'public-assets',
    folder: 'seo',
    altText: 'RAZH Portfolio Open Graph Preview',
  },
  {
    key: 'cv_pdf',
    relPath: 'src/assets/cv/cv.pdf',
    fileName: 'cv.pdf',
    altMatchNames: ['cv.pdf'],
    mimeType: 'application/pdf',
    category: 'cv',
    bucketId: 'public-documents',
    folder: 'cv',
    altText: 'Raihan Azka Hidayat Curriculum Vitae',
  },
  {
    key: 'logo_sag',
    relPath: 'src/assets/icons/sag-laboratory.png',
    fileName: 'sag-laboratory.png',
    altMatchNames: ['sag-laboratory.png'],
    mimeType: 'image/png',
    category: 'logos',
    bucketId: 'public-assets',
    folder: 'logos',
    altText: 'SAG Laboratory Logo',
  },
  {
    key: 'logo_teknoreka',
    relPath: 'src/assets/icons/teknoreka.png',
    fileName: 'teknoreka.png',
    altMatchNames: ['teknoreka.png'],
    mimeType: 'image/png',
    category: 'logos',
    bucketId: 'public-assets',
    folder: 'logos',
    altText: 'PT. Teknoreka Inovasi Nusantara Logo',
  },
  {
    key: 'proj_mecca_1',
    relPath: 'src/assets/images/mecca-swim-1.png',
    fileName: 'mecca-swim-1.png',
    altMatchNames: ['mecca-swim-1.png'],
    mimeType: 'image/png',
    category: 'projects',
    bucketId: 'public-assets',
    folder: 'projects',
    altText: 'Mecca Swim interface preview 1',
  },
  {
    key: 'proj_mecca_2',
    relPath: 'src/assets/images/mecca-swim-2.png',
    fileName: 'mecca-swim-2.png',
    altMatchNames: ['mecca-swim-2.png'],
    mimeType: 'image/png',
    category: 'projects',
    bucketId: 'public-assets',
    folder: 'projects',
    altText: 'Mecca Swim interface preview 2',
  },
  {
    key: 'proj_mecca_3',
    relPath: 'src/assets/images/mecca-swim-3.png',
    fileName: 'mecca-swim-3.png',
    altMatchNames: ['mecca-swim-3.png'],
    mimeType: 'image/png',
    category: 'projects',
    bucketId: 'public-assets',
    folder: 'projects',
    altText: 'Mecca Swim interface preview 3',
  },
  {
    key: 'proj_sistem_1',
    relPath: 'src/assets/images/sistem-prediksi-1.png',
    fileName: 'sistem-prediksi-1.png',
    altMatchNames: ['sistem-prediksi-1.png'],
    mimeType: 'image/png',
    category: 'projects',
    bucketId: 'public-assets',
    folder: 'projects',
    altText: 'Sistem Prediksi Dropout interface preview 1',
  },
  {
    key: 'proj_sistem_2',
    relPath: 'src/assets/images/sistem-prediksi-2.png',
    fileName: 'sistem-prediksi-2.png',
    altMatchNames: ['sistem-prediksi-2.png'],
    mimeType: 'image/png',
    category: 'projects',
    bucketId: 'public-assets',
    folder: 'projects',
    altText: 'Sistem Prediksi Dropout interface preview 2',
  },
  {
    key: 'proj_sistem_3',
    relPath: 'src/assets/images/sistem-prediksi-3.png',
    fileName: 'sistem-prediksi-3.png',
    altMatchNames: ['sistem-prediksi-3.png'],
    mimeType: 'image/png',
    category: 'projects',
    bucketId: 'public-assets',
    folder: 'projects',
    altText: 'Sistem Prediksi Dropout interface preview 3',
  },
  {
    key: 'proj_porto_1',
    relPath: 'src/assets/images/porto-web-1.png',
    fileName: 'porto-web-1.png',
    altMatchNames: ['porto-web-1.png'],
    mimeType: 'image/png',
    category: 'projects',
    bucketId: 'public-assets',
    folder: 'projects',
    altText: 'Portfolio Website interface preview 1',
  },
  {
    key: 'proj_porto_2',
    relPath: 'src/assets/images/porto-web-2.png',
    fileName: 'porto-web-2.png',
    altMatchNames: ['porto-web-2.png'],
    mimeType: 'image/png',
    category: 'projects',
    bucketId: 'public-assets',
    folder: 'projects',
    altText: 'Portfolio Website interface preview 2',
  },
  {
    key: 'proj_porto_3',
    relPath: 'src/assets/images/porto-web-3.png',
    fileName: 'porto-web-3.png',
    altMatchNames: ['porto-web-3.png'],
    mimeType: 'image/png',
    category: 'projects',
    bucketId: 'public-assets',
    folder: 'projects',
    altText: 'Portfolio Website interface preview 3',
  },
  {
    key: 'cert_jnp',
    relPath: 'src/assets/certificates/certificate-jnp.pdf',
    fileName: 'certificate-jnp.pdf',
    altMatchNames: ['certificate-jnp.pdf'],
    mimeType: 'application/pdf',
    category: 'certificates',
    bucketId: 'public-documents',
    folder: 'certificates',
    altText: 'Junior Programmer Certificate (BNSP)',
  },
  {
    key: 'cert_gns',
    relPath: 'src/assets/certificates/certificate-gns.pdf',
    fileName: 'certificate-gns.pdf',
    altMatchNames: ['certificate-gns.pdf'],
    mimeType: 'application/pdf',
    category: 'certificates',
    bucketId: 'public-documents',
    folder: 'certificates',
    altText: 'Google Network Security Certificate',
  },
  {
    key: 'cert_jcs',
    relPath: 'src/assets/certificates/certificate-jcs.pdf',
    fileName: 'certificate-jcs.pdf',
    altMatchNames: ['certificate-jcs.pdf'],
    mimeType: 'application/pdf',
    category: 'certificates',
    bucketId: 'public-documents',
    folder: 'certificates',
    altText: 'Junior Cyber Security Certificate (BNSP)',
  },
];

async function bindNullableSingletonFields(client, table, patch) {
  if (!Object.keys(patch).length) return 0;
  const cols = Object.keys(patch).join(', ');
  const { data: current } = await client
    .from(table)
    .select(cols)
    .eq('id', 1)
    .maybeSingle();

  if (!current) return 0;

  const updateBody = {};
  for (const [col, mediaId] of Object.entries(patch)) {
    if (!current[col] && mediaId) updateBody[col] = mediaId;
  }

  const keys = Object.keys(updateBody);
  if (!keys.length) return 0;

  const { error } = await client.from(table).update(updateBody).eq('id', 1);
  if (error) throw error;
  return keys.length;
}

async function run() {
  const supabaseUrl = (
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ''
  ).trim();
  const publishableKey = (
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    ''
  ).trim();
  const email = (process.env.CMS_ADMIN_EMAIL || '').trim();
  const password = process.env.CMS_ADMIN_PASSWORD || '';

  if (!supabaseUrl || !publishableKey || !email || !password) {
    console.error(
      'Missing required environment variables: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, CMS_ADMIN_EMAIL, CMS_ADMIN_PASSWORD.'
    );
    process.exit(1);
  }

  const client = createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: authData, error: authErr } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (authErr || !authData?.user) {
    console.error('Authentication failed:', authErr?.message || 'Unknown error');
    process.exit(1);
  }

  try {
    const { data: existingAssets, error: listErr } = await client
      .from('media_assets')
      .select('id, original_name, category, is_public');

    if (listErr) throw listErr;

    const mediaIdByKey = {};
    let uploaded = 0;
    let skipped = 0;

    for (const entry of MANIFEST) {
      const existing = (existingAssets || []).find(
        (item) =>
          item.is_public &&
          item.category === entry.category &&
          entry.altMatchNames.includes(item.original_name)
      );

      if (existing) {
        mediaIdByKey[entry.key] = existing.id;
        skipped += 1;
        console.log(`[SKIP] ${entry.fileName}`);
        continue;
      }

      const absPath = path.join(ROOT_DIR, entry.relPath);
      const buffer = await fs.readFile(absPath);
      const ext = path.extname(entry.fileName).replace('.', '').toLowerCase();
      const base = path
        .basename(entry.fileName, path.extname(entry.fileName))
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/g, '-');
      const uniqueFileName = `${Date.now()}-${base}.${ext}`;
      const storagePath = `${entry.folder}/${uniqueFileName}`;

      const { error: uploadErr } = await client.storage
        .from(entry.bucketId)
        .upload(storagePath, buffer, {
          contentType: entry.mimeType,
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadErr) {
        throw new Error(`Upload failed (${entry.fileName}): ${uploadErr.message}`);
      }

      const publicUrl = client.storage
        .from(entry.bucketId)
        .getPublicUrl(storagePath).data.publicUrl;

      const { data: inserted, error: dbErr } = await client
        .from('media_assets')
        .insert({
          bucket_id: entry.bucketId,
          storage_path: storagePath,
          public_url: publicUrl,
          file_name: uniqueFileName,
          original_name: entry.fileName,
          mime_type: entry.mimeType,
          file_ext: ext,
          size_bytes: buffer.length,
          category: entry.category,
          alt_text: entry.altText,
          is_public: true,
          uploaded_by: authData.user.id,
        })
        .select('id')
        .single();

      if (dbErr) {
        await client.storage.from(entry.bucketId).remove([storagePath]);
        throw new Error(`Metadata write failed (${entry.fileName}): ${dbErr.message}`);
      }

      mediaIdByKey[entry.key] = inserted.id;
      uploaded += 1;
      console.log(`[UPLOAD] ${entry.fileName} -> ${storagePath}`);
    }

    let linked = 0;
    linked += await bindNullableSingletonFields(client, 'site_settings', {
      profile_image_id: mediaIdByKey.profile_portrait,
      default_og_image_id: mediaIdByKey.og_image,
    });
    linked += await bindNullableSingletonFields(client, 'profile', {
      profile_image_id: mediaIdByKey.profile_portrait,
      cv_media_id: mediaIdByKey.cv_pdf,
    });
    linked += await bindNullableSingletonFields(client, 'seo_settings', {
      og_image_media_id: mediaIdByKey.og_image,
    });

    for (const [slug, mediaId] of [
      ['sag-laboratory', mediaIdByKey.logo_sag],
      ['game-developer-intern', mediaIdByKey.logo_teknoreka],
    ]) {
      if (!mediaId) continue;
      const { data: exp } = await client
        .from('experiences')
        .select('id, logo_media_id')
        .eq('slug', slug)
        .maybeSingle();
      if (exp && !exp.logo_media_id) {
        const { error } = await client
          .from('experiences')
          .update({ logo_media_id: mediaId })
          .eq('id', exp.id);
        if (!error) linked += 1;
      }
    }

    for (const [code, mediaId] of [
      ['62033 2512 2 0001024 2025', mediaIdByKey.cert_jnp],
      ['YWE4SY7MIU98', mediaIdByKey.cert_gns],
      ['62021 2529 2 0126917 2025', mediaIdByKey.cert_jcs],
    ]) {
      if (!mediaId) continue;
      const { data: cert } = await client
        .from('certifications')
        .select('id, pdf_media_id')
        .eq('credential_code', code)
        .maybeSingle();
      if (cert && !cert.pdf_media_id) {
        const { error } = await client
          .from('certifications')
          .update({ pdf_media_id: mediaId })
          .eq('id', cert.id);
        if (!error) linked += 1;
      }
    }

    for (const [slug, mediaIds] of [
      [
        'mecca-swim',
        [
          mediaIdByKey.proj_mecca_1,
          mediaIdByKey.proj_mecca_2,
          mediaIdByKey.proj_mecca_3,
        ],
      ],
      [
        'sistem-prediksi-risiko-dropout-mahasiswa',
        [
          mediaIdByKey.proj_sistem_1,
          mediaIdByKey.proj_sistem_2,
          mediaIdByKey.proj_sistem_3,
        ],
      ],
      [
        'portfolio-website',
        [
          mediaIdByKey.proj_porto_1,
          mediaIdByKey.proj_porto_2,
          mediaIdByKey.proj_porto_3,
        ],
      ],
    ]) {
      const validIds = mediaIds.filter(Boolean);
      if (!validIds.length) continue;
      const { data: proj } = await client
        .from('projects')
        .select('id, name')
        .eq('slug', slug)
        .maybeSingle();
      if (!proj) continue;
      const { count } = await client
        .from('project_media')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', proj.id);
      if ((count ?? 0) === 0) {
        const rows = validIds.map((mediaId, i) => ({
          project_id: proj.id,
          media_id: mediaId,
          alt_text: `${proj.name} interface preview ${i + 1}`,
          is_primary: i === 0,
          display_order: i,
          publication_status: 'published',
        }));
        const { error } = await client.from('project_media').insert(rows);
        if (!error) linked += validIds.length;
      }
    }

    console.log(
      `\nMigration complete: uploaded=${uploaded}, skipped=${skipped}, linked=${linked}`
    );
  } finally {
    await client.auth.signOut();
  }
}

run().catch((err) => {
  console.error('Migration failed:', err?.message || err);
  process.exit(1);
});
