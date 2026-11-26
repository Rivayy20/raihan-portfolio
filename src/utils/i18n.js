export const SUPPORTED_LOCALES = ['en', 'id'];
export const DEFAULT_LOCALE = 'en';
export const LOCALE_STORAGE_KEY = 'razh_locale';

export const UI_STRINGS = {
  en: {
    common: {
      skipToContent: 'Skip to main content',
      loadingPortfolio: 'Loading portfolio',
      loadingContentSr: 'Loading portfolio content, please wait.',
      backToTop: 'Back to Top',
      toggleDarkMode: 'Toggle Dark Mode',
      openMenu: 'Open Menu',
      closeMenu: 'Close Menu',
      language: 'Language',
      switchLanguage: 'Switch Language',
      switchToEnglish: 'Switch to English',
      switchToIndonesian: 'Switch to Indonesian',
    },
    about: {
      eyebrow: '01 / About',
      academicBackground: 'Academic Background',
      active: 'Active',
      hidePreviousEdu: 'Hide Previous Education',
      majorPrefix: 'Major:',
      viewDetails: 'View Details',
      hideDetails: 'Hide Details',
      overview: 'Overview',
      responsibilities: 'Responsibilities',
      relevantSkills: 'Relevant Skills',
      verifiedCredentials: 'Verified Credentials',
      viewCredential: 'View Credential',
      hideCredential: 'Hide Details',
      credentialName: 'Credential Name',
      credentialId: 'Credential ID',
      viewCertificate: 'View Certificate',
      verify: 'Verify',
      badgeCurrent: 'Current',
      badgeInternship: 'Internship',
      badgeAcademic: 'Academic',
      badgeOrganization: 'Organization',
      badgeFullTime: 'Full-Time',
      badgePartTime: 'Part-Time',
      badgeFreelance: 'Freelance',
      certVerified: 'Verified Credential',
      certInProgress: 'In Progress',
      certExpired: 'Expired',
      certUnverified: 'Unverified',
    },
    expertise: {
      eyebrow: '02 / Expertise',
      webNetworkTab: 'Web Network',
      marqueeTab: 'Marquee',
      skillsUnit: 'skills',
      nodesUnit: 'nodes',
      appliedIn: 'Applied in',
      coreStackNote: 'Core stack & ongoing learning',
      coreNodeNote: 'Core node & active stack',
      hoverHint: 'Hover or select a node to trace connections',
      primaryStack: 'Primary Stack',
      supporting: 'Supporting',
    },
    projects: {
      eyebrow: '03 / Selected Work',
      allCategories: 'All',
      emptyNotice: 'Projects are currently being updated. Check back soon.',
      projectLabel: 'PROJECT',
      previousProject: 'Previous Project',
      nextProject: 'Next Project',
      previewComingSoon: 'Preview coming soon',
      viewPreview: 'View Preview',
      challenge: 'Challenge',
      solution: 'Solution',
      keyOutcomes: 'Key Outcomes',
      technologiesUsed: 'Technologies Used',
      liveDemo: 'Live Demo',
      sourceCode: 'Source Code',
    },
    contact: {
      eyebrow: '04 / Contact',
      directEmail: 'Direct Email',
      copy: 'Copy',
      copied: 'Copied!',
      formSubheading: "Fill out the form below and I'll get back to you soon.",
      nameLabel: 'Your Name',
      namePlaceholder: 'John Doe',
      emailLabel: 'Email Address',
      emailPlaceholder: 'john@example.com',
      messageLabel: 'Message',
      messagePlaceholder: 'Tell me about your project or idea...',
      sending: 'Sending Message...',
      successMsg: 'Message sent successfully! Thank you for reaching out.',
      errorRequired: 'Please fill all required fields.',
      errorNameLength: 'Name must be 120 characters or fewer.',
      errorEmail: 'Please enter a valid email address.',
      errorMessageLength: 'Message must be 3000 characters or fewer.',
      errorCooldown: 'Please wait a few seconds before sending another message.',
      errorUnavailable:
        'Contact form is temporarily unavailable. Please reach out via direct email.',
      errorGeneric: 'Failed to send message. Please try again later.',
    },
  },
  id: {
    common: {
      skipToContent: 'Lewati ke konten utama',
      loadingPortfolio: 'Memuat portofolio',
      loadingContentSr: 'Memuat konten portofolio, mohon tunggu.',
      backToTop: 'Kembali ke Atas',
      toggleDarkMode: 'Ubah Mode Tampilan',
      openMenu: 'Buka Menu',
      closeMenu: 'Tutup Menu',
      language: 'Bahasa',
      switchLanguage: 'Ganti Bahasa',
      switchToEnglish: 'Ganti ke Bahasa Inggris',
      switchToIndonesian: 'Ganti ke Bahasa Indonesia',
    },
    about: {
      eyebrow: '01 / Tentang',
      academicBackground: 'Latar Belakang Akademik',
      active: 'Aktif',
      hidePreviousEdu: 'Sembunyikan Pendidikan Sebelumnya',
      majorPrefix: 'Jurusan:',
      viewDetails: 'Lihat Detail',
      hideDetails: 'Tutup Detail',
      overview: 'Ringkasan',
      responsibilities: 'Tanggung Jawab',
      relevantSkills: 'Keahlian Terkait',
      verifiedCredentials: 'Sertifikasi Terverifikasi',
      viewCredential: 'Lihat Kredensial',
      hideCredential: 'Tutup Detail',
      credentialName: 'Nama Kredensial',
      credentialId: 'ID Kredensial',
      viewCertificate: 'Lihat Sertifikat',
      verify: 'Verifikasi',
      badgeCurrent: 'Saat Ini',
      badgeInternship: 'Magang',
      badgeAcademic: 'Akademik',
      badgeOrganization: 'Organisasi',
      badgeFullTime: 'Penuh Waktu',
      badgePartTime: 'Paruh Waktu',
      badgeFreelance: 'Freelance',
      certVerified: 'Kredensial Terverifikasi',
      certInProgress: 'Sedang Berlangsung',
      certExpired: 'Kedaluwarsa',
      certUnverified: 'Belum Terverifikasi',
    },
    expertise: {
      eyebrow: '02 / Keahlian',
      webNetworkTab: 'Jaringan Web',
      marqueeTab: 'Marquee',
      skillsUnit: 'keahlian',
      nodesUnit: 'node',
      appliedIn: 'Diterapkan pada',
      coreStackNote: 'Stack utama & pembelajaran berkelanjutan',
      coreNodeNote: 'Node inti & stack aktif',
      hoverHint: 'Arahkan kursor atau pilih node untuk melihat koneksi',
      primaryStack: 'Stack Utama',
      supporting: 'Pendukung',
    },
    projects: {
      eyebrow: '03 / Karya Pilihan',
      allCategories: 'Semua',
      emptyNotice: 'Daftar proyek sedang diperbarui. Silakan kembali nanti.',
      projectLabel: 'PROYEK',
      previousProject: 'Proyek Sebelumnya',
      nextProject: 'Proyek Berikutnya',
      previewComingSoon: 'Pratinjau segera hadir',
      viewPreview: 'Lihat Pratinjau',
      challenge: 'Tantangan',
      solution: 'Solusi',
      keyOutcomes: 'Dampak Utama',
      technologiesUsed: 'Teknologi yang Digunakan',
      liveDemo: 'Demo Langsung',
      sourceCode: 'Kode Sumber',
    },
    contact: {
      eyebrow: '04 / Kontak',
      directEmail: 'Email Langsung',
      copy: 'Salin',
      copied: 'Tersalin!',
      formSubheading: 'Isi formulir di bawah ini dan saya akan segera membalas pesan Anda.',
      nameLabel: 'Nama Anda',
      namePlaceholder: 'Nama lengkap',
      emailLabel: 'Alamat Email',
      emailPlaceholder: 'nama@email.com',
      messageLabel: 'Pesan',
      messagePlaceholder: 'Ceritakan tentang proyek atau ide Anda...',
      sending: 'Mengirim Pesan...',
      successMsg: 'Pesan berhasil terkirim! Terima kasih telah menghubungi.',
      errorRequired: 'Mohon lengkapi semua kolom yang wajib diisi.',
      errorNameLength: 'Nama maksimal 120 karakter.',
      errorEmail: 'Mohon masukkan alamat email yang valid.',
      errorMessageLength: 'Pesan maksimal 3000 karakter.',
      errorCooldown: 'Mohon tunggu beberapa detik sebelum mengirim pesan lagi.',
      errorUnavailable:
        'Formulir kontak sementara tidak tersedia. Silakan hubungi via email langsung.',
      errorGeneric: 'Gagal mengirim pesan. Silakan coba lagi nanti.',
    },
  },
};

