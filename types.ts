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

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: Date;
  round: number;
  season: number;
}

export interface MasterSkill {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: keyof PlayerAttributes; // Which attribute this skill belongs to
  prerequisiteLevel: number; // Required attribute level to unlock
  xpCost: number; // XP required to unlock
  spCost: number; // Skill Points required to unlock
  effectType: 'MATCH_BONUS' | 'HIGHLIGHT_UNLOCK' | 'ATTRIBUTE_MULTIPLIER';
  effectValue: number; // Strength of the effect
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
}

export interface UnlockedMasterSkill {
  skillId: string;
  unlockRound: number;
  unlockYear: number;
}

export interface DailyReward {
  lastClaimDate: string; // ISO date string
  streak: number;
  totalLogins: number;
}

export interface TransferOffer {
  id: string;
  clubName: string;
  tier: LeagueTier;
  salary: number;
  contractLength: number; // years
  role: 'STAR' | 'STARTER' | 'ROTATION' | 'DEPTH';
  teamRanking: number; // ladder position (1-10)
  expiresRound: number;
  reason: string; // Why they want you
  teamColors: [string, string];
}

export interface MediaEvent {
  id: string;
  type: 'INTERVIEW' | 'CONTROVERSY' | 'PRAISE' | 'CRITICISM' | 'SOCIAL_MEDIA';
  title: string;
  description: string;
  reputationImpact: number; // -20 to +20
  fanImpact: number; // -1000 to +1000
  round: number;
  year: number;
  hasResponded?: boolean;
}

export interface FanMilestone {
  followers: number;
  title: string;
  icon: string;
  unlocked: boolean;
}

export interface MediaReputation {
  score: number; // 0-100 scale
  tier: 'UNKNOWN' | 'CONTROVERSIAL' | 'DECENT' | 'POPULAR' | 'SUPERSTAR' | 'LEGEND';
  fanFollowers: number; // Total fan base
  socialMediaPosts?: number; // Total posts made
  mediaEvents: MediaEvent[]; // History of media interactions
  fanMilestones?: FanMilestone[];
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

  // New Quick Wins features
  achievements?: UnlockedAchievement[];
  dailyRewards?: DailyReward;
  nickname?: string;
  jerseyNumber?: number;

  // Achievement tracking stats
  totalSkillPointsEarned?: number;
  trainingSessions?: number;
  winStreak?: number;
  injuryFreeStreak?: number;
  highMoraleStreak?: number;
  voteStreak?: number;
  clubsPlayed?: string[];

  // Transfer system
  transferOffers?: TransferOffer[];

  // Economy system
  wallet?: number; // Money available to spend
  lifetimeEarnings?: number; // Total money earned in career
  itemsPurchased?: string[]; // IDs of purchased items

  // Multi-season progression
  currentYear?: number; // Current season year (1, 2, 3, etc.)
  seasonsPlayed?: number; // Total seasons completed
  careerHistory?: SeasonHistory[]; // Record of each season

  // Media & Fan System
  mediaReputation?: MediaReputation;

  // Career Events & Random Encounters
  activeCareerEvents?: CareerEvent[]; // Events awaiting player response
  careerEventHistory?: CareerEventHistory[]; // Past events for reference

  // Team Chemistry & Relationships
  teammates?: TeammateRelationship[]; // Current teammates
  teamChemistry?: TeamChemistry; // Overall team chemistry
  chemistryEvents?: ChemistryEvent[]; // Active chemistry events

  // Coaching & Staff System
  coachingStaff?: CoachingStaff; // Club's coaching and support staff
  coachingEvents?: CoachingEvent[]; // Active coaching interactions
  motivationBoost?: number; // Temporary performance boost from coaching (%)
  motivationExpiry?: number; // Round when motivation boost expires

  // Master Skill Tree
  masterSkills?: UnlockedMasterSkill[]; // Unlocked master skills
}

