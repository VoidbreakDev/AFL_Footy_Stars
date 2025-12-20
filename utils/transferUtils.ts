import { PlayerProfile, Team, LeagueTier, TransferOffer } from '../types';

// Generate transfer offers based on player performance and contract status
export const generateTransferOffers = (
    player: PlayerProfile,
    currentRound: number,
    allTeams: Team[],
    currentSeasonNumber: number
): TransferOffer[] => {
    const offers: TransferOffer[] = [];

    // Don't generate offers if retired
    if (player.isRetired) return offers;

    // Calculate player overall rating
    const calculateOverall = (p: PlayerProfile) => {
        const attrs = Object.values(p.attributes);
        return Math.round(attrs.reduce((a, b) => a + b, 0) / attrs.length);
    };

    const playerRating = calculateOverall(player);
    const contractExpiring = player.contract.yearsLeft <= 1;
    const isPerformingWell = player.seasonStats.votes >= 5 || player.careerStats.votes >= 30;
    const currentTier = player.contract.tier;

    // Determine if player should get offers
    const shouldGetOffers =
        contractExpiring || // Contract expiring
        (isPerformingWell && playerRating >= 70) || // Performing exceptionally well
        (currentTier === LeagueTier.LOCAL && playerRating >= 65 && player.careerStats.matches >= 30) || // Ready for promotion
        (currentTier === LeagueTier.STATE && playerRating >= 75 && player.careerStats.matches >= 60); // Ready for AFL

    if (!shouldGetOffers) return offers;

    // Filter out current team
    const otherTeams = allTeams.filter(t => t.name !== player.contract.clubName);

    // Determine which tiers can make offers
    const eligibleTiers: LeagueTier[] = [];

    if (playerRating >= 85) {
        eligibleTiers.push(LeagueTier.NATIONAL); // AFL clubs
    }
    if (playerRating >= 70 && currentTier !== LeagueTier.NATIONAL) {
        eligibleTiers.push(LeagueTier.STATE); // State League clubs
    }
    if (playerRating >= 60 && currentTier === LeagueTier.LOCAL) {
        eligibleTiers.push(LeagueTier.STATE); // Can move up to state
    }

    // Always can get offers from same tier if contract expiring
    if (contractExpiring) {
        eligibleTiers.push(currentTier);
    }

    // Generate 1-4 offers based on performance
    const numOffers = Math.min(
        4,
        Math.max(1, Math.floor((playerRating - 60) / 10) + (isPerformingWell ? 1 : 0))
    );

    // Get potential clubs from eligible tiers
    const potentialClubs = otherTeams.filter(team =>
        eligibleTiers.includes(currentTier) // Simplified - in real version would check team tier
    );

    // Shuffle and select clubs
    const shuffledClubs = potentialClubs.sort(() => Math.random() - 0.5);
    const selectedClubs = shuffledClubs.slice(0, numOffers);

    selectedClubs.forEach((team, index) => {
        // Determine offer tier (can be promotion)
        let offerTier = currentTier;
        if (eligibleTiers.includes(LeagueTier.NATIONAL) && Math.random() > 0.5) {
            offerTier = LeagueTier.NATIONAL;
        } else if (eligibleTiers.includes(LeagueTier.STATE) && currentTier === LeagueTier.LOCAL && Math.random() > 0.3) {
            offerTier = LeagueTier.STATE;
        }

        // Calculate base salary based on tier and rating
        let baseSalary = 0;
        if (offerTier === LeagueTier.NATIONAL) {
            baseSalary = 1500 + (playerRating - 70) * 50; // $1500-$3000 for AFL
        } else if (offerTier === LeagueTier.STATE) {
            baseSalary = 600 + (playerRating - 60) * 30; // $600-$1500 for State
        } else {
            baseSalary = 200 + (playerRating - 50) * 15; // $200-$700 for Local
        }

        // Add variation (1.0x to 1.3x multiplier for competitive offers)
        const variationMultiplier = 1.0 + Math.random() * 0.3;
        let salary = Math.round(baseSalary * variationMultiplier);

        // IMPORTANT: Ensure transfer offers are better than current salary
        // If same tier, must offer at least 10% more
        // If promotion, must offer at least current salary
        const currentSalary = player.contract.salary || 0;
        if (offerTier === currentTier) {
            salary = Math.max(salary, Math.round(currentSalary * 1.1)); // At least 10% raise for same tier
        } else if (offerTier > currentTier) {
            salary = Math.max(salary, Math.round(currentSalary * 1.2)); // At least 20% raise for promotion
        }

        // Determine role based on team strength and player rating
        const teamStrength = team.wins / (team.wins + team.losses + team.draws || 1);
        let role: TransferOffer['role'] = 'ROTATION';

        if (playerRating >= 85) role = 'STAR';
        else if (playerRating >= 75) role = 'STARTER';
        else if (playerRating >= 65) role = teamStrength < 0.4 ? 'STARTER' : 'ROTATION';
        else role = 'DEPTH';

        // Generate reason for interest
        const reasons = getOfferReasons(player, role, offerTier, currentTier);
        const reason = reasons[Math.floor(Math.random() * reasons.length)];

        // Contract length (1-4 years, longer for better players)
        const contractLength = Math.min(4, Math.max(1, Math.floor(playerRating / 25) + 1));

        // Team ranking (simplified - use wins)
        const sortedTeams = [...allTeams].sort((a, b) => b.wins - a.wins);
        const teamRanking = sortedTeams.findIndex(t => t.name === team.name) + 1;

        offers.push({
            id: `${team.name}-${currentRound}-${index}`,
            clubName: team.name,
            tier: offerTier,
            salary,
            contractLength,
            role,
            teamRanking,
            expiresRound: currentRound + 3, // Offers last 3 rounds
            reason,
            teamColors: team.colors
        });
    });

    // Sort offers by salary (best offers first)
    return offers.sort((a, b) => b.salary - a.salary);
};

