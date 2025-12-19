
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Position, LeagueTier, PlayerProfile, AvatarConfig } from '../types';
import { INITIAL_ATTRIBUTE_POINTS, PRESET_AVATARS, STARTING_AGE } from '../constants';
import Avatar from './Avatar';

const Onboarding: React.FC = () => {
  const { startNewGame } = useGame();
  const [step, setStep] = useState(1);
  
  const [name, setName] = useState('');
  const [position, setPosition] = useState<Position>(Position.MIDFIELDER);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarConfig>(PRESET_AVATARS[0]);
  
  const [attributes, setAttributes] = useState({
    kicking: 10,
    handball: 10,
    tackling: 10,
    marking: 10,
    speed: 10,
    stamina: 10,
    goalSense: 10
  });
  
  const [remainingPoints, setRemainingPoints] = useState(INITIAL_ATTRIBUTE_POINTS);
  const ATTRIBUTE_CAP = 20;

  const handleAttributeChange = (attr: keyof typeof attributes, change: number) => {
    if (change > 0 && remainingPoints > 0 && attributes[attr] < ATTRIBUTE_CAP) {
      setAttributes(prev => ({ ...prev, [attr]: prev[attr] + 1 }));
      setRemainingPoints(prev => prev - 1);
    } else if (change < 0 && attributes[attr] > 10) {
      setAttributes(prev => ({ ...prev, [attr]: prev[attr] - 1 }));
      setRemainingPoints(prev => prev + 1);
    }
  };

  const handleCreate = () => {
    if (!name) return;
    
    const newProfile: PlayerProfile = {
      name,
      gender: 'Male', 
      avatar: selectedAvatar,
      position,
      subPosition: 'GENERIC', // Will be overwritten in GameContext
      age: STARTING_AGE,
      potential: 90,
      attributes,
      careerStats: { matches: 0, goals: 0, behinds: 0, disposals: 0, tackles: 0, votes: 0, premierships: 0, awards: [] },
      seasonStats: { matches: 0, goals: 0, behinds: 0, disposals: 0, tackles: 0, votes: 0, premierships: 0, awards: [] },
      contract: { salary: 0, yearsLeft: 0, clubName: '', tier: LeagueTier.LOCAL },
      xp: 0,
      level: 1,
      skillPoints: 0,
      morale: 100,
      energy: 100,
      rivalries: [],
      injury: null,
      milestones: [],
      bio: "",
      isRetired: false
    };
    
    startNewGame(newProfile);
  };

  return (
    <div className="h-screen bg-slate-900 flex flex-col text-white overflow-hidden">
      <div className="p-4 pb-0 text-center shrink-0">
           <h1 className="text-3xl font-black text-emerald-400 uppercase italic tracking-wider">Create Legend</h1>
      </div>
      
      <div className="flex-1 p-4 flex flex-col overflow-hidden">
        {step === 1 ? (
            <div className="flex flex-col h-full gap-3">
                {/* Name */}
                <div className="shrink-0">
                    <label className="block text-[10px] text-slate-400 mb-1 uppercase font-bold">Name</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your Name"
                        className="w-full bg-slate-800 text-white p-3 py-2 rounded-lg border border-slate-700 focus:border-emerald-500 outline-none"
                    />
                </div>

                {/* Avatar */}
                <div className="flex-1 min-h-0 flex flex-col">
                    <label className="block text-[10px] text-slate-400 mb-1 uppercase font-bold">Select Look</label>
                    <div className="grid grid-cols-4 gap-2 overflow-y-auto pr-1 scrollbar-hide content-start">
                        {PRESET_AVATARS.map((avatar, i) => (
                        <div 
                            key={i}
                            onClick={() => setSelectedAvatar(avatar)}
                            className={`aspect-square rounded-lg bg-slate-800 flex items-center justify-center border-2 cursor-pointer transition-all overflow-hidden ${selectedAvatar.faceId === avatar.faceId ? 'border-emerald-500 bg-emerald-900/20 scale-95' : 'border-transparent opacity-70 hover:opacity-100'}`}
                        >
                            <Avatar avatar={avatar} teamColors={['#10b981', '#064e3b']} className="w-full h-full" />
                        </div>
                        ))}
                    </div>
                </div>

                {/* Position */}
                <div className="shrink-0">
                    <label className="block text-[10px] text-slate-400 mb-1 uppercase font-bold">Position</label>
                    <div className="grid grid-cols-4 gap-2">
                        {Object.values(Position).map((pos) => (
                        <button
                            key={pos}
                            onClick={() => setPosition(pos)}
                            className={`p-2 rounded-lg text-[10px] font-bold transition-colors uppercase tracking-tighter ${position === pos ? 'bg-emerald-500 text-slate-900' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}
                        >
                            {pos}
                        </button>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={() => setStep(2)}
                    disabled={!name}
                    className="w-full py-3 shrink-0 bg-white text-slate-900 font-black text-lg rounded-xl uppercase tracking-widest mt-2 disabled:opacity-50 active:scale-95 transition-transform"
                >
                    Next Step
                </button>
            </div>
        ) : (
            <div className="flex flex-col h-full">
                 {/* Header Summary */}
                 <div className="flex items-center gap-3 mb-4 bg-slate-800 p-2 rounded-xl border border-slate-700 shrink-0">
                     <div className="w-10 h-10">
                         <Avatar avatar={selectedAvatar} teamColors={['#10b981', '#064e3b']} className="w-full h-full" />
                     </div>
                     <div className="flex-1">
                         <div className="font-bold text-white leading-none text-sm">{name}</div>
                         <div className="text-[10px] text-emerald-400 uppercase">{position}</div>
                     </div>
                     <div className="text-right px-2">
                         <div className="text-[10px] text-slate-400 uppercase">SP Left</div>
                         <div className="text-xl font-bold text-emerald-400 leading-none">{remainingPoints}</div>
                     </div>
                 </div>

                 {/* Attributes List */}
                 <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                    {Object.entries(attributes).map(([key, val]) => {
                    const value = val as number;
                    return (
                    <div key={key} className="flex items-center justify-between bg-slate-800/50 p-1.5 px-3 rounded-lg border border-slate-700/50">
                        <span className="capitalize text-slate-300 text-xs font-bold">{key}</span>
                        <div className="flex items-center gap-2">
                        <button 
                            onClick={() => handleAttributeChange(key as any, -1)}
                            disabled={value <= 10}
                            className={`w-6 h-6 rounded flex items-center justify-center font-bold active:scale-95 text-sm ${value <= 10 ? 'bg-slate-800 text-slate-600' : 'bg-slate-700 text-emerald-400'}`}
                        >-</button>
                        <div className="w-12 text-center">
                            <div className={`text-sm font-mono font-bold ${value === ATTRIBUTE_CAP ? 'text-yellow-400' : 'text-white'}`}>{value}</div>
                        </div>
                        <button 
                            onClick={() => handleAttributeChange(key as any, 1)}
                            disabled={remainingPoints === 0 || value >= ATTRIBUTE_CAP}
                            className={`w-6 h-6 rounded flex items-center justify-center font-bold active:scale-95 text-sm ${remainingPoints === 0 || value >= ATTRIBUTE_CAP ? 'bg-slate-800 text-slate-600' : 'bg-slate-700 text-emerald-400'}`}
                        >+</button>
                        </div>
                    </div>
                    );
                    })}
                 </div>

                 {/* Actions */}
                 <div className="flex gap-3 mt-4 shrink-0">
                     <button 
                        onClick={() => setStep(1)}
                        className="px-4 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl uppercase text-sm"
                    >
                        Back
                    </button>
                    <button 
                        onClick={handleCreate}
                        disabled={remainingPoints > 0}
                        className={`flex-1 py-3 font-black text-lg rounded-xl uppercase tracking-widest shadow-lg transition-transform ${remainingPoints > 0 ? 'bg-slate-700 text-slate-500 opacity-50 cursor-not-allowed' : 'bg-emerald-500 text-slate-900 shadow-emerald-900/50 active:scale-95'}`}
                    >
                        Start Career
                    </button>
                 </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
