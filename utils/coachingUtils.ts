import {
  CoachingStaff,
  Coach,
  StaffMember,
  CoachInteraction,
  PlayerProfile,
  Position,
  LeagueTier
} from '../types';
import {
  COACH_PERSONALITIES,
  COACH_FIRST_NAMES,
  COACH_LAST_NAMES,
  COACH_PERSONALITY_EFFECTS,
  STAFF_ROLES
} from '../constants';

/**
 * Initialize coaching staff for a new team
 */
export const initializeCoachingStaff = (tier: LeagueTier): CoachingStaff => {
  // Better quality staff for higher tiers
  const tierMultiplier = tier === 'AFL' ? 1.0 : tier === 'State League' ? 0.75 : 0.5;

  const headCoach = generateCoach('HEAD_COACH', tierMultiplier);
  const assistantCoaches = [
    generateCoach('ASSISTANT', tierMultiplier),
    generateCoach('ASSISTANT', tierMultiplier)
  ];

  const fitnessStaff = [
    generateStaffMember('FITNESS_TRAINER', tierMultiplier),
    generateStaffMember('NUTRITIONIST', tierMultiplier)
  ];

  const medicalStaff = [
    generateStaffMember('PHYSIO', tierMultiplier),
    generateStaffMember('PHYSIO', tierMultiplier)
  ];

  const mentalCoach = tier !== 'Local League'
    ? generateStaffMember('MENTAL_COACH', tierMultiplier)
    : undefined;

  const staffRating = calculateStaffRating({
    headCoach,
    assistantCoaches,
    fitnessStaff,
    medicalStaff,
    mentalCoach,
    staffRating: 0,
    trainingBonus: 0,
    injuryPrevention: 0,
    recoveryBonus: 0,
    moraleBonus: 0
  });

  const trainingBonus = calculateTrainingBonus(headCoach, assistantCoaches, fitnessStaff);
  const injuryPrevention = calculateInjuryPrevention(medicalStaff, fitnessStaff);
  const recoveryBonus = calculateRecoveryBonus(medicalStaff, fitnessStaff);
  const moraleBonus = calculateMoraleBonus(headCoach, mentalCoach);

  return {
    headCoach,
    assistantCoaches,
    fitnessStaff,
    medicalStaff,
    mentalCoach,
    staffRating,
    trainingBonus,
    injuryPrevention,
    recoveryBonus,
    moraleBonus
  };
};

/**
 * Generate a coach
 */
const generateCoach = (type: 'HEAD_COACH' | 'ASSISTANT', tierMultiplier: number): Coach => {
  const firstName = COACH_FIRST_NAMES[Math.floor(Math.random() * COACH_FIRST_NAMES.length)];
  const lastName = COACH_LAST_NAMES[Math.floor(Math.random() * COACH_LAST_NAMES.length)];
  const name = `${firstName} ${lastName}`;

  const personality = COACH_PERSONALITIES[Math.floor(Math.random() * COACH_PERSONALITIES.length)];

  // Head coaches are generally better
  const qualityBonus = type === 'HEAD_COACH' ? 15 : 0;

  const baseExpertise = 50 + Math.floor(Math.random() * 30); // 50-80
  const baseExperience = 40 + Math.floor(Math.random() * 40); // 40-80
  const baseMotivation = 45 + Math.floor(Math.random() * 35); // 45-80
  const baseReputation = 40 + Math.floor(Math.random() * 30); // 40-70

  const expertise = Math.min(99, Math.floor((baseExpertise + qualityBonus) * tierMultiplier));
  const experience = Math.min(99, Math.floor((baseExperience + qualityBonus) * tierMultiplier));
  const motivation = Math.min(99, Math.floor((baseMotivation + qualityBonus) * tierMultiplier));
  const reputation = Math.min(99, Math.floor((baseReputation + qualityBonus) * tierMultiplier));

  // Random specialty
  const specialties: (Position | 'TACTICS' | 'LEADERSHIP' | 'FITNESS')[] = [
    'Forward', 'Midfielder', 'Defender', 'Ruck', 'TACTICS', 'LEADERSHIP', 'FITNESS'
  ];
  const specialty = specialties[Math.floor(Math.random() * specialties.length)];

  return {
    id: `coach_${name.replace(/\s/g, '_')}`,
    name,
    age: 40 + Math.floor(Math.random() * 25), // 40-65
    specialty,
    experience,
    expertise,
    motivation,
    reputation,
    personality,
    relationship: 50, // Start neutral
    trust: 50, // Start neutral
    yearsAtClub: Math.floor(Math.random() * 8) + 1, // 1-8 years
    premierships: Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0,
    interactions: []
  };
};

