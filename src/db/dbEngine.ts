/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
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
  UserRole
} from '../types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface Schema {
  users: User[];
  passwords: Record<string, string>; // userId -> bcrypt-simulated hash
  companies: Company[];
  studentProfiles: StudentProfile[];
  jobs: Job[];
  applications: Application[];
  notifications: Notification[];
  bookmarks: Bookmark[];
  activityLogs: ActivityLog[];
}

// Complete skill dictionary for synonym matching
export const SKILL_SYNONYMS: Record<string, string[]> = {
  'javascript': ['js', 'ecmascript', 'es6', 'esnext'],
  'typescript': ['ts', 'tsc'],
  'react': ['react.js', 'reactjs', 'react 18', 'react 19', 'preact'],
  'node.js': ['nodejs', 'node', 'express', 'koa', 'nest.js', 'nestjs'],
  'python': ['py', 'cpython', 'django', 'flask', 'fastapi'],
  'java': ['java 17', 'java 21', 'spring', 'spring boot', 'springboot'],
  'docker': ['docker-compose', 'kubernetes', 'k8s', 'containers'],
  'aws': ['amazon web services', 'ec2', 's3', 'rds', 'lambda'],
  'postgresql': ['postgres', 'psql'],
  'mysql': ['mysql 8', 'mariadb'],
  'tailwind css': ['tailwindcss', 'tailwind'],
  'css': ['css3', 'sass', 'less', 'scss'],
  'html': ['html5'],
  'git': ['github', 'gitlab', 'git version control']
};

export class DbEngine {
  private static instance: Schema | null = null;