const getOfferReasons = (
    player: PlayerProfile,
    role: TransferOffer['role'],
    offerTier: LeagueTier,
    currentTier: LeagueTier
): string[] => {
    const reasons: string[] = [];

    // Promotion reasons
    if (offerTier === LeagueTier.NATIONAL && currentTier !== LeagueTier.NATIONAL) {
        reasons.push("Ready for the big league");
        reasons.push("Proven talent deserves AFL opportunity");
        reasons.push("Exceptional performance caught our scouts' attention");
    }

    if (offerTier === LeagueTier.STATE && currentTier === LeagueTier.LOCAL) {
        reasons.push("Time to step up to state level");
        reasons.push("Your potential fits our development plan");
    }

    // Role-based reasons
    if (role === 'STAR') {
        reasons.push("Build our team around you");
        reasons.push("Lead us to premiership glory");
        reasons.push("Be the face of our franchise");
    } else if (role === 'STARTER') {
        reasons.push("Key addition to our starting lineup");
        reasons.push("Fill crucial position in our squad");
        reasons.push("Boost our finals chances");
    } else if (role === 'ROTATION') {
        reasons.push("Add depth to our roster");
        reasons.push("Valuable squad player role available");
        reasons.push("Opportunity for more game time");
    } else {
        reasons.push("Develop under experienced coaching");
        reasons.push("Future investment opportunity");
    }

    // Stats-based reasons
    if (player.careerStats.goals >= 100) {
        reasons.push("Goal-scoring prowess we desperately need");
    }
    if (player.careerStats.disposals >= 3000) {
        reasons.push("Midfield general to control games");
    }
    if (player.careerStats.tackles >= 300) {
        reasons.push("Defensive pressure to strengthen our backline");
    }
    if (player.careerStats.votes >= 50) {
        reasons.push("Brownlow-quality player for our midfield");
    }

    // Age-based reasons
    if (player.age <= 23) {
        reasons.push("Young talent with huge upside");
        reasons.push("Build for the future with your potential");
    } else if (player.age >= 30) {
        reasons.push("Experienced head for finals push");
        reasons.push("Mentor our young players");
    }

    return reasons.length > 0 ? reasons : ["Interested in your services"];
};

// Check if new offers should be generated (at specific rounds)
export const shouldGenerateOffers = (
    player: PlayerProfile,
    currentRound: number
): boolean => {
    // Generate offers at specific times:
    // 1. Mid-season (Round 11)
    // 2. End of regular season (Round 22)
    // 3. When contract has 1 year left

    const isOfferRound = currentRound === 11 || currentRound === 22;
    const contractExpiring = (player.contract.yearsLeft || 0) <= 1;

    return isOfferRound || contractExpiring;
};

// Clear expired offers
export const clearExpiredOffers = (
    offers: TransferOffer[],
    currentRound: number
): TransferOffer[] => {
    return offers.filter(offer => offer.expiresRound >= currentRound);
};

// Accept a transfer offer
export const acceptTransferOffer = (
    player: PlayerProfile,
    offer: TransferOffer
): PlayerProfile => {
    // Track clubs played
    const clubsPlayed = player.clubsPlayed || [player.contract.clubName];
    if (!clubsPlayed.includes(offer.clubName)) {
        clubsPlayed.push(offer.clubName);
    }

    return {
        ...player,
        contract: {
            clubName: offer.clubName,
            tier: offer.tier,
            salary: offer.salary,
            yearsLeft: offer.contractLength
        },
        transferOffers: [], // Clear all offers after accepting
        clubsPlayed,
        morale: Math.min(100, player.morale + 20) // Boost morale with new contract
    };
};
