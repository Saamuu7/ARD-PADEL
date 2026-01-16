
import React from 'react';
import Header from '@/components/Header';
import { Cookie, Settings, ShieldCheck, Info } from 'lucide-react';

const Cookies = () => {
    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 mb-8 border border-primary/20">
                        <Cookie className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="font-display font-black text-5xl md:text-6xl text-foreground uppercase tracking-tighter mb-4">
                        Política de <span className="text-primary">Cookies</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Información sobre uso de cookies y tecnologías similares.
                    </p>
                </div>

                <div className="space-y-8 text-muted-foreground leading-relaxed">

                    <section className="bg-card border border-white/5 rounded-3xl p-8 shadow-xl">
                        <h2 className="flex items-center gap-3 font-display font-bold text-2xl text-foreground mb-4">
                            <Info className="w-6 h-6 text-accent" />
                            ¿Qué son las cookies?
                        </h2>
                        <p className="mb-4">
                            Las cookies son pequeños archivos de texto que los sitios web almacenan en tu dispositivo para mejorar la experiencia de usuario, recordar preferencias y analizar el tráfico.
                        </p>
                    </section>

                    <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-8">
                        <h2 className="flex items-center gap-3 font-display font-bold text-2xl text-foreground mb-4">
                            <Settings className="w-6 h-6 text-primary" />
                            Tipos de Cookies que utilizamos
                        </h2>
                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-xl">
                                <h3 className="font-bold text-white mb-1">Cookies Técnicas (Esenciales)</h3>
                                <p className="text-sm">Necesarias para el funcionamiento de la web, como mantener tu sesión iniciada o gestionar tu inscripción al torneo. No se pueden desactivar.</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl">
                                <h3 className="font-bold text-white mb-1">Cookies de Análisis</h3>
                                <p className="text-sm">Nos ayudan a entender cómo interactúan los usuarios con la web para mejorar nuestros servicios. Estos datos son anónimos.</p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-8">
                        <h2 className="flex items-center gap-3 font-display font-bold text-2xl text-foreground mb-4">
                            <ShieldCheck className="w-6 h-6 text-white" />
                            Gestión de Cookies
                        </h2>
                        <p className="mb-4">
                            Puedes permitir, bloquear o eliminar las cookies instaladas en tu equipo mediante la configuración de las opciones de tu navegador de internet.
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-sm">
                            <li>Google Chrome</li>
                            <li>Mozilla Firefox</li>
                            <li>Safari</li>
                            <li>Microsoft Edge</li>
                        </ul>
                    </section>

                    <div className="text-center pt-8 border-t border-white/10 text-xs uppercase tracking-widest">
                        ARD PADEL - Política de Cookies 2026
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Cookies;