/**
 * Generate a staff member
 */
const generateStaffMember = (
  role: 'FITNESS_TRAINER' | 'PHYSIO' | 'NUTRITIONIST' | 'MENTAL_COACH' | 'SKILLS_COACH',
  tierMultiplier: number
): StaffMember => {
  const firstName = COACH_FIRST_NAMES[Math.floor(Math.random() * COACH_FIRST_NAMES.length)];
  const lastName = COACH_LAST_NAMES[Math.floor(Math.random() * COACH_LAST_NAMES.length)];
  const name = `${firstName} ${lastName}`;

  const baseExpertise = 45 + Math.floor(Math.random() * 40); // 45-85
  const baseExperience = 40 + Math.floor(Math.random() * 40); // 40-80

  const expertise = Math.min(99, Math.floor(baseExpertise * tierMultiplier));
  const experience = Math.min(99, Math.floor(baseExperience * tierMultiplier));

  const effectPower = Math.floor((expertise + experience) / 2);

  return {
    id: `staff_${name.replace(/\s/g, '_')}`,
    name,
    role,
    expertise,
    experience,
    effectType: STAFF_ROLES[role].effect as any,
    effectPower,
    relationship: 50,
    yearsAtClub: Math.floor(Math.random() * 6) + 1 // 1-6 years
  };
};

/**
 * Calculate overall staff rating
 */
export const calculateStaffRating = (staff: CoachingStaff): number => {
  let total = 0;
  let count = 0;

  // Head coach (weighted 3x)
  total += staff.headCoach.expertise * 3;
  count += 3;

  // Assistant coaches
  staff.assistantCoaches.forEach(coach => {
    total += coach.expertise;
    count++;
  });

  // Fitness staff
  staff.fitnessStaff.forEach(member => {
    total += member.expertise;
    count++;
  });

  // Medical staff
  staff.medicalStaff.forEach(member => {
    total += member.expertise;
    count++;
  });

  // Mental coach
  if (staff.mentalCoach) {
    total += staff.mentalCoach.expertise;
    count++;
  }

  return Math.round(total / count);
};

/**
 * Calculate training bonus from staff
 */
const calculateTrainingBonus = (
  headCoach: Coach,
  assistants: Coach[],
  fitnessStaff: StaffMember[]
): number => {
  const coachBonus = (headCoach.expertise / 100) * 15; // Up to +15%
  const assistantBonus = (assistants.reduce((sum, c) => sum + c.expertise, 0) / (assistants.length * 100)) * 5; // Up to +5%
  const fitnessBonus = (fitnessStaff.reduce((sum, s) => sum + s.effectPower, 0) / (fitnessStaff.length * 100)) * 5; // Up to +5%

  return Math.round(coachBonus + assistantBonus + fitnessBonus);
};

/**
 * Calculate injury prevention from medical/fitness staff
 */
const calculateInjuryPrevention = (
  medicalStaff: StaffMember[],
  fitnessStaff: StaffMember[]
): number => {
  const medicalBonus = (medicalStaff.reduce((sum, s) => sum + s.effectPower, 0) / (medicalStaff.length * 100)) * 15; // Up to +15%
  const fitnessBonus = (fitnessStaff.reduce((sum, s) => sum + s.effectPower, 0) / (fitnessStaff.length * 100)) * 10; // Up to +10%

  return Math.round(medicalBonus + fitnessBonus);
};

