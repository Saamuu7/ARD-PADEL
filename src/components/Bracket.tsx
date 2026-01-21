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
  const [hoveredTeamId, setHoveredTeamId] = React.useState<string | null>(null);
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
          <div key={level} className="space-y-12 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(25,231,142,0.1)]">
                  <Trophy className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className="font-display font-black text-4xl uppercase tracking-tighter text-white leading-none">
                    Cuadro Final
                  </h2>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-[0.4em] mt-1">{level}</p>
                </div>
              </div>

              <div className="px-5 py-2.5 bg-white/5 rounded-full border border-white/10 flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Fase Eliminatoria Directa</span>
              </div>
            </div>

            <div className="w-full overflow-x-auto pb-12 custom-scrollbar">
              <div className="flex gap-16 min-w-max px-4">
                {sortedRounds.map((round, roundIndex) => (
                  <div key={round} className="flex flex-col">
                    <div className="relative mb-12">
                      <h3 className="text-center font-display font-black text-[11px] uppercase tracking-[0.3em] text-white py-3 px-8 bg-white/5 rounded-full border border-white/10">
                        {round}
                      </h3>
                      {roundIndex < sortedRounds.length - 1 && (
                        <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-8 h-px bg-white/5" />
                      )}
                    </div>

                    <div
                      className="flex flex-col justify-around gap-12 flex-1"
                      style={{
                        paddingTop: `${roundIndex * 60}px`,
                        paddingBottom: `${roundIndex * 60}px`
                      }}
                    >
                      {rounds[round]
                        .sort((a, b) => (a.position || 0) - (b.position || 0))
                        .map((match) => {
                          const isMatchHighlighted = hoveredTeamId && (match.team1Id === hoveredTeamId || match.team2Id === hoveredTeamId);
                          const isWinnerHighlighted = hoveredTeamId && match.result?.winner === hoveredTeamId;

                          return (
                            <div key={match.id} className="flex items-center gap-8 relative">
                              <div
                                className={`w-80 transition-all duration-500 rounded-[2rem] ${isMatchHighlighted ? 'scale-105 shadow-[0_0_40px_rgba(25,231,142,0.15)] z-10' : 'opacity-80 grayscale-[0.5]'
                                  } ${hoveredTeamId && !isMatchHighlighted ? 'opacity-40 scale-95 blur-[0.5px]' : ''}`}
                                onMouseEnter={(e) => {
                                  // This is handled inside MatchCard normally, but we can wrap it or use props
                                }}
                              >
                                <div
                                  onMouseEnter={() => match.team1Id && setHoveredTeamId(match.team1Id)}
                                  onMouseLeave={() => setHoveredTeamId(null)}
                                  className="contents"
                                >
                                  <MatchCard
                                    match={match}
                                    team1={match.team1Id ? getTeam(match.team1Id) : undefined}
                                    team2={match.team2Id ? getTeam(match.team2Id) : undefined}
                                    onResultSubmit={(result) => onMatchUpdate(match.id, result)}
                                    matchNumber={(match.position || 0) + 1}
                                    readOnly={readOnly}
                                  />
                                </div>
                              </div>

                              {roundIndex < sortedRounds.length - 1 && (
                                <div className="flex items-center flex-1">
                                  <div className={`h-[2px] w-12 transition-all duration-700 ${isWinnerHighlighted ? 'bg-primary shadow-[0_0_15px_rgba(25,231,142,0.5)]' : 'bg-white/5'
                                    }`} />
                                  <div className={`w-3 h-3 rounded-full border-2 transition-all duration-700 -ml-1.5 ${isWinnerHighlighted ? 'bg-primary border-primary scale-125' : 'bg-[#0a0a0a] border-white/10'
                                    }`} />
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {matches.length === 0 && (
        <div className="tournament-card text-center py-32 border-dashed border-white/10 opacity-60 bg-white/[0.02] rounded-[3rem]">
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-10 border border-white/5">
            <Trophy className="w-12 h-12 text-white/10" />
          </div>
          <h3 className="text-white/40 uppercase font-black tracking-[0.5em] text-sm mb-4">Hoja de Ruta</h3>
          <p className="text-white/20 uppercase font-bold tracking-widest text-xs max-w-sm mx-auto leading-relaxed">
            El cuadro final se generará automáticamente tras completar la fase de grupos.
          </p>
        </div>
      )}
    </div>
  );
};

export default Bracket;
