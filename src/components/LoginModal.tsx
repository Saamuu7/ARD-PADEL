import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Mail, User, Phone, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
    const { login, register } = useAuth();
    const [loading, setLoading] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [step, setStep] = useState<'email' | 'details'>('email');

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);

        const success = await login(email);
        if (success) {
            onClose();
        } else {
            setStep('details');
        }
        setLoading(false);
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await register({
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone: phone,
        });
        setLoading(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-[#0a0a0a] border-white/10 text-white p-0 overflow-hidden rounded-[2rem] shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/10 blur-[50px] pointer-events-none" />

                <div className="p-8 relative">
                    <DialogHeader className="mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 animate-float">
                                <ShieldCheck className="w-8 h-8 text-primary" />
                            </div>
                        </div>
                        <DialogTitle className="text-3xl font-black uppercase tracking-tighter text-center leading-none">
                            {step === 'email' ? 'Identifícate' : 'Crea tu Perfil'}
                        </DialogTitle>
                        <DialogDescription className="text-center text-white/40 uppercase tracking-[0.2em] text-[10px] font-bold mt-2">
                            {step === 'email' ? 'Acceso rápido a tu área de padel' : 'Únete a la élite de ARD Padel'}
                        </DialogDescription>
                    </DialogHeader>

                    {step === 'email' ? (
                        <form onSubmit={handleEmailSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-white/40 ml-1">Correo Electrónico</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="email"
                                        placeholder="jugador@ardpadel.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="input-sport pl-12"
                                    />
                                </div>
                            </div>
                            <Button disabled={loading} type="submit" className="w-full btn-primary-gradient py-7 uppercase font-black tracking-widest text-xs group">
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Entrar a la Pista
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>

                            <div className="flex items-center gap-4 py-2">
                                <div className="h-[1px] flex-1 bg-white/5" />
                                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Competición Oficial</span>
                                <div className="h-[1px] flex-1 bg-white/5" />
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-slide-up">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-white/40 ml-1">Nombre</Label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                                        <input
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            required
                                            placeholder="Nombre"
                                            className="input-sport pl-12 py-3 text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-white/40 ml-1">Apellidos</Label>
                                    <input
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                        placeholder="Apellidos"
                                        className="input-sport py-3 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-white/40 ml-1">Teléfono (WhatsApp)</Label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                        placeholder="+34 600 000 000"
                                        className="input-sport pl-12 py-3 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 mb-4">
                                <div className="flex items-center gap-3">
                                    <Sparkles className="w-4 h-4 text-primary shrink-0" />
                                    <p className="text-[9px] text-white/60 leading-relaxed uppercase tracking-wider font-medium">
                                        Al registrarte podrás inscribirte en torneos y recibir notificaciones de tus emparejamientos.
                                    </p>
                                </div>
                            </div>

                            <Button disabled={loading} type="submit" className="w-full btn-primary-gradient py-7 uppercase font-black tracking-widest text-xs group">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Finalizar Registro'}
                            </Button>

                            <Button
                                variant="ghost"
                                type="button"
                                onClick={() => setStep('email')}
                                className="w-full text-[9px] text-white/20 font-black uppercase tracking-[0.2em] hover:text-white transition-colors"
                            >
                                Volver al inicio
                            </Button>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default LoginModal;
