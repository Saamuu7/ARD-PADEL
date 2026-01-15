import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
    const { login, register } = useAuth();
    const [loading, setLoading] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [step, setStep] = useState<'email' | 'details'>('email');

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);

        // First try to login
        const success = await login(email);
        if (success) {
            onClose();
        } else {
            // If not success (user not found), go to details
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
        });
        setLoading(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-[#0a0a0a] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black uppercase tracking-tight text-center">
                        {step === 'email' ? 'Identifícate' : 'Completa tu Registro'}
                    </DialogTitle>
                    <DialogDescription className="text-center text-muted-foreground">
                        {step === 'email' ? 'Ingresa tu correo para acceder o registrarte.' : 'Te estás uniendo a ARD Padel.'}
                    </DialogDescription>
                </DialogHeader>

                {step === 'email' ? (
                    <form onSubmit={handleEmailSubmit} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Correo Electrónico</Label>
                            <Input
                                type="email"
                                placeholder="ejemplo@correo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <Button disabled={loading} type="submit" className="w-full btn-primary-gradient uppercase font-black tracking-widest">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continuar'}
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleRegisterSubmit} className="space-y-4 pt-4 animate-fade-in">
                        <div className="space-y-2">
                            <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Nombre</Label>
                            <Input
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Apellidos</Label>
                            <Input
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <Button disabled={loading} type="submit" className="w-full btn-primary-gradient uppercase font-black tracking-widest">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Registrarse'}
                        </Button>
                        <Button variant="ghost" type="button" onClick={() => setStep('email')} className="w-full text-xs text-muted-foreground hover:text-white">
                            Volver
                        </Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default LoginModal;
