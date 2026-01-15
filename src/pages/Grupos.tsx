import React from 'react';
import { Link } from 'react-router-dom';
import { Grid3X3, AlertCircle, Play, RefreshCw, Trophy, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import GroupTable from '@/components/GroupTable';
import MatchCard from '@/components/MatchCard';
import { useTournament } from '@/context/TournamentContext';

const Grupos: React.FC = () => {
  const { activeTournament: tournament, updateMatchResult, generateFinalBracket, getTeamById, generateGroups } = useTournament();

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
            <Link to="/gestion">
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
            <div className="space-y-6 mb-8">
              <p className="text-muted-foreground text-sm leading-relaxed">
                Las inscripciones están abiertas. Aquí tienes el desglose de parejas por nivel:
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Iniciación</p>
                  <p className="text-2xl font-black text-white">{tournament.teams.filter(t => t.category === 'Iniciación').length}</p>
                  <p className="text-[9px] text-white/20 uppercase font-bold tracking-tighter">Parejas</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-1">Nivel Medio</p>
                  <p className="text-2xl font-black text-white">{tournament.teams.filter(t => t.category === 'Nivel Medio').length}</p>
                  <p className="text-[9px] text-white/20 uppercase font-bold tracking-tighter">Parejas</p>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5">
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-white/20">
                  Total: {tournament.teams.length} parejas inscritas
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={generateGroups}
                className="w-full btn-primary-gradient py-7 text-base font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                disabled={tournament.teams.length < 2}
              >
                <Play className="w-5 h-5 mr-3" />
                Generar Grupos y Partidos
              </Button>

              <Link to="/organizador/inscripcion" className="block">
                <Button variant="ghost" className="w-full py-6 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/5">
                  Ver lista de inscritos
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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="font-display font-black text-4xl text-foreground mb-2 uppercase tracking-tight">
              Fase de Grupos
            </h1>
            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30">
              {pendingMatches > 0
                ? `${pendingMatches} partidos pendientes`
                : 'Todos los partidos completados'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Button
              onClick={() => {
                if (window.confirm('¿Estás seguro de que quieres regenerar los grupos? Se perderán todos los resultados actuales.')) {
                  generateGroups();
                }
              }}
              variant="outline"
              className="border-white/10 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest py-6 px-8"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerar Grupos
            </Button>

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

        {/* Groups Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {tournament.groups.map((group) => (
            <div key={group.id} className="space-y-6">
              {/* Group Table */}
              <GroupTable
                group={group}
                teams={tournament.teams}
                qualifyCount={tournament.config.qualifyFirst}
              />

              {/* Group Matches */}
              <div className="tournament-card">
                <h3 className="font-display font-bold text-lg text-foreground mb-4">
                  Partidos - {group.name}
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
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

        {/* Bottom CTA for Final Bracket */}
        {allGroupsComplete && tournament.phase === 'groups' && (
          <div className="mt-16 animate-slide-up">
            <div className="tournament-card bg-primary/5 border-primary/20 text-center py-16">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(25,231,142,0.2)]">
                <Trophy className="w-10 h-10 text-primary animate-pulse" />
              </div>
              <h2 className="font-display font-black text-4xl uppercase tracking-tighter mb-4 text-white">
                Fase de Grupos Completada
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Todos los partidos han finalizado. El sistema ya tiene los clasificados listos para la fase final.
              </p>
              <Button
                onClick={generateFinalBracket}
                className="btn-primary-gradient px-12 py-8 text-lg font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 transition-transform"
              >
                <GitBranch className="w-6 h-6 mr-3" />
                Generar Cuadro Final
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Grupos;
