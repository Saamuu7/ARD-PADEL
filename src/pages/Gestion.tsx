import React, { useEffect, useState } from 'react';
import { Settings, Users, Trophy, ExternalLink, Archive, Plus } from 'lucide-react';
import Header from '@/components/Header';
import TournamentConfig from '@/components/TournamentConfig';
import { Button } from '@/components/ui/button';
import RegistrationManager from '@/components/RegistrationManager';
import { useTournament } from '@/context/TournamentContext';
import { Link } from 'react-router-dom';

const Gestion: React.FC = () => {
    const { activeTournament: tournament, tournaments, refreshTournaments, debugGenerateTeams, setActiveTournament } = useTournament();
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        refreshTournaments();
    }, [refreshTournaments]);

    const currentTime = Date.now();
    const oneHour = 60 * 60 * 1000;
    const archivedTournaments = tournaments.filter(t =>
        t.phase === 'finished' && t.finishedAt && (currentTime - t.finishedAt) >= oneHour
    );

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-8">
                <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="font-display font-black text-4xl text-foreground mb-2 uppercase tracking-tighter">
                            Panel de <span className="text-primary italic">Gestión</span>
                        </h1>
                        <p className="text-muted-foreground text-sm font-medium opacity-70 uppercase tracking-widest">
                            Configura y controla todos los aspectos de la competición
                        </p>
                    </div>

                    <button
                        onClick={() => { setIsCreating(true); setActiveTournament(null); }}
                        className={`px-8 py-4 rounded-2xl flex items-center gap-3 transition-all duration-500 group border h-[52px] ${isCreating ? 'bg-accent border-accent text-background shadow-xl shadow-accent/20' : 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 shadow-xl shadow-primary/5'}`}
                    >
                        <Plus className={`w-5 h-5 transition-transform duration-500 group-hover:rotate-90 ${isCreating ? 'text-background' : 'text-primary'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Nuevo Torneo</span>
                    </button>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Configuration */}
                    <div className="lg:col-span-2 space-y-8">
                        <TournamentConfig isCreating={isCreating} setIsCreating={setIsCreating} />
                        {tournament && !isCreating && <RegistrationManager />}
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

                        {archivedTournaments.length > 0 && (
                            <div className="tournament-card border-white/5 bg-white/[0.02]">
                                <div className="flex items-center gap-3 mb-4">
                                    <Archive className="w-5 h-5 text-white/30" />
                                    <h3 className="font-display font-bold text-lg text-white/60">
                                        Archivo Finalizados
                                    </h3>
                                </div>
                                <div className="space-y-3">
                                    {archivedTournaments.slice(0, 3).map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => setActiveTournament(t.id)}
                                            className="w-full text-left p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group"
                                        >
                                            <p className="text-xs font-bold text-white/60 group-hover:text-primary transition-colors">{t.config.name}</p>
                                            <p className="text-[9px] uppercase tracking-widest text-white/20 mt-1">{t.config.date}</p>
                                        </button>
                                    ))}
                                    <Link to="/organizador/dashboard" className="block text-center pt-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-accent transition-colors flex items-center justify-center gap-2">
                                            Ver todo el archivo <ExternalLink className="w-3 h-3" />
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        )}

                        {!tournament && (
                            <div className="tournament-card text-center">
                                <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                    Crea un torneo para comenzar a gestionar inscripciones y partidos.
                                </p>
                            </div>
                        )}

                        {tournament && tournament.phase === 'registration' && (
                            <div className="mt-8">
                                <button
                                    onClick={() => {
                                        if (confirm('¿Generar 16 parejas de prueba (8 de cada nivel)?')) {
                                            debugGenerateTeams();
                                        }
                                    }}
                                    className="w-full py-4 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-xl font-bold uppercase tracking-widest hover:bg-yellow-500/20 transition-colors text-xs"
                                >
                                    ⚠️ Generar Datos de Prueba
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Gestion;
