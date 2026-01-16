import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import { Tournament, Team, TournamentConfig, Group, Match, MatchResult, BracketMatch, GroupStanding, Player } from '@/types/tournament';
import { generateId, shuffleArray, calculateStandings, generateGroupMatches, generateBracket, getRankedTeams } from '@/utils/tournamentUtils';
import { supabase } from '@/lib/supabase';

interface TournamentContextType {
    tournaments: Tournament[];
    activeTournament: Tournament | null;
    loading: boolean;
    setActiveTournament: (tournamentId: string | null) => void;
    createTournament: (config: TournamentConfig) => Promise<void>;
    registerTeam: (data: { player1Id: string; player2Id: string; category?: string; status?: string }) => Promise<string | null>;
    updateTeam: (teamId: string, updates: Partial<Team>) => Promise<void>;
    removeTeam: (teamId: string) => Promise<void>;
    generateGroups: (configOverride?: Partial<TournamentConfig>) => Promise<void>;
    updateMatchResult: (groupId: string, matchId: string, result: MatchResult) => Promise<void>;
    generateFinalBracket: () => Promise<void>;
    updateBracketMatch: (matchId: string, result: MatchResult) => Promise<void>;
    updateTournamentConfig: (config: TournamentConfig) => Promise<void>;
    deleteTournament: (tournamentId: string) => Promise<void>;
    getTeamById: (teamId: string) => Team | undefined;
    resetTournaments: () => Promise<void>;
    refreshTournaments: () => Promise<void>;
    finishTournament: () => Promise<void>;
    debugGenerateTeams: () => Promise<void>;
    debugGenerateResults: () => Promise<void>;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export const useTournament = () => {
    const context = useContext(TournamentContext);
    if (!context) {
        throw new Error('useTournament must be used within a TournamentProvider');
    }
    return context;
};

interface TournamentProviderProps {
    children: ReactNode;
}

export const TournamentProvider: React.FC<TournamentProviderProps> = ({ children }) => {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [activeTournamentId, setActiveTournamentId] = useState<string | null>(() => {
        try {
            return localStorage.getItem('active_tournament_id');
        } catch (e) {
            return null;
        }
    });
    const [loading, setLoading] = useState(true);

    // Persist active ID whenever it changes
    useEffect(() => {
        if (activeTournamentId) {
            localStorage.setItem('active_tournament_id', String(activeTournamentId));
        } else {
            localStorage.removeItem('active_tournament_id');
        }
    }, [activeTournamentId]);

    // Derived: Current active tournament
    const activeTournament = tournaments.find(t => String(t.id) === String(activeTournamentId)) || null;

    const loadTournaments = useCallback(async () => {
        setLoading(true);
        try {
            const { data: tourData, error: tourError } = await supabase
                .from('tournaments')
                .select('*')
                .order('id', { ascending: false });

            if (tourError) throw tourError;

            const { data: regData, error: regError } = await supabase
                .from('registrations')
                .select(`
                    *,
                    p1:users!player1_id(first_name, last_name, phone),
                    p2:users!player2_id(first_name, last_name, phone)
                `);

            if (regError) throw regError;

            const mapped = (tourData || []).map((t: any) => {
                const id = String(t.id);
                const internal = t.data || {};
                const tRegs = (regData || []).filter((r: any) => String(r.tournament_id) === id);

                const teams: Team[] = tRegs.map((r: any) => ({
                    id: String(r.id),
                    player1: {
                        name: r.p1 ? `${r.p1.first_name} ${r.p1.last_name || ''}`.trim() : (r.player1_name || 'Pareja A'),
                        phone: r.p1?.phone || r.player1_phone
                    },
                    player2: {
                        name: r.p2 ? `${r.p2.first_name} ${r.p2.last_name || ''}`.trim() : (r.player2_name || 'Pareja B'),
                        phone: r.p2?.phone || r.player2_phone
                    },
                    category: r.category,
                    status: (r.status || 'pending') as any,
                    player1Id: r.player1_id ? String(r.player1_id) : undefined,
                    player2Id: r.player2_id ? String(r.player2_id) : undefined
                }));

                const config: TournamentConfig = {
                    name: t.name,
                    date: t.date,
                    time: t.time,
                    description: t.description,
                    image: internal.image || '',
                    totalTeams: internal.totalTeams || 16,
                    numberOfGroups: internal.numberOfGroups || 4,
                    qualifyFirst: internal.qualifyFirst || 2,
                    qualifyThird: internal.qualifyThird || false,
                    numberOfThirdQualifiers: internal.numberOfThirdQualifiers || 0,
                    registrationClosed: internal.registrationClosed || false,
                    categorySettings: internal.categorySettings || {}
                };

                return {
                    id,
                    config,
                    teams,
                    groups: internal.groups || [],
                    bracket: internal.bracket || [],
                    phase: internal.phase || 'registration',
                    champion: internal.champion,
                    finishedAt: internal.finishedAt
                };
            });

            // Filter expired (> 48h for more buffer)
            const now = Date.now();
            const valid = mapped.filter(t => {
                if (t.phase === 'finished' && t.finishedAt) {
                    return (now - t.finishedAt) < (48 * 60 * 60 * 1000);
                }
                return true;
            });

            setTournaments(valid);

            // Auto-select logic: 
            // 1. If we have a stored ID and it's valid, stick with it.
            // 2. Otherwise, pick the newest (first in sorted list).
            const storedId = localStorage.getItem('active_tournament_id');
            if (!storedId || !valid.some(t => String(t.id) === String(storedId))) {
                if (valid.length > 0) {
                    const firstId = String(valid[0].id);
                    setActiveTournamentId(firstId);
                    localStorage.setItem('active_tournament_id', firstId);
                }
            } else if (storedId && !activeTournamentId) {
                setActiveTournamentId(storedId);
            }

        } catch (err: any) {
            console.error('Tournament Loading Error:', err);
            toast.error('Error al cargar torneos');
        } finally {
            setLoading(false);
        }
    }, [activeTournamentId]);

    useEffect(() => {
        loadTournaments();
    }, []); // Run on mount only


    // --- CRUD Operations ---

    const saveTournamentInternal = async (updatedTournament: Tournament) => {
        const internalData = {
            image: updatedTournament.config.image,
            totalTeams: updatedTournament.config.totalTeams,
            numberOfGroups: updatedTournament.config.numberOfGroups,
            qualifyFirst: updatedTournament.config.qualifyFirst,
            qualifyThird: updatedTournament.config.qualifyThird,
            numberOfThirdQualifiers: updatedTournament.config.numberOfThirdQualifiers,
            registrationClosed: updatedTournament.config.registrationClosed,
            categorySettings: updatedTournament.config.categorySettings,
            phase: updatedTournament.phase,
            groups: updatedTournament.groups,
            bracket: updatedTournament.bracket,
            champion: updatedTournament.champion,
            finishedAt: updatedTournament.finishedAt
        };

        const { error } = await supabase
            .from('tournaments')
            .update({
                name: updatedTournament.config.name,
                date: updatedTournament.config.date,
                time: updatedTournament.config.time,
                description: updatedTournament.config.description,
                data: internalData
            })
            .eq('id', parseInt(updatedTournament.id));

        if (error) {
            toast.error("Error al guardar cambios");
            console.error("Save Error:", error);
            throw error;
        } else {
            // Update local state immediately to avoid UI lag
            setTournaments(prev => prev.map(t => t.id === updatedTournament.id ? updatedTournament : t));
        }
    };

    const createTournament = useCallback(async (config: TournamentConfig) => {
        const internalData = {
            image: config.image,
            totalTeams: config.totalTeams,
            numberOfGroups: config.numberOfGroups,
            qualifyFirst: config.qualifyFirst,
            qualifyThird: config.qualifyThird,
            numberOfThirdQualifiers: config.numberOfThirdQualifiers,
            registrationClosed: config.registrationClosed,
            phase: 'registration',
            groups: [],
            bracket: []
        };

        const { error } = await supabase.from('tournaments').insert({
            name: config.name, date: config.date, time: config.time, description: config.description, data: internalData
        });

        if (error) { toast.error(`Error: ${error.message}`); return; }
        toast.success("Torneo creado");
        await loadTournaments();
    }, [loadTournaments]);

    const registerTeam = useCallback(async (data: { player1Id: string; player2Id: string; category?: string; status?: string }) => {
        if (!activeTournament) return null;
        const { data: res, error } = await supabase
            .from('registrations')
            .insert({
                tournament_id: parseInt(activeTournament.id),
                player1_id: parseInt(data.player1Id),
                player2_id: parseInt(data.player2Id),
                category: data.category,
                status: data.status || 'pending'
            })
            .select('id')
            .single();

        if (error) { toast.error(error.message); return null; }
        toast.success("Inscrito correctamente");
        await loadTournaments();
        return String(res.id);
    }, [activeTournament, loadTournaments]);

    const updateTeam = useCallback(async (teamId: string, updates: Partial<Team>) => {
        const dbUpdates: any = {};
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.category) dbUpdates.category = updates.category;
        if (updates.player1?.name) dbUpdates.player1_name = updates.player1.name;
        if (updates.player1?.phone) dbUpdates.player1_phone = updates.player1.phone;
        if (updates.player2?.name) dbUpdates.player2_name = updates.player2.name;
        if (updates.player2?.phone) dbUpdates.player2_phone = updates.player2.phone;

        const { error } = await supabase.from('registrations').update(dbUpdates).eq('id', parseInt(teamId));
        if (!error) await loadTournaments();
    }, [loadTournaments]);

