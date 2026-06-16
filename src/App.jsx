import React from 'react';
import { RootLayout } from './components/layout/RootLayout';
import { HeroSection } from './components/sections/HeroSection';
import { AboutSection } from './components/sections/AboutSection';
import { SkillsSection } from './components/sections/SkillsSection';
import { ProjectsSection } from './components/sections/ProjectsSection';
import { CreativeCornerSection } from './components/sections/CreativeCornerSection';
import { ContactSection } from './components/sections/ContactSection';
import { Footer } from './components/layout/Footer';

function App() {
  return (
    <>
      <RootLayout>
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <ProjectsSection />
        <CreativeCornerSection />
        <ContactSection />
      </RootLayout>
      <Footer />
    </>
  );
}

export default App;
