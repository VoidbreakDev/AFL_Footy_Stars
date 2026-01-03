import React from 'react';
import { Team } from '../types';
import TeamLogo from './TeamLogo';

interface FinalsIntroProps {
  player: any;
  league: Team[];
  onContinue: () => void;
}

const FinalsIntro: React.FC<FinalsIntroProps> = ({ player, league, onContinue }) => {
  const myTeam = league.find(t => t.name === player.contract.clubName);

  // Sort by ladder position
  const sortedLeague = [...league].sort((a, b) =>
    b.points - a.points || b.percentage - a.percentage
  );

  const ladderPosition = sortedLeague.findIndex(t => t.id === myTeam?.id) + 1;
  const madeFinals = ladderPosition <= 4;

  // Top 4 teams
  const finalistsTeams = sortedLeague.slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-down">
          <div className="text-6xl mb-4">🏁</div>
          <h1 className="text-5xl font-black text-white uppercase italic mb-2">
            Regular Season Complete
          </h1>
          <p className="text-slate-400 text-lg">14 Rounds | Season {player.currentYear || 1}</p>
        </div>

        {/* Player's Team Result */}
        <div className={`bg-gradient-to-br ${
          madeFinals
            ? 'from-green-900/40 to-emerald-900/40 border-green-500'
            : 'from-slate-800/40 to-slate-900/40 border-slate-700'
        } border-2 rounded-2xl p-6 mb-6 animate-slide-up`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-white mb-2">{myTeam?.name}</h2>
              <div className="flex gap-4 text-lg">
                <span className="text-white font-bold">
                  {myTeam?.wins}W - {myTeam?.losses}L
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-emerald-400 font-bold">
                  {myTeam?.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400 uppercase font-bold mb-1">Ladder Position</div>
              <div className={`text-6xl font-black ${
                ladderPosition === 1 ? 'text-yellow-400' :
                ladderPosition <= 4 ? 'text-green-400' :
                'text-slate-400'
              }`}>
                {ladderPosition}
                <span className="text-2xl align-top">
                  {ladderPosition === 1 ? 'st' : ladderPosition === 2 ? 'nd' : ladderPosition === 3 ? 'rd' : 'th'}
                </span>
              </div>
            </div>
          </div>

          {/* Finals Status */}
          <div className={`mt-4 p-4 rounded-xl ${
            madeFinals
              ? 'bg-green-500/20 border-2 border-green-500/50'
              : 'bg-slate-800/50 border-2 border-slate-700'
          }`}>
            {madeFinals ? (
              <div className="text-center">
                <div className="text-3xl mb-2">🎉</div>
                <h3 className="text-2xl font-black text-green-400 uppercase">Finals Qualified!</h3>
                <p className="text-green-300 mt-1">You're in the Top 4 - time to fight for the Premiership!</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-3xl mb-2">😞</div>
                <h3 className="text-xl font-black text-slate-400 uppercase">Season Over</h3>
                <p className="text-slate-500 mt-1">Didn't make finals this year. Time to rebuild for next season.</p>
              </div>
            )}
          </div>
        </div>

        {/* Finals Bracket Preview (if qualified) */}
        {madeFinals && (
          <div className="bg-slate-800/40 border-2 border-slate-700 rounded-2xl p-6 mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-center text-2xl font-black text-white uppercase mb-6 flex items-center justify-center gap-2">
              <span>🏆</span> Finals Bracket <span>🏆</span>
            </h3>

            {/* Semi Finals Matchups */}
            <div className="space-y-4">
              <div className="text-center text-sm text-slate-400 uppercase font-bold mb-4">Semi Finals</div>

              {/* Match 1: 1st vs 4th */}
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs text-slate-500">#1</span>
                    <TeamLogo team={finalistsTeams[0]} size="sm" showBorder={false} />
                    <span className={`${finalistsTeams[0].id === myTeam?.id ? 'text-green-400 font-black' : 'text-white'}`}>
                      {finalistsTeams[0].name}
                    </span>
                  </div>
                  <div className="text-slate-600 font-bold mx-4">vs</div>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className={`${finalistsTeams[3].id === myTeam?.id ? 'text-green-400 font-black' : 'text-white'}`}>
                      {finalistsTeams[3].name}
                    </span>
                    <TeamLogo team={finalistsTeams[3]} size="sm" showBorder={false} />
                    <span className="text-xs text-slate-500">#4</span>
                  </div>
                </div>
              </div>

              {/* Match 2: 2nd vs 3rd */}
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs text-slate-500">#2</span>
                    <TeamLogo team={finalistsTeams[1]} size="sm" showBorder={false} />
                    <span className={`${finalistsTeams[1].id === myTeam?.id ? 'text-green-400 font-black' : 'text-white'}`}>
                      {finalistsTeams[1].name}
                    </span>
                  </div>
                  <div className="text-slate-600 font-bold mx-4">vs</div>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className={`${finalistsTeams[2].id === myTeam?.id ? 'text-green-400 font-black' : 'text-white'}`}>
                      {finalistsTeams[2].name}
                    </span>
                    <TeamLogo team={finalistsTeams[2]} size="sm" showBorder={false} />
                    <span className="text-xs text-slate-500">#3</span>
                  </div>
                </div>
              </div>

              <div className="text-center mt-6">
                <div className="text-xs text-slate-500 uppercase font-bold">Then</div>
                <div className="text-sm text-slate-400 mt-2">Winners face off in the Grand Final</div>
              </div>
            </div>
          </div>
        )}

        {/* Final Ladder (Top 8) */}
        <div className="bg-slate-800/40 border-2 border-slate-700 rounded-2xl p-6 mb-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h3 className="text-center text-lg font-black text-white uppercase mb-4">Final Ladder</h3>
          <div className="space-y-2">
            {sortedLeague.slice(0, 8).map((team, index) => (
              <div
                key={team.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  team.id === myTeam?.id
                    ? 'bg-green-500/20 border-2 border-green-500/50'
                    : index < 4
                    ? 'bg-slate-700/30'
                    : 'bg-slate-800/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 text-center font-black ${
                    index === 0 ? 'text-yellow-400' :
                    index < 4 ? 'text-green-400' :
                    'text-slate-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className={`font-bold ${team.id === myTeam?.id ? 'text-green-400' : 'text-white'}`}>
                    {team.name}
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="text-white font-mono">{team.wins}-{team.losses}</span>
                  <span className="text-slate-400 font-mono">{team.percentage.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="w-full py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-xl uppercase rounded-xl shadow-lg transition-all"
        >
          {madeFinals ? 'Continue to Finals →' : 'Continue to Awards →'}
        </button>
      </div>
    </div>
  );
};

export default FinalsIntro;
