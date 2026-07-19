/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Briefcase,
  Layers,
  TrendingUp,
  Activity,
  ShieldCheck,
  UserCheck,
  Calendar,
  Search,
  Settings,
  RefreshCw
} from 'lucide-react';
import { AnalyticsSummary, ActivityLog, User } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';

interface DashboardAdminProps {
  user: User;
  analytics: AnalyticsSummary | null;
  activityLogs: ActivityLog[];
  token: string;
}

export default function DashboardAdmin({ user, analytics, activityLogs, token }: DashboardAdminProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>(activityLogs);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredLogs(activityLogs);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredLogs(activityLogs.filter(log =>
        log.userName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q)
      ));
    }
  }, [searchQuery, activityLogs]);

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 flex flex-col gap-8" id="admin-dashboard">
      {/* Title */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold font-display text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-400" /> Platform Administration Terminal
        </h2>
        <p className="text-xs text-gray-400">Monitor ecosystem health, system-wide matching weights, and audit logs.</p>
      </div>

      {/* Grid: Analytics Summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 glass-panel rounded-2xl border border-slate-900 shadow-lg flex flex-col justify-between gap-3">
          <Users className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-2xl font-bold font-mono text-white">{analytics?.totalStudents ?? 0}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Candidate Accounts</div>
          </div>
        </div>

        <div className="p-5 glass-panel rounded-2xl border border-slate-900 shadow-lg flex flex-col justify-between gap-3">
          <Briefcase className="w-5 h-5 text-indigo-400" />
          <div>
            <div className="text-2xl font-bold font-mono text-white">{analytics?.totalJobs ?? 0}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Active Postings</div>
          </div>
        </div>

        <div className="p-5 glass-panel rounded-2xl border border-slate-900 shadow-lg flex flex-col justify-between gap-3">
          <Layers className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="text-2xl font-bold font-mono text-white">{analytics?.totalApplications ?? 0}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Total Submissions</div>
          </div>
        </div>

        <div className="p-5 glass-panel rounded-2xl border border-slate-900 shadow-lg flex flex-col justify-between gap-3">
          <TrendingUp className="w-5 h-5 text-yellow-500" />
          <div>
            <div className="text-2xl font-bold font-mono text-white">{analytics?.averageMatchScore ?? 0}%</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Average Match score</div>
          </div>
        </div>
      </div>

      {/* Charts & System Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left (5 Cols): Platform demand charts */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="glass-panel rounded-2xl border border-slate-900 p-5 shadow-lg flex flex-col gap-3">
            <h3 className="text-sm font-bold text-gray-300 font-display border-b border-slate-900 pb-2">Skills in Demand Histogram</h3>
            <div className="h-48 w-full flex items-center justify-center">
              {!analytics || analytics.skillsInDemand.length === 0 ? (
                <span className="text-xs text-gray-500 italic">No skill tags analyzed yet.</span>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.skillsInDemand}>
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-900 p-5 shadow-lg flex flex-col gap-3">
            <h3 className="text-sm font-bold text-gray-300 font-display border-b border-slate-900 pb-2">Application statuses</h3>
            <div className="h-44 w-full flex items-center justify-center">
              {!analytics || analytics.applicationsByStatus.length === 0 ? (
                <span className="text-xs text-gray-500 italic">No applications processed.</span>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.applicationsByStatus}>
                    <XAxis dataKey="status" stroke="#9ca3af" fontSize={10} tickLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#6366f1" fill="rgba(99,102,241,0.15)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Right (7 Cols): System Activity Logs (Audit Trail) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="glass-panel rounded-2xl border border-slate-900 p-5 shadow-lg flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-900 pb-2">
              <h3 className="text-sm font-bold text-gray-300 font-display flex items-center gap-2">
                <Activity className="w-4.5 h-4.5 text-emerald-400 animate-pulse" /> Live Audit Trail logs
              </h3>
              <div className="relative w-full sm:w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Filter logs..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full glass-input rounded-xl pl-8 pr-3 py-1.5 text-xs focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
              {filteredLogs.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-12">No matching logs recorded.</p>
              ) : (
                filteredLogs.map(log => (
                  <div key={log.id} className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl flex flex-col gap-1 text-[11px]">
                    <div className="flex justify-between items-center text-gray-400 font-mono">
                      <span className="text-emerald-400 font-bold uppercase tracking-wider">{log.action}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-gray-300">{log.details}</div>
                    <div className="text-[10px] text-gray-500">Initiator: {log.userName} ({log.userId})</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
