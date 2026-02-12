"use client";

import Image from "next/image";
import { AdminProtected } from "@/lib/protected-routes";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface TableInfo {
  table_id: number;
  table_name: string;
  members: string[];
}

interface RoundData {
  round: number;
  tables: TableInfo[];
}

interface SessionResults {
  session_id: number;
  metadata: {
    total_participants: number;
    total_rounds: number;
    participants_per_table: number;
    time_per_round_minutes?: number;
  };
  rounds: RoundData[];
  message: string;
}

function AnalyseContent() {
  const router = useRouter();
  const [sessionResults, setSessionResults] = useState<SessionResults | null>(null);
  const [error, setError] = useState("");
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);

  useEffect(() => {
    // Simuler une "analyse" pendant quelques secondes puis afficher les résultats
    const timer = setTimeout(() => {
      const savedResults = localStorage.getItem("sessionResults");

      if (!savedResults) {
        setError("Aucune session générée. Veuillez d'abord configurer une session.");
        return;
      }

      try {
        const results = JSON.parse(savedResults);
        setSessionResults(results);
      } catch {
        setError("Erreur lors de la lecture des résultats.");
      }
    },);

    return () => clearTimeout(timer);
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
          <div className="text-center space-y-6">
            <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
              Erreur
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-md">
              {error}
            </p>
            <button
              onClick={() => router.push("/interface-admin/parametrage")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Retour aux paramètres
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-900 font-sans">
      <main className="mx-auto flex w-full max-w-6xl flex-col items-center justify-start py-12 px-6 sm:py-20">
        <div className="w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white mb-2">
              Session générée avec succès !
            </h1>
            <p className="text-base text-zinc-600 dark:text-zinc-400">
              {sessionResults?.message}
            </p>
          </div>

          {/* Détails des rounds */}
          <div className="bg-white dark:bg-zinc-950 rounded-lg shadow-md p-8 border border-zinc-200 dark:border-zinc-800">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-black dark:text-white">
                Détails des rotations
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push("/interface-admin/parametrage")}
                  className="px-6 py-3 bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white font-semibold rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                >
                  Nouvelle session
                </button>
                <button
                  onClick={() => router.push("/interface-admin")}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Tableau de bord
                </button>
              </div>
            </div>
            {sessionResults?.rounds && sessionResults.rounds.length > 0 && (
              <div className="space-y-6">
                {/* Navigation avec numéros de rotation */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {sessionResults.rounds.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentRoundIndex(index)}
                      className={`w-10 h-10 rounded-lg font-semibold transition-all ${currentRoundIndex === index
                        ? "bg-blue-600 text-white shadow-md scale-110"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                {/* Affichage de la rotation actuelle */}
                <div className="border-2 border-blue-300 dark:border-blue-700 rounded-xl p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <h3 className="text-2xl font-bold text-center text-blue-700 dark:text-blue-300 mb-6">
                    Rotation {sessionResults.rounds[currentRoundIndex].round}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sessionResults.rounds[currentRoundIndex].tables.map((table) => (
                      <div
                        key={table.table_id}
                        className="bg-white dark:bg-zinc-950 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="font-bold text-lg text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
                          {table.table_name}
                        </div>
                        <ul className="text-sm text-zinc-700 dark:text-zinc-300 space-y-2">
                          {table.members.map((member, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="mr-2 text-blue-500">•</span>
                              <span>{member}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Boutons de navigation avec flèches */}
                <div className="flex items-center justify-between gap-4">
                  <button
                    onClick={() => setCurrentRoundIndex(Math.max(0, currentRoundIndex - 1))}
                    disabled={currentRoundIndex === 0}
                    className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Précédent
                  </button>

                  <div className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                    Rotation {currentRoundIndex + 1} / {sessionResults.rounds.length}
                  </div>

                  <button
                    onClick={() => setCurrentRoundIndex(Math.min(sessionResults.rounds.length - 1, currentRoundIndex + 1))}
                    disabled={currentRoundIndex === sessionResults.rounds.length - 1}
                    className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    Suivant
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push("/interface-admin/parametrage")}
              className="px-6 py-3 bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white font-semibold rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
            >
              Nouvelle session
            </button>
            <button
              onClick={() => router.push("/interface-admin")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Tableau de bord
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <AdminProtected>
      <AnalyseContent />
    </AdminProtected>
  );
}
