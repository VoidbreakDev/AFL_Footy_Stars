import React from 'react';
import { Fixture, Team } from '../types';
import TeamLogo from './TeamLogo';

interface GrandFinalResultProps {
  fixture: Fixture;
  league: Team[];
  player: any;
  onContinue: () => void;
}

const GrandFinalResult: React.FC<GrandFinalResultProps> = ({ fixture, league, player, onContinue }) => {
  const homeTeam = league.find(t => t.id === fixture.homeTeamId);
  const awayTeam = league.find(t => t.id === fixture.awayTeamId);
  const homeWon = (fixture.homeScore || 0) > (fixture.awayScore || 0);
  const winner = homeWon ? homeTeam : awayTeam;
  const loser = homeWon ? awayTeam : homeTeam;

  const myTeam = league.find(t => t.name === player.contract.clubName);
  const playerWon = winner?.id === myTeam?.id;
  const playerInGrandFinal = homeTeam?.id === myTeam?.id || awayTeam?.id === myTeam?.id;

  if (!playerInGrandFinal) {
    // Player didn't make grand final - just show result
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4 animate-fade-in">
        <div className="max-w-3xl w-full text-center">
          <div className="text-6xl mb-6">🏆</div>
          <h1 className="text-4xl font-black text-white uppercase italic mb-6">
            Grand Final Result
          </h1>

          <div className="bg-slate-800/40 border-2 border-slate-700 rounded-2xl p-8 mb-6">
            <div className="text-2xl font-bold text-slate-400 mb-4">
              {loser?.name} <span className="text-slate-600">{homeWon ? fixture.awayScore : fixture.homeScore}</span>
            </div>
            <div className="text-sm text-slate-500 mb-4">defeated by</div>
            <div className="text-4xl font-black text-yellow-400 mb-2">
              {winner?.name}
            </div>
            <div className="text-6xl font-black text-white mb-4">
              {homeWon ? fixture.homeScore : fixture.awayScore}
            </div>
            <div className="text-yellow-300 text-lg font-bold">
              🏆 PREMIERS {player.currentYear || 1}
            </div>
          </div>

          <button
            onClick={onContinue}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-xl uppercase rounded-xl shadow-lg transition-all"
          >
            Continue to Awards →
          </button>
        </div>
      </div>
    );
  }

  // Player was in the grand final
  if (playerWon) {
    // VICTORY!
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-b from-yellow-900 via-slate-950 to-slate-950 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
        <div className="max-w-4xl w-full py-8">
          {/* Confetti effect */}
          <div className="text-center mb-6 animate-bounce">
            <div className="text-8xl mb-4">🎉🏆🎊</div>
          </div>

          {/* Main Title */}
          <div className="text-center mb-8 animate-slide-down">
            <h1 className="text-7xl font-black text-yellow-400 uppercase italic mb-4 drop-shadow-lg">
              PREMIERS!
            </h1>
            <div className="text-3xl font-bold text-white mb-2">
              {myTeam?.name}
            </div>
            <div className="text-xl text-yellow-300">
              Season {player.currentYear || 1} Champions
            </div>
          </div>

          {/* Score Display */}
          <div className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-4 border-yellow-500 rounded-2xl p-8 mb-8 animate-slide-up shadow-2xl">
            <div className="text-center text-sm text-yellow-300 uppercase font-bold mb-6">
              Grand Final
            </div>

            <div className="flex items-center justify-between mb-6">
              {/* Winner */}
              <div className="flex-1 text-center bg-yellow-500/20 border-4 border-yellow-400 rounded-xl p-6">
                {myTeam && <TeamLogo team={myTeam} size="xl" className="mx-auto mb-3" />}
                <div className="text-3xl font-black text-yellow-400 mb-3">
                  {myTeam?.name}
                </div>
                <div className="text-7xl font-black text-white mb-3">
                  {homeWon ? fixture.homeScore : fixture.awayScore}
                </div>
                <div className="text-yellow-400 text-xl font-bold">✓ WINNERS</div>
              </div>

              <div className="px-6 text-yellow-600 font-black text-3xl">VS</div>

              {/* Loser */}
              <div className="flex-1 text-center bg-slate-900/50 border-2 border-slate-700 rounded-xl p-6">
                {loser && <TeamLogo team={loser} size="lg" className="mx-auto mb-3" />}
                <div className="text-2xl font-bold text-slate-400 mb-3">
                  {loser?.name}
                </div>
                <div className="text-5xl font-black text-slate-600 mb-3">
                  {homeWon ? fixture.awayScore : fixture.homeScore}
                </div>
                <div className="text-slate-500 text-lg">Runners Up</div>
              </div>
            </div>

            <div className="text-center text-2xl font-black text-yellow-400">
              🏆 PREMIERSHIP VICTORY 🏆
            </div>
          </div>

          {/* Celebration Messages */}
          <div className="bg-slate-800/40 border-2 border-yellow-500/50 rounded-2xl p-6 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="space-y-4 text-center">
              <p className="text-2xl font-bold text-white">
                🎊 {player.name} is a PREMIERSHIP PLAYER! 🎊
              </p>
              <p className="text-lg text-yellow-300">
                You've achieved every footballer's dream - hoisting the cup!
              </p>
              <p className="text-md text-slate-400">
                This moment will be remembered in {myTeam?.name} history forever.
              </p>
            </div>
          </div>

          {/* Stats Highlight */}
          <div className="grid grid-cols-3 gap-4 mb-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="bg-yellow-900/20 border-2 border-yellow-500/30 rounded-xl p-4 text-center">
              <div className="text-yellow-400 text-xs uppercase font-bold mb-1">Championship</div>
              <div className="text-3xl font-black text-white">🏆</div>
              <div className="text-yellow-300 text-sm mt-1">Earned</div>
            </div>
            <div className="bg-yellow-900/20 border-2 border-yellow-500/30 rounded-xl p-4 text-center">
              <div className="text-yellow-400 text-xs uppercase font-bold mb-1">Career Flags</div>
              <div className="text-3xl font-black text-white">{(player.careerStats.premierships || 0) + 1}</div>
              <div className="text-yellow-300 text-sm mt-1">Total</div>
            </div>
            <div className="bg-yellow-900/20 border-2 border-yellow-500/30 rounded-xl p-4 text-center">
              <div className="text-yellow-400 text-xs uppercase font-bold mb-1">Season</div>
              <div className="text-3xl font-black text-white">{player.currentYear || 1}</div>
              <div className="text-yellow-300 text-sm mt-1">Year</div>
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={onContinue}
            className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-black text-2xl uppercase rounded-xl shadow-2xl transition-all animate-pulse"
          >
            🏆 Celebrate Victory! 🏆
          </button>
        </div>
      </div>
    );
  } else {
    // DEFEAT
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4 animate-fade-in">
        <div className="max-w-3xl w-full">
          {/* Header */}
          <div className="text-center mb-8 animate-slide-down">
            <div className="text-6xl mb-4 opacity-50">💔</div>
            <h1 className="text-5xl font-black text-slate-400 uppercase italic mb-2">
              So Close
            </h1>
            <p className="text-slate-500 text-lg">Grand Final - Season {player.currentYear || 1}</p>
          </div>

          {/* Score Display */}
          <div className="bg-slate-800/40 border-2 border-slate-700 rounded-2xl p-8 mb-8 animate-slide-up">
            <div className="text-center text-sm text-slate-500 uppercase font-bold mb-6">
              Grand Final Result
            </div>

            <div className="flex items-center justify-between mb-6">
              {/* Player's Team (Lost) */}
              <div className="flex-1 text-center bg-slate-900/50 border-2 border-slate-700 rounded-xl p-6">
                {myTeam && <TeamLogo team={myTeam} size="lg" className="mx-auto mb-3" />}
                <div className="text-2xl font-bold text-slate-400 mb-3">
                  {myTeam?.name}
                </div>
                <div className="text-5xl font-black text-slate-600 mb-3">
                  {homeWon ? fixture.awayScore : fixture.homeScore}
                </div>
                <div className="text-slate-500 text-lg">Runners Up</div>
              </div>

              <div className="px-6 text-slate-700 font-black text-3xl">VS</div>

              {/* Winner */}
              <div className="flex-1 text-center bg-yellow-900/20 border-2 border-yellow-500/30 rounded-xl p-6">
                {winner && <TeamLogo team={winner} size="lg" className="mx-auto mb-3" />}
                <div className="text-2xl font-bold text-yellow-400 mb-3">
                  {winner?.name}
                </div>
                <div className="text-5xl font-black text-white mb-3">
                  {homeWon ? fixture.homeScore : fixture.awayScore}
                </div>
                <div className="text-yellow-400 text-lg font-bold">Premiers</div>
              </div>
            </div>
          </div>

          {/* Consolation Message */}
          <div className="bg-slate-800/40 border-2 border-slate-700 rounded-2xl p-6 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="space-y-3 text-center">
              <p className="text-xl font-bold text-slate-300">
                A heartbreaking end to a great season
              </p>
              <p className="text-md text-slate-400">
                You made it to the Grand Final - that's an incredible achievement.
              </p>
              <p className="text-sm text-slate-500">
                This loss will fuel your hunger for next season.
              </p>
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={onContinue}
            className="w-full py-4 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-black text-xl uppercase rounded-xl shadow-lg transition-all"
          >
            Continue to Awards →
          </button>
        </div>
      </div>
    );
  }
};

export default GrandFinalResult;