    const removeTeam = useCallback(async (teamId: string) => {
        const { error } = await supabase.from('registrations').delete().eq('id', parseInt(teamId));
        if (error) { toast.error(error.message); return; }
        toast.success("Equipo eliminado");
        await loadTournaments();
    }, [loadTournaments]);

    const updateTournamentConfig = useCallback(async (config: TournamentConfig) => {
        setTournaments(prev => {
            const tournament = prev.find(t => String(t.id) === String(activeTournamentId));
            if (!tournament) return prev;

            const updated = { ...tournament, config };
            saveTournamentInternal(updated).catch(console.error);
            return prev.map(t => t.id === tournament.id ? updated : t);
        });
        toast.success("Configuración actualizada");
    }, [activeTournamentId]);

    const deleteTournament = useCallback(async (tournamentId: string) => {
        const { error } = await supabase.from('tournaments').delete().eq('id', parseInt(tournamentId));
        if (!error) {
            toast.success("Torneo eliminado");
            await loadTournaments();
            if (activeTournamentId === tournamentId) setActiveTournamentId(null);
        } else {
            toast.error(error.message);
        }
    }, [activeTournamentId, loadTournaments]);

    // --- Logic for Groups & Bracket (Client Side Logic stored in JSON) ---

    const generateGroups = useCallback(async (configOverride?: Partial<TournamentConfig>) => {
        if (!activeTournamentId) return;

        // Find current state
        const currentTournament = tournaments.find(t => String(t.id) === String(activeTournamentId));
        if (!currentTournament) return;

        const configToUse = configOverride ? { ...currentTournament.config, ...configOverride } : currentTournament.config;
        const approvedTeams = currentTournament.teams.filter(t => t.status === 'approved');

        if (approvedTeams.length === 0) {
            toast.error("No hay equipos aprobados para generar grupos");
            return;
        }

        const groups: Group[] = [];
        const teamsByCategory: Record<string, Team[]> = {};
        approvedTeams.forEach(team => {
            const cat = team.category || 'General';
            if (!teamsByCategory[cat]) teamsByCategory[cat] = [];
            teamsByCategory[cat].push(team);
        });

        const catsWithTeams = Object.keys(teamsByCategory).filter(cat => teamsByCategory[cat].length > 0);
        catsWithTeams.forEach((cat) => {
            const catSettings = (configToUse.categorySettings && configToUse.categorySettings[cat])
                ? configToUse.categorySettings[cat]
                : {
                    numberOfGroups: configToUse.numberOfGroups,
                    qualifyFirst: configToUse.qualifyFirst,
                    qualifyThird: configToUse.qualifyThird,
                    numberOfThirdQualifiers: configToUse.numberOfThirdQualifiers
                };

            const numGroupsForCat = catSettings.numberOfGroups || 1;
            const shuffledCatTeams = shuffleArray([...teamsByCategory[cat]]);

            for (let i = 0; i < numGroupsForCat; i++) {
                const groupName = catsWithTeams.length > 1 ? `${cat} - ${String.fromCharCode(65 + i)}` : `Grupo ${String.fromCharCode(65 + i)}`;
                const teamIds: string[] = [];
                shuffledCatTeams.forEach((team, teamIdx) => {
                    if (teamIdx % numGroupsForCat === i) teamIds.push(team.id);
                });

                if (teamIds.length > 0) {
                    groups.push({
                        id: generateId(),
                        name: groupName,
                        teamIds,
                        matches: generateGroupMatches(teamIds),
                        standings: teamIds.map(id => ({ teamId: id, played: 0, won: 0, lost: 0, gamesFor: 0, gamesAgainst: 0, gamesDiff: 0 })),
                    });
                }
            }
        });

        const updatedTournament: Tournament = {
            ...currentTournament,
            config: configToUse,
            groups,
            phase: 'groups',
        };

        try {
            await saveTournamentInternal(updatedTournament);
            toast.success("Grupos generados");
        } catch (e) {
            console.error(e);
        }
    }, [activeTournamentId, tournaments, saveTournamentInternal]);

