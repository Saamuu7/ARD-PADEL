import React from 'react';
import { Trophy, ArrowRight } from 'lucide-react';
import { BracketMatch, Team, MatchResult } from '@/types/tournament';
import MatchCard from './MatchCard';

interface BracketProps {
  matches: BracketMatch[];
  teams: Team[];
  onMatchUpdate: (matchId: string, result: MatchResult) => void;
  champion?: string;
  readOnly?: boolean;
}

const Bracket: React.FC<BracketProps> = ({ matches, teams, onMatchUpdate, champion, readOnly = false }) => {
  const getTeam = (teamId: string) => teams.find(t => t.id === teamId);

  // Group matches by level/category
  const matchesByLevel = matches.reduce((acc, match) => {
    let level = 'General';
    // Find category of teams in this match
    if (match.team1Id) {
      const t = getTeam(match.team1Id);
      if (t?.category) level = t.category;
    } else if (match.team2Id) {
      const t = getTeam(match.team2Id);
      if (t?.category) level = t.category;
    } else if (match.previousMatchIds && match.previousMatchIds.length > 0) {
      // If teamIds are empty (future round), look at previous matches
      const prevMatch = matches.find(m => m.id === match.previousMatchIds![0]);
      if (prevMatch) {
        if (prevMatch.team1Id) {
          const t = getTeam(prevMatch.team1Id);
          if (t?.category) level = t.category;
        } else if (prevMatch.team2Id) {
          const t = getTeam(prevMatch.team2Id);
          if (t?.category) level = t.category;
        }
      }
    }

    if (!acc[level]) acc[level] = [];
    acc[level].push(match);
    return acc;
  }, {} as Record<string, BracketMatch[]>);

  const levels = Object.keys(matchesByLevel);

  return (
    <div className="space-y-20">
      {levels.map(level => {
        const levelMatches = matchesByLevel[level];

        // Group matches by round for this level
        const rounds = levelMatches.reduce((acc, match) => {
          const round = match.round || 'Ronda';
          if (!acc[round]) acc[round] = [];
          acc[round].push(match);
          return acc;
        }, {} as Record<string, BracketMatch[]>);

        const roundOrder = ['Dieciseisavos', 'Octavos', 'Cuartos', 'Semifinal', 'Final'];
        const sortedRounds = Object.keys(rounds).sort((a, b) => {
          const aIndex = roundOrder.indexOf(a);
          const bIndex = roundOrder.indexOf(b);
          if (aIndex === -1 && bIndex === -1) return 0;
          if (aIndex === -1) return -1;
          if (bIndex === -1) return 1;
          return aIndex - bIndex;
        });

        return (
          <div key={level} className="space-y-8">
            <div className="flex items-center gap-4 border-b border-primary/20 pb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-display font-black text-2xl uppercase tracking-tighter text-primary">
                Cuadro Final - {level}
              </h2>
            </div>

            <div className="w-full overflow-x-auto pb-8 custom-scrollbar">
              <div className="flex gap-8 min-w-max">
                {sortedRounds.map((round, roundIndex) => (
                  <div key={round} className="flex flex-col">
                    <h3 className="text-center font-display font-black text-[10px] uppercase tracking-widest text-white/30 mb-6 py-2 border-y border-white/5">
                      {round}
                    </h3>
                    <div
                      className="flex flex-col justify-around gap-6 flex-1"
                      style={{
                        paddingTop: `${roundIndex * 40}px`,
                        paddingBottom: `${roundIndex * 40}px`
                      }}
                    >
                      {rounds[round]
                        .sort((a, b) => (a.position || 0) - (b.position || 0))
                        .map((match) => (
                          <div key={match.id} className="flex items-center gap-4">
                            <div className="w-72">
                              <MatchCard
                                match={match}
                                team1={match.team1Id ? getTeam(match.team1Id) : undefined}
                                team2={match.team2Id ? getTeam(match.team2Id) : undefined}
                                onResultSubmit={(result) => onMatchUpdate(match.id, result)}
                                matchNumber={(match.position || 0) + 1}
                                readOnly={readOnly}
                              />
                            </div>
                            {roundIndex < sortedRounds.length - 1 && (
                              <div className="flex flex-col items-center">
                                <div className="h-px w-8 bg-white/10" />
                                <ArrowRight className="w-4 h-4 text-white/10 -mt-[8.5px]" />
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {matches.length === 0 && (
        <div className="tournament-card text-center py-24 border-dashed border-white/10 opacity-60">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8">
            <Trophy className="w-10 h-10 text-white/10" />
          </div>
          <p className="text-white/20 uppercase font-black tracking-[0.4em] text-xs">
            El cuadro final se generará al terminar los grupos
          </p>
        </div>
      )}
    </div>
  );
};

export default Bracket;
