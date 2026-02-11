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
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
    const [editNomComplet, setEditNomComplet] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editProfession, setEditProfession] = useState("");
    const [editEntreprise, setEditEntreprise] = useState("");
    const [editEmailError, setEditEmailError] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [participantCount, setParticipantCount] = useState(0);
    const [participantUpdated, setParticipantUpdated] = useState(0);

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

    const handleDeleteParticipant = async (id: number) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce participant ?")) {
            return;
        }

        setIsSavingId(id);
        setError("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/participants/delete?participant_id=${id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization": adminAuthHeader,
                    },
                }
            );

            if (!response.ok) {
                const payload = await response.json();
                setError(payload?.detail ?? "Suppression impossible.");
                setIsSavingId(null);
                return;
            }

            setParticipants((prev) => prev.filter((p) => p.id !== id));
            setIsSavingId(null);
        } catch {
            setError("Erreur réseau. Veuillez réessayer.");
            setIsSavingId(null);
        }
    };

    const handleClear = async () => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer tous les participants ?")) {
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_BASE_URL}/api/participants/clear`, {
                method: "DELETE",
                headers: {
                    "Authorization": adminAuthHeader,
                },
            });

            const payload = await response.json();

            if (!response.ok) {
                setError(payload?.detail ?? "Suppression impossible.");
                setIsLoading(false);
                return;
            }

            setParticipants([]);
            setSearch("");
            setIsLoading(false);
        } catch {
            setError("Erreur réseau. Veuillez réessayer.");
            setIsLoading(false);
        }
    };

    const openEditModal = (participant: Participant) => {
        setEditingParticipant(participant);
        setEditNomComplet(participant.nom_complet ?? "");
        setEditEmail(participant.email ?? "");
        setEditProfession(participant.profession ?? "");
        setEditEntreprise(participant.entreprise ?? "");
        setEditEmailError("");
        setIsEditOpen(true);
    };

    const closeEditModal = () => {
        setIsEditOpen(false);
        setEditingParticipant(null);
    };

    const hasEdits = editingParticipant
        ? editNomComplet.trim() !== (editingParticipant.nom_complet ?? "")
        || editEmail.trim() !== (editingParticipant.email ?? "")
        || editProfession.trim() !== (editingParticipant.profession ?? "")
        || editEntreprise.trim() !== (editingParticipant.entreprise ?? "")
        : false;

    const validateEmail = (value: string) => {
        if (!value.trim()) {
            return "";
        }
        return /.+@.+\..+/.test(value) ? "" : "Email invalide.";
    };

    const saveParticipantEdit = async () => {
        if (!editingParticipant) {
            return;
        }

        const trimmedNom = editNomComplet.trim();
        if (trimmedNom.length === 0) {
            setError("Le nom complet ne peut pas etre vide.");
            return;
        }

        const emailError = validateEmail(editEmail);
        if (emailError) {
            setEditEmailError(emailError);
            return;
        }
        setEditEmailError("");

        setIsSavingId(editingParticipant.id);
        setError("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/participants/${editingParticipant.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": adminAuthHeader,
                    },
                    body: JSON.stringify({
                        nom_complet: trimmedNom,
                        email: editEmail.trim(),
                        profession: editProfession.trim(),
                        entreprise: editEntreprise.trim(),
                    }),
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
                    item.id === editingParticipant.id ? payload : item
                )
            );
            setIsSavingId(null);
            closeEditModal();
        } catch {
            setError("Erreur réseau. Veuillez réessayer.");
            setIsSavingId(null);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setUploadSuccess(false);
            setParticipantCount(0);
            setParticipantUpdated(0);
        }
    };
    const handleFileUpload = async () => {
        if (!selectedFile) {
            setError("Veuillez sélectionner un fichier.");
            return;
        }

        setError("");
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);

            // Récupérer le token admin depuis localStorage
            const token = localStorage.getItem("token");
            const credentials = btoa("admin:5Pid6M3f!nG"); // Base64 encode

            const response = await fetch(`${API_BASE_URL}/api/participants/upload`, {
                method: "POST",
                headers: {
                    "Authorization": `Basic ${credentials}`,
                },
                body: formData,
            });

            const payload = await response.json();

            if (!response.ok) {
                setError(payload?.detail ?? "Upload impossible.");
                setIsUploading(false);
                return;
            }

            setUploadSuccess(true);
            setParticipantCount(payload.participants_added || 0);
            setParticipantUpdated(payload.participants_updated || 0);
            setIsUploading(false);

            // Recharger automatiquement la liste des participants
            await loadParticipants("");
        } catch {
            setError("Erreur réseau lors de l'upload. Veuillez réessayer.");
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-900 font-sans">
            <main className="mx-auto flex w-full max-w-7xl flex-col items-center justify-start py-12 px-6 sm:py-20">
                <div className="w-full space-y-8">
                    <div>
                        <a href="/interface-admin/" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                            Retour
                        </a>
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
                            Consultation des participants
                        </h1>
                        <p className="text-base text-zinc-600 dark:text-zinc-400 max-w-3xl">
                            Consultez, recherchez et activez ou desactivez les participants. Les invites desactives ne seront pas pris en compte lors du lancement de la session. Vous pouvez egalement supprimer ou modifier des participants ou vider la liste complete.
                        </p>
                    </div>
                    <div className="mb-6 bg-white dark:bg-zinc-950 rounded-lg shadow-md p-8 border border-zinc-200 dark:border-zinc-800">
                        <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
                            Importer une liste contenant des participants
                        </h2>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                            Importez un fichier Excel (.xlsx, .xls) ou CSV contenant les participants.
                        </p>

                        <div className="space-y-4">
                            <div className="flex flex-col">
                                <label htmlFor="participantFile" className="text-sm font-semibold text-black dark:text-white mb-2">
                                    Fichier de participants
                                </label>
                                <input
                                    id="participantFile"
                                    type="file"
                                    accept=".xlsx, .csv, .xls"
                                    onChange={handleFileChange}
                                    className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-400"
                                    disabled={isUploading || isLoading}
                                />
                            </div>

                            {selectedFile && (
                                <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                                    <span className="text-sm text-zinc-700 dark:text-zinc-300">
                                        📄 {selectedFile.name}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleFileUpload}
                                        disabled={isUploading || uploadSuccess}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
                                    >
                                        {isUploading ? "Importation..." : uploadSuccess ? "✓ Importé" : "Importer"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    {uploadSuccess && (participantCount > 0 || participantUpdated > 0) && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <p className="text-sm text-green-600 dark:text-green-400">
                                ✓ Import réussi : {participantCount} participant{participantCount > 1 ? 's ajoutés' : ' ajouté'}
                                {participantUpdated > 0 && `, ${participantUpdated} mis à jour`}
                            </p>
                        </div>
                    )}
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
                        <button
                            onClick={handleClear}
                            className="ml-4 inline-flex items-center rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Réinitialiser
                        </button>
                    </div>

                    <div className="bg-white dark:bg-zinc-950 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                        <div className="grid grid-cols-15 gap-4 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                            <div className="col-span-4">Participant</div>
                            <div className="col-span-3">Entreprise</div>
                            <div className="col-span-3">Email</div>
                            <div className="col-span-2 text-center">Actif</div>
                            <div className="col-span-3 text-center">Actions</div>
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
                                    <div key={participant.id} className="grid grid-cols-15 gap-4 px-6 py-4 items-center">
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
                                        <div className="col-span-2 flex justify-center">
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
                                        <div className="col-span-3 flex justify-center gap-3">
                                            <button
                                                onClick={() => {
                                                    handleDeleteParticipant(participant.id);
                                                }}
                                                className="inline-flex items-center rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                            >
                                                Supprimer
                                            </button>
                                            <button
                                                onClick={() => {
                                                    openEditModal(participant);
                                                }}
                                                className="inline-flex items-center rounded-lg bg-zinc-900 px-5 py-2 text-sm font-semibold text-white hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-white"
                                            >
                                                Modifier
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                {isEditOpen && editingParticipant && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                        onClick={closeEditModal}
                        role="presentation"
                    >
                        <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl">
                            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-black dark:text-white">
                                        Modifier un participant
                                    </h2>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                        ID #{editingParticipant.id}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="px-6 py-5 space-y-4" onClick={(event) => event.stopPropagation()} role="presentation">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-black dark:text-white">
                                        Nom complet
                                    </label>
                                    <input
                                        type="text"
                                        value={editNomComplet}
                                        onChange={(e) => setEditNomComplet(e.target.value)}
                                        className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-white"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-black dark:text-white">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={editEmail}
                                            onChange={(e) => {
                                                setEditEmail(e.target.value);
                                                setEditEmailError(validateEmail(e.target.value));
                                            }}
                                            className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-white ${editEmailError
                                                ? "border-red-400 focus:ring-2 focus:ring-red-500"
                                                : "border-zinc-300 dark:border-zinc-700"
                                                }`}
                                        />
                                        {editEmailError && (
                                            <p className="text-xs text-red-500">{editEmailError}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-black dark:text-white">
                                            Profession
                                        </label>
                                        <input
                                            type="text"
                                            value={editProfession}
                                            onChange={(e) => setEditProfession(e.target.value)}
                                            className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-white"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-black dark:text-white">
                                        Entreprise
                                    </label>
                                    <input
                                        type="text"
                                        value={editEntreprise}
                                        onChange={(e) => setEditEntreprise(e.target.value)}
                                        className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800 px-6 py-4" onClick={(event) => event.stopPropagation()} role="presentation">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="px-4 py-2 text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    onClick={saveParticipantEdit}
                                    disabled={isSavingId === editingParticipant.id || !hasEdits || !!editEmailError}
                                    className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold"
                                >
                                    {isSavingId === editingParticipant.id ? "Enregistrement..." : "Enregistrer"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
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