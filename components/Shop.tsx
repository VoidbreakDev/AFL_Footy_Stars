import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { SHOP_ITEMS } from '../constants';
import { ShopItem } from '../types';
import BackHeader from './BackHeader';

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
        { id: 'ALL' as const, name: 'All', icon: '🛍️' },
        { id: 'RECOVERY' as const, name: 'Recovery', icon: '❤️' },
        { id: 'TRAINING' as const, name: 'Training', icon: '💪' },
        { id: 'CAREER' as const, name: 'Career', icon: '⭐' },
        { id: 'COSMETIC' as const, name: 'Cosmetic', icon: '🎨' }
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

    const getCategorySectionHeader = (category: string) => {
        const icons: Record<string, string> = {
            'RECOVERY': '❤️',
            'TRAINING': '💪',
            'CAREER': '⭐',
            'COSMETIC': '🎨'
        };
        const names: Record<string, string> = {
            'RECOVERY': 'Recovery Items',
            'TRAINING': 'Training Boosts',
            'CAREER': 'Career Items',
            'COSMETIC': 'Cosmetic Items'
        };
        return {
            icon: icons[category] || '🛍️',
            name: names[category] || category
        };
    };

    return (
        <div className="h-full bg-slate-900 text-white" style={{ 
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
            paddingLeft: 'env(safe-area-inset-left)',
            paddingRight: 'env(safe-area-inset-right)'
        }}>
            {/* Success Message */}
            {purchaseMessage && (
                <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
                    ✓ {purchaseMessage}
                </div>
            )}

            {/* Header */}
            <BackHeader
                title="The Shop"
                subtitle={`$${wallet.toLocaleString()} available`}
                onBack={() => setView('DASHBOARD')}
            />

            {/* Category Tabs */}
            <div className="px-4 pt-2">
                <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex items-center gap-1 flex-shrink-0 px-3 py-2.5 min-h-[44px] rounded-lg text-xs font-bold uppercase transition-all ${
                                selectedCategory === cat.id
                                    ? 'bg-slate-700 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                        >
                            {cat.icon} {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Items List */}
            <div className="px-4 pb-24">
                {selectedCategory === 'ALL' ? (
                    categories.slice(1).map(category => {
                        const categoryItems = SHOP_ITEMS.filter(item => item.category === category.id);
                        if (categoryItems.length === 0) return null;
                        
                        const { icon, name } = getCategorySectionHeader(category.id);
                        
                        return (
                            <div key={category.id} className="mb-6">
                                <div className="sticky top-14 z-10 bg-slate-900 py-2 px-1 mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{icon}</span>
                                        <span className="text-slate-400 text-xs font-bold uppercase">{name}</span>
                                    </div>
                                </div>
                                
                                {categoryItems.map(item => {
                                    const purchased = isPurchased(item);
                                    const affordable = canAfford(item);
                                    
                                    return (
                                        <div
                                            key={item.id}
                                            className={`flex items-center gap-3 p-3 rounded-lg mb-2 border-l-2 transition-colors ${
                                                purchased
                                                    ? 'border-purple-500 bg-slate-800/50 opacity-60'
                                                    : affordable
                                                    ? 'border-emerald-500 bg-slate-800 hover:bg-slate-700 cursor-pointer active:scale-95'
                                                    : 'border-slate-600 bg-slate-800/30 opacity-75'
                                            }`}
                                            onClick={() => !purchased && affordable && handlePurchaseClick(item)}
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                                                <span className="text-2xl">{item.icon}</span>
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-sm text-white truncate">{item.name}</div>
                                                <div className="text-slate-400 text-xs truncate">{item.description}</div>
                                            </div>
                                            
                                            <div className="flex flex-col items-end gap-1">
                                                <div className={`text-sm font-black ${affordable ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    ${item.price.toLocaleString()}
                                                </div>
                                                {purchased ? (
                                                    <div className="text-[10px] bg-purple-600 px-2 py-0.5 rounded-full">✓ Owned</div>
                                                ) : !affordable ? (
                                                    <div className="text-[10px] bg-red-600/50 px-2 py-0.5 rounded-full">Can't Afford</div>
                                                ) : (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handlePurchaseClick(item); }}
                                                        className="text-[10px] bg-emerald-600 hover:bg-emerald-500 px-2 py-0.5 rounded-full font-bold transition-colors"
                                                    >
                                                        Buy
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })
                ) : (
                    filteredItems.map(item => {
                        const purchased = isPurchased(item);
                        const affordable = canAfford(item);
                        
                        return (
                            <div
                                key={item.id}
                                className={`flex items-center gap-3 p-3 rounded-lg mb-2 border-l-2 transition-colors ${
                                    purchased
                                        ? 'border-purple-500 bg-slate-800/50 opacity-60'
                                        : affordable
                                        ? 'border-emerald-500 bg-slate-800 hover:bg-slate-700 cursor-pointer active:scale-95'
                                        : 'border-slate-600 bg-slate-800/30 opacity-75'
                                }`}
                                onClick={() => !purchased && affordable && handlePurchaseClick(item)}
                            >
                                <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                                    <span className="text-2xl">{item.icon}</span>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm text-white truncate">{item.name}</div>
                                    <div className="text-slate-400 text-xs truncate">{item.description}</div>
                                </div>
                                
                                <div className="flex flex-col items-end gap-1">
                                    <div className={`text-sm font-black ${affordable ? 'text-emerald-400' : 'text-red-400'}`}>
                                        ${item.price.toLocaleString()}
                                    </div>
                                    {purchased ? (
                                        <div className="text-[10px] bg-purple-600 px-2 py-0.5 rounded-full">✓ Owned</div>
                                    ) : !affordable ? (
                                        <div className="text-[10px] bg-red-600/50 px-2 py-0.5 rounded-full">Can't Afford</div>
                                    ) : (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handlePurchaseClick(item); }}
                                            className="text-[10px] bg-emerald-600 hover:bg-emerald-500 px-2 py-0.5 rounded-full font-bold transition-colors"
                                        >
                                            Buy
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Purchase Confirmation Modal */}
            {showConfirmation && selectedItem && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" style={{ 
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh'
                }}>
                    <div className="bg-slate-900 border-2 border-emerald-500 rounded-xl p-6 max-w-md w-full">
                        <div className="text-center mb-4">
                            <div className="text-4xl mb-3">{selectedItem.icon}</div>
                            <h2 className="text-xl font-bold mb-2">{selectedItem.name}</h2>
                            <p className="text-slate-400 mb-4">{selectedItem.description}</p>
                        </div>

                        <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                            <div className="flex justify-between mb-2">
                                <span className="text-slate-400">Effect:</span>
                                <span className="text-blue-400 font-semibold">{getEffectDescription(selectedItem)}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-slate-400">Price:</span>
                                <span className="text-emerald-400 font-bold">${selectedItem.price.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border-t border-slate-700 pt-2">
                                <span className="text-slate-400">After Purchase:</span>
                                <span className="text-white font-bold">${(wallet - selectedItem.price).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmation(false)}
                                className="flex-1 py-3 rounded-lg font-bold uppercase transition-colors bg-slate-700 hover:bg-slate-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmPurchase}
                                className="flex-1 py-3 rounded-lg font-bold uppercase transition-colors bg-emerald-500 hover:bg-emerald-400 text-slate-900 active:scale-95"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Shop;