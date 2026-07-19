/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { DbEngine, SKILL_SYNONYMS } from './src/db/dbEngine';
import { calculateMatchScore, calculateTrustScore, findCandidateSkill, normalizeSkill } from './src/db/matchingEngine';
import {
  User,
  Company,
  StudentProfile,
  Job,
  Application,
  Notification,
  Bookmark,
  ActivityLog,
  LeaderboardEntry,
  AnalyticsSummary,
  UserRole,
  MatchBreakdown,
  ApplicationStatus,
  Skill,
  Education,
  Experience,
  Certificate
} from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// Server-Sent Events clients manager for real-time notifications
let sseClients: any[] = [];

function sendSSEEvent(type: string, data: any) {
  const payload = JSON.stringify({ type, data });
  sseClients.forEach(client => {
    client.write(`data: ${payload}\n\n`);
  });
}

// REST APIs
// ----------------- Real-time Events Route -----------------
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  res.write('retry: 10000\n\n');
  sseClients.push(res);

  req.on('close', () => {
    sseClients = sseClients.filter(client => client !== res);
  });
});

// Helper: Log Activity and notify admin/users
function logActivity(userId: string, userName: string, action: string, details: string) {
  const db = DbEngine.get();
  const log: ActivityLog = {
    id: `log-${Date.now()}`,
    userId,
    userName,
    action,
    details,
    timestamp: new Date().toISOString()
  };
  db.activityLogs.unshift(log);

  // Keep logs capped at 100
  if (db.activityLogs.length > 100) {
    db.activityLogs.pop();
  }
  DbEngine.save();

  // Send real-time SSE event for dashboard and live activity logs
  sendSSEEvent('ACTIVITY_LOG', log);
}

// Helper: Create notification
function createNotification(userId: string, title: string, message: string) {
  const db = DbEngine.get();
  const notif: Notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    userId,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString()
  };
  db.notifications.unshift(notif);
  DbEngine.save();

  sendSSEEvent('NOTIFICATION', notif);
}

// ----------------- Auth API -----------------
app.post('/api/auth/signup', (req, res) => {
  const { email, password, name, role } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'Missing required signup fields' });
  }

  const db = DbEngine.get();
  const exists = db.users.some(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const userId = `user-${Date.now()}`;
  const now = new Date().toISOString();

  const newUser: User = {
    id: userId,
    email: email.toLowerCase(),
    name,
    role: role as UserRole,
    createdAt: now,
    avatarUrl: `https://images.unsplash.com/photo-${role === 'STUDENT' ? '1539571696357-5a69c17a67c6' : '1573496359142-b8d87734a5a2'}?w=150&h=150&fit=crop`
  };

  db.users.push(newUser);
  db.passwords[userId] = password; // Simulation hash

  if (role === 'STUDENT') {
    const newProfile: StudentProfile = {
      id: `profile-${Date.now()}`,
      userId,
      headline: 'New Candidate Profile',
      bio: 'Ready to take on new career opportunities.',
      location: 'San Francisco, CA',
      remotePreference: 'ANY',
      workAuthorization: 'CITIZEN',
      skills: [],
      education: [],
      experience: [],
      certificates: [],
      trustScore: 30, // Complete base trust score
      viewCount: 0
    };
    db.studentProfiles.push(newProfile);
  } else if (role === 'RECRUITER') {
    const newCompany: Company = {
      id: `company-${Date.now()}`,
      name: `${name}'s Organization`,
      description: 'Enter your company details here.',
      website: 'https://example.com',
      logo: '🏢',
      industry: 'Tech Industry',
      location: 'San Francisco, CA',
      recruiterId: userId,
      verified: false
    };
    db.companies.push(newCompany);
  }

  DbEngine.save();
  logActivity(userId, name, 'SIGNUP', `${name} joined CredMatch Pro as a ${role}.`);
  createNotification(userId, 'Welcome!', 'Your account has been successfully created. Set up your details to get started.');

  res.status(201).json({ user: newUser, token: `token-${userId}` });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const db = DbEngine.get();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || db.passwords[user.id] !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  logActivity(user.id, user.name, 'LOGIN', `${user.name} logged into the system.`);
  res.json({ user, token: `token-${user.id}` });
});

