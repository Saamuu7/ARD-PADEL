
import React from 'react';
import Header from '@/components/Header';
import { Scroll, CheckCircle, AlertCircle, Gavel } from 'lucide-react';

const Reglamento = () => {
    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 mb-8 border border-primary/20">
                        <Scroll className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="font-display font-black text-5xl md:text-6xl text-foreground uppercase tracking-tighter mb-4">
                        Reglamento <span className="text-primary">Oficial</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Normativa aplicable a todos los torneos y eventos organizados por ARD Padel.
                    </p>
                </div>

                <div className="space-y-12">

                    {/* Section 1: Tournament Format */}
                    <section className="bg-card border border-white/5 rounded-3xl p-8 md:p-12 shadow-xl">
                        <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
                            <Gavel className="w-8 h-8 text-accent" />
                            <h2 className="font-display font-bold text-3xl uppercase tracking-tight">Formato de Competición</h2>
                        </div>

                        <div className="space-y-6 text-muted-foreground leading-relaxed">
                            <div className="flex gap-4 items-start">
                                <CheckCircle className="w-6 h-6 text-primary shrink-0 mt-1" />
                                <div>
                                    <h3 className="text-foreground font-bold text-lg mb-2">Estructura del Torneo</h3>
                                    <p>El torneo se desarrollará en dos fases claramente diferenciadas:</p>
                                    <ul className="list-disc pl-5 mt-2 space-y-1 marker:text-primary/50">
                                        <li><strong className="text-white">Fase de Grupos:</strong> Sistema de liguilla ("round robin") donde todas las parejas del grupo juegan entre sí.</li>
                                        <li><strong className="text-white">Fase Eliminatoria:</strong> Cuadro final a eliminación directa (octavos, cuartos, semifinales y final) según la clasificación obtenida.</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start">
                                <CheckCircle className="w-6 h-6 text-primary shrink-0 mt-1" />
                                <div>
                                    <h3 className="text-foreground font-bold text-lg mb-2">Sistema de Puntuación</h3>
                                    <p>Todos los partidos, tanto en fase de grupos como en eliminatorias, se disputarán a <strong>un único set</strong> con <strong>punto de oro</strong>.</p>
                                    <div className="bg-white/5 border-l-4 border-accent p-4 mt-3 rounded-r-xl">
                                        <p className="font-bold text-white text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" /> Regla de Desempate (Tie-Break)
                                        </p>
                                        <p className="text-sm">
                                            En caso de empate a <strong>5 juegos (5-5)</strong>, se disputará un <strong>Tie-Break</strong> decisivo para determinar el ganador del set (7-6).
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: General Padel Rules */}
                    <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-8">
                            <Scroll className="w-8 h-8 text-primary/50" />
                            <h2 className="font-display font-bold text-2xl uppercase tracking-tight text-white/80">Normativa General de Pádel</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 text-sm text-muted-foreground/80">
                            <div>
                                <h4 className="font-bold text-white mb-2">Puntuación Estándar</h4>
                                <p>Se aplicará el sistema de puntuación oficial de la Federación Internacional de Pádel (FIP). Los juegos siguen la secuencia: 15, 30, 40 y Juego. En caso de "deuce" (40-40), se aplicará punto de oro si así lo determina la organización del evento específico, o ventaja tradicional por defecto.</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-2">Saque y Resto</h4>
                                <p>El saque debe realizarse por debajo de la cintura y cruzado. El restador debe esperar el bote de la pelota antes de golpearla. Cualquier invasión de campo o golpeo antirreglamentario será penalizado.</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-2">Comportamiento</h4>
                                <p>Se exige máxima deportividad. Insultos, lanzamiento de palas o conductas agresivas supondrán la descalificación inmediata de la pareja sin derecho a reembolso.</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-2">W.O. y Retrasos</h4>
                                <p>Existe un margen de cortesía de 10 minutos. Pasado este tiempo, si una pareja no se presenta, se dará el partido por perdido (6-0 / W.O.).</p>
                            </div>
                        </div>
                    </section>

                    <div className="text-center pt-8 border-t border-white/10">
                        <p className="text-xs text-muted-foreground uppercase tracking-widest">
                            La organización se reserva el derecho de modificar estas normas por causas de fuerza mayor o necesidades del torneo.
                        </p>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Reglamento;
