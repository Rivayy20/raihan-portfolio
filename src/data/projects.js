// Import Images
import mecca1 from '../assets/images/mecca-swim-1.png';
import mecca2 from '../assets/images/mecca-swim-2.png';
import mecca3 from '../assets/images/mecca-swim-3.png';

import sistem1 from '../assets/images/sistem-prediksi-1.png';
import sistem2 from '../assets/images/sistem-prediksi-2.png';
import sistem3 from '../assets/images/sistem-prediksi-3.png';

import porto1 from '../assets/images/porto-web-1.png';
import porto2 from '../assets/images/porto-web-2.png';
import porto3 from '../assets/images/porto-web-3.png';

export const projectsData = [
  {
    title: "Mecca Swim",
    category: "Web Development",
    subtitle: "Modern Swimming Attendance System",
    problem: "Manual attendance systems were slow, prone to errors, and difficult to manage at scale for a growing swimming club.",
    solution: "Developed a centralized digital management system with role-based access, automated reporting, and real-time attendance tracking.",
    impact: ["Faster administration", "Better user experience", "Reduced human error"],
    tech: ["React", "Next.js", "Tailwind CSS","Framer Motion", "shadcn/ui", "Web3Forms API", "Google Gemini API", "Supabase", "PostgreSQL", "Vercel"],
    color: "bg-primary",
    images: [mecca1, mecca2, mecca3],
    links: {
      liveDemo: "https://mecca-swim.vercel.app/",
      github: "https://github.com/Rivayy20/MeccaSwim.git"
    }
  },
  {
    title: "Sistem Prediksi Risiko Dropout Mahasiswa",
    category: "Web Development",
    subtitle: "Machine Learning Prediction System",
    problem: "Institutions struggled to identify at-risk students early enough to provide effective intervention and prevent dropouts.",
    solution: "Sistem berbasis machine learning untuk memprediksi risiko mahasiswa mengalami dropout menggunakan data akademik dan faktor pendukung lainnya.",
    impact: ["Early intervention", "Data-driven decisions", "Improved retention rates"],
    tech: ["Python", "Scikit-Learn", "Streamlit", "Plotly Express", "Pandas", "Numpy", "Jupyter Notebook", "Joblib"],
    color: "bg-secondary",
    images: [sistem1, sistem2, sistem3],
    links: {
      liveDemo: "https://student-dropout-risk-prediction-7mpvmoyrnyxez3bsbjafrd.streamlit.app/",
      github: "https://github.com/Rivayy20/Student-Dropout-Risk-Prediction.git"
    }
  },
  {
    title: "Portfolio Website",
    category: "Web Development",
    subtitle: "Personal Interactive Showcase",
    problem: "Needed a modern, interactive, and fully customized platform to showcase my skills, projects, and personal brand effectively.",
    solution: "Website portofolio personal yang menampilkan profil, pengalaman, keahlian, proyek, dan karya kreatif dengan desain interaktif dan responsif.",
    impact: ["Strong online presence", "High performance", "Creative expression"],
    tech: ["React", "Vite", "Tailwind CSS", "Framer Motion", "Web3Forms API", "Vercel"],
    color: "bg-[#FFD60A]",
    images: [porto1, porto2, porto3],
    links: {
      liveDemo: "#home",
      github: "https://github.com/Rivayy20/raihan-portfolio.git"
    }
  }
];
