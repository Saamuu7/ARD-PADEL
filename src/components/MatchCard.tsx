import React, { useState } from 'react';
import { Check, Clock, Play, Trophy, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Match, MatchResult, SetScore, Team } from '@/types/tournament';
import { formatMatchScore, determineWinner } from '@/utils/tournamentUtils';

interface MatchCardProps {
  match: Match;
  team1?: Team;
  team2?: Team;
  onResultSubmit: (result: MatchResult) => void;
  matchNumber?: number;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, team1, team2, onResultSubmit, matchNumber }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [sets, setSets] = useState<SetScore[]>([
    { team1: 0, team2: 0 },
    { team1: 0, team2: 0 },
    { team1: 0, team2: 0 },
  ]);

  const handleEditClick = () => {
    if (match.result?.sets) {
      // Pad with empty sets if less than 3
      const currentSets = [...match.result.sets];
      while (currentSets.length < 3) {
        currentSets.push({ team1: 0, team2: 0 });
      }
      setSets(currentSets);
    }
    setIsEditing(true);
  };

  const handleSetChange = (setIndex: number, team: 'team1' | 'team2', value: string) => {
    // Only allow digits
    const cleanValue = value.replace(/\D/g, '');
    const numValue = parseInt(cleanValue) || 0;

    setSets(prev => {
      const newSets = [...prev];
      newSets[setIndex] = { ...newSets[setIndex], [team]: Math.min(Math.max(0, numValue), 7) };
      return newSets;
    });
  };

  const handleSubmit = () => {
    // Filter out empty sets
    const validSets = sets.filter(set => set.team1 > 0 || set.team2 > 0);
    if (validSets.length < 1) return;

    const result: MatchResult = {
      sets: validSets,
      winner: determineWinner({ sets: validSets }, match.team1Id, match.team2Id),
    };

    onResultSubmit(result);
    setIsEditing(false);
  };

  const getStatusIcon = () => {
    switch (match.status) {
      case 'finished':
        return <Check className="w-4 h-4 text-primary" />;
      case 'live':
        return <Play className="w-4 h-4 text-accent" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusClass = () => {
    switch (match.status) {
      case 'finished':
        return 'match-card-finished';
      case 'live':
        return 'match-card-live';
      default:
        return 'match-card-pending';
    }
  };

  const team1Name = team1 ? `${team1.player1.name} / ${team1.player2.name}` : 'Por determinar';
  const team2Name = team2 ? `${team2.player1.name} / ${team2.player2.name}` : 'Por determinar';

  return (
    <div className={`match-card ${getStatusClass()}`}>
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
            {matchNumber ? `Partido ${matchNumber}` : (match.round || 'Encuentro')}
          </span>
        </div>
        {match.status === 'finished' && match.result && (
          <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md">
            {formatMatchScore(match.result)}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${match.result?.winner === match.team1Id ? 'bg-primary/10 border border-primary/20' : 'bg-white/5 border border-white/5'
          }`}>
          <span className={`text-sm font-bold ${match.result?.winner === match.team1Id ? 'text-primary' : 'text-white/60'
            }`}>
            {team1Name}
          </span>
          {match.result?.winner === match.team1Id && (
            <Trophy className="w-4 h-4 text-primary" />
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-white/5" />
          <div className="text-[10px] text-white/20 font-black uppercase tracking-widest">VS</div>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        <div className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${match.result?.winner === match.team2Id ? 'bg-primary/10 border border-primary/20' : 'bg-white/5 border border-white/5'
          }`}>
          <span className={`text-sm font-bold ${match.result?.winner === match.team2Id ? 'text-primary' : 'text-white/60'
            }`}>
            {team2Name}
          </span>
          {match.result?.winner === match.team2Id && (
            <Trophy className="w-4 h-4 text-primary" />
          )}
        </div>
      </div>

      {/* Result Input */}
      {team1 && team2 && !isEditing && (
        <Button
          onClick={handleEditClick}
          variant={match.status === 'finished' ? "ghost" : "outline"}
          className={`w-full mt-4 text-[10px] font-black uppercase tracking-widest transition-all duration-300 py-6 ${match.status === 'finished'
              ? 'text-white/40 hover:text-primary hover:bg-primary/10'
              : 'border-white/10 hover:bg-primary/10 hover:border-primary/20 hover:text-primary'
            }`}
        >
          {match.status === 'finished' ? (
            <>
              <Pencil className="w-3 h-3 mr-2" />
              Modificar Resultado
            </>
          ) : (
            'Introducir Resultado'
          )}
        </Button>
      )}

      {isEditing && (
        <div className="mt-4 p-5 bg-white/5 rounded-2xl border border-white/10 animate-fade-in">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4 text-center">
            Introduce los juegos por set
          </p>
          <div className="space-y-3">
            {sets.map((set, index) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-bold text-white/40 uppercase w-12 shrink-0">Set {index + 1}</span>
                <div className="flex items-center gap-2 flex-1 justify-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={set.team1 || ''}
                    onChange={(e) => handleSetChange(index, 'team1', e.target.value)}
                    className="w-14 h-10 bg-black/40 border border-white/10 rounded-lg text-center font-black text-white focus:border-primary/50 transition-all outline-none"
                    placeholder="0"
                  />
                  <span className="text-white/20 font-black">-</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={set.team2 || ''}
                    onChange={(e) => handleSetChange(index, 'team2', e.target.value)}
                    className="w-14 h-10 bg-black/40 border border-white/10 rounded-lg text-center font-black text-white focus:border-primary/50 transition-all outline-none"
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleSubmit}
              className="flex-1 btn-primary-gradient py-6 text-[10px] font-black uppercase tracking-widest"
            >
              Confirmar
            </Button>
            <Button
              onClick={() => setIsEditing(false)}
              variant="ghost"
              className="flex-1 py-6 text-[10px] font-black uppercase tracking-widest hover:bg-white/5"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchCard;
