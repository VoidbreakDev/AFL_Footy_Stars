import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { MediaEvent } from '../types';

const MediaHub: React.FC = () => {
    const { player, respondToMedia, createSocialPost } = useGame();
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'EVENTS' | 'POST'>('OVERVIEW');
    const [postContent, setPostContent] = useState('');

    if (!player || !player.mediaReputation) return null;

    const mediaRep = player.mediaReputation;
    const pendingEvents = mediaRep.mediaEvents.filter(e => !e.hasResponded);
    const recentEvents = mediaRep.mediaEvents.slice(-10).reverse();

    // Get current milestone progress
    const currentMilestone = mediaRep.fanMilestones?.find(m => !m.unlocked);
    const nextMilestoneProgress = currentMilestone
        ? (mediaRep.fanFollowers / currentMilestone.followers) * 100
        : 100;

    // Reputation tier colors
    const tierColors: Record<typeof mediaRep.tier, string> = {
        'UNKNOWN': 'text-slate-500',
        'CONTROVERSIAL': 'text-orange-500',
        'DECENT': 'text-blue-400',
        'POPULAR': 'text-purple-400',
        'SUPERSTAR': 'text-yellow-400',
        'LEGEND': 'text-yellow-500'
    };

    const tierBgColors: Record<typeof mediaRep.tier, string> = {
        'UNKNOWN': 'bg-slate-800',
        'CONTROVERSIAL': 'bg-orange-900/30',
        'DECENT': 'bg-blue-900/30',
        'POPULAR': 'bg-purple-900/30',
        'SUPERSTAR': 'bg-yellow-900/30',
        'LEGEND': 'bg-gradient-to-r from-yellow-900/40 to-orange-900/40'
    };

    const formatFollowers = (count: number): string => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    };

    const handleRespond = (event: MediaEvent, responseType: 'HUMBLE' | 'CONFIDENT' | 'IGNORE') => {
        if (respondToMedia) {
            respondToMedia(event.id, responseType);
        }
    };

    const handlePost = () => {
        if (postContent.trim() && createSocialPost) {
            createSocialPost(postContent);
            setPostContent('');
            setActiveTab('OVERVIEW');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white pb-24">
            {/* Header */}
            <div className="p-6 pb-8">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                    📱 Media & Fans
                </h1>
                <p className="text-slate-400 text-sm">Manage your public image and fanbase</p>
            </div>

            {/* Reputation Card */}
            <div className={`mx-4 mb-6 p-6 rounded-xl border-2 ${tierBgColors[mediaRep.tier]} border-slate-700 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 opacity-10 text-8xl pointer-events-none">
                    {mediaRep.tier === 'LEGEND' ? '👑' : mediaRep.tier === 'SUPERSTAR' ? '💫' : '⭐'}
                </div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Reputation</p>
                            <p className={`text-2xl font-black ${tierColors[mediaRep.tier]}`}>
                                {mediaRep.tier.replace('_', ' ')}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-black text-white">{mediaRep.score}</p>
                            <p className="text-xs text-slate-400">/ 100</p>
                        </div>
                    </div>

                    {/* Reputation Bar */}
                    <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden mb-4">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                            style={{ width: `${mediaRep.score}%` }}
                        ></div>
                    </div>

                    {/* Followers */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold">Followers</p>
                            <p className="text-2xl font-black text-white">{formatFollowers(mediaRep.fanFollowers)}</p>
                        </div>
                        {currentMilestone && (
                            <div className="text-right">
                                <p className="text-xs text-slate-400">Next: {currentMilestone.title}</p>
                                <p className="text-sm font-bold text-purple-400">{formatFollowers(currentMilestone.followers)}</p>
                            </div>
                        )}
                    </div>

                    {/* Next Milestone Progress */}
                    {currentMilestone && (
                        <div className="mt-3">
                            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-purple-500 transition-all duration-500"
                                    style={{ width: `${Math.min(nextMilestoneProgress, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Pending Events Alert */}
            {pendingEvents.length > 0 && (
                <div className="mx-4 mb-6 p-4 bg-yellow-900/30 border-2 border-yellow-500 rounded-xl">
                    <p className="text-yellow-400 font-bold text-sm">
                        ⚠️ {pendingEvents.length} media event{pendingEvents.length > 1 ? 's' : ''} require{pendingEvents.length === 1 ? 's' : ''} your response!
                    </p>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 px-4 mb-6">
                <button
                    onClick={() => setActiveTab('OVERVIEW')}
                    className={`flex-1 py-3 rounded-lg font-bold text-xs uppercase transition-all ${
                        activeTab === 'OVERVIEW' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('EVENTS')}
                    className={`flex-1 py-3 rounded-lg font-bold text-xs uppercase transition-all relative ${
                        activeTab === 'EVENTS' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                >
                    Events
                    {pendingEvents.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center">
                            {pendingEvents.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('POST')}
                    className={`flex-1 py-3 rounded-lg font-bold text-xs uppercase transition-all ${
                        activeTab === 'POST' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                >
                    Post
                </button>
            </div>

            {/* Content */}
            <div className="px-4">
                {/* OVERVIEW TAB */}
                {activeTab === 'OVERVIEW' && (
                    <div className="space-y-6">
                        {/* Fan Milestones */}
                        <div>
                            <h3 className="text-purple-400 font-bold uppercase text-xs mb-3">Fan Milestones</h3>
                            <div className="space-y-2">
                                {mediaRep.fanMilestones?.map((milestone, index) => (
                                    <div
                                        key={index}
                                        className={`p-3 rounded-lg border ${
                                            milestone.unlocked
                                                ? 'bg-purple-900/30 border-purple-500'
                                                : 'bg-slate-800/50 border-slate-700 opacity-50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{milestone.icon}</span>
                                                <div>
                                                    <p className="font-bold text-white text-sm">{milestone.title}</p>
                                                    <p className="text-xs text-slate-400">
                                                        {formatFollowers(milestone.followers)} followers
                                                    </p>
                                                </div>
                                            </div>
                                            {milestone.unlocked && (
                                                <span className="text-emerald-400 text-xl">✓</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Stats */}
                        <div>
                            <h3 className="text-purple-400 font-bold uppercase text-xs mb-3">Media Stats</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-800 p-4 rounded-lg">
                                    <p className="text-xs text-slate-400 uppercase">Total Events</p>
                                    <p className="text-2xl font-black text-white">{mediaRep.mediaEvents.length}</p>
                                </div>
                                <div className="bg-slate-800 p-4 rounded-lg">
                                    <p className="text-xs text-slate-400 uppercase">Social Posts</p>
                                    <p className="text-2xl font-black text-white">{mediaRep.socialMediaPosts || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* EVENTS TAB */}
                {activeTab === 'EVENTS' && (
                    <div className="space-y-4">
                        {/* Pending Events */}
                        {pendingEvents.length > 0 && (
                            <div>
                                <h3 className="text-yellow-400 font-bold uppercase text-xs mb-3">⚡ Pending Response</h3>
                                {pendingEvents.map(event => (
                                    <div key={event.id} className="bg-yellow-900/20 border-2 border-yellow-500 p-4 rounded-xl mb-3">
                                        <div className="mb-3">
                                            <p className="text-xs text-yellow-400 uppercase font-bold mb-1">{event.type}</p>
                                            <p className="text-lg font-bold text-white mb-2">{event.title}</p>
                                            <p className="text-sm text-slate-300">{event.description}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleRespond(event, 'HUMBLE')}
                                                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold uppercase transition-all"
                                            >
                                                Humble
                                            </button>
                                            <button
                                                onClick={() => handleRespond(event, 'CONFIDENT')}
                                                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold uppercase transition-all"
                                            >
                                                Confident
                                            </button>
                                            <button
                                                onClick={() => handleRespond(event, 'IGNORE')}
                                                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold uppercase transition-all"
                                            >
                                                Ignore
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Recent Events */}
                        <div>
                            <h3 className="text-purple-400 font-bold uppercase text-xs mb-3">Recent History</h3>
                            {recentEvents.length > 0 ? (
                                <div className="space-y-2">
                                    {recentEvents.map(event => (
                                        <div key={event.id} className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <p className="text-xs text-slate-400 uppercase font-bold">{event.type}</p>
                                                    <p className="text-sm font-bold text-white">{event.title}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-slate-500">Y{event.year} R{event.round}</p>
                                                    <div className="flex gap-1 items-center justify-end mt-1">
                                                        <span className={`text-xs font-bold ${event.reputationImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                            {event.reputationImpact >= 0 ? '+' : ''}{event.reputationImpact}
                                                        </span>
                                                        <span className="text-xs text-slate-500">•</span>
                                                        <span className={`text-xs font-bold ${event.fanImpact >= 0 ? 'text-purple-400' : 'text-orange-400'}`}>
                                                            {event.fanImpact >= 0 ? '+' : ''}{formatFollowers(event.fanImpact)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 italic text-sm">No media events yet.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* POST TAB */}
                {activeTab === 'POST' && (
                    <div>
                        <h3 className="text-purple-400 font-bold uppercase text-xs mb-3">Create Social Media Post</h3>
                        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                            <textarea
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                                placeholder="Share your thoughts with your fans..."
                                className="w-full bg-slate-900 text-white p-3 rounded-lg border border-slate-700 focus:border-purple-500 outline-none resize-none"
                                rows={6}
                                maxLength={280}
                            />
                            <div className="flex items-center justify-between mt-3">
                                <p className="text-xs text-slate-400">{postContent.length} / 280</p>
                                <button
                                    onClick={handlePost}
                                    disabled={postContent.trim().length === 0}
                                    className="px-6 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-bold text-sm uppercase transition-all"
                                >
                                    Post
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-3">
                                💡 Posting builds your fanbase. Impact depends on your current reputation!
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MediaHub;
