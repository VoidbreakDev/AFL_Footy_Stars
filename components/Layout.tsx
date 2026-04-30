
import React from 'react';
import { useGame } from '../context/GameContext';
import { useAudioSystem, SoundEffects } from '../services/audioService';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { view, setView, currentSlot } = useGame();
    const { playSound, setVolumes } = useAudioSystem();

    // Set volumes from settings (hardcoded defaults for now)
    React.useEffect(() => {
        setVolumes(50, 80);
    }, [setVolumes]);

    // Views where the nav should slide off-screen
    const hiddenNavViews = ['ONBOARDING', 'MATCH_PREVIEW', 'MATCH_SIM', 'MATCH_RESULT', 'SLOT_SELECT'];
    const isNavHidden = hiddenNavViews.includes(view);

    // Group match views to prevent unmounting/remounting which destroys MatchSim local state
    // When switching from PREVIEW -> SIM, we want the SAME component instance to persist.
    const animationKey = ['MATCH_PREVIEW', 'MATCH_SIM', 'MATCH_RESULT'].includes(view) 
        ? 'MATCH_SEQUENCE' 
        : view;

    // Helper for nav button style
    const navClass = (active: boolean) =>
        `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-300 relative ${active ? 'text-emerald-400 scale-105' : 'text-slate-500 hover:text-slate-300'}`;

    return (
        <div className="h-screen bg-slate-900 text-white max-w-md mx-auto relative shadow-2xl flex flex-col">
            {/* Main Content Area */}
            {/* We use a calculated key to prevent remounting during match sequences */}
            <main className="flex-1 overflow-y-auto scroll-smooth w-full">
                <div key={animationKey} className="animate-slide-in min-h-full">
                    {children}
                </div>
            </main>

            {/* Bottom Navigation */}
            <div
                className={`relative shrink-0 bg-slate-950 border-t border-slate-800 z-50 transition-all duration-500 ${isNavHidden ? 'hidden' : ''}`}
                style={{ paddingBottom: 'env(safe-area-inset-bottom)', minHeight: '5rem' }}
            >
                {/* Slot badge */}
                <div className="absolute top-1 right-2 text-white/20 text-[9px] font-semibold select-none">
                    Career {currentSlot + 1}
                </div>
                <div className="grid grid-cols-5 h-full relative">

                    <button onClick={() => { playSound(SoundEffects.uiNav); setView('TRAINING'); }} className={navClass(view === 'TRAINING')}>
                        {view === 'TRAINING' && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-emerald-400 rounded-full"></div>}
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                         <span className="text-[10px] font-bold uppercase">Train</span>
                    </button>

                    <button onClick={() => { playSound(SoundEffects.uiNav); setView('PLAYER'); }} className={navClass(view === 'PLAYER')}>
                        {view === 'PLAYER' && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-emerald-400 rounded-full"></div>}
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        <span className="text-[10px] font-bold uppercase">Me</span>
                    </button>

                    {/* Floating Match Button */}
                    <div className="relative -top-6 flex justify-center pointer-events-none">
                        <button
                            onClick={() => setView('DASHBOARD')}
                            className={`w-16 h-16 rounded-full border-4 border-slate-900 flex items-center justify-center shadow-lg shadow-emerald-900/50 transition-all duration-300 pointer-events-auto active:scale-95 ${view === 'DASHBOARD' ? 'bg-emerald-400 text-slate-900 scale-110' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        >
                            {/* Football Shape SVG */}
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
                                <path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8 c0-4.41,3.59-8,8-8s8,3.59,8,8C20,16.41,16.41,20,12,20z M11,6v4h2V6H11z M11,14v4h2v-4H11z"/>
                            </svg>
                        </button>
                    </div>

                    <button onClick={() => { playSound(SoundEffects.uiNav); setView('LEAGUE'); }} className={navClass(view === 'LEAGUE')}>
                        {view === 'LEAGUE' && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-emerald-400 rounded-full"></div>}
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        <span className="text-[10px] font-bold uppercase">League</span>
                    </button>

                    <button onClick={() => { playSound(SoundEffects.uiNav); setView('HUB'); }} className={navClass(view === 'HUB')}>
                        {view === 'HUB' && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-emerald-400 rounded-full"></div>}
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        <span className="text-[10px] font-bold uppercase">Hub</span>
                    </button>

                </div>
            </div>
        </div>
    );
};

export default Layout;
