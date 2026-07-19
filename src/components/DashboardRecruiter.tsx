/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Briefcase,
  Users,
  Plus,
  Send,
  Building,
  CheckCircle,
  XCircle,
  Check,
  UserCheck,
  MapPin,
  TrendingUp,
  LayoutGrid,
  ChevronDown,
  Percent,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Job, Application, Company, User, Skill } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface DashboardRecruiterProps {
  user: User;
  company: Company | null;
  jobs: Job[];
  applications: Application[];
  onUpdateCompany: (company: Company) => void;
  onPostJob: (jobData: any) => void;
  onUpdateStatus: (appId: string, status: string) => void;
  token: string;
}

export default function DashboardRecruiter({
  user,
  company,
  jobs,
  applications,
  onUpdateCompany,
  onPostJob,
  onUpdateStatus,
  token
}: DashboardRecruiterProps) {
  const [showPostJob, setShowPostJob] = useState(false);

  // Edit company fields
  const [editingCompany, setEditingCompany] = useState(false);
  const [compName, setCompName] = useState(company?.name || '');
  const [compDesc, setCompDesc] = useState(company?.description || '');
  const [compWebsite, setCompWebsite] = useState(company?.website || '');
  const [compLoc, setCompLoc] = useState(company?.location || '');

  // Post Job form state
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobLoc, setJobLoc] = useState('');
  const [jobType, setJobType] = useState<'REMOTE' | 'HYBRID' | 'ON_SITE'>('REMOTE');
  const [jobExp, setJobExp] = useState(2);
  const [jobSalary, setJobSalary] = useState('$100k - $130k');
  const [jobSponsorship, setJobSponsorship] = useState(false);

  // Skill demands
  const [skillTags, setSkillTags] = useState<{ name: string; weight: number }[]>([
    { name: 'React', weight: 40 },
    { name: 'TypeScript', weight: 30 },
    { name: 'Node.js', weight: 30 }
  ]);
  const [newSkillTag, setNewSkillTag] = useState('');
  const [newSkillWeight, setNewSkillWeight] = useState(20);

  // Pie Chart funnel statistics
  const pendingCount = applications.filter(a => a.status === 'PENDING').length;
  const shortlistedCount = applications.filter(a => a.status === 'SHORTLISTED').length;
  const rejectedCount = applications.filter(a => a.status === 'REJECTED').length;
  const offeredCount = applications.filter(a => a.status === 'OFFERED').length;

  const funnelData = [
    { name: 'Pending', value: pendingCount, color: '#f59e0b' },
    { name: 'Shortlisted', value: shortlistedCount, color: '#6366f1' },
    { name: 'Rejected', value: rejectedCount, color: '#ef4444' },
    { name: 'Offered', value: offeredCount, color: '#10b981' }
  ].filter(d => d.value > 0);

  const handleUpdateCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    onUpdateCompany({
      ...company,
      name: compName,
      description: compDesc,
      website: compWebsite,
      location: compLoc
    });
    setEditingCompany(false);
  };

  const handlePostJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !jobDesc) return;

    const totalWeight = skillTags.reduce((acc, curr) => acc + curr.weight, 0);
    if (totalWeight === 0) return;

    // Normalize weights to sum to 100
    const normalizedSkills = skillTags.map(tag => ({
      name: tag.name,
      weight: Math.round((tag.weight / totalWeight) * 100)
    }));

    onPostJob({
      title: jobTitle,
      description: jobDesc,
      location: jobLoc || 'San Francisco, CA',
      workType: jobType,
      experienceRequired: Number(jobExp),
      salaryRange: jobSalary,
      skillsRequired: normalizedSkills,
      visaSponsorship: jobSponsorship
    });

    // Reset Form
    setJobTitle('');
    setJobDesc('');
    setShowPostJob(false);
    setSkillTags([
      { name: 'React', weight: 40 },
      { name: 'TypeScript', weight: 30 },
      { name: 'Node.js', weight: 30 }
    ]);
  };

  const addSkillTag = () => {
    if (!newSkillTag.trim()) return;
    setSkillTags([...skillTags, { name: newSkillTag.trim(), weight: Number(newSkillWeight) }]);
    setNewSkillTag('');
  };

  const removeSkillTag = (index: number) => {
    setSkillTags(skillTags.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 flex flex-col gap-8" id="recruiter-dashboard">
      {/* Company Branding & Info */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 glass-panel rounded-2xl border border-slate-900 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl">
            {company?.logo || '🏢'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white font-display">{company?.name || 'My Organization'}</h2>
              {company?.verified && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 text-[9px] font-mono font-bold">VERIFIED CO</span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1 max-w-lg">{company?.description || 'Corporate specifications and matching metrics are displayed here.'}</p>
          </div>
        </div>
        <button
          onClick={() => setEditingCompany(!editingCompany)}
          className="px-4 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-950/40 text-gray-300 hover:text-white text-xs font-semibold transition-colors"
        >
          {editingCompany ? 'Cancel Editing' : 'Edit Company'}
        </button>
      </div>

      {/* Editing Company Card */}
      {editingCompany && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleUpdateCompanySubmit}
          className="glass-panel p-5 rounded-2xl border border-slate-900 flex flex-col gap-4 shadow-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase">COMPANY BRAND NAME</label>
              <input type="text" value={compName} onChange={e => setCompName(e.target.value)} className="glass-input rounded-xl p-2 text-xs" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase">LOCATION METRICS</label>
              <input type="text" value={compLoc} onChange={e => setCompLoc(e.target.value)} className="glass-input rounded-xl p-2 text-xs" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 font-semibold uppercase">CORPORATE DESCRIPTION</label>
            <textarea value={compDesc} onChange={e => setCompDesc(e.target.value)} rows={3} className="glass-input rounded-xl p-2.5 text-xs resize-none" />
          </div>
          <button type="submit" className="w-fit px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs">
            Save Brand Details
          </button>
        </motion.form>
      )}

      {/* Analytics stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 glass-panel rounded-2xl border border-slate-900 shadow-md flex flex-col justify-between gap-3">
            <Briefcase className="w-5 h-5 text-indigo-400" />
            <div>
              <div className="text-lg font-bold font-mono text-white">{jobs.length}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Posted Jobs</div>
            </div>
          </div>
          <div className="p-4 glass-panel rounded-2xl border border-slate-900 shadow-md flex flex-col justify-between gap-3">
            <Users className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-lg font-bold font-mono text-white">{applications.length}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Applications</div>
            </div>
          </div>
        </div>

        {/* Middle: Funnel Pie Chart */}
        <div className="glass-panel rounded-2xl border border-slate-900 p-4 shadow-md flex flex-col justify-between gap-3">
          <span className="text-xs font-semibold text-gray-400 font-display">APPLICANTS FUNNEL RATIO</span>
          <div className="h-32 w-full flex items-center justify-center">
            {funnelData.length === 0 ? (
              <span className="text-xs text-gray-500 italic py-6">No applicants recorded yet.</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={funnelData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={42}>
                    {funnelData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right: Skill Demands bar chart */}
        <div className="glass-panel rounded-2xl border border-slate-900 p-4 shadow-md flex flex-col gap-2">
          <span className="text-xs font-semibold text-gray-400 font-display">SKILL DEMAND SPECTRUM</span>
          <div className="flex flex-wrap gap-1.5 mt-1 max-h-24 overflow-y-auto">
            {jobs.length === 0 ? (
              <span className="text-[10px] text-gray-500">No postings logged.</span>
            ) : (
              jobs.flatMap(j => j.skillsRequired).map((sk, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 text-[9px] font-mono">
                  {sk.name} (w: {sk.weight}%)
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Lower Section: Active applications review & Job list boards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Applicant Funnel Candidate Meter (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="glass-panel rounded-2xl border border-slate-900 p-5 shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <h3 className="text-sm font-bold text-gray-300 font-display flex items-center gap-2">
                <Users className="w-4.5 h-4.5 text-indigo-400" /> Candidate Meter & Leaderboard
              </h3>
              <span className="text-xs font-mono text-emerald-400">REAL-TIME ALGORITHM</span>
            </div>

            <div className="flex flex-col gap-3">
              {applications.length === 0 ? (
                <p className="text-xs text-center text-gray-500 py-12">No candidate submissions yet. Posted jobs are monitored transparently.</p>
              ) : (
                [...applications]
                  .sort((a, b) => b.matchScore - a.matchScore)
                  .map(app => (
                    <div key={app.id} className="p-4 bg-slate-950/30 border border-slate-900 rounded-xl flex flex-col gap-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            {app.studentName}
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${app.status === 'OFFERED' ? 'bg-emerald-500/10 text-emerald-400' : app.status === 'SHORTLISTED' ? 'bg-indigo-500/10 text-indigo-400' : app.status === 'REJECTED' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-500'}`}>
                              {app.status}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5 font-display">{app.studentHeadline}</div>
                          <div className="text-[10px] text-gray-500 mt-1">Applied for: <span className="text-gray-300 font-semibold">{app.jobTitle}</span></div>
                        </div>

                        {/* Match score bubble */}
                        <div className="flex flex-col items-end shrink-0">
                          <span className="text-xs font-mono text-gray-400">Match score:</span>
                          <span className="text-lg font-black font-mono text-emerald-400">{app.matchScore}%</span>
                        </div>
                      </div>

                      {/* Display score calculation exact points */}
                      <div className="p-2.5 bg-slate-950 border border-slate-900 rounded-lg grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-[10px] font-mono text-gray-400">
                        <div>Skills: <span className="text-white font-bold">{app.matchBreakdown.skillScore}</span>/45</div>
                        <div>Exp: <span className="text-white font-bold">{app.matchBreakdown.experienceScore}</span>/20</div>
                        <div>Edu: <span className="text-white font-bold">{app.matchBreakdown.educationScore}</span>/15</div>
                        <div>Certs: <span className="text-white font-bold">{app.matchBreakdown.certificationScore}</span>/10</div>
                        <div>Loc: <span className="text-white font-bold">{app.matchBreakdown.locationScore}</span>/5</div>
                        <div>Visa: <span className="text-white font-bold">{app.matchBreakdown.authorizationScore}</span>/5</div>
                      </div>

                      {/* Status controls */}
                      <div className="flex items-center gap-2 mt-1 justify-end border-t border-slate-900 pt-2">
                        <button
                          onClick={() => onUpdateStatus(app.id, 'SHORTLISTED')}
                          className="px-2.5 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/10 text-[10px] font-bold flex items-center gap-1 transition-all"
                        >
                          <UserCheck className="w-3 h-3" /> Shortlist
                        </button>
                        <button
                          onClick={() => onUpdateStatus(app.id, 'OFFERED')}
                          className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/10 text-[10px] font-bold flex items-center gap-1 transition-all"
                        >
                          <Check className="w-3 h-3" /> Offer Job
                        </button>
                        <button
                          onClick={() => onUpdateStatus(app.id, 'REJECTED')}
                          className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 text-[10px] font-bold flex items-center gap-1 transition-all"
                        >
                          <XCircle className="w-3 h-3" /> Reject
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Job listings & Post Job Opening (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-panel rounded-2xl border border-slate-900 p-5 shadow-lg flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <h3 className="text-sm font-bold text-gray-300 font-display flex items-center gap-1.5">
                <Briefcase className="w-4.5 h-4.5 text-indigo-400" /> Posted Openings
              </h3>
              <button
                onClick={() => setShowPostJob(true)}
                className="p-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
              {jobs.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6">No posted openings found.</p>
              ) : (
                jobs.map(job => (
                  <div key={job.id} className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl flex flex-col gap-1.5">
                    <div className="text-xs font-bold text-white truncate">{job.title}</div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                      <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                      <span>{job.location} ({job.workType})</span>
                    </div>
                    <div className="text-[10px] font-mono text-indigo-400 mt-1">Exp: {job.experienceRequired}+ years | {job.salaryRange}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Post Job Modal Dialog */}
      {showPostJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm" id="post-job-modal">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg glass-panel rounded-2xl border border-slate-900 p-6 shadow-2xl relative flex flex-col gap-4 overflow-y-auto max-h-[90vh]"
          >
            <button onClick={() => setShowPostJob(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
              <XCircle className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-bold text-white font-display">Publish New Job Opening</h3>
              <p className="text-xs text-gray-400">Skills required will define match compatibility calculations.</p>
            </div>

            <form onSubmit={handlePostJobSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-semibold uppercase">JOB TITLE</label>
                <input type="text" placeholder="Senior Full-Stack Engineer" value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="glass-input rounded-xl p-2 text-xs" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 font-semibold uppercase">LOCATION</label>
                  <input type="text" placeholder="San Francisco, CA" value={jobLoc} onChange={e => setJobLoc(e.target.value)} className="glass-input rounded-xl p-2 text-xs" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 font-semibold uppercase">WORK TYPE</label>
                  <select value={jobType} onChange={e => setJobType(e.target.value as any)} className="glass-input rounded-xl p-2 text-xs">
                    <option value="REMOTE">Remote</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="ON_SITE">On-Site</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 font-semibold uppercase">EXP REQUIRED (YRS)</label>
                  <input type="number" min="0" value={jobExp} onChange={e => setJobExp(Number(e.target.value))} className="glass-input rounded-xl p-2 text-xs" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 font-semibold uppercase">SALARY RANGE</label>
                  <input type="text" placeholder="$120k - $150k" value={jobSalary} onChange={e => setJobSalary(e.target.value)} className="glass-input rounded-xl p-2 text-xs" />
                </div>
              </div>

              <div className="flex items-center gap-2 py-1">
                <input type="checkbox" id="visaSp" checked={jobSponsorship} onChange={e => setJobSponsorship(e.target.checked)} className="rounded border-slate-800 bg-slate-950 text-indigo-500 focus:ring-0 w-3.5 h-3.5" />
                <label htmlFor="visaSp" className="text-xs text-gray-300">Provides Visa Sponsorship</label>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-semibold uppercase">JOB DESCRIPTION</label>
                <textarea placeholder="Outline job parameters..." value={jobDesc} onChange={e => setJobDesc(e.target.value)} rows={3} className="glass-input rounded-xl p-2.5 text-xs resize-none" required />
              </div>

              {/* Add required skills section */}
              <div className="flex flex-col gap-2 p-3 bg-slate-950/40 border border-slate-900 rounded-xl">
                <span className="text-[10px] text-gray-400 font-semibold uppercase">REQUIRED SKILL TAGS (WEIGHTS MUST ACCUMULATE)</span>
                <div className="flex gap-2">
                  <input type="text" placeholder="e.g. React" value={newSkillTag} onChange={e => setNewSkillTag(e.target.value)} className="glass-input rounded-xl px-2 py-1 text-xs flex-1 min-w-[100px]" />
                  <input type="number" min="1" max="100" value={newSkillWeight} onChange={e => setNewSkillWeight(Number(e.target.value))} className="glass-input rounded-xl px-2 py-1 text-xs w-16" />
                  <button type="button" onClick={addSkillTag} className="px-3 py-1 rounded-xl bg-indigo-600 text-white text-xs font-bold">Add</button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {skillTags.map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 text-[10px] font-mono flex items-center gap-1.5">
                      {tag.name} ({tag.weight}%)
                      <button type="button" onClick={() => removeSkillTag(i)} className="text-red-400 hover:text-red-300 font-bold">x</button>
                    </span>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-md transition-all">
                Publish Active Opening
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
