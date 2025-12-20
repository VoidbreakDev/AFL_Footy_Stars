import React, { useState, useEffect } from 'react';
import { DraftClass, DraftProspect, DraftPick, Position } from '../types';

interface DraftProps {
    draftClass: DraftClass;
    userTeamName: string;
    playerName: string;
    onSelectProspect: (prospectId: string) => void; // Not used in spectator mode, but kept for compatibility
    onSimulateDraft: () => void;
    onCompleteDraft: () => void;
}

const Draft: React.FC<DraftProps> = ({
    draftClass,
    playerName,
    onSimulateDraft,
    onCompleteDraft
}) => {
    const [viewMode, setViewMode] = useState<'prospects' | 'picks'>('prospects');
    const [highlightProspectId, setHighlightProspectId] = useState<string | null>(null);

    if (!draftClass) return null;

    // Find player prospect
    const playerProspect = draftClass.prospects.find(p => p.name === playerName);
    const playerProspectId = playerProspect?.id;

    // Find available prospects (not yet drafted)
    const draftedProspectIds = draftClass.picks
        .filter(p => p.prospectId)
        .map(p => p.prospectId);
    const availableProspects = draftClass.prospects.filter(
        p => !draftedProspectIds.includes(p.id)
    );

    // Find current pick
    const currentPick = draftClass.picks.find(p => !p.prospectId);

    // Check if player has been drafted yet
    const playerDrafted = playerProspectId && draftedProspectIds.includes(playerProspectId);
    const playerPick = draftClass.picks.find(p => p.prospectId === playerProspectId);

    // Position colors
    const positionColors: Record<Position, string> = {
        [Position.FORWARD]: 'bg-red-900/40 border-red-500',
        [Position.MIDFIELDER]: 'bg-blue-900/40 border-blue-500',
        [Position.DEFENDER]: 'bg-green-900/40 border-green-500',
        [Position.RUCK]: 'bg-purple-900/40 border-purple-500'
    };

    const positionTextColors: Record<Position, string> = {
        [Position.FORWARD]: 'text-red-400',
        [Position.MIDFIELDER]: 'text-blue-400',
        [Position.DEFENDER]: 'text-green-400',
        [Position.RUCK]: 'text-purple-400'
    };

    // Potential tier colors
    const getPotentialColor = (potential: number): string => {
        if (potential >= 90) return 'text-yellow-400';
        if (potential >= 85) return 'text-orange-400';
        if (potential >= 75) return 'text-blue-400';
        if (potential >= 70) return 'text-slate-400';
        return 'text-slate-500';
    };

    const getPotentialLabel = (potential: number): string => {
        if (potential >= 90) return 'ELITE';
        if (potential >= 85) return 'HIGH';
        if (potential >= 75) return 'GOOD';
        if (potential >= 70) return 'AVG';
        return 'LOW';
    };

    // Auto-scroll to player when drafted
    useEffect(() => {
        if (playerDrafted && playerPick) {
            setViewMode('picks');
            setHighlightProspectId(playerProspectId);
        }
    }, [playerDrafted, playerPick, playerProspectId]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white p-4">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
                    🎓 {draftClass.year} AFL Draft
                </h1>
                <p className="text-slate-400">
                    Watch as your AFL dream unfolds...
                </p>
            </div>

            {/* Player Status Banner */}
            {playerProspect && (
                <div className={`mb-6 p-4 rounded-lg border-2 ${
                    playerDrafted
                        ? 'bg-emerald-900/40 border-emerald-500'
                        : 'bg-yellow-900/40 border-yellow-500'
                }`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-400">YOUR PROFILE</p>
                            <p className="text-xl font-bold">{playerProspect.name}</p>
                            <p className="text-sm text-slate-300">
                                {playerProspect.position} • Rating: {playerProspect.rating} • Projected: #{playerProspect.draftRank}
                            </p>
                        </div>
                        {playerDrafted && playerPick ? (
                            <div className="text-right">
                                <p className="text-3xl font-black text-emerald-400">DRAFTED!</p>
                                <p className="text-sm text-slate-300">
                                    Pick #{playerPick.pickNumber} - {playerPick.teamName}
                                </p>
                            </div>
                        ) : (
                            <div className="text-right">
                                <p className="text-2xl font-black text-yellow-400">WAITING...</p>
                                <p className="text-sm text-slate-300">Your name could be called next!</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Current Pick Banner */}
            {currentPick && !draftClass.completed && (
                <div className="mb-6 p-4 rounded-lg border-2 bg-slate-800/60 border-slate-600">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-400">NOW ON THE CLOCK</p>
                            <p className="text-xl font-bold">
                                Pick #{currentPick.pickNumber} - {currentPick.teamName}
                            </p>
                            <p className="text-sm text-slate-400">Round {currentPick.round}</p>
                        </div>
                        <button
                            onClick={onSimulateDraft}
                            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 rounded-lg font-bold transition-all shadow-lg"
                        >
                            Simulate Next Pick →
                        </button>
                    </div>
                </div>
            )}

            {/* Completed Draft Banner */}
            {draftClass.completed && (
                <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-2 border-yellow-500">
                    <p className="text-2xl font-bold mb-2">
                        {playerDrafted ? '🎉 Draft Complete - You Made It!' : '📋 Draft Complete'}
                    </p>
                    <p className="text-slate-300 mb-4">
                        {playerDrafted
                            ? `Congratulations! You were selected by ${playerPick?.teamName} with pick #${playerPick?.pickNumber}.`
                            : 'Unfortunately, you weren\'t selected in this year\'s draft. Keep working hard and try again next season!'}
                    </p>
                    <button
                        onClick={onCompleteDraft}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 rounded-lg font-bold transition-all"
                    >
                        {playerDrafted ? 'Start AFL Career →' : 'Return to State League →'}
                    </button>
                </div>
            )}

            {/* View Toggle */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setViewMode('prospects')}
                    className={`flex-1 py-3 rounded-lg font-bold transition-all ${viewMode === 'prospects' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                    📋 All Prospects ({draftClass.prospects.length})
                </button>
                <button
                    onClick={() => setViewMode('picks')}
                    className={`flex-1 py-3 rounded-lg font-bold transition-all ${viewMode === 'picks' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                    📊 Draft Results
                </button>
            </div>

            {/* Prospects View */}
            {viewMode === 'prospects' && (
                <div className="space-y-4">
                    {draftClass.prospects.map((prospect) => {
                        const isDrafted = draftedProspectIds.includes(prospect.id);
                        const isPlayer = prospect.id === playerProspectId;

                        return (
                            <div
                                key={prospect.id}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                    isPlayer
                                        ? 'bg-yellow-900/40 border-yellow-500 ring-2 ring-yellow-400'
                                        : isDrafted
                                        ? 'bg-slate-800/40 border-slate-700 opacity-50'
                                        : positionColors[prospect.position]
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="text-lg font-bold">
                                            {isPlayer && '⭐ '}
                                            {prospect.name}
                                            {isDrafted && ' (DRAFTED)'}
                                        </p>
                                        <p className="text-sm text-slate-400">
                                            {prospect.age} years old • {prospect.state}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-white">
                                            {prospect.rating}
                                        </p>
                                        <p className={`text-xs font-bold ${getPotentialColor(prospect.potential)}`}>
                                            POT: {prospect.potential} ({getPotentialLabel(prospect.potential)})
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2 mb-2">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${positionTextColors[prospect.position]} bg-black/30`}>
                                        {prospect.position}
                                    </span>
                                    <span className="px-2 py-1 rounded text-xs font-bold text-slate-300 bg-black/30">
                                        {prospect.subPosition}
                                    </span>
                                    <span className="px-2 py-1 rounded text-xs font-bold text-slate-300 bg-black/30">
                                        #{prospect.draftRank} Projected
                                    </span>
                                </div>

                                <p className="text-sm text-slate-300 italic">
                                    "{prospect.bio}"
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Draft Board View */}
            {viewMode === 'picks' && (
                <div className="space-y-2">
                    {draftClass.picks.map((pick, index) => {
                        const prospect = pick.prospectId
                            ? draftClass.prospects.find(p => p.id === pick.prospectId)
                            : null;

                        const isPlayerPick = prospect?.id === playerProspectId;

                        return (
                            <div
                                key={index}
                                className={`p-3 rounded-lg border ${
                                    isPlayerPick
                                        ? 'bg-yellow-900/40 border-yellow-500 ring-2 ring-yellow-400 scale-[1.02]'
                                        : prospect
                                        ? 'bg-slate-800/60 border-slate-700'
                                        : 'bg-slate-900/40 border-slate-800 opacity-50'
                                }`}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="text-center">
                                            <p className="text-xs text-slate-500">R{pick.round}</p>
                                            <p className="text-xl font-black text-white">#{pick.pickNumber}</p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-slate-400">
                                                {pick.teamName}
                                            </p>
                                            {prospect ? (
                                                <>
                                                    <p className="text-white font-bold">
                                                        {isPlayerPick && '⭐ '}
                                                        {prospect.name}
                                                    </p>
                                                    <p className={`text-xs ${positionTextColors[prospect.position]}`}>
                                                        {prospect.position} • {prospect.subPosition}
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="text-slate-500 text-sm">-</p>
                                            )}
                                        </div>
                                    </div>
                                    {prospect && (
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-white">{prospect.rating}</p>
                                            <p className={`text-xs font-bold ${getPotentialColor(prospect.potential)}`}>
                                                POT: {prospect.potential}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Bottom Padding for scroll */}
            <div className="h-24"></div>
        </div>
    );
};

export default Draft;