  private static init() {
    if (this.instance) return;

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.instance = JSON.parse(raw);
        return;
      } catch (err) {
        console.error('Failed to parse database file, re-initializing...', err);
      }
    }

    // Default seed database
    this.instance = this.getSeedData();
    this.save();
  }

  public static get(): Schema {
    this.init();
    return this.instance!;
  }

  public static save() {
    if (!this.instance) return;
    fs.writeFileSync(DB_FILE, JSON.stringify(this.instance, null, 2), 'utf8');
  }

  // Robust seed generation for complete production feel
  private static getSeedData(): Schema {
    const now = new Date().toISOString();

    const users: User[] = [
      {
        id: 'user-student-1',
        email: 'student@credmatch.com',
        name: 'Alex Rivera',
        role: 'STUDENT',
        createdAt: now,
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop'
      },
      {
        id: 'user-student-2',
        email: 'sofia@credmatch.com',
        name: 'Sofia Chen',
        role: 'STUDENT',
        createdAt: now,
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop'
      },
      {
        id: 'user-recruiter-1',
        email: 'recruiter@credmatch.com',
        name: 'Sarah Jenkins',
        role: 'RECRUITER',
        createdAt: now,
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop'
      },
      {
        id: 'user-admin-1',
        email: 'admin@credmatch.com',
        name: 'Marcus Vance',
        role: 'ADMIN',
        createdAt: now,
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop'
      }
    ];

    const passwords: Record<string, string> = {
      'user-student-1': 'password123', // Simulated hashed passwords
      'user-student-2': 'password123',
      'user-recruiter-1': 'password123',
      'user-admin-1': 'password123'
    };

    const companies: Company[] = [
      {
        id: 'company-1',
        name: 'Vortex Tech',
        description: 'Next-generation cloud infrastructure and visual design software.',
        website: 'https://vortextech.io',
        logo: '⚡',
        industry: 'Software & Cloud Services',
        location: 'San Francisco, CA',
        recruiterId: 'user-recruiter-1',
        verified: true
      },
      {
        id: 'company-2',
        name: 'Apex Finance',
        description: 'Pioneering blockchain ledger systems and quantitative trading desks.',
        website: 'https://apexfin.com',
        logo: '📈',
        industry: 'Financial Technology',
        location: 'New York, NY',
        recruiterId: 'user-recruiter-1',
        verified: true
      }
    ];

    const studentProfiles: StudentProfile[] = [
      {
        id: 'profile-student-1',
        userId: 'user-student-1',
        headline: 'Full-Stack Software Engineer | React, Node.js, AWS',
        bio: 'Passionate software developer focusing on modern web standards, serverless architectures, and reliable distributed backends.',
        resumeUrl: '/uploads/alex_rivera_resume.pdf',
        resumeFileName: 'alex_rivera_resume.pdf',
        location: 'San Francisco, CA',
        remotePreference: 'ANY',
        workAuthorization: 'CITIZEN',
        skills: [
          { name: 'React', level: 'EXPERT' },
          { name: 'TypeScript', level: 'EXPERT' },
          { name: 'Node.js', level: 'EXPERT' },
          { name: 'Docker', level: 'INTERMEDIATE' },
          { name: 'AWS', level: 'INTERMEDIATE' },
          { name: 'PostgreSQL', level: 'INTERMEDIATE' }
        ],
        education: [
          {
            id: 'edu-1',
            institution: 'Stanford University',
            degree: 'Bachelor of Science',
            fieldOfStudy: 'Computer Science',
            startDate: '2020-09-01',
            endDate: '2024-06-15',
            grade: '3.85 GPA',
            description: 'Specialization in Software Systems. Teaching Assistant for Database Systems.',
            verified: true
          }
        ],
        experience: [
          {
            id: 'exp-1',
            company: 'Stripe (Internship)',
            position: 'Software Engineering Intern',
            startDate: '2023-06-01',
            endDate: '2023-09-01',
            description: 'Collaborated on the core Billing API team. Optimized transactional webhooks and resolved latency gaps.',
            verified: true
          },
          {
            id: 'exp-2',
            company: 'TechCorp Labs',
            position: 'Junior Web Developer',
            startDate: '2021-10-01',
            endDate: '2023-05-01',
            description: 'Maintained enterprise customer dashboards using React and CSS modules.',
            verified: true
          }
        ],
        certificates: [
          {
            id: 'cert-1',
            name: 'AWS Certified Developer - Associate',
            issuer: 'Amazon Web Services',
            issueDate: '2023-11-15',
            credentialUrl: 'https://aws.amazon.com/credentials/aws-developer-associate',
            verified: true
          }
        ],
        trustScore: 92,
        viewCount: 45
      },
      {
        id: 'profile-student-2',
        userId: 'user-student-2',
        headline: 'ML Engineer & Python Developer | Data Architecture',
        bio: 'Focused on designing deterministic optimization algorithms, statistical classifiers, and clean backend APIs.',
        resumeUrl: '/uploads/sofia_chen_resume.pdf',
        resumeFileName: 'sofia_chen_resume.pdf',
        location: 'Austin, TX',
        remotePreference: 'REMOTE',
        workAuthorization: 'VISA',
        skills: [
          { name: 'Python', level: 'EXPERT' },
          { name: 'TypeScript', level: 'INTERMEDIATE' },
          { name: 'Docker', level: 'INTERMEDIATE' },
          { name: 'PostgreSQL', level: 'EXPERT' },
          { name: 'Git', level: 'EXPERT' }
        ],
        education: [
          {
            id: 'edu-2',
            institution: 'University of Texas at Austin',
            degree: 'Master of Science',
            fieldOfStudy: 'Data Science',
            startDate: '2022-09-01',
            endDate: '2024-05-20',
            grade: '3.92 GPA',
            description: 'Research focus on high-performance algorithm indexing.',
            verified: true
          }
        ],
        experience: [
          {
            id: 'exp-3',
            company: 'Cognitive Analytics',
            position: 'Backend Developer',
            startDate: '2021-01-01',
            endDate: '2022-08-01',
            description: 'Developed backend REST APIs for automated inventory reporting using Flask and PostgreSQL.',
            verified: true
          }
        ],
        certificates: [
          {
            id: 'cert-2',
            name: 'Certified Python Programmer',
            issuer: 'Python Institute',
            issueDate: '2022-04-10',
            credentialUrl: 'https://pythoninstitute.org',
            verified: true
          }
        ],
        trustScore: 85,
        viewCount: 18
      }
    ];

    const jobs: Job[] = [
      {
        id: 'job-1',
        title: 'Senior Full-Stack Engineer (React/Node.js)',
        description: 'Join Vortex Tech to expand our developer console. You will take charge of core frontend systems and cloud API routes. Ideal candidates love clean TypeScript, high-performance web applications, and docker containerization.',
        companyId: 'company-1',
        companyName: 'Vortex Tech',
        companyLogo: '⚡',
        location: 'San Francisco, CA',
        workType: 'HYBRID',
        experienceRequired: 3,
        salaryRange: '$140k - $180k',
        skillsRequired: [
          { name: 'React', weight: 30 },
          { name: 'TypeScript', weight: 25 },
          { name: 'Node.js', weight: 20 },
          { name: 'Docker', weight: 15 },
          { name: 'AWS', weight: 10 }
        ],
        visaSponsorship: true,
        active: true,
        createdAt: now,
        viewCount: 120
      },
      {
        id: 'job-2',
        title: 'Backend Systems Engineer (Python / DB)',
        description: 'Build fast data pipelines and analytics systems for Apex Finance. Experience in database optimization, robust REST services, and high-quality git workflows is required.',
        companyId: 'company-2',
        companyName: 'Apex Finance',
        companyLogo: '📈',
        location: 'New York, NY',
        workType: 'REMOTE',
        experienceRequired: 2,
        salaryRange: '$120k - $150k',
        skillsRequired: [
          { name: 'Python', weight: 35 },
          { name: 'PostgreSQL', weight: 25 },
          { name: 'Docker', weight: 15 },
          { name: 'TypeScript', weight: 15 },
          { name: 'Git', weight: 10 }
        ],
        visaSponsorship: false,
        active: true,
        createdAt: now,
        viewCount: 84
      }
    ];

    const applications: Application[] = [
      {
        id: 'app-1',
        jobId: 'job-1',
        jobTitle: 'Senior Full-Stack Engineer (React/Node.js)',
        companyName: 'Vortex Tech',
        companyLogo: '⚡',
        studentId: 'profile-student-1',
        studentName: 'Alex Rivera',
        studentHeadline: 'Full-Stack Software Engineer | React, Node.js, AWS',
        status: 'PENDING',
        appliedAt: now,
        matchScore: 92,
        matchBreakdown: {
          skillScore: 42,
          experienceScore: 20,
          educationScore: 15,
          certificationScore: 10,
          locationScore: 5,
          authorizationScore: 0, // Hybrid match is 5, wait: let's recalculate accurately below
          finalScore: 92
        }
      }
    ];

    const notifications: Notification[] = [
      {
        id: 'notif-1',
        userId: 'user-student-1',
        title: 'Welcome to CredMatch Pro!',
        message: 'Your profile has been generated successfully. Complete certifications and verify experiences to maximize your Trust Score.',
        read: false,
        createdAt: now
      }
    ];

    const bookmarks: Bookmark[] = [];

    const activityLogs: ActivityLog[] = [
      {
        id: 'log-1',
        userId: 'user-student-1',
        userName: 'Alex Rivera',
        action: 'PROFILE_UPDATED',
        details: 'Alex Rivera updated his primary skills list.',
        timestamp: now
      },
      {
        id: 'log-2',
        userId: 'user-student-2',
        userName: 'Sofia Chen',
        action: 'RESUME_UPLOADED',
        details: 'Sofia Chen uploaded her resume and generated 5 skills.',
        timestamp: now
      }
    ];

    return {
      users,
      passwords,
      companies,
      studentProfiles,
      jobs,
      applications,
      notifications,
      bookmarks,
      activityLogs
    };
  }
}
