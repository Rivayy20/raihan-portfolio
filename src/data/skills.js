export const skillsData = [
  {
    category: "Web Development",
    color: "bg-primary dark:bg-[#008B8B]",
    primary: [
      { name: "React", icon: "FaReact", projects: ["Mecca Swim", "Portfolio Website"] },
      { name: "Next.js", icon: "TbBrandNextjs", projects: ["Mecca Swim Dashboard"] },
      { name: "Tailwind CSS", icon: "SiTailwindcss", projects: ["Mecca Swim", "Portfolio Website"] }
    ],
    supporting: [
      { name: "PHP", icon: "FaPhp", projects: ["Legacy API Integration"] },
      { name: "JavaScript", icon: "IoLogoJavascript", projects: ["All Web Projects"] },
      { name: "Bootstrap", icon: "FaBootstrap", projects: ["Academic Projects"] },
      { name: "HTML", icon: "FaHtml5", projects: ["All Web Projects"] },
      { name: "CSS", icon: "FaCss3Alt", projects: ["All Web Projects"] }
    ]
  },
  {
    category: "Game Development & 3D",
    color: "bg-white dark:bg-[#483D8B]",
    primary: [
      { name: "Unity", icon: "FaUnity", projects: ["Internship Project", "Personal Game Prototype"] },
      { name: "C#", icon: "TbBrandCSharp", projects: ["Unity Scripts", "Game Mechanics"] }
    ],
    supporting: [
      { name: "Blender", icon: "SiBlender", projects: ["3D Assets", "Environment Design"] }
    ]
  },
  {
    category: "Data & Backend",
    color: "bg-white dark:bg-[#B8860B]",
    accent: "yellow",
    primary: [
      { name: "MySQL", icon: "SiMysql", projects: ["Relational Databases", "Academic Systems"] },
      { name: "Supabase", icon: "SiSupabase", projects: ["Realtime Apps", "Auth Systems"] }
    ],
    supporting: [
      { name: "Python", icon: "FaPython", projects: ["Data Analytics", "Scripts"] },
      { name: "Firebase", icon: "SiFirebase", projects: ["NoSQL Databases", "Push Notifications"] },
      { name: "DBeaver", icon: "SiDbeaver", projects: ["Database Management"] },
      { name: "phpMyAdmin", icon: "SiPhpmyadmin", projects: ["Database Administration", "Maintenance"] }
    ]
  },
  {
    category: "Currently Exploring",
    color: "bg-gray-100 dark:bg-[#00008B]",
    exploring: [
      { name: "Cyber Security", icon: "MdSecurity" },
      { name: "Network Architecture", icon: "FaNetworkWired" },
      { name: "Cisco Packet Tracer", icon: "SiCisco" },
      { name: "Machine Learning", icon: "FaRobot" }
    ]
  }
];

