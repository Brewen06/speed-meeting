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
          src="/FFI.jpg"
          alt="FFI logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Speed Meeting
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400 text-justify">
            <b>Contexte</b>: Un repas d'affaires organisé par la FFI (<b>F</b>orces <b>F</b>rançaises de l'<b>I</b>ndustrie) réunit des professionnels de divers secteurs pour échanger et établir des contacts en partageant leur activité professionnelle et leur parcours.
            <br />
            <br />
            <b>Objectif</b>: Créer des relations entre les invités afin de parler de parcours professionnel, d'affaires et de projets communs.
            <br />
            <br />
            <b>Rôle de l'IA</b>: Gérer la disposition des participants à chaque table. Les invités sont assignés à des tables dans un ordre aléatoire et changent de table après chaque session du speed meeting.
            <br />
            <br />
            <b>Fonctionnement</b>: Chaque invité scanne un QR code pour accéder à son profil. L'IA utilise le plan de la salle et les paramétrages de la session (nombre de participants, nombre de tables, durée de la session) pour organiser les rencontres.
            <br />
            <br />
            <b className="text-red-500">Attention</b>: Les invités ne doivent pas rencontrer la même personne une seconde fois. Ainsi, il n'est pas obligatoire que toutes les personnes se rencontrent.
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
            Interface Invité
          </Link>
          <Link href="/interface-admin" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Interface Admin
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
