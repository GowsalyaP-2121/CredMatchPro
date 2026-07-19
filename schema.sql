-- CredMatch Pro Relational MySQL Database Schema (Production Ready)
-- Normalization: 3NF Compliance
-- Primary Keys, Foreign Keys, Cascade Constraints, Indexes

CREATE DATABASE IF NOT EXISTS credmatch_pro;
USE credmatch_pro;

-- -----------------------------------------------------
-- Table: users
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  role ENUM('STUDENT', 'RECRUITER', 'ADMIN') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  avatar_url VARCHAR(255) NULL,
  PRIMARY KEY (id),
  INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table: passwords
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS passwords (
  user_id VARCHAR(50) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  PRIMARY KEY (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table: companies
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS companies (
  id VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT NULL,
  website VARCHAR(100) NULL,
  logo VARCHAR(10) NULL,
  industry VARCHAR(100) NULL,
  location VARCHAR(100) NULL,
  recruiter_id VARCHAR(50) NOT NULL UNIQUE,
  verified BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (id),
  FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_company_recruiter (recruiter_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table: student_profiles
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS student_profiles (
  id VARCHAR(50) NOT NULL,
  user_id VARCHAR(50) NOT NULL UNIQUE,
  headline VARCHAR(255) NULL,
  bio TEXT NULL,
  resume_url VARCHAR(255) NULL,
  resume_file_name VARCHAR(255) NULL,
  location VARCHAR(100) NULL,
  remote_preference ENUM('REMOTE', 'HYBRID', 'ON_SITE', 'ANY') DEFAULT 'ANY',
  work_authorization ENUM('CITIZEN', 'VISA', 'REQUIRE_SPONSORSHIP') DEFAULT 'CITIZEN',
  trust_score INT DEFAULT 0,
  view_count INT DEFAULT 0,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_student_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table: skills
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS skills (
  student_id VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  level ENUM('BEGINNER', 'INTERMEDIATE', 'EXPERT') DEFAULT 'INTERMEDIATE',
  PRIMARY KEY (student_id, name),
  FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
  INDEX idx_skill_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table: educations
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS educations (
  id VARCHAR(50) NOT NULL,
  student_id VARCHAR(50) NOT NULL,
  institution VARCHAR(150) NOT NULL,
  degree VARCHAR(100) NOT NULL,
  field_of_study VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  grade VARCHAR(50) NULL,
  description TEXT NULL,
  verified BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (id),
  FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
  INDEX idx_edu_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table: experiences
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS experiences (
  id VARCHAR(50) NOT NULL,
  student_id VARCHAR(50) NOT NULL,
  company VARCHAR(150) NOT NULL,
  position VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date VARCHAR(50) NOT NULL, -- e.g. ISO date or 'Present'
  description TEXT NULL,
  verified BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (id),
  FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
  INDEX idx_exp_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table: certificates
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS certificates (
  id VARCHAR(50) NOT NULL,
  student_id VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  issuer VARCHAR(150) NOT NULL,
  issue_date DATE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (id),
  FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
  INDEX idx_cert_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table: jobs
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS jobs (
  id VARCHAR(50) NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  company_id VARCHAR(50) NOT NULL,
  location VARCHAR(100) NOT NULL,
  work_type ENUM('REMOTE', 'HYBRID', 'ON_SITE') DEFAULT 'REMOTE',
  experience_required INT DEFAULT 0,
  salary_range VARCHAR(50) NULL,
  visa_sponsorship BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  view_count INT DEFAULT 0,
  PRIMARY KEY (id),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  INDEX idx_job_company (company_id),
  INDEX idx_job_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table: job_skills
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS job_skills (
  job_id VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  weight INT NOT NULL DEFAULT 20, -- relative matching weights
  PRIMARY KEY (job_id, name),
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table: applications
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS applications (
  id VARCHAR(50) NOT NULL,
  job_id VARCHAR(50) NOT NULL,
  student_id VARCHAR(50) NOT NULL,
  status ENUM('PENDING', 'SHORTLISTED', 'REJECTED', 'OFFERED') DEFAULT 'PENDING',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  match_score INT NOT NULL,
  match_breakdown JSON NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY unique_job_student (job_id, student_id),
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
  INDEX idx_app_job (job_id),
  INDEX idx_app_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table: bookmarks
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS bookmarks (
  id VARCHAR(50) NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  job_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_user_bookmark (user_id, job_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table: notifications
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(50) NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  `read` BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notif_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table: activity_logs
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_logs (
  id VARCHAR(50) NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
