"use client";

import { ParticipantProtected } from "@/lib/protected-routes";
import { API_BASE_URL } from "@/lib/api";
import { useState, useEffect } from "react";

interface ItineraryItem {
  rotation: number;
  table: number;
  table_name: string;
}

interface ItineraryResponse {
  participant: string;
  total_rotations: number;
  itinerary: ItineraryItem[];
  itinerary_text: string;
}

function MesTables() {
  const [itinerary, setItinerary] = useState<ItineraryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    let isActive = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const updateState = (updater: () => void) => {
      if (!isActive) return;
      updater();
    };

    const fetchItinerary = async (participantName: string) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/participants/name/${encodeURIComponent(participantName)}/itinerary`
        );

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          const detail = payload?.detail ?? "";
          if (response.status === 404 && detail.includes("Aucune session")) {
            updateState(() => {
              setIsWaiting(true);
              setError("");
              setIsLoading(false);
            });
            return;
          }

          updateState(() => {
            setError(payload?.detail ?? "Impossible de récupérer l'itinéraire.");
            setIsLoading(false);
            setIsWaiting(false);
          });
          return;
        }

        updateState(() => {
          setItinerary(payload);
          setIsLoading(false);
          setIsWaiting(false);
          setError("");
        });
      } catch {
        updateState(() => {
          setError("Erreur réseau. Veuillez réessayer.");
          setIsLoading(false);
          setIsWaiting(false);
        });
      }
    };

    const startPolling = (participantName: string) => {
      fetchItinerary(participantName);
      intervalId = setInterval(() => fetchItinerary(participantName), 5000);
    };

    const init = () => {
      setIsLoading(true);
      setError("");
      setIsWaiting(false);

      const participantData = localStorage.getItem("participant");
      if (!participantData) {
        setError("Participant non trouvé. Veuillez vous reconnecter.");
        setIsLoading(false);
        return;
      }

      const participant = JSON.parse(participantData);
      const participantName = participant.nom_complet;

      if (!participantName) {
        setError("Nom du participant non disponible.");
        setIsLoading(false);
        return;
      }

      startPolling(participantName);
    };

    init();

    return () => {
      isActive = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [retryTick]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Chargement de votre itinéraire...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-start py-12 px-6 bg-white dark:bg-black">
        <div className="w-full">
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50 mb-2">
            Mes tables
          </h1>
          <p className="text-base text-zinc-600 dark:text-zinc-400 mb-8">
            Consultez vos tables assignées pour chaque rotation.
          </p>

          {isWaiting && !itinerary && !error && (
            <div className="mb-6 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                  <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    En attente du lancement de la session par l'organisateur...
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    La page se mettra a jour automatiquement.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <button
                type="button"
                onClick={() => setRetryTick((value) => value + 1)}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Reessayer
              </button>
            </div>
          )}

          {itinerary && !error && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-black dark:text-white mb-2">
                  Bonjour {itinerary.participant} !
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Vous avez <strong>{itinerary.total_rotations} rotation{itinerary.total_rotations > 1 ? "s" : ""}</strong> durant cette session.
                </p>
              </div>

              {itinerary.itinerary.length > 0 ? (
                <div className="grid gap-4">
                  {itinerary.itinerary.map((item) => (
                    <div
                      key={item.rotation}
                      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-black dark:text-white">
                            Rotation {item.rotation}
                          </h3>
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                            {item.table_name}
                          </p>
                        </div>
                        <div className="text-4xl font-bold text-zinc-200 dark:text-zinc-800">
                          {item.rotation}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-8 text-center">
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Aucune table assignée pour le moment.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <ParticipantProtected>
      <MesTables />
    </ParticipantProtected>
  );
}