// Retrieve current logged in user and profile/company
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer token-')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const userId = authHeader.replace('Bearer token-', '');
  const db = DbEngine.get();
  const user = db.users.find(u => u.id === userId);

  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  let profile = null;
  let company = null;

  if (user.role === 'STUDENT') {
    profile = db.studentProfiles.find(p => p.userId === userId);
  } else if (user.role === 'RECRUITER') {
    company = db.companies.find(c => c.recruiterId === userId);
  }

  res.json({ user, profile, company });
});

// Forgot / Reset Password simulator
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  const db = DbEngine.get();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (user) {
    logActivity(user.id, user.name, 'PASSWORD_FORGOT', `${user.name} requested a password reset ticket.`);
    createNotification(user.id, 'Password Reset Link', 'A deterministic password reset request has been logged. Use reset code 123456 to renew.');
  }

  res.json({ success: true, message: 'If the email exists, a password reset link has been dispatched.' });
});

app.post('/api/auth/reset-password', (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: 'Missing reset arguments' });
  }

  const db = DbEngine.get();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user || code !== '123456') {
    return res.status(400).json({ error: 'Invalid reset ticket or verification code' });
  }

  db.passwords[user.id] = newPassword;
  DbEngine.save();

  logActivity(user.id, user.name, 'PASSWORD_RESET', `${user.name} successfully updated credentials.`);
  createNotification(user.id, 'Password Changed', 'Your security password was successfully updated.');

  res.json({ success: true, message: 'Password has been updated successfully.' });
});

// ----------------- Profile APIs (Student only) -----------------
app.get('/api/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const userId = authHeader.replace('Bearer token-', '');
  const db = DbEngine.get();
  const profile = db.studentProfiles.find(p => p.userId === userId);

  if (!profile) return res.status(404).json({ error: 'Student profile not found' });
  res.json(profile);
});

app.put('/api/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const userId = authHeader.replace('Bearer token-', '');
  const db = DbEngine.get();
  const profileIndex = db.studentProfiles.findIndex(p => p.userId === userId);

  if (profileIndex === -1) return res.status(404).json({ error: 'Student profile not found' });

  const updatedData = req.body;
  const currentProfile = db.studentProfiles[profileIndex];

  // Merge profile
  const mergedProfile: StudentProfile = {
    ...currentProfile,
    headline: updatedData.headline ?? currentProfile.headline,
    bio: updatedData.bio ?? currentProfile.bio,
    location: updatedData.location ?? currentProfile.location,
    remotePreference: updatedData.remotePreference ?? currentProfile.remotePreference,
    workAuthorization: updatedData.workAuthorization ?? currentProfile.workAuthorization,
    skills: updatedData.skills ?? currentProfile.skills,
    education: updatedData.education ?? currentProfile.education,
    experience: updatedData.experience ?? currentProfile.experience,
    certificates: updatedData.certificates ?? currentProfile.certificates,
  };

  // Recalculate trust score instantly
  const user = db.users.find(u => u.id === userId);
  mergedProfile.trustScore = calculateTrustScore(mergedProfile, user?.avatarUrl);

  db.studentProfiles[profileIndex] = mergedProfile;
  DbEngine.save();

  logActivity(userId, user?.name || 'Student', 'PROFILE_UPDATED', `${user?.name} updated profile values and computed Trust Score: ${mergedProfile.trustScore}%`);
  createNotification(userId, 'Profile Updated', 'Your profile elements were verified and saved.');

  // Check if any applications need score updates due to updating profile (Live matching updates!)
  db.applications.forEach((app, i) => {
    if (app.studentId === mergedProfile.id) {
      const job = db.jobs.find(j => j.id === app.jobId);
      if (job) {
        const matchResult = calculateMatchScore(mergedProfile, job);
        db.applications[i].matchScore = matchResult.score;
        db.applications[i].matchBreakdown = matchResult.breakdown;
      }
    }
  });
  DbEngine.save();

  res.json(mergedProfile);
});

