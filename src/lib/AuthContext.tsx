'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    onAuthStateChanged,
    User,
    signOut
} from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    role: string | null;
    loading: boolean;
    logout: () => Promise<void>;
    sessionConflict: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    loading: true,
    logout: async () => { },
    sessionConflict: false
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [sessionToken, setSessionToken] = useState<string | null>(null);
    const [sessionConflict, setSessionConflict] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // Handle Firebase Auth State Changes
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // Fetch user role from Firestore
                try {
                    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                    if (userDoc.exists()) {
                        setRole(userDoc.data().role || 'teacher');
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error);
                }

                setUser(currentUser);

                // Generate a unique token for this specific browser session
                const newToken = Math.random().toString(36).substring(2, 15);
                setSessionToken(newToken);

                // Write the new token to Firestore to claim the active session
                try {
                    await setDoc(doc(db, 'users', currentUser.uid), {
                        activeSessionToken: newToken,
                        lastLogin: new Date().toISOString()
                    }, { merge: true });
                } catch (error) {
                    console.error("Error setting session token:", error);
                }
            } else {
                setUser(null);
                setRole(null);
                setSessionToken(null);
                setSessionConflict(false);
            }

            setLoading(false);
        });

        return () => unsubscribeAuth();
    }, []);

    // Handle Firestore Single Session Listener
    useEffect(() => {
        if (!user || !sessionToken) return;

        // Listen to changes in the current user's document
        const unsubscribeSnapshot = onSnapshot(doc(db, 'users', user.uid), (docSnapshot) => {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();

                // If the token in DB DOES NOT MATCH our local token, another device logged in
                if (data.activeSessionToken && data.activeSessionToken !== sessionToken) {
                    console.warn("CRITICAL: Another device logged in with this account. Closing current session.");
                    setSessionConflict(true);
                    signOut(auth).then(() => {
                        // Let the warning show up before fully redirecting or handle strictly
                    });
                }
            }
        });

        return () => unsubscribeSnapshot();
    }, [user, sessionToken]);

    // Protect routes depending on auth state
    useEffect(() => {
        if (loading) return;

        // Protected routes configuration
        const isProtectedRoute = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin') || pathname?.startsWith('/welcome') || pathname?.startsWith('/copiloto');

        if (isProtectedRoute && !user && !sessionConflict) {
            router.push('/');
        } else if (user && pathname === '/' && !sessionConflict) {
            router.push('/welcome');
        }
    }, [user, loading, pathname, router, sessionConflict]);

    const logout = async () => {
        try {
            await signOut(auth);
            router.push('/');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, role, loading, logout, sessionConflict }}>
            {/* Optional: Render full page blocker if conflicted */}
            {sessionConflict && (
                <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-4">
                    <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl max-w-md w-full text-center shadow-lg">
                        <h3 className="text-xl font-bold mb-2">Sesión Cerrada</h3>
                        <p className="mb-4">
                            Su cuenta ha iniciado sesión en otro dispositivo. Por motivos de seguridad y control, la sesión anterior
                            se ha cerrado en este equipo.
                        </p>
                        <button
                            onClick={() => {
                                setSessionConflict(false);
                                router.push('/');
                            }}
                            className="w-full bg-red-600 hover:bg-red-700 text-black font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            Volver al Inicio
                        </button>
                    </div>
                </div>
            )}
            {children}
        </AuthContext.Provider>
    );
};