    const updateMatchResult = useCallback(async (groupId: string, matchId: string, result: MatchResult) => {
        const currentTournament = tournaments.find(t => String(t.id) === String(activeTournamentId));
        if (!currentTournament) return;

        const updatedGroups = currentTournament.groups.map(group => {
            if (group.id !== groupId) return group;
            const updatedMatches = group.matches.map(match => {
                if (match.id !== matchId) return match;
                return { ...match, result, status: 'finished' as const };
            });
            return { ...group, matches: updatedMatches, standings: calculateStandings(group.teamIds, updatedMatches) };
        });

        const updatedTournament = { ...currentTournament, groups: updatedGroups };
        await saveTournamentInternal(updatedTournament);
    }, [activeTournamentId, tournaments, saveTournamentInternal]);

    const generateFinalBracket = useCallback(async () => {
        const currentTournament = tournaments.find(t => String(t.id) === String(activeTournamentId));
        if (!currentTournament) return;

        const currentGroups = currentTournament.groups;
        const { qualifyFirst, qualifyThird, numberOfThirdQualifiers } = currentTournament.config;

        const groupsByLevel: Record<string, Group[]> = {};
        currentGroups.forEach(group => {
            let category = 'General';
            if (group.name.includes(' - ')) category = group.name.split(' - ')[0];
            else if (group.teamIds.length > 0) {
                const firstTeam = currentTournament.teams.find(t => t.id === group.teamIds[0]);
                if (firstTeam?.category) category = firstTeam.category;
            }
            if (!groupsByLevel[category]) groupsByLevel[category] = [];
            groupsByLevel[category].push(group);
        });

        let allBracketMatches: BracketMatch[] = [];

        Object.keys(groupsByLevel).forEach(cat => {
            const levelGroups = groupsByLevel[cat];
            const rankedTeams = getRankedTeams(levelGroups, qualifyFirst, qualifyThird ? numberOfThirdQualifiers : 0);
            if (rankedTeams.length >= 2) {
                const catBracket = generateBracket(rankedTeams, levelGroups);
                allBracketMatches = [...allBracketMatches, ...catBracket];
            }
        });

        const updatedTournament: Tournament = {
            ...currentTournament,
            bracket: allBracketMatches,
            phase: 'bracket',
        };
        await saveTournamentInternal(updatedTournament);
        toast.success("Fase final generada");
    }, [activeTournamentId, tournaments, saveTournamentInternal]);

