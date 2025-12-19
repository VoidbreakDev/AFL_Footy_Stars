
import { GoogleGenAI } from "@google/genai";
import { MatchResult, Team, PlayerProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMatchCommentary = async (
  homeTeam: Team,
  awayTeam: Team,
  result: MatchResult,
  player: PlayerProfile
): Promise<string> => {
  
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
