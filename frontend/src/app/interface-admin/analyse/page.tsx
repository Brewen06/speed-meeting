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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Simuler une "analyse" pendant quelques secondes puis afficher les résultats
    const timer = setTimeout(() => {
      const savedResults = localStorage.getItem("sessionResults");

      if (!savedResults) {
        setError("Aucune session générée. Veuillez d'abord configurer une session.");
        setIsLoading(false);
        return;
      }

      try {
        const results = JSON.parse(savedResults);
        setSessionResults(results);
        setIsLoading(false);
      } catch {
        setError("Erreur lors de la lecture des résultats.");
        setIsLoading(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
          <div className="flex flex-col items-center gap-6 sm:items-start sm:text-left">
            <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
              Analyse de la session en cours
            </h1>

            <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Veuillez patientez pendant que l'IA analyse le plan de la salle et
              les paramétrages de la session ... <br></br>
              Elle détermine le nombre d'invités présents sur une seule table pendant quelques minutes.
              <div className="mt-8 flex flex-col items-center gap-4">
                <div className="flex gap-2">
                  <div
                    className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0s" }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Chargement en cours...
                </p>
              </div>
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
          <div className="text-center space-y-6">
            <div className="text-6xl">⚠️</div>
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

          {/* Métadonnées */}
          {sessionResults?.metadata && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-zinc-950 rounded-lg shadow-md p-6 border border-zinc-200 dark:border-zinc-800">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {sessionResults.metadata.total_participants}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  Participants
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-950 rounded-lg shadow-md p-6 border border-zinc-200 dark:border-zinc-800">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {sessionResults.metadata.total_rounds}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  Rotations
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-950 rounded-lg shadow-md p-6 border border-zinc-200 dark:border-zinc-800">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {sessionResults.metadata.participants_per_table}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  Par table
                </div>
              </div>
            </div>
          )}

          {/* Détails des rounds */}
          <div className="bg-white dark:bg-zinc-950 rounded-lg shadow-md p-8 border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
              Détails des rotations
            </h2>

            <div className="space-y-6">
              {sessionResults?.rounds.map((round) => (
                <div
                  key={round.round}
                  className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-zinc-50 dark:bg-zinc-900"
                >
                  <h3 className="text-xl font-semibold text-black dark:text-white mb-4">
                    Rotation {round.round}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {round.tables.map((table) => (
                      <div
                        key={table.table_id}
                        className="bg-white dark:bg-zinc-950 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800"
                      >
                        <div className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
                          {table.table_name}
                        </div>
                        <ul className="text-sm text-zinc-700 dark:text-zinc-300 space-y-1">
                          {table.members.map((member, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{member}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
