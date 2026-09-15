import React from 'react';
import { RootLayout } from './components/layout/RootLayout';
import { ScrollProgress } from './components/ui/ScrollProgress';
import { HeroSection } from './components/sections/HeroSection';
import { AboutSection } from './components/sections/AboutSection';
import { SkillsSection } from './components/sections/SkillsSection';
import { ProjectsSection } from './components/sections/ProjectsSection';

import { ContactSection } from './components/sections/ContactSection';
import { Footer } from './components/layout/Footer';

function App() {
  return (
    <>
      <ScrollProgress />
      <RootLayout>
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <ProjectsSection />
        <ContactSection />
      </RootLayout>
      <Footer />
    </>
  );
}

export default App;