/**
 * Calculate recovery bonus from medical staff
 */
const calculateRecoveryBonus = (
  medicalStaff: StaffMember[],
  fitnessStaff: StaffMember[]
): number => {
  const medicalBonus = (medicalStaff.reduce((sum, s) => sum + s.effectPower, 0) / (medicalStaff.length * 100)) * 20; // Up to +20%
  const fitnessBonus = (fitnessStaff.reduce((sum, s) => sum + s.effectPower, 0) / (fitnessStaff.length * 100)) * 10; // Up to +10%

  return Math.round(medicalBonus + fitnessBonus);
};

/**
 * Calculate morale bonus from coaches
 */
const calculateMoraleBonus = (headCoach: Coach, mentalCoach?: StaffMember): number => {
  const personalityEffect = COACH_PERSONALITY_EFFECTS[headCoach.personality].moraleImpact;
  const coachBonus = (headCoach.motivation / 100) * 10; // Up to +10
  const mentalBonus = mentalCoach ? (mentalCoach.effectPower / 100) * 5 : 0; // Up to +5

  return Math.round(personalityEffect + coachBonus + mentalBonus);
};

/**
 * Generate coach interaction after match
 */
export const generateCoachInteraction = (
  coach: Coach,
  playerPerformance: number, // 0-10 rating
  matchWon: boolean,
  round: number,
  year: number
): CoachInteraction | null => {
  // 40% chance of interaction
  if (Math.random() > 0.40) return null;

  let type: CoachInteraction['type'];
  let message: string;
  let relationshipChange: number;
  let trustChange: number;
  let playerMoraleChange: number = 0;
  let motivationGained: number = 0;

  // Determine interaction based on coach personality and performance
  if (playerPerformance >= 8 && matchWon) {
    type = 'PRAISE';
    message = getPraiseMessage(coach.personality, coach.name);
    relationshipChange = 5 + Math.floor(Math.random() * 3); // 5-8
    trustChange = 3 + Math.floor(Math.random() * 2); // 3-5
    playerMoraleChange = 5;
    if (coach.personality === 'MOTIVATOR') {
      motivationGained = 5; // 5% boost
    }
  } else if (playerPerformance <= 3 && !matchWon) {
    type = 'CRITICISM';
    message = getCriticismMessage(coach.personality, coach.name);
    relationshipChange = coach.personality === 'DISCIPLINARIAN' ? -2 : -4;
    trustChange = -3;
    playerMoraleChange = coach.personality === 'MENTOR' ? -2 : -5;
  } else if (Math.random() > 0.5) {
    type = 'ADVICE';
    message = getAdviceMessage(coach.personality, coach.name);
    relationshipChange = 2 + Math.floor(Math.random() * 2); // 2-4
    trustChange = 1 + Math.floor(Math.random() * 2); // 1-3
    playerMoraleChange = 2;
  } else {
    type = 'TACTICAL_TALK';
    message = getTacticalMessage(coach.name);
    relationshipChange = 1;
    trustChange = 2;
  }

  return {
    type,
    message,
    round,
    year,
    relationshipChange,
    trustChange,
    playerMoraleChange,
    motivationGained
  };
};

