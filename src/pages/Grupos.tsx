import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Grid3X3, AlertCircle, Play, RefreshCw, Trophy, GitBranch, Settings, Layers, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import GroupTable from '@/components/GroupTable';
import MatchCard from '@/components/MatchCard';
import { getRankedTeams } from '@/utils/tournamentUtils';
import { useTournament } from '@/context/TournamentContext';

const Grupos: React.FC = () => {
  const { activeTournament: tournament, loading, updateMatchResult, generateFinalBracket, getTeamById, debugGenerateResults } = useTournament();
  const [activeLevel, setActiveLevel] = useState<string | null>(null);

  const groupsByLevel = useMemo(() => {
    if (!tournament || !tournament.groups) return {};

    const levels: Record<string, typeof tournament.groups> = {};
    tournament.groups.forEach(group => {
      let category = 'General';
      if (group.name.includes(' - ')) {
        category = group.name.split(' - ')[0].trim();
      } else if (group.teamIds.length > 0) {
        const firstTeam = tournament.teams.find(t => t.id === group.teamIds[0]);
        if (firstTeam?.category) {
          category = firstTeam.category;
        }
      }
      if (!levels[category]) levels[category] = [];
      levels[category].push(group);
    });
    return levels;
  }, [tournament?.groups, tournament?.teams]);

  const levels = Object.keys(groupsByLevel);

  // Set initial active level
  React.useEffect(() => {
    if (levels.length > 0 && !activeLevel) {
      setActiveLevel(levels[0]);
    }
  }, [levels, activeLevel]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <RefreshCw className="w-10 h-10 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center tournament-card">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display font-bold text-2xl text-foreground mb-2">
              No hay torneo activo
            </h2>
            <p className="text-muted-foreground mb-6">
              Primero debes crear un torneo para ver los grupos.
            </p>
            <Link to="/organizador/panel-de-control">
              <Button className="btn-primary-gradient">
                Crear Torneo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (tournament.phase === 'registration') {
    const approvedTeams = tournament.teams.filter(t => t.status === 'approved');
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center tournament-card">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Grid3X3 className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-display font-black text-3xl text-foreground mb-3 uppercase tracking-tight">
              FASE DE INSCRIPCIÓN
            </h2>
            <div className="space-y-6 mb-10">
              <p className="text-muted-foreground text-sm leading-relaxed">
                Los grupos aún no han sido generados. Para comenzar la competición, debes configurar y generar los grupos desde el **Panel de Control**.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Iniciación</p>
                  <p className="text-2xl font-black text-white">{approvedTeams.filter(t => t.category === 'Iniciación').length}</p>
                  <p className="text-[9px] text-white/20 uppercase font-bold tracking-tighter">Aprobadas</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-1">Nivel Medio</p>
                  <p className="text-2xl font-black text-white">{approvedTeams.filter(t => t.category === 'Nivel Medio').length}</p>
                  <p className="text-[9px] text-white/20 uppercase font-bold tracking-tighter">Aprobadas</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Link to="/organizador/panel-de-control">
                <Button className="w-full btn-primary-gradient py-7 text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                  <Settings className="w-5 h-5 mr-3" />
                  Ir al Panel de Control
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const allGroupsComplete = tournament.groups.every(group =>
    group.matches.every(match => match.status === 'finished')
  );

  const pendingMatches = tournament.groups.reduce((acc, group) =>
    acc + group.matches.filter(m => m.status === 'pending').length, 0
  );

  /* Logic to calculate qualified teams for highlighting */
  const { allQualifiedIds, thirdQualifiedIds } = React.useMemo(() => {
    if (!tournament || !tournament.groups || tournament.groups.length === 0) {
      return { allQualifiedIds: [], thirdQualifiedIds: [] };
    }

    const allQualified = new Set<string>();
    const thirdQualified = new Set<string>();

    Object.keys(groupsByLevel).forEach(cat => {
      const groupsForCategory = groupsByLevel[cat];
      const { qualifyFirst, qualifyThird, numberOfThirdQualifiers } = tournament.config;

      const rankedTeams = getRankedTeams(
        groupsForCategory,
        qualifyFirst,
        qualifyThird ? numberOfThirdQualifiers : 0
      );

      rankedTeams.forEach(team => {
        allQualified.add(team.teamId);
        if (team.position > qualifyFirst) {
          thirdQualified.add(team.teamId);
        }
      });
    });

    return {
      allQualifiedIds: Array.from(allQualified),
      thirdQualifiedIds: Array.from(thirdQualified)
    };
  }, [tournament?.groups, tournament?.config, groupsByLevel]);

  const activeGroups = activeLevel ? groupsByLevel[activeLevel] || [] : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Top bar with Page Title and Global Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-6">
          <div>
            <h1 className="font-display font-black text-4xl text-foreground mb-2 uppercase tracking-tight flex items-center gap-4">
              <Grid3X3 className="w-8 h-8 text-primary" />
              Fase de Grupos
            </h1>
            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30">
              {pendingMatches > 0
                ? `${pendingMatches} partidos por jugar en total`
                : 'Todos los partidos completados'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link to="/organizador/panel-de-control">
              <Button
                variant="outline"
                className="border-white/10 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest py-6 px-8"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurar Sorteo
              </Button>
            </Link>

            {allGroupsComplete && tournament.phase === 'groups' && (
              <Button
                onClick={generateFinalBracket}
                className="btn-primary-gradient py-6 px-8 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20"
              >
                <Play className="w-4 h-4 mr-2" />
                Generar Cuadro Final
              </Button>
            )}
          </div>
        </div>

        {/* Categories Tabs Selector */}
        {levels.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-10 p-2 bg-secondary/20 rounded-[2rem] border border-white/5 backdrop-blur-xl max-w-fit">
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => setActiveLevel(level)}
                className={`px-8 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-3 ${activeLevel === level
                  ? 'bg-primary text-background shadow-[0_0_25px_rgba(25,231,142,0.3)]'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Layers className={`w-4 h-4 ${activeLevel === level ? 'text-background' : 'text-primary'}`} />
                {level}
              </button>
            ))}
          </div>
        )}

        {/* Results for Selected Category */}
        <div className="space-y-12 animate-fade-in">
          {tournament.phase === 'groups' && tournament.groups.length > 0 && !allGroupsComplete && (
            <div className="p-8 bg-primary/5 border border-primary/20 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles className="w-20 h-20 text-primary" />
              </div>
              <div className="relative z-10 text-center md:text-left">
                <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                  <div className="px-3 py-1 bg-primary/20 rounded-lg">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Modo Debug</span>
                  </div>
                  <h4 className="font-black text-lg text-white uppercase tracking-tighter">Simulador de Competición</h4>
                </div>
                <p className="text-white/40 text-[11px] uppercase font-bold tracking-widest max-w-sm">Rellena automáticamente todos los partidos pendientes con resultados aleatorios para avanzar al cuadro final.</p>
              </div>
              <Button
                onClick={() => {
                  if (window.confirm('¿Generar resultados aleatorios para TODOS los partidos pendientes?')) {
                    debugGenerateResults();
                  }
                }}
                className="relative z-10 px-10 py-8 bg-primary text-background font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-white transition-all shadow-2xl shadow-primary/20 group/btn"
              >
                Generar Resultados
                <Sparkles className="w-5 h-5 ml-3 group-hover/btn:rotate-12 transition-transform" />
              </Button>
            </div>
          )}

          {levels.length === 0 ? (
            <div className="py-20 text-center space-y-4 tournament-card">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto" />
              <h2 className="text-xl font-bold text-white uppercase tracking-tighter">Sorteo pendiente</h2>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Los grupos aparecerán aquí una vez que los generes desde el panel administrativo.
              </p>
              <Link to="/organizador/panel-de-control">
                <Button variant="outline" className="border-primary/20 hover:bg-primary/5 text-xs font-black uppercase tracking-widest py-6 px-8 mt-4">
                  Ir al Panel de Control
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-10">
              {activeGroups.map((group) => (
                <div key={group.id} className="space-y-8 animate-slide-up">
                  <GroupTable
                    group={group}
                    teams={tournament.teams}
                    qualifyCount={tournament.config.qualifyFirst}
                    qualifiedTeamIds={allQualifiedIds}
                    thirdQualifiedIds={thirdQualifiedIds}
                  />

                  <div className="tournament-card group/matches">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-display font-bold text-lg text-foreground uppercase tracking-tight">
                        Partidos: <span className="text-primary">{group.name}</span>
                      </h3>
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-white/30 group-hover/matches:bg-primary/20 group-hover/matches:text-primary transition-colors">
                        {group.matches.length}
                      </div>
                    </div>

                    <div className="grid gap-4">
                      {group.matches.map((match, idx) => (
                        <MatchCard
                          key={match.id}
                          match={match}
                          team1={getTeamById(match.team1Id)}
                          team2={getTeamById(match.team2Id)}
                          onResultSubmit={(result) => updateMatchResult(group.id, match.id, result)}
                          matchNumber={idx + 1}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Global Action: Debug or Advanced Navigation */}
        {tournament.phase === 'groups' && !allGroupsComplete && (
          <div className="mt-20 flex justify-center border-t border-white/5 pt-10">
            <Button
              onClick={() => {
                if (window.confirm('¿Generar resultados aleatorios para TODOS los partidos de este torneo?')) {
                  debugGenerateResults();
                }
              }}
              variant="ghost"
              className="text-yellow-500/30 hover:text-yellow-500 hover:bg-yellow-500/5 text-[9px] uppercase font-black tracking-[0.3em] py-4 px-6 transition-all"
            >
              ⚠️ Auto-Completar Resultados (Modo Admin)
            </Button>
          </div>
        )}

        {/* Bottom Giant CTA for Final Bracket */}
        {allGroupsComplete && tournament.phase === 'groups' && (
          <div className="mt-16 animate-slide-up">
            <div className="relative overflow-hidden rounded-[3rem] bg-primary/5 border border-primary/20 p-12 text-center group">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                <Trophy className="w-32 h-32 text-primary" />
              </div>
              <div className="relative z-10">
                <h2 className="font-display font-black text-4xl md:text-5xl uppercase tracking-tighter mb-4 text-white">
                  ¡Grupos Finalizados!
                </h2>
                <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
                  Todos los partidos de todas las categorías han terminado. Es hora de decidir quién se lleva la corona en el cuadro final.
                </p>
                <Button
                  onClick={generateFinalBracket}
                  className="btn-primary-gradient px-12 py-8 text-lg font-black uppercase tracking-widest shadow-2xl shadow-primary/30"
                >
                  <GitBranch className="w-6 h-6 mr-3" />
                  Ir al Cuadro Final
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Grupos;
