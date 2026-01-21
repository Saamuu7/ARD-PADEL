import { Match, MatchResult, Group, GroupStanding, BracketMatch } from '@/types/tournament';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const generateGroupMatches = (teamIds: string[]): Match[] => {
  const allPossibleMatches: Match[] = [];

  // 1. Generate all unique pairs
  for (let i = 0; i < teamIds.length; i++) {
    for (let j = i + 1; j < teamIds.length; j++) {
      allPossibleMatches.push({
        id: generateId(),
        team1Id: teamIds[i],
        team2Id: teamIds[j],
        status: 'pending',
      });
    }
  }

  // 2. Order matches greedily to avoid consecutive games
  const orderedMatches: Match[] = [];
  const matchesPool = [...allPossibleMatches];
  let lastMatchTeams: string[] = [];
  let secondLastMatchTeams: string[] = [];

  while (matchesPool.length > 0) {
    // Score each remaining match based on rest for both teams
    // Matches where both teams didn't play in last 2 matches get highest score
    let bestMatchIdx = 0;
    let highestScore = -1;

    for (let i = 0; i < matchesPool.length; i++) {
      const match = matchesPool[i];
      let score = 0;

      const t1 = match.team1Id;
      const t2 = match.team2Id;

      // Bonus if team wasn't in last match
      if (!lastMatchTeams.includes(t1)) score += 10;
      if (!lastMatchTeams.includes(t2)) score += 10;

      // Extra bonus if team wasn't in second to last match either
      if (!secondLastMatchTeams.includes(t1)) score += 5;
      if (!secondLastMatchTeams.includes(t2)) score += 5;

      // Random variance to break ties and make it different each generation
      score += Math.random() * 2;

      if (score > highestScore) {
        highestScore = score;
        bestMatchIdx = i;
      }
    }

    const selectedMatch = matchesPool.splice(bestMatchIdx, 1)[0];
    orderedMatches.push(selectedMatch);

    secondLastMatchTeams = lastMatchTeams;
    lastMatchTeams = [selectedMatch.team1Id, selectedMatch.team2Id];
  }

  return orderedMatches;
};

export const calculateTotalGames = (result: MatchResult): { team1: number; team2: number } => {
  return result.sets.reduce(
    (acc, set) => ({
      team1: acc.team1 + set.team1,
      team2: acc.team2 + set.team2,
    }),
    { team1: 0, team2: 0 }
  );
};

export const determineWinner = (result: MatchResult, team1Id: string, team2Id: string): string => {
  let team1Sets = 0;
  let team2Sets = 0;

  result.sets.forEach(set => {
    if (set.team1 > set.team2) team1Sets++;
    else if (set.team2 > set.team1) team2Sets++;
  });

  return team1Sets > team2Sets ? team1Id : team2Id;
};

export const calculateStandings = (teamIds: string[], matches: Match[]): GroupStanding[] => {
  const standings: Map<string, GroupStanding> = new Map();

  // Initialize standings
  teamIds.forEach(teamId => {
    standings.set(teamId, {
      teamId,
      played: 0,
      won: 0,
      lost: 0,
      gamesFor: 0,
      gamesAgainst: 0,
      gamesDiff: 0,
    });
  });

  // Process matches
  matches.forEach(match => {
    if (match.status !== 'finished' || !match.result) return;

    const team1Standing = standings.get(match.team1Id)!;
    const team2Standing = standings.get(match.team2Id)!;
    const games = calculateTotalGames(match.result);

    team1Standing.played++;
    team2Standing.played++;

    team1Standing.gamesFor += games.team1;
    team1Standing.gamesAgainst += games.team2;
    team2Standing.gamesFor += games.team2;
    team2Standing.gamesAgainst += games.team1;

    if (match.result.winner === match.team1Id) {
      team1Standing.won++;
      team2Standing.lost++;
    } else {
      team2Standing.won++;
      team1Standing.lost++;
    }

    team1Standing.gamesDiff = team1Standing.gamesFor - team1Standing.gamesAgainst;
    team2Standing.gamesDiff = team2Standing.gamesFor - team2Standing.gamesAgainst;
  });

  // Sort standings
  const sortedStandings = Array.from(standings.values()).sort((a, b) => {
    if (b.won !== a.won) return b.won - a.won;
    return b.gamesDiff - a.gamesDiff;
  });

  // Add positions
  sortedStandings.forEach((standing, index) => {
    standing.position = index + 1;
  });

  return sortedStandings;
};

