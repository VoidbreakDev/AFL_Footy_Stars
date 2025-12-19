export enum Position {
  FORWARD = 'Forward',
  MIDFIELDER = 'Midfielder',
  DEFENDER = 'Defender',
  RUCK = 'Ruck',
}

export enum LeagueTier {
  LOCAL = 'Local League',
  STATE = 'State League',
  NATIONAL = 'AFL',
}

export interface PlayerAttributes {
  kicking: number;
  handball: number;
  tackling: number;
  marking: number;
  speed: number;
  stamina: number;
  goalSense: number;
}

export interface Rivalry {
  opponentName: string;
  club: string;
  reason: string;
  intensity: 'Low' | 'Medium' | 'High' | 'Heated';
}

export interface PlayerStats {
  matches: number;
  goals: number;
  behinds: number;
  disposals: number;
  tackles: number;
  votes: number; // Brownlow votes
  premierships: number;
  awards: string[];
}

export interface Milestone {
  id: string;
  type: 'MATCHES' | 'GOALS' | 'DISPOSALS' | 'TACKLES';
  value: number;
  description: string;
  achievedRound: number;
  achievedYear: number; 
}

export interface Contract {
  salary: number;
  yearsLeft: number;
  clubName: string;
  tier: LeagueTier;
}

export interface AvatarConfig {
  faceId: string; 
}

export interface PlayerInjury {
  name: string;
  weeksRemaining: number;
}

export interface PlayerProfile {
  name: string;
  gender: 'Male' | 'Female';
  avatar: AvatarConfig;
  position: Position;
  subPosition: string; 
  age: number;
  potential: number; 
  attributes: PlayerAttributes;
  careerStats: PlayerStats;
  seasonStats: PlayerStats;
  milestones: Milestone[]; 
  contract: Contract;
  xp: number;
  level: number;
  skillPoints: number;
  injury: PlayerInjury | null;
  morale: number; 
  energy: number; 
  rivalries: Rivalry[];
  bio?: string; 
  isRetired?: boolean; 
}

export interface Stadium {
    name: string;
    capacity: number;
    type: 'OVAL' | 'BOUTIQUE' | 'COLOSSEUM';
    turfQuality: 'Average' | 'Good' | 'Elite' | 'Mud Heap';
}

export interface Team {
  id: string;
  name: string;
  wins: number;
  losses: number;
  draws: number;
  percentage: number; 
  points: number; 
  players: { name: string; position: Position; subPosition: string; rating: number }[];
  coach: string;
  stadium: Stadium; // Replaced string homeGround with Stadium object
  colors: [string, string]; 
}

export interface MatchEvent {
  quarter: number;
  time: string;
  description: string;
  type: 'GOAL' | 'BEHIND' | 'MARK' | 'TACKLE' | 'INJURY' | 'GENERIC' | 'RIVALRY' | 'POSSESSION' | 'TURNOVER' | 'FREE_KICK';
  isPlayerInvolved: boolean;
  teamId?: string; 
}

export interface PerformerStats {
    name: string;
    teamId: string;
    goals: number;
    disposals: number;
    isUser: boolean;
}

export interface MatchResult {
  homeScore: { goals: number; behinds: number; total: number; quarters: number[] };
  awayScore: { goals: number; behinds: number; total: number; quarters: number[] };
  winnerId: string | null; 
  playerStats: {
    goals: number;
    behinds: number;
    disposals: number;
    tackles: number;
    votes: number;
  };
  summary: string;
  timeline: MatchEvent[];
  newRivalry?: Rivalry;
  playerInjury?: PlayerInjury; 
  achievedMilestones?: Milestone[]; 
  topPerformers: PerformerStats[]; 
}

export interface Fixture {
  round: number;
  homeTeamId: string;
  awayTeamId: string;
  played: boolean;
  result?: MatchResult;
  matchType?: 'League' | 'Semi Final' | 'Grand Final'; 
}