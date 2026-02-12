"use client";

import Image from "next/image";
import { AdminProtected } from "@/lib/protected-routes";
import { API_BASE_URL } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function ParametrageContent() {
  const router = useRouter();
  const [tableCountLabel, setTableCountLabel] = useState("");
  const [sessionDurationLabel, setSessionDurationLabel] = useState("");
  const [timePerRound, setTimePerRound] = useState("10");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [existingParticipantCount, setExistingParticipantCount] = useState(0);
  const [activeParticipantCount, setActiveParticipantCount] = useState(0);
  const [isExistingCountLoading, setIsExistingCountLoading] = useState(true);
  const [hasExistingSession, setHasExistingSession] = useState(false);
  const [existingSessionSummary, setExistingSessionSummary] = useState<{
    total_participants?: number;
    total_rounds?: number;
  } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: "", message: "", onConfirm: () => { } });

  const adminAuthHeader = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }
    return sessionStorage.getItem("adminAuth") ?? "";
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadSuccess(false);
      setParticipantCount(0);
    }
  };

  useEffect(() => {
    const loadExistingParticipants = async () => {
      setIsExistingCountLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/participants`);
        const payload = await response.json();

        if (response.ok && Array.isArray(payload)) {
          setExistingParticipantCount(payload.length);
          setActiveParticipantCount(payload.filter((participant) => participant?.is_active).length);
        }
      } catch {
        // Ignorer les erreurs reseau, on garde 0 par defaut
      } finally {
        setIsExistingCountLoading(false);
      }
    };

    loadExistingParticipants();
  }, []);

  useEffect(() => {
    const savedResults = localStorage.getItem("sessionResults");
    if (!savedResults) {
      setHasExistingSession(false);
      setExistingSessionSummary(null);
      return;
    }

    try {
      const parsed = JSON.parse(savedResults);
      setHasExistingSession(true);
      setExistingSessionSummary({
        total_participants: parsed?.metadata?.total_participants,
        total_rounds: parsed?.metadata?.total_rounds,
      });
    } catch {
      setHasExistingSession(false);
      setExistingSessionSummary(null);
    }
  }, []);

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

      const response = await fetch(`${API_BASE_URL}/api/participants/upload`, {
        method: "POST",
        headers: {
          "Authorization": adminAuthHeader,
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
      setIsUploading(false);
    } catch {
      setError("Erreur réseau lors de l'upload. Veuillez réessayer.");
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadSuccess && existingParticipantCount === 0) {
      setError("Veuillez importer un fichier ou utiliser les participants déjà présents.");
      return;
    }

    // Confirmation si une session existe déjà
    if (hasExistingSession) {
      setConfirmModal({
        isOpen: true,
        title: "Créer une nouvelle session ?",
        message: "Une session existe déjà. Voulez-vous vraiment créer une nouvelle session ? Cela remplacera la session actuelle.",
        onConfirm: () => {
          setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: () => { } });
          proceedWithGeneration();
        },
      });
      return;
    }

    proceedWithGeneration();
  };

  const proceedWithGeneration = async () => {
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tableCountLabel: parseInt(tableCountLabel),
          sessionDurationLabel: parseInt(sessionDurationLabel),
          time_per_round: parseInt(timePerRound) || 0,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.detail ?? "Génération impossible.");
        setIsLoading(false);
        return;
      }

      // Sauvegarder les résultats de la session dans localStorage
      localStorage.setItem("sessionResults", JSON.stringify(payload));

      // Rediriger vers la page d'analyse après succès
      router.push("/interface-admin/analyse");
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-900 font-sans">
      <main className="mx-auto flex w-full max-w-2xl flex-col items-center justify-start py-12 px-6 sm:py-20">

        <div className="w-full">
          <a href="/interface-admin/" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Retour
          </a>
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white mb-2">
            Paramètrages de la session
          </h1>
          <p className="text-base text-zinc-600 dark:text-zinc-400 mb-8">
            Renseignez ici les paramètres de la session afin de permettre à l’intelligence artificielle de déterminer avec précision le nombre de participants à répartir à chaque table lors d’un tour.
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {hasExistingSession && (
            <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Une session existe deja. {existingSessionSummary?.total_participants ? `${existingSessionSummary.total_participants} participant(s)` : ""}{existingSessionSummary?.total_rounds ? `, ${existingSessionSummary.total_rounds} rotation(s)` : ""}.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/interface-admin/analyse")}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Revenir a la session
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmModal({
                      isOpen: true,
                      title: "Supprimer la session ?",
                      message: "Voulez-vous vraiment supprimer la session existante ? Cette action est irréversible.",
                      onConfirm: () => {
                        localStorage.removeItem("sessionResults");
                        setHasExistingSession(false);
                        setExistingSessionSummary(null);
                        setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: () => { } });
                      },
                    });
                  }}
                  className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white text-sm font-semibold rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                >
                  Creer une nouvelle session
                </button>
              </div>
            </div>
          )}

          {uploadSuccess && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400">
                ✓ {participantCount} participant{participantCount > 1 ? "s" : ""} importé{participantCount > 1 ? "s" : ""} avec succès !
              </p>
            </div>
          )}

          {!uploadSuccess && existingParticipantCount > 0 && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {activeParticipantCount} actif{activeParticipantCount > 1 ? "s" : ""} / {existingParticipantCount} total. Import optionnel.
              </p>
            </div>
          )}

          {/* Section d'import de fichier */}
          <div className="mb-6 bg-white dark:bg-zinc-950 rounded-lg shadow-md p-8 border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
              1. Importer la liste des participants
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Téléchargez un fichier Excel (.xlsx, .xls) ou CSV contenant les participants.
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

          <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-zinc-950 rounded-lg shadow-md p-8 border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
              2. Configurer la session
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label htmlFor="participantCountDisplay" className="text-sm font-semibold text-black dark:text-white mb-2">
                  Nombre de participants
                </label>
                <input
                  id="participantCountDisplay"
                  type="text"
                  className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white"
                  disabled
                  value={
                    uploadSuccess
                      ? `${participantCount} participant${participantCount > 1 ? "s" : ""}`
                      : isExistingCountLoading
                        ? "Chargement..."
                        : existingParticipantCount > 0
                          ? `${activeParticipantCount} actif${activeParticipantCount > 1 ? "s" : ""} / ${existingParticipantCount} total`
                          : "Importez d'abord un fichier"
                  }
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="tableCountLabel" className="text-sm font-semibold text-black dark:text-white mb-2" >
                  Nombre de tables
                </label>
                <input
                  id="tableCountLabel"
                  type="number"
                  className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  placeholder="Ex: 5"
                  value={tableCountLabel}
                  onChange={(e) => setTableCountLabel(e.target.value)}
                  min="1"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label htmlFor="sessionDurationLabel" className="text-sm font-semibold text-black dark:text-white mb-2" >
                Durée de la session (en minutes)
              </label>
              <input
                id="sessionDurationLabel"
                type="number"
                className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
                placeholder="Ex: 60"
                value={sessionDurationLabel}
                onChange={(e) => setSessionDurationLabel(e.target.value)}
                min="1"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="timePerRound" className="text-sm font-semibold text-black dark:text-white mb-2" >
                Temps par rotation (en minutes)
              </label>
              <input
                id="timePerRound"
                type="number"
                className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
                placeholder="Ex: 10"
                value={timePerRound}
                onChange={(e) => setTimePerRound(e.target.value)}
                min="1"
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                Durée de chaque rotation avant que les participants ne changent de table.
              </p>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors shadow-sm"
              >
                {isLoading ? "Génération en cours..." : "Générer la session"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTableCountLabel("");
                  setSessionDurationLabel("");
                  setTimePerRound("10");
                  setError("");
                  setSelectedFile(null);
                  setUploadSuccess(false);
                  setParticipantCount(0);
                  // Réinitialiser l'input file
                  const fileInput = document.getElementById("participantFile") as HTMLInputElement;
                  if (fileInput) fileInput.value = "";
                }}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white font-semibold rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Réinitialiser
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Modale de confirmation */}
      {confirmModal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: () => { } })}
          role="presentation"
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="presentation"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
              <h2 className="text-lg font-semibold text-black dark:text-white">
                {confirmModal.title}
              </h2>
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: () => { } })}
                className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {confirmModal.message}
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800 px-6 py-4">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: () => { } })}
                className="px-4 py-2 text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <AdminProtected>
      <ParametrageContent />
    </AdminProtected>
  );
}
