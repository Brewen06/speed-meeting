"use client";

import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-900 font-sans">
      <main className="mx-auto flex w-full max-w-2xl flex-col items-center justify-start py-12 px-6 sm:py-20">
        <div className="w-full">
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white mb-2">
            Paramètrages de la session
          </h1>
          <p className="text-base text-zinc-600 dark:text-zinc-400 mb-8">
            Veuillez mettre ici les paramètrages de la session afin que l'IA
            détermine le nombre de personnes à placer sur une table en un tour.
          </p>

          <form className="space-y-6 bg-white dark:bg-zinc-950 rounded-lg shadow-md p-8 border border-zinc-200 dark:border-zinc-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label htmlFor="participantCount" className="text-sm font-semibold text-black dark:text-white mb-2">
                  Nombre de participants
                </label>
                <input id="participantCount" type="number" className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" required placeholder="Ex: 20" />
              </div>

              <div className="flex flex-col">
                <label htmlFor="tableCount" className="text-sm font-semibold text-black dark:text-white mb-2" >
                  Nombre de tables
                </label>
                <input id="tableCount" type="number" className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" required placeholder="Ex: 5" />
              </div>
            </div>

            <div className="flex flex-col">
              <label htmlFor="sessionDuration" className="text-sm font-semibold text-black dark:text-white mb-2" >
                Durée de la session (en minutes)
              </label>
              <input id="sessionDuration" type="number" className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" required placeholder="Ex: 60" />
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
              <p className="text-sm font-semibold text-black dark:text-white mb-4">
                Plan de la salle
              </p>
              <label htmlFor="roomPlan" className="flex flex-col items-center justify-center w-full px-6 py-8 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                <svg className="w-8 h-8 text-zinc-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Cliquez pour télécharger une image
                </span>
              </label>
              <input type="file" id="roomPlan" accept="image/*" className="hidden" required />

              <div id="imagePreview" className="mt-6 w-full">
                <Image id="uploadedImage" src="" alt="Plan de la salle" width={400} height={300} className="hidden w-full rounded-lg shadow-sm" />
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button type="submit" formAction="/interface-admin/analyse" className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-sm" >
                Analyser le plan
              </button>
              <button type="reset" className="flex-1 px-6 py-3 bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white font-semibold rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors" >
                Réinitialiser
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
