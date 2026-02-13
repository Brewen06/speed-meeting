export default function Foot() {
    return (
        <footer className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 text-white py-8 mt-auto w-full shadow-lg">
            <div className="w-full max-w-5xl mx-auto px-6 text-center">
                <div className="flex flex-col gap-6 items-center">
                    <div className="text-center">
                        <p className="text-blue-300 text-sm tracking-wider font-light">
                            © 2026 - Tous droits réservés
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <a href="/mentions-legales" className="text-sm text-gray-400 hover:text-gray-200 transition-colors">
                            Mentions légales
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}