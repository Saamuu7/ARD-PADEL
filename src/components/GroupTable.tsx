import React from 'react';
import { Trophy, Star, ShieldCheck, User } from 'lucide-react';
import { Group, Team, Player } from '@/types/tournament';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { calculatePlayerStats } from '@/utils/tournamentUtils';
import { useTournament } from '@/context/TournamentContext';

interface GroupTableProps {
  group: Group;
  teams: Team[];
  qualifyCount?: number;
  qualifiedTeamIds?: string[];
  thirdQualifiedIds?: string[];
}

const PlayerHoverCard: React.FC<{ player: Player, playerId?: string }> = ({ player, playerId }) => {
  const { tournaments } = useTournament();

  const stats = playerId
    ? calculatePlayerStats(tournaments, playerId)
    : { ardLevel: 1.0, winRate: 0, matchesPlayed: 0 };

  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger asChild>
        <span className="cursor-help font-bold hover:text-primary transition-all border-b border-primary/10 hover:border-primary pb-0.5 whitespace-nowrap">
          {player.name}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 bg-card/95 backdrop-blur-2xl border-white/10 p-0 overflow-hidden rounded-3xl shadow-2xl relative z-50">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <User className="w-20 h-20 text-primary" />
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Atleta ARD Verificado</p>
              <h4 className="font-black text-sm uppercase tracking-tight text-white">{player.name}</h4>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">ARD Score</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white">{stats.ardLevel}</span>
                <Star className="w-3 h-3 text-accent fill-accent" />
              </div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">Win Rate</p>
              <span className="text-2xl font-black text-primary">{stats.winRate}%</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40">
              <span>Experiencia</span>
              <span className="text-white">{stats.matchesPlayed} Partidos</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary shadow-[0_0_10px_rgba(25,231,142,0.5)] transition-all duration-1000"
                style={{ width: `${Math.min(100, (stats.matchesPlayed / 10) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-primary/10 px-6 py-3 border-t border-white/5">
          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-primary/60 text-center uppercase">Perfil Profesional Sincronizado</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

const GroupTable: React.FC<GroupTableProps> = ({ group, teams, qualifyCount = 2, qualifiedTeamIds, thirdQualifiedIds }) => {
  const getTeam = (teamId: string) => teams.find(t => t.id === teamId);

  return (
    <div className="group-card">
      <div className="bg-primary px-4 py-3 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-primary-foreground" />
        <h3 className="font-display font-bold text-lg text-primary-foreground">
          {group.name}
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Pareja</th>
              <th className="px-4 py-3 text-center">PJ</th>
              <th className="px-4 py-3 text-center">PG</th>
              <th className="px-4 py-3 text-center">PP</th>
              <th className="px-4 py-3 text-center">DG</th>
            </tr>
          </thead>
          <tbody>
            {group.standings.map((standing, index) => {
              const isQualified = qualifiedTeamIds
                ? qualifiedTeamIds.includes(standing.teamId)
                : index < qualifyCount;

              const isThird = isQualified && thirdQualifiedIds?.includes(standing.teamId);
              const isDirect = isQualified && !isThird;

              let rowClass = "";
              let badgeClass = "bg-secondary text-secondary-foreground";
              let checkColor = "";

              if (isDirect) {
                rowClass = "bg-primary/5";
                badgeClass = "bg-primary text-primary-foreground";
                checkColor = "text-primary";
              } else if (isThird) {
                rowClass = "bg-yellow-500/5";
                badgeClass = "bg-yellow-500 text-black";
                checkColor = "text-yellow-500";
              }

              return (
                <tr
                  key={standing.teamId}
                  className={`border-b border-white/5 last:border-0 transition-colors hover:bg-white/5 ${rowClass}`}
                >
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black ${badgeClass}`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const team = getTeam(standing.teamId);
                        if (!team) return <span className="text-muted-foreground italic text-xs">Desconocido</span>;
                        return (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <PlayerHoverCard player={team.player1} playerId={team.player1Id} />
                            <span className="text-primary/30 font-black italic text-[10px]">/</span>
                            <PlayerHoverCard player={team.player2} playerId={team.player2Id} />
                            {isQualified && (
                              <span className={`ml-2 text-xs ${checkColor}`}>✓</span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-white/50 text-sm font-medium">
                    {standing.played}
                  </td>
                  <td className="px-4 py-3 text-center font-black text-primary">
                    {standing.won}
                  </td>
                  <td className="px-4 py-3 text-center text-white/30 text-sm font-medium">
                    {standing.lost}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-sm font-black ${standing.gamesDiff > 0
                      ? 'text-primary'
                      : standing.gamesDiff < 0
                        ? 'text-destructive'
                        : 'text-white/40'
                      }`}>
                      {standing.gamesDiff > 0 ? '+' : ''}{standing.gamesDiff}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 text-[9px] text-white/20 uppercase font-black tracking-widest flex justify-between items-center">
        <span>Partidos: Ganados / Perdidos</span>
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Directo</span>
          <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Repesca</span>
        </div>
      </div>
    </div>
  );
};

export default GroupTable;
