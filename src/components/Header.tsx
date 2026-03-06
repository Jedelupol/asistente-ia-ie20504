'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/lib/AuthContext';
import { LogOut, LayoutDashboard, ShieldCheck, Bot, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Header() {
    const { user, role, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const [institutionName, setInstitutionName] = useState('I.E. 20504 San Jerónimo de Pativilca');
    const [logoUrl, setLogoUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBranding = async () => {
            try {
                // Promise.race to enforce a 2-second timeout on the Firestore call
                const fetchPromise = getDoc(doc(db, 'settings', 'institution'));
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Firestore timeout')), 2000)
                );

                const docSnap = await Promise.race([fetchPromise, timeoutPromise]) as any;

                if (docSnap && docSnap.exists()) {
                    setInstitutionName(docSnap.data().institutionName || 'I.E. 20504 San Jerónimo de Pativilca');
                    setLogoUrl(docSnap.data().logoUrl || '');
                } else {
                    // Fallback to defaults if doc doesn't exist but call succeeded
                    setInstitutionName('I.E. 20504 San Jerónimo de Pativilca');
                    setLogoUrl('');
                }
            } catch (error) {
                // Hard fallback on error/timeout without cluttering console
                setInstitutionName('I.E. 20504 San Jerónimo de Pativilca');
                setLogoUrl('');
            } finally {
                setIsLoading(false);
            }
        };
        fetchBranding();
    }, []);

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    return (
        <header className="bg-primary-600 text-black shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo & Title */}
                    <div className="flex items-center gap-3">
                        {logoUrl && !logoUrl.toLowerCase().startsWith('c:\\') ? (
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0">
                                <Image src={logoUrl} alt="Logo" width={40} height={40} className="object-cover" />
                            </div>
                        ) : (
                            <div className="w-10 h-10 bg-primary-100/20 rounded-full flex items-center justify-center border border-primary-100/50 overflow-hidden shrink-0">
                                <span className="text-xs font-bold text-black">IE</span>
                            </div>
                        )}

                        <div className="flex flex-col justify-center">
                            <h1 className="text-lg sm:text-xl font-bold leading-tight tracking-tight">
                                {isLoading ? 'Cargando configuración institucional...' : institutionName}
                            </h1>
                            <span className="text-xs text-black hidden sm:block">
                                Plataforma de Control de Lecturas
                            </span>
                        </div>
                    </div>

                    {/* Nav Area */}
                    <nav className="flex items-center gap-4">
                        {user && (
                            <>
                                {/* NAVIGATION MENUS REMOVED AS REQUESTED */}

                                {pathname !== '/copiloto' && (
                                    <Link href="/copiloto" className="hidden sm:flex items-center gap-2 hover:bg-orange-600 px-3 py-2 rounded-lg transition-colors text-[10px] sm:text-sm font-extrabold bg-orange-500 text-black shadow-md border border-orange-400">
                                        <Bot className="w-5 h-5" />
                                        <span>COPILOTO IA</span>
                                    </Link>
                                )}
                                {pathname !== '/admin' && (
                                    <Link href="/admin" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 hover:bg-primary-700 px-3 py-2 rounded-lg transition-colors text-[10px] sm:text-sm font-extrabold bg-primary-600 text-white shadow-md border border-primary-500">
                                        <span className="text-xl leading-none">⚙️</span>
                                        <span>CONFIGURACIÓN</span>
                                    </Link>
                                )}
                                {pathname !== '/dashboard' && pathname !== '/' && (
                                    <Link href="/dashboard" className="hidden sm:flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium">
                                        <LayoutDashboard className="w-4 h-4" /> Inicio
                                    </Link>
                                )}
                                <div className="hidden sm:flex flex-col items-end px-3 py-1.5 border-l border-primary-500/50">
                                    <span className="text-sm text-black font-extrabold truncate max-w-[180px]">¡Bienvenido, Estimado Docente!</span>
                                    <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${role === 'admin' ? 'bg-rose-500 text-white' : 'bg-primary-500 text-black'}`}>
                                        [{role === 'admin' ? 'ADMIN' : 'DOCENTE'}]
                                    </span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    title="Cerrar Sesión"
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}
