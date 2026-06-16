# Raihan Azka Hidayat - Personal Portfolio

A modern, interactive, and responsive personal portfolio website built with React, Vite, and Tailwind CSS. The design follows a **Neo-Brutalism** aesthetic, characterized by high-contrast colors, thick black borders, sharp shadows, and engaging micro-interactions.

## 🌟 Features

* **Fully Responsive Design:** Optimized for desktop, tablet, and mobile devices.
* **Complete Dark Mode:** A sophisticated theme-switching mechanism that automatically adapts colors, shadows, and contrast to provide a comfortable viewing experience in low-light environments.
* **Project Showcase:** Interactive project gallery with image collages, detailed technical descriptions, and links to source code and live demos.
* **Certifications:** Clickable and expandable certification cards integrated with a built-in PDF viewer modal.
* **Creative Gallery:** High-performance, lazy-loaded image gallery for photography and visual works, optimized with WebP format.
* **Contact Form:** Real-time form submission directly to email via Web3Forms API.

## 🛠️ Tech Stack

* **Frontend Framework:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
* **Animations:** [Framer Motion](https://www.framer.com/motion/)
* **Icons:** [React Icons](https://react-icons.github.io/react-icons/)
* **Form Handling:** [Web3Forms API](https://web3forms.com/)
* **Scroll Utility:** Lenis (Smooth Scrolling)

## 📁 Folder Structure

```
src/
├── assets/         # Images, PDFs, and static assets
├── components/     # Reusable React components
│   ├── layout/     # Navbar, Footer, RootLayout
│   ├── sections/   # Hero, About, Skills, Projects, CreativeCorner, Contact
│   └── ui/         # Buttons, Cards, Inputs, Modals, Badges
├── context/        # React Context (ThemeProvider)
├── data/           # Static data (projects.js, skills.js, certifications.js)
├── hooks/          # Custom React hooks (useLenis)
└── utils/          # Helper functions
```

## 🚀 Installation & Setup

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Clone the repository
```bash
git clone https://github.com/Rivayy20/raihan-portfolio.git
cd raihan-portfolio
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and add your Web3Forms Access Key:
```env
VITE_WEB3FORMS_ACCESS_KEY=your_access_key_here
```

### 4. Run the development server
```bash
npm run dev
```
The website will be available at `http://localhost:5173/`.

## 📦 Build for Production

To create an optimized production build:
```bash
npm run build
```
This command will generate a `dist/` folder containing the compiled assets ready for deployment.

## 🌐 Deployment

This project is built using Vite and can be easily deployed to platforms like Vercel, Netlify, or GitHub Pages. 
For Vercel deployment:
1. Push your code to GitHub.
2. Connect the repository in Vercel.
3. Add the `VITE_WEB3FORMS_ACCESS_KEY` in Vercel's Environment Variables settings.
4. Deploy!

## 🧑‍💻 Author

**Raihan Azka Hidayat**
* Email: [raihanazkahidayat90@gmail.com](mailto:raihanazkahidayat90@gmail.com)
* LinkedIn: [Raihan Azka Hidayat](https://www.linkedin.com/in/raihan-azka-hidayat-355772341)
* GitHub: [@Rivayy20](https://github.com/Rivayy20/)
* Instagram: [@azk.hy_](https://www.instagram.com/azk.hy_/)
