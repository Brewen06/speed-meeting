'use client'

import Image from "next/image";

export async function signup(formData: FormData) {
  const nom = formData.get('Nom de famille') as string
  const prenom = formData.get('Prénom') as string
  const motDePasse = formData.get('Mot de passe') as string
  console.log('Signup data:', { nom, prenom, motDePasse });
}


export default function Inscription() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Inscrivez-vous en tant qu'invité
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-sm">
            Créez votre compte invité pour participer au speed meeting.
          </p>
          <form className="flex flex-col gap-4 w-full max-w-sm">
            <input type="text" name="Nom de famille" placeholder="Nom de famille" className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" required />
            <input type="text" name="Prénom" placeholder="Prénom" className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" required />
            <input type="password" name="Mot de passe" placeholder="Mot de passe" className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" required />
            <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              S'inscrire
            </button>
          </form>
          <div className="flex flex-col gap-3 items-center sm:items-start">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Déjà inscrit ?{" "}
              <a href="/authentification/connexion" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                Se connecter
              </a>
            </p>
            <a href="/" className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition">
              Retour à l'accueil
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