// Resume parser simulator (Deterministic keyword engine matching Canon skills list)
app.post('/api/profile/resume', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const userId = authHeader.replace('Bearer token-', '');
  const db = DbEngine.get();
  const profileIndex = db.studentProfiles.findIndex(p => p.userId === userId);

  if (profileIndex === -1) return res.status(404).json({ error: 'Student profile not found' });

  const { fileName, resumeText } = req.body;
  if (!fileName || !resumeText) {
    return res.status(400).json({ error: 'Missing filename or text content' });
  }

  const user = db.users.find(u => u.id === userId)!;

  // Search text for skills
  const extractedSkills: Skill[] = [];
  const textLower = resumeText.toLowerCase();

  // Search against our canon synonyms
  Object.keys(SKILL_SYNONYMS).forEach(canonical => {
    const synonyms = SKILL_SYNONYMS[canonical];
    const found = synonyms.some(syn => textLower.includes(syn)) || textLower.includes(canonical);

    if (found) {
      extractedSkills.push({ name: canonical, level: 'INTERMEDIATE' });
    }
  });

  // Extract Education simulator
  const extractedEdu: Education[] = [];
  if (textLower.includes('university') || textLower.includes('college') || textLower.includes('institute')) {
    let institution = 'Stanford University';
    if (textLower.includes('texas')) institution = 'University of Texas at Austin';
    else if (textLower.includes('mit') || textLower.includes('massachusetts')) institution = 'Massachusetts Institute of Technology';
    else if (textLower.includes('berkeley')) institution = 'UC Berkeley';

    let degree = 'Bachelor of Science';
    if (textLower.includes('master') || textLower.includes('m.s.')) degree = 'Master of Science';
    else if (textLower.includes('phd') || textLower.includes('ph.d')) degree = 'PhD Doctorate';

    extractedEdu.push({
      id: `edu-${Date.now()}`,
      institution,
      degree,
      fieldOfStudy: textLower.includes('computer') ? 'Computer Science' : 'Data Engineering',
      startDate: '2020-09-01',
      endDate: '2024-05-30',
      grade: '3.80 GPA',
      description: 'Extracted automatically from resume parser.',
      verified: true
    });
  }

  // Extract Experience simulator
  const extractedExp: Experience[] = [];
  if (textLower.includes('developer') || textLower.includes('engineer') || textLower.includes('analyst') || textLower.includes('intern')) {
    let company = 'Google';
    if (textLower.includes('stripe')) company = 'Stripe';
    else if (textLower.includes('amazon')) company = 'Amazon';
    else if (textLower.includes('meta') || textLower.includes('facebook')) company = 'Meta';

    extractedExp.push({
      id: `exp-${Date.now()}`,
      company,
      position: textLower.includes('senior') ? 'Senior Software Engineer' : 'Full-Stack Developer',
      startDate: '2022-06-01',
      endDate: 'Present',
      description: 'Responsibilities scanned: developed responsive web portals, deployed server microservices, maintained databases.',
      verified: true
    });
  }

  // Merge scanned properties
  const profile = db.studentProfiles[profileIndex];
  profile.resumeFileName = fileName;
  profile.resumeUrl = `/uploads/${fileName}`;

  // Filter skills to avoid duplicate inserts
  extractedSkills.forEach(newSkill => {
    if (!profile.skills.some(s => s.name.toLowerCase() === newSkill.name.toLowerCase())) {
      profile.skills.push(newSkill);
    }
  });

  if (extractedEdu.length > 0) {
    profile.education = [...profile.education, ...extractedEdu];
  }
  if (extractedExp.length > 0) {
    profile.experience = [...profile.experience, ...extractedExp];
  }

  profile.trustScore = calculateTrustScore(profile, user.avatarUrl);
  db.studentProfiles[profileIndex] = profile;
  DbEngine.save();

  logActivity(userId, user.name, 'RESUME_UPLOADED', `${user.name} processed resume '${fileName}'. Found ${extractedSkills.length} skills, ${extractedEdu.length} edu, ${extractedExp.length} exp.`);
  createNotification(userId, 'Resume Parsed Successfully', `CredMatch Pro deterministic parser analyzed your document. Trust Score is now ${profile.trustScore}%!`);

  res.json({
    profile,
    extracted: {
      skills: extractedSkills.map(s => s.name),
      education: extractedEdu.map(e => `${e.degree} at ${e.institution}`),
      experience: extractedExp.map(x => `${x.position} at ${x.company}`)
    }
  });
});

// ----------------- Company APIs (Recruiter only) -----------------
app.get('/api/companies/my', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const userId = authHeader.replace('Bearer token-', '');
  const db = DbEngine.get();
  const company = db.companies.find(c => c.recruiterId === userId);

  if (!company) return res.status(404).json({ error: 'Company not found' });
  res.json(company);
});

