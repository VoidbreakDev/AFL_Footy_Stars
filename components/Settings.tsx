
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const Settings: React.FC = () => {
  const { saveGame, loadGame, setView, retirePlayer } = useGame();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [musicVol, setMusicVol] = useState(50);
  const [sfxVol, setSfxVol] = useState(80);
  const [showConfirmRetire, setShowConfirmRetire] = useState(false);

  const handleSave = () => {
      saveGame();
      setFeedback("Game Saved Successfully!");
      setTimeout(() => setFeedback(null), 2000);
  };

  const handleLoad = () => {
      const success = loadGame();
      if (success) {
          setFeedback("Game Loaded!");
      } else {
          setFeedback("No save file found.");
      }
      setTimeout(() => setFeedback(null), 2000);
  };

  const handleRetire = () => {
      retirePlayer();
  };

  return (
    <div className="p-4 pb-24 min-h-screen bg-slate-900">
      <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black text-white italic uppercase">Settings</h2>
          <button 
            onClick={() => setView('DASHBOARD')}
            className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300 font-bold text-sm uppercase hover:bg-slate-700"
          >
              Back
          </button>
      </div>

      {/* SAVE / LOAD SECTION */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8">
          <h3 className="text-emerald-400 font-bold uppercase text-sm mb-4 border-b border-slate-700 pb-2">Game Data</h3>
          
          <div className="grid gap-4">
              <button 
                onClick={handleSave}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black text-lg rounded-xl uppercase shadow-lg shadow-emerald-900/50 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                 <span>💾</span> Save Game
              </button>
              
              <button 
                onClick={handleLoad}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-lg rounded-xl uppercase shadow-lg shadow-blue-900/50 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                 <span>📂</span> Load Game
              </button>
          </div>

          {feedback && (
              <div className="mt-4 p-3 bg-slate-900/50 rounded-lg text-center text-white font-bold animate-pulse border border-slate-600">
                  {feedback}
              </div>
          )}
      </div>

      {/* AUDIO SECTION */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8">
          <h3 className="text-emerald-400 font-bold uppercase text-sm mb-4 border-b border-slate-700 pb-2">Audio</h3>
          
          <div className="space-y-6">
              <div>
                  <div className="flex justify-between text-sm font-bold text-slate-300 mb-2">
                      <span>Music Volume</span>
                      <span>{musicVol}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={musicVol} 
                    onChange={(e) => setMusicVol(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
              </div>
              <div>
                  <div className="flex justify-between text-sm font-bold text-slate-300 mb-2">
                      <span>Sound Effects</span>
                      <span>{sfxVol}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={sfxVol} 
                    onChange={(e) => setSfxVol(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
              </div>
          </div>
      </div>

      {/* DANGER ZONE / RETIREMENT */}
      <div className="bg-red-900/20 rounded-xl p-6 border border-red-500/50">
          <h3 className="text-red-400 font-bold uppercase text-sm mb-4 border-b border-red-500/30 pb-2">Career Management</h3>
          
          {!showConfirmRetire ? (
              <button 
                onClick={() => setShowConfirmRetire(true)}
                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black text-lg rounded-xl uppercase shadow-lg shadow-red-900/50 active:scale-95 transition-all"
              >
                 Retire Player
              </button>
          ) : (
              <div className="text-center animate-fade-in">
                  <p className="text-white font-bold mb-4">Are you sure? This ends your career.</p>
                  <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setShowConfirmRetire(false)}
                        className="py-3 bg-slate-700 text-white rounded-lg font-bold uppercase hover:bg-slate-600"
                      >
                          Cancel
                      </button>
                      <button 
                        onClick={handleRetire}
                        className="py-3 bg-red-600 text-white rounded-lg font-bold uppercase hover:bg-red-500 shadow-lg"
                      >
                          Confirm
                      </button>
                  </div>
              </div>
          )}
          <p className="text-[10px] text-red-300/70 mt-3 text-center">
              Retiring saves your stats to the Hall of Fame but ends the current game.
          </p>
      </div>
    </div>
  );
};

export default Settings;
