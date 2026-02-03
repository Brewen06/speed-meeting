export default function Header() {
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
          </div>
        </nav>
      </div>
    </header>
  );
}
