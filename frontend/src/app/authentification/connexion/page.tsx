"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

export default function Connexion() {
    const router = useRouter();
    const [nom, setNom] = useState("");
    const [prenom, setPrenom] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/participants/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nom: nom.trim(),
                    prenom: prenom.trim() || undefined,
                    email: email.trim() || undefined,
                }),
            });

            const payload = await response.json();
            if (!response.ok) {
                setError(payload?.detail ?? "Connexion impossible.");
                setIsLoading(false);
                return;
            }

            localStorage.setItem("token", payload.token);
            localStorage.setItem("participant", JSON.stringify(payload.participant));
            router.push("/interface-invite");
        } catch {
            setError("Erreur reseau. Veuillez reessayer.");
            setIsLoading(false);
        }
    };

    return (
        <div
            className="relative min-h-screen overflow-hidden bg-[#f6efe6] text-slate-900 font-sans"
        >
            <div className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-[#ff8f6b]/30 blur-3xl" />
            <div className="pointer-events-none absolute -right-28 bottom-10 h-80 w-80 rounded-full bg-[#4cc9a6]/25 blur-3xl" />

            <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-20">
                <section className="grid w-full gap-12 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="flex flex-col justify-center gap-6">
                        <p className="text-sm uppercase tracking-[0.35em] text-slate-500">
                            Acces invite
                        </p>
                        <h1
                            className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl"
                        >
                            Retrouver vos tables en quelques secondes.
                        </h1>
                        <p className="max-w-xl text-base text-slate-600 md:text-lg">
                            Connectez-vous avec votre nom et prénom pour acceder a votre espace
                            invite. Votre email permet de securiser la recherche si besoin.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <a
                                href="/authentification/inscription"
                                className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                            >
                                Je m'inscris
                            </a>
                        </div>
                    </div>

                    <div className="rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.5)] backdrop-blur">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">
                                Connexion invite
                            </h2>
                            <p className="text-sm text-slate-500">
                                Renseignez vos informations telles qu'inscrites par
                                l'organisateur.
                            </p>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <label className="block text-sm font-semibold text-slate-700">
                                    Nom * <span className="text-xs text-slate-500">(en majuscule)</span>
                                    <input
                                        type="text"
                                        value={nom}
                                        onChange={(event) => setNom(event.target.value.toUpperCase())}
                                        placeholder="Ex: DUPONT"
                                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-[#ff8f6b] focus:outline-none focus:ring-2 focus:ring-[#ff8f6b]/40"
                                        required
                                    />
                                </label>

                                <label className="block text-sm font-semibold text-slate-700">
                                    Prénom *
                                    <input
                                        type="text"
                                        value={prenom}
                                        onChange={(event) => setPrenom(event.target.value)}
                                        placeholder="Ex: Clara"
                                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-[#4cc9a6] focus:outline-none focus:ring-2 focus:ring-[#4cc9a6]/40"
                                        required
                                    />
                                </label>
                            </div>
                            <label className="block text-sm font-semibold text-slate-700">
                                Email *
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder=""
                                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-[#4cc9a6] focus:outline-none focus:ring-2 focus:ring-[#4cc9a6]/40"
                                    required
                                />
                            </label>

                            {error ? (
                                <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                    {error}
                                </p>
                            ) : null}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full rounded-2xl bg-[#0f172a] px-5 py-3 text-sm font-semibold uppercase tracking-widest text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-[#111827] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isLoading ? "Connexion..." : "Se connecter"}
                            </button>
                        </form>

                        <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
                            <a href="/" className="transition hover:text-slate-800">
                                Retour a l'accueil
                            </a>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
