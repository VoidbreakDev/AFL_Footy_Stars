import React from 'react';
import { useGame } from '../context/GameContext';
import BackHeader from './BackHeader';

const Hub: React.FC = () => {
  const { player, setView, league } = useGame();
  
  if (!player) return null;
  
  // Get dynamic status hints
  const getStatusHint = (cardType: string): string => {
    switch (cardType) {
      case 'CLUB':
        const myTeam = league.find(t => t.name === player.contract.clubName);
        if (myTeam) {
          const ladderPos = [...league].sort((a, b) => b.points - a.points || b.percentage - a.percentage).findIndex(t => t.id === myTeam.id) + 1;
          return `${ladderPos}${getOrdinalSuffix(ladderPos)} on the ladder`;
        }
        return 'Club info';
      
      case 'SHOP':
        return `$${(player.wallet || 0).toLocaleString()} available`;
      
      case 'TRANSFER_MARKET':
        const offersCount = player.transferOffers?.length || 0;
        return offersCount > 0 ? `${offersCount} offer${offersCount !== 1 ? 's' : ''} waiting` : 'No current offers';
      
      case 'MEDIA_HUB':
        const unrespondedEvents = player.activeCareerEvents?.filter(e => e.type === 'MEDIA_CONFERENCE' && !e.resolved) || [];
        if (unrespondedEvents.length > 0) {
          return `${unrespondedEvents.length} event${unrespondedEvents.length !== 1 ? 's' : ''} need response`;
        }
        return player.mediaReputation?.tier || 'Unknown reputation';
      
      case 'CAREER_EVENTS':
        const activeEvents = player.activeCareerEvents?.length || 0;
        return activeEvents > 0 ? `${activeEvents} active event${activeEvents !== 1 ? 's' : ''}` : 'All clear';
      
      case 'ACHIEVEMENTS':
        const unlocked = player.achievements?.length || 0;
        const total = 72; // Total achievements in constants
        return `${unlocked}/${total} unlocked`;
      
      case 'MILESTONES':
        const milestones = player.milestones?.length || 0;
        return `${milestones} milestone${milestones !== 1 ? 's' : ''} achieved`;
      
      case 'MASTER_SKILLS':
        const spAvailable = player.skillPoints || 0;
        return spAvailable > 0 ? `${spAvailable} SP to spend` : 'All skills up to date';
      
      case 'SETTINGS':
        return 'Sound, saves, display';
      
      default:
        return '';
    }
  };
  
  const getOrdinalSuffix = (num: number): string => {
    const j = num % 10, k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  };
  
  const hubCards = [
    { id: 'CLUB', icon: '🏟️', label: 'Club', view: 'CLUB' as const },
    { id: 'SHOP', icon: '🛒', label: 'The Shop', view: 'SHOP' as const },
    { id: 'TRANSFER_MARKET', icon: '📨', label: 'Transfer Market', view: 'TRANSFER_MARKET' as const },
    { id: 'MEDIA_HUB', icon: '📱', label: 'Media Hub', view: 'MEDIA_HUB' as const },
    { id: 'CAREER_EVENTS', icon: '✨', label: 'Career Events', view: 'CAREER_EVENTS' as const },
    { id: 'ACHIEVEMENTS', icon: '🏆', label: 'Achievements', view: 'ACHIEVEMENTS' as const },
    { id: 'MILESTONES', icon: '🎖️', label: 'Milestones', view: 'MILESTONES' as const },
    { id: 'MASTER_SKILLS', icon: '🌟', label: 'Skill Tree', view: 'MASTER_SKILLS' as const },
    { id: 'SETTINGS', icon: '⚙️', label: 'Settings', view: 'SETTINGS' as const },
  ];

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <BackHeader 
        title="Your Career Hub"
        subtitle={`Season ${player.currentYear || 1}`}
        onBack={() => setView('DASHBOARD')}
      />
      
      <div className="p-4 pb-24">
        <div className="grid grid-cols-2 gap-3">
          {hubCards.map((card) => (
            <button
              key={card.id}
              onClick={() => setView(card.view)}
              className="bg-slate-800 rounded-xl border border-slate-700 p-4 hover:bg-slate-700 transition-colors active:scale-95"
            >
              <div className="text-left">
                <div className="text-2xl mb-2">{card.icon}</div>
                <div className="font-black text-sm uppercase mb-1">{card.label}</div>
                <div className="text-slate-400 text-xs text-left">{getStatusHint(card.id)}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hub;