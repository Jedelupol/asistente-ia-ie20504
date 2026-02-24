'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Bot, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function WelcomePage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <main
            className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/fondo-aula.jpg')" }}
        >
            {/* Botón de Cerrar Sesión en la esquina */}
            <button
                onClick={logout}
                className="absolute top-5 right-5 bg-black/40 hover:bg-black/60 px-3 py-1 rounded-lg text-xs text-white transition-colors z-10 border border-white/20"
                title="Cerrar Sesión"
            >
                Cerrar Sesión
            </button>

            {/* Botón Central e Instrucción (Zona Segura Inferior) */}
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6 w-full px-4">

                <Link
                    href="/copiloto"
                    className="flex items-center justify-center px-10 py-4 bg-orange-600/90 hover:bg-orange-500 backdrop-blur-md border-2 border-orange-400/50 text-white font-black rounded-xl transition-all shadow-xl shadow-orange-900/50 whitespace-nowrap text-lg tracking-wider"
                >
                    COMENZAR MISIÓN PEDAGÓGICA
                </Link>
            </div>
        </main>
    );
}