app.put('/api/companies/my', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const userId = authHeader.replace('Bearer token-', '');
  const db = DbEngine.get();
  const companyIndex = db.companies.findIndex(c => c.recruiterId === userId);

  if (companyIndex === -1) return res.status(404).json({ error: 'Company not found' });

  const updatedData = req.body;
  db.companies[companyIndex] = {
    ...db.companies[companyIndex],
    name: updatedData.name ?? db.companies[companyIndex].name,
    description: updatedData.description ?? db.companies[companyIndex].description,
    website: updatedData.website ?? db.companies[companyIndex].website,
    logo: updatedData.logo ?? db.companies[companyIndex].logo,
    industry: updatedData.industry ?? db.companies[companyIndex].industry,
    location: updatedData.location ?? db.companies[companyIndex].location,
  };

  DbEngine.save();
  const user = db.users.find(u => u.id === userId)!;
  logActivity(userId, user.name, 'COMPANY_UPDATED', `${user.name} revised corporate branding parameters.`);

  res.json(db.companies[companyIndex]);
});

// ----------------- Jobs APIs -----------------
app.get('/api/jobs', (req, res) => {
  const db = DbEngine.get();
  const authHeader = req.headers.authorization;

  let activeJobs = db.jobs.filter(j => j.active);

  if (authHeader && authHeader.startsWith('Bearer token-')) {
    const userId = authHeader.replace('Bearer token-', '');
    const user = db.users.find(u => u.id === userId);

    if (user && user.role === 'STUDENT') {
      const profile = db.studentProfiles.find(p => p.userId === userId);
      if (profile) {
        // Embed live computed score for matching!
        const scoredJobs = activeJobs.map(job => {
          const matchResult = calculateMatchScore(profile, job);
          return {
            ...job,
            matchScore: matchResult.score,
            matchBreakdown: matchResult.breakdown,
            opportunityGap: matchResult.opportunityGap
          };
        });
        return res.json(scoredJobs);
      }
    }
  }

  res.json(activeJobs);
});

app.post('/api/jobs', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const userId = authHeader.replace('Bearer token-', '');
  const db = DbEngine.get();
  const recruiter = db.users.find(u => u.id === userId);

  if (!recruiter || recruiter.role !== 'RECRUITER') {
    return res.status(403).json({ error: 'Only recruiters can post jobs' });
  }

  const company = db.companies.find(c => c.recruiterId === userId);
  if (!company) {
    return res.status(400).json({ error: 'Set up your company profile before posting a job' });
  }

  const { title, description, location, workType, experienceRequired, salaryRange, skillsRequired, visaSponsorship } = req.body;

  if (!title || !description || !skillsRequired || !skillsRequired.length) {
    return res.status(400).json({ error: 'Missing vital job parameters' });
  }

  const newJob: Job = {
    id: `job-${Date.now()}`,
    title,
    description,
    companyId: company.id,
    companyName: company.name,
    companyLogo: company.logo,
    location: location || 'Remote',
    workType: workType || 'REMOTE',
    experienceRequired: Number(experienceRequired) || 0,
    salaryRange: salaryRange || 'TBD',
    skillsRequired, // items look like { name: string, weight: number }
    visaSponsorship: visaSponsorship === true,
    active: true,
    createdAt: new Date().toISOString(),
    viewCount: 0
  };

  db.jobs.push(newJob);
  DbEngine.save();

  logActivity(userId, recruiter.name, 'JOB_POSTED', `Recruiter ${recruiter.name} posted job '${title}' at ${company.name}`);

  // Push notifications to students whose skills match at least 1 job skill!
  db.studentProfiles.forEach(prof => {
    const matches = prof.skills.some(candSkill =>
      newJob.skillsRequired.some(js => normalizeSkill(js.name) === normalizeSkill(candSkill.name))
    );
    if (matches) {
      createNotification(prof.userId, 'New Job Match!', `${company.name} posted a role matching your skill spectrum: '${title}'. Check your match score now!`);
    }
  });

  res.status(201).json(newJob);
});

// View count recorder
app.post('/api/jobs/:id/view', (req, res) => {
  const { id } = req.params;
  const db = DbEngine.get();
  const job = db.jobs.find(j => j.id === id);
  if (job) {
    job.viewCount = (job.viewCount || 0) + 1;
    DbEngine.save();
  }
  res.json({ success: true });
});

// ----------------- Applications APIs -----------------
app.get('/api/applications', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const userId = authHeader.replace('Bearer token-', '');
  const db = DbEngine.get();
  const user = db.users.find(u => u.id === userId)!;

  if (user.role === 'STUDENT') {
    const profile = db.studentProfiles.find(p => p.userId === userId)!;
    const studentApps = db.applications.filter(a => a.studentId === profile.id);
    return res.json(studentApps);
  } else if (user.role === 'RECRUITER') {
    const company = db.companies.find(c => c.recruiterId === userId)!;
    const recruiterApps = db.applications.filter(app => {
      const job = db.jobs.find(j => j.id === app.jobId);
      return job && job.companyId === company.id;
    });
    return res.json(recruiterApps);
  } else {
    // Admin sees all
    return res.json(db.applications);
  }
});

