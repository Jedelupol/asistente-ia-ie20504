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

            {/* Botón Central de Continuar (Zona Segura Inferior) */}
            <Link
                href="/copiloto"
                className="absolute bottom-32 left-1/2 -translate-x-1/2 flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white text-white font-bold rounded-xl hover:bg-white/20 transition-all shadow-xl z-10 whitespace-nowrap"
            >
                CONTINUAR AL ASISTENTE
            </Link>
        </main>
    );
}