interface RankedTeam {
  teamId: string;
  groupId: string;
  position: number;
  won: number;
  gamesDiff: number;
}

export const getRankedTeams = (
  groups: Group[],
  qualifyFirst: number,
  numberOfThirdQualifiers: number
): RankedTeam[] => {
  const rankedTeams: RankedTeam[] = [];
  const thirds: RankedTeam[] = [];

  groups.forEach(group => {
    group.standings.forEach((standing, index) => {
      const ranked: RankedTeam = {
        teamId: standing.teamId,
        groupId: group.id,
        position: index + 1,
        won: standing.won,
        gamesDiff: standing.gamesDiff,
      };

      if (index < qualifyFirst) {
        rankedTeams.push(ranked);
      } else if (index === qualifyFirst && numberOfThirdQualifiers > 0) {
        thirds.push(ranked);
      }
    });
  });

  // Sort thirds by performance and take the best ones
  if (numberOfThirdQualifiers > 0) {
    thirds.sort((a, b) => {
      if (b.won !== a.won) return b.won - a.won;
      return b.gamesDiff - a.gamesDiff;
    });

    rankedTeams.push(...thirds.slice(0, numberOfThirdQualifiers));
  }

  return rankedTeams;
};

export const generateBracket = (rankedTeams: RankedTeam[], groups: Group[]): BracketMatch[] => {
  const bracket: BracketMatch[] = [];
  const totalTeams = rankedTeams.length;

  // Determine bracket size (8 for quarterfinals, 16 for round of 16, etc.)
  let bracketSize = 2;
  while (bracketSize < totalTeams) bracketSize *= 2;

  // Get round name
  const getRoundName = (matchesInRound: number): string => {
    switch (matchesInRound) {
      case 1: return 'Final';
      case 2: return 'Semifinal';
      case 4: return 'Cuartos';
      case 8: return 'Octavos';
      case 16: return 'Dieciseisavos';
      default: return `Ronda de ${matchesInRound * 2}`;
    }
  };

  // Separate teams by position
  const firsts = rankedTeams.filter(t => t.position === 1).sort((a, b) => b.gamesDiff - a.gamesDiff);
  const seconds = rankedTeams.filter(t => t.position === 2).sort((a, b) => b.gamesDiff - a.gamesDiff);
  const thirds = rankedTeams.filter(t => t.position === 3).sort((a, b) => b.gamesDiff - a.gamesDiff);

  // Create first round matches
  // Top 4 firsts vs thirds (if thirds qualify)
  // Rest of firsts vs seconds
  const firstRoundMatches: BracketMatch[] = [];
  let matchPosition = 0;

  // If we have thirds, pair best firsts with thirds
  if (thirds.length > 0) {
    for (let i = 0; i < Math.min(firsts.length, thirds.length); i++) {
      if (i < thirds.length) {
        firstRoundMatches.push({
          id: generateId(),
          team1Id: firsts[i].teamId,
          team2Id: thirds[thirds.length - 1 - i].teamId, // Worst third vs best first
          status: 'pending',
          round: getRoundName(totalTeams / 2),
          position: matchPosition++,
        });
      }
    }
  }

  // Pair remaining firsts with seconds (avoiding same group)
  const usedFirsts = new Set(firstRoundMatches.map(m => m.team1Id));
  const remainingFirsts = firsts.filter(f => !usedFirsts.has(f.teamId));

  // Simple pairing: 1st of group A vs 2nd of group B, etc.
  const usedSeconds = new Set<string>();

  remainingFirsts.forEach(first => {
    // Find a second from a different group
    const opponent = seconds.find(s =>
      s.groupId !== first.groupId && !usedSeconds.has(s.teamId)
    ) || seconds.find(s => !usedSeconds.has(s.teamId));

    if (opponent) {
      usedSeconds.add(opponent.teamId);
      firstRoundMatches.push({
        id: generateId(),
        team1Id: first.teamId,
        team2Id: opponent.teamId,
        status: 'pending',
        round: getRoundName(totalTeams / 2),
        position: matchPosition++,
      });
    }
  });

  // Add any remaining seconds that weren't paired
  const remainingSeconds = seconds.filter(s => !usedSeconds.has(s.teamId));
  for (let i = 0; i < remainingSeconds.length; i += 2) {
    if (remainingSeconds[i + 1]) {
      firstRoundMatches.push({
        id: generateId(),
        team1Id: remainingSeconds[i].teamId,
        team2Id: remainingSeconds[i + 1].teamId,
        status: 'pending',
        round: getRoundName(totalTeams / 2),
        position: matchPosition++,
      });
    }
  }

  bracket.push(...firstRoundMatches);

  // Generate subsequent rounds
  let currentRoundMatches = firstRoundMatches;
  while (currentRoundMatches.length > 1) {
    const nextRoundMatches: BracketMatch[] = [];
    const roundName = getRoundName(currentRoundMatches.length / 2);

    for (let i = 0; i < currentRoundMatches.length; i += 2) {
      const matchId = generateId();
      const match: BracketMatch = {
        id: matchId,
        team1Id: '', // Will be filled when previous match completes
        team2Id: '',
        status: 'pending',
        round: roundName,
        position: i / 2,
        previousMatchIds: [currentRoundMatches[i].id, currentRoundMatches[i + 1]?.id].filter(Boolean),
      };

      // Link previous matches to this one
      currentRoundMatches[i].nextMatchId = matchId;
      if (currentRoundMatches[i + 1]) {
        currentRoundMatches[i + 1].nextMatchId = matchId;
      }

      nextRoundMatches.push(match);
    }

    bracket.push(...nextRoundMatches);
    currentRoundMatches = nextRoundMatches;
  }

  return bracket;
};

