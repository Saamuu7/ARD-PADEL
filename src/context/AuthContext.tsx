import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string) => Promise<boolean>;
    register: (userData: Omit<User, 'id'>) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Restore session and handle 24h expiration from local storage on mount
    useEffect(() => {
        const checkSession = () => {
            const storedUser = localStorage.getItem('ard_padel_user');
            const lastAccess = localStorage.getItem('ard_padel_last_access');

            if (storedUser && lastAccess) {
                const now = new Date().getTime();
                const lastTime = parseInt(lastAccess);
                const twentyFourHours = 24 * 60 * 60 * 1000;

                if (now - lastTime > twentyFourHours) {
                    // Session expired
                    localStorage.removeItem('ard_padel_user');
                    localStorage.removeItem('ard_padel_last_access');
                    setUser(null);
                    toast.info("Sesión cerrada por inactividad (24h)");
                } else {
                    // Session valid, update last access
                    setUser(JSON.parse(storedUser));
                    localStorage.setItem('ard_padel_last_access', now.toString());
                }
            } else if (storedUser && !lastAccess) {
                // Migration: if user exists but no timestamp, set one now
                setUser(JSON.parse(storedUser));
                localStorage.setItem('ard_padel_last_access', new Date().getTime().toString());
            }
            setLoading(false);
        };

        checkSession();
    }, []);

    const login = async (email: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (error || !data) {
                return false;
            }

            setUser(data);
            localStorage.setItem('ard_padel_user', JSON.stringify(data));
            localStorage.setItem('ard_padel_last_access', new Date().getTime().toString());
            toast.success(`Bienvenido de nuevo, ${data.first_name}`);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    const register = async (userData: Omit<User, 'id'>) => {
        try {
            // Check if exists first
            const { data: existing } = await supabase
                .from('users')
                .select('*')
                .eq('email', userData.email)
                .single();

            if (existing) {
                // Just log them in if they exist, maybe update details?
                setUser(existing);
                localStorage.setItem('ard_padel_user', JSON.stringify(existing));
                toast.success(`Cuenta recuperada. Bienvenido ${existing.first_name}`);
                return;
            }

            const { data, error } = await supabase
                .from('users')
                .insert(userData)
                .select()
                .single();

            if (error) throw error;

            setUser(data);
            localStorage.setItem('ard_padel_user', JSON.stringify(data));
            localStorage.setItem('ard_padel_last_access', new Date().getTime().toString());
            toast.success("Cuenta creada correctamente");
        } catch (error: any) {
            toast.error('Error al registrar usuario: ' + error.message);
        }
    };

    const updateUser = async (updates: Partial<User>) => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('users')
                .update(updates)
                .eq('id', user.id)
                .select()
                .single();

            if (error) throw error;

            setUser(data);
            localStorage.setItem('ard_padel_user', JSON.stringify(data));
        } catch (error: any) {
            toast.error('Error al actualizar perfil: ' + error.message);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('ard_padel_user');
        localStorage.removeItem('ard_padel_last_access');
        toast.info("Has cerrado sesión");
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
