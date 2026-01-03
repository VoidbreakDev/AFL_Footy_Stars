import React from 'react';
import { Fixture, Team } from '../types';
import TeamLogo from './TeamLogo';

interface SemiFinalsResultsProps {
  fixtures: Fixture[];
  league: Team[];
  onContinue: () => void;
}

const SemiFinalsResults: React.FC<SemiFinalsResultsProps> = ({ fixtures, league, onContinue }) => {
  // Get the two semi-final fixtures
  const semiFinals = fixtures.filter(f => f.round === 15 && f.played);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-down">
          <div className="text-6xl mb-4">⚔️</div>
          <h1 className="text-5xl font-black text-white uppercase italic mb-2">
            Semi Finals Complete
          </h1>
          <p className="text-slate-400 text-lg">The winners advance to the Grand Final</p>
        </div>

        {/* Results */}
        <div className="space-y-6 mb-8">
          {semiFinals.map((fixture, index) => {
            const homeTeam = league.find(t => t.id === fixture.homeTeamId);
            const awayTeam = league.find(t => t.id === fixture.awayTeamId);
            const homeWon = (fixture.homeScore || 0) > (fixture.awayScore || 0);
            const winner = homeWon ? homeTeam : awayTeam;

            return (
              <div
                key={fixture.id}
                className="bg-slate-800/40 border-2 border-slate-700 rounded-2xl p-6 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-center text-xs text-slate-500 uppercase font-bold mb-4">
                  Semi Final {index + 1}
                </div>

                <div className="flex items-center justify-between mb-4">
                  {/* Home Team */}
                  <div className={`flex-1 text-center p-4 rounded-xl ${
                    homeWon
                      ? 'bg-green-500/20 border-2 border-green-500/50'
                      : 'bg-slate-900/50 border-2 border-slate-700'
                  }`}>
                    {homeTeam && <TeamLogo team={homeTeam} size="lg" className="mx-auto mb-2" />}
                    <div className={`text-2xl font-black mb-2 ${
                      homeWon ? 'text-green-400' : 'text-slate-400'
                    }`}>
                      {homeTeam?.name}
                    </div>
                    <div className={`text-4xl font-black ${
                      homeWon ? 'text-white' : 'text-slate-600'
                    }`}>
                      {fixture.homeScore}
                    </div>
                    {homeWon && (
                      <div className="mt-2 text-green-400 text-sm font-bold">✓ WINNER</div>
                    )}
                  </div>

                  {/* VS */}
                  <div className="px-6 text-slate-600 font-black text-2xl">VS</div>

                  {/* Away Team */}
                  <div className={`flex-1 text-center p-4 rounded-xl ${
                    !homeWon
                      ? 'bg-green-500/20 border-2 border-green-500/50'
                      : 'bg-slate-900/50 border-2 border-slate-700'
                  }`}>
                    {awayTeam && <TeamLogo team={awayTeam} size="lg" className="mx-auto mb-2" />}
                    <div className={`text-2xl font-black mb-2 ${
                      !homeWon ? 'text-green-400' : 'text-slate-400'
                    }`}>
                      {awayTeam?.name}
                    </div>
                    <div className={`text-4xl font-black ${
                      !homeWon ? 'text-white' : 'text-slate-600'
                    }`}>
                      {fixture.awayScore}
                    </div>
                    {!homeWon && (
                      <div className="mt-2 text-green-400 text-sm font-bold">✓ WINNER</div>
                    )}
                  </div>
                </div>

                <div className="text-center text-sm text-green-400 font-bold">
                  {winner?.name} advances to the Grand Final
                </div>
              </div>
            );
          })}
        </div>

        {/* Grand Final Preview */}
        <div className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-2 border-yellow-500/50 rounded-2xl p-6 mb-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="text-center mb-4">
            <div className="text-5xl mb-2">🏆</div>
            <h2 className="text-3xl font-black text-yellow-400 uppercase italic">Grand Final</h2>
            <p className="text-yellow-300 text-sm mt-2">The ultimate showdown for the Premiership</p>
          </div>

          {semiFinals.length === 2 && (
            <div className="mt-6 bg-slate-900/50 rounded-xl p-4">
              <div className="flex items-center justify-center gap-4 text-xl font-black">
                <span className="text-white">
                  {((semiFinals[0].homeScore || 0) > (semiFinals[0].awayScore || 0)
                    ? league.find(t => t.id === semiFinals[0].homeTeamId)
                    : league.find(t => t.id === semiFinals[0].awayTeamId))?.name}
                </span>
                <span className="text-yellow-400">VS</span>
                <span className="text-white">
                  {((semiFinals[1].homeScore || 0) > (semiFinals[1].awayScore || 0)
                    ? league.find(t => t.id === semiFinals[1].homeTeamId)
                    : league.find(t => t.id === semiFinals[1].awayTeamId))?.name}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="w-full py-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-black text-xl uppercase rounded-xl shadow-lg transition-all"
        >
          Continue to Grand Final →
        </button>
      </div>
    </div>
  );
};

export default SemiFinalsResults;
