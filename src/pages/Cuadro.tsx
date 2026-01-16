import React from 'react';
import { Link } from 'react-router-dom';
import { GitBranch, AlertCircle, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Bracket from '@/components/Bracket';
import { useTournament } from '@/context/TournamentContext';

const Cuadro: React.FC = () => {
  const { activeTournament: tournament, updateBracketMatch } = useTournament();

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