const getPraiseMessage = (personality: Coach['personality'], coachName: string): string => {
  const messages: Record<Coach['personality'], string[]> = {
    DISCIPLINARIAN: [
      `${coachName}: "That's the standard I expect. Keep it up."`,
      `${coachName}: "Excellent work. You're setting the example."`
    ],
    MENTOR: [
      `${coachName}: "I'm so proud of your development! Outstanding!"`,
      `${coachName}: "You're really coming into your own. Great game!"`
    ],
    TACTICIAN: [
      `${coachName}: "Perfect execution of the game plan. Well done."`,
      `${coachName}: "You read the play brilliantly today."`
    ],
    MOTIVATOR: [
      `${coachName}: "YOU'RE ON FIRE! Keep this energy up!"`,
      `${coachName}: "Incredible performance! You inspire the whole team!"`
    ],
    INNOVATOR: [
      `${coachName}: "Great adaptability out there. Exactly what we worked on."`,
      `${coachName}: "Your willingness to try new things is paying off!"`
    ],
    VETERAN: [
      `${coachName}: "I've seen a lot in my years, and that was special."`,
      `${coachName}: "You're playing like a seasoned pro. Excellent."`
    ]
  };

  const options = messages[personality];
  return options[Math.floor(Math.random() * options.length)];
};

const getCriticismMessage = (personality: Coach['personality'], coachName: string): string => {
  const messages: Record<Coach['personality'], string[]> = {
    DISCIPLINARIAN: [
      `${coachName}: "That performance was unacceptable. I expect better."`,
      `${coachName}: "You need to lift your intensity. That wasn't good enough."`
    ],
    MENTOR: [
      `${coachName}: "Let's talk about what went wrong. We'll work on it together."`,
      `${coachName}: "Tough day, but we'll learn from this."`
    ],
    TACTICIAN: [
      `${coachName}: "Your decision-making was poor. Review the game plan."`,
      `${coachName}: "We need to work on your positioning."`
    ],
    MOTIVATOR: [
      `${coachName}: "I know you've got more in you! Let's bounce back!"`,
      `${coachName}: "Off day, but I believe in you. Next week!"`
    ],
    INNOVATOR: [
      `${coachName}: "The new approach didn't work. Let's try something different."`,
      `${coachName}: "Back to the drawing board. We'll figure this out."`
    ],
    VETERAN: [
      `${coachName}: "I've seen worse. But you can do better."`,
      `${coachName}: "That's a learning experience. Move on."`
    ]
  };

  const options = messages[personality];
  return options[Math.floor(Math.random() * options.length)];
};

const getAdviceMessage = (personality: Coach['personality'], coachName: string): string => {
  return `${coachName} gave you some tactical advice to improve your game.`;
};

const getTacticalMessage = (coachName: string): string => {
  return `${coachName} discussed team tactics with you.`;
};

/**
 * Update coach relationship
 */
export const updateCoachRelationship = (
  coach: Coach,
  interaction: CoachInteraction
): Coach => {
  const newRelationship = Math.max(0, Math.min(100, coach.relationship + interaction.relationshipChange));
  const newTrust = Math.max(0, Math.min(100, coach.trust + interaction.trustChange));

  const updatedInteractions = [...(coach.interactions || []), interaction];

  return {
    ...coach,
    relationship: newRelationship,
    trust: newTrust,
    lastInteraction: interaction,
    interactions: updatedInteractions
  };
};

/**
 * Get coach personality icon
 */
export const getCoachPersonalityIcon = (personality: Coach['personality']): string => {
  const icons: Record<Coach['personality'], string> = {
    DISCIPLINARIAN: '⚡',
    MENTOR: '🎓',
    TACTICIAN: '♟️',
    MOTIVATOR: '🔥',
    INNOVATOR: '💡',
    VETERAN: '👴'
  };
  return icons[personality];
};

/**
 * Get staff role icon
 */
export const getStaffRoleIcon = (role: StaffMember['role']): string => {
  return STAFF_ROLES[role].icon;
};

/**
 * Get relationship color
 */
export const getCoachRelationshipColor = (relationship: number): string => {
  if (relationship >= 80) return 'text-green-400';
  if (relationship >= 60) return 'text-blue-400';
  if (relationship >= 40) return 'text-yellow-400';
  if (relationship >= 20) return 'text-orange-400';
  return 'text-red-400';
};
