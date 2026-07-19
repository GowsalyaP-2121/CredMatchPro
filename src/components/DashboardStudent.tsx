/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Award,
  Upload,
  BrainCircuit,
  Bookmark,
  Send,
  Plus,
  Trash2,
  TrendingUp,
  FileText,
  MapPin,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { StudentProfile, User, Job, Application, Skill, Education, Experience, Certificate } from '../types';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import ResumeUploadModal from './ResumeUploadModal';

interface DashboardStudentProps {
  user: User;
  profile: StudentProfile;
  jobs: Job[];
  applications: Application[];
  bookmarks: Job[];
  onUpdateProfile: (p: StudentProfile) => void;
  token: string;
  onApply: (jobId: string) => void;
}

export default function DashboardStudent({
  user,
  profile,
  jobs,
  applications,
  bookmarks,
  onUpdateProfile,
  token,
  onApply
}: DashboardStudentProps) {
  const [showUpload, setShowUpload] = useState(false);
  const [simulatorSkill, setSimulatorSkill] = useState('');
  const [simulatorResults, setSimulatorResults] = useState<{
    skill: string;
    beforeAverage: number;
    afterAverage: number;
    improvement: number;
    increasedMatchesCount: number;
  } | null>(null);

  // Profile fields editing
  const [editingSkills, setEditingSkills] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<'BEGINNER' | 'INTERMEDIATE' | 'EXPERT'>('INTERMEDIATE');

  // Education forms
  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');

  // Experience forms
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');

  // Certificates
  const [certName, setCertName] = useState('');
  const [certIssuer, setCertIssuer] = useState('');

  // Simulator candidate list
  const simulatorOptions = [
    'Docker',
    'AWS',
    'Kubernetes',
    'Python',
    'PostgreSQL',
    'TypeScript',
    'React',
    'Node.js',
    'Java',
    'Git',
    'Tailwind CSS'
  ].filter(s => !profile.skills.some(cs => cs.name.toLowerCase() === s.toLowerCase()));

  // Skill Bar Chart data
  const chartData = profile.skills.map(s => ({
    name: s.name,
    level: s.level === 'EXPERT' ? 100 : s.level === 'INTERMEDIATE' ? 80 : 60
  }));

  // Perform Skill Impact Simulation
  const handleSimulation = () => {
    if (!simulatorSkill) return;

    // Calculate current average match score
    let currentSum = 0;
    jobs.forEach(j => {
      // Find match
      const appMatch = applications.find(a => a.jobId === j.id);
      currentSum += appMatch?.matchScore ?? 60; // fallback default
    });
    const beforeAverage = Math.round((currentSum / jobs.length) * 10) / 10;

    // Simulated average with added skill
    let simulatedSum = 0;
    let increasedCount = 0;

    jobs.forEach(j => {
      const match = applications.find(a => a.jobId === j.id);
      let score = match?.matchScore ?? 60;

      // If the job requires this skill, boost score simulated (e.g. +8 points)
      const jobRequiresIt = j.skillsRequired.some(s => s.name.toLowerCase() === simulatorSkill.toLowerCase());
      if (jobRequiresIt) {
        score = Math.min(100, score + 12);
        increasedCount++;
      }
      simulatedSum += score;
    });

    const afterAverage = Math.round((simulatedSum / jobs.length) * 10) / 10;
    const improvement = Math.round((afterAverage - beforeAverage) * 10) / 10;

    setSimulatorResults({
      skill: simulatorSkill,
      beforeAverage,
      afterAverage,
      improvement,
      increasedMatchesCount: increasedCount
    });
  };

  const addSkill = async () => {
    if (!newSkillName.trim()) return;

    const exists = profile.skills.some(s => s.name.toLowerCase() === newSkillName.trim().toLowerCase());
    if (exists) return;

    const updatedProfile = {
      ...profile,
      skills: [...profile.skills, { name: newSkillName.trim(), level: newSkillLevel }]
    };

    onUpdateProfile(updatedProfile);
    setNewSkillName('');
  };

  const removeSkill = (index: number) => {
    const updatedProfile = {
      ...profile,
      skills: profile.skills.filter((_, i) => i !== index)
    };
    onUpdateProfile(updatedProfile);
  };

  const addEdu = () => {
    if (!institution || !degree || !fieldOfStudy) return;
    const newEdu: Education = {
      id: `edu-${Date.now()}`,
      institution,
      degree,
      fieldOfStudy,
      startDate: '2020-09-01',
      endDate: '2024-05-30',
      verified: true
    };
    const updatedProfile = {
      ...profile,
      education: [...profile.education, newEdu]
    };
    onUpdateProfile(updatedProfile);
    setInstitution('');
    setDegree('');
    setFieldOfStudy('');
  };

  const addExp = () => {
    if (!company || !position) return;
    const newExp: Experience = {
      id: `exp-${Date.now()}`,
      company,
      position,
      startDate: '2022-01-01',
      endDate: 'Present',
      verified: true
    };
    const updatedProfile = {
      ...profile,
      experience: [...profile.experience, newExp]
    };
    onUpdateProfile(updatedProfile);
    setCompany('');
    setPosition('');
  };

  const addCert = () => {
    if (!certName || !certIssuer) return;
    const newCert: Certificate = {
      id: `cert-${Date.now()}`,
      name: certName,
      issuer: certIssuer,
      issueDate: new Date().toISOString().split('T')[0],
      verified: true
    };
    const updatedProfile = {
      ...profile,
      certificates: [...profile.certificates, newCert]
    };
    onUpdateProfile(updatedProfile);
    setCertName('');
    setCertIssuer('');
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 flex flex-col gap-8" id="student-dashboard">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 glass-panel rounded-2xl border border-slate-900 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4">
          <img
            src={user.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop'}
            alt={user.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500/20 shadow-lg"
            referrerPolicy="no-referrer"
          />
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white font-display flex items-center gap-2">
              Welcome back, {user.name}! <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
            </h2>
            <p className="text-xs text-gray-400 max-w-md">{profile.headline || 'Add an elegant headline to your profile'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUpload(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all"
          >
            <Upload className="w-3.5 h-3.5" /> Resume Analyzer
          </button>
        </div>
      </div>

      {/* Grid: Resume Health, Skill Gauge & Impact Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Resume Health / Completeness */}
        <div className="glass-panel rounded-2xl border border-slate-900 p-5 shadow-lg flex flex-col gap-4">
          <h3 className="text-sm font-bold text-gray-300 font-display flex items-center gap-1.5 border-b border-slate-900 pb-2">
            <Award className="w-4 h-4 text-emerald-400" /> Profiling trust check
          </h3>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Trust Score (Verifiability)</span>
            <span className="text-lg font-bold font-mono text-emerald-400">{profile.trustScore}%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500" style={{ width: `${profile.trustScore}%` }} />
          </div>

          {/* Profile checklists */}
          <div className="flex flex-col gap-2 mt-2">
            {[
              { label: 'Upload parsing resume file', met: !!profile.resumeFileName },
              { label: 'Specify professional bio description', met: !!profile.bio },
              { label: 'Add at least 3 core technical skills', met: profile.skills.length >= 3 },
              { label: 'Include verified education degree', met: profile.education.some(e => e.verified) },
              { label: 'Include verified employment logs', met: profile.experience.some(e => e.verified) },
            ].map((chk, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                {chk.met ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-gray-600 shrink-0" />
                )}
                <span className={chk.met ? 'text-gray-400' : 'text-gray-500 line-through'}>{chk.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Middle: Skills Radar Visualizer */}
        <div className="glass-panel rounded-2xl border border-slate-900 p-5 shadow-lg flex flex-col gap-3">
          <h3 className="text-sm font-bold text-gray-300 font-display border-b border-slate-900 pb-2 flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-indigo-400" /> Skill Radar Distribution
          </h3>

          <div className="h-44 w-full flex items-center justify-center">
            {profile.skills.length === 0 ? (
              <div className="text-xs text-gray-500 text-center py-6">
                No skills detected yet. Use the Resume Analyzer above to extract credentials instantly.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} domain={[0, 100]} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="level" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right: Skill Impact Simulator */}
        <div className="glass-panel rounded-2xl border border-slate-900 p-5 shadow-lg flex flex-col gap-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
          <h3 className="text-sm font-bold text-gray-300 font-display border-b border-slate-900 pb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" /> Skill Impact Simulator
          </h3>

          <div className="flex flex-col gap-3">
            <p className="text-[11px] text-gray-400">Select a skill to simulate immediate matching score jumps across active job listings.</p>

            <div className="flex gap-2">
              <select
                value={simulatorSkill}
                onChange={e => setSimulatorSkill(e.target.value)}
                className="flex-1 glass-input rounded-xl px-2.5 py-1.5 text-xs focus:border-indigo-500"
              >
                <option value="">-- Choose Skill --</option>
                {simulatorOptions.map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
              <button
                onClick={handleSimulation}
                disabled={!simulatorSkill}
                className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold disabled:opacity-50 transition-colors"
              >
                Simulate
              </button>
            </div>

            {simulatorResults && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex flex-col gap-1.5 font-mono text-[11px]"
              >
                <div className="flex justify-between border-b border-indigo-500/10 pb-1 mb-1">
                  <span className="text-gray-400">Added Tech:</span>
                  <span className="text-indigo-400 font-bold">{simulatorResults.skill}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Average Match:</span>
                  <span>{simulatorResults.beforeAverage}%</span>
                </div>
                <div className="flex justify-between text-white font-bold">
                  <span className="text-gray-300">Predicted Average Match:</span>
                  <span className="text-emerald-400">{simulatorResults.afterAverage}%</span>
                </div>
                <div className="flex justify-between border-t border-indigo-500/10 pt-1 mt-1 text-emerald-400 font-bold">
                  <span>Score Gain:</span>
                  <span>+{simulatorResults.improvement}% Increase!</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Edit Profile Areas and Smart Recommendation lists */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left (8 Cols): Profile Section editing */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Skill List management */}
          <div className="glass-panel rounded-2xl border border-slate-900 p-5 shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <h3 className="text-sm font-bold text-gray-300 font-display flex items-center gap-1.5">
                <BrainCircuit className="w-4.5 h-4.5 text-emerald-400" /> Core Skill Registry
              </h3>
              <button
                onClick={() => setEditingSkills(!editingSkills)}
                className="text-xs text-emerald-400 hover:underline"
              >
                {editingSkills ? 'Minimize Edit' : 'Edit Registry'}
              </button>
            </div>

            {editingSkills && (
              <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl flex gap-3 flex-wrap">
                <input
                  type="text"
                  placeholder="e.g. AWS"
                  value={newSkillName}
                  onChange={e => setNewSkillName(e.target.value)}
                  className="glass-input rounded-xl px-3 py-1.5 text-xs flex-1 min-w-[120px]"
                />
                <select
                  value={newSkillLevel}
                  onChange={e => setNewSkillLevel(e.target.value as any)}
                  className="glass-input rounded-xl px-2.5 py-1.5 text-xs"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="EXPERT">Expert</option>
                </select>
                <button
                  onClick={addSkill}
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold flex items-center gap-1 hover:bg-emerald-400 transition-colors"
                >
                  <Plus className="w-4.5 h-4.5" /> Add
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {profile.skills.length === 0 ? (
                <span className="text-xs text-gray-500 italic">No skills registered. Upload your CV.</span>
              ) : (
                profile.skills.map((sk, index) => (
                  <div key={index} className="px-3 py-1.5 rounded-xl border border-slate-900 bg-slate-950/40 text-xs flex items-center gap-2 font-mono">
                    <span className="text-gray-300">{sk.name}</span>
                    <span className={`text-[10px] px-1 rounded uppercase font-bold ${sk.level === 'EXPERT' ? 'bg-emerald-500/10 text-emerald-400' : sk.level === 'INTERMEDIATE' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-yellow-500/10 text-yellow-500'}`}>
                      {sk.level}
                    </span>
                    {editingSkills && (
                      <button onClick={() => removeSkill(index)} className="text-gray-500 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Educations */}
          <div className="glass-panel rounded-2xl border border-slate-900 p-5 shadow-lg flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-300 font-display flex items-center gap-2 border-b border-slate-900 pb-2">
              <FileText className="w-4.5 h-4.5 text-emerald-400" /> Academic credentials
            </h3>

            {/* Quick add form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="University"
                value={institution}
                onChange={e => setInstitution(e.target.value)}
                className="glass-input rounded-xl p-2 text-xs"
              />
              <input
                type="text"
                placeholder="Degree (e.g. BS)"
                value={degree}
                onChange={e => setDegree(e.target.value)}
                className="glass-input rounded-xl p-2 text-xs"
              />
              <input
                type="text"
                placeholder="Field of Study"
                value={fieldOfStudy}
                onChange={e => setFieldOfStudy(e.target.value)}
                className="glass-input rounded-xl p-2 text-xs"
              />
            </div>
            <button
              onClick={addEdu}
              disabled={!institution || !degree || !fieldOfStudy}
              className="w-fit px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-emerald-400 text-xs font-semibold border border-emerald-500/20 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Degree
            </button>

            <div className="flex flex-col gap-3 mt-1">
              {profile.education.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No academic degrees logged.</p>
              ) : (
                profile.education.map(edu => (
                  <div key={edu.id} className="p-3.5 bg-slate-950/30 border border-slate-900 rounded-xl flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-white">{edu.degree} inside {edu.fieldOfStudy}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{edu.institution}</div>
                    </div>
                    {edu.verified && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono flex items-center gap-1 shadow-sm">
                        <ShieldCheck className="w-3 h-3" /> VERIFIED
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Work Employment */}
          <div className="glass-panel rounded-2xl border border-slate-900 p-5 shadow-lg flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-300 font-display flex items-center gap-2 border-b border-slate-900 pb-2">
              <Clock className="w-4.5 h-4.5 text-emerald-400" /> Professional Experience logs
            </h3>

            {/* Quick add form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Company Name"
                value={company}
                onChange={e => setCompany(e.target.value)}
                className="glass-input rounded-xl p-2 text-xs"
              />
              <input
                type="text"
                placeholder="Job Position"
                value={position}
                onChange={e => setPosition(e.target.value)}
                className="glass-input rounded-xl p-2 text-xs"
              />
            </div>
            <button
              onClick={addExp}
              disabled={!company || !position}
              className="w-fit px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-emerald-400 text-xs font-semibold border border-emerald-500/20 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Employment Entry
            </button>

            <div className="flex flex-col gap-3 mt-1">
              {profile.experience.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No professional logs found.</p>
              ) : (
                profile.experience.map(exp => (
                  <div key={exp.id} className="p-3.5 bg-slate-950/30 border border-slate-900 rounded-xl flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-white">{exp.position}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{exp.company} (Present/Recent)</div>
                    </div>
                    {exp.verified && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono flex items-center gap-1 shadow-sm">
                        <ShieldCheck className="w-3 h-3" /> VERIFIED
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right (4 Cols): Application Milestones & recommended matches */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Timeline Milestones */}
          <div className="glass-panel rounded-2xl border border-slate-900 p-5 shadow-lg flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-300 font-display flex items-center gap-2 border-b border-slate-900 pb-2">
              <Send className="w-4.5 h-4.5 text-emerald-400" /> Active Application logs
            </h3>

            <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
              {applications.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6">No active submissions found. Apply to job boards on the Smart Jobs page!</p>
              ) : (
                applications.map(app => (
                  <div key={app.id} className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white truncate">{app.jobTitle}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${app.status === 'OFFERED' ? 'bg-emerald-500/10 text-emerald-400' : app.status === 'SHORTLISTED' ? 'bg-indigo-500/10 text-indigo-400' : app.status === 'REJECTED' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 border-t border-slate-900 pt-2">
                      <span>Match score: <span className="font-bold text-emerald-400">{app.matchScore}%</span></span>
                      <span>{new Date(app.appliedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bookmarks */}
          <div className="glass-panel rounded-2xl border border-slate-900 p-5 shadow-lg flex flex-col gap-3">
            <h3 className="text-sm font-bold text-gray-300 font-display flex items-center gap-2 border-b border-slate-900 pb-2">
              <Bookmark className="w-4.5 h-4.5 text-emerald-400" /> Saved bookmarks
            </h3>

            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {bookmarks.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">No bookmarked jobs.</p>
              ) : (
                bookmarks.map(bm => (
                  <div key={bm.id} className="p-2.5 bg-slate-950/30 border border-slate-900 rounded-lg flex items-center justify-between text-xs">
                    <span className="text-gray-300 truncate font-semibold">{bm.title}</span>
                    <span className="text-[10px] text-gray-500 font-mono">{bm.companyName}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resume Scan Trigger modal */}
      {showUpload && (
        <ResumeUploadModal
          token={token}
          onClose={() => setShowUpload(false)}
          onUploadSuccess={onUpdateProfile}
        />
      )}
    </div>
  );
}
