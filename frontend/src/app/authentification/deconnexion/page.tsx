'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Deconnexion() {
    const router = useRouter();

    useEffect(() => {
        // Nettoyer le localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("participant");
        localStorage.removeItem("role");

        // Rediriger vers l'accueil après 1 seconde
        const timeout = setTimeout(() => {
            router.push("/");
        }, 1000);

        return () => clearTimeout(timeout);
    }, [router]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <main className="flex flex-col items-center justify-center gap-6">
                <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
                    Déconnexion en cours...
                </h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-sm text-center">
                    Vous allez être redirigé vers l'accueil. À bientôt !
                </p>
                <div className="flex gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
            </main>
        </div>
    );
}