'use client';

import { useEffect, useState } from 'react';

export default function Header() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        setIsConnected(!!token);
      } catch {
        setIsConnected(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl border-b border-slate-700">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-20">
          {/* Logo et titre */}
          <div className="flex items-center gap-3 sm:gap-4">
            <img
              src="/FFI.jpg"
              alt="Logo FFI"
              className="h-16 sm:h-20 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-wider">
              Speed Meeting
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <a href="/" className="hover:text-blue-400 transition-colors">
              Accueil
            </a>
            {isConnected !== null && (
              <span className="text-sm px-3 py-1 rounded-full bg-slate-700">
                {isConnected ? '✓ Connecté' : <a href="/authentification/connexion">Se connecter</a>}
              </span>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
