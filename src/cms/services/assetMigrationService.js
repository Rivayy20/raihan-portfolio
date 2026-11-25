import { assertSupabaseClient, supabaseAdmin } from '../../lib/supabase';
import { uploadMediaAsset } from '../repositories/mediaRepository';

import profilImgUrl from '../../assets/images/profil.png';
import cvPdfUrl from '../../assets/cv/cv.pdf';
import sagLogoUrl from '../../assets/icons/sag-laboratory.png';
import teknorekaLogoUrl from '../../assets/icons/teknoreka.png';
import mecca1Url from '../../assets/images/mecca-swim-1.png';
import mecca2Url from '../../assets/images/mecca-swim-2.png';
import mecca3Url from '../../assets/images/mecca-swim-3.png';
import sistem1Url from '../../assets/images/sistem-prediksi-1.png';
import sistem2Url from '../../assets/images/sistem-prediksi-2.png';
import sistem3Url from '../../assets/images/sistem-prediksi-3.png';
import porto1Url from '../../assets/images/porto-web-1.png';
import porto2Url from '../../assets/images/porto-web-2.png';
import porto3Url from '../../assets/images/porto-web-3.png';
import certJnpUrl from '../../assets/certificates/certificate-jnp.pdf';
import certGnsUrl from '../../assets/certificates/certificate-gns.pdf';
import certJcsUrl from '../../assets/certificates/certificate-jcs.pdf';

const LOCAL_ASSET_MANIFEST = [
  {
    key: 'profile_portrait',
    sourceUrl: profilImgUrl,
    fileName: 'profil.webp',
    altMatchNames: ['profil.png', 'profil.webp'],
    mimeType: 'image/png',
    category: 'profile',
    altText: 'Raihan Azka Hidayat Portrait',
    convertToWebp: true,
  },
  {
    key: 'og_image',
    sourceUrl: '/og-image.png',
    fileName: 'og-image.png',
    altMatchNames: ['og-image.png'],
    mimeType: 'image/png',
    category: 'seo',
    altText: 'RAZH Portfolio Open Graph Preview',
    convertToWebp: false,
  },
  {
    key: 'cv_pdf',
    sourceUrl: cvPdfUrl,
    fileName: 'cv.pdf',
    altMatchNames: ['cv.pdf'],
    mimeType: 'application/pdf',
    category: 'cv',
    altText: 'Raihan Azka Hidayat Curriculum Vitae',
    convertToWebp: false,
  },
  {
    key: 'logo_sag',
    sourceUrl: sagLogoUrl,
    fileName: 'sag-laboratory.png',
    altMatchNames: ['sag-laboratory.png'],
    mimeType: 'image/png',
    category: 'logos',
    altText: 'SAG Laboratory Logo',
    convertToWebp: false,
  },
  {
    key: 'logo_teknoreka',
    sourceUrl: teknorekaLogoUrl,
    fileName: 'teknoreka.png',
    altMatchNames: ['teknoreka.png'],
    mimeType: 'image/png',
    category: 'logos',
    altText: 'PT. Teknoreka Inovasi Nusantara Logo',
    convertToWebp: false,
  },
  {
    key: 'proj_mecca_1',
    sourceUrl: mecca1Url,
    fileName: 'mecca-swim-1.png',
    altMatchNames: ['mecca-swim-1.png'],
    mimeType: 'image/png',
    category: 'projects',
    altText: 'Mecca Swim interface preview 1',
    convertToWebp: false,
  },
  {
    key: 'proj_mecca_2',
    sourceUrl: mecca2Url,
    fileName: 'mecca-swim-2.png',
    altMatchNames: ['mecca-swim-2.png'],
    mimeType: 'image/png',
    category: 'projects',
    altText: 'Mecca Swim interface preview 2',
    convertToWebp: false,
  },
  {
    key: 'proj_mecca_3',
    sourceUrl: mecca3Url,
    fileName: 'mecca-swim-3.png',
    altMatchNames: ['mecca-swim-3.png'],
    mimeType: 'image/png',
    category: 'projects',
    altText: 'Mecca Swim interface preview 3',
    convertToWebp: false,
  },
  {
    key: 'proj_sistem_1',
    sourceUrl: sistem1Url,
    fileName: 'sistem-prediksi-1.png',
    altMatchNames: ['sistem-prediksi-1.png'],
    mimeType: 'image/png',
    category: 'projects',
    altText: 'Sistem Prediksi Dropout interface preview 1',
    convertToWebp: false,
  },
  {
    key: 'proj_sistem_2',
    sourceUrl: sistem2Url,
    fileName: 'sistem-prediksi-2.png',
    altMatchNames: ['sistem-prediksi-2.png'],
    mimeType: 'image/png',
    category: 'projects',
    altText: 'Sistem Prediksi Dropout interface preview 2',
    convertToWebp: false,
  },
  {
    key: 'proj_sistem_3',
    sourceUrl: sistem3Url,
    fileName: 'sistem-prediksi-3.png',
    altMatchNames: ['sistem-prediksi-3.png'],
    mimeType: 'image/png',
    category: 'projects',
    altText: 'Sistem Prediksi Dropout interface preview 3',
    convertToWebp: false,
  },
  {
    key: 'proj_porto_1',
    sourceUrl: porto1Url,
    fileName: 'porto-web-1.png',
    altMatchNames: ['porto-web-1.png'],
    mimeType: 'image/png',
    category: 'projects',
    altText: 'Portfolio Website interface preview 1',
    convertToWebp: false,
  },
  {
    key: 'proj_porto_2',
    sourceUrl: porto2Url,
    fileName: 'porto-web-2.png',
    altMatchNames: ['porto-web-2.png'],
    mimeType: 'image/png',
    category: 'projects',
    altText: 'Portfolio Website interface preview 2',
    convertToWebp: false,
  },
  {
    key: 'proj_porto_3',
    sourceUrl: porto3Url,
    fileName: 'porto-web-3.png',
    altMatchNames: ['porto-web-3.png'],
    mimeType: 'image/png',
    category: 'projects',
    altText: 'Portfolio Website interface preview 3',
    convertToWebp: false,
  },
  {
    key: 'cert_jnp',
    sourceUrl: certJnpUrl,
    fileName: 'certificate-jnp.pdf',
    altMatchNames: ['certificate-jnp.pdf'],
    mimeType: 'application/pdf',
    category: 'certificates',
    altText: 'Junior Programmer Certificate (BNSP)',
    convertToWebp: false,
  },
  {
    key: 'cert_gns',
    sourceUrl: certGnsUrl,
    fileName: 'certificate-gns.pdf',
    altMatchNames: ['certificate-gns.pdf'],
    mimeType: 'application/pdf',
    category: 'certificates',
    altText: 'Google Network Security Certificate',
    convertToWebp: false,
  },
  {
    key: 'cert_jcs',
    sourceUrl: certJcsUrl,
    fileName: 'certificate-jcs.pdf',
    altMatchNames: ['certificate-jcs.pdf'],
    mimeType: 'application/pdf',
    category: 'certificates',
    altText: 'Junior Cyber Security Certificate (BNSP)',
    convertToWebp: false,
  },
];

