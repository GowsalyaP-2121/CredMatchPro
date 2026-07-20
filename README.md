# 🚀 CredMatch Pro

> **Transparent Skill-Based Hiring Platform**

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.0-green?logo=springboot)
![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)
![MySQL](https://img.shields.io/badge/MySQL-8-blue?logo=mysql)
![JWT](https://img.shields.io/badge/JWT-Authentication-red)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📌 Overview

CredMatch Pro is a production-ready, enterprise-grade job matching platform that connects students and recruiters using a transparent, deterministic matching engine. Instead of relying on Large Language Models (LLMs), the platform uses explainable algorithms to provide accurate, reproducible, and fair candidate-job matching.

The platform enables students to create professional profiles, upload resumes, analyze skill gaps, receive personalized job recommendations, and track applications in real time. Recruiters can post jobs, evaluate candidates, monitor hiring analytics, and shortlist top talent through intelligent ranking dashboards.

---

# ✨ Key Features

## 👨‍🎓 Student Portal

- Secure Registration & Login
- Resume Upload & Parsing
- Profile Management
- Education & Experience Management
- Skills & Certifications
- Job Recommendations
- Match Score Analysis
- Trust Score
- Opportunity Gap Analyzer
- Skill Impact Simulator
- Bookmark Jobs
- Application Tracking
- Live Notifications

---

## 🏢 Recruiter Portal

- Company Management
- Job Posting
- Applicant Management
- Candidate Ranking
- Hiring Funnel
- Analytics Dashboard
- Live Notifications
- Shortlisting

---

## 👨‍💼 Admin Portal

- User Management
- Recruiter Management
- Company Verification
- Platform Analytics
- Activity Logs
- Dashboard Reports

---

# 🎯 Matching Engine (No LLM)

This platform **does not call any LLM APIs**.

No OpenAI

No Gemini

No Claude

No LangChain

No RAG

No Embeddings

No Vector Database

Instead, matching is performed using deterministic algorithms.

### Matching Pipeline

Resume Parsing

↓

Skill Normalization

↓

Eligibility Validation

↓

Weighted Skill Matching

↓

Education Evaluation

↓

Experience Evaluation

↓

Certification Evaluation

↓

Location Compatibility

↓

Work Authorization Check

↓

Final Match Score

---

# 📊 Match Score Formula

| Component | Weight |
|-----------|--------|
| Skill Match | 45% |
| Experience | 20% |
| Education | 15% |
| Certifications | 10% |
| Location | 5% |
| Work Authorization | 5% |

Total = **100%**

---

# 🧮 Algorithms Used

- Weighted Jaccard Similarity
- Cosine Similarity
- TF-IDF Skill Weighting
- Rule-Based Eligibility Engine
- Skill Synonym Dictionary
- Content-Based Recommendation
- Collaborative Filtering
- Priority Queue Ranking
- Resume Duplicate Detection

---

# ⭐ Unique Features

## Opportunity Gap Analyzer

Shows missing skills and predicts how much the candidate's score will improve after learning them.

---

## Skill Impact Simulator

Example:

Current Match Score

72%

↓

Learn Docker

↓

Predicted Match Score

88%

---

## Recruiter Competition Meter

Displays live candidate rankings for every job opening.

---

## Trust Score

Evaluates profile credibility based on:

- Resume Completeness
- Verified Education
- Verified Certifications
- Profile Completion
- Experience Consistency

---

## Real-Time Features

- Live Application Updates
- Live Notifications
- Real-Time Candidate Rankings
- Dashboard Updates
- WebSocket Communication

---

# 🏗️ Tech Stack

## Frontend

- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- React Router
- React Query
- Axios
- Recharts

---

## Backend

- Java 21
- Spring Boot 3
- Spring Security
- JWT Authentication
- Spring Data JPA
- Hibernate
- REST APIs
- Swagger
- WebSocket
- Lombok

---

## Database

- MySQL 8

---

## DevOps

- Docker
- Docker Compose
- Vercel
- Render
- Railway MySQL

---

# 📂 Project Structure

```
CredMatchPro
│
├── frontend
│   ├── src
│   ├── components
│   ├── pages
│   ├── services
│   ├── hooks
│   └── assets
│
├── backend
│   ├── controller
│   ├── service
│   ├── repository
│   ├── model
│   ├── dto
│   ├── security
│   ├── algorithm
│   ├── websocket
│   └── config
│
├── database
│   ├── schema.sql
│   └── seed.sql
│
├── docs
│
├── docker-compose.yml
│
└── README.md
```

---

# 🗄️ Database

Main Tables

- Users
- Roles
- Companies
- Jobs
- Applications
- Skills
- CandidateSkills
- Resume
- Education
- Experience
- Certificates
- Notifications
- Analytics
- ActivityLogs

---

# 🔐 Security

- JWT Authentication
- BCrypt Password Encryption
- Role-Based Authorization
- Input Validation
- Secure REST APIs
- Global Exception Handling

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/GowsalyaP-2121/CredMatchPro.git
```

## Backend

```bash
cd backend
./mvnw spring-boot:run
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

---

# 📸 Screenshots

> Add screenshots here after completing the UI.

- Landing Page
- Student Dashboard
- Recruiter Dashboard
- Admin Dashboard
- Job Matching
- Analytics

---

# 📖 Documentation

- Architecture Diagram
- ER Diagram
- API Documentation (Swagger)
- Database Schema
- Deployment Guide

---

# 🎯 Future Enhancements

- Multi-language Support
- Email Notifications
- Interview Scheduling
- Resume Versioning
- AI-assisted Resume Review (Optional Future Enhancement)

---

# 👥 Team

Built for **CredX Hiring Hackathon 2.0**

---

# Demo video

drive link : https://drive.google.com/drive/folders/1VJxx9udlYA4HtgFhrmJ6Zs-KR9lQNOB4?usp=drive_link

# 📄 License

This project is licensed under the MIT License.

---

## ⭐ If you like this project, don't forget to star the repository!