export function normalizeLocale(locale) {
  return locale === 'id' ? 'id' : 'en';
}

export function getUiString(locale, pathKey, fallback = '') {
  const safeLocale = normalizeLocale(locale);
  const parts = String(pathKey || '').split('.');
  let cur = UI_STRINGS[safeLocale];
  for (const part of parts) {
    cur = cur?.[part];
  }
  if (typeof cur === 'string') return cur;

  let enCur = UI_STRINGS.en;
  for (const part of parts) {
    enCur = enCur?.[part];
  }
  return typeof enCur === 'string' ? enCur : fallback;
}

/**
 * Extracts all visitor-facing prose fields from a normalized portfolio ViewModel
 * for CMS 1-click auto-translation and manual review.
 */
export function extractTranslatableEntries(data) {
  if (!data || typeof data !== 'object') return [];

  const entries = [];
  const push = (key, section, label, text, multiline = false) => {
    const clean = typeof text === 'string' ? text : '';
    if (!clean.trim()) return;
    entries.push({ key, section, label, text: clean, multiline });
  };

  const settings = data.settings || {};
  push('settings.siteTitle', 'General & Navbar', 'Site Title', settings.siteTitle);
  push('settings.defaultDescription', 'General & Navbar', 'Default Meta Description', settings.defaultDescription, true);
  push('settings.navbarCtaLabel', 'General & Navbar', 'Navbar CTA Label', settings.navbarCtaLabel);

  for (const item of data.navigation || []) {
    const id = item.id || item.sectionId || item.label;
    push(`nav:${id}.label`, 'General & Navbar', `Nav Label (${item.label})`, item.label);
  }

  for (const sec of data.sections || []) {
    const id = sec.key || sec.id;
    push(`sec:${id}.title`, 'Section Headings', `Section Title (${sec.key})`, sec.title);
    push(`sec:${id}.subtitle`, 'Section Headings', `Section Subtitle (${sec.key})`, sec.subtitle, true);
  }

  const hero = data.hero || {};
  push('hero.badgeText', 'Hero', 'Intro Badge', hero.badgeText);
  (hero.headlineSegments || []).forEach((seg, idx) => {
    push(`hero.headlineSeg:${idx}`, 'Hero', `Headline Segment ${idx + 1}`, seg.text);
  });
  push('hero.subheadline', 'Hero', 'Subheadline', hero.subheadline, true);
  (hero.floatingLabels || []).forEach((lbl, idx) => {
    const lid = lbl.id || idx;
    push(`hero.floatingLabel:${lid}`, 'Hero', `Floating Label (${lbl.slot || idx + 1})`, lbl.text);
  });
  push('hero.primaryCtaText', 'Hero', 'Primary CTA', hero.primaryCtaText);
  push('hero.secondaryCtaText', 'Hero', 'Secondary CTA', hero.secondaryCtaText);
  push('hero.cvModalTitle', 'Hero', 'CV Modal Title', hero.cvModalTitle);
  push('hero.lanyardHeader', 'Hero', 'ID Badge Header', hero.lanyardHeader);
  push('hero.lanyardStatus', 'Hero', 'ID Badge Status', hero.lanyardStatus);
  push('hero.lanyardRole', 'Hero', 'ID Badge Role', hero.lanyardRole);

  const about = data.about || {};
  push('about.narrativeTitle', 'About & Education', 'Narrative Title', about.narrativeTitle);
  (about.narrativeParagraphs || []).forEach((para, idx) => {
    push(`about.narrativePara:${idx}`, 'About & Education', `Narrative Paragraph ${idx + 1}`, para, true);
  });
  push('about.educationCardTitle', 'About & Education', 'Education Card Title', about.educationCardTitle);
  push('about.previousEduHeading', 'About & Education', 'Previous Education Toggle Label', about.previousEduHeading);
  push('about.experienceCardTitle', 'Experience', 'Experience Heading', about.experienceCardTitle);
  push('about.experienceCardSubtitle', 'Experience', 'Experience Subtitle', about.experienceCardSubtitle);
  push('about.certificationsHeading', 'Certifications', 'Certifications Heading', about.certificationsHeading);

  (data.education || []).forEach((edu, idx) => {
    const eid = edu.id || idx;
    push(`edu:${eid}.degree`, 'About & Education', `Education ${idx + 1} Degree`, edu.degree);
    push(`edu:${eid}.major`, 'About & Education', `Education ${idx + 1} Major`, edu.major);
    push(`edu:${eid}.period`, 'About & Education', `Education ${idx + 1} Period`, edu.period);
    push(`edu:${eid}.description`, 'About & Education', `Education ${idx + 1} Description`, edu.description, true);
  });

  (data.experiences || []).forEach((exp, idx) => {
    const xid = exp.id || exp.slug || idx;
    push(`exp:${xid}.position`, 'Experience', `Exp ${idx + 1} Role (${exp.shortName || exp.organization})`, exp.position);
    push(`exp:${xid}.period`, 'Experience', `Exp ${idx + 1} Period`, exp.period);
    push(`exp:${xid}.duration`, 'Experience', `Exp ${idx + 1} Duration`, exp.duration);
    push(`exp:${xid}.division`, 'Experience', `Exp ${idx + 1} Division`, exp.division);
    push(`exp:${xid}.summary`, 'Experience', `Exp ${idx + 1} Summary`, exp.summary, true);
    push(`exp:${xid}.detailedDescription`, 'Experience', `Exp ${idx + 1} Detailed Overview`, exp.detailedDescription, true);
    (exp.responsibilities || []).forEach((resp, rIdx) => {
      push(`exp:${xid}.resp:${rIdx}`, 'Experience', `Exp ${idx + 1} Responsibility ${rIdx + 1}`, resp, true);
    });
    (exp.sections || []).forEach((sec, sIdx) => {
      const sid = sec.id || sIdx;
      push(`exp:${xid}.sec:${sid}.title`, 'Experience', `Exp ${idx + 1} Section ${sIdx + 1} Title`, sec.title);
      push(`exp:${xid}.sec:${sid}.text`, 'Experience', `Exp ${idx + 1} Section ${sIdx + 1} Text`, sec.text, true);
      push(`exp:${xid}.sec:${sid}.note`, 'Experience', `Exp ${idx + 1} Section ${sIdx + 1} Note`, sec.note);
      (sec.facts || []).forEach((fact, fIdx) => {
        push(`exp:${xid}.sec:${sid}.fact:${fIdx}.label`, 'Experience', `Exp ${idx + 1} Fact Label`, fact?.label);
        push(`exp:${xid}.sec:${sid}.fact:${fIdx}.value`, 'Experience', `Exp ${idx + 1} Fact Value`, fact?.value);
      });
      (sec.items || []).forEach((item, iIdx) => {
        if (typeof item === 'string') {
          push(`exp:${xid}.sec:${sid}.item:${iIdx}.text`, 'Experience', `Exp ${idx + 1} Item ${iIdx + 1}`, item, true);
        } else if (item && typeof item === 'object') {
          push(`exp:${xid}.sec:${sid}.item:${iIdx}.label`, 'Experience', `Exp ${idx + 1} Item ${iIdx + 1} Label`, item.label);
          push(`exp:${xid}.sec:${sid}.item:${iIdx}.text`, 'Experience', `Exp ${idx + 1} Item ${iIdx + 1} Text`, item.text, true);
        }
      });
    });
  });

  (data.expertise || []).forEach((cat, idx) => {
    const cid = cat.id || cat.slug || idx;
    push(`skillCat:${cid}.category`, 'Expertise', `Category ${idx + 1} Title`, cat.category);
    push(`skillCat:${cid}.learningLabel`, 'Expertise', `Category ${idx + 1} Learning Label`, cat.learningLabel);
  });

  (data.projects || []).forEach((proj, idx) => {
    const pid = proj.id || proj.slug || idx;
    push(`proj:${pid}.category`, 'Projects', `${proj.title} — Category`, proj.category);
    push(`proj:${pid}.subtitle`, 'Projects', `${proj.title} — Subtitle`, proj.subtitle);
    push(`proj:${pid}.description`, 'Projects', `${proj.title} — Description`, proj.description, true);
    push(`proj:${pid}.problem`, 'Projects', `${proj.title} — Challenge`, proj.problem, true);
    push(`proj:${pid}.solution`, 'Projects', `${proj.title} — Solution`, proj.solution, true);
    (proj.impact || []).forEach((imp, iIdx) => {
      push(`proj:${pid}.impact:${iIdx}`, 'Projects', `${proj.title} — Outcome ${iIdx + 1}`, imp);
    });
    (proj.images || []).forEach((img, mIdx) => {
      const mid = img?.id || mIdx;
      push(`proj:${pid}.imgCaption:${mid}`, 'Projects', `${proj.title} — Image Caption ${mIdx + 1}`, img?.caption);
    });
  });

  (data.certifications || []).forEach((cert, idx) => {
    const cid = cert.rowId || cert.id || idx;
    push(`cert:${cid}.title`, 'Certifications', `Cert ${idx + 1} Title`, cert.title);
    push(`cert:${cid}.credentialName`, 'Certifications', `Cert ${idx + 1} Credential Name`, cert.credentialName);
    push(`cert:${cid}.date`, 'Certifications', `Cert ${idx + 1} Date Label`, cert.date);
  });

  const contact = data.contact || {};
  push('contact.heading', 'Contact & Footer', 'Contact Heading', contact.heading, true);
  push('contact.description', 'Contact & Footer', 'Contact Description', contact.description, true);
  push('contact.availabilityStatus', 'Contact & Footer', 'Availability Badge', contact.availabilityStatus);
  push('contact.responseTimeText', 'Contact & Footer', 'Response Time Text', contact.responseTimeText);
  push('contact.locationText', 'Contact & Footer', 'Location Text', contact.locationText);
  push('contact.formHeading', 'Contact & Footer', 'Form Heading', contact.formHeading);
  push('contact.formSubmitLabel', 'Contact & Footer', 'Form Submit Button', contact.formSubmitLabel);

  const footer = data.footer || {};
  push('footer.tagline', 'Contact & Footer', 'Footer Tagline', footer.tagline, true);
  push('footer.copyrightText', 'Contact & Footer', 'Copyright Text', footer.copyrightText);
  push('footer.quickLinksHeading', 'Contact & Footer', 'Quick Links Heading', footer.quickLinksHeading);
  push('footer.connectHeading', 'Contact & Footer', 'Connect Heading', footer.connectHeading);

  return entries;
}