export interface SeasonHistory {
  year: number;
  tier: LeagueTier;
  club: string;
  ladderPosition: number; // Finishing position (1-10)
  stats: PlayerStats; // Season stats
  promoted?: boolean; // Moved up a tier
  relegated?: boolean; // Moved down a tier
  premiership?: boolean; // Won the flag
  awards?: Award[]; // Awards won this season
}

export interface Award {
  type: string; // AwardType enum value
  year: number;
  tier: LeagueTier;
  value?: number; // e.g., votes for Brownlow, goals for Coleman
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  category: 'TRAINING' | 'RECOVERY' | 'COSMETIC' | 'CAREER';
  effect: {
    type: 'ENERGY' | 'SKILL_POINTS' | 'MORALE' | 'INJURY_HEAL' | 'XP_BOOST' | 'ATTRIBUTE_BOOST' | 'COSMETIC';
    value: number;
    attribute?: keyof PlayerAttributes;
  };
  oneTime?: boolean; // Can only be purchased once
}

export interface Stadium {
    name: string;
    capacity: number;
    type: 'OVAL' | 'BOUTIQUE' | 'COLOSSEUM';
    turfQuality: 'Average' | 'Good' | 'Elite' | 'Mud Heap';
}

export interface AIPlayer {
  name: string;
  position: Position;
  subPosition: string;
  rating: number;
  age: number; // Age for retirement tracking
  potential: number; // Max rating this player can reach
  attributes: PlayerAttributes; // Simplified attributes based on rating and position
}

export interface Team {
  id: string;
  name: string;
  wins: number;
  losses: number;
  draws: number;
  percentage: number;
  points: number;
  players: AIPlayer[];
  coach: string;
  stadium: Stadium; // Replaced string homeGround with Stadium object
  colors: [string, string];
  logo?: string; // Emoji or image URL for team logo
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

export interface DraftProspect {
  id: string;
  name: string;
  age: number;
  position: Position;
  subPosition: string;
  state: string; // State they're from (VIC, NSW, etc.)
  attributes: PlayerAttributes;
  potential: number; // Max rating they can reach (65-95)
  rating: number; // Current overall rating
  bio: string; // Short description of playstyle
  strengths: string[]; // Key strengths (e.g., "Elite kicking", "Strong overhead")
  weaknesses: string[]; // Areas to improve
  draftRank: number; // Projected draft position (1-30)
}

export interface DraftPick {
  pickNumber: number;
  round: number;
  teamId: string;
  teamName: string;
  prospectId?: string; // ID of selected prospect (undefined if pick hasn't happened yet)
}

export interface DraftClass {
  year: number;
  prospects: DraftProspect[];
  picks: DraftPick[];
  userPickNumber?: number; // If user's team has a pick
  completed: boolean;
}

export interface CareerEvent {
  id: string;
  type: 'PERSONAL' | 'PROFESSIONAL' | 'RIVALRY' | 'TEAMMATE' | 'INJURY' | 'FINANCIAL' | 'OPPORTUNITY' | 'CRISIS';
  category: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'CHOICE';
  title: string;
  description: string;
  round: number;
  year: number;

  // Event outcomes (applied if no choice, or after choice is made)
  immediateEffects?: CareerEventEffect;

  // For choice-based events
  choices?: CareerEventChoice[];
  choiceMade?: string; // ID of choice selected
  resolved: boolean;

  // Visual & narrative
  icon: string;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

  // Triggers and conditions (for event generation logic)
  triggerCondition?: string; // e.g., "WIN_STREAK_5", "LOW_MORALE", "FIRST_SEASON"
}

export interface CareerEventEffect {
  // Attribute changes
  attributeChanges?: Partial<Record<keyof PlayerAttributes, number>>; // +/- to attributes

  // Status changes
  morale?: number; // +/- morale
  energy?: number; // +/- energy
  xp?: number; // Bonus XP
  skillPoints?: number; // Bonus skill points
  wallet?: number; // +/- money

  // Reputation & relationships
  mediaReputation?: number; // +/- media score
  fanFollowers?: number; // +/- fans

