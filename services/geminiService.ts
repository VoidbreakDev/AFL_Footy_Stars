import { GoogleGenAI } from "@google/genai";
import { MatchResult, Team, PlayerProfile } from "../types";

// Validate API key is present
const API_KEY = import.meta.env.VITE_API_KEY || process.env.API_KEY;

if (!API_KEY) {
  console.warn("Warning: Gemini API key not found. Match commentary will use fallback messages.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

/**
 * Build a structured briefing string from available match data.
 * Uses optional chaining throughout to avoid type errors for missing fields.
 */
const buildRichMatchContext = (
  homeTeam: Team,
  awayTeam: Team,
  result: MatchResult,
  player: PlayerProfile
): string => {
  // Determine match nature
  const homeTotal = result.homeScore?.total ?? 0;
  const awayTotal = result.awayScore?.total ?? 0;
  const scoreDiff = Math.abs(homeTotal - awayTotal);
  const matchType = scoreDiff <= 12 ? 'close contest'
    : scoreDiff <= 30 ? 'comfortable win'
    : 'dominant performance';

  // Determine player team and score
  const isHome = player.contract?.clubName === homeTeam.name;
  const playerScore = isHome ? homeTotal : awayTotal;
  const oppScore = isHome ? awayTotal : homeTotal;
  const playerWon = playerScore > oppScore;

  // Performance grade from disposals + goals
  const disposals = result.playerStats?.disposals ?? 0;
  const goals = result.playerStats?.goals ?? 0;
  const grade = disposals >= 30 || goals >= 4 ? 'elite'
    : disposals >= 22 || goals >= 2 ? 'strong'
    : disposals >= 15 ? 'solid'
    : 'quiet';

  // Battle report (from v1.5 engine)
  const battleSummary = result.battleReport?.join(' ') ?? '';

  // Highlights (top 2 event descriptions)
  const highlights = result.highlights
    ?.slice(0, 2)
    .map(h => h.description)
    .join(' ') ?? '';

  // Injury note
  const injuryNote = result.playerInjury
    ? `${player.name} was substituted off with a ${result.playerInjury.name}.`
    : '';

  // Rivalry note — check newRivalry field on result
  const rivalryNote = result.newRivalry
    ? `A new rivalry sparked with ${result.newRivalry.opponentName}.`
    : '';

  // Synergy note — check matchContext
  const synergyNote = result.matchContext?.synergyDelta
    && Math.abs(result.matchContext.synergyDelta) > 8
    ? result.matchContext.synergyDelta > 0
      ? 'Team chemistry was a positive factor today.'
      : 'Some chemistry issues affected team cohesion.'
    : '';

  return [
    `Match type: ${matchType}. Result: ${homeTeam.name} ${homeTotal} ${playerWon && !isHome ? 'defeated' : !playerWon && isHome ? 'fell to' : 'edged'} ${awayTeam.name} ${awayTotal}.`,
    `Player: ${player.name} (${player.position}, ${player.contract?.clubName}). Grade: ${grade}. Disposals: ${disposals}, Goals: ${goals}.`,
    battleSummary,
    highlights,
    injuryNote,
    rivalryNote,
    synergyNote,
  ].filter(Boolean).join(' ');
};

/**
 * Fallback commentary when API is unavailable or fails.
 */
const fallback = (result: MatchResult, player: PlayerProfile): string => {
  const disposals = result.playerStats?.disposals ?? 0;
  const goals = result.playerStats?.goals ?? 0;
  const grade = disposals >= 30 || goals >= 4 ? 'Best on ground display'
    : disposals >= 22 || goals >= 2 ? 'Strong performance'
    : disposals >= 15 ? 'Solid contribution'
    : 'Quiet afternoon';
  const injuryStr = result.playerInjury ? ` Substituted off with ${result.playerInjury.name}.` : '';
  const synergyStr = result.matchContext?.synergyDelta
    && Math.abs(result.matchContext.synergyDelta) > 8
    ? result.matchContext.synergyDelta > 0
      ? ' Team chemistry was a factor.'
      : ' Chemistry issues showed.'
    : '';
  return `${grade} from ${player.name} — ${disposals} disposals, ${goals} goals.${injuryStr}${synergyStr}`;
};

export const generateMatchCommentary = async (
  homeTeam: Team,
  awayTeam: Team,
  result: MatchResult,
  player: PlayerProfile
): Promise<string> => {
  // Build rich context for the prompt
  const richContext = buildRichMatchContext(homeTeam, awayTeam, result, player);

  // Fallback if no API client
  if (!ai) {
    return fallback(result, player);
  }

  const prompt = `You are an AFL match commentator writing a post-match summary.
Given this match briefing: ${richContext}

Write exactly 3 sentences:
- Sentence 1: The match result and its nature (close, dominant, comeback, etc.)
- Sentence 2: The player's contribution — their grade, a highlight moment, any injury
- Sentence 3: A narrative note — team chemistry, rivalry moment, or season context

Rules:
- Never start with "Full time:" or "In a"
- Use AFL terminology naturally (disposals, marks, clearances, forward pocket, etc.)
- Be specific — use player names, club names, and actual stat numbers
- Varied sentence starters across different calls
- Maximum 80 words total`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text?.trim();
    return text || fallback(result, player);
  } catch (error) {
    console.error('Gemini Error:', error);
    return fallback(result, player);
  }
};
