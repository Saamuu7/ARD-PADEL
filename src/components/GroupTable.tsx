import React from 'react';
import { Trophy } from 'lucide-react';
import { Group, Team } from '@/types/tournament';

interface GroupTableProps {
  group: Group;
  teams: Team[];
  qualifyCount?: number;
  qualifiedTeamIds?: string[];
  thirdQualifiedIds?: string[];
}

const GroupTable: React.FC<GroupTableProps> = ({ group, teams, qualifyCount = 2, qualifiedTeamIds, thirdQualifiedIds }) => {
  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team ? `${team.player1.name} / ${team.player2.name}` : 'Desconocido';
  };

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
              // Determine Qualification Status
              const isQualified = qualifiedTeamIds
                ? qualifiedTeamIds.includes(standing.teamId)
                : index < qualifyCount;

              const isThird = isQualified && thirdQualifiedIds?.includes(standing.teamId);
              const isDirect = isQualified && !isThird;

              // Styles
              let rowClass = "";
              let badgeClass = "bg-secondary text-secondary-foreground";
              let textClass = "text-foreground";
              let checkColor = "";

              if (isDirect) {
                rowClass = "bg-court-green-light/50";
                badgeClass = "bg-primary text-primary-foreground";
                textClass = "text-primary";
                checkColor = "text-primary";
              } else if (isThird) {
                rowClass = "bg-yellow-500/20";
                badgeClass = "bg-yellow-500 text-black";
                textClass = "text-yellow-500";
                checkColor = "text-yellow-500";
              }

              return (
                <tr
                  key={standing.teamId}
                  className={`table-row-striped border-b border-border last:border-0 transition-colors ${rowClass}`}
                >
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold ${badgeClass}`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${textClass}`}>
                      {getTeamName(standing.teamId)}
                    </span>
                    {isQualified && (
                      <span className={`ml-2 text-xs ${checkColor}`}>✓</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">
                    {standing.played}
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-primary">
                    {standing.won}
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">
                    {standing.lost}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-medium ${standing.gamesDiff > 0
                      ? 'text-primary'
                      : standing.gamesDiff < 0
                        ? 'text-destructive'
                        : 'text-muted-foreground'
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

      <div className="px-4 py-2 bg-muted text-xs text-muted-foreground">
        PJ: Partidos Jugados · PG: Partidos Ganados · PP: Partidos Perdidos · DG: Diferencia de Juegos
      </div>
    </div>
  );
};

export default GroupTable;
