
import React from 'react';
import Header from '@/components/Header';
import { Shield, Lock, FileText, Mail } from 'lucide-react';

const Privacidad = () => {
    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 mb-8 border border-primary/20">
                        <Shield className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="font-display font-black text-5xl md:text-6xl text-foreground uppercase tracking-tighter mb-4">
                        Política de <span className="text-primary">Privacidad</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Transparencia y seguridad en el tratamiento de tus datos personales.
                    </p>
                </div>

                <div className="space-y-8 text-muted-foreground leading-relaxed">

                    <section className="bg-card border border-white/5 rounded-3xl p-8 shadow-xl">
                        <h2 className="flex items-center gap-3 font-display font-bold text-2xl text-foreground mb-4">
                            <FileText className="w-6 h-6 text-accent" />
                            1. Responsable del Tratamiento
                        </h2>
                        <p className="mb-4">
                            ARD PADEL gestiona este sitio web y es responsable del tratamiento de los datos personales que nos facilites. Nos comprometemos a proteger tu privacidad y cumplir con el Reglamento General de Protección de Datos (RGPD).
                        </p>
                    </section>

                    <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-8">
                        <h2 className="flex items-center gap-3 font-display font-bold text-2xl text-foreground mb-4">
                            <Lock className="w-6 h-6 text-primary" />
                            2. Datos que Recopilamos
                        </h2>
                        <p className="mb-4">
                            Para la gestión de los torneos, recopilamos los siguientes datos:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 marker:text-primary">
                            <li><strong>Datos de Identificación:</strong> Nombre, apellidos.</li>
                            <li><strong>Datos de Contacto:</strong> Correo electrónico, número de teléfono.</li>
                            <li><strong>Datos Deportivos:</strong> Nivel de juego, categoría, resultados de partidos.</li>
                        </ul>
                    </section>

                    <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-8">
                        <h2 className="font-display font-bold text-2xl text-foreground mb-4">
                            3. Finalidad del Tratamiento
                        </h2>
                        <p>
                            Utilizamos tus datos exclusivamente para:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-2 marker:text-primary">
                            <li>Gestionar tu inscripción y participación en los torneos.</li>
                            <li>Comunicar horarios, cruces y resultados.</li>
                            <li>Contactar en caso de cambios o incidencias (W.O., lluvia, etc.).</li>
                            <li>Publicar clasificaciones y cuadros de honor en la web y redes sociales.</li>
                        </ul>
                    </section>

                    <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-8">
                        <h2 className="font-display font-bold text-2xl text-foreground mb-4">
                            4. Tus Derechos
                        </h2>
                        <p className="mb-4">
                            Tienes derecho a acceder, rectificar, cancelar y oponerte al tratamiento de tus datos. Puedes ejercer estos derechos enviando un correo electrónico.
                        </p>
                        <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-xl text-primary font-bold">
                            <Mail className="w-5 h-5" />
                            <span>info@ardpadel.com</span>
                        </div>
                    </section>

                    <div className="text-center pt-8 border-t border-white/10 text-xs uppercase tracking-widest">
                        Última actualización: Enero 2026
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Privacidad;
