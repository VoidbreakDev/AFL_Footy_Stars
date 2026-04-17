import { PlayerProfile, StoryArc, StoryArcEvent, StoryArcType, StoryArcAct, CareerEventEffect } from '../types';
import { STORY_ARC_TEMPLATES } from '../constants';

/**
 * Evaluate player state and seed 1–2 story arcs for the season.
 */
export const generateStoryArcs = (player: PlayerProfile, round: number): StoryArc[] => {
  const arcs: StoryArc[] = [];
  const activeCount = (player.activeStoryArcs || []).length;
  const maxArcs = 2;
  const slotsAvailable = maxArcs - activeCount;

  if (slotsAvailable <= 0) return arcs;

  // Shuffle templates and pick matching ones
  const shuffled = [...STORY_ARC_TEMPLATES].sort(() => Math.random() - 0.5);

  for (const template of shuffled) {
    if (arcs.length >= slotsAvailable) break;
    if (template.triggerCondition(player)) {
      arcs.push(createArcFromTemplate(template, round));
    }
  }

  return arcs;
};

/**
 * Create a StoryArc instance from a template.
 */
const createArcFromTemplate = (template: typeof STORY_ARC_TEMPLATES[0], round: number): StoryArc => {
  const setupEvent: StoryArcEvent = {
    id: `arc-${template.type}-${round}-setup-${Date.now()}`,
    title: template.acts.setup.title,
    description: template.acts.setup.description,
    act: 'SETUP',
    round,
    icon: template.acts.setup.icon,
    resolved: false,
  };

  return {
    id: `arc-${template.type}-${round}-${Date.now()}`,
    type: template.type as StoryArcType,
    title: template.title,
    synopsis: template.synopsis,
    currentAct: 'SETUP',
    events: [setupEvent],
    startRound: round,
    completed: false,
    legacyImpact: 0,
  };
};

/**
 * Progress the arc to the next act and generate the next event.
 */
export const advanceStoryArc = (arc: StoryArc, player: PlayerProfile, round: number): StoryArc => {
  if (arc.completed) return arc;

  const actOrder: StoryArcAct[] = ['SETUP', 'ESCALATION', 'RESOLUTION', 'EPILOGUE'];
  const currentIndex = actOrder.indexOf(arc.currentAct);
  if (currentIndex >= actOrder.length - 1) return arc; // Already at final act

  const nextAct = actOrder[currentIndex + 1];
  const template = STORY_ARC_TEMPLATES.find(t => t.type === arc.type);
  if (!template) return arc;

  // Get act data based on nextAct
  const actData = nextAct === 'SETUP' ? template.acts.setup :
                  nextAct === 'ESCALATION' ? template.acts.escalation :
                  nextAct === 'RESOLUTION' ? template.acts.resolution :
                  { title: 'Epilogue', description: 'The aftermath of your choices.', icon: '📜' };

  const hasChoices = 'choices' in actData && actData.choices;

  const newEvent: StoryArcEvent = {
    id: `arc-${arc.type}-${round}-${nextAct}-${Date.now()}`,
    title: actData.title,
    description: actData.description,
    act: nextAct,
    round,
    icon: actData.icon,
    choices: hasChoices ? actData.choices : undefined,
    resolved: false,
  };

  return {
    ...arc,
    currentAct: nextAct,
    events: [...arc.events, newEvent],
  };
};

/**
 * Apply a choice from a story arc event and record the narrative tag.
 */
export const resolveStoryArcChoice = (
  arc: StoryArc,
  eventId: string,
  choiceId: string,
  player: PlayerProfile
): { updatedArc: StoryArc; effects: CareerEventEffect } => {
  const event = arc.events.find(e => e.id === eventId);
  if (!event || !event.choices) {
    return { updatedArc: arc, effects: {} };
  }

  const choice = event.choices.find(c => c.id === choiceId);
  if (!choice) {
    return { updatedArc: arc, effects: {} };
  }

  const effects: CareerEventEffect = {
    morale: choice.narrativeTag ? 0 : undefined,
    mediaReputation: choice.reputationChange,
    fanFollowers: choice.fanChange,
    wallet: choice.walletChange,
    resultText: `You chose: ${choice.label}`,
  };

  const updatedEvents = arc.events.map(e =>
    e.id === eventId ? { ...e, resolved: true, outcomeText: choice.description } : e
  );

  const updatedTags = [...(player.narrativeTags || []), choice.narrativeTag];

  // Store updated tags on player via effects (caller handles this)
  return {
    updatedArc: { ...arc, events: updatedEvents },
    effects,
  };
};

/**
 * Check if arc has met completion conditions.
 */
export const checkArcCompletion = (arc: StoryArc, player: PlayerProfile): boolean => {
  if (arc.completed) return true;

  const lastEvent = arc.events[arc.events.length - 1];
  if (!lastEvent || !lastEvent.resolved) return false;

  // Arc completes when resolution event is resolved
  if (arc.currentAct === 'RESOLUTION' || arc.currentAct === 'EPILOGUE') {
    return true;
  }

  return false;
};

/**
 * Calculate final legacy score change from arc outcome.
 */
export const getArcLegacyImpact = (arc: StoryArc): number => {
  if (!arc.completed) return 0;

  let base = 10;
  if (arc.outcome === 'POSITIVE') base += 15;
  else if (arc.outcome === 'NEUTRAL') base += 5;
  else base -= 5;

  return base;
};

/**
 * Finalize an arc — determine outcome and apply legacy impact.
 */
export const finalizeArc = (arc: StoryArc): StoryArc => {
  if (arc.completed) return arc;

  const allResolved = arc.events.every(e => e.resolved);
  if (!allResolved) return arc;

  // Determine outcome based on last event's narrative tag
  const lastEvent = arc.events[arc.events.length - 1];
  let outcome: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' = 'NEUTRAL';

  if (lastEvent.outcomeText) {
    if (lastEvent.outcomeText.includes('humble') || lastEvent.outcomeText.includes('grateful') ||
        lastEvent.outcomeText.includes('honour') || lastEvent.outcomeText.includes('class') ||
        lastEvent.outcomeText.includes('simplify') || lastEvent.outcomeText.includes('tribute')) {
      outcome = 'POSITIVE';
    } else if (lastEvent.outcomeText.includes('feud') || lastEvent.outcomeText.includes('deflect') ||
               lastEvent.outcomeText.includes('silent') || lastEvent.outcomeText.includes('pressure') ||
               lastEvent.outcomeText.includes('crack')) {
      outcome = 'NEGATIVE';
    }
  }

  // Also check if choices led to positive narrative tags
  const lastChoice = lastEvent.choices?.find(c => c.narrativeTag);
  if (lastChoice) {
    if (['team_player', 'class_act', 'honours_mentors', 'humble_return', 'lead_by_example', 'back_to_basics', 'moment_taker', 'grateful_farewell', 'owns_mistake'].includes(lastChoice.narrativeTag)) {
      outcome = 'POSITIVE';
    } else if (['feud_continues', 'deflects', 'pressure_cracks', 'silent_treatment'].includes(lastChoice.narrativeTag)) {
      outcome = 'NEGATIVE';
    }
  }

  return {
    ...arc,
    completed: true,
    outcome,
    legacyImpact: getArcLegacyImpact({ ...arc, outcome }),
  };
};
