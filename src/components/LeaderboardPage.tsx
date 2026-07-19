/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Award, Search, ArrowUp, Zap, HelpCircle } from 'lucide-react';
import { LeaderboardEntry } from '../types';

interface LeaderboardPageProps {
  token: string;
}

export default function LeaderboardPage({ token }: LeaderboardPageProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch('/api/leaderboard', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const data = await res.json();
        setLeaderboard(data);
      } catch (err) {
        console.error('Failed to load leaderboard', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [token]);

  const filtered = leaderboard.filter(entry =>
    entry.studentName.toLowerCase().includes(search.toLowerCase()) ||
    entry.headline.toLowerCase().includes(search.toLowerCase()) ||
    entry.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 flex flex-col gap-8" id="leaderboard-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-display text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500 animate-bounce" /> Candidate Match Leaderboard
          </h2>
          <p className="text-xs text-gray-400">Ranks of students based on their average deterministic match scores across all active postings.</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search candidates..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full glass-input rounded-xl pl-10 pr-4 py-2 text-xs focus:border-yellow-500 transition-all"
          />
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {!loading && filtered.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
          {/* 2nd Place */}
          <div className="order-2 md:order-1 glass-panel rounded-2xl border border-slate-900/60 p-5 shadow-md flex flex-col items-center text-center gap-3 relative mt-4">
            <div className="absolute top-0 left-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-400 border-2 border-white flex items-center justify-center text-slate-900 font-bold font-display">2</div>
            <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop" alt={filtered[1].studentName} className="w-14 h-14 rounded-full border-2 border-slate-400 mt-2 object-cover" />
            <div>
              <div className="text-sm font-bold text-white">{filtered[1].studentName}</div>
              <div className="text-[10px] text-gray-400 truncate w-40">{filtered[1].headline}</div>
            </div>
            <div className="flex justify-between w-full border-t border-slate-900 pt-2 mt-1 text-[11px] font-mono">
              <span className="text-gray-400">Match score:</span>
              <span className="text-yellow-500 font-bold">{filtered[1].averageMatchScore}%</span>
            </div>
          </div>

          {/* 1st Place */}
          <div className="order-1 md:order-2 glass-panel rounded-2xl border border-yellow-500/20 p-6 shadow-xl flex flex-col items-center text-center gap-3 relative scale-105 shadow-[0_0_25px_rgba(234,179,8,0.05)]">
            <div className="absolute top-0 left-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-yellow-500 border-2 border-white flex items-center justify-center text-slate-950 font-black font-display shadow-lg">1</div>
            <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop" alt={filtered[0].studentName} className="w-16 h-16 rounded-full border-2 border-yellow-500 mt-2 object-cover" />
            <div>
              <div className="text-sm font-bold text-white">{filtered[0].studentName}</div>
              <div className="text-[10px] text-gray-400 truncate w-44">{filtered[0].headline}</div>
            </div>
            <div className="flex justify-between w-full border-t border-slate-900 pt-2 mt-1 text-[11px] font-mono">
              <span className="text-gray-400">Match score:</span>
              <span className="text-emerald-400 font-bold text-sm">{filtered[0].averageMatchScore}%</span>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="order-3 glass-panel rounded-2xl border border-slate-900/60 p-5 shadow-md flex flex-col items-center text-center gap-3 relative mt-4">
            <div className="absolute top-0 left-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-amber-700 border-2 border-white flex items-center justify-center text-white font-bold font-display">3</div>
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop" alt="Sarah" className="w-14 h-14 rounded-full border-2 border-amber-700 mt-2 object-cover" />
            <div>
              <div className="text-sm font-bold text-white">Sarah Jenkins</div>
              <div className="text-[10px] text-gray-400 truncate w-40">Hiring Partner</div>
            </div>
            <div className="flex justify-between w-full border-t border-slate-900 pt-2 mt-1 text-[11px] font-mono">
              <span className="text-gray-400">Trust Score:</span>
              <span className="text-yellow-500 font-bold">100%</span>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table Grid */}
      <div className="glass-panel rounded-2xl border border-slate-900 shadow-xl overflow-hidden mt-4">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-900 bg-slate-950/40 text-[10px] font-semibold tracking-wider text-gray-400 uppercase font-mono">
                <th className="py-3 px-4 text-center">Rank</th>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Registry Skills</th>
                <th className="py-3 px-4 text-center">Trust Score</th>
                <th className="py-3 px-4 text-right">Average match</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-gray-500 font-mono">Calculating live matching parameters...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-gray-500">No candidates found matching query.</td>
                </tr>
              ) : (
                filtered.map(entry => (
                  <tr key={entry.studentId} className="border-b border-slate-900/60 hover:bg-slate-900/10 text-xs">
                    <td className="py-4 px-4 text-center font-mono font-bold text-gray-400">
                      {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-white">{entry.studentName}</div>
                      <div className="text-[10px] text-gray-400 truncate max-w-xs">{entry.headline}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1 max-w-sm">
                        {entry.skills.slice(0, 4).map((sk, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-900 text-[9px] text-gray-400 font-mono">
                            {sk}
                          </span>
                        ))}
                        {entry.skills.length > 4 && (
                          <span className="text-[9px] text-emerald-400 self-center">+{entry.skills.length - 4} more</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                        {entry.trustScore}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-emerald-400">
                      {entry.averageMatchScore}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
