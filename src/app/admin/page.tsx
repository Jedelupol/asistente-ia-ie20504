'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Header from '@/components/Header';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, doc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { Users, Settings, Plus, Trash2, ShieldAlert, Loader2, Save } from 'lucide-react';

type AdminTab = 'teachers' | 'whitelist' | 'settings';

export default function AdminPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<AdminTab>('teachers');

    // Redirection Rule
    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/');
        }
    }, [user, authLoading, router]);

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                <p className="text-black font-medium animate-pulse">Verificando credenciales...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

            <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-8 flex items-center gap-3">
                    <ShieldAlert className="w-8 h-8 text-rose-600" />
                    <h1 className="text-3xl font-bold text-slate-900">Panel de Administrador</h1>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="md:w-64 shrink-0">
                        <nav className="flex flex-col gap-2">
                            <button
                                onClick={() => setActiveTab('teachers')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'teachers'
                                    ? 'bg-primary-600 text-black shadow-sm'
                                    : 'text-black hover:bg-white hover:text-primary-600'
                                    }`}
                            >
                                <Users className="w-5 h-5" />
                                Gestión de Docentes
                            </button>
                            <button
                                onClick={() => setActiveTab('whitelist')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'whitelist'
                                    ? 'bg-primary-600 text-black shadow-sm'
                                    : 'text-black hover:bg-white hover:text-primary-600'
                                    }`}
                            >
                                <ShieldAlert className="w-5 h-5" />
                                Autorizar Correos
                            </button>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'settings'
                                    ? 'bg-primary-600 text-black shadow-sm'
                                    : 'text-black hover:bg-white hover:text-primary-600'
                                    }`}
                            >
                                <Settings className="w-5 h-5" />
                                Personalización
                            </button>
                        </nav>
                    </div>

                    {/* Content Area */}
                    <div className="flex-grow bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                        {activeTab === 'teachers' && <TeacherManagement />}
                        {activeTab === 'whitelist' && <WhitelistManagement />}
                        {activeTab === 'settings' && <PlatformSettings />}
                    </div>
                </div>
            </main>
        </div>
    );
}

// Interfaces
interface TeacherData {
    id: string;
    email: string;
    displayName: string;
    role: string;
    isActive?: boolean;
}

function TeacherManagement() {
    const { user } = useAuth();
    const [teachers, setTeachers] = useState<TeacherData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const fetchTeachers = async () => {
        try {
            const q = query(collection(db, 'users'));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs
                .map(doc => ({ ...doc.data(), id: doc.id } as TeacherData))
                .filter((d) => d.role === 'teacher');
            setTeachers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setIsCreating(true);

        try {
            const token = await user?.getIdToken();
            const res = await fetch('/api/admin/create-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ email, password, displayName })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al crear usuario');

            setSuccessMsg('Docente creado con éxito.');
            setEmail('');
            setPassword('');
            setDisplayName('');
            fetchTeachers(); // Refresh list

        } catch (error: unknown) {
            const err = error as Error;
            setErrorMsg(err.message);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteUser = async (uid: string) => {
        if (!confirm('¿Estás seguro de eliminar este docente permanentemente?')) return;

        try {
            const token = await user?.getIdToken();
            const res = await fetch('/api/admin/delete-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ targetUid: uid })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            alert('Docente eliminado');
            fetchTeachers();
        } catch (error: unknown) {
            const err = error as Error;
            alert(err.message);
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-black">Docentes Registrados</h2>
                    <p className="text-black text-sm mt-1">Administra el acceso a la plataforma.</p>
                </div>
            </div>

            {/* Formulario de Creación */}
            <form onSubmit={handleCreateUser} className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8">
                <h3 className="text-sm font-bold text-black uppercase tracking-wide mb-4 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Registrar Nuevo Docente
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <input
                        type="text" required placeholder="Nombre Completo"
                        className="px-4 py-2 rounded-lg border border-slate-300 w-full focus:ring-2 focus:ring-primary-500 outline-none"
                        value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                    />
                    <input
                        type="email" required placeholder="Correo Electrónico"
                        className="px-4 py-2 rounded-lg border border-slate-300 w-full focus:ring-2 focus:ring-primary-500 outline-none"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password" required placeholder="Contraseña Temporal" minLength={6}
                        className="px-4 py-2 rounded-lg border border-slate-300 w-full focus:ring-2 focus:ring-primary-500 outline-none"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {errorMsg && <p className="text-rose-600 text-sm mb-3 font-medium">{errorMsg}</p>}
                {successMsg && <p className="text-orange-600 text-sm mb-3 font-medium">{successMsg}</p>}

                <div className="flex justify-end">
                    <button
                        type="submit" disabled={isCreating}
                        className="bg-accent-500 hover:bg-accent-600 text-black px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear Cuenta'}
                    </button>
                </div>
            </form>

            {/* Listado */}
            {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left bg-white">
                        <thead className="bg-slate-50 text-black text-sm">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Nombre del Docente</th>
                                <th className="px-6 py-4 font-semibold">Correo</th>
                                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {teachers.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-black">No hay docentes registrados aún.</td>
                                </tr>
                            ) : (
                                teachers.map(t => (
                                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-black">{t.displayName}</td>
                                        <td className="px-6 py-4 text-black">{t.email}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDeleteUser(t.id)}
                                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                title="Eliminar Docente"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// Subcomponent: Whitelist Management
function WhitelistManagement() {
    const [whitelist, setWhitelist] = useState<{ id: string, email: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [newEmail, setNewEmail] = useState('');
    const [adding, setAdding] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const fetchWhitelist = async () => {
        try {
            const q = query(collection(db, 'authorized_users'));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, email: doc.data().email }));
            setWhitelist(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWhitelist();
    }, []);

    const handleAddEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        if (!newEmail || !newEmail.includes('@')) {
            setErrorMsg('Ingresa un correo válido.');
            return;
        }

        setAdding(true);
        try {
            // Check if already exists
            const exists = whitelist.some(w => w.email.toLowerCase() === newEmail.toLowerCase());
            if (exists) {
                setErrorMsg('El correo ya está en la lista blanca.');
                setAdding(false);
                return;
            }

            // Generate a random ID or use email as ID. We'll use random for standard practice.
            await setDoc(doc(collection(db, 'authorized_users')), {
                email: newEmail.toLowerCase(),
                addedAt: new Date().toISOString()
            });

            setNewEmail('');
            fetchWhitelist();
        } catch (error: unknown) {
            const err = error as Error;
            setErrorMsg(err.message);
        } finally {
            setAdding(false);
        }
    };

    const handleRemoveEmail = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este correo de la lista blanca?')) return;
        try {
            await deleteDoc(doc(db, 'authorized_users', id));
            fetchWhitelist();
        } catch (error: unknown) {
            const err = error as Error;
            alert(err.message);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-xl font-bold text-black">Lista Blanca de Correos</h2>
                <p className="text-black text-sm mt-1">Solo los correos listados aquí podrán registrarse como docentes en el sistema.</p>
            </div>

            <form onSubmit={handleAddEmail} className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex-grow w-full">
                    <input
                        type="email" required placeholder="correo@institucion.edu.pe"
                        className="px-4 py-2 rounded-lg border border-slate-300 w-full focus:ring-2 focus:ring-primary-500 outline-none"
                        value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                    />
                    {errorMsg && <p className="text-rose-600 text-xs mt-2 font-medium">{errorMsg}</p>}
                </div>
                <button
                    type="submit" disabled={adding}
                    className="bg-primary-600 hover:bg-primary-700 text-black px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed shrink-0 flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                    {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Autorizar Correo</>}
                </button>
            </form>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left bg-white">
                    <thead className="bg-slate-50 text-black text-sm">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Correo Autorizado</th>
                            <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={2} className="px-6 py-8 text-center text-black"><Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" /></td>
                            </tr>
                        ) : whitelist.length === 0 ? (
                            <tr>
                                <td colSpan={2} className="px-6 py-8 text-center text-black">No hay correos en la lista blanca. Cualquier registro será bloqueado hasta que se añadan correos.</td>
                            </tr>
                        ) : (
                            whitelist.map(w => (
                                <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-black">{w.email}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleRemoveEmail(w.id)}
                                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                            title="Revocar Acceso"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Subcomponent: Platform Settings
function PlatformSettings() {
    const [institutionName, setInstitutionName] = useState('I.E. 20504 San Jerónimo de Pativilca');
    const [logoUrl, setLogoUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, 'settings', 'institution');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setInstitutionName(docSnap.data().institutionName || 'I.E. 20504 San Jerónimo de Pativilca');
                    setLogoUrl(docSnap.data().logoUrl || '');
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            await setDoc(doc(db, 'settings', 'institution'), {
                institutionName,
                logoUrl,
                updatedAt: new Date().toISOString()
            });
            setMessage('Configuración guardada exitosamente. Recarga la página para ver los cambios en el Header.');
        } catch (error) {
            console.error("Error saving settings:", error);
            setMessage('Error al guardar la configuración.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>;

    return (
        <div>
            <h2 className="text-xl font-bold text-black mb-6">Configuración Institucional</h2>
            <p className="text-black mb-8">Personaliza los datos visuales que aparecen en la cabecera de la aplicación.</p>

            <form onSubmit={handleSave} className="max-w-xl space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-black mb-2">Nombre de la Institución</label>
                    <input
                        type="text"
                        value={institutionName}
                        onChange={(e) => setInstitutionName(e.target.value)}
                        placeholder="Ej. I.E. 20504 San Jerónimo"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-black mb-2">URL del Escudo / Logo</label>
                    <input
                        type="text"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="https://ejemplo.com/logo.png o /insignia.png"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                    {logoUrl && (
                        <div className="mt-4 p-4 border border-slate-200 rounded-xl bg-slate-50 inline-block relative h-20 w-32">
                            <p className="text-xs text-black font-semibold mb-2 uppercase">Vista Previa:</p>
                            <Image src={logoUrl} alt="Logo Preview" fill className="object-contain" unoptimized onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/64')} />
                        </div>
                    )}
                </div>

                {message && (
                    <div className={`p-4 rounded-lg font-medium text-sm ${message.includes('Error') ? 'bg-rose-50 text-rose-700' : 'bg-orange-50 text-orange-700'}`}>
                        {message}
                    </div>
                )}

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-primary-600 hover:bg-primary-700 text-black px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Guardar Cambios
                    </button>
                </div>
            </form >
        </div >
    );
}
