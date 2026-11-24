import sagLogo from '../assets/icons/sag-laboratory.png';
import teknorekaLogo from '../assets/icons/teknoreka.png';

// Each experience is rendered by ExperienceCard. Optional fields are hidden by
// the UI when omitted. Only add details that are confirmed.
//
// `type`: "academic" | "internship" | ...   `status`: "current" when still active.
// `logo` / `logoAlt` are the organization logo and its alt text.
// `shortName` is the compact organization name used in the collapsed overview.
// `period` / `duration` are shown under the title in the list.
//
// `sections` drive the "View Details" panel. Every field except `title` is optional:
//   text   - short paragraph
//   facts  - [{ label, value }] rendered as a definition list
//   items  - bullets, either "string" or { label, text } (label is bolded)
//   chips  - short tags (tools, skills)
//   note   - small clarifying remark shown last
export const experiencesData = [
  {
    id: "sag-laboratory",
    type: "academic",
    status: "current",
    position: "Asisten Praktikum — Pengantar Sistem Informasi",
    organization: "SAG Laboratory",
    shortName: "SAG Laboratory",
    logo: sagLogo,
    logoAlt: "SAG Laboratory logo",
    institution: "Telkom University",
    period: "September 2026 – Present",
    sections: [
      {
        title: "Role Overview",
        facts: [
          { label: "Position", value: "Asisten Praktikum — Pengantar Sistem Informasi" },
          { label: "Organization", value: "SAG Laboratory (System Architecture and Governance Laboratory)" },
          { label: "Institution", value: "Program Studi S1 Sistem Informasi, Telkom University" },
          { label: "Division", value: "Applied Tools" },
          { label: "Period", value: "September 2026 – Present" },
          { label: "Status", value: "Current" },
        ],
      },
      {
        title: "Laboratory Background",
        text: "SAG Laboratory is a research center under the Digital Enterprise System and Technology (DEST) Expertise Group, S1 Information Systems Study Program, Telkom University. The laboratory focuses on:",
        items: [
          { label: "Enterprise Architecture", text: "enterprise architecture framework design using TOGAF." },
          { label: "IT Governance", text: "IT governance using the COBIT and ITIL frameworks." },
          { label: "Information Systems Audit", text: "including standards such as ISO/IEC 27001." },
          { label: "Strategic IT Planning", text: "IT strategic planning to support organizational needs." },
        ],
        note: "These are the laboratory's areas of focus, not my individual responsibilities.",
      },
      {
        title: "Practical Teaching",
        text: "As a practicum assistant for Pengantar Sistem Informasi (Introduction to Information Systems), I support practicum sessions that introduce students to the following tools:",
        chips: ["Microsoft Word", "Microsoft Excel", "Canva", "Microsoft Power BI", "WordPress"],
      },
      {
        title: "Applied Tools Division",
        text: "I am also a member of the Applied Tools division, where my main responsibility is developing case study questions for practicum activities.",
        items: [
          "Developing case-study-based questions for practicum needs.",
          "Designing problem scenarios as the context for student exercises.",
        ],
      },
      {
        title: "Relevant Skills",
        chips: [
          "Practical Instruction & Student Assistance",
          "Case Study Development",
          "Problem Formulation",
          "Productivity Tools",
          "Data Visualization Fundamentals",
          "Website Management Fundamentals",
        ],
      },
    ],
  },
  {
    id: "game-developer-intern",
    type: "internship",
    position: "Game Developer Intern",
    organization: "PT. Teknoreka Inovasi Nusantara",
    shortName: "PT. Teknoreka",
    logo: teknorekaLogo,
    logoAlt: "PT. Teknoreka Inovasi Nusantara logo",
    duration: "5 Months",
    sections: [
      {
        title: "Overview",
        text: "Game development internship using Unity, C# and Blender.",
        facts: [{ label: "Period", value: "December 2024 – May 2025" }],
      },
      {
        title: "Responsibilities",
        items: [
          "Developing gameplay mechanics",
          "Implementing UI systems",
          "Testing game features",
          "Debugging and optimization",
        ],
      },
      { title: "Tools Used", chips: ["Unity", "C#", "Blender"] },
      {
        title: "Key Achievements",
        items: [
          "Built interactive modules",
          "Improved gameplay systems",
          "Contributed to production workflows",
        ],
      },
    ],
  },
];
