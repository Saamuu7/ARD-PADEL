import React from 'react';
import { Link } from 'react-router-dom';
import { GitBranch, AlertCircle, Grid3X3, Trophy, Sparkles, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Bracket from '@/components/Bracket';
import { useTournament } from '@/context/TournamentContext';

const Cuadro: React.FC = () => {
  const { activeTournament: tournament, updateBracketMatch, getTeamById } = useTournament();

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
              Primero debes crear un torneo para ver el cuadro final.
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

  if (tournament.phase === 'registration' || tournament.phase === 'groups') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center tournament-card">
            <GitBranch className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display font-bold text-2xl text-foreground mb-2">
              Cuadro Final no disponible
            </h2>
            <p className="text-muted-foreground mb-6">
              {tournament.phase === 'registration'
                ? 'Primero debes completar la fase de inscripción y grupos.'
                : 'Completa todos los partidos de la fase de grupos para generar el cuadro final.'}
            </p>
            <Link to={tournament.phase === 'registration' ? '/inscripcion' : '/grupos'}>
              <Button className="btn-primary-gradient">
                <Grid3X3 className="w-4 h-4 mr-2" />
                {tournament.phase === 'registration' ? 'Ir a Inscripciones' : 'Ir a Grupos'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pendingBracketMatches = tournament.bracket.filter(m =>
    m.status === 'pending' && m.team1Id && m.team2Id
  ).length;

  const championTeam = tournament.champion ? getTeamById(tournament.champion) : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display font-black text-4xl text-foreground mb-2 uppercase tracking-tighter">
            Cuadro Final
          </h1>
          <p className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30">
            {tournament.phase === 'finished'
              ? 'Competición Finalizada'
              : `${pendingBracketMatches} partidos por jugar`}
          </p>
        </div>

        {tournament.phase === 'finished' && (
          <div className="mb-12 animate-slide-up">
            <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-primary/20 via-background to-accent/10 border border-primary/20 p-12 text-center group">
              <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
              <div className="absolute top-0 right-0 p-12 opacity-20">
                <Trophy className="w-64 h-64 text-primary rotate-12" />
              </div>

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary text-background font-black uppercase tracking-widest text-[10px] mb-8 shadow-lg shadow-primary/20">
                  <Sparkles className="w-3 h-3" />
                  Torneo Completado
                </div>

                <h2 className="font-display font-black text-4xl md:text-5xl uppercase tracking-tighter text-white mb-10 drop-shadow-2xl">
                  <Crown className="w-8 h-8 inline-block text-accent mb-2 mr-3" />
                  CAMPEONES
                  <Crown className="w-8 h-8 inline-block text-accent mb-2 ml-3" />
                </h2>

                <div className="flex flex-wrap justify-center gap-12">
                  {tournament.bracket
                    .filter(m => m.round === 'Final' && m.result?.winner)
                    .map(m => {
                      const team = getTeamById(m.result!.winner!);
                      if (!team) return null;
                      return { team, level: team.category || 'General' };
                    })
                    .map(({ team, level }, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <span className="text-primary font-bold tracking-widest text-sm uppercase mb-4 border-b border-primary/30 pb-1">
                          {level}
                        </span>
                        <div className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
                          {team.player1.name} <span className="text-white/30 text-2xl">&</span> {team.player2.name}
                        </div>
                      </div>
                    ))}
                </div>

                <p className="text-xl text-muted-foreground max-w-2xl mx-auto italic mt-12">
                  Enhorabuena a todos los participantes. El cuadro final ha concluido.
                </p>
              </div>
            </div>
          </div>
        )}

        <Bracket
          matches={tournament.bracket}
          teams={tournament.teams}
          onMatchUpdate={updateBracketMatch}
          champion={tournament.champion}
        />
      </main>
    </div>
  );
};

export default Cuadro;
