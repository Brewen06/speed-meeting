"use client";

import { AdminProtected } from "@/lib/protected-routes";
import { API_BASE_URL } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";

interface Participant {
    id: number;
    nom_complet: string;
    nom?: string | null;
    prenom?: string | null;
    email?: string | null;
    profession?: string | null;
    entreprise?: string | null;
    is_active?: boolean | null;
}

function ParticipantsContent() {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isSavingId, setIsSavingId] = useState<number | null>(null);

    const adminAuthHeader = useMemo(() => {
        const credentials = btoa("admin:5Pid6M3f!nG");
        return `Basic ${credentials}`;
    }, []);

    const loadParticipants = async (query: string) => {
        setIsLoading(true);
        setError("");

        try {
            const url = query.trim().length > 0
                ? `${API_BASE_URL}/api/participants/search?q=${encodeURIComponent(query)}`
                : `${API_BASE_URL}/api/participants`;

            const response = await fetch(url, {
                headers: query.trim().length > 0 ? undefined : undefined,
            });

            const payload = await response.json();

            if (!response.ok) {
                setError(payload?.detail ?? "Impossible de charger les participants.");
                setIsLoading(false);
                return;
            }

            const list = Array.isArray(payload) ? payload : payload.results || [];
            setParticipants(list);
            setIsLoading(false);
        } catch {
            setError("Erreur réseau. Veuillez réessayer.");
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadParticipants("");
    }, []);

    const handleSearch = (value: string) => {
        setSearch(value);
        const trimmed = value.trim();
        if (trimmed.length === 0) {
            loadParticipants("");
            return;
        }

        if (trimmed.length >= 1) {
            loadParticipants(trimmed);
        }
    };

    const handleToggleActive = async (participant: Participant) => {
        if (participant.is_active === null || participant.is_active === undefined) {
            return;
        }

        const nextValue = !participant.is_active;
        setIsSavingId(participant.id);
        setError("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/participants/${participant.id}/active`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": adminAuthHeader,
                    },
                    body: JSON.stringify({ is_active: nextValue }),
                }
            );

            const payload = await response.json();

            if (!response.ok) {
                setError(payload?.detail ?? "Mise a jour impossible.");
                setIsSavingId(null);
                return;
            }

            setParticipants((prev) =>
                prev.map((item) =>
                    item.id === participant.id
                        ? { ...item, is_active: payload.is_active }
                        : item
                )
            );
            setIsSavingId(null);
        } catch {
            setError("Erreur réseau. Veuillez réessayer.");
            setIsSavingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-900 font-sans">
            <main className="mx-auto flex w-full max-w-6xl flex-col items-center justify-start py-12 px-6 sm:py-20">
                <div className="w-full space-y-8">
                    <div className="space-y-3">
                        <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
                            Base de donnees des participants
                        </h1>
                        <p className="text-base text-zinc-600 dark:text-zinc-400 max-w-3xl">
                            Consultez, recherchez et activez ou desactivez les participants. Les invites desactives ne seront pas pris en compte lors du lancement de la session.
                        </p>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                            <label htmlFor="search" className="text-sm font-semibold text-black dark:text-white mb-2 block">
                                Rechercher un participant
                            </label>
                            <input
                                id="search"
                                type="text"
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Nom, prenom ou email"
                                className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div className="text-sm text-zinc-600 dark:text-zinc-400">
                            {participants.length} participant{participants.length > 1 ? "s" : ""}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-950 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                            <div className="col-span-4">Participant</div>
                            <div className="col-span-3">Entreprise</div>
                            <div className="col-span-3">Email</div>
                            <div className="col-span-2 text-right">Actif</div>
                        </div>

                        {isLoading ? (
                            <div className="p-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                                Chargement des participants...
                            </div>
                        ) : participants.length === 0 ? (
                            <div className="p-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                                Aucun participant trouve.
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {participants.map((participant) => (
                                    <div key={participant.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                                        <div className="col-span-4">
                                            <div className="text-sm font-semibold text-black dark:text-white">
                                                {participant.nom_complet || [participant.prenom, participant.nom].filter(Boolean).join(" ")}
                                            </div>
                                            <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                                {participant.profession || "Profession non renseignee"}
                                            </div>
                                        </div>
                                        <div className="col-span-3 text-sm text-zinc-600 dark:text-zinc-400">
                                            {participant.entreprise || "-"}
                                        </div>
                                        <div className="col-span-3 text-sm text-zinc-600 dark:text-zinc-400">
                                            {participant.email || "-"}
                                        </div>
                                        <div className="col-span-2 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleActive(participant)}
                                                disabled={participant.is_active === undefined || isSavingId === participant.id}
                                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${participant.is_active ? "bg-blue-600" : "bg-zinc-300 dark:bg-zinc-700"
                                                    } ${isSavingId === participant.id ? "opacity-60" : ""}`}
                                            >
                                                <span
                                                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${participant.is_active ? "translate-x-6" : "translate-x-1"
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function Home() {
    return (
        <AdminProtected>
            <ParticipantsContent />
        </AdminProtected>
    );
}