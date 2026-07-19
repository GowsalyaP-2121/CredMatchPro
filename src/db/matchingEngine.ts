/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StudentProfile, Job, MatchBreakdown, OpportunityGap, MatchResult, Skill } from '../types';
import { SKILL_SYNONYMS } from './dbEngine';

// Parse ISO date string or return current year for "Present"
function getYearDifference(startStr: string, endStr: string): number {
  const start = new Date(startStr);
  const end = endStr.toLowerCase() === 'present' ? new Date() : new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  return Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

// Normalize skill name to ignore casing and minor spacing, checking synonym groups
export function normalizeSkill(skillName: string): string {
  const clean = skillName.trim().toLowerCase();
  for (const [canonical, synonyms] of Object.entries(SKILL_SYNONYMS)) {
    if (canonical === clean || synonyms.includes(clean)) {
      return canonical;
    }
  }
  return clean;
}

// Check if candidate possesses a skill (or synonym)
export function findCandidateSkill(candidateSkills: Skill[], targetSkillName: string): Skill | undefined {
  const normTarget = normalizeSkill(targetSkillName);
  return candidateSkills.find(s => normalizeSkill(s.name) === normTarget);
}

// Calculate the full breakdown of match scores deterministically
export function calculateMatchScore(profile: StudentProfile, job: Job): MatchResult {
  // 1. Skill Match Score (45%)
  let matchedSkillWeightSum = 0;
  let totalJobSkillWeightSum = 0;
  const missingSkills: { name: string; weight: number }[] = [];

  job.skillsRequired.forEach(req => {
    totalJobSkillWeightSum += req.weight;
    const found = findCandidateSkill(profile.skills, req.name);

    if (found) {
      // Proficiency weight modifier
      let modifier = 1.0;
      if (found.level === 'INTERMEDIATE') modifier = 0.8;
      else if (found.level === 'BEGINNER') modifier = 0.6;
      matchedSkillWeightSum += req.weight * modifier;
    } else {
      missingSkills.push({ name: req.name, weight: req.weight });
    }
  });

  const skillFactor = totalJobSkillWeightSum > 0 ? (matchedSkillWeightSum / totalJobSkillWeightSum) : 1.0;
  const skillScore = Math.round(skillFactor * 45 * 10) / 10;

  // 2. Experience Score (20%)
  let totalYearsOfExp = 0;
  profile.experience.forEach(exp => {
    totalYearsOfExp += getYearDifference(exp.startDate, exp.endDate);
  });

  let experienceScore = 0;
  if (job.experienceRequired <= 0) {
    experienceScore = 20;
  } else {
    const ratio = totalYearsOfExp / job.experienceRequired;
    experienceScore = Math.round(Math.min(20, ratio * 20) * 10) / 10;
  }

  // 3. Education Score (15%)
  let educationScore = 0;
  profile.education.forEach(edu => {
    let baseEduPoints = 0;
    const degree = edu.degree.toLowerCase();

    if (degree.includes('phd') || degree.includes('doctorate') || degree.includes('master')) {
      baseEduPoints = 15;
    } else if (degree.includes('bachelor') || degree.includes('bs') || degree.includes('ba')) {
      baseEduPoints = 12;
    } else if (degree.includes('associate') || degree.includes('diploma')) {
      baseEduPoints = 8;
    } else {
      baseEduPoints = 5;
    }

    // Unverified education gets a slight discount penalty (trust factor)
    const eduPoints = edu.verified ? baseEduPoints : baseEduPoints * 0.85;
    if (eduPoints > educationScore) {
      educationScore = Math.round(eduPoints * 10) / 10;
    }
  });

  // 4. Certification Score (10%)
  let certificationScore = 0;
  profile.certificates.forEach(cert => {
    const certPoints = cert.verified ? 5 : 4; // slight penalty if unverified
    certificationScore += certPoints;
  });
  certificationScore = Math.min(10, certificationScore);

  // 5. Location Compatibility Score (5%)
  let locationScore = 0;
  if (job.workType === 'REMOTE') {
    if (profile.remotePreference === 'REMOTE' || profile.remotePreference === 'ANY') {
      locationScore = 5;
    } else if (profile.remotePreference === 'HYBRID') {
      locationScore = 4;
    } else {
      locationScore = 2;
    }
  } else {
    // Hybrid / On-Site
    const jobLocLower = job.location.toLowerCase();
    const candidateLocLower = profile.location.toLowerCase();

    if (jobLocLower === candidateLocLower) {
      locationScore = 5;
    } else if (
      jobLocLower.split(',')[1]?.trim() === candidateLocLower.split(',')[1]?.trim() &&
      jobLocLower.split(',')[1]?.trim() !== undefined
    ) {
      // Same State
      locationScore = 3.5;
    } else if (profile.remotePreference === 'ANY' || profile.remotePreference === 'HYBRID') {
      locationScore = 2;
    } else {
      locationScore = 0;
    }
  }

  // 6. Work Authorization Compatibility Score (5%)
  let authorizationScore = 0;
  if (job.visaSponsorship) {
    // If the job sponsors visas, anyone matches perfectly
    authorizationScore = 5;
  } else {
    // No sponsorship
    if (profile.workAuthorization === 'CITIZEN' || profile.workAuthorization === 'VISA') {
      // already authorized
      authorizationScore = 5;
    } else {
      // requires sponsorship, job does not sponsor
      authorizationScore = 0;
    }
  }

  const rawFinal = skillScore + experienceScore + educationScore + certificationScore + locationScore + authorizationScore;
  const finalScore = Math.round(Math.min(100, rawFinal) * 10) / 10;

  const breakdown: MatchBreakdown = {
    skillScore,
    experienceScore,
    educationScore,
    certificationScore,
    locationScore,
    authorizationScore,
    finalScore
  };

  // Opportunity Gap calculations
  const missingWithImpact = missingSkills.map(missing => {
    // Calculate potential contribution to skill score
    // Added skill is assumed to be EXPERT (1.0 modifier)
    const normalizedWeight = reqWeightNormalization(job, missing.weight);
    const scoreImpact = Math.round((normalizedWeight * 45) * 10) / 10;
    return { name: missing.name, weight: scoreImpact };
  });

  // Recommend learning order based on maximum immediate score impact (highest weight first)
  const sortedMissing = [...missingWithImpact].sort((a, b) => b.weight - a.weight);
  const recommendedOrder = sortedMissing.map(m => m.name);

  // Total estimate of score improvement if all missing skills are acquired at expert level
  let totalMissingWeight = 0;
  missingSkills.forEach(m => totalMissingWeight += m.weight);
  const maxSkillsPossibleScore = 45;
  const missingSkillsFactor = totalJobSkillWeightSum > 0 ? (totalMissingWeight / totalJobSkillWeightSum) : 0;
  const scoreImprovementIfLearned = Math.round(missingSkillsFactor * 45 * 10) / 10;

  const opportunityGap: OpportunityGap = {
    missingSkills: sortedMissing,
    scoreImprovementIfLearned,
    recommendedOrder
  };

  return {
    jobId: job.id,
    studentId: profile.id,
    score: finalScore,
    breakdown,
    opportunityGap
  };
}

function reqWeightNormalization(job: Job, targetWeight: number): number {
  const sum = job.skillsRequired.reduce((acc, curr) => acc + curr.weight, 0);
  return sum > 0 ? (targetWeight / sum) : 0;
}

// Trust Score Calculator
// Completeness: bio(10) + avatar(10) + location(10) + skills(20) + edu(20) + exp(20) + certs(10) = 100
// Verified bonus additions up to 100 max
export function calculateTrustScore(profile: StudentProfile, avatarUrl?: string): number {
  let score = 0;

  if (profile.bio?.trim()) score += 10;
  if (avatarUrl || profile.resumeUrl) score += 10;
  if (profile.location?.trim()) score += 10;
  if (profile.skills && profile.skills.length > 0) score += 20;
  if (profile.education && profile.education.length > 0) score += 20;
  if (profile.experience && profile.experience.length > 0) score += 20;
  if (profile.certificates && profile.certificates.length > 0) score += 10;

  // Add verification bonuses
  let verifiedMultiplier = 1.0;
  const totalVerifiables = profile.education.length + profile.experience.length + profile.certificates.length;
  if (totalVerifiables > 0) {
    const verifiedOnes =
      profile.education.filter(e => e.verified).length +
      profile.experience.filter(e => e.verified).length +
      profile.certificates.filter(c => c.verified).length;

    const ratio = verifiedOnes / totalVerifiables;
    verifiedMultiplier = 0.8 + ratio * 0.2; // 20% weight on verifiable components
  }

  return Math.min(100, Math.round(score * verifiedMultiplier));
}
