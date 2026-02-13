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
            Speed Meeting
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400 text-justify">
            <b>Contexte</b> : Dans le cadre d'un déjeuner d'affaires organisé par les Forces Françaises de l'Industrie (<b>FFI</b>), des professionnels de secteurs divers et variés se réunissent pour échanger et développer leur réseau et partager la richesse de leurs parcours. Cet événement favorise des rencontres qualitatives, propices à la découverte d’expertises, d’expériences et d’opportunités de collaboration.
            <br />
            <br />
            <b>L'objectif</b> : serait de 
            <b>L'intelligence artificielle</b> orchestre la disposition des participants afin d’optimiser la diversité des rencontres. Les invités sont répartis de manière aléatoire à chaque table et changent de place à l’issue de chaque session de speed meeting, garantissant ainsi des échanges dynamiques et renouvelés.
            <br />
            <br />
            <b className="text-red-500">Attention</b> : Afin de préserver la qualité et la variété des interactions, les participants ne rencontrent jamais deux fois la même personne. Il n’est donc pas requis que l’ensemble des invités se rencontre, l’accent étant mis sur la pertinence et la richesse des échanges.
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