app.post('/api/applications', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const userId = authHeader.replace('Bearer token-', '');
  const db = DbEngine.get();
  const student = db.users.find(u => u.id === userId);

  if (!student || student.role !== 'STUDENT') {
    return res.status(403).json({ error: 'Only students can apply' });
  }

  const profile = db.studentProfiles.find(p => p.userId === userId)!;
  const { jobId } = req.body;

  const job = db.jobs.find(j => j.id === jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  // Prevent duplicated applications
  const alreadyApplied = db.applications.some(a => a.jobId === jobId && a.studentId === profile.id);
  if (alreadyApplied) {
    return res.status(400).json({ error: 'You have already applied to this position' });
  }

  // Calculate real-time match score
  const matchResult = calculateMatchScore(profile, job);

  const newApplication: Application = {
    id: `app-${Date.now()}`,
    jobId,
    jobTitle: job.title,
    companyName: job.companyName,
    companyLogo: job.companyLogo,
    studentId: profile.id,
    studentName: student.name,
    studentHeadline: profile.headline,
    status: 'PENDING',
    appliedAt: new Date().toISOString(),
    matchScore: matchResult.score,
    matchBreakdown: matchResult.breakdown
  };

  db.applications.push(newApplication);
  DbEngine.save();

  logActivity(userId, student.name, 'APPLICATION_SUBMITTED', `${student.name} applied for '${job.title}' with a Match Score of ${matchResult.score}%`);

  // Notify Recruiter
  const company = db.companies.find(c => c.id === job.companyId);
  if (company) {
    createNotification(company.recruiterId, 'New Candidate Applied', `${student.name} applied for your job opening '${job.title}' (Match Score: ${matchResult.score}%)`);
  }

  res.status(201).json(newApplication);
});

app.put('/api/applications/:id/status', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const userId = authHeader.replace('Bearer token-', '');
  const db = DbEngine.get();
  const recruiter = db.users.find(u => u.id === userId);

  if (!recruiter || recruiter.role !== 'RECRUITER') {
    return res.status(403).json({ error: 'Only recruiters can edit application milestones' });
  }

  const { id } = req.params;
  const { status } = req.body; // ApplicationStatus

  const appIndex = db.applications.findIndex(a => a.id === id);
  if (appIndex === -1) return res.status(404).json({ error: 'Application file not found' });

  const application = db.applications[appIndex];
  application.status = status as ApplicationStatus;
  DbEngine.save();

  logActivity(userId, recruiter.name, 'APPLICATION_STATUS_UPDATED', `Recruiter changed status of ${application.studentName}'s application to '${status}'`);

  // Notify student
  const studentProfile = db.studentProfiles.find(p => p.id === application.studentId);
  if (studentProfile) {
    createNotification(studentProfile.userId, 'Application Status Update', `Your candidacy status for '${application.jobTitle}' at ${application.companyName} was updated to: ${status}!`);
  }

  res.json(application);
});

// ----------------- Bookmarks APIs -----------------
app.get('/api/bookmarks', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const userId = authHeader.replace('Bearer token-', '');
  const db = DbEngine.get();
  const userBookmarks = db.bookmarks.filter(b => b.userId === userId);
  const bookmarkedJobs = db.jobs.filter(job => userBookmarks.some(b => b.jobId === job.id));

  // Scored bookmarks if user is student
  const user = db.users.find(u => u.id === userId);
  if (user && user.role === 'STUDENT') {
    const profile = db.studentProfiles.find(p => p.userId === userId);
    if (profile) {
      const scored = bookmarkedJobs.map(job => {
        const matchResult = calculateMatchScore(profile, job);
        return {
          ...job,
          matchScore: matchResult.score,
          matchBreakdown: matchResult.breakdown,
          opportunityGap: matchResult.opportunityGap
        };
      });
      return res.json(scored);
    }
  }

  res.json(bookmarkedJobs);
});