function pick(dict, key, fallback) {
  const val = dict?.[key];
  return typeof val === 'string' && val.trim().length > 0 ? val : fallback;
}

/**
 * Applies saved CMS translations for `locale` on top of normalized portfolio ViewModel.
 * Runs in O(n) memory synchronously for 0ms language switching on the client.
 */
export function applyPortfolioTranslations(data, locale) {
  if (!data || typeof data !== 'object') return data;
  const safeLocale = normalizeLocale(locale);
  const dict = data.translations?.[safeLocale];
  if (!dict || typeof dict !== 'object' || Object.keys(dict).length === 0) {
    return data;
  }

  return {
    ...data,
    settings: data.settings
      ? {
          ...data.settings,
          siteTitle: pick(dict, 'settings.siteTitle', data.settings.siteTitle),
          defaultDescription: pick(
            dict,
            'settings.defaultDescription',
            data.settings.defaultDescription
          ),
          navbarCtaLabel: pick(
            dict,
            'settings.navbarCtaLabel',
            data.settings.navbarCtaLabel
          ),
        }
      : data.settings,
    navigation: (data.navigation || []).map((item) => {
      const id = item.id || item.sectionId || item.label;
      return {
        ...item,
        label: pick(dict, `nav:${id}.label`, item.label),
      };
    }),
    sections: (data.sections || []).map((sec) => {
      const id = sec.key || sec.id;
      return {
        ...sec,
        title: pick(dict, `sec:${id}.title`, sec.title),
        subtitle: pick(dict, `sec:${id}.subtitle`, sec.subtitle),
      };
    }),
    hero: data.hero
      ? {
          ...data.hero,
          badgeText: pick(dict, 'hero.badgeText', data.hero.badgeText),
          headlineSegments: (data.hero.headlineSegments || []).map((seg, idx) => ({
            ...seg,
            text: pick(dict, `hero.headlineSeg:${idx}`, seg.text),
          })),
          subheadline: pick(dict, 'hero.subheadline', data.hero.subheadline),
          floatingLabels: (data.hero.floatingLabels || []).map((lbl, idx) => ({
            ...lbl,
            text: pick(dict, `hero.floatingLabel:${lbl.id || idx}`, lbl.text),
          })),
          primaryCtaText: pick(
            dict,
            'hero.primaryCtaText',
            data.hero.primaryCtaText
          ),
          secondaryCtaText: pick(
            dict,
            'hero.secondaryCtaText',
            data.hero.secondaryCtaText
          ),
          cvModalTitle: pick(dict, 'hero.cvModalTitle', data.hero.cvModalTitle),
          lanyardHeader: pick(dict, 'hero.lanyardHeader', data.hero.lanyardHeader),
          lanyardStatus: pick(dict, 'hero.lanyardStatus', data.hero.lanyardStatus),
          lanyardRole: pick(dict, 'hero.lanyardRole', data.hero.lanyardRole),
        }
      : data.hero,
    about: data.about
      ? {
          ...data.about,
          narrativeTitle: pick(
            dict,
            'about.narrativeTitle',
            data.about.narrativeTitle
          ),
          narrativeParagraphs: (data.about.narrativeParagraphs || []).map((para, idx) =>
            pick(dict, `about.narrativePara:${idx}`, para)
          ),
          educationCardTitle: pick(
            dict,
            'about.educationCardTitle',
            data.about.educationCardTitle
          ),
          previousEduHeading: pick(
            dict,
            'about.previousEduHeading',
            data.about.previousEduHeading
          ),
          experienceCardTitle: pick(
            dict,
            'about.experienceCardTitle',
            data.about.experienceCardTitle
          ),
          experienceCardSubtitle: pick(
            dict,
            'about.experienceCardSubtitle',
            data.about.experienceCardSubtitle
          ),
          certificationsHeading: pick(
            dict,
            'about.certificationsHeading',
            data.about.certificationsHeading
          ),
        }
      : data.about,
    education: (data.education || []).map((edu, idx) => {
      const eid = edu.id || idx;
      return {
        ...edu,
        degree: pick(dict, `edu:${eid}.degree`, edu.degree),
        major: pick(dict, `edu:${eid}.major`, edu.major),
        period: pick(dict, `edu:${eid}.period`, edu.period),
        description: pick(dict, `edu:${eid}.description`, edu.description),
      };
    }),
    experiences: (data.experiences || []).map((exp, idx) => {
      const xid = exp.id || exp.slug || idx;
      return {
        ...exp,
        position: pick(dict, `exp:${xid}.position`, exp.position),
        period: pick(dict, `exp:${xid}.period`, exp.period),
        duration: pick(dict, `exp:${xid}.duration`, exp.duration),
        division: pick(dict, `exp:${xid}.division`, exp.division),
        summary: pick(dict, `exp:${xid}.summary`, exp.summary),
        detailedDescription: pick(
          dict,
          `exp:${xid}.detailedDescription`,
          exp.detailedDescription
        ),
        responsibilities: (exp.responsibilities || []).map((resp, rIdx) =>
          pick(dict, `exp:${xid}.resp:${rIdx}`, resp)
        ),
        sections: (exp.sections || []).map((sec, sIdx) => {
          const sid = sec.id || sIdx;
          return {
            ...sec,
            title: pick(dict, `exp:${xid}.sec:${sid}.title`, sec.title),
            text: pick(dict, `exp:${xid}.sec:${sid}.text`, sec.text),
            note: pick(dict, `exp:${xid}.sec:${sid}.note`, sec.note),
            facts: (sec.facts || []).map((fact, fIdx) =>
              fact && typeof fact === 'object'
                ? {
                    ...fact,
                    label: pick(
                      dict,
                      `exp:${xid}.sec:${sid}.fact:${fIdx}.label`,
                      fact.label
                    ),
                    value: pick(
                      dict,
                      `exp:${xid}.sec:${sid}.fact:${fIdx}.value`,
                      fact.value
                    ),
                  }
                : fact
            ),
            items: (sec.items || []).map((item, iIdx) => {
              if (typeof item === 'string') {
                return pick(dict, `exp:${xid}.sec:${sid}.item:${iIdx}.text`, item);
              }
              if (item && typeof item === 'object') {
                return {
                  ...item,
                  label: pick(
                    dict,
                    `exp:${xid}.sec:${sid}.item:${iIdx}.label`,
                    item.label
                  ),
                  text: pick(
                    dict,
                    `exp:${xid}.sec:${sid}.item:${iIdx}.text`,
                    item.text
                  ),
                };
              }
              return item;
            }),
          };
        }),
      };
    }),
    expertise: (data.expertise || []).map((cat, idx) => {
      const cid = cat.id || cat.slug || idx;
      return {
        ...cat,
        category: pick(dict, `skillCat:${cid}.category`, cat.category),
        learningLabel: pick(dict, `skillCat:${cid}.learningLabel`, cat.learningLabel),
      };
    }),
    projects: (data.projects || []).map((proj, idx) => {
      const pid = proj.id || proj.slug || idx;
      return {
        ...proj,
        category: pick(dict, `proj:${pid}.category`, proj.category),
        subtitle: pick(dict, `proj:${pid}.subtitle`, proj.subtitle),
        description: pick(dict, `proj:${pid}.description`, proj.description),
        problem: pick(dict, `proj:${pid}.problem`, proj.problem),
        solution: pick(dict, `proj:${pid}.solution`, proj.solution),
        impact: (proj.impact || []).map((imp, iIdx) =>
          pick(dict, `proj:${pid}.impact:${iIdx}`, imp)
        ),
        images: (proj.images || []).map((img, mIdx) =>
          img && typeof img === 'object'
            ? {
                ...img,
                caption: pick(
                  dict,
                  `proj:${pid}.imgCaption:${img.id || mIdx}`,
                  img.caption
                ),
              }
            : img
        ),
      };
    }),
    certifications: (data.certifications || []).map((cert, idx) => {
      const cid = cert.rowId || cert.id || idx;
      return {
        ...cert,
        title: pick(dict, `cert:${cid}.title`, cert.title),
        credentialName: pick(
          dict,
          `cert:${cid}.credentialName`,
          cert.credentialName
        ),
        date: pick(dict, `cert:${cid}.date`, cert.date),
      };
    }),
    contact: data.contact
      ? {
          ...data.contact,
          heading: pick(dict, 'contact.heading', data.contact.heading),
          description: pick(dict, 'contact.description', data.contact.description),
          availabilityStatus: pick(
            dict,
            'contact.availabilityStatus',
            data.contact.availabilityStatus
          ),
          responseTimeText: pick(
            dict,
            'contact.responseTimeText',
            data.contact.responseTimeText
          ),
          locationText: pick(
            dict,
            'contact.locationText',
            data.contact.locationText
          ),
          formHeading: pick(dict, 'contact.formHeading', data.contact.formHeading),
          formSubmitLabel: pick(
            dict,
            'contact.formSubmitLabel',
            data.contact.formSubmitLabel
          ),
        }
      : data.contact,
    footer: data.footer
      ? {
          ...data.footer,
          tagline: pick(dict, 'footer.tagline', data.footer.tagline),
          copyrightText: pick(
            dict,
            'footer.copyrightText',
            data.footer.copyrightText
          ),
          quickLinksHeading: pick(
            dict,
            'footer.quickLinksHeading',
            data.footer.quickLinksHeading
          ),
          connectHeading: pick(
            dict,
            'footer.connectHeading',
            data.footer.connectHeading
          ),
        }
      : data.footer,
  };
}
