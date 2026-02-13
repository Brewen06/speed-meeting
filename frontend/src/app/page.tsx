'use client';

import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/LIF-bleu.jpg"
          alt="LIF logo"
          width={100}
          height={100}
          priority
        />
        <div className="flex flex-col items-center gap-6 sm:items-start ">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50 text-center">
            Speed Meeting Business
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400 text-justify">
            <b>Contexte</b> : Cet outil est conçu pour générer des rotations de tables lors d’un speed meeting business. La FFI (Forces Françaises de l’Industrie), société spécialisée dans l’organisation d’événements, organise des repas en club où les invités sont amenés à échanger autour des tables. 
            <br />
            <br />
            <b>Objectif</b> : L’outil permet aux organisateurs de générer rapidement un plan d’attribution des rotations pour chaque participant. Il suffit de fournir un fichier Excel : l’intelligence artificielle se charge du reste.
            <br />
            <br />
            <b>Remarque</b> : Ce n'est pas obligatoire que tous les participants se rencontrent.
          </p>
        </div>
        <ClientOnly />
      </main>
    </div>
  );
}

function ClientOnly() {
  'use client';
  
  const { isConnected, isAdmin } = useAuthState();

  return (
    <div className="mt-10 flex gap-4">
      {isConnected && !isAdmin && (
        <Link href="/interface-invite" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
          Interface Invité
        </Link>
      )}
      {isAdmin && (
        <>
          <Link href="/interface-invite" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
            Interface invité
          </Link>
          <Link href="/interface-admin" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Interface admin
          </Link>
        </>
      )}
    </div>
  );
}

function useAuthState() {
  const [isConnected, setIsConnected] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      setIsConnected(!!token);
      setIsAdmin(role === "admin");
    } catch {
      setIsConnected(false);
      setIsAdmin(false);
    }
  }, []);

  return { isConnected, isAdmin };
}