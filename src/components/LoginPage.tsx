/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, User as UserIcon, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';
import { User } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: User, token: string) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'signup' ? 'signup' : 'login';

  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'forgot' | 'reset'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'RECRUITER'>('STUDENT');

  // Forgot password flow
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, [activeTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return setError('Please fill in all fields.');

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      onLoginSuccess(data.user, data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) return setError('Please fill in all fields.');

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      onLoginSuccess(data.user, data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return setError('Email is required');

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });

      if (!res.ok) throw new Error('Password ticket dispatch failed');

      setSuccess('Verification ticket issued! Use reset code 123456');
      setActiveTab('reset');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !resetCode || !newPassword) {
      return setError('Please fill in all fields');
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, code: resetCode, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');

      setSuccess('Password updated successfully! Sign in now.');
      setActiveTab('login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-57px)] w-full flex items-center justify-center p-4 relative">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md glass-panel rounded-2xl border border-white/10 p-6 md:p-8 shadow-2xl flex flex-col gap-6"
      >
        {/* Title */}
        <div className="text-center">
          <h2 className="text-2xl font-bold font-display text-white">
            {activeTab === 'login' && 'Welcome Back'}
            {activeTab === 'signup' && 'Create Your Profile'}
            {activeTab === 'forgot' && 'Reset Password'}
            {activeTab === 'reset' && 'Create New Password'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {activeTab === 'login' && 'Access your deterministic skills dashboard.'}
            {activeTab === 'signup' && 'Start matching transparently against postings.'}
            {activeTab === 'forgot' && 'A verification token code will be logged.'}
            {activeTab === 'reset' && 'Configure custom cryptographic login credentials.'}
          </p>
        </div>

        {/* Tab Buttons (Login vs Signup) */}
        {(activeTab === 'login' || activeTab === 'signup') && (
          <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-lg border border-white/5">
            <button
              onClick={() => setActiveTab('login')}
              className={`py-1.5 rounded-md text-xs font-semibold transition-all ${activeTab === 'login' ? 'bg-[#1A1A1E] text-white border border-white/10' : 'text-slate-400 hover:text-white'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`py-1.5 rounded-md text-xs font-semibold transition-all ${activeTab === 'signup' ? 'bg-[#1A1A1E] text-white border border-white/10' : 'text-slate-400 hover:text-white'}`}
            >
              Register Profile
            </button>
          </div>
        )}

        {/* Alert banners */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs text-indigo-400">
            {success}
          </div>
        )}

        {/* Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full glass-input rounded-xl py-2.5 pl-10 pr-4 text-xs font-mono transition-all"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs text-slate-400">PASSWORD</label>
                <button
                  type="button"
                  onClick={() => setActiveTab('forgot')}
                  className="text-[11px] text-indigo-400 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full glass-input rounded-xl py-2.5 pl-10 pr-4 text-xs font-mono transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(99,102,241,0.15)] disabled:opacity-50 transition-all uppercase tracking-wider"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <>Sign In <ArrowRight className="w-3.5 h-3.5" /></>}
            </button>
          </form>
        )}

        {/* Signup Form */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">FULL NAME</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full glass-input rounded-xl py-2.5 pl-10 pr-4 text-xs transition-all"
                  placeholder="Alex Rivera"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full glass-input rounded-xl py-2.5 pl-10 pr-4 text-xs font-mono transition-all"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">CHOOSE YOUR ROLE</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('STUDENT')}
                  className={`py-2 rounded-xl border text-xs font-bold transition-all ${role === 'STUDENT' ? 'border-violet-500 bg-violet-500/10 text-violet-400' : 'border-white/5 bg-slate-900/40 text-slate-400 hover:text-white'}`}
                >
                  Candidate (Student)
                </button>
                <button
                  type="button"
                  onClick={() => setRole('RECRUITER')}
                  className={`py-2 rounded-xl border text-xs font-bold transition-all ${role === 'RECRUITER' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-white/5 bg-slate-900/40 text-slate-400 hover:text-white'}`}
                >
                  Hiring Partner (Recruiter)
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full glass-input rounded-xl py-2.5 pl-10 pr-4 text-xs font-mono transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(99,102,241,0.15)] disabled:opacity-50 transition-all uppercase tracking-wider"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <>Join Platform <ArrowRight className="w-3.5 h-3.5" /></>}
            </button>
          </form>
        )}

        {/* Forgot Password */}
        {activeTab === 'forgot' && (
          <form onSubmit={handleForgot} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  className="w-full glass-input rounded-xl py-2.5 pl-10 pr-4 text-xs font-mono transition-all"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="flex-1 py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 text-slate-400 hover:text-white text-xs font-semibold transition-all"
              >
                Go Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(99,102,241,0.15)] disabled:opacity-50 transition-all uppercase tracking-wider"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Get Code'}
              </button>
            </div>
          </form>
        )}

        {/* Reset Password */}
        {activeTab === 'reset' && (
          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">ENTER RESET CODE (123456)</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={resetCode}
                  onChange={e => setResetCode(e.target.value)}
                  className="w-full glass-input rounded-xl py-2.5 pl-10 pr-4 text-xs font-mono transition-all"
                  placeholder="123456"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">NEW PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full glass-input rounded-xl py-2.5 pl-10 pr-4 text-xs font-mono transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="flex-1 py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 text-slate-400 hover:text-white text-xs font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(99,102,241,0.15)] disabled:opacity-50 transition-all uppercase tracking-wider"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
