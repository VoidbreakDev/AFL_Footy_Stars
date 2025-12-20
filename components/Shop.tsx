import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { SHOP_ITEMS } from '../constants';
import { ShopItem } from '../types';

const Shop: React.FC = () => {
    const { player, setView, purchaseItem } = useGame();
    const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'RECOVERY' | 'TRAINING' | 'COSMETIC' | 'CAREER'>('ALL');
    const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);

    if (!player) return null;

    const wallet = player.wallet || 0;
    const purchasedItems = player.itemsPurchased || [];

    const filteredItems = selectedCategory === 'ALL'
        ? SHOP_ITEMS
        : SHOP_ITEMS.filter(item => item.category === selectedCategory);

    const canAfford = (item: ShopItem) => wallet >= item.price;
    const isPurchased = (item: ShopItem) => item.oneTime && purchasedItems.includes(item.id);

    const handlePurchaseClick = (item: ShopItem) => {
        if (!canAfford(item)) return;
        if (isPurchased(item)) return;
        setSelectedItem(item);
        setShowConfirmation(true);
    };

    const confirmPurchase = () => {
        if (!selectedItem) return;

        const success = purchaseItem(selectedItem.id);

        if (success) {
            setPurchaseMessage(`Successfully purchased ${selectedItem.name}!`);
            setTimeout(() => setPurchaseMessage(null), 3000);
        }

        setShowConfirmation(false);
        setSelectedItem(null);
    };

    const categories = [
        { id: 'ALL' as const, name: 'All Items', icon: '🛍️' },
        { id: 'RECOVERY' as const, name: 'Recovery', icon: '❤️' },
        { id: 'TRAINING' as const, name: 'Training', icon: '💪' },
        { id: 'CAREER' as const, name: 'Career', icon: '⭐' }
    ];

    const getEffectDescription = (item: ShopItem) => {
        const { effect } = item;
        switch (effect.type) {
            case 'ENERGY':
                return `+${effect.value} Energy`;
            case 'SKILL_POINTS':
                return `+${effect.value} Skill Points`;
            case 'MORALE':
                return `+${effect.value} Morale`;
            case 'INJURY_HEAL':
                return `Heal ${effect.value} weeks`;
            case 'XP_BOOST':
                return `+${effect.value}% XP for next match`;
            case 'ATTRIBUTE_BOOST':
                return `+${effect.value} ${effect.attribute?.toUpperCase()}`;
            case 'COSMETIC':
                return 'Cosmetic Item';
            default:
                return '';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-950 via-gray-900 to-black text-white p-6">
            {/* Success Message */}
            {purchaseMessage && (
                <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
                    ✓ {purchaseMessage}
                </div>
            )}

            {/* Header */}
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">🏪 The Shop</h1>
                        <p className="text-gray-400">Invest in your career</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-400">Your Wallet</p>
                        <p className="text-3xl font-bold text-green-400">${wallet.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Lifetime: ${(player.lifetimeEarnings || 0).toLocaleString()}</p>
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                                selectedCategory === cat.id
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                            }`}
                        >
                            {cat.icon} {cat.name}
                        </button>
                    ))}
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {filteredItems.map(item => {
                        const purchased = isPurchased(item);
                        const affordable = canAfford(item);

                        return (
                            <div
                                key={item.id}
                                className={`bg-gray-800/40 border rounded-xl p-4 transition-all ${
                                    purchased
                                        ? 'border-purple-500/30 opacity-60'
                                        : affordable
                                        ? 'border-green-500/30 hover:border-green-500 cursor-pointer hover:scale-105'
                                        : 'border-gray-700/30 opacity-75'
                                }`}
                                onClick={() => !purchased && affordable && handlePurchaseClick(item)}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="text-4xl">{item.icon}</div>
                                    <div className="text-right">
                                        <div className={`text-xl font-bold ${affordable ? 'text-green-400' : 'text-red-400'}`}>
                                            ${item.price.toLocaleString()}
                                        </div>
                                        {item.oneTime && (
                                            <div className="text-xs text-purple-400">One-time</div>
                                        )}
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold mb-1">{item.name}</h3>
                                <p className="text-sm text-gray-400 mb-2">{item.description}</p>

                                <div className="flex items-center justify-between">
                                    <div className="text-xs font-semibold text-blue-400">
                                        {getEffectDescription(item)}
                                    </div>
                                    {purchased && (
                                        <div className="text-xs bg-purple-600 px-2 py-1 rounded">
                                            ✓ Owned
                                        </div>
                                    )}
                                    {!purchased && !affordable && (
                                        <div className="text-xs bg-red-600/50 px-2 py-1 rounded">
                                            Can't Afford
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Back Button */}
                <button
                    onClick={() => setView('DASHBOARD')}
                    className="w-full bg-gray-800 hover:bg-gray-700 py-3 rounded-lg font-semibold transition-colors"
                >
                    ← Back to Dashboard
                </button>
            </div>

            {/* Purchase Confirmation Modal */}
            {showConfirmation && selectedItem && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 border-2 border-green-500 rounded-xl p-6 max-w-md w-full">
                        <div className="text-center mb-4">
                            <div className="text-6xl mb-3">{selectedItem.icon}</div>
                            <h2 className="text-2xl font-bold mb-2">{selectedItem.name}</h2>
                            <p className="text-gray-400 mb-4">{selectedItem.description}</p>
                        </div>

                        <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-400">Effect:</span>
                                <span className="text-blue-400 font-semibold">{getEffectDescription(selectedItem)}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-400">Price:</span>
                                <span className="text-green-400 font-bold">${selectedItem.price.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-700 pt-2">
                                <span className="text-gray-400">After Purchase:</span>
                                <span className="text-white font-bold">${(wallet - selectedItem.price).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowConfirmation(false);
                                    setSelectedItem(null);
                                }}
                                className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmPurchase}
                                className="flex-1 bg-green-600 hover:bg-green-500 py-3 rounded-lg font-semibold transition-colors"
                            >
                                Confirm Purchase
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Shop;
