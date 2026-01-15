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

    // Restore session from local storage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('ard_padel_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
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
            toast.success("Cuenta creada correctamente");
        } catch (error: any) {
            toast.error('Error al registrar usuario: ' + error.message);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('ard_padel_user');
        toast.info("Has cerrado sesión");
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
