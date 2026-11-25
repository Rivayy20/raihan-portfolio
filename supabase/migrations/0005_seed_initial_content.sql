-- ============================================================================
-- RAZH Portfolio CMS — Migration 0005: Idempotent Initial Content Seed
-- Populates exact existing hardcoded content from PortoV2 into Supabase.
-- Note: Media FKs remain NULL until Phase 7 Storage upload & asset linking.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. site_settings (Singleton id = 1)
-- ----------------------------------------------------------------------------
INSERT INTO public.site_settings (
  id, brand_name, full_name, site_title, default_description, site_url,
  copyright_text, navbar_cta_label, navbar_cta_href, navbar_cta_variant,
  show_navbar_cta, show_mobile_cv_btn, show_theme_toggle, default_theme,
  color_preset, publication_status, published_at
)
VALUES (
  1,
  'RAZH',
  'Raihan Azka Hidayat',
  'RAZH — Information Systems Student & Developer',
  'Portfolio of Raihan Azka Hidayat (RAZH), an Information Systems student at Telkom University specializing in web development, game development, backend systems, and digital experiences.',
  'https://raihan-portfolio-two.vercel.app/',
  '© 2026 All rights reserved.',
  'Hire Me',
  '#contact',
  'accent',
  true,
  true,
  true,
  'system',
  'razh_cyan',
  'published',
  now()
)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. site_sections
-- ----------------------------------------------------------------------------
INSERT INTO public.site_sections (
  id, section_key, title, subtitle, display_order, is_visible,
  layout_variant, content_alignment, publication_status, published_at
)
VALUES
  (
    '10000000-0000-4000-8000-000000000001'::uuid,
    'hero',
    NULL,
    NULL,
    0, true, 'default', 'left', 'published', now()
  ),
  (
    '10000000-0000-4000-8000-000000000002'::uuid,
    'about',
    'About Me',
    'Combining logic with creativity to build memorable digital solutions.',
    1, true, 'default', 'left', 'published', now()
  ),
  (
    '10000000-0000-4000-8000-000000000003'::uuid,
    'expertise',
    'Core Expertise',
    'The tools and technologies I use to build digital experiences.',
    2, true, 'default', 'left', 'published', now()
  ),
  (
    '10000000-0000-4000-8000-000000000004'::uuid,
    'projects',
    'Featured Projects',
    'Selected works showcasing my ability to solve problems across different domains.',
    3, true, 'default', 'left', 'published', now()
  ),
  (
    '10000000-0000-4000-8000-000000000005'::uuid,
    'contact',
    NULL,
    NULL,
    4, true, 'default', 'left', 'published', now()
  )
