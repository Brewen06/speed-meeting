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

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        // Récupérer les données du participant depuis localStorage
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

        // Appeler l'API pour obtenir l'itinéraire
        const response = await fetch(
          `${API_BASE_URL}/api/participants/name/${encodeURIComponent(participantName)}/itinerary`
        );

        const payload = await response.json();

        if (!response.ok) {
          setError(payload?.detail ?? "Impossible de récupérer l'itinéraire.");
          setIsLoading(false);
          return;
        }

        setItinerary(payload);
        setIsLoading(false);
      } catch {
        setError("Erreur réseau. Veuillez réessayer.");
        setIsLoading(false);
      }
    };

    fetchItinerary();
  }, []);

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

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
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
