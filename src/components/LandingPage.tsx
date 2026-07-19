/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Compass, Cpu, TrendingUp, Award, Layers, Zap, Sparkles, Code, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-[calc(100vh-57px)] w-full relative flex flex-col items-center justify-start pb-16 px-4 md:px-8">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <header className="max-w-4xl text-center mt-12 md:mt-24 flex flex-col items-center gap-6 z-10">
        {/* Transparent Badging */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-indigo-500/20 text-indigo-400 font-mono text-xs shadow-[0_0_20px_rgba(99,102,241,0.1)]"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
          <span>V1.0.0 Stable Release: Fully Deterministic matching</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl md:text-6xl font-extrabold font-display tracking-tight leading-tight text-white"
        >
          Discover Jobs with Complete <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Algorithmic Transparency
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-base md:text-lg text-slate-400 max-w-2xl"
        >
          CredMatch Pro is a smart job-matching dashboard. Zero AI bias, zero unexplainable filters. Compare skills, simulate growth, and secure verification with direct trust badges.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-4"
        >
          <Link
            to="/login?tab=signup"
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all transform hover:-translate-y-0.5 uppercase tracking-wider"
          >
            Launch Free Profile
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white text-sm font-semibold transition-all"
          >
            Recruiter Sign In
          </Link>
        </motion.div>
      </header>

      {/* Formula Visualization Card */}
      <section className="w-full max-w-4xl mt-16 md:mt-24 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-panel rounded-2xl border border-slate-800/80 p-6 md:p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-xl md:text-2xl font-bold font-display text-white mb-2 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" /> Explainable Weighted Score Formula
          </h2>
          <p className="text-xs text-gray-400 mb-6">Every match score is fully auditable, reproducible, and compliant under deterministic algorithms.</p>

          {/* Formula Breakdown Badges */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { label: 'Skill Match', val: '45%', color: 'border-emerald-500/20 text-emerald-400' },
              { label: 'Experience', val: '20%', color: 'border-indigo-500/20 text-indigo-400' },
              { label: 'Education', val: '15%', color: 'border-cyan-500/20 text-cyan-400' },
              { label: 'Certifications', val: '10%', color: 'border-yellow-500/20 text-yellow-400' },
              { label: 'Location', val: '5%', color: 'border-teal-500/20 text-teal-400' },
              { label: 'Authorization', val: '5%', color: 'border-blue-500/20 text-blue-400' },
            ].map((f, i) => (
              <div key={i} className={`flex flex-col items-center justify-center p-3 rounded-xl border bg-slate-950/40 ${f.color}`}>
                <span className="text-xl font-bold font-display">{f.val}</span>
                <span className="text-[10px] text-gray-400 uppercase mt-1 text-center font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Core Platform Features (Bento Grid) */}
      <section className="w-full max-w-5xl mt-16 md:mt-24 z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Feature 1 */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-panel rounded-2xl border border-slate-900 p-6 flex flex-col gap-3 shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white font-display">Opportunity Gap Analyzer</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Instantly view missing skills for any job. We compute exact hypothetical point gains and recommend an optimal order of learning based on weight impact.
          </p>
        </motion.div>

        {/* Feature 2 */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-panel rounded-2xl border border-slate-900 p-6 flex flex-col gap-3 shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white font-display">Skill Impact Simulator</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            "What if I learn Docker?" Test skill inclusions dynamically inside your simulator, instantly tracking how your scores scale across various active postings.
          </p>
        </motion.div>

        {/* Feature 3 */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-panel rounded-2xl border border-slate-900 p-6 flex flex-col gap-3 shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white font-display">Verified Trust Scoring</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Gain an edge via separate Trust Scores. Verify your education credentials and experience certificates through direct cryptographic verification records.
          </p>
        </motion.div>
      </section>

      {/* Recruiter Section */}
      <section className="w-full max-w-4xl mt-16 md:mt-24 z-10 glass-panel rounded-2xl border border-slate-800 p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-indigo-500/20 text-indigo-400 font-mono text-[10px] w-fit mb-3">
            RECRUITERS & HIRING MANAGERS
          </div>
          <h3 className="text-lg md:text-xl font-bold text-white mb-2 font-display">
            Evaluate Candidates with Unprecedented Clarity
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Forget scanning thousands of resumes manually. Access custom dashboard visualizations mapping applicant pipelines, direct skill distributions, and precise deterministic score breakdowns.
          </p>
        </div>
        <div className="flex flex-col gap-2 p-4 bg-slate-950/50 border border-slate-900 rounded-xl w-full md:w-72 font-mono text-xs">
          <div className="flex items-center justify-between text-gray-400 border-b border-slate-900 pb-2 mb-2">
            <span>COMPETITION METER</span>
            <span className="text-emerald-400 font-bold">LIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate text-gray-300">Alex Rivera (Stanford) - 92% Match</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate text-gray-300">Sofia Chen (UT Austin) - 85% Match</span>
          </div>
        </div>
      </section>
    </div>
  );
}