    const updateBracketMatch = useCallback(async (matchId: string, result: MatchResult) => {
        const currentTournament = tournaments.find(t => String(t.id) === String(activeTournamentId));
        if (!currentTournament) return;

        let updatedBracket = currentTournament.bracket.map(m => m.id === matchId ? { ...m, result, status: 'finished' as const } : m);

        const completedMatch = updatedBracket.find(m => m.id === matchId);
        if (completedMatch?.result?.winner && completedMatch.nextMatchId) {
            const nextMatch = updatedBracket.find(m => m.id === completedMatch.nextMatchId);
            const winnerIndex = updatedBracket.filter(m => m.nextMatchId === nextMatch?.id).findIndex(m => m.id === matchId);
            updatedBracket = updatedBracket.map(m => {
                if (m.id === completedMatch.nextMatchId) {
                    return { ...m, [winnerIndex === 0 ? 'team1Id' : 'team2Id']: completedMatch.result!.winner };
                }
                return m;
            });
        }

        const champion = updatedBracket.find(m => m.round === 'Final')?.result?.winner;

        const updatedTournament: Tournament = {
            ...currentTournament,
            bracket: updatedBracket,
            phase: 'bracket',
            champion
        };
        await saveTournamentInternal(updatedTournament);
    }, [activeTournamentId, tournaments, saveTournamentInternal]);