async function optimizeImageToWebpFile(blob, targetFileName, maxDim = 1400) {
  if (typeof document === 'undefined' || typeof createImageBitmap !== 'function') {
    return new File([blob], targetFileName.replace(/\.webp$/i, '.png'), {
      type: blob.type || 'image/png',
    });
  }

  let bitmap;
  try {
    bitmap = await createImageBitmap(blob);
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return new File([blob], targetFileName.replace(/\.webp$/i, '.png'), {
        type: blob.type || 'image/png',
      });
    }
    ctx.drawImage(bitmap, 0, 0, width, height);

    const webpBlob = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/webp', 0.86)
    );

    if (webpBlob && webpBlob.size > 0 && webpBlob.size < blob.size) {
      return new File([webpBlob], targetFileName, { type: 'image/webp' });
    }
    return new File([blob], targetFileName.replace(/\.webp$/i, '.png'), {
      type: blob.type || 'image/png',
    });
  } catch {
    return new File([blob], targetFileName.replace(/\.webp$/i, '.png'), {
      type: blob.type || 'image/png',
    });
  } finally {
    bitmap?.close?.();
  }
}

async function fetchAsUploadFile(entry) {
  const response = await fetch(entry.sourceUrl);
  if (!response.ok) {
    throw new Error(`Gagal membaca aset lokal ${entry.fileName} (${response.status}).`);
  }
  const blob = await response.blob();
  if (entry.convertToWebp) {
    return optimizeImageToWebpFile(blob, entry.fileName);
  }
  return new File([blob], entry.fileName, {
    type: entry.mimeType || blob.type || 'application/octet-stream',
  });
}

async function bindNullableSingletonFields(client, table, patch) {
  if (!Object.keys(patch).length) return 0;
  const cols = Object.keys(patch).join(', ');
  const { data: current, error: fetchErr } = await client
    .from(table)
    .select(cols)
    .eq('id', 1)
    .maybeSingle();

  if (fetchErr || !current) return 0;

  const updateBody = {};
  for (const [col, mediaId] of Object.entries(patch)) {
    if (!current[col] && mediaId) {
      updateBody[col] = mediaId;
    }
  }

  const keys = Object.keys(updateBody);
  if (!keys.length) return 0;

  const { error: updErr } = await client
    .from(table)
    .update(updateBody)
    .eq('id', 1);

  if (updErr) {
    throw new Error(`Gagal menautkan media pada ${table}: ${updErr.message}`);
  }
  return keys.length;
}

