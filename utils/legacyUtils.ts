import { PlayerProfile } from '../types';

export const calculateLegacyScore = (player: PlayerProfile): number => {
    let score = 0;

    // Awards — iterate careerHistory
    const allAwards = player.careerHistory?.flatMap((h: any) => h.awards ?? []) ?? [];
    allAwards.forEach((award: any) => {
        switch (award.type) {
            case 'BROWNLOW_MEDAL': score += 100; break;
            case 'COLEMAN_MEDAL':  score += 80;  break;
            case 'ALL_AUSTRALIAN': score += 50;  break;
            case 'BEST_AND_FAIREST': score += 30; break;
            default: score += 20; break;
        }
    });

    // Premierships
    const premierships = player.careerHistory?.filter((h: any) => h.grandFinalWon || h.premiership).length ?? 0;
    score += premierships * 150;

    // Career stats
    score += Math.min(player.careerStats?.matches ?? 0, 300);
    score += Math.floor(Math.min(player.careerStats?.goals ?? 0, 200) * 0.5);

    // Milestones achieved
    const milestonesAchieved = player.milestones?.filter((m: any) => m.achieved).length ?? 0;
    score += milestonesAchieved * 10;

    // Seasons in AFL/NATIONAL tier
    const aflSeasons = player.careerHistory?.filter((h: any) => h.tier === 'NATIONAL').length ?? 0;
    score += aflSeasons * 20;

    return Math.round(score);
};

export const getLegacyTier = (score: number): string => {
    if (score >= 900) return 'All-Time Legend';
    if (score >= 700) return 'Superstar';
    if (score >= 500) return 'AFL Star';
    if (score >= 300) return 'State Great';
    if (score >= 100) return 'Club Legend';
    return 'Local Hero';
};
