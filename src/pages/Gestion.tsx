import React, { useEffect } from 'react';
import { Settings, Users, Trophy } from 'lucide-react';
import Header from '@/components/Header';
import TournamentConfig from '@/components/TournamentConfig';
import RegistrationManager from '@/components/RegistrationManager';
import { useTournament } from '@/context/TournamentContext';

const Gestion: React.FC = () => {
    const { activeTournament: tournament, refreshTournaments } = useTournament();

    useEffect(() => {
        refreshTournaments();
    }, [refreshTournaments]);

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="font-display font-bold text-3xl text-foreground mb-2">
                        Panel de Gestión
                    </h1>
                    <p className="text-muted-foreground">
                        Configura y controla todos los aspectos del torneo
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Configuration */}
                    <div className="lg:col-span-2">
                        <TournamentConfig />
                        {tournament && <RegistrationManager />}
                    </div>

                    {/* Stats Sidebar */}
                    <div className="space-y-6">
                        {tournament && (
                            <>
                                {/* Registration Progress */}
                                <div className="tournament-card">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Users className="w-5 h-5 text-primary" />
                                        </div>
                                        <h3 className="font-display font-bold text-lg text-foreground uppercase tracking-tight">
                                            Inscripciones
                                        </h3>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-primary">{tournament.teams.length}</span>
                                        <span className="text-[10px] uppercase font-black tracking-widest text-white/30">Parejas registradas</span>
                                    </div>
                                </div>

                                {/* Tournament Stats */}
                                <div className="tournament-card">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Trophy className="w-5 h-5 text-primary" />
                                        <h3 className="font-display font-bold text-lg text-foreground">
                                            Estadísticas
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="stat-card">
                                            <p className="text-2xl font-bold text-primary">{tournament.teams.length}</p>
                                            <p className="text-xs text-muted-foreground">Parejas</p>
                                        </div>
                                        <div className="stat-card">
                                            <p className="text-2xl font-bold text-primary">{tournament.groups.length}</p>
                                            <p className="text-xs text-muted-foreground">Grupos</p>
                                        </div>
                                        <div className="stat-card">
                                            <p className="text-2xl font-bold text-primary">
                                                {tournament.groups.reduce((acc, g) => acc + g.matches.length, 0)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">Partidos Grupos</p>
                                        </div>
                                        <div className="stat-card">
                                            <p className="text-2xl font-bold text-primary">{tournament.bracket.length}</p>
                                            <p className="text-xs text-muted-foreground">Partidos Final</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Tips */}
                                <div className="tournament-card bg-primary/5 border border-primary/20">
                                    <h3 className="font-display font-bold text-foreground mb-3">
                                        💡 Consejos
                                    </h3>
                                    <ul className="text-sm text-muted-foreground space-y-2">
                                        <li>• Inscribe al menos {tournament.config.numberOfGroups * 2} parejas para generar grupos</li>
                                        <li>• Completa todos los partidos de grupo antes de generar el cuadro final</li>
                                        <li>• Los resultados se guardan automáticamente al confirmar</li>
                                    </ul>
                                </div>
                            </>
                        )}

                        {!tournament && (
                            <div className="tournament-card text-center">
                                <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                    Crea un torneo para comenzar a gestionar inscripciones y partidos.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Gestion;
