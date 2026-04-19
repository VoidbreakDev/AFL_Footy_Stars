
import React, { useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { View } from './types';
import { App as CapApp } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import Layout from './components/Layout';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import MatchSim from './components/MatchSim';
import Training from './components/Training';
import ClubHub from './components/ClubHub';
import LeagueView from './components/LeagueView';
import PlayerStatsView from './components/PlayerStats';
import Settings from './components/Settings';
import CareerSummary from './components/CareerSummary';
import Achievements from './components/Achievements';
import MilestonesGallery from './components/MilestonesGallery';
import PlayerComparison from './components/PlayerComparison';
import TransferMarket from './components/TransferMarket';
import Shop from './components/Shop';
import Draft from './components/Draft';
import MediaHub from './components/MediaHub';
import CareerEvents from './components/CareerEvents';
import TeamChemistry from './components/TeamChemistry';
import CoachingStaff from './components/CoachingStaff';
import MasterSkillTree from './components/MasterSkillTree';
import SlotSelect from './components/SlotSelect';
import Hub from './components/Hub';

// ScreenSelector lives INSIDE GameProvider — can safely call useGame()
const ScreenSelector: React.FC = () => {
  const { view, player, draftClass, draftProspect, simulateDraft, completeDraft } = useGame();

  switch (view as View) {
    case 'ONBOARDING':        return <Onboarding />;
    case 'DASHBOARD':         return <Dashboard />;
    case 'MATCH_PREVIEW':
    case 'MATCH_SIM':
    case 'MATCH_RESULT':      return <MatchSim />;
    case 'TRAINING':          return <Training />;
    case 'CLUB':              return <ClubHub />;
    case 'LEAGUE':            return <LeagueView />;
    case 'PLAYER':            return <PlayerStatsView />;
    case 'ACHIEVEMENTS':      return <Achievements />;
    case 'MILESTONES':        return <MilestonesGallery />;
    case 'PLAYER_COMPARISON': return <PlayerComparison />;
    case 'TRANSFER_MARKET':   return <TransferMarket />;
    case 'SHOP':              return <Shop />;
    case 'DRAFT':
      return draftClass && player ? (
        <Draft
          draftClass={draftClass}
          userTeamName={player.contract.clubName}
          playerName={player.name}
          onSelectProspect={draftProspect}
          onSimulateDraft={simulateDraft}
          onCompleteDraft={completeDraft}
        />
      ) : <Dashboard />;
    case 'MEDIA_HUB':         return <MediaHub />;
    case 'CAREER_EVENTS':     return <CareerEvents />;
    case 'TEAM_CHEMISTRY':    return <TeamChemistry />;
    case 'COACHING_STAFF':    return <CoachingStaff />;
    case 'MASTER_SKILLS':     return <MasterSkillTree />;
    case 'SETTINGS':          return <Settings />;
    case 'HUB':               return <Hub />;
    case 'CAREER_SUMMARY':    return <CareerSummary />;
    case 'SLOT_SELECT':       return <SlotSelect />;
    default:                  return <Dashboard />;
  }
};

// AppShell handles Capacitor lifecycle — also lives INSIDE GameProvider
const AppShell: React.FC = () => {
  const { view, setView } = useGame();

  useEffect(() => {
    const initializeApp = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          await SplashScreen.hide({ fadeOutDuration: 300 });
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#0f172a' });
          const { initAudio } = await import('./services/audioService');
          await initAudio();
        } catch (e) {
          console.error('Capacitor init error:', e);
        }
      }
    };

    initializeApp();

    const backHandler = CapApp.addListener('backButton', () => {
      if (view === 'DASHBOARD' || view === 'SLOT_SELECT' || view === 'ONBOARDING') {
        CapApp.exitApp();
      } else {
        setView('DASHBOARD' as View);
      }
    });

    const stateHandler = CapApp.addListener('appStateChange', ({ isActive }) => {
      console.log(isActive ? 'App foregrounded' : 'App backgrounded');
    });

    return () => {
      backHandler.then(h => h.remove());
      stateHandler.then(h => h.remove());
    };
  }, [view, setView]);

  return (
    <Layout>
      <ScreenSelector />
    </Layout>
  );
};

// App is the ROOT — renders only GameProvider, nothing else
const App: React.FC = () => (
  <GameProvider>
    <AppShell />
  </GameProvider>
);

export default App;
