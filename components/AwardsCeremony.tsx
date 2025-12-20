import React from 'react';
import { Award } from '../types';
import { AWARD_DESCRIPTIONS, AWARD_ICONS } from '../constants';

interface Props {
    awards: Award[];
    playerName: string;
    onDismiss: () => void;
}

const AwardsCeremony: React.FC<Props> = ({ awards, playerName, onDismiss }) => {
    if (awards.length === 0) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fade-in">
            <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-black text-yellow-400 mb-2 uppercase italic">
                        🎉 Awards Night 🎉
                    </h1>
                    <div className="w-32 h-1 bg-yellow-400 mx-auto mb-4"></div>
                    <p className="text-2xl text-white font-bold">{playerName}</p>
                    <p className="text-gray-400">Congratulations on your achievements!</p>
                </div>

                {/* Awards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {awards.map((award, index) => (
                        <div
                            key={`${award.type}-${index}`}
                            className="bg-gradient-to-br from-yellow-900/40 to-amber-900/40 border-2 border-yellow-500 rounded-xl p-6 shadow-2xl transform hover:scale-105 transition-all animate-slide-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Award Icon */}
                            <div className="text-center mb-4">
                                <div className="text-7xl mb-3 animate-bounce">
                                    {AWARD_ICONS[award.type as keyof typeof AWARD_ICONS] || '🏆'}
                                </div>
                                <h3 className="text-2xl font-black text-yellow-400 uppercase">
                                    {award.type}
                                </h3>
                            </div>

                            {/* Award Description */}
                            <p className="text-gray-300 text-center mb-4 text-sm">
                                {AWARD_DESCRIPTIONS[award.type as keyof typeof AWARD_DESCRIPTIONS]}
                            </p>

                            {/* Award Value (if applicable) */}
                            {award.value !== undefined && (
                                <div className="text-center bg-black/40 rounded-lg py-3 px-4">
                                    <div className="text-3xl font-black text-white">
                                        {award.value}
                                    </div>
                                    <div className="text-xs text-gray-400 uppercase">
                                        {award.type.includes('Goal') ? 'Goals' :
                                         award.type.includes('Disposal') ? 'Disposals' :
                                         award.type.includes('Tackle') ? 'Tackles' :
                                         award.type.includes('Brownlow') ? 'Votes' :
                                         'Points'}
                                    </div>
                                </div>
                            )}

                            {/* Year & Tier Badge */}
                            <div className="mt-4 flex justify-between items-center text-xs">
                                <span className="bg-yellow-600 text-black px-3 py-1 rounded-full font-bold">
                                    Year {award.year}
                                </span>
                                <span className="text-yellow-400 font-semibold">
                                    {award.tier}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="bg-gradient-to-r from-yellow-600 to-amber-600 rounded-xl p-6 text-center mb-6">
                    <h2 className="text-3xl font-black text-black mb-2">
                        {awards.length} Award{awards.length !== 1 ? 's' : ''} Won!
                    </h2>
                    <p className="text-black/80 font-semibold">
                        An outstanding season performance
                    </p>
                </div>

                {/* Continue Button */}
                <button
                    onClick={onDismiss}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 py-4 rounded-xl font-black text-xl uppercase shadow-lg transition-all transform hover:scale-105"
                >
                    Continue to Next Season →
                </button>
            </div>
        </div>
    );
};

export default AwardsCeremony;
