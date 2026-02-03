import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Paramètrages de la session
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Veuillez mettre ici les paramètrages de la session afin que l'IA détermine le nombre de personnes 
            à placer sur une table en un tour.
          </p>
            <form className="flex flex-col gap-4 mt-4 w-full max-w-md">
            <label className="flex flex-col gap-2">
              Combien y a-t-il de participants ?
              <input type="number" className="border border-zinc-300 rounded-md px-3 py-2 w-32" required/>
            </label>
            <label className="flex flex-col gap-2">
              Combien y a-t-il de tables ?
              <input type="number" className="border border-zinc-300 rounded-md px-3 py-2 w-32" required/>
            </label>
            <label className="flex flex-col gap-2">
              Quelle est la durée de la session du speed meeting (en minutes) ?
              <input type="number" className="border border-zinc-300 rounded-md px-3 py-2 w-32" required/>
            </label>
            <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Veuillez mettre ici le plan de la salle que l'IA devra analyser.
          </p>
          <input type="file" accept="image/*" className="mt-4" required/>

          <input type="submit" value="Analyser le plan de la salle" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer" formAction=""/>
         <input type="reset" value="Réinitialiser les champs" className="mt-2 bg-gray-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-gray-700"/>
            </form>
        </div>
      </main>
    </div>
  );
}