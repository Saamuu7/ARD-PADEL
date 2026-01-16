export interface Player {
  name: string;
  phone?: string;
}

export interface Team {
  id: string;
  player1: Player;
  player2: Player;
  category?: string;
  status: 'pending' | 'approved' | 'rejected';
  email?: string;
  phone?: string;
  player1Id?: string;
  player2Id?: string;
}

export interface SetScore {
  team1: number;
  team2: number;
}

export interface MatchResult {
  sets: SetScore[];
  winner?: string; // team id
}

export interface Match {
  id: string;
  team1Id: string;
  team2Id: string;
  result?: MatchResult;
  status: 'pending' | 'live' | 'finished';
  round?: string;
  position?: number;
}

export interface GroupStanding {
  teamId: string;
  played: number;
  won: number;
  lost: number;
  gamesFor: number;
  gamesAgainst: number;
  gamesDiff: number;
  position?: number;
}

export interface Group {
  id: string;
  name: string;
  teamIds: string[];
  matches: Match[];
  standings: GroupStanding[];
}

export interface BracketMatch extends Match {
  nextMatchId?: string;
  previousMatchIds?: string[];
}

export interface TournamentConfig {
  name: string;
  description: string;
  date: string;
  time: string;
  image?: string;
  totalTeams: number;
  numberOfGroups: number;
  qualifyFirst: number; // Usually 2
  qualifyThird: boolean;
  numberOfThirdQualifiers: number;
  registrationClosed: boolean;
}

export interface Tournament {
  id: string;
  config: TournamentConfig;
  teams: Team[];
  groups: Group[];
  bracket: BracketMatch[];
  phase: 'registration' | 'groups' | 'bracket' | 'finished';
  champion?: string;
  finishedAt?: number;
}

export type TournamentPhase = Tournament['phase'];
