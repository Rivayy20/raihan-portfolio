import React from 'react';
import { useLenis } from '../../hooks/useLenis';
import { Navbar } from './Navbar';
import { BackToTop } from '../ui/BackToTop';

export const RootLayout = ({ children }) => {
  useLenis();

  return (
    <div className="min-h-screen bg-base text-black overflow-x-hidden selection:bg-accent selection:text-black">
      <Navbar />
      <main className="w-full max-w-7xl mx-auto px-6 md:px-12 py-12">
        {children}
      </main>
      <BackToTop />
    </div>
  );
};

