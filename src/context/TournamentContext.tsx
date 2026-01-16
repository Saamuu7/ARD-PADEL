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
    generateGroups: () => Promise<void>;
    updateMatchResult: (groupId: string, matchId: string, result: MatchResult) => Promise<void>;
    generateFinalBracket: () => Promise<void>;
    updateBracketMatch: (matchId: string, result: MatchResult) => Promise<void>;
    updateTournamentConfig: (config: TournamentConfig) => Promise<void>;
    deleteTournament: (tournamentId: string) => Promise<void>;
    getTeamById: (teamId: string) => Team | undefined;
    resetTournaments: () => Promise<void>;
    refreshTournaments: () => Promise<void>;
    finishTournament: () => Promise<void>;
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
    const [activeTournamentId, setActiveTournamentId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const activeTournament = tournaments.find(t => t.id === activeTournamentId) || null;

    // --- Load Tournaments & Data ---
    const loadTournaments = useCallback(async () => {
        try {
            setLoading(true);

            // 1. Fetch Tournaments
            const { data: tournamentsData, error: tourError } = await supabase
                .from('tournaments')
                .select('*')
                .order('id', { ascending: false });

            if (tourError) throw tourError;
            if (!tournamentsData) { setTournaments([]); return; }

            // 2. Fetch Registrations with User Data
            const { data: registrationsData, error: regError } = await supabase
                .from('registrations')
                .select(`
          *,
          p1:users!player1_id(first_name, last_name, phone),
          p2:users!player2_id(first_name, last_name, phone)
        `);

            if (regError) throw regError;

            // 3. Map Data
            const mappedTournaments: Tournament[] = tournamentsData.map((t: any) => {
                const tournamentIdStr = String(t.id);
                const tRegs = registrationsData?.filter((r: any) => String(r.tournament_id) === tournamentIdStr) || [];

                const internalData = t.data || {};

                // Teams Mapped from User Data
                const teams: Team[] = tRegs.map((r: any) => ({
                    id: String(r.id),
                    player1: {
                        name: r.p1 ? `${r.p1.first_name} ${r.p1.last_name || ''}`.trim() : (r.player1_name || 'Desconocido 1'),
                        phone: r.p1?.phone || r.player1_phone
                    },
                    player2: {
                        name: r.p2 ? `${r.p2.first_name} ${r.p2.last_name || ''}`.trim() : (r.player2_name || 'Desconocido 2'),
                        phone: r.p2?.phone || r.player2_phone
                    },
                    category: r.category,
                    status: r.status as any,
                    player1Id: r.player1_id ? String(r.player1_id) : undefined,
                    player2Id: r.player2_id ? String(r.player2_id) : undefined
                }));

                const config: TournamentConfig = {
                    name: t.name,
                    date: t.date,
                    time: t.time,
                    description: t.description,
                    image: internalData.image || '',
                    totalTeams: internalData.totalTeams || 16,
                    numberOfGroups: internalData.numberOfGroups || 4,
                    qualifyFirst: internalData.qualifyFirst || 2,
                    qualifyThird: internalData.qualifyThird || false,
                    numberOfThirdQualifiers: internalData.numberOfThirdQualifiers || 0,
                    registrationClosed: internalData.registrationClosed || false,
                };

                return {
                    id: tournamentIdStr,
                    config,
                    teams,
                    groups: internalData.groups || [],
                    bracket: internalData.bracket || [],
                    phase: internalData.phase || 'registration',
                    champion: internalData.champion,
                    finishedAt: internalData.finishedAt
                };
            });

            // 4. Auto-delete expired tournaments (> 24h)
            const now = Date.now();
            const validTournaments: Tournament[] = [];

            for (const t of mappedTournaments) {
                if (t.phase === 'finished' && t.finishedAt) {
                    const hoursSinceFinish = (now - t.finishedAt) / (1000 * 60 * 60);
                    if (hoursSinceFinish >= 24) {
                        // Delete from DB
                        await supabase.from('tournaments').delete().eq('id', parseInt(t.id));
                        continue; // Do not add to state
                    }
                }
                validTournaments.push(t);
            }

            setTournaments(validTournaments);

            if (validTournaments.length > 0 && !activeTournamentId) {
                setActiveTournamentId(validTournaments[0].id);
            } else if (activeTournamentId && !validTournaments.find(t => t.id === activeTournamentId)) {
                setActiveTournamentId(validTournaments.length > 0 ? validTournaments[0].id : null);
            }

        } catch (err) {
            console.error('Error loading data from Supabase:', err);
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    }, [activeTournamentId]);


    useEffect(() => { loadTournaments(); }, [loadTournaments]);

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

        if (error) { toast.error("Error al guardar cambios"); }
        else { await loadTournaments(); }
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
        if (!activeTournament) return;

        const updatedTournament = {
            ...activeTournament,
            config
        };
        await saveTournamentInternal(updatedTournament);
        toast.success("Configuración actualizada");
    }, [activeTournament]); // Implicitly uses saveTournamentInternal

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

    const generateGroups = useCallback(async () => {
        if (!activeTournament) return;

        const { teams, config } = activeTournament;
        const { numberOfGroups } = config;
        const approvedTeams = teams.filter(t => t.status === 'approved');

        const groups: Group[] = [];
        const teamsByCategory: Record<string, Team[]> = {};
        approvedTeams.forEach(team => {
            const cat = team.category || 'General';
            if (!teamsByCategory[cat]) teamsByCategory[cat] = [];
            teamsByCategory[cat].push(team);
        });

        const categories = Object.keys(teamsByCategory);
        const catsWithTeams = categories.filter(cat => teamsByCategory[cat].length > 0);
        const groupsPerCat = Math.max(1, Math.floor(numberOfGroups / catsWithTeams.length));

        catsWithTeams.forEach((cat, catIndex) => {
            let numGroupsForCat = groupsPerCat;
            if (catIndex === catsWithTeams.length - 1) {
                numGroupsForCat = numberOfGroups - (groupsPerCat * (catsWithTeams.length - 1));
            }
            const shuffledCatTeams = shuffleArray([...teamsByCategory[cat]]);
            for (let i = 0; i < numGroupsForCat; i++) {
                const groupName = catsWithTeams.length > 1 ? `${cat} - ${String.fromCharCode(65 + i)}` : `Grupo ${String.fromCharCode(65 + i)}`;
                const groupId = generateId();
                const teamIds: string[] = [];
                shuffledCatTeams.forEach((team, teamIdx) => {
                    if (teamIdx % numGroupsForCat === i) teamIds.push(team.id);
                });
                if (teamIds.length > 0) {
                    groups.push({
                        id: groupId,
                        name: groupName,
                        teamIds,
                        matches: generateGroupMatches(teamIds),
                        standings: teamIds.map(teamId => ({ teamId, played: 0, won: 0, lost: 0, gamesFor: 0, gamesAgainst: 0, gamesDiff: 0 })),
                    });
                }
            }
        });

        const updatedTournament: Tournament = {
            ...activeTournament,
            groups,
            phase: 'groups',
        };
        await saveTournamentInternal(updatedTournament);
        toast.success("Grupos generados");
    }, [activeTournament]);

    const updateMatchResult = useCallback(async (groupId: string, matchId: string, result: MatchResult) => {
        if (!activeTournament) return;
        const updatedGroups = activeTournament.groups.map(group => {
            if (group.id !== groupId) return group;
            const updatedMatches = group.matches.map(match => {
                if (match.id !== matchId) return match;
                return { ...match, result, status: 'finished' as const };
            });
            return { ...group, matches: updatedMatches, standings: calculateStandings(group.teamIds, updatedMatches) };
        });
        const updatedTournament = { ...activeTournament, groups: updatedGroups };
        await saveTournamentInternal(updatedTournament);
    }, [activeTournament]);

    const generateFinalBracket = useCallback(async () => {
        if (!activeTournament) return;
        const currentGroups = activeTournament.groups;
        const { qualifyFirst, qualifyThird, numberOfThirdQualifiers } = activeTournament.config;

        const groupsByLevel: Record<string, Group[]> = {};
        currentGroups.forEach(group => {
            let category = 'General';
            if (group.name.includes(' - ')) category = group.name.split(' - ')[0];
            else if (group.teamIds.length > 0) {
                const firstTeam = activeTournament.teams.find(t => t.id === group.teamIds[0]);
                if (firstTeam?.category) category = firstTeam.category;
            }
            if (!groupsByLevel[category]) groupsByLevel[category] = [];
            groupsByLevel[category].push(group);
        });

        let allRankedTeams: any[] = [];
        Object.keys(groupsByLevel).forEach(cat => {
            const levelGroups = groupsByLevel[cat];
            const rankedTeams = getRankedTeams(levelGroups, qualifyFirst, qualifyThird ? numberOfThirdQualifiers : 0);
            allRankedTeams = [...allRankedTeams, ...rankedTeams];
        });

        const allBracketMatches = generateBracket(allRankedTeams, currentGroups);

        const updatedTournament: Tournament = {
            ...activeTournament,
            bracket: allBracketMatches,
            phase: 'bracket',
        };
        await saveTournamentInternal(updatedTournament);
        toast.success("Fase final generada");
    }, [activeTournament]);

    const updateBracketMatch = useCallback(async (matchId: string, result: MatchResult) => {
        if (!activeTournament) return;
        let updatedBracket = activeTournament.bracket.map(m => m.id === matchId ? { ...m, result, status: 'finished' as const } : m);

        // Advance winner logic
        const completedMatch = updatedBracket.find(m => m.id === matchId);
        if (completedMatch?.result?.winner && completedMatch.nextMatchId) {
            const nextMatch = updatedBracket.find(m => m.id === completedMatch.nextMatchId);
            const previousMatches = updatedBracket.filter(m => m.nextMatchId === nextMatch?.id);
            const winnerIndex = previousMatches.findIndex(m => m.id === matchId);
            updatedBracket = updatedBracket.map(m => {
                if (m.id === completedMatch.nextMatchId) {
                    return { ...m, [winnerIndex === 0 ? 'team1Id' : 'team2Id']: completedMatch.result!.winner };
                }
                return m;
            });
        }

        const finalMatch = updatedBracket.find(m => m.round === 'Final');
        const champion = finalMatch?.result?.winner;

        const updatedTournament: Tournament = {
            ...activeTournament,
            bracket: updatedBracket,
            phase: 'bracket',
            champion
        };
        await saveTournamentInternal(updatedTournament);
    }, [activeTournament]);

    const getTeamById = useCallback((teamId: string) => {
        return activeTournament?.teams.find(t => t.id === teamId);
    }, [activeTournament]);

    const resetTournaments = useCallback(async () => {
        // Dangerous! Disabled for safety
    }, []);

    const setActiveTournament = useCallback((id: string | null) => {
        setActiveTournamentId(id);
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
            }}
        >
            {children}
        </TournamentContext.Provider>
    );
};
