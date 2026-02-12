'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    setIsConnected(!!token);
    setIsAdmin(role === 'admin');
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsConnected(false);
    setIsAdmin(false);
    setIsMobileMenuOpen(false);
    router.push("/");
  };

  const navLinks = [
    { href: "/", label: "Accueil", show: true },
    { href: "/interface-invite", label: "Mon interface", show: isConnected },
    { href: "/interface-admin", label: "Page de l'organisateur", show: isAdmin }
  ].filter(link => link.show);

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navLinks.map(link => (
        <a
          key={link.href}
          href={link.href}
          onClick={() => mobile && setIsMobileMenuOpen(false)}
          className={mobile
            ? "block px-4 py-2 hover:bg-slate-700 rounded-md transition-colors"
            : "hover:text-blue-400 transition-colors"
          }
        >
          {link.label}
        </a>
      ))}
    </>
  );

  const AuthButtons = ({ mobile = false }: { mobile?: boolean }) => {
    if (isConnected === null) return null;

    const baseClasses = mobile ? "w-full text-center" : "";

    return (
      <div className={mobile ? "px-4 space-y-3 pt-2 border-t border-slate-700" : "flex items-center gap-4"}>
        <span className={`text-sm px-3 py-2 rounded-full bg-slate-700 ${mobile ? 'block' : ''}`}>
          {isConnected ? '✓ Connecté' : (
            <a href="/authentification/connexion" onClick={() => mobile && setIsMobileMenuOpen(false)}>
              Se connecter
            </a>
          )}
        </span>
        {isConnected ? (
          <button
            onClick={handleLogout}
            className={`${baseClasses} text-sm px-3 py-2 rounded-full bg-red-600 hover:bg-red-700 transition-colors font-medium`}
          >
            Se déconnecter
          </button>
        ) : null}
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl border-b border-slate-700">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <img
              src="/LIF.jpg"
              alt="Logo LIF"
              className="h-12 sm:h-16 md:h-20 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            />
            <h1 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-wider">
              Speed Meeting
            </h1>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden flex flex-col justify-center items-center w-10 h-10 space-y-1.5 hover:bg-slate-700 rounded-md transition-colors"
            aria-label="Menu"
          >
            <span className={`block w-6 h-0.5 bg-white transition-transform ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-white transition-opacity ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-white transition-transform ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>

          <div className="hidden lg:flex items-center gap-6">
            <NavLinks />
            <AuthButtons />
          </div>
        </nav>

        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-96' : 'max-h-0'}`}>
          <div className="py-4 space-y-3 border-t border-slate-700">
            <NavLinks mobile />
            <AuthButtons mobile />
          </div>
        </div>
      </div>
    </header>
  );
}
