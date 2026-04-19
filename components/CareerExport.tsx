import React, { useState } from 'react';
import { PlayerProfile } from '../types';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

interface CareerExportProps {
  player: PlayerProfile;
  currentRound: number;
}

const CareerExport: React.FC<CareerExportProps> = ({ player, currentRound }) => {
  const [showModal, setShowModal] = useState(false);
  const [exportedData, setExportedData] = useState('');
  const [copied, setCopied] = useState(false);

  const calculateOverall = () => {
    const attrs = Object.values(player.attributes);
    return Math.round(attrs.reduce((a, b) => a + b, 0) / attrs.length);
  };

  const generateCareerCard = () => {
    const overall = calculateOverall();
    const card = `
🏉 AFL FOOTY STARS - CAREER CARD 🏉
━━━━━━━━━━━━━━━━━━━━━━
👤 ${player.name} | #${player.jerseyNumber || '?'}
📍 ${player.position} | Age ${player.age}
⭐ Overall: ${overall}/99 | Potential: ${player.potential}/99

📊 CAREER STATS
━━━━━━━━━━━━━━━━━━━━━━
🏟️ Matches: ${player.careerStats.matches}
⚽ Goals: ${player.careerStats.goals}
🏉 Disposals: ${player.careerStats.disposals}
🛑 Tackles: ${player.careerStats.tackles}
🏅 Brownlow Votes: ${player.careerStats.votes}
🏆 Premierships: ${player.careerStats.premierships}

💰 Career Earnings: $${(player.lifetimeEarnings || 0).toLocaleString()}
📈 Current Club: ${player.contract.clubName}
🎯 Round ${currentRound}, Year ${player.currentYear || 1}
━━━━━━━━━━━━━━━━━━━━━━
`.trim();
    return card;
  };

  const exportSaveFile = () => {
    const saveData = localStorage.getItem('footyLegendSave');
    if (!saveData) return;

    const blob = new Blob([saveData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `footy-stars-save-${player.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyCareerCard = async () => {
    const card = generateCareerCard();
    
    if (Capacitor.isNativePlatform()) {
      try {
        await Share.share({
          title: `${player.name} — AFL Career`,
          text: card,
          dialogTitle: 'Share your career',
        });
      } catch (e) {
        console.error('Share failed:', e);
        // Fallback to clipboard
        navigator.clipboard.writeText(card).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }
    } else {
      // Browser fallback
      navigator.clipboard.writeText(card).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-sm rounded-xl uppercase tracking-wide shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
      >
        <span className="text-lg">📤</span>
        Export / Share Career
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh'
        }}>
          <div className="bg-slate-900 rounded-2xl border-2 border-blue-500/40 shadow-2xl max-w-sm w-full max-h-[80vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-center">
              <h3 className="text-xl font-black text-white uppercase">Export Career</h3>
            </div>

            <div className="p-4 space-y-3">
              {/* Career Card Preview */}
              <div>
                <h4 className="text-xs font-bold text-blue-400 uppercase mb-2">Career Card</h4>
                <pre className="bg-slate-800 p-3 rounded-lg text-[10px] text-slate-300 whitespace-pre-wrap font-mono leading-relaxed max-h-60 overflow-y-auto">
                  {generateCareerCard()}
                </pre>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={copyCareerCard}
                  className={`w-full py-3 rounded-xl font-bold text-sm uppercase transition-all ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  {copied ? '✅ Copied to Clipboard!' : '📋 Copy Career Card'}
                </button>

                <button
                  onClick={exportSaveFile}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-xl uppercase"
                >
                  💾 Download Save File
                </button>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl uppercase text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CareerExport;