  // Special effects
  injuryWeeks?: number; // Injury duration (0 = heal existing injury)
  contractSalaryBonus?: number; // % increase to salary

  // Narrative items
  addRivalry?: Rivalry;
  unlockAchievement?: string; // Achievement ID to unlock

  // Text feedback
  resultText?: string; // Describe what happened
}

export interface CareerEventChoice {
  id: string;
  label: string;
  description: string;
  icon: string;
  effects: CareerEventEffect;
  risk?: 'LOW' | 'MEDIUM' | 'HIGH'; // Visual indicator of risk level
}

export interface CareerEventHistory {
  eventId: string;
  title: string;
  round: number;
  year: number;
  choiceMade?: string;
  outcome: string; // Summary of what happened
  icon: string;
}

// ===== TEAM CHEMISTRY & RELATIONSHIPS =====

export interface TeammateRelationship {
  id: string;
  name: string;
  position: Position;
  subPosition: string;
  rating: number; // Overall player rating
  age: number;

  // Relationship metrics
  chemistry: number; // 0-100 scale (how well you work together)
  friendship: number; // 0-100 scale (personal relationship)
  trust: number; // 0-100 scale (reliability/dependability)
  respect: number; // 0-100 scale (professional respect)

  // Relationship status
  status: 'STRANGER' | 'ACQUAINTANCE' | 'FRIEND' | 'CLOSE_FRIEND' | 'BEST_MATE' | 'RIVAL' | 'ENEMY';

  // Traits and personality
  personality: 'LEADER' | 'JOKER' | 'QUIET' | 'INTENSE' | 'SUPPORTIVE' | 'COMPETITIVE';

  // Interaction history
  matchesTogether: number;
  assists?: number; // Times they've assisted your goals
  youAssisted?: number; // Times you've assisted their goals
  conflicts?: number; // Negative interactions

  // Special bonds
  mentor?: boolean; // They mentor you
  mentee?: boolean; // You mentor them
  onFieldPartner?: boolean; // Key on-field connection

  // Recent interactions
  lastInteraction?: RelationshipInteraction;
  interactionHistory?: RelationshipInteraction[];
}

export interface RelationshipInteraction {
  type: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  event: string; // Description of what happened
  round: number;
  year: number;
  chemistryChange: number;
  friendshipChange: number;
  trustChange?: number;
  respectChange?: number;
}

export interface TeamChemistry {
  overallChemistry: number; // 0-100 overall team chemistry
  morale: number; // 0-100 team morale (separate from player morale)
  cohesion: number; // 0-100 how well the team works together
  leadership: number; // 0-100 quality of team leadership

  // Team dynamics
  cliques?: string[]; // Groups within the team
  conflicts?: TeamConflict[];

  // Chemistry modifiers
  recentForm: 'HOT' | 'WARM' | 'NEUTRAL' | 'COLD' | 'FREEZING'; // Based on recent results

  // Performance impact
  chemistryBonus: number; // % bonus to match performance (-20% to +20%)
}

export interface TeamConflict {
  id: string;
  playerA: string; // Your name or teammate name
  playerB: string;
  severity: 'MINOR' | 'MODERATE' | 'SERIOUS' | 'CRITICAL';
  reason: string;
  round: number;
  year: number;
  resolved: boolean;
}

export interface ChemistryEvent {
  id: string;
  type: 'TEAMMATE_INTERACTION' | 'TEAM_EVENT' | 'TRAINING' | 'MATCH' | 'SOCIAL';
  title: string;
  description: string;
  icon: string;
  round: number;
  year: number;

  // Relationship impact
  affectedTeammate?: string; // Teammate name (if individual interaction)
  affectsWholeTeam?: boolean;

  // Effects
  chemistryChange?: number;
  friendshipChange?: number;
  trustChange?: number;
  respectChange?: number;
  teamMoraleChange?: number;

