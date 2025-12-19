
import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
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

const ScreenSelector: React.FC = () => {
  const { view } = useGame();

  switch (view) {
    case 'ONBOARDING':
      return <Onboarding />;
    case 'DASHBOARD':
      return <Dashboard />;
    case 'MATCH_PREVIEW':
    case 'MATCH_SIM':
    case 'MATCH_RESULT':
      return <MatchSim />;
    case 'TRAINING':
      return <Training />;
    case 'CLUB':
      return <ClubHub />;
    case 'LEAGUE':
        return <LeagueView />;
    case 'PLAYER':
        return <PlayerStatsView />;
    case 'ACHIEVEMENTS':
        return <Achievements />;
    case 'MILESTONES':
        return <MilestonesGallery />;
    case 'PLAYER_COMPARISON':
        return <PlayerComparison />;
    case 'SETTINGS':
        return <Settings />;
    case 'CAREER_SUMMARY':
        return <CareerSummary />;
    default:
      return <Dashboard />;
  }
};

const App: React.FC = () => {
  return (
    <GameProvider>
      <Layout>
        <ScreenSelector />
      </Layout>
    </GameProvider>
  );
};

export default App;