export async function migrateLocalAssetsToSupabase({ onProgress } = {}) {
  const client = assertSupabaseClient(supabaseAdmin);

  const { data: existingAssets, error: listErr } = await client
    .from('media_assets')
    .select('id, original_name, category, is_public, public_url');

  if (listErr) {
    throw new Error(listErr.message || 'Gagal membaca daftar Media Library.');
  }

  const total = LOCAL_ASSET_MANIFEST.length;
  const mediaIdByKey = {};
  let uploaded = 0;
  let skipped = 0;
  const errors = [];

  for (let idx = 0; idx < total; idx += 1) {
    const entry = LOCAL_ASSET_MANIFEST[idx];
    onProgress?.({
      current: idx + 1,
      total,
      label: entry.fileName,
      status: 'processing',
    });

    try {
      const existing = (existingAssets || []).find(
        (item) =>
          item.is_public &&
          item.category === entry.category &&
          entry.altMatchNames.includes(item.original_name)
      );

      if (existing) {
        mediaIdByKey[entry.key] = existing.id;
        skipped += 1;
        onProgress?.({
          current: idx + 1,
          total,
          label: entry.fileName,
          status: 'skipped',
        });
        continue;
      }

      const file = await fetchAsUploadFile(entry);
      const inserted = await uploadMediaAsset({
        file,
        category: entry.category,
        altText: entry.altText,
        isPublic: true,
      });

      mediaIdByKey[entry.key] = inserted.id;
      uploaded += 1;
      onProgress?.({
        current: idx + 1,
        total,
        label: entry.fileName,
        status: 'uploaded',
      });
    } catch (err) {
      errors.push(`${entry.fileName}: ${err?.message || 'Upload gagal'}`);
    }
  }

  // Non-destructive FK binding (only writes to currently NULL FKs / empty galleries)
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

  const experienceBindings = [
    { slug: 'sag-laboratory', mediaId: mediaIdByKey.logo_sag },
    { slug: 'game-developer-intern', mediaId: mediaIdByKey.logo_teknoreka },
  ];

  for (const item of experienceBindings) {
    if (!item.mediaId) continue;
    const { data: exp } = await client
      .from('experiences')
      .select('id, logo_media_id')
      .eq('slug', item.slug)
      .maybeSingle();

    if (exp && !exp.logo_media_id) {
      const { error } = await client
        .from('experiences')
        .update({ logo_media_id: item.mediaId })
        .eq('id', exp.id);
      if (!error) linked += 1;
    }
  }

  const certificationBindings = [
    { code: '62033 2512 2 0001024 2025', mediaId: mediaIdByKey.cert_jnp },
    { code: 'YWE4SY7MIU98', mediaId: mediaIdByKey.cert_gns },
    { code: '62021 2529 2 0126917 2025', mediaId: mediaIdByKey.cert_jcs },
  ];

  for (const item of certificationBindings) {
    if (!item.mediaId) continue;
    const { data: cert } = await client
      .from('certifications')
      .select('id, pdf_media_id')
      .eq('credential_code', item.code)
      .maybeSingle();

    if (cert && !cert.pdf_media_id) {
      const { error } = await client
        .from('certifications')
        .update({ pdf_media_id: item.mediaId })
        .eq('id', cert.id);
      if (!error) linked += 1;
    }
  }

  const projectBindings = [
    {
      slug: 'mecca-swim',
      mediaIds: [
        mediaIdByKey.proj_mecca_1,
        mediaIdByKey.proj_mecca_2,
        mediaIdByKey.proj_mecca_3,
      ],
    },
    {
      slug: 'sistem-prediksi-risiko-dropout-mahasiswa',
      mediaIds: [
        mediaIdByKey.proj_sistem_1,
        mediaIdByKey.proj_sistem_2,
        mediaIdByKey.proj_sistem_3,
      ],
    },
    {
      slug: 'portfolio-website',
      mediaIds: [
        mediaIdByKey.proj_porto_1,
        mediaIdByKey.proj_porto_2,
        mediaIdByKey.proj_porto_3,
      ],
    },
  ];

  for (const projItem of projectBindings) {
    const validIds = projItem.mediaIds.filter(Boolean);
    if (!validIds.length) continue;

    const { data: proj } = await client
      .from('projects')
      .select('id, name')
      .eq('slug', projItem.slug)
      .maybeSingle();

    if (!proj) continue;

    const { count } = await client
      .from('project_media')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', proj.id);

    if ((count ?? 0) === 0) {
      const galleryRows = validIds.map((mediaId, i) => ({
        project_id: proj.id,
        media_id: mediaId,
        alt_text: `${proj.name} interface preview ${i + 1}`,
        is_primary: i === 0,
        display_order: i,
        publication_status: 'published',
      }));

      const { error } = await client.from('project_media').insert(galleryRows);
      if (!error) linked += validIds.length;
    }
  }

  return {
    total,
    uploaded,
    skipped,
    linked,
    errors,
  };
}
