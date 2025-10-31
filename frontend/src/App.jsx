// Root app: wraps providers and renders Home page
import React from 'react';
import Home from './pages/Home.jsx';
import { ChatProvider } from './contexts/ChatContext.jsx';

export default function App() {
  return (
    <ChatProvider>
      <div className="relative min-h-screen site-bg text-gray-900">
        <div className="absolute inset-0 bg-noise"></div>
        <header className="bg-white/80 glass sticky top-0 z-40 border-b">
          <div className="w-full px-10 py-7 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-teal-500"></div>
              <h1 className="text-2xl font-semibold">Halytech</h1>
            </div>
            <nav className="flex items-center gap-8 text-base md:text-lg">
              <a href="#home" className="text-gray-800 hover:text-gray-900">Home</a>
              <a href="#pricing" className="text-gray-800 hover:text-gray-900">Pricing</a>
              <a href="#services" className="text-gray-800 hover:text-gray-900">Services</a>
              <a href="#blog" className="text-gray-800 hover:text-gray-900">Blog</a>
              <span className="px-4 py-1.5 rounded-full bg-indigo-600 text-white">Customer support</span>
            </nav>
          </div>
        </header>
        <main className="relative px-6 py-10 min-h-[calc(100vh-140px)]">
          <Home />
        </main>
        <footer className="mt-12 border-t bg-white/70 glass">
          <div className="w-full px-6 py-6 text-xs text-gray-600 flex items-center justify-between">
            <div>© {new Date().getFullYear()} Customer Support Hub</div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-gray-900">Docs</a>
              <a href="#" className="hover:text-gray-900">Status</a>
              <a href="#" className="hover:text-gray-900">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </ChatProvider>
  );
}
