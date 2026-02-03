export default function Header() {
    return (
        <header className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 text-white py-6 shadow-lg w-full position top-0 z-10">
           
            <div className="w-full max-w-5xl mx-auto px-6">
                <nav className="flex justify-end space-x-4">
                <img src="/FFI.jpg" alt="Logo" className="h-10 mb-2 bg-white" />
                <h1 className="text-2xl font-bold tracking-wider">Speed Meeting</h1>
                </nav>
            </div>
        </header>
    );
}
