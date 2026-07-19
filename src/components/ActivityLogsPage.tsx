/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Activity, Search, RefreshCw, Layers } from 'lucide-react';
import { ActivityLog } from '../types';

interface ActivityLogsPageProps {
  token: string;
}

export default function ActivityLogsPage({ token }: ActivityLogsPageProps) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/activity-logs', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    // Setup real-time event listener for live logs!
    const sse = new EventSource('/api/events');
    sse.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        if (event.type === 'ACTIVITY_LOG') {
          setLogs(prev => [event.data, ...prev].slice(0, 100));
        }
      } catch (err) {
        console.error(err);
      }
    };

    return () => {
      sse.close();
    };
  }, [token]);

  const filtered = logs.filter(log =>
    log.userName.toLowerCase().includes(search.toLowerCase()) ||
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 flex flex-col gap-8" id="activity-logs-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-display text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-400 animate-pulse" /> System Audit Trail
          </h2>
          <p className="text-xs text-gray-400">Complete, fully explainable log of ecosystem interactions, matching updates, and signups.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full glass-input rounded-xl pl-10 pr-4 py-2 text-xs focus:border-emerald-500 transition-all"
            />
          </div>
          <button
            onClick={fetchLogs}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-emerald-400 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid List */}
      <div className="glass-panel rounded-2xl border border-slate-900 shadow-xl p-5 flex flex-col gap-3">
        {loading ? (
          <p className="text-xs text-gray-500 font-mono text-center py-12">Synchronizing with system database...</p>
        ) : filtered.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-12">No audit actions found.</p>
        ) : (
          <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-1">
            {filtered.map(log => (
              <div key={log.id} className="p-3.5 bg-slate-950/40 border border-slate-900 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 text-[9px] font-mono font-bold uppercase tracking-wider">
                      {log.action}
                    </span>
                    <span className="text-gray-200 font-semibold">{log.details}</span>
                  </div>
                  <div className="text-[10px] text-gray-500">Initiated by: {log.userName} (ID: {log.userId})</div>
                </div>
                <div className="text-[10px] font-mono text-gray-500 shrink-0">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
