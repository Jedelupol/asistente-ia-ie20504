'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { BookOpen, LogIn, AlertCircle } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/welcome');
    } catch (err: unknown) {
      console.error(err);
      setError('Credenciales incorrectas o usuario no encontrado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">

        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-96 bg-primary-600 rounded-b-[100px] sm:rounded-b-[300px] shadow-lg -z-10"></div>
        <div className="absolute top-20 right-10 w-64 h-64 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -z-10 animate-blob"></div>
        <div className="absolute top-40 left-10 w-72 h-72 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -z-10 animate-blob animation-delay-2000"></div>

        <div className="w-full max-w-md">
          <div className="glass-panel rounded-2xl p-8 sm:p-10 text-center">

            <div className="mx-auto w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm rotate-3">
              <BookOpen className="w-8 h-8 text-primary-600 -rotate-3" />
            </div>

            <h2 className="text-2xl font-bold text-black mb-2">Portal Docente</h2>
            <p className="text-sm text-black mb-8">
              Ingresa tus credenciales para acceder a la gestión de lecturas y evaluaciones del CNEB.
            </p>

            <form onSubmit={handleLogin} className="space-y-5">

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2 text-left mb-4">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1 text-left">
                <label className="text-sm font-medium text-black block" htmlFor="email">
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-slate-900 bg-white"
                  placeholder="docente@ie20504.edu.pe"
                  required
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-sm font-medium text-black block" htmlFor="password">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-slate-900 bg-white"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full text-black font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg mt-4 ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
                  }`}
              >
                <LogIn className={`w-5 h-5 ${isLoading ? 'animate-pulse' : ''}`} />
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </form>

            <div className="mt-8 text-xs text-slate-400">
              <p>Sistema de Gestión Educativa</p>
              <p>Protégete: Recuerda cerrar tu sesión al finalizar.</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
