import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { TransferOffer, LeagueTier } from '../types';

const TransferMarket: React.FC = () => {
    const { player, acceptTransfer, rejectTransfer, setView } = useGame();
    const [selectedOffer, setSelectedOffer] = useState<TransferOffer | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

    if (!player) return null;

    const offers = player.transferOffers || [];

    const getTierColor = (tier: LeagueTier) => {
        switch (tier) {
            case LeagueTier.NATIONAL:
                return 'from-yellow-600 to-orange-600';
            case LeagueTier.STATE:
                return 'from-blue-600 to-purple-600';
            default:
                return 'from-slate-600 to-slate-700';
        }
    };

    const getTierBadge = (tier: LeagueTier) => {
        switch (tier) {
            case LeagueTier.NATIONAL:
                return 'bg-yellow-500 text-slate-900';
            case LeagueTier.STATE:
                return 'bg-blue-500 text-white';
            default:
                return 'bg-slate-600 text-slate-200';
        }
    };

    const getRoleIcon = (role: TransferOffer['role']) => {
        switch (role) {
            case 'STAR': return '⭐';
            case 'STARTER': return '🎯';
            case 'ROTATION': return '🔄';
            case 'DEPTH': return '📦';
        }
    };

    const getRoleDescription = (role: TransferOffer['role']) => {
        switch (role) {
            case 'STAR': return 'Franchise Player - Build team around you';
            case 'STARTER': return 'Starting XI - Key role every match';
            case 'ROTATION': return 'Rotation Player - Regular game time';
            case 'DEPTH': return 'Squad Depth - Development opportunity';
        }
    };

    const handleAcceptOffer = () => {
        if (selectedOffer && acceptTransfer) {
            acceptTransfer(selectedOffer.id);
            setShowConfirmation(false);
            setSelectedOffer(null);
        }
    };

    const handleRejectOffer = (offerId: string) => {
        if (rejectTransfer) {
            rejectTransfer(offerId);
        }
    };

    if (offers.length === 0) {
        return (
            <div className="min-h-screen bg-slate-900 text-white p-4 pb-24">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => setView('DASHBOARD')}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition-colors"
                    >
                        ← Back
                    </button>
                    <h1 className="text-2xl font-black text-emerald-400 uppercase italic">Transfer Market</h1>
                    <div className="w-20"></div>
                </div>

                <div className="flex flex-col items-center justify-center py-20">
                    <div className="text-6xl mb-6">📭</div>
                    <h2 className="text-2xl font-bold text-slate-400 mb-2">No Transfer Offers</h2>
                    <p className="text-sm text-slate-500 text-center max-w-sm">
                        Keep performing well and clubs will come knocking! Offers typically appear mid-season and at season end.
                    </p>
                    <div className="mt-8 bg-slate-800 rounded-xl p-6 max-w-md border border-slate-700">
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">How to attract offers:</h3>
                        <ul className="space-y-2 text-sm text-slate-300">
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-400">✓</span>
                                <span>Earn Brownlow votes consistently</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-400">✓</span>
                                <span>Improve your overall rating to 70+</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-400">✓</span>
                                <span>Let your contract wind down</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-400">✓</span>
                                <span>Dominate at your current tier</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => setView('DASHBOARD')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition-colors"
                >
                    ← Back
                </button>
                <h1 className="text-2xl font-black text-emerald-400 uppercase italic">Transfer Market</h1>
                <div className="w-20"></div>
            </div>

            {/* Current Contract */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-4 mb-6 border-2 border-emerald-500">
                <div className="text-xs font-bold text-emerald-400 uppercase mb-2">Current Contract</div>
                <div className="flex justify-between items-center">
                    <div>
                        <div className="font-black text-white text-lg">{player.contract.clubName}</div>
                        <div className="text-xs text-slate-400">{player.contract.tier}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-black text-emerald-400">${player.contract.salary}</div>
                        <div className="text-xs text-slate-500">{player.contract.yearsLeft} {player.contract.yearsLeft === 1 ? 'year' : 'years'} left</div>
                    </div>
                </div>
            </div>

            {/* Offers Summary */}
            <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase">Transfer Offers</div>
                        <div className="text-3xl font-black text-white">{offers.length}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-slate-500 mb-1">Best Offer</div>
                        <div className="text-xl font-black text-emerald-400">
                            ${Math.max(...offers.map(o => o.salary))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Offers List */}
            <div className="space-y-4">
                {offers.map((offer) => (
                    <div
                        key={offer.id}
                        className={`bg-gradient-to-r ${getTierColor(offer.tier)} rounded-xl p-1 shadow-lg`}
                    >
                        <div className="bg-slate-900 rounded-lg p-4">
                            {/* Club Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-xl font-black text-white">{offer.clubName}</h3>
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${getTierBadge(offer.tier)}`}>
                                            {offer.tier}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        Ladder Position: #{offer.teamRanking}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-black text-emerald-400">${offer.salary}</div>
                                    <div className="text-xs text-slate-500">{offer.contractLength} year contract</div>
                                </div>
                            </div>

                            {/* Role */}
                            <div className="bg-slate-800 rounded-lg p-3 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="text-3xl">{getRoleIcon(offer.role)}</div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-white">{offer.role}</div>
                                        <div className="text-xs text-slate-400">{getRoleDescription(offer.role)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Reason */}
                            <div className="bg-slate-800/50 rounded-lg p-3 mb-4 border-l-4 border-emerald-500">
                                <div className="text-xs text-slate-500 uppercase font-bold mb-1">Why they want you</div>
                                <div className="text-sm text-slate-200 italic">"{offer.reason}"</div>
                            </div>

                            {/* Comparison with current contract */}
                            {offer.salary !== player.contract.salary && (
                                <div className="flex gap-2 mb-4">
                                    {offer.salary > player.contract.salary ? (
                                        <div className="flex-1 bg-emerald-900/20 border border-emerald-600/30 rounded-lg p-2 text-center">
                                            <div className="text-xs text-emerald-400 font-bold">
                                                +${offer.salary - player.contract.salary} raise
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1 bg-orange-900/20 border border-orange-600/30 rounded-lg p-2 text-center">
                                            <div className="text-xs text-orange-400 font-bold">
                                                ${player.contract.salary - offer.salary} pay cut
                                            </div>
                                        </div>
                                    )}
                                    {offer.tier !== player.contract.tier && (
                                        <div className="flex-1 bg-blue-900/20 border border-blue-600/30 rounded-lg p-2 text-center">
                                            <div className="text-xs text-blue-400 font-bold">
                                                {offer.tier === LeagueTier.NATIONAL ? '⬆️ Promotion' : offer.tier === LeagueTier.STATE && player.contract.tier === LeagueTier.LOCAL ? '⬆️ Step Up' : 'Tier Change'}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Expiry */}
                            <div className="text-xs text-slate-500 mb-4 text-center">
                                Offer expires Round {offer.expiresRound}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setSelectedOffer(offer);
                                        setShowConfirmation(true);
                                    }}
                                    className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black rounded-lg uppercase text-sm shadow-lg active:scale-95 transition-all"
                                >
                                    Accept Offer
                                </button>
                                <button
                                    onClick={() => handleRejectOffer(offer.id)}
                                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold rounded-lg uppercase text-sm transition-colors"
                                >
                                    Decline
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Confirmation Modal */}
            {showConfirmation && selectedOffer && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 rounded-2xl border-2 border-emerald-500 shadow-2xl max-w-md w-full">
                        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-4 text-center rounded-t-xl">
                            <h3 className="text-xl font-black text-white uppercase">Confirm Transfer</h3>
                        </div>

                        <div className="p-6">
                            <div className="text-center mb-6">
                                <p className="text-slate-300 mb-4">
                                    Are you sure you want to transfer to <span className="font-bold text-white">{selectedOffer.clubName}</span>?
                                </p>
                                <div className="bg-slate-800 rounded-lg p-4 mb-4">
                                    <div className="text-2xl font-black text-emerald-400 mb-1">${selectedOffer.salary}</div>
                                    <div className="text-xs text-slate-500">{selectedOffer.contractLength} year contract</div>
                                    <div className="text-sm text-slate-400 mt-2">{selectedOffer.role} role</div>
                                </div>
                                <p className="text-xs text-yellow-400 italic">
                                    ⚠️ This decision is final and cannot be undone
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowConfirmation(false);
                                        setSelectedOffer(null);
                                    }}
                                    className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAcceptOffer}
                                    className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-black rounded-lg shadow-lg active:scale-95 transition-all"
                                >
                                    Confirm Transfer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransferMarket;
