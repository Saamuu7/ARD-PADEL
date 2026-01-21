import React, { useMemo } from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { useTournament } from '@/context/TournamentContext';
import { Button } from '@/components/ui/button';
import { Trophy, Target, Star, ShieldCheck, Mail, Phone, Calendar, ArrowRight, User, TrendingUp, Award, Clock } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

const Profile: React.FC = () => {
    const { user } = useAuth();
    const { tournaments } = useTournament();

    if (!user) {
        return <Navigate to="/" replace />;
    }

    const [showAllMatches, setShowAllMatches] = React.useState(false);

    // Calculate detailed stats
    const stats = useMemo(() => {
        let matchesPlayed = 0;
        let matchesWon = 0;
        let setsWon = 0;
        let totalSets = 0;
        let gamesWon = 0;
        let totalGames = 0;
        let tournamentsPlayed = 0;

        const playerMatches: any[] = [];
        const tournamentHistory: any[] = [];

        tournaments.forEach(t => {
            const myTeam = t.teams.find(team =>
                String(team.player1Id) === String(user.id) ||
                String(team.player2Id) === String(user.id)
            );

            if (myTeam) {
                tournamentsPlayed++;

                // Determine progress/achievement
                let achievement = 'Inscrito';
                if (t.groups.length > 0) achievement = 'Fase de Grupos';

                const bracketMatches = t.bracket.filter(m =>
                    String(m.team1Id) === String(myTeam.id) ||
                    String(m.team2Id) === String(myTeam.id)
                );

                if (bracketMatches.length > 0) {
                    // Find highest round reached
                    const roundsOrder = ['Final', 'Semifinal', 'Cuartos', 'Octavos', 'Dieciseisavos'];
                    let highestRoundIndex = roundsOrder.length;
                    let playedInFinal = false;
                    let wonFinal = false;

                    bracketMatches.forEach(bm => {
                        const roundIdx = roundsOrder.indexOf(bm.round);
                        if (roundIdx !== -1 && roundIdx < highestRoundIndex) {
                            highestRoundIndex = roundIdx;
                        }
                        if (bm.round === 'Final') {
                            playedInFinal = true;
                            if (bm.status === 'finished' && bm.result && String(bm.result.winner) === String(myTeam.id)) {
                                wonFinal = true;
                            }
                        }
                    });

                    if (wonFinal) achievement = 'Campeón 🏆';
                    else if (playedInFinal) achievement = 'Subcampeón 🥈';
                    else if (highestRoundIndex < roundsOrder.length) achievement = roundsOrder[highestRoundIndex];
                }

                tournamentHistory.push({
                    name: t.config.name,
                    date: t.config.date,
                    achievement,
                    image: t.config.image,
                    phase: t.phase
                });

                // Collect matches from groups and bracket
                const allMatches = [
                    ...t.groups.flatMap(g => g.matches),
                    ...t.bracket
                ];

                allMatches.forEach(m => {
                    const isP1 = String(m.team1Id) === String(myTeam.id);
                    const isP2 = String(m.team2Id) === String(myTeam.id);

                    if (isP1 || isP2) {
                        if (m.status === 'finished' && m.result) {
                            matchesPlayed++;
                            const isWinner = String(m.result.winner) === String(myTeam.id);
                            if (isWinner) matchesWon++;

                            m.result.sets.forEach(set => {
                                totalSets++;
                                const pGames = isP1 ? set.team1 : set.team2;
                                const oGames = isP1 ? set.team2 : set.team1;

                                if (pGames > oGames) setsWon++;
                                gamesWon += pGames;
                                totalGames += (pGames + oGames);
                            });

                            playerMatches.push({
                                ...m,
                                tournamentName: t.config.name,
                                result: m.result,
                                opponent: isP1 ? t.teams.find(team => team.id === m.team2Id) : t.teams.find(team => team.id === m.team1Id),
                                isWinner
                            });
                        }
                    }
                });
            }
        });

        const winRate = matchesPlayed > 0 ? Math.round((matchesWon / matchesPlayed) * 100) : 0;
        const ardLevel = Math.min(5, 1 + (winRate / 25) + (tournamentsPlayed * 0.2));

        const sortedMatches = playerMatches.sort((a, b) => b.id.localeCompare(a.id)).reverse();

        return {
            matchesPlayed,
            matchesWon,
            winRate,
            setsWon,
            totalSets,
            gamesWon,
            totalGames,
            tournamentsPlayed,
            allMatches: playerMatches.reverse(),
            tournamentHistory: tournamentHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
            ardLevel: ardLevel.toFixed(1)
        };
    }, [tournaments, user.id]);

    const displayedMatches = showAllMatches ? stats.allMatches : stats.allMatches.slice(0, 3);

    return (
        <div className="min-h-screen bg-background text-white selection:bg-primary/30">
            <Header />

            <main className="container mx-auto px-4 py-12">
                <div className="max-w-6xl mx-auto">

                    {/* Hero Profile Section */}
                    <div className="relative overflow-hidden rounded-[3rem] bg-card/40 border border-white/5 backdrop-blur-3xl p-8 md:p-12 mb-12 group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                            <div className="relative">
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center overflow-hidden group-hover:border-primary/40 transition-all duration-500 shadow-2xl">
                                    <User className="w-16 h-16 md:w-20 md:h-20 text-primary opacity-40 group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-accent text-background px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-xl animate-float">
                                    Lvl {stats.ardLevel}
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10 text-primary mb-4">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Atleta ARD Verificado</span>
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 leading-none">
                                    {user.first_name} <span className="text-white/40">{user.last_name}</span>
                                </h1>
                                <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-white/40">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-primary" />
                                        {user.email}
                                    </div>
                                    {user.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-primary" />
                                            {user.phone}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                                <div className="bg-white/5 border border-white/5 p-6 rounded-3xl text-center">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-white/20 mb-1">Win Rate</p>
                                    <p className="text-3xl font-black text-primary leading-none">{stats.winRate}%</p>
                                </div>
                                <div className="bg-white/5 border border-white/5 p-6 rounded-3xl text-center">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-white/20 mb-1">Torneos</p>
                                    <p className="text-3xl font-black text-accent leading-none">{stats.tournamentsPlayed}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Stats Sidebar */}
                        <div className="lg:col-span-1 space-y-8">
                            <div className="tournament-card p-8">
                                <h3 className="flex items-center gap-3 text-lg font-black uppercase tracking-widest mb-8">
                                    <TrendingUp className="w-5 h-5 text-primary" />
                                    Estadísticas Totales
                                </h3>

                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Partidos Partidos</span>
                                        <span className="text-lg font-black">{stats.matchesPlayed}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Partidos Ganados</span>
                                        <span className="text-lg font-black text-green-500">{stats.matchesWon}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Sets Ganados</span>
                                        <span className="text-lg font-black text-primary">{stats.setsWon}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Juegos Ganados</span>
                                        <span className="text-lg font-black">{stats.gamesWon}</span>
                                    </div>

                                    <div className="pt-6 border-t border-white/5">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                            <span>Dominio en Pista</span>
                                            <span className="text-primary">{stats.winRate}%</span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary shadow-[0_0_10px_rgba(25,231,142,0.5)] transition-all duration-1000"
                                                style={{ width: `${stats.winRate}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="tournament-card p-8 bg-accent/5 border-accent/10">
                                <h3 className="flex items-center gap-3 text-lg font-black uppercase tracking-widest mb-6">
                                    <Award className="w-5 h-5 text-accent" />
                                    Rango Profesional
                                </h3>
                                <p className="text-sm text-white/60 mb-8 italic">
                                    Tu rango se basa en el porcentaje de victorias, la actividad en torneos y la calidad de tus oponentes.
                                </p>
                                <div className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                                            <Star className="w-5 h-5 text-accent" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-accent">Status Actual</p>
                                            <p className="font-bold text-sm">Competidor de Élite</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-white">{stats.ardLevel}</p>
                                        <p className="text-[8px] uppercase font-black text-white/20">ARD Score</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Matches & Tournament History */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Tournament History Board */}
                            <div className="tournament-card p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="flex items-center gap-3 text-lg font-black uppercase tracking-widest">
                                        <Trophy className="w-5 h-5 text-accent" />
                                        Vitrina de Torneos
                                    </h3>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20">{stats.tournamentHistory.length} Participaciones</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {stats.tournamentHistory.length > 0 ? (
                                        stats.tournamentHistory.map((t: any, idx) => (
                                            <div key={idx} className="group relative overflow-hidden bg-white/5 border border-white/5 rounded-2xl p-4 hover:border-accent/40 transition-all duration-300">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-card shrink-0">
                                                        <img
                                                            src={t.image || "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=2070&auto=format&fit=crop"}
                                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                                            alt=""
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">{t.date}</p>
                                                        <h4 className="font-bold text-sm text-white truncate mb-2">{t.name}</h4>
                                                        <div className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${t.achievement.includes('🏆') ? 'bg-primary/20 text-primary border border-primary/20' :
                                                            t.achievement.includes('🥈') ? 'bg-accent/20 text-accent border border-accent/20' :
                                                                'bg-white/5 text-white/60 border border-white/10'
                                                            }`}>
                                                            {t.achievement}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-2 py-10 text-center border border-dashed border-white/5 rounded-2xl">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Sin historial de torneos</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Recent Matches Historial */}
                            <div className="tournament-card p-8">
                                <div className="flex items-center justify-between mb-10">
                                    <h3 className="flex items-center gap-3 text-lg font-black uppercase tracking-widest">
                                        <Clock className="w-5 h-5 text-primary" />
                                        Historial de Partidos
                                    </h3>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Últimos 5 encuentros</span>
                                </div>

                                <div className={`space-y-4 pr-2 ${showAllMatches ? 'max-h-[600px] overflow-y-auto custom-scrollbar' : ''}`}>
                                    {displayedMatches.length > 0 ? (
                                        displayedMatches.map((m: any, idx) => (
                                            <div key={idx} className="group relative overflow-hidden bg-white/5 hover:bg-white/10 p-6 rounded-[2rem] border border-white/5 transition-all duration-300">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                    <div className="flex items-center gap-6">
                                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${m.isWinner ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
                                                            }`}>
                                                            {m.isWinner ? <Trophy className="w-6 h-6" /> : <TrendingUp className="w-6 h-6 rotate-180" />}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-primary">{m.tournamentName}</span>
                                                                <span className="text-white/20 text-[9px]">•</span>
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{m.round}</span>
                                                            </div>
                                                            <h4 className="font-black text-lg uppercase tracking-tight">
                                                                VS {m.opponent?.player1.name} / {m.opponent?.player2.name}
                                                            </h4>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-6">
                                                        <div className="text-right">
                                                            <div className="text-2xl font-black text-white leading-none mb-1">
                                                                {m.result.sets.map((s: any) => `${s.team1}-${s.team2}`).join(' / ')}
                                                            </div>
                                                            <p className={`text-[10px] font-black uppercase tracking-widest ${m.isWinner ? 'text-green-400' : 'text-red-400'}`}>
                                                                {m.isWinner ? 'Victoria Master' : 'Derrota Ajustada'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                                            <Target className="w-12 h-12 text-white/5 mx-auto mb-4" />
                                            <p className="text-white/20 uppercase font-black tracking-widest text-xs">Aún no has disputado partidos oficiales</p>
                                        </div>
                                    )}
                                </div>

                                {stats.allMatches.length > 3 && (
                                    <div className="mt-10 pt-10 border-t border-white/5 text-center">
                                        <Button
                                            onClick={() => setShowAllMatches(!showAllMatches)}
                                            variant="ghost"
                                            className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white"
                                        >
                                            {showAllMatches ? 'Ver menos' : 'Ver Historial Completo'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
