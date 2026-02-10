'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        setIsConnected(!!token);
        setIsAdmin(role === 'admin');
      } catch {
        setIsConnected(false);
        setIsAdmin(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("participant");
    localStorage.removeItem("role");
    setIsConnected(false);
    setIsAdmin(false);
    router.push("/");
  };

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
            {isConnected && (
              <a href="/interface-invite/attente" className="hover:text-blue-400 transition-colors">
                Mon interface
              </a>
            )}
            {isAdmin && (
              <a href="/interface-admin" className="hover:text-blue-400 transition-colors">
                Page d'administration
              </a>
            )}
            {isConnected !== null && (
              <div className="flex items-center gap-4">
                <span className="text-sm px-3 py-1 rounded-full bg-slate-700">
                  {isConnected ? '✓ Connecté' : <a href="/authentification/connexion">Se connecter</a>}
                </span>
                {isConnected && (
                  <button
                    onClick={handleLogout}
                    className="text-sm px-3 py-1 rounded-full bg-red-600 hover:bg-red-700 transition-colors cursor-pointer font-medium"
                  >
                    Se déconnecter
                  </button>
                )}
                {!isConnected && (
                  <a href="/authentification/admin" className="text-sm px-3 py-1 rounded-full bg-orange-600 hover:bg-orange-700 transition-colors">
                    Admin
                  </a>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
