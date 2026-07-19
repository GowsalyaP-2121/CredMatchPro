/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'STUDENT' | 'RECRUITER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  avatarUrl?: string;
}

export interface Company {
  id: string;
  name: string;
  description: string;
  website: string;
  logo: string;
  industry: string;
  location: string;
  recruiterId: string;
  verified: boolean;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  grade?: string;
  description?: string;
  verified: boolean;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string; // 'Present' or ISO date
  description?: string;
  verified: boolean;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialUrl?: string;
  verified: boolean;
}

export interface Skill {
  name: string;
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';
}

export interface StudentProfile {
  id: string;
  userId: string;
  headline: string;
  bio: string;
  resumeUrl?: string;
  resumeFileName?: string;
  location: string;
  remotePreference: 'REMOTE' | 'HYBRID' | 'ON_SITE' | 'ANY';
  workAuthorization: 'CITIZEN' | 'VISA' | 'REQUIRE_SPONSORSHIP';
  skills: Skill[];
  education: Education[];
  experience: Experience[];
  certificates: Certificate[];
  trustScore: number; // calculated profile completeness + verification
  viewCount: number;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  location: string;
  workType: 'REMOTE' | 'HYBRID' | 'ON_SITE';
  experienceRequired: number; // in years
  salaryRange: string;
  skillsRequired: { name: string; weight: number }[]; // weights sum to 1.0 or integers
  visaSponsorship: boolean;
  active: boolean;
  createdAt: string;
  viewCount: number;
}

export type ApplicationStatus = 'PENDING' | 'SHORTLISTED' | 'REJECTED' | 'OFFERED';

export interface MatchBreakdown {
  skillScore: number;         // out of 45
  experienceScore: number;    // out of 20
  educationScore: number;     // out of 15
  certificationScore: number; // out of 10
  locationScore: number;      // out of 5
  authorizationScore: number; // out of 5
  finalScore: number;         // out of 100
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyLogo?: string;
  studentId: string;
  studentName: string;
  studentHeadline: string;
  status: ApplicationStatus;
  appliedAt: string;
  matchScore: number;
  matchBreakdown: MatchBreakdown;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  jobId: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface OpportunityGap {
  missingSkills: { name: string; weight: number }[];
  scoreImprovementIfLearned: number; // how much finalScore increases
  recommendedOrder: string[];
}

export interface MatchResult {
  jobId: string;
  studentId: string;
  score: number;
  breakdown: MatchBreakdown;
  opportunityGap: OpportunityGap;
}

export interface LeaderboardEntry {
  studentId: string;
  studentName: string;
  headline: string;
  skills: string[];
  trustScore: number;
  averageMatchScore: number;
  rank: number;
}

export interface AnalyticsSummary {
  totalStudents: number;
  totalRecruiters: number;
  totalCompanies: number;
  totalJobs: number;
  totalApplications: number;
  averageMatchScore: number;
  applicationsByStatus: { status: ApplicationStatus; count: number }[];
  skillsInDemand: { name: string; count: number }[];
}
