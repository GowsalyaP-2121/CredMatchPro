/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Briefcase,
  MapPin,
  Clock,
  Bookmark,
  Send,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Info,
  CheckCircle,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { Job, User, Application, StudentProfile } from '../types';

interface JobsPageProps {
  user: User | null;
  profile: StudentProfile | null;
  jobs: Job[];
  applications: Application[];
  bookmarks: Job[];
  onApply: (jobId: string) => void;
  onBookmark: (jobId: string) => void;
  onRemoveBookmark: (jobId: string) => void;
  token: string;
}

export default function JobsPage({
  user,
  profile,
  jobs,
  applications,
  bookmarks,
  onApply,
  onBookmark,
  onRemoveBookmark,
  token
}: JobsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedWorkType, setSelectedWorkType] = useState('');
  const [viewingOpportunityGapId, setViewingOpportunityGapId] = useState<string | null>(null);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocation = !selectedLocation || job.location.toLowerCase().includes(selectedLocation.toLowerCase());
    const matchesWorkType = !selectedWorkType || job.workType === selectedWorkType;

    return matchesSearch && matchesLocation && matchesWorkType;
  });

  const isBookmarked = (jobId: string) => bookmarks.some(b => b.id === jobId);
  const hasApplied = (jobId: string) => applications.some(a => a.jobId === jobId);

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 flex flex-col gap-8" id="jobs-page">
      {/* Page Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold font-display text-white flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-emerald-400" /> Smart Job Board
        </h2>
        <p className="text-xs text-gray-400">Match transparently against open listings. Scores are computed live using deterministic mathematical weighting.</p>
      </div>

      {/* Search & Filtering Bars */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Search */}
        <div className="md:col-span-6 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search titles, skills, or companies..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Location Filter */}
        <div className="md:col-span-3">
          <input
            type="text"
            placeholder="Filter location (e.g. San Francisco)"
            value={selectedLocation}
            onChange={e => setSelectedLocation(e.target.value)}
            className="w-full glass-input rounded-xl px-4 py-2.5 text-xs focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Work Type Filter */}
        <div className="md:col-span-3">
          <select
            value={selectedWorkType}
            onChange={e => setSelectedWorkType(e.target.value)}
            className="w-full glass-input rounded-xl px-4 py-2.5 text-xs focus:border-emerald-500 transition-all"
          >
            <option value="">All Work Types</option>
            <option value="REMOTE">Remote Only</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ON_SITE">On-Site</option>
          </select>
        </div>
      </div>

      {/* Grid: Job cards list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12 flex flex-col gap-4">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-2xl border border-slate-900">
              <p className="text-xs text-gray-500">No active job listings match your queries.</p>
            </div>
          ) : (
            filteredJobs.map(job => {
              const applied = hasApplied(job.id);
              const bookmarked = isBookmarked(job.id);

              // Embedded scores inside jobs for student users
              const matchScore = (job as any).matchScore;
              const breakdown = (job as any).matchBreakdown;
              const gap = (job as any).opportunityGap;

              return (
                <div
                  key={job.id}
                  className="p-5 md:p-6 glass-panel rounded-2xl border border-slate-900/80 shadow-md hover:border-slate-800 transition-all flex flex-col gap-4 relative overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                    {/* Job primary info */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-950/80 border border-slate-900 flex items-center justify-center text-xl shrink-0">
                        {job.companyLogo || '🏢'}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white font-display">{job.title}</h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-gray-400">
                          <span className="font-semibold text-emerald-400">{job.companyName}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" /> {job.location}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-gray-500 shrink-0" /> {job.workType}</span>
                        </div>
                      </div>
                    </div>

                    {/* Matching Gauge or application CTAs */}
                    <div className="flex items-center gap-3 shrink-0 self-end md:self-start">
                      {user && user.role === 'STUDENT' && typeof matchScore === 'number' && (
                        <div className="flex flex-col items-center justify-center px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl font-mono text-center">
                          <span className="text-[10px] text-gray-400 uppercase tracking-wide">MATCH COMPATIBILITY</span>
                          <span className="text-lg font-black text-emerald-400">{matchScore}%</span>
                        </div>
                      )}

                      {/* Bookmark Toggle */}
                      {user && user.role === 'STUDENT' && (
                        <button
                          onClick={() => bookmarked ? onRemoveBookmark(job.id) : onBookmark(job.id)}
                          className={`p-2 rounded-xl border transition-colors ${bookmarked ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-slate-800 bg-slate-950/40 text-gray-400 hover:text-white'}`}
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>
                      )}

                      {/* Apply button */}
                      {user && user.role === 'STUDENT' ? (
                        <button
                          onClick={() => !applied && onApply(job.id)}
                          disabled={applied}
                          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${applied ? 'bg-slate-900 border border-slate-800 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]'}`}
                        >
                          {applied ? 'Submitted' : <>Apply <Send className="w-3.5 h-3.5" /></>}
                        </button>
                      ) : !user ? (
                        <span className="text-xs text-gray-500 font-medium">Log in to view match score</span>
                      ) : null}
                    </div>
                  </div>

                  {/* Skills tags list */}
                  <div className="flex flex-wrap gap-1.5 border-t border-slate-900/60 pt-3">
                    {job.skillsRequired.map((sk, index) => (
                      <span key={index} className="px-2 py-0.5 rounded bg-slate-950 text-gray-400 border border-slate-900 text-[10px] font-mono">
                        {sk.name} (w: {sk.weight}%)
                      </span>
                    ))}
                  </div>

                  {/* Live Formula Explanation and Opportunity Gap Analysis (Students only) */}
                  {user && user.role === 'STUDENT' && breakdown && gap && (
                    <div className="p-3.5 bg-slate-950/40 border border-slate-900 rounded-xl flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-gray-300 font-display flex items-center gap-1">
                          <Info className="w-4 h-4 text-emerald-400 shrink-0" /> Exact Match Score Formula Breakdown
                        </span>
                        <button
                          onClick={() => setViewingOpportunityGapId(viewingOpportunityGapId === job.id ? null : job.id)}
                          className="text-xs text-emerald-400 hover:underline font-medium"
                        >
                          {viewingOpportunityGapId === job.id ? 'Hide Gap Analysis' : 'Show Opportunity Gap Analyzer'}
                        </button>
                      </div>

                      {/* Score point segments */}
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-center text-[10px] font-mono text-gray-400">
                        <div className="p-1.5 bg-slate-950 rounded border border-slate-900/60">
                          <div>Skills (45%)</div>
                          <div className="font-bold text-white mt-0.5">{breakdown.skillScore}/45</div>
                        </div>
                        <div className="p-1.5 bg-slate-950 rounded border border-slate-900/60">
                          <div>Exp (20%)</div>
                          <div className="font-bold text-white mt-0.5">{breakdown.experienceScore}/20</div>
                        </div>
                        <div className="p-1.5 bg-slate-950 rounded border border-slate-900/60">
                          <div>Edu (15%)</div>
                          <div className="font-bold text-white mt-0.5">{breakdown.educationScore}/15</div>
                        </div>
                        <div className="p-1.5 bg-slate-950 rounded border border-slate-900/60">
                          <div>Certs (10%)</div>
                          <div className="font-bold text-white mt-0.5">{breakdown.certificationScore}/10</div>
                        </div>
                        <div className="p-1.5 bg-slate-950 rounded border border-slate-900/60">
                          <div>Loc (5%)</div>
                          <div className="font-bold text-white mt-0.5">{breakdown.locationScore}/5</div>
                        </div>
                        <div className="p-1.5 bg-slate-950 rounded border border-slate-900/60">
                          <div>Auth (5%)</div>
                          <div className="font-bold text-white mt-0.5">{breakdown.authorizationScore}/5</div>
                        </div>
                      </div>

                      {/* Expanded Opportunity Gap analyzer */}
                      {viewingOpportunityGapId === job.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-2 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex flex-col gap-3 font-mono text-[11px]"
                        >
                          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 font-display">
                            <Sparkles className="w-4 h-4 animate-pulse shrink-0" /> Dynamic Gap Analysis
                          </div>

                          {gap.missingSkills.length === 0 ? (
                            <p className="text-[10px] text-gray-400">You already possess all required skills for this job listing. Optimal match achieved!</p>
                          ) : (
                            <div className="flex flex-col gap-2">
                              <div>
                                <span className="text-gray-400">Missing technologies:</span>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {gap.missingSkills.map((m: any, idx: number) => (
                                    <span key={idx} className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/10 text-[10px]">
                                      {m.name} (+{m.weight}% Score impact)
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="flex justify-between border-t border-slate-900/80 pt-2 mt-1">
                                <span className="text-gray-400">Recommended Learning Order:</span>
                                <span className="text-white font-bold">{gap.recommendedOrder.join(' → ')}</span>
                              </div>

                              <div className="flex justify-between border-t border-slate-900/80 pt-2 text-emerald-400 font-bold">
                                <span>Max Match Score Potential:</span>
                                <span>{matchScore}% → {Math.min(100, Math.round((matchScore + gap.scoreImprovementIfLearned) * 10) / 10)}% (+{gap.scoreImprovementIfLearned}% gain)</span>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