    const getTeamById = useCallback((teamId: string) => {
        return activeTournament?.teams.find(t => t.id === teamId);
    }, [activeTournament]);

    const resetTournaments = useCallback(async () => {
        if (!activeTournament) return;

        const updatedTournament: Tournament = {
            ...activeTournament,
            phase: 'registration',
            groups: [],
            bracket: [],
            champion: undefined,
            finishedAt: undefined
        };

        try {
            await saveTournamentInternal(updatedTournament);
            toast.success("Torneo reseteado correctamente");
        } catch (e) {
            console.error(e);
        }
    }, [activeTournament, saveTournamentInternal]);

    const setActiveTournament = useCallback((id: string | null) => {
        setActiveTournamentId(id);
        if (id) localStorage.setItem('active_tournament_id', id);
        else localStorage.removeItem('active_tournament_id');
    }, []);

    const finishTournament = useCallback(async () => {
        if (!activeTournament) return;
        if (!confirm('¿Confirmar finalización del torneo?')) return;

        const updatedTournament: Tournament = {
            ...activeTournament,
            phase: 'finished',
            finishedAt: Date.now()
        };
        await saveTournamentInternal(updatedTournament);
        toast.success("Torneo finalizado oficialmente");
    }, [activeTournament]);

    const debugGenerateTeams = useCallback(async () => {
        if (!activeTournament) return;

        const levels = ['Iniciación', 'Nivel Medio'];
        const newRegistrations = [];

        for (const level of levels) {
            for (let i = 1; i <= 8; i++) {
                newRegistrations.push({
                    tournament_id: parseInt(activeTournament.id),
                    player1_name: `Jugador ${level[0]}-${i}A`,
                    player2_name: `Jugador ${level[0]}-${i}B`,
                    category: level,
                    status: 'approved',
                    // Assuming DB allows null player_ids for manual/dummy entries
                });
            }
        }

        const { error } = await supabase.from('registrations').insert(newRegistrations);
        if (error) {
            console.error(error);
            toast.error("Error generando datos: " + error.message);
        } else {
            toast.success("16 parejas generadas correctamente");
            await loadTournaments();
        }
    }, [activeTournament, loadTournaments]);

    const debugGenerateResults = useCallback(async () => {
        if (!activeTournament || activeTournament.phase !== 'groups') return;

        const updatedGroups = activeTournament.groups.map(group => {
            const updatedMatches = group.matches.map(match => {
                if (match.status === 'finished') return match;

                // Random score logic (simple: first to 6 wins, 2 sets, sometimes 3)
                // We'll just do 2 sets for simplicity to ensure a winner
                // 50/50 winner
                const winnerId = Math.random() > 0.5 ? match.team1Id : match.team2Id;
                const isTeam1Winner = winnerId === match.team1Id;

                // Generate realistic set scores
                const sets = [];
                for (let i = 0; i < 2; i++) {
                    const winnerScore = 6;
                    const loserScore = Math.floor(Math.random() * 5); // 0-4
                    sets.push({
                        team1: isTeam1Winner ? winnerScore : loserScore,
                        team2: isTeam1Winner ? loserScore : winnerScore
                    });
                }

                return {
                    ...match,
                    status: 'finished' as const,
                    result: {
                        sets,
                        winner: winnerId
                    }
                };
            });
            // Recalculate standings for this group
            return {
                ...group,
                matches: updatedMatches,
                standings: calculateStandings(group.teamIds, updatedMatches)
            };
        });

        const updatedTournament = {
            ...activeTournament,
            groups: updatedGroups
        };
        await saveTournamentInternal(updatedTournament);
        toast.success("Resultados aleatorios generados");
    }, [activeTournament]);

    return (
        <TournamentContext.Provider
            value={{
                tournaments,
                activeTournament,
                loading,
                setActiveTournament,
                createTournament,
                registerTeam,
                updateTeam,
                removeTeam,
                generateGroups,
                updateMatchResult,
                generateFinalBracket,
                updateBracketMatch,
                updateTournamentConfig,
                deleteTournament,
                getTeamById,
                resetTournaments,
                refreshTournaments: loadTournaments,
                finishTournament,
                debugGenerateTeams,
                debugGenerateResults,
            }}
        >
            {children}
        </TournamentContext.Provider>
    );
};
