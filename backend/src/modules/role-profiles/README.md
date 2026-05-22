# Role-Based Profile Service

A production-grade, enterprise-level role-based profile system for Node.js + Express + TypeScript backend using PostgreSQL. This module provides a flexible, scalable profile architecture similar to LinkedIn + SaaS CRM hybrid where each role has a customized profile experience.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [User Roles](#user-roles)
- [API Endpoints](#api-endpoints)
- [Request/Response Examples](#requestresponse-examples)
- [Installation](#installation)
- [Usage](#usage)
- [Business Rules](#business-rules)

## 🎯 Overview

This system supports 5 user roles with centralized profile management but role-based dynamic fields:

1. **Admin** - Platform administrators
2. **Student** - Current students
3. **Alumni** - Graduated students
4. **Recruiter** - Company HR professionals
5. **Donor** - Philanthropists/sponsors

### Core Concept

- Every user has exactly **one profile** (1:1 relationship)
- Profile structure changes based on user role
- Some fields are optional or hidden depending on role
- Centralized backend with flexible JSONB storage

## ✨ Features

- ✅ Role-based dynamic profile structure
- ✅ Flexible JSONB-based PostgreSQL storage
- ✅ Comprehensive validation with Zod
- ✅ Activity tracking for all profiles
- ✅ Search and pagination support
- ✅ Type-safe TypeScript interfaces
- ✅ RESTful API design
- ✅ Business rule enforcement
- ✅ Profile statistics and analytics

## 🏗️ Architecture

```
role-profiles/
├── role-profiles.types.ts      # TypeScript interfaces and types
├── role-profiles.schema.ts     # Zod validation schemas
├── role-profiles.repository.ts # Database operations
├── role-profiles.service.ts    # Business logic
├── role-profiles.controller.ts # HTTP request handlers
├── role-profiles.routes.ts     # API route definitions
└── README.md                   # Documentation
```

## 🗄️ Database Schema

### Table: `role_based_profiles`

```sql
CREATE TABLE role_based_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  role primary_role NOT NULL,
  common_fields JSONB NOT NULL DEFAULT '{}',
  role_specific_data JSONB NOT NULL DEFAULT '{}',
  activity_logs JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Indexes

- `idx_role_profiles_user_id` - Fast user lookup
- `idx_role_profiles_role` - Role-based queries
- `idx_role_profiles_created_at` - Sorting by creation date
- `idx_role_profiles_common_fields` - GIN index for JSONB search
- `idx_role_profiles_role_specific_data` - GIN index for role data search
- `idx_role_profiles_activity_logs` - GIN index for activity search

## 👥 User Roles

### Common Profile Fields (All Roles)

```typescript
{
  name: string;
  email: string;
  profilePhoto?: string;
  bio?: string;
  location?: string;
}
```

### 🎓 Student Profile

```typescript
{
  skills: string[];
  education: EducationDetail[];
  projects: StudentProject[];
  interests: string[];
  internshipAvailable: boolean;
  internshipExperience: InternshipExperience[]; // Only if internshipAvailable = true
}
```

**Business Rule**: If `internshipAvailable = false`, `internshipExperience` must be empty.

### 🎯 Alumni Profile

```typescript
{
  skills: string[];
  workExperience: WorkExperience[];
  education: EducationDetail[];
  achievements: Achievement[];
  interests: string[];
  graduationYear?: number;
  currentCompany?: string;
  currentDesignation?: string;
}
```

### 🧑‍💼 Recruiter Profile

```typescript
{
  companyName: string;
  designation: string;
  hiringRoles: string[];
  industry: string;
  companyDetails?: CompanyDetails;
  postedJobs?: string[];
  yearsInRecruitment?: number;
}
```

### 👨‍💼 Admin Profile

```typescript
{
  department: string;
  permissions: string[];
  systemAccessLevel: 'full' | 'limited' | 'read-only';
  managedModules?: string[];
  adminNotes?: string;
}
```

### 🤝 Donor Profile

```typescript
{
  organizationName?: string;
  contributionHistory: ContributionHistory[];
  interests: string[];
  donationType: 'individual' | 'corporate' | 'foundation';
  engagementActivity: string[];
  totalContributed?: number;
  preferredCauses?: string[];
}
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/role-profiles` | Create a new profile |
| GET | `/api/role-profiles` | Get all profiles (paginated) |
| GET | `/api/role-profiles/stats` | Get profile statistics |
| GET | `/api/role-profiles/search` | Search profiles |
| GET | `/api/role-profiles/role/:role` | Get profiles by role |
| GET | `/api/role-profiles/user/:userId` | Get profile by user ID |
| GET | `/api/role-profiles/user/:userId/exists` | Check if profile exists |
| GET | `/api/role-profiles/:profileId` | Get profile by profile ID |
| PUT | `/api/role-profiles/user/:userId` | Update profile |
| POST | `/api/role-profiles/user/:userId/activity` | Add activity log |
| DELETE | `/api/role-profiles/user/:userId` | Delete profile |

## 📝 Request/Response Examples

### 1. Create Student Profile

**Request:**
```http
POST /api/role-profiles
Content-Type: application/json

{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "role": "student",
  "commonFields": {
    "name": "John Doe",
    "email": "john.doe@university.edu",
    "profilePhoto": "https://example.com/photo.jpg",
    "bio": "Computer Science student passionate about AI",
    "location": "San Francisco, CA"
  },
  "roleSpecificData": {
    "skills": ["JavaScript", "Python", "React", "Node.js"],
    "education": [
      {
        "institution": "Stanford University",
        "degree": "Bachelor of Science",
        "fieldOfStudy": "Computer Science",
        "startYear": 2020,
        "endYear": 2024,
        "grade": "3.8 GPA"
      }
    ],
    "projects": [
      {
        "title": "AI Chatbot",
        "description": "Built an AI-powered chatbot using GPT-3",
        "technologies": ["Python", "OpenAI", "Flask"],
        "link": "https://github.com/johndoe/ai-chatbot",
        "startDate": "2023-01",
        "endDate": "2023-06"
      }
    ],
    "interests": ["Machine Learning", "Web Development", "Startups"],
    "internshipAvailable": true,
    "internshipExperience": [
      {
        "company": "Tech Corp",
        "role": "Software Engineering Intern",
        "duration": "3 months",
        "description": "Developed REST APIs using Node.js"
      }
    ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile created successfully",
  "data": {
    "id": "987e6543-e21b-12d3-a456-426614174999",
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "role": "student",
    "commonFields": {
      "name": "John Doe",
      "email": "john.doe@university.edu",
      "profilePhoto": "https://example.com/photo.jpg",
      "bio": "Computer Science student passionate about AI",
      "location": "San Francisco, CA"
    },
    "roleSpecificData": {
      "skills": ["JavaScript", "Python", "React", "Node.js"],
      "education": [...],
      "projects": [...],
      "interests": ["Machine Learning", "Web Development", "Startups"],
      "internshipAvailable": true,
      "internshipExperience": [...]
    },
    "activityLogs": [
      {
        "action": "profile_created",
        "timestamp": "2024-01-15T10:30:00.000Z",
        "metadata": {
          "role": "student"
        }
      }
    ],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Create Alumni Profile

**Request:**
```http
POST /api/role-profiles
Content-Type: application/json

{
  "userId": "223e4567-e89b-12d3-a456-426614174001",
  "role": "alumni",
  "commonFields": {
    "name": "Jane Smith",
    "email": "jane.smith@gmail.com",
    "profilePhoto": "https://example.com/jane.jpg",
    "bio": "Senior Software Engineer at Google",
    "location": "Mountain View, CA"
  },
  "roleSpecificData": {
    "skills": ["Java", "Kubernetes", "Microservices", "System Design"],
    "workExperience": [
      {
        "company": "Google",
        "designation": "Senior Software Engineer",
        "startDate": "2020-06",
        "description": "Leading backend infrastructure team",
        "location": "Mountain View, CA"
      },
      {
        "company": "Facebook",
        "designation": "Software Engineer",
        "startDate": "2018-07",
        "endDate": "2020-05",
        "description": "Worked on News Feed optimization",
        "location": "Menlo Park, CA"
      }
    ],
    "education": [
      {
        "institution": "MIT",
        "degree": "Master of Science",
        "fieldOfStudy": "Computer Science",
        "startYear": 2016,
        "endYear": 2018,
        "grade": "4.0 GPA"
      }
    ],
    "achievements": [
      {
        "title": "Best Paper Award",
        "description": "Published research on distributed systems",
        "date": "2019-08",
        "category": "Research"
      }
    ],
    "interests": ["Distributed Systems", "Cloud Computing", "Mentorship"],
    "graduationYear": 2018,
    "currentCompany": "Google",
    "currentDesignation": "Senior Software Engineer"
  }
}
```

### 3. Create Recruiter Profile

**Request:**
```http
POST /api/role-profiles
Content-Type: application/json

{
  "userId": "323e4567-e89b-12d3-a456-426614174002",
  "role": "recruiter",
  "commonFields": {
    "name": "Mike Johnson",
    "email": "mike.johnson@techcorp.com",
    "profilePhoto": "https://example.com/mike.jpg",
    "bio": "Tech Recruiter specializing in engineering roles",
    "location": "New York, NY"
  },
  "roleSpecificData": {
    "companyName": "TechCorp Inc.",
    "designation": "Senior Technical Recruiter",
    "hiringRoles": [
      "Software Engineer",
      "DevOps Engineer",
      "Data Scientist",
      "Product Manager"
    ],
    "industry": "Technology",
    "companyDetails": {
      "website": "https://techcorp.com",
      "size": "1000-5000 employees",
      "description": "Leading enterprise software company",
      "headquarters": "New York, NY"
    },
    "postedJobs": [],
    "yearsInRecruitment": 5
  }
}
```

### 4. Update Profile

**Request:**
```http
PUT /api/role-profiles/user/123e4567-e89b-12d3-a456-426614174000
Content-Type: application/json

{
  "commonFields": {
    "bio": "Updated bio: CS student specializing in Machine Learning"
  },
  "roleSpecificData": {
    "skills": ["JavaScript", "Python", "React", "Node.js", "TensorFlow"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "987e6543-e21b-12d3-a456-426614174999",
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "role": "student",
    "commonFields": {
      "name": "John Doe",
      "email": "john.doe@university.edu",
      "profilePhoto": "https://example.com/photo.jpg",
      "bio": "Updated bio: CS student specializing in Machine Learning",
      "location": "San Francisco, CA"
    },
    "roleSpecificData": {
      "skills": ["JavaScript", "Python", "React", "Node.js", "TensorFlow"],
      ...
    },
    "activityLogs": [
      {
        "action": "profile_created",
        "timestamp": "2024-01-15T10:30:00.000Z",
        "metadata": { "role": "student" }
      },
      {
        "action": "profile_updated",
        "timestamp": "2024-01-16T14:20:00.000Z",
        "metadata": {
          "updatedFields": ["bio", "skills"]
        }
      }
    ],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-16T14:20:00.000Z"
  }
}
```

### 5. Add Activity Log

**Request:**
```http
POST /api/role-profiles/user/123e4567-e89b-12d3-a456-426614174000/activity
Content-Type: application/json

{
  "action": "job_applied",
  "metadata": {
    "jobId": "job-12345",
    "company": "Google",
    "position": "Software Engineer Intern"
  }
}
```

### 6. Get Profile by User ID

**Request:**
```http
GET /api/role-profiles/user/123e4567-e89b-12d3-a456-426614174000
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "987e6543-e21b-12d3-a456-426614174999",
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "role": "student",
    "commonFields": {...},
    "roleSpecificData": {...},
    "activityLogs": [...],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-16T14:20:00.000Z"
  }
}
```

### 7. Search Profiles

**Request:**
```http
GET /api/role-profiles/search?q=john&role=student&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "total": 5,
  "page": 1,
  "limit": 10
}
```

### 8. Get Profiles by Role

**Request:**
```http
GET /api/role-profiles/role/alumni?page=1&limit=20&sortBy=created_at&sortOrder=desc
```

### 9. Get Profile Statistics

**Request:**
```http
GET /api/role-profiles/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "admin": 5,
    "student": 150,
    "alumni": 300,
    "recruiter": 25,
    "donor": 40
  }
}
```

## 🚀 Installation

1. **Install dependencies** (already in package.json):
```bash
npm install
```

2. **Run database migration**:
```bash
npm run db:migrate-role-profiles
```

Or manually:
```bash
ts-node scripts/migrate-role-profiles.ts
```

3. **Register routes** in your main app file:
```typescript
import roleProfilesRoutes from './modules/role-profiles/role-profiles.routes';

app.use('/api/role-profiles', roleProfilesRoutes);
```

## 💻 Usage

### Import and Use Service

```typescript
import { roleProfilesService } from './modules/role-profiles/role-profiles.service';

// Create profile
const profile = await roleProfilesService.createProfile({
  userId: 'user-uuid',
  role: 'student',
  commonFields: {...},
  roleSpecificData: {...}
});

// Get profile
const userProfile = await roleProfilesService.getProfileByUserId('user-uuid');

// Update profile
const updated = await roleProfilesService.updateProfile('user-uuid', {
  commonFields: { bio: 'New bio' }
});
```

## 📜 Business Rules

1. **One Profile Per User**: Each user can have exactly one profile (enforced by unique constraint on `user_id`)

2. **Role-Based Validation**: Profile data is validated based on the user's role

3. **Internship Logic for Students**:
   - If `internshipAvailable = false`, `internshipExperience` must be empty
   - Cannot add internship experience when `internshipAvailable = false`

4. **Required Fields by Role**:
   - **Student**: skills, education, projects (at least 1 education entry)
   - **Alumni**: skills, workExperience, education (at least 1 work experience)
   - **Recruiter**: companyName, designation, hiringRoles, industry
   - **Admin**: department, permissions, systemAccessLevel
   - **Donor**: contributionHistory, interests, donationType

5. **Activity Tracking**: All profile actions are automatically logged

6. **Immutable Role**: Once a profile is created, the role cannot be changed (requires creating a new profile)

7. **Cascade Delete**: Deleting a user automatically deletes their profile

## 🔒 Security Considerations

- Add authentication middleware to protect routes
- Implement authorization to ensure users can only update their own profiles
- Admin-only routes should be protected with role-based access control
- Validate and sanitize all user inputs
- Use parameterized queries (already implemented)

## 📊 Performance Optimization

- JSONB GIN indexes for fast querying
- Pagination support for large datasets
- Efficient database connection pooling
- Optimized queries with proper indexing

## 🧪 Testing

Create test files for:
- Unit tests for service layer
- Integration tests for repository layer
- E2E tests for API endpoints
- Validation schema tests

## 📈 Future Enhancements

- Profile versioning/history
- Profile visibility settings (public/private)
- Profile completeness score
- Profile recommendations
- Advanced search with filters
- Profile analytics dashboard
- Export profile data (PDF/JSON)
- Profile verification badges

## 📄 License

MIT

---

**Built with ❤️ for Alumni Connect Platform**
