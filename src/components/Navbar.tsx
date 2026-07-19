/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, User as UserIcon, LogOut, Award, Menu, X, ShieldAlert } from 'lucide-react';
import { User, Notification } from '../types';

interface NavbarProps {
  user: User | null;
  trustScore?: number;
  onLogout: () => void;
  notifications: Notification[];
  onMarkNotificationsRead: () => void;
}

export default function Navbar({ user, trustScore, onLogout, notifications, onMarkNotificationsRead }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-white border-b-2 border-indigo-500 h-16 flex items-center' : 'text-slate-400 hover:text-white transition-colors h-16 flex items-center';
  };

  return (
    <nav className="sticky top-0 z-40 w-full h-16 bg-[#0F0F12] border-b border-white/10 px-4 md:px-8 flex items-center justify-between" id="app-navbar">
      <div className="flex items-center gap-8 h-full">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rotate-45"></div>
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-display">
              CredMatch <span className="text-indigo-400">Pro</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium h-full">
          {user && (
            <>
              <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
              <Link to="/jobs" className={isActive('/jobs')}>Smart Jobs</Link>
              <Link to="/leaderboard" className={isActive('/leaderboard')}>Leaderboard</Link>
              {user.role === 'ADMIN' && (
                <Link to="/activity-logs" className={isActive('/activity-logs')}>System Audit</Link>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            {/* Student Trust Badge */}
            {user.role === 'STUDENT' && typeof trustScore === 'number' && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-400 font-mono shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                <Award className="w-3.5 h-3.5" />
                <span>Trust Score: {trustScore}%</span>
              </div>
            )}

            {/* Notifications Dropdown Container */}
            <div className="relative">
              <button
                id="notif-bell-btn"
                onClick={() => {
                  setShowNotifMenu(!showNotifMenu);
                  setShowProfileMenu(false);
                  if (!showNotifMenu && unreadCount > 0) {
                    onMarkNotificationsRead();
                  }
                }}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 transition-colors text-gray-300 hover:text-white relative"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[9px] font-bold text-slate-950">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto glass-panel rounded-xl shadow-2xl p-4 flex flex-col gap-3 z-50 border border-slate-800" id="notif-dropdown">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-semibold text-gray-400">NOTIFICATIONS</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded">NEW</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-center text-gray-500 py-6">No recent updates.</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-2.5 rounded-lg border text-xs transition-colors ${n.read ? 'border-slate-900 bg-slate-950/30 text-gray-400' : 'border-emerald-500/10 bg-emerald-500/5 text-gray-200'}`}>
                          <div className="font-semibold mb-0.5">{n.title}</div>
                          <div>{n.message}</div>
                          <div className="text-[9px] text-gray-500 mt-1 font-mono">{new Date(n.createdAt).toLocaleTimeString()}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Trigger */}
            <div className="relative">
              <button
                id="user-profile-btn"
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifMenu(false);
                }}
                className="flex items-center gap-2 p-1 rounded-full border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all text-gray-300 hover:text-white"
              >
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop'}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-800"
                  referrerPolicy="no-referrer"
                />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 glass-panel rounded-xl shadow-2xl p-2 z-50 flex flex-col border border-slate-800" id="profile-dropdown">
                  <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                    <div className="text-xs font-semibold text-gray-200 truncate">{user.name}</div>
                    <div className="text-[10px] text-gray-500 truncate font-mono">{user.email}</div>
                    <div className="text-[10px] text-emerald-400 mt-1.5 font-bold uppercase tracking-wider">{user.role}</div>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                      navigate('/');
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-left text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Secure Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 text-slate-300 hover:text-white text-xs transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/login?tab=signup"
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
            >
              Join Platform
            </Link>
          </div>
        )}

        {/* Mobile menu button */}
        {user && (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 md:hidden rounded-lg border border-slate-800 text-gray-400 hover:text-white hover:bg-slate-900"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && user && (
        <div className="absolute top-14 left-0 w-full bg-slate-950 border-b border-slate-900 flex flex-col p-4 gap-3 md:hidden z-30 animate-fade-in" id="mobile-menu-drawer">
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-slate-900 hover:text-white"
          >
            Dashboard
          </Link>
          <Link
            to="/jobs"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-slate-900 hover:text-white"
          >
            Smart Jobs
          </Link>
          <Link
            to="/leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-slate-900 hover:text-white"
          >
            Leaderboard
          </Link>
          {user.role === 'ADMIN' && (
            <Link
              to="/activity-logs"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-slate-900 hover:text-white"
            >
              System Audit
            </Link>
          )}

          {user.role === 'STUDENT' && typeof trustScore === 'number' && (
            <div className="mx-3 mt-2 flex items-center justify-between p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 font-mono">
              <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> Platform Trust Status</span>
              <span>{trustScore}%</span>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