app.post('/api/bookmarks', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const userId = authHeader.replace('Bearer token-', '');
  const { jobId } = req.body;
  const db = DbEngine.get();

  const exists = db.bookmarks.some(b => b.userId === userId && b.jobId === jobId);
  if (!exists) {
    db.bookmarks.push({
      id: `bmark-${Date.now()}`,
      userId,
      jobId,
      createdAt: new Date().toISOString()
    });
    DbEngine.save();
  }

  res.json({ success: true });
});

app.delete('/api/bookmarks/:jobId', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const userId = authHeader.replace('Bearer token-', '');
  const { jobId } = req.params;
  const db = DbEngine.get();

  db.bookmarks = db.bookmarks.filter(b => !(b.userId === userId && b.jobId === jobId));
  DbEngine.save();

  res.json({ success: true });
});

// ----------------- Leaderboard API (Recruiter and Students view) -----------------
app.get('/api/leaderboard', (req, res) => {
  const db = DbEngine.get();
  const entries: LeaderboardEntry[] = [];

  db.studentProfiles.forEach(profile => {
    const user = db.users.find(u => u.id === profile.userId);
    if (!user) return;

    // Calculate average match score across all active jobs
    let totalScore = 0;
    let jobCount = 0;

    db.jobs.forEach(job => {
      if (job.active) {
        const res = calculateMatchScore(profile, job);
        totalScore += res.score;
        jobCount++;
      }
    });

    const averageMatchScore = jobCount > 0 ? Math.round((totalScore / jobCount) * 10) / 10 : 0;

    entries.push({
      studentId: profile.id,
      studentName: user.name,
      headline: profile.headline,
      skills: profile.skills.map(s => s.name),
      trustScore: profile.trustScore,
      averageMatchScore,
      rank: 0
    });
  });

  // Sort by average match score and trust score
  const sorted = entries.sort((a, b) => b.averageMatchScore - a.averageMatchScore || b.trustScore - a.trustScore);
  sorted.forEach((entry, i) => {
    entry.rank = i + 1;
  });

  res.json(sorted);
});

// ----------------- Notifications APIs -----------------
app.get('/api/notifications', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const userId = authHeader.replace('Bearer token-', '');
  const db = DbEngine.get();
  const userNotifs = db.notifications.filter(n => n.userId === userId);
  res.json(userNotifs);
});

app.put('/api/notifications/read', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const userId = authHeader.replace('Bearer token-', '');
  const db = DbEngine.get();

  db.notifications.forEach((n, i) => {
    if (n.userId === userId) {
      db.notifications[i].read = true;
    }
  });

  DbEngine.save();
  res.json({ success: true });
});

// ----------------- Activity Logs (Admin/System monitor) -----------------
app.get('/api/activity-logs', (req, res) => {
  const db = DbEngine.get();
  res.json(db.activityLogs);
});

// ----------------- Analytics APIs -----------------
app.get('/api/analytics', (req, res) => {
  const db = DbEngine.get();

  // Sum scores
  let totalMatchSum = 0;
  let applicationCount = db.applications.length;

  db.applications.forEach(app => {
    totalMatchSum += app.matchScore;
  });

  const averageMatchScore = applicationCount > 0 ? Math.round((totalMatchSum / applicationCount) * 10) / 10 : 0;

  // Status breakdown
  const statuses: ApplicationStatus[] = ['PENDING', 'SHORTLISTED', 'REJECTED', 'OFFERED'];
  const applicationsByStatus = statuses.map(status => ({
    status,
    count: db.applications.filter(a => a.status === status).length
  }));

  // Skills in demand calculation
  const skillCountMap: Record<string, number> = {};
  db.jobs.forEach(job => {
    job.skillsRequired.forEach(sk => {
      const canon = normalizeSkill(sk.name);
      skillCountMap[sk.name] = (skillCountMap[sk.name] || 0) + 1;
    });
  });

  const skillsInDemand = Object.entries(skillCountMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const totalStudents = db.users.filter(u => u.role === 'STUDENT').length;
  const totalRecruiters = db.users.filter(u => u.role === 'RECRUITER').length;
  const totalCompanies = db.companies.length;
  const totalJobs = db.jobs.length;

  const summary: AnalyticsSummary = {
    totalStudents,
    totalRecruiters,
    totalCompanies,
    totalJobs,
    totalApplications: applicationCount,
    averageMatchScore,
    applicationsByStatus,
    skillsInDemand
  };

  res.json(summary);
});

// ----------------- Vite Integration for Client SPA -----------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CredMatch Pro Server running on http://localhost:${PORT}`);
  });
}

startServer();