export const formatMatchScore = (result: MatchResult): string => {
  return result.sets.map(set => `${set.team1}-${set.team2}`).join(' / ');
};
export const calculatePlayerStats = (tournaments: any[], playerId: string) => {
  let matchesPlayed = 0;
  let matchesWon = 0;
  let setsWon = 0;
  let totalSets = 0;
  let gamesWon = 0;
  let totalGames = 0;
  let tournamentsPlayed = 0;

  tournaments.forEach(t => {
    const myTeam = t.teams.find((team: any) =>
      String(team.player1Id) === String(playerId) ||
      String(team.player2Id) === String(playerId)
    );

    if (myTeam) {
      tournamentsPlayed++;
      const allMatches = [
        ...t.groups.flatMap((g: any) => g.matches),
        ...t.bracket
      ];

      allMatches.forEach((m: any) => {
        const isP1 = String(m.team1Id) === String(myTeam.id);
        const isP2 = String(m.team2Id) === String(myTeam.id);

        if ((isP1 || isP2) && m.status === 'finished' && m.result) {
          matchesPlayed++;
          const isWinner = String(m.result.winner) === String(myTeam.id);
          if (isWinner) matchesWon++;

          m.result.sets.forEach((set: any) => {
            totalSets++;
            const pGames = isP1 ? set.team1 : set.team2;
            const oGames = isP1 ? set.team2 : set.team1;
            if (pGames > oGames) setsWon++;
            gamesWon += pGames;
            totalGames += (pGames + oGames);
          });
        }
      });
    }
  });

  const winRate = matchesPlayed > 0 ? Math.round((matchesWon / matchesPlayed) * 100) : 0;
  const ardLevel = Math.min(5, 1 + (winRate / 25) + (tournamentsPlayed * 0.2));

  return {
    matchesPlayed,
    matchesWon,
    winRate,
    setsWon,
    totalSets,
    gamesWon,
    totalGames,
    tournamentsPlayed,
    ardLevel: parseFloat(ardLevel.toFixed(1))
  };
};
