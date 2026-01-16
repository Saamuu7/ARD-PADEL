import React, { useState } from 'react';
import Header from '@/components/Header';
import { useTournament } from '@/context/TournamentContext';
import { useAuth } from '@/context/AuthContext';
import { Grid3X3, GitBranch, AlertCircle, Calendar, Trophy, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GroupTable from '@/components/GroupTable';
import MatchCard from '@/components/MatchCard';
import Bracket from '@/components/Bracket';
import { Link } from 'react-router-dom';

type Tab = 'grupos' | 'cuadro';

const TorneoActivo: React.FC = () => {
    const { activeTournament: tournament, getTeamById } = useTournament();
    const [activeTab, setActiveTab] = useState<Tab>('grupos');

    // If no active tournament or it's just in registration phase (and no groups generated)
    if (!tournament) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-4 py-20 text-center">
                    <div className="max-w-md mx-auto tournament-card border-dashed border-white/10 p-12">
                        <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
                        <h2 className="font-display font-bold text-2xl text-foreground mb-4">
                            No hay competiciones activas
                        </h2>
                        <p className="text-muted-foreground">
                            Actualmente no hay ningún torneo en fase de juego.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const { user } = useAuth();
    const isAdmin = sessionStorage.getItem('isAuthenticated') === 'true';

    // Check if user is part of the tournament
    const isParticipant = user && tournament?.teams.some(t =>
        String(t.player1Id) === String(user.id) ||
        String(t.player2Id) === String(user.id)
    );

    // Only participants or admins have access to see internal data
    const hasAccess = isParticipant || isAdmin;

    // 1. If not participant (and not admin), show restricted access
    if (!isParticipant && !isAdmin) {
        return (
            <div className="min-h-screen bg-background text-center">
                <Header />
                <div className="container mx-auto px-4 py-20">
                    <div className="max-w-md mx-auto py-20 animate-fade-in">
                        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-10 border border-white/10">
                            <Trophy className="w-10 h-10 text-white/20" />
                        </div>
                        <h2 className="font-display font-black text-4xl text-foreground mb-4 uppercase tracking-tighter">
                            Acceso Privado
                        </h2>
                        <p className="text-muted-foreground text-lg uppercase tracking-widest font-bold opacity-60">
                            No estás inscrito en ningún torneo
                        </p>
                        <div className="mt-12 h-px w-20 bg-primary/20 mx-auto" />
                    </div>
                </div>
            </div>
        );
    }

    // 2. If participant, check if we are in registration phase
    if (tournament.phase === 'registration' && isParticipant) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-4 py-20 text-center">
                    <div className="max-w-md mx-auto tournament-card p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                            <Calendar className="w-32 h-32 text-primary" />
                        </div>
                        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
                            <Calendar className="w-10 h-10 text-primary" />
                        </div>
                        <h2 className="font-display font-black text-3xl text-foreground mb-4 uppercase tracking-tight">
                            ¡Inscripción Confirmada!
                        </h2>
                        <p className="text-emerald-400 mb-6 font-bold uppercase tracking-widest text-[10px]">
                            Ya estás dentro de "{tournament.config.name}"
                        </p>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                            Tu plaza está asegurada. Estamos organizando los enfrentamientos y publicaremos los grupos próximamente.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // 3. Fallback for Admins looking at registration
    if (!isParticipant && isAdmin && tournament.phase === 'registration') {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-4 py-20 text-center">
                    <div className="max-w-md mx-auto py-20">
                        <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-10 border border-primary/10">
                            <Settings className="w-10 h-10 text-primary" />
                        </div>
                        <h2 className="font-display font-black text-4xl text-foreground mb-4 uppercase tracking-tighter">
                            Fase de Inscripción
                        </h2>
                        <p className="text-muted-foreground text-sm uppercase tracking-[0.2em] font-bold">
                            Estás viendo esta página como Administrador
                        </p>
                        <p className="mt-4 text-white/40 text-xs">
                            Los jugadores verán aquí sus grupos una vez los generes.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-8">
                {/* Title Section */}
                <div className="mb-8 text-center md:text-left">
                    <h1 className="font-display font-black text-4xl sm:text-5xl text-foreground mb-2 uppercase tracking-tighter">
                        {tournament.config.name}
                    </h1>
                    <p className="text-xs uppercase font-black tracking-[0.3em] text-primary">
                        Competición en curso - {tournament.phase === 'groups' ? 'Fase de Grupos' : 'Fase Final'}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center md:justify-start gap-4 mb-12 border-b border-white/5 pb-1">
                    <button
                        onClick={() => setActiveTab('grupos')}
                        className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all duration-300 ${activeTab === 'grupos'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-white/40 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Grid3X3 className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Grupos</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('cuadro')}
                        className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all duration-300 ${activeTab === 'cuadro'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-white/40 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <GitBranch className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Cuadro Final</span>
                    </button>
                </div>

                {/* Content */}
                <div className="animate-slide-up">
                    {activeTab === 'grupos' ? (
                        <>
                            {tournament.groups.length === 0 ? (
                                <div className="text-center py-20 text-muted-foreground">
                                    No hay grupos generados todavía.
                                </div>
                            ) : (
                                <div className="grid lg:grid-cols-2 gap-8">
                                    {tournament.groups.map((group) => (
                                        <div key={group.id} className="space-y-6">
                                            {/* Group Table */}
                                            <GroupTable
                                                group={group}
                                                teams={tournament.teams}
                                                qualifyCount={tournament.config.qualifyFirst}
                                            />

                                            {/* Group Matches - Read Only */}
                                            <div className="tournament-card bg-white/[0.02]">
                                                <h3 className="font-display font-bold text-lg text-foreground mb-4 opacity-80 pl-2 border-l-4 border-primary/50">
                                                    Partidos - {group.name}
                                                </h3>
                                                <div className="grid sm:grid-cols-2 gap-4">
                                                    {group.matches.map((match, idx) => (
                                                        <MatchCard
                                                            key={match.id}
                                                            match={match}
                                                            team1={getTeamById(match.team1Id)}
                                                            team2={getTeamById(match.team2Id)}
                                                            onResultSubmit={() => { }} // No op
                                                            matchNumber={idx + 1}
                                                            readOnly={true}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        /* Bracket Tab */
                        <>
                            {tournament.bracket.length === 0 ? (
                                <div className="text-center py-24 border-dashed border-white/10 opacity-60 rounded-3xl">
                                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8">
                                        <Trophy className="w-10 h-10 text-white/10" />
                                    </div>
                                    <p className="text-white/20 uppercase font-black tracking-[0.4em] text-xs">
                                        El cuadro final aún no está disponible (fase de grupos en curso)
                                    </p>
                                </div>
                            ) : (
                                <Bracket
                                    matches={tournament.bracket}
                                    teams={tournament.teams}
                                    onMatchUpdate={() => { }} // No op
                                    champion={tournament.champion}
                                    readOnly={true}
                                />
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default TorneoActivo;
