
import React, { useEffect, useState } from 'react';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CookieConsent = () => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const checkConsent = () => {
            const stored = localStorage.getItem('ard_padel_cookie_consent');

            if (!stored) {
                setShow(true);
                return;
            }

            try {
                const { timestamp } = JSON.parse(stored);
                const now = new Date().getTime();
                const hoursPassed = (now - timestamp) / (1000 * 60 * 60);

                // If more than 24 hours have passed, show again
                if (hoursPassed > 24) {
                    setShow(true);
                }
            } catch (e) {
                // If parsing fails, reset and show
                setShow(true);
            }
        };

        // Small delay to make the entrance smoother
        const timer = setTimeout(checkConsent, 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleAccept = () => {
        const data = { timestamp: new Date().getTime() };
        localStorage.setItem('ard_padel_cookie_consent', JSON.stringify(data));
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 flex justify-center pointer-events-none">
            <div className="bg-[#020617]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl max-w-2xl w-full pointer-events-auto animate-slide-up flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">

                {/* Glow Effects */}
                <div className="absolute top-0 left-0 w-20 h-20 bg-primary/20 blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-accent/20 blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 shrink-0">
                    <Cookie className="w-8 h-8 text-primary animate-pulse-soft" />
                </div>

                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-white font-bold text-lg mb-2">Cookies & Experiencia</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Usamos cookies para asegurarnos de que tengas la mejor experiencia en nuestro torneo.
                        Son inofensivas, pero nos ayuda saber que estás aquí. 🍪
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                    <Button
                        variant="ghost"
                        onClick={handleAccept}
                        className="text-white/60 hover:text-red-400 hover:bg-red-500/10"
                    >
                        Rechazar
                    </Button>
                    <Button
                        onClick={handleAccept}
                        className="btn-primary-gradient font-bold uppercase tracking-wider"
                    >
                        Aceptar Todo
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
