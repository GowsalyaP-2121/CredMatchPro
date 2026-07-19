/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  User,
  StudentProfile,
  Company,
  Job,
  Application,
  Notification,
  AnalyticsSummary,
  ActivityLog
} from './types';

// Components
import Navbar from './components/Navbar';
import ParticleBackground from './components/ParticleBackground';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import DashboardStudent from './components/DashboardStudent';
import DashboardRecruiter from './components/DashboardRecruiter';
import DashboardAdmin from './components/DashboardAdmin';
import JobsPage from './components/JobsPage';
import LeaderboardPage from './components/LeaderboardPage';
import ActivityLogsPage from './components/ActivityLogsPage';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>('');
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);

  // Lists
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [bookmarks, setBookmarks] = useState<Job[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  const [loading, setLoading] = useState(true);

  // Authenticate on load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchSession(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch initial profile/company values on authentication change
  useEffect(() => {
    if (token) {
      fetchJobs();
      fetchApplications();
      fetchBookmarks();
      fetchNotifications();
      fetchActivityLogs();
      fetchAnalytics();

      // Setup SSE for real-time notifications, log events, and leaderboard rank syncs!
      const sse = new EventSource('/api/events');

      sse.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'NOTIFICATION' && payload.data.userId === user?.id) {
            setNotifications(prev => [payload.data, ...prev]);
          } else if (payload.type === 'ACTIVITY_LOG') {
            setActivityLogs(prev => [payload.data, ...prev].slice(0, 50));
            // Trigger background state re-fetches to sync scores!
            fetchApplications();
            fetchJobs();
            fetchAnalytics();
          }
        } catch (err) {
          console.error('SSE Error processing stream', err);
        }
      };

      return () => {
        sse.close();
      };
    }
  }, [token, user]);

  const fetchSession = async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.profile) setProfile(data.profile);
        if (data.company) setCompany(data.company);
      } else {
        localStorage.removeItem('token');
        setToken('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (loggedInUser: User, sessionToken: string) => {
    localStorage.setItem('token', sessionToken);
    setToken(sessionToken);
    setUser(loggedInUser);
    fetchSession(sessionToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setProfile(null);
    setCompany(null);
  };

  // REST syncing routines
  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setJobs(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setApplications(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const res = await fetch('/api/bookmarks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setBookmarks(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setNotifications(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const res = await fetch('/api/activity-logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setActivityLogs(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setAnalytics(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  // Student specific operations
  const handleUpdateProfile = async (updatedProfile: StudentProfile) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedProfile)
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        fetchJobs(); // Recalculate match scores live!
        fetchApplications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApply = async (jobId: string) => {
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ jobId })
      });
      if (res.ok) {
        fetchApplications();
        createNotificationLocal('Application Submitted', 'Your transparent candidate file was dispatched.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookmark = async (jobId: string) => {
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ jobId })
      });
      if (res.ok) fetchBookmarks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveBookmark = async (jobId: string) => {
    try {
      const res = await fetch(`/api/bookmarks/${jobId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchBookmarks();
    } catch (err) {
      console.error(err);
    }
  };

  // Recruiter operations
  const handleUpdateCompany = async (updatedCompany: Company) => {
    try {
      const res = await fetch('/api/companies/my', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedCompany)
      });
      if (res.ok) {
        setCompany(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostJob = async (jobData: any) => {
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(jobData)
      });
      if (res.ok) {
        fetchJobs();
        createNotificationLocal('Job Opening Published', 'Your opening was broadcast to relevant candidates.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (appId: string, status: string) => {
    try {
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchApplications();
        fetchAnalytics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkNotificationsRead = async () => {
    try {
      const res = await fetch('/api/notifications/read', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const createNotificationLocal = (title: string, message: string) => {
    const newNotif: Notification = {
      id: `local-${Date.now()}`,
      userId: user?.id || '',
      title,
      message,
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-gray-500 font-mono">Initializing CredMatch Pro Ecosystem...</span>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen w-full relative">
        <ParticleBackground />

        {/* Navigation */}
        <Navbar
          user={user}
          trustScore={profile?.trustScore}
          onLogout={handleLogout}
          notifications={notifications}
          onMarkNotificationsRead={handleMarkNotificationsRead}
        />

        {/* Content routing view with scale/fade page animations */}
        <main className="w-full">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage onLoginSuccess={handleLoginSuccess} />} />

            <Route
              path="/dashboard"
              element={
                !user ? (
                  <Navigate to="/login" />
                ) : user.role === 'STUDENT' && profile ? (
                  <DashboardStudent
                    user={user}
                    profile={profile}
                    jobs={jobs}
                    applications={applications}
                    bookmarks={bookmarks}
                    onUpdateProfile={handleUpdateProfile}
                    onApply={handleApply}
                    token={token}
                  />
                ) : user.role === 'RECRUITER' ? (
                  <DashboardRecruiter
                    user={user}
                    company={company}
                    jobs={jobs}
                    applications={applications}
                    onUpdateCompany={handleUpdateCompany}
                    onPostJob={handlePostJob}
                    onUpdateStatus={handleUpdateStatus}
                    token={token}
                  />
                ) : (
                  <DashboardAdmin
                    user={user}
                    analytics={analytics}
                    activityLogs={activityLogs}
                    token={token}
                  />
                )
              }
            />

            <Route
              path="/jobs"
              element={
                <JobsPage
                  user={user}
                  profile={profile}
                  jobs={jobs}
                  applications={applications}
                  bookmarks={bookmarks}
                  onApply={handleApply}
                  onBookmark={handleBookmark}
                  onRemoveBookmark={handleRemoveBookmark}
                  token={token}
                />
              }
            />

            <Route path="/leaderboard" element={<LeaderboardPage token={token} />} />
            <Route path="/activity-logs" element={user?.role === 'ADMIN' ? <ActivityLogsPage token={token} /> : <Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
