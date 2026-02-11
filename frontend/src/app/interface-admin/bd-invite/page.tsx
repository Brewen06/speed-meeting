"use client";

import Image from "next/image";
import { AdminProtected } from "@/lib/protected-routes";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function ParticipantsContent() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
                <div className="flex flex-col items-center gap-6 sm:items-start sm:text-left">
                    <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
                        Base de données des participants
                    </h1>
                    <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                        Cette section est en cours de développement. Veuillez revenir plus tard.
                    </p>
                </div>
            </main>
        </div>
    );
}