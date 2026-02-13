"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

export default function Inscription() {
  const router = useRouter();
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [profession, setProfession] = useState("");
  const [entreprise, setEntreprise] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/participants/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prenom: prenom.trim(),
          nom: nom.trim(),
          nom_complet: "",
          email: email.trim(),
          telephone: telephone.trim() || undefined,
          profession: profession.trim() || undefined,
          entreprise: entreprise.trim() || undefined,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.detail ?? "Inscription impossible.");
        setIsLoading(false);
        return;
      }

      // Login automatique après inscription réussie
      const loginResponse = await fetch(`${API_BASE_URL}/api/participants/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prenom: prenom.trim(),
          nom: nom.trim(),
          email: email.trim(),
        }),
      });

      const loginPayload = await loginResponse.json();
      if (!loginResponse.ok) {
        setError("Inscription réussie mais connexion impossible. Veuillez vous connecter manuellement.");
        setIsLoading(false);
        return;
      }

      // Stocker les données de session
      localStorage.setItem("token", loginPayload.token);
      localStorage.setItem("participant", JSON.stringify(loginPayload.participant));

      // Rediriger vers l'interface invité
      router.push("/interface-invite");
    } catch {
      setError("Erreur reseau. Veuillez reessayer.");
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#f1f4f0] text-slate-900 font-sans"
    >
      <div className="pointer-events-none absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-[#93c5fd]/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-16 h-80 w-80 rounded-full bg-[#facc15]/30 blur-3xl" />

      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-20">
        <section className="grid w-full gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.5)] backdrop-blur">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Inscription invite
              </h2>
              <p className="text-sm text-slate-500">
                Indiquez vos informations pour vous inscrire à la session.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <label className="block text-sm font-semibold text-slate-700">
                Prénom *
                <input
                  type="text"
                  value={prenom}
                  onChange={(event) => setPrenom(event.target.value)}
                  placeholder="prénom"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-[#facc15] focus:outline-none focus:ring-2 focus:ring-[#facc15]/40"
                  required
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Nom * <span className="text-xs text-slate-500">(en majuscule)</span>
                <input
                  type="text"
                  value={nom}
                  onChange={(event) => setNom(event.target.value.toUpperCase())}
                  placeholder="nom de famille"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-[#facc15] focus:outline-none focus:ring-2 focus:ring-[#facc15]/40"
                  required
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Email *
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="utilisateur@email.com"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                  required
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Téléphone (optionnel)
                <input
                  type="tel"
                  inputMode="numeric"
                  value={telephone}
                  onChange={(event) => {
                    const filtered = event.target.value.replace(/[^0-9\s\-\+\(\)]/g, '');
                    setTelephone(filtered);
                  }}
                  placeholder="Ex: +33 0 00 00 00 00"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Profession (optionnel)
                <input
                  type="text"
                  value={profession}
                  onChange={(event) => setProfession(event.target.value)}
                  placeholder="profession"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Entreprise (optionnel)
                <input
                  type="text"
                  value={entreprise}
                  onChange={(event) => setEntreprise(event.target.value)}
                  placeholder="entreprise"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-[#93c5fd] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]/40"
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
                {isLoading ? "Inscription..." : "S'inscrire"}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
              <a href="/" className="transition hover:text-slate-800">
                Retour a l'accueil
              </a>
              <a
                href="/authentification/connexion"
                className="transition hover:text-slate-800"
              >
                Se connecter
              </a>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-6">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">
              Invitation
            </p>
            <h1
              className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl"
            >
              Prenez votre place avant le debut de la session.
            </h1>
            <p className="max-w-xl text-base text-slate-600 md:text-lg">
              L'organisateur utilisera vos informations pour vous placer à la
              bonne table et vous identifier. Les champs optionnels permettent une meilleure organisation.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/authentification/connexion"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
              >
                Je me connecte
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
};
