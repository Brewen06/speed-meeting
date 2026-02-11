'use client';

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { AdminProtected } from "@/lib/protected-routes";

function AdminContent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Page de l'organisateur
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Bienvenue sur votre interface d'organisation.
          </p>
          <div className="flex flex-col gap-3 mt-6">
            <a href="/interface-admin/parametrage" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              Accéder aux paramétrages de la session
            </a>
            <a href="/interface-admin/bd-invite" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
              Accéder à la base de données des participants
            </a>
            <a href="/" className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition">
              Retour à l'accueil
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <AdminProtected>
      <AdminContent />
    </AdminProtected>
  );
}