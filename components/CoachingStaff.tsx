import React, { useState, useEffect } from 'react';
import { useGameContext } from '../context/GameContext';
import { Coach, StaffMember } from '../types';
import {
  getCoachPersonalityIcon,
  getStaffRoleIcon,
  getCoachRelationshipColor,
  generateAvailableStaff
} from '../utils/coachingUtils';
import { COACH_PERSONALITY_EFFECTS } from '../constants';

const CoachingStaff: React.FC = () => {
  const { player, setView, hireCoachingStaff, currentRound } = useGameContext();
  const [selectedTab, setSelectedTab] = useState<'OVERVIEW' | 'COACHES' | 'STAFF' | 'HIRE'>('OVERVIEW');
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [availableStaff, setAvailableStaff] = useState<StaffMember[]>([]);

  if (!player || !player.coachingStaff) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setView('DASHBOARD')}
            className="mb-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition-all"
          >
            ← Back
          </button>
          <div className="bg-gray-800 border-2 border-gray-700 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🎓</div>
            <h3 className="text-2xl font-bold mb-2">No Coaching Staff Data</h3>
            <p className="text-gray-400">Start a new game to see your coaching staff!</p>
          </div>
        </div>
      </div>
    );
  }

  const staff = player.coachingStaff;

  // Generate available staff when HIRE tab is opened
  useEffect(() => {
    if (selectedTab === 'HIRE' && availableStaff.length === 0) {
      const newStaff = generateAvailableStaff(player.contract.tier, 6);
      setAvailableStaff(newStaff);
    }
  }, [selectedTab, player.contract.tier]);

  const handleHire = (staffMember: StaffMember, contractType: 'PERMANENT' | 'TEMPORARY') => {
    const cost = contractType === 'TEMPORARY' ? staffMember.weeklyCost! : staffMember.seasonCost!;

    if (player.wallet! < cost) {
      alert(`Not enough money! Need $${cost.toLocaleString()}, have $${player.wallet!.toLocaleString()}`);
      return;
    }

    if (hireCoachingStaff) {
      hireCoachingStaff(staffMember, contractType);
      // Regenerate available staff
      const newStaff = generateAvailableStaff(player.contract.tier, 6);
      setAvailableStaff(newStaff);
      setSelectedTab('STAFF'); // Switch to staff tab to see new hire
    }
  };

  const renderOverview = () => {
    return (
      <div className="space-y-6">
        {/* Overall Staff Quality */}
        <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-2 border-blue-500 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>🏆</span> Staff Quality
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className={`text-3xl font-black ${staff.staffRating >= 80 ? 'text-green-400' : staff.staffRating >= 60 ? 'text-blue-400' : staff.staffRating >= 40 ? 'text-yellow-400' : 'text-orange-400'}`}>
                {staff.staffRating}
              </div>
              <div className="text-sm text-gray-400 mt-1">Overall Rating</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-black text-green-400">+{staff.trainingBonus}%</div>
              <div className="text-sm text-gray-400 mt-1">Training Bonus</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-black text-blue-400">+{staff.injuryPrevention}%</div>
              <div className="text-sm text-gray-400 mt-1">Injury Prevention</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-black text-purple-400">+{staff.recoveryBonus}%</div>
              <div className="text-sm text-gray-400 mt-1">Recovery Speed</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-black text-yellow-400">{staff.moraleBonus > 0 ? '+' : ''}{staff.moraleBonus}</div>
              <div className="text-sm text-gray-400 mt-1">Morale Impact</div>
            </div>
          </div>
        </div>

        {/* Head Coach Spotlight */}
        <div className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-2 border-yellow-500 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span>👔</span> Head Coach
          </h3>
          <div className="flex items-start gap-4">
            <div className="text-5xl">{getCoachPersonalityIcon(staff.headCoach.personality)}</div>
            <div className="flex-1">
              <div className="font-bold text-2xl text-white mb-1">{staff.headCoach.name}</div>
              <div className="text-sm text-gray-300 mb-2">
                Age {staff.headCoach.age} • {staff.headCoach.yearsAtClub} years at club
                {staff.headCoach.premierships > 0 && ` • ${staff.headCoach.premierships} Premiership${staff.headCoach.premierships > 1 ? 's' : ''}`}
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-yellow-900/50 rounded-full text-xs font-bold text-yellow-400">
                  {staff.headCoach.personality}
                </span>
                <span className="text-xs text-gray-400">
                  {COACH_PERSONALITY_EFFECTS[staff.headCoach.personality].description}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-gray-400">Expertise:</span>
                  <span className="ml-2 font-bold text-white">{staff.headCoach.expertise}</span>
                </div>
                <div>
                  <span className="text-gray-400">Experience:</span>
                  <span className="ml-2 font-bold text-white">{staff.headCoach.experience}</span>
                </div>
                <div>
                  <span className="text-gray-400">Motivation:</span>
                  <span className="ml-2 font-bold text-white">{staff.headCoach.motivation}</span>
                </div>
                <div>
                  <span className="text-gray-400">Reputation:</span>
                  <span className="ml-2 font-bold text-white">{staff.headCoach.reputation}</span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="bg-gray-800/50 rounded-lg p-2">
                  <span className="text-gray-400 text-xs">Relationship:</span>
                  <div className={`font-bold ${getCoachRelationshipColor(staff.headCoach.relationship)}`}>
                    {staff.headCoach.relationship}/100
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-2">
                  <span className="text-gray-400 text-xs">Trust:</span>
                  <div className={`font-bold ${getCoachRelationshipColor(staff.headCoach.trust)}`}>
                    {staff.headCoach.trust}/100
                  </div>
                </div>
              </div>
              {staff.headCoach.lastInteraction && (
                <div className="mt-3 bg-gray-800/50 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Last Interaction:</div>
                  <div className="text-sm text-white">{staff.headCoach.lastInteraction.message}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Round {staff.headCoach.lastInteraction.round}, Year {staff.headCoach.lastInteraction.year}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Staff Summary */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <span>🎓</span> Assistant Coaches ({staff.assistantCoaches.length})
            </h4>
            <div className="space-y-2">
              {staff.assistantCoaches.map(coach => (
                <div key={coach.id} className="flex items-center justify-between bg-gray-700/50 rounded p-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getCoachPersonalityIcon(coach.personality)}</span>
                    <div>
                      <div className="font-bold text-sm text-white">{coach.name}</div>
                      <div className="text-xs text-gray-400">{coach.specialty} Specialist</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">Expertise: {coach.expertise}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <span>💪</span> Support Staff ({staff.fitnessStaff.length + staff.medicalStaff.length + (staff.mentalCoach ? 1 : 0)})
            </h4>
            <div className="space-y-2">
              {[...staff.fitnessStaff, ...staff.medicalStaff, ...(staff.mentalCoach ? [staff.mentalCoach] : [])].map(member => (
                <div key={member.id} className="flex items-center justify-between bg-gray-700/50 rounded p-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getStaffRoleIcon(member.role)}</span>
                    <div>
                      <div className="font-bold text-sm text-white">{member.name}</div>
                      <div className="text-xs text-gray-400">{member.role.replace(/_/g, ' ')}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">Power: {member.effectPower}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCoachesList = () => {
    const allCoaches = [staff.headCoach, ...staff.assistantCoaches];

    return (
      <div className="space-y-3">
        {allCoaches.map((coach, idx) => (
          <div
            key={coach.id}
            onClick={() => setSelectedCoach(coach)}
            className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-yellow-500 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">{getCoachPersonalityIcon(coach.personality)}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="font-bold text-white">{coach.name}</span>
                    {idx === 0 && <span className="ml-2 px-2 py-1 bg-yellow-900/50 text-yellow-400 text-xs font-bold rounded">HEAD COACH</span>}
                  </div>
                  <span className="text-xs text-gray-400">{coach.personality}</span>
                </div>
                <div className="text-sm text-gray-400 mb-2">{coach.specialty} Specialist • Age {coach.age}</div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Expertise:</span>
                    <span className="ml-1 font-bold text-white">{coach.expertise}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Experience:</span>
                    <span className="ml-1 font-bold text-white">{coach.experience}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Relationship:</span>
                    <span className={`ml-1 font-bold ${getCoachRelationshipColor(coach.relationship)}`}>{coach.relationship}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Trust:</span>
                    <span className={`ml-1 font-bold ${getCoachRelationshipColor(coach.trust)}`}>{coach.trust}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderStaffList = () => {
    const allStaff = [...staff.fitnessStaff, ...staff.medicalStaff, ...(staff.mentalCoach ? [staff.mentalCoach] : [])];

    return (
      <div className="space-y-3">
        {allStaff.map(member => (
          <div
            key={member.id}
            onClick={() => setSelectedStaff(member)}
            className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-blue-500 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">{getStaffRoleIcon(member.role)}</div>
              <div className="flex-1">
                <div className="font-bold text-white mb-1">{member.name}</div>
                <div className="text-sm text-gray-400 mb-2">{member.role.replace(/_/g, ' ')}</div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Expertise:</span>
                    <span className="ml-1 font-bold text-white">{member.expertise}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Effect Power:</span>
                    <span className="ml-1 font-bold text-green-400">{member.effectPower}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Relationship:</span>
                    <span className={`ml-1 font-bold ${getCoachRelationshipColor(member.relationship)}`}>{member.relationship}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderHireStaff = () => {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">💰</div>
            <div>
              <h3 className="font-bold text-yellow-400">Your Budget</h3>
              <p className="text-white text-xl font-black">${(player.wallet || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-4">Available Staff</h3>
        <div className="grid gap-3">
          {availableStaff.map(staffMember => (
            <div
              key={staffMember.id}
              className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-green-500 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{getStaffRoleIcon(staffMember.role)}</div>
                <div className="flex-1">
                  <div className="font-bold text-white mb-1">{staffMember.name}</div>
                  <div className="text-sm text-gray-400 mb-2">{staffMember.role.replace(/_/g, ' ')}</div>
                  <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                    <div>
                      <span className="text-gray-500">Expertise:</span>
                      <span className={`ml-1 font-bold ${
                        staffMember.expertise >= 80 ? 'text-green-400' :
                        staffMember.expertise >= 60 ? 'text-blue-400' :
                        staffMember.expertise >= 40 ? 'text-yellow-400' : 'text-orange-400'
                      }`}>{staffMember.expertise}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Experience:</span>
                      <span className="ml-1 font-bold text-white">{staffMember.experience}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Effect Power:</span>
                      <span className="ml-1 font-bold text-green-400">{staffMember.effectPower}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleHire(staffMember, 'TEMPORARY')}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold transition-all"
                      disabled={(player.wallet || 0) < staffMember.weeklyCost!}
                    >
                      <div>Hire for 1 Week</div>
                      <div className="text-xs">${staffMember.weeklyCost!.toLocaleString()}</div>
                    </button>
                    <button
                      onClick={() => handleHire(staffMember, 'PERMANENT')}
                      className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-bold transition-all"
                      disabled={(player.wallet || 0) < staffMember.seasonCost!}
                    >
                      <div>Hire for Season</div>
                      <div className="text-xs">${staffMember.seasonCost!.toLocaleString()}</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            const newStaff = generateAvailableStaff(player.contract.tier, 6);
            setAvailableStaff(newStaff);
          }}
          className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition-all"
        >
          🔄 Refresh Available Staff
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => setView('DASHBOARD')}
            className="mb-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition-all"
          >
            ← Back to Dashboard
          </button>

          <h1 className="text-4xl font-black mb-2">Coaching Staff</h1>
          <p className="text-gray-400">Your club's coaches and support staff</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setSelectedTab('OVERVIEW')}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              selectedTab === 'OVERVIEW'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedTab('COACHES')}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              selectedTab === 'COACHES'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Coaches ({1 + staff.assistantCoaches.length})
          </button>
          <button
            onClick={() => setSelectedTab('STAFF')}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              selectedTab === 'STAFF'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Staff ({staff.fitnessStaff.length + staff.medicalStaff.length + (staff.mentalCoach ? 1 : 0)})
          </button>
          <button
            onClick={() => setSelectedTab('HIRE')}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              selectedTab === 'HIRE'
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            💼 Hire Staff
          </button>
        </div>

        {/* Content */}
        {selectedTab === 'OVERVIEW' && renderOverview()}
        {selectedTab === 'COACHES' && renderCoachesList()}
        {selectedTab === 'STAFF' && renderStaffList()}
        {selectedTab === 'HIRE' && renderHireStaff()}
      </div>
    </div>
  );
};

export default CoachingStaff;
