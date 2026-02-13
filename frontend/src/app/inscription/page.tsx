"use client";

import { API_BASE_URL } from "@/lib/api";
import { useEffect, useState } from "react";

export default function InscriptionPage() {
    const [planVersion, setPlanVersion] = useState<"free" | "paid">("paid");
    const [organizerForm, setOrganizerForm] = useState({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        activite: "",
        entreprise: "",
        raison: "",
    });
    const [organizerStatus, setOrganizerStatus] = useState<{
        type: "" | "success" | "error";
        message: string;
    }>({ type: "", message: "" });
    const [isOrganizerSending, setIsOrganizerSending] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        const storedVersion = localStorage.getItem("planVersion");
        if (storedVersion === "free" || storedVersion === "paid") {
            setPlanVersion(storedVersion);
        }
    }, []);

    const updatePlanVersion = (version: "free" | "paid") => {
        setPlanVersion(version);
        if (typeof window !== "undefined") {
            localStorage.setItem("planVersion", version);
        }
    };

    const handleOrganizerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setOrganizerStatus({ type: "", message: "" });
        setIsOrganizerSending(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/organizer/request`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(organizerForm),
            });
            const payload = await response.json();

            if (!response.ok) {
                let errorMessage = "Envoi impossible.";
                if (payload?.detail) {
                    if (typeof payload.detail === "string") {
                        errorMessage = payload.detail;
                    } else if (Array.isArray(payload.detail)) {
                        errorMessage = payload.detail.map((e: any) => e.msg || String(e)).join(", ");
                    }
                }
                setOrganizerStatus({ type: "error", message: errorMessage });
                return;
            }

            setOrganizerStatus({ type: "success", message: "Demande envoyee avec succes." });
            setOrganizerForm({
                nom: "",
                prenom: "",
                email: "",
                telephone: "",
                activite: "",
                entreprise: "",
                raison: "",
            });
        } catch {
            setOrganizerStatus({ type: "error", message: "Erreur reseau lors de l'envoi." });
        } finally {
            setIsOrganizerSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-900 font-sans">
            <main className="mx-auto flex w-full max-w-2xl flex-col items-center justify-start py-12 px-6 sm:py-20">
                <div className="w-full">
                    <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white mb-2">
                        Inscription organisateur
                    </h1>
                    <p className="text-base text-zinc-600 dark:text-zinc-400 mb-8">
                        Demandez l'autorisation d'utiliser le logiciel et choisissez la version.
                    </p>

                    <div className="mb-6 bg-white dark:bg-zinc-950 rounded-lg shadow-md p-8 border border-zinc-200 dark:border-zinc-800">
                        <div className="text-sm font-semibold text-black dark:text-white mb-3">
                            Choix de version
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <button
                                type="button"
                                onClick={() => updatePlanVersion("free")}
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${planVersion === "free"
                                    ? "bg-blue-600 text-white"
                                    : "bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white"}`}
                            >
                                Version gratuite
                            </button>
                            <button
                                type="button"
                                onClick={() => updatePlanVersion("paid")}
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${planVersion === "paid"
                                    ? "bg-blue-600 text-white"
                                    : "bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white"}`}
                            >
                                Version payante
                            </button>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-3">
                            Gratuite : participants numerotes sans import. Payante : import Excel et acces participant.
                        </p>
                    </div>

                    <div className="mb-6 bg-white dark:bg-zinc-950 rounded-lg shadow-md p-8 border border-zinc-200 dark:border-zinc-800">
                        <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
                            Demande d'autorisation
                        </h2>

                        {organizerStatus.message && (
                            <div className={`mb-4 p-3 rounded-lg border ${organizerStatus.type === "success"
                                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
                                }`}>
                                <p className="text-sm">{organizerStatus.message}</p>
                            </div>
                        )}

                        <form onSubmit={handleOrganizerSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Nom"
                                className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-white"
                                value={organizerForm.nom}
                                onChange={(e) => setOrganizerForm({ ...organizerForm, nom: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Prenom"
                                className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-white"
                                value={organizerForm.prenom}
                                onChange={(e) => setOrganizerForm({ ...organizerForm, prenom: e.target.value })}
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-white"
                                value={organizerForm.email}
                                onChange={(e) => setOrganizerForm({ ...organizerForm, email: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Telephone"
                                className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-white"
                                value={organizerForm.telephone}
                                onChange={(e) => setOrganizerForm({ ...organizerForm, telephone: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Activite"
                                className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-white"
                                value={organizerForm.activite}
                                onChange={(e) => setOrganizerForm({ ...organizerForm, activite: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Entreprise"
                                className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-white"
                                value={organizerForm.entreprise}
                                onChange={(e) => setOrganizerForm({ ...organizerForm, entreprise: e.target.value })}
                                required
                            />
                            <textarea
                                placeholder="Raison de la demande"
                                className="sm:col-span-2 w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-white"
                                value={organizerForm.raison}
                                onChange={(e) => setOrganizerForm({ ...organizerForm, raison: e.target.value })}
                                required
                            />
                            <button
                                type="submit"
                                disabled={isOrganizerSending}
                                className="sm:col-span-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors"
                            >
                                {isOrganizerSending ? "Envoi en cours..." : "Envoyer la demande"}
                            </button>
                        </form>
                    </div>

                    <div className="flex justify-center">
                        <a
                            href="/interface-admin/parametrage"
                            className="px-6 py-3 bg-zinc-900 text-white rounded-lg hover:bg-black transition"
                        >
                            Aller au parametrage
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
}