  // Choices (optional)
  choices?: ChemistryChoice[];
  resolved: boolean;
}

export interface ChemistryChoice {
  id: string;
  label: string;
  description: string;
  icon: string;
  effects: {
    chemistry?: number;
    friendship?: number;
    trust?: number;
    respect?: number;
    playerMorale?: number;
    teamMorale?: number;
    resultText: string;
  };
}

// ===== COACHING & STAFF SYSTEM =====

export interface CoachingStaff {
  headCoach: Coach;
  assistantCoaches: Coach[];
  fitnessStaff: StaffMember[];
  medicalStaff: StaffMember[];
  mentalCoach?: StaffMember;

  // Overall staff quality
  staffRating: number; // 0-100 overall staff quality

  // Staff effects
  trainingBonus: number; // % bonus to training effectiveness
  injuryPrevention: number; // % reduction in injury risk
  recoveryBonus: number; // % faster recovery from injury/fatigue
  moraleBonus: number; // Passive morale boost
}

export interface Coach {
  id: string;
  name: string;
  age: number;
  specialty: Position | 'TACTICS' | 'LEADERSHIP' | 'FITNESS';

  // Coach attributes
  experience: number; // 0-100
  expertise: number; // 0-100 (how good they are at their job)
  motivation: number; // 0-100 (ability to inspire players)
  reputation: number; // 0-100

  // Coach personality
  personality: 'DISCIPLINARIAN' | 'MENTOR' | 'TACTICIAN' | 'MOTIVATOR' | 'INNOVATOR' | 'VETERAN';

  // Relationship with player
  relationship: number; // 0-100 how well you get along
  trust: number; // 0-100 their trust in you

  // Career
  yearsAtClub: number;
  premierships: number;

  // Interaction history
  lastInteraction?: CoachInteraction;
  interactions?: CoachInteraction[];
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'FITNESS_TRAINER' | 'PHYSIO' | 'NUTRITIONIST' | 'MENTAL_COACH' | 'SKILLS_COACH';
  specialty?: Position; // For skills coaches

  // Staff attributes
  expertise: number; // 0-100
  experience: number; // 0-100

  // Effects on player
  effectType: 'TRAINING' | 'RECOVERY' | 'INJURY_PREVENTION' | 'MORALE' | 'ATTRIBUTES';
  effectPower: number; // Strength of their effect (0-100)

  // Relationship
  relationship: number; // 0-100

  yearsAtClub: number;

  // Contract details (for hired staff)
  contractType?: 'PERMANENT' | 'TEMPORARY'; // Permanent (full season) or Temporary (weekly)
  contractExpiry?: number; // Round when contract expires (for temporary staff)
  weeklyCost?: number; // Cost per week for temporary contracts
  seasonCost?: number; // One-time cost for permanent contracts
}

export interface CoachInteraction {
  type: 'PRAISE' | 'CRITICISM' | 'ADVICE' | 'TACTICAL_TALK' | 'PERSONAL_CHAT' | 'CONFLICT';
  message: string;
  round: number;
  year: number;

  // Effects
  relationshipChange: number;
  trustChange: number;
  playerMoraleChange?: number;
  motivationGained?: number; // Temporary performance boost
}

export interface CoachingEvent {
  id: string;
  type: 'COACH_MEETING' | 'STAFF_SESSION' | 'TACTICAL_REVIEW' | 'PERFORMANCE_REVIEW' | 'PERSONAL_ISSUE';
  title: string;
  description: string;
  icon: string;

  staffMember: string; // Coach or staff member name
  round: number;
  year: number;

  // Choices
  choices?: CoachingChoice[];
  resolved: boolean;
}

export interface CoachingChoice {
  id: string;
  label: string;
  description: string;
  icon: string;
  effects: {
    coachRelationship?: number;
    coachTrust?: number;
    staffRelationship?: number;
    playerMorale?: number;
    teamMorale?: number;
    attributeBonus?: Partial<Record<keyof PlayerAttributes, number>>;
    motivationBoost?: number; // Temporary % performance boost
    resultText: string;
  };
  risk?: 'LOW' | 'MEDIUM' | 'HIGH';
}