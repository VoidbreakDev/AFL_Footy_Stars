
import { GoogleGenAI } from "@google/genai";
import { MatchResult, Team, PlayerProfile } from "../types";

// Validate API key is present
const API_KEY = import.meta.env.VITE_API_KEY || process.env.API_KEY;

if (!API_KEY) {
  console.warn("Warning: Gemini API key not found. Match commentary will use fallback messages.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const generateMatchCommentary = async (
  homeTeam: Team,
  awayTeam: Team,
  result: MatchResult,
  player: PlayerProfile
): Promise<string> => {

  // Fallback message if API is not available
  if (!ai) {
    return `Full Time: ${homeTeam.name} ${result.homeScore.total} def ${awayTeam.name} ${result.awayScore.total}. ${player.name} recorded ${result.playerStats.disposals} disposals and ${result.playerStats.goals} goals.`;
  }

  const prompt = `
    Write a short, energetic 3-sentence match summary for an AFL game.
    Home Team: ${homeTeam.name} (${result.homeScore.goals}.${result.homeScore.behinds}.${result.homeScore.total})
    Away Team: ${awayTeam.name} (${result.awayScore.goals}.${result.awayScore.behinds}.${result.awayScore.total})

    The user is named ${player.name} (${player.position}) and plays for ${player.contract.clubName}.
    User Stats: ${result.playerStats.goals} goals, ${result.playerStats.disposals} disposals.

    Highlight the user's performance if they played well, or mention the team result.
    Use Australian Football terminology (siren, specky, banana, contested ball).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "What a game of footy! The crowds were roaring.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return `Full Time: ${homeTeam.name} ${result.homeScore.total} def ${awayTeam.name} ${result.awayScore.total}.`;
  }
};
