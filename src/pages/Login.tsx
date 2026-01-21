import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Login: React.FC = () => {
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple authentication check
        if (password === 'admin') {
            const now = new Date().getTime();
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('organizador_last_access', now.toString());
            toast.success('Acceso autorizado 🔓');
            navigate('/organizador/panel-de-control');
        } else {
            toast.error('Código incorrecto 🚫');
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />

            <div className="w-full max-w-md animate-slide-up">
                <div className="tournament-card border-t border-white/10 shadow-2xl backdrop-blur-xl bg-card/80">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6 group-hover:scale-110 transition-transform duration-500">
                            <ShieldCheck className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="font-display font-black text-3xl text-foreground uppercase tracking-tighter mb-2">
                            Área Privada
                        </h1>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold opacity-60">
                            Solo Organizadores Autorizados
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 pl-1">
                                Código de Acceso
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-background/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                                    placeholder="••••••••"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full btn-primary-gradient py-6 font-black uppercase tracking-widest text-xs group"
                        >
                            Acceder al Panel
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-[10px] text-white/20 uppercase tracking-widest">
                            ARD Padel System v2.0
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