ON CONFLICT (section_key) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. navigation_items
-- ----------------------------------------------------------------------------
INSERT INTO public.navigation_items (
  id, label, href, section_id, show_in_navbar, show_in_footer,
  display_order, is_visible, publication_status, published_at
)
VALUES
  ('11000000-0000-4000-8000-000000000001'::uuid, 'Home', '#', 'home', true, true, 0, true, 'published', now()),
  ('11000000-0000-4000-8000-000000000002'::uuid, 'About', '#about', 'about', true, true, 1, true, 'published', now()),
  ('11000000-0000-4000-8000-000000000003'::uuid, 'Expertise', '#expertise', 'expertise', true, true, 2, true, 'published', now()),
  ('11000000-0000-4000-8000-000000000004'::uuid, 'Projects', '#projects', 'projects', true, true, 3, true, 'published', now()),
  ('11000000-0000-4000-8000-000000000005'::uuid, 'Contact', '#contact', 'contact', true, true, 4, true, 'published', now())
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. profile (Singleton id = 1: Hero & Interactive Lanyard)
-- ----------------------------------------------------------------------------
INSERT INTO public.profile (
  id, badge_text, show_badge, headline_segments, subheadline,
  lanyard_header, lanyard_status, lanyard_name, lanyard_role, show_lanyard,
  floating_labels, show_floating_labels,
  primary_cta_text, primary_cta_href, show_primary_cta,
  secondary_cta_text, show_secondary_cta, cv_modal_title,
  show_scroll_indicator, publication_status, published_at
)
VALUES (
  1,
  'Hello, I''m a Student & Developer',
  true,
  '[
    {"text": "Building Digital Experiences with ", "highlight": "none"},
    {"text": "Logic", "highlight": "secondary_wave"},
    {"text": " and ", "highlight": "none"},
    {"text": "Creativity", "highlight": "primary_wave"},
    {"text": ".", "highlight": "none"}
  ]'::jsonb,
  'Information Systems Student at Telkom University with experience in Web Development and Game Development.',
  'ID Badge',
  'Access Granted',
  'RAIHAN AZKA H.',
  'Developer',
  true,
  '[]'::jsonb,
  true,
  'View My Projects',
  '#projects',
  true,
  'View CV',
  true,
  'My CV',
  true,
  'published',
  now()
)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5. about_content (Singleton id = 1)
-- ----------------------------------------------------------------------------
INSERT INTO public.about_content (
  id, narrative_title, narrative_paragraphs, narrative_highlights, show_narrative,
  education_card_title, previous_edu_heading, show_education_card,
  experience_card_title, experience_card_subtitle, show_experience_card,
  certifications_heading, show_certifications, publication_status, published_at
)
VALUES (
  1,
  'The Narrative',
  '[
    "An undergraduate Information Systems student at Telkom University with a background in Software Engineering and experience as a Game Developer Intern.",
    "Possesses knowledge and hands-on experience in game development using Unity and Blender, as well as web development, software development, database management, and technologies such as React, Laravel, PHP, and MySQL, developed through academic learning and professional experience.",
    "Skilled in application development, programming, database management, and the use of various software development tools. Demonstrates strong analytical thinking, problem-solving, attention to detail, communication, and learning abilities.",
    "Interested in continuously developing expertise and contributing to the fields of information technology, software development, game development, web development, database management, and related areas."
  ]'::jsonb,
  '[]'::jsonb,
  true,
  'Education',
  'Previous Education',
  true,
  'Experience',
  'Academic & Industry Experience',
  true,
  'Certifications',
  true,
  'published',
  now()
)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 6. education
-- ----------------------------------------------------------------------------
INSERT INTO public.education (
  id, institution, degree, major, period, description,
  education_level, display_order, is_visible, publication_status, published_at
)
VALUES
  (
    '20000000-0000-4000-8000-000000000001'::uuid,
    'Telkom University',
    'Bachelor of Information Systems',
    NULL,
    '2025 - Present',
    NULL,
    'current',
    0, true, 'published', now()
  ),
  (
    '20000000-0000-4000-8000-000000000002'::uuid,
    'SMK Negeri 2 Magelang',
    NULL,
    'Pengembangan Perangkat Lunak dan Gim (PPLG)',
    'Graduation Year: 2025',
    NULL,
    'previous',
    1, true, 'published', now()
  ),
  (
    '20000000-0000-4000-8000-000000000003'::uuid,
    'SMP Negeri 5 Magelang',
    NULL,
    NULL,
    'Graduation Year: 2022',
    NULL,
    'previous',
    2, true, 'published', now()
  )
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 7. experiences & experience_details
-- ----------------------------------------------------------------------------
INSERT INTO public.experiences (
  id, slug, job_title, organization, short_name, logo_alt, position_type,
  start_date, end_date, is_current, period_label, duration_label,
  institution, division, summary, detailed_description,
  responsibilities, relevant_skills,
  display_order, is_visible, publication_status, published_at
)
VALUES
  (
    '30000000-0000-4000-8000-000000000001'::uuid,
    'sag-laboratory',
    'Asisten Praktikum — Pengantar Sistem Informasi',
    'SAG Laboratory',
    'SAG Laboratory',
    'SAG Laboratory logo',
    'academic',
    '2026-09-01',
    NULL,
    true,
    'September 2026 – Present',
    NULL,
    'Telkom University',
    'Applied Tools',
    'Practicum assistant for Pengantar Sistem Informasi and member of the Applied Tools division at SAG Laboratory.',
    'Supporting practicum sessions introducing productivity, visualization, and website tools while developing case-study-based practicum questions in the Applied Tools division.',
    '[
      "Assisting students in Pengantar Sistem Informasi practicum sessions",
      "Developing case-study-based questions for practicum needs",
      "Designing problem scenarios as the context for student exercises"
    ]'::jsonb,
    '[
      "Practical Instruction & Student Assistance",
      "Case Study Development",
      "Problem Formulation",
      "Productivity Tools",
      "Data Visualization Fundamentals",
      "Website Management Fundamentals"
    ]'::jsonb,
    0, true, 'published', now()
  ),
  (
    '30000000-0000-4000-8000-000000000002'::uuid,
    'game-developer-intern',
    'Game Developer Intern',
    'PT. Teknoreka Inovasi Nusantara',
    'PT. Teknoreka',
    'PT. Teknoreka Inovasi Nusantara logo',
    'internship',
    '2024-12-01',
    '2025-05-01',
    false,
    'December 2024 – May 2025',
    '5 Months',
    NULL,
    NULL,
    'Game development internship using Unity, C# and Blender.',
    NULL,
    '[
      "Developing gameplay mechanics",
      "Implementing UI systems",
      "Testing game features",
      "Debugging and optimization"
    ]'::jsonb,
    '["Unity", "C#", "Blender"]'::jsonb,
    1, true, 'published', now()
  )
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.experience_details (
  id, experience_id, title, body_text, facts, items, chips, note,
  display_order, is_visible, publication_status
)
VALUES
  -- SAG Laboratory detail sections (5)
  (
    '31000000-0000-4000-8000-000000000001'::uuid,
    '30000000-0000-4000-8000-000000000001'::uuid,
    'Role Overview',
    NULL,
    '[
      {"label": "Position", "value": "Asisten Praktikum — Pengantar Sistem Informasi"},
      {"label": "Organization", "value": "SAG Laboratory (System Architecture and Governance Laboratory)"},
      {"label": "Institution", "value": "Program Studi S1 Sistem Informasi, Telkom University"},
      {"label": "Division", "value": "Applied Tools"},
      {"label": "Period", "value": "September 2026 – Present"},
      {"label": "Status", "value": "Current"}
    ]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    NULL,
    0, true, 'published'
  ),
  (
    '31000000-0000-4000-8000-000000000002'::uuid,
    '30000000-0000-4000-8000-000000000001'::uuid,
    'Laboratory Background',
    'SAG Laboratory is a research center under the Digital Enterprise System and Technology (DEST) Expertise Group, S1 Information Systems Study Program, Telkom University. The laboratory focuses on:',
    '[]'::jsonb,
    '[
      {"label": "Enterprise Architecture", "text": "enterprise architecture framework design using TOGAF."},
      {"label": "IT Governance", "text": "IT governance using the COBIT and ITIL frameworks."},
      {"label": "Information Systems Audit", "text": "including standards such as ISO/IEC 27001."},
      {"label": "Strategic IT Planning", "text": "IT strategic planning to support organizational needs."}
    ]'::jsonb,
    '[]'::jsonb,
    'These are the laboratory''s areas of focus, not my individual responsibilities.',
    1, true, 'published'
  ),
  (
    '31000000-0000-4000-8000-000000000003'::uuid,
    '30000000-0000-4000-8000-000000000001'::uuid,
    'Practical Teaching',
    'As a practicum assistant for Pengantar Sistem Informasi (Introduction to Information Systems), I support practicum sessions that introduce students to the following tools:',
    '[]'::jsonb,
    '[]'::jsonb,
    '["Microsoft Word", "Microsoft Excel", "Canva", "Microsoft Power BI", "WordPress"]'::jsonb,
    NULL,
    2, true, 'published'
  ),
  (
    '31000000-0000-4000-8000-000000000004'::uuid,
    '30000000-0000-4000-8000-000000000001'::uuid,
    'Applied Tools Division',
    'I am also a member of the Applied Tools division, where my main responsibility is developing case study questions for practicum activities.',
    '[]'::jsonb,
    '[
      "Developing case-study-based questions for practicum needs.",
      "Designing problem scenarios as the context for student exercises."
    ]'::jsonb,
    '[]'::jsonb,
    NULL,
    3, true, 'published'
  ),
  (
    '31000000-0000-4000-8000-000000000005'::uuid,
    '30000000-0000-4000-8000-000000000001'::uuid,
    'Relevant Skills',
    NULL,
    '[]'::jsonb,
    '[]'::jsonb,
    '[
      "Practical Instruction & Student Assistance",
      "Case Study Development",
      "Problem Formulation",
      "Productivity Tools",
      "Data Visualization Fundamentals",
      "Website Management Fundamentals"
    ]'::jsonb,
    NULL,
    4, true, 'published'
  ),
  -- PT. Teknoreka Inovasi Nusantara detail sections (4)
  (
    '31000000-0000-4000-8000-000000000006'::uuid,
    '30000000-0000-4000-8000-000000000002'::uuid,
    'Overview',
    'Game development internship using Unity, C# and Blender.',
    '[{"label": "Period", "value": "December 2024 – May 2025"}]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    NULL,
    0, true, 'published'
  ),
  (
    '31000000-0000-4000-8000-000000000007'::uuid,
    '30000000-0000-4000-8000-000000000002'::uuid,
    'Responsibilities',
    NULL,
    '[]'::jsonb,
    '[
      "Developing gameplay mechanics",
      "Implementing UI systems",
      "Testing game features",
      "Debugging and optimization"
    ]'::jsonb,
    '[]'::jsonb,
    NULL,
    1, true, 'published'
  ),
  (
    '31000000-0000-4000-8000-000000000008'::uuid,
    '30000000-0000-4000-8000-000000000002'::uuid,
    'Tools Used',
    NULL,
    '[]'::jsonb,
    '[]'::jsonb,
    '["Unity", "C#", "Blender"]'::jsonb,
    NULL,
    2, true, 'published'
  ),
  (
    '31000000-0000-4000-8000-000000000009'::uuid,
    '30000000-0000-4000-8000-000000000002'::uuid,
    'Key Achievements',
    NULL,
    '[]'::jsonb,
    '[
      "Built interactive modules",
      "Improved gameplay systems",
      "Contributed to production workflows"
    ]'::jsonb,
    '[]'::jsonb,
    NULL,
    3, true, 'published'
  )
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 8. skill_categories & skills (4 Categories, 21 Skills)
-- ----------------------------------------------------------------------------
INSERT INTO public.skill_categories (
  id, name, slug, color_preset, accent_preset, learning_label,
  display_order, is_visible, publication_status, published_at
)
VALUES
  ('40000000-0000-4000-8000-000000000001'::uuid, 'Web Development', 'web-development', 'teal', 'default', 'Currently Exploring', 0, true, 'published', now()),
  ('40000000-0000-4000-8000-000000000002'::uuid, 'Game Development & 3D', 'game-development-3d', 'purple', 'default', 'Currently Exploring', 1, true, 'published', now()),
  ('40000000-0000-4000-8000-000000000003'::uuid, 'Data & Backend', 'data-backend', 'yellow', 'yellow', 'Currently Exploring', 2, true, 'published', now()),
  ('40000000-0000-4000-8000-000000000004'::uuid, 'Currently Exploring', 'currently-exploring', 'blue', 'default', 'Networking & Infrastructure', 3, true, 'published', now())
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.skills (
  id, category_id, name, icon_type, icon_key, tier, used_in,
  display_order, is_visible, publication_status, published_at
)
VALUES
  -- Web Development (8)
  ('41000000-0000-4000-8000-000000000001'::uuid, '40000000-0000-4000-8000-000000000001'::uuid, 'React', 'preset', 'FaReact', 'primary', '["Mecca Swim", "Portfolio Website"]'::jsonb, 0, true, 'published', now()),
  ('41000000-0000-4000-8000-000000000002'::uuid, '40000000-0000-4000-8000-000000000001'::uuid, 'Next.js', 'preset', 'TbBrandNextjs', 'primary', '["Mecca Swim Dashboard"]'::jsonb, 1, true, 'published', now()),
  ('41000000-0000-4000-8000-000000000003'::uuid, '40000000-0000-4000-8000-000000000001'::uuid, 'Tailwind CSS', 'preset', 'SiTailwindcss', 'primary', '["Mecca Swim", "Portfolio Website"]'::jsonb, 2, true, 'published', now()),
  ('41000000-0000-4000-8000-000000000004'::uuid, '40000000-0000-4000-8000-000000000001'::uuid, 'PHP', 'preset', 'FaPhp', 'supporting', '["Legacy API Integration"]'::jsonb, 0, true, 'published', now()),
  ('41000000-0000-4000-8000-000000000005'::uuid, '40000000-0000-4000-8000-000000000001'::uuid, 'JavaScript', 'preset', 'IoLogoJavascript', 'supporting', '["All Web Projects"]'::jsonb, 1, true, 'published', now()),
  ('41000000-0000-4000-8000-000000000006'::uuid, '40000000-0000-4000-8000-000000000001'::uuid, 'Bootstrap', 'preset', 'FaBootstrap', 'supporting', '["Academic Projects"]'::jsonb, 2, true, 'published', now()),
  ('41000000-0000-4000-8000-000000000007'::uuid, '40000000-0000-4000-8000-000000000001'::uuid, 'HTML', 'preset', 'FaHtml5', 'supporting', '["All Web Projects"]'::jsonb, 3, true, 'published', now()),
  ('41000000-0000-4000-8000-000000000008'::uuid, '40000000-0000-4000-8000-000000000001'::uuid, 'CSS', 'preset', 'FaCss3Alt', 'supporting', '["All Web Projects"]'::jsonb, 4, true, 'published', now()),

  -- Game Development & 3D (3)
  ('41000000-0000-4000-8000-000000000009'::uuid, '40000000-0000-4000-8000-000000000002'::uuid, 'Unity', 'preset', 'FaUnity', 'primary', '["Internship Project", "Personal Game Prototype"]'::jsonb, 0, true, 'published', now()),
  ('41000000-0000-4000-8000-000000000010'::uuid, '40000000-0000-4000-8000-000000000002'::uuid, 'C#', 'preset', 'TbBrandCSharp', 'primary', '["Unity Scripts", "Game Mechanics"]'::jsonb, 1, true, 'published', now()),
  ('41000000-0000-4000-8000-000000000011'::uuid, '40000000-0000-4000-8000-000000000002'::uuid, 'Blender', 'preset', 'SiBlender', 'supporting', '["3D Assets", "Environment Design"]'::jsonb, 0, true, 'published', now()),

  -- Data & Backend (6)
  ('41000000-0000-4000-8000-000000000012'::uuid, '40000000-0000-4000-8000-000000000003'::uuid, 'MySQL', 'preset', 'SiMysql', 'primary', '["Relational Databases", "Academic Systems"]'::jsonb, 0, true, 'published', now()),
  ('41000000-0000-4000-8000-000000000013'::uuid, '40000000-0000-4000-8000-000000000003'::uuid, 'Supabase', 'preset', 'SiSupabase', 'primary', '["Realtime Apps", "Auth Systems"]'::jsonb, 1, true, 'published', now()),
  ('41000000-0000-4000-8000-000000000014'::uuid, '40000000-0000-4000-8000-000000000003'::uuid, 'Python', 'preset', 'FaPython', 'supporting', '["Data Analytics", "Scripts"]'::jsonb, 0, true, 'published', now()),
  ('41000000-0000-4000-8000-000000000015'::uuid, '40000000-0000-4000-8000-000000000003'::uuid, 'Firebase', 'preset', 'SiFirebase', 'supporting', '["NoSQL Databases", "Push Notifications"]'::jsonb, 1, true, 'published', now()),
  ('41000000-0000-4000-8000-000000000016'::uuid, '40000000-0000-4000-8000-000000000003'::uuid, 'DBeaver', 'preset', 'SiDbeaver', 'supporting', '["Database Management"]'::jsonb, 2, true, 'published', now()),
  ('41000000-0000-4000-8000-000000000017'::uuid, '40000000-0000-4000-8000-000000000003'::uuid, 'phpMyAdmin', 'preset', 'SiPhpmyadmin', 'supporting', '["Database Administration", "Maintenance"]'::jsonb, 3, true, 'published', now()),

  -- Currently Exploring (4)
  ('41000000-0000-4000-8000-000000000018'::uuid, '40000000-0000-4000-8000-000000000004'::uuid, 'Cyber Security', 'preset', 'MdSecurity', 'learning', '[]'::jsonb, 0, true, 'published', now()),
  ('41000000-0000-4000-8000-000000000019'::uuid, '40000000-0000-4000-8000-000000000004'::uuid, 'Network Architecture', 'preset', 'FaNetworkWired', 'learning', '[]'::jsonb, 1, true, 'published', now()),
  ('41000000-0000-4000-8000-000000000020'::uuid, '40000000-0000-4000-8000-000000000004'::uuid, 'Cisco Packet Tracer', 'preset', 'SiCisco', 'learning', '[]'::jsonb, 2, true, 'published', now()),
  ('41000000-0000-4000-8000-000000000021'::uuid, '40000000-0000-4000-8000-000000000004'::uuid, 'Machine Learning', 'preset', 'FaRobot', 'learning', '[]'::jsonb, 3, true, 'published', now())
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 9. projects
-- ----------------------------------------------------------------------------
INSERT INTO public.projects (
  id, slug, name, category, subtitle, description, problem, solution,
  impact, tech_stack, color_preset, live_demo_url, github_url,
  is_featured, display_order, is_visible, publication_status, published_at
)
VALUES
  (
    '50000000-0000-4000-8000-000000000001'::uuid,
    'mecca-swim',
    'Mecca Swim',
    'Web Development',
    'Modern Swimming Attendance System',
    NULL,
    'Manual attendance systems were slow, prone to errors, and difficult to manage at scale for a growing swimming club.',
    'Developed a centralized digital management system with role-based access, automated reporting, and real-time attendance tracking.',
    '["Faster administration", "Better user experience", "Reduced human error"]'::jsonb,
    '["React", "Next.js", "Tailwind CSS", "Framer Motion", "shadcn/ui", "Web3Forms API", "Google Gemini API", "Supabase", "PostgreSQL", "Vercel"]'::jsonb,
    'primary',
    'https://mecca-swim.vercel.app/',
    'https://github.com/Rivayy20/MeccaSwim.git',
    true, 0, true, 'published', now()
  ),
  (
    '50000000-0000-4000-8000-000000000002'::uuid,
    'sistem-prediksi-risiko-dropout-mahasiswa',
    'Sistem Prediksi Risiko Dropout Mahasiswa',
    'Web Development',
    'Machine Learning Prediction System',
    NULL,
    'Institutions struggled to identify at-risk students early enough to provide effective intervention and prevent dropouts.',
    'Sistem berbasis machine learning untuk memprediksi risiko mahasiswa mengalami dropout menggunakan data akademik dan faktor pendukung lainnya.',
    '["Early intervention", "Data-driven decisions", "Improved retention rates"]'::jsonb,
    '["Python", "Scikit-Learn", "Streamlit", "Plotly Express", "Pandas", "Numpy", "Jupyter Notebook", "Joblib"]'::jsonb,
    'secondary',
    'https://student-dropout-risk-prediction-7mpvmoyrnyxez3bsbjafrd.streamlit.app/',
    'https://github.com/Rivayy20/Student-Dropout-Risk-Prediction.git',
    true, 1, true, 'published', now()
  ),
  (
    '50000000-0000-4000-8000-000000000003'::uuid,
    'portfolio-website',
    'Portfolio Website',
    'Web Development',
    'Personal Interactive Showcase',
    NULL,
    'Needed a modern, interactive, and fully customized platform to showcase my skills, projects, and personal brand effectively.',
    'Website portofolio personal yang menampilkan profil, pengalaman, keahlian, proyek, dan karya kreatif dengan desain interaktif dan responsif.',
    '["Strong online presence", "High performance", "Creative expression"]'::jsonb,
    '["React", "Vite", "Tailwind CSS", "Framer Motion", "Web3Forms API", "Vercel"]'::jsonb,
    'accent',
    '#home',
    'https://github.com/Rivayy20/raihan-portfolio.git',
    true, 2, true, 'published', now()
  )
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 10. certifications
-- ----------------------------------------------------------------------------
INSERT INTO public.certifications (
  id, title, credential_name, credential_code, issuer,
  issue_date, issue_date_label, verification_status,
  color_preset, display_order, is_visible, publication_status, published_at
)
VALUES
  (
    '60000000-0000-4000-8000-000000000001'::uuid,
    'Junior Programmer',
    'Junior Programmer',
    '62033 2512 2 0001024 2025',
    'BNSP',
    '2025-07-01',
    'July 2025',
    'verified',
    'white',
    0, true, 'published', now()
  ),
  (
    '60000000-0000-4000-8000-000000000002'::uuid,
    'Google Network Security',
    'Google Network Security',
    'YWE4SY7MIU98',
    'Google',
    '2026-06-01',
    'June 2026',
    'verified',
    'white',
    1, true, 'published', now()
  ),
  (
    '60000000-0000-4000-8000-000000000003'::uuid,
    'Junior Cyber Security',
    'Junior Cyber Security',
    '62021 2529 2 0126917 2025',
    'BNSP',
    '2025-01-01',
    'January 2025',
    'verified',
    'white',
    2, true, 'published', now()
  )
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 11. contact_settings (Singleton id = 1)
-- ----------------------------------------------------------------------------
INSERT INTO public.contact_settings (
  id, heading, description, email, availability_status, is_available,
  response_time_text, location_text, form_heading, form_submit_label,
  show_availability, show_response_time, show_location, show_contact_form,
  publication_status, published_at
)
VALUES (
  1,
  E'LET''S\nTALK.',
  'Have an exciting project or collaboration in mind? I''m always open to discussing product design work or partnership opportunities.',
  'raihanazkahidayat90@gmail.com',
  'Available for Freelance',
  true,
  'Usually Replies Within 24 Hours',
  'Bandung, Indonesia',
  'Send a Message',
  'Shoot Message',
  true, true, true, true,
  'published',
  now()
)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 12. social_links
-- ----------------------------------------------------------------------------
INSERT INTO public.social_links (
  id, platform, label, tooltip_text, url, color_preset,
  show_in_contact, show_in_footer, show_in_seo_same_as,
  display_order, is_visible, publication_status, published_at
)
VALUES
  (
    '70000000-0000-4000-8000-000000000001'::uuid,
    'linkedin',
    'LinkedIn',
    'Visit LinkedIn Profile',
    'https://www.linkedin.com/in/raihan-azka-hidayat-355772341',
    'secondary',
    true, true, true, 0, true, 'published', now()
  ),
  (
    '70000000-0000-4000-8000-000000000002'::uuid,
    'github',
    'GitHub',
    'Visit GitHub Profile',
    'https://github.com/Rivayy20/',
    'white',
    true, true, true, 1, true, 'published', now()
  ),
  (
    '70000000-0000-4000-8000-000000000003'::uuid,
    'instagram',
    'Instagram',
    'Visit Instagram Profile',
    'https://www.instagram.com/azk.hy_/',
    'accent',
    true, true, true, 2, true, 'published', now()
  )
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 13. footer_settings (Singleton id = 1)
-- ----------------------------------------------------------------------------
INSERT INTO public.footer_settings (
  id, brand_text, tagline, copyright_text, quick_links_heading, connect_heading,
  show_availability_badge, show_quick_links, show_social_links,
  publication_status, published_at
)
VALUES (
  1,
  'RAZH.',
  'Building Digital Experiences with Logic and Creativity.',
  '© 2026 All rights reserved.',
  'Quick Links',
  'Connect',
  true, true, true,
  'published',
  now()
)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 14. seo_settings (Singleton id = 1)
-- ----------------------------------------------------------------------------
INSERT INTO public.seo_settings (
  id, seo_title, meta_description, canonical_url, og_title, og_description,
  og_site_name, twitter_card, twitter_title, twitter_description,
  structured_data_enabled, structured_data_job_title, structured_data_extra,
  publication_status, published_at
)
VALUES (
  1,
  'RAZH — Information Systems Student & Developer',
  'Portfolio of Raihan Azka Hidayat (RAZH), an Information Systems student at Telkom University specializing in web development, game development, backend systems, and digital experiences.',
  'https://raihan-portfolio-two.vercel.app/',
  'RAZH — Information Systems Student & Developer',
  'Portfolio of Raihan Azka Hidayat (RAZH), an Information Systems student at Telkom University specializing in web development, game development, backend systems, and digital experiences.',
  'RAZH',
  'summary_large_image',
  'RAZH — Information Systems Student & Developer',
  'Portfolio of Raihan Azka Hidayat (RAZH), an Information Systems student at Telkom University specializing in web development, game development, backend systems, and digital experiences.',
  true,
  'Information Systems Student & Developer',
  '{}'::jsonb,
  'published',
  now()
)
ON CONFLICT (id) DO NOTHING;

COMMIT;
