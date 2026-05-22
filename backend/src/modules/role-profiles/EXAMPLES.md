# Role-Based Profile Service - Complete Examples

This document provides comprehensive examples for all 5 user roles with complete request/response payloads.

## Table of Contents

1. [Student Profile Examples](#student-profile-examples)
2. [Alumni Profile Examples](#alumni-profile-examples)
3. [Recruiter Profile Examples](#recruiter-profile-examples)
4. [Admin Profile Examples](#admin-profile-examples)
5. [Donor Profile Examples](#donor-profile-examples)
6. [Common Operations](#common-operations)

---

## Student Profile Examples

### Example 1: Computer Science Student with Internship

**Create Profile Request:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440001",
  "role": "student",
  "commonFields": {
    "name": "Alex Chen",
    "email": "alex.chen@university.edu",
    "profilePhoto": "https://cdn.example.com/profiles/alex-chen.jpg",
    "bio": "Third-year Computer Science student passionate about full-stack development and AI. Looking for summer internship opportunities.",
    "location": "Boston, MA"
  },
  "roleSpecificData": {
    "skills": [
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "Python",
      "PostgreSQL",
      "Docker",
      "Git"
    ],
    "education": [
      {
        "institution": "Massachusetts Institute of Technology",
        "degree": "Bachelor of Science",
        "fieldOfStudy": "Computer Science",
        "startYear": 2021,
        "endYear": 2025,
        "grade": "3.9 GPA"
      }
    ],
    "projects": [
      {
        "title": "E-Commerce Platform",
        "description": "Built a full-stack e-commerce platform with React, Node.js, and PostgreSQL. Implemented user authentication, product catalog, shopping cart, and payment integration.",
        "technologies": ["React", "Node.js", "Express", "PostgreSQL", "Stripe"],
        "link": "https://github.com/alexchen/ecommerce-platform",
        "startDate": "2023-09",
        "endDate": "2024-01"
      },
      {
        "title": "AI Image Classifier",
        "description": "Developed a machine learning model to classify images using TensorFlow and deployed it as a web service.",
        "technologies": ["Python", "TensorFlow", "Flask", "Docker"],
        "link": "https://github.com/alexchen/image-classifier",
        "startDate": "2023-06",
        "endDate": "2023-08"
      },
      {
        "title": "Task Management App",
        "description": "Created a collaborative task management application with real-time updates using WebSockets.",
        "technologies": ["React", "Node.js", "Socket.io", "MongoDB"],
        "link": "https://github.com/alexchen/task-manager",
        "startDate": "2023-03",
        "endDate": "2023-05"
      }
    ],
    "interests": [
      "Machine Learning",
      "Web Development",
      "Cloud Computing",
      "Open Source",
      "Hackathons"
    ],
    "internshipAvailable": true,
    "internshipExperience": [
      {
        "company": "TechStart Inc.",
        "role": "Software Engineering Intern",
        "duration": "3 months (Summer 2023)",
        "description": "Developed REST APIs using Node.js and Express. Implemented authentication system and integrated third-party services. Collaborated with senior engineers on code reviews."
      }
    ]
  }
}
```

### Example 2: Student Without Internship Experience

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440002",
  "role": "student",
  "commonFields": {
    "name": "Sarah Johnson",
    "email": "sarah.j@university.edu",
    "profilePhoto": "https://cdn.example.com/profiles/sarah-j.jpg",
    "bio": "First-year Business Administration student interested in entrepreneurship and marketing.",
    "location": "New York, NY"
  },
  "roleSpecificData": {
    "skills": [
      "Marketing",
      "Business Analysis",
      "Excel",
      "PowerPoint",
      "Social Media Management"
    ],
    "education": [
      {
        "institution": "New York University",
        "degree": "Bachelor of Business Administration",
        "fieldOfStudy": "Marketing",
        "startYear": 2023,
        "endYear": 2027,
        "grade": "3.7 GPA"
      }
    ],
    "projects": [
      {
        "title": "Campus Marketing Campaign",
        "description": "Led a team of 5 students to create and execute a marketing campaign for a local startup, resulting in 200+ new customers.",
        "technologies": ["Instagram", "Canva", "Google Analytics"],
        "startDate": "2023-10",
        "endDate": "2023-12"
      }
    ],
    "interests": [
      "Entrepreneurship",
      "Digital Marketing",
      "Brand Strategy",
      "Startups"
    ],
    "internshipAvailable": false,
    "internshipExperience": []
  }
}
```

---

## Alumni Profile Examples

### Example 1: Senior Software Engineer

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440003",
  "role": "alumni",
  "commonFields": {
    "name": "Michael Rodriguez",
    "email": "michael.rodriguez@gmail.com",
    "profilePhoto": "https://cdn.example.com/profiles/michael-r.jpg",
    "bio": "Senior Software Engineer at Google with 8 years of experience in distributed systems and cloud infrastructure. MIT alumnus. Passionate about mentoring and giving back to the community.",
    "location": "Mountain View, CA"
  },
  "roleSpecificData": {
    "skills": [
      "Java",
      "Go",
      "Kubernetes",
      "Microservices",
      "System Design",
      "Cloud Architecture",
      "Docker",
      "Terraform",
      "AWS",
      "GCP"
    ],
    "workExperience": [
      {
        "company": "Google",
        "designation": "Senior Software Engineer",
        "startDate": "2020-06",
        "description": "Leading the backend infrastructure team for Google Cloud Platform. Architecting and implementing scalable microservices handling millions of requests per day. Mentoring junior engineers and conducting technical interviews.",
        "location": "Mountain View, CA"
      },
      {
        "company": "Amazon Web Services",
        "designation": "Software Development Engineer II",
        "startDate": "2018-03",
        "endDate": "2020-05",
        "description": "Worked on AWS Lambda infrastructure. Improved cold start performance by 40%. Led migration of legacy systems to containerized architecture.",
        "location": "Seattle, WA"
      },
      {
        "company": "Microsoft",
        "designation": "Software Engineer",
        "startDate": "2016-07",
        "endDate": "2018-02",
        "description": "Developed features for Azure DevOps. Implemented CI/CD pipelines and automated testing frameworks. Collaborated with cross-functional teams across multiple time zones.",
        "location": "Redmond, WA"
      }
    ],
    "education": [
      {
        "institution": "Massachusetts Institute of Technology",
        "degree": "Master of Science",
        "fieldOfStudy": "Computer Science",
        "startYear": 2014,
        "endYear": 2016,
        "grade": "4.0 GPA"
      },
      {
        "institution": "University of California, Berkeley",
        "degree": "Bachelor of Science",
        "fieldOfStudy": "Computer Science",
        "startYear": 2010,
        "endYear": 2014,
        "grade": "3.8 GPA"
      }
    ],
    "achievements": [
      {
        "title": "Google Cloud Innovator Award",
        "description": "Recognized for exceptional contributions to Google Cloud Platform infrastructure",
        "date": "2022-11",
        "category": "Professional"
      },
      {
        "title": "Best Paper Award - SIGCOMM",
        "description": "Published research paper on optimizing network latency in distributed systems",
        "date": "2019-08",
        "category": "Research"
      },
      {
        "title": "AWS Certified Solutions Architect - Professional",
        "description": "Achieved professional-level AWS certification",
        "date": "2019-03",
        "category": "Certification"
      }
    ],
    "interests": [
      "Distributed Systems",
      "Cloud Computing",
      "Mentorship",
      "Open Source",
      "Technical Writing"
    ],
    "graduationYear": 2016,
    "currentCompany": "Google",
    "currentDesignation": "Senior Software Engineer"
  }
}
```

### Example 2: Marketing Executive

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440004",
  "role": "alumni",
  "commonFields": {
    "name": "Emily Watson",
    "email": "emily.watson@company.com",
    "profilePhoto": "https://cdn.example.com/profiles/emily-w.jpg",
    "bio": "Marketing Director with 10+ years of experience in brand strategy and digital marketing. Stanford MBA. Helping startups scale their marketing efforts.",
    "location": "San Francisco, CA"
  },
  "roleSpecificData": {
    "skills": [
      "Brand Strategy",
      "Digital Marketing",
      "Content Marketing",
      "SEO/SEM",
      "Marketing Analytics",
      "Team Leadership",
      "Budget Management",
      "Social Media Strategy"
    ],
    "workExperience": [
      {
        "company": "Airbnb",
        "designation": "Marketing Director",
        "startDate": "2021-01",
        "description": "Leading global marketing strategy for Experiences product line. Managing $10M annual budget and team of 15 marketers. Increased user engagement by 65%.",
        "location": "San Francisco, CA"
      },
      {
        "company": "Uber",
        "designation": "Senior Marketing Manager",
        "startDate": "2018-06",
        "endDate": "2020-12",
        "description": "Managed marketing campaigns for Uber Eats in North America. Led rebranding initiative that improved brand perception by 30%.",
        "location": "San Francisco, CA"
      },
      {
        "company": "Facebook",
        "designation": "Marketing Manager",
        "startDate": "2015-08",
        "endDate": "2018-05",
        "description": "Developed and executed marketing strategies for small business advertising products. Collaborated with product and sales teams.",
        "location": "Menlo Park, CA"
      }
    ],
    "education": [
      {
        "institution": "Stanford Graduate School of Business",
        "degree": "Master of Business Administration",
        "fieldOfStudy": "Marketing",
        "startYear": 2013,
        "endYear": 2015,
        "grade": "3.9 GPA"
      },
      {
        "institution": "University of Pennsylvania",
        "degree": "Bachelor of Arts",
        "fieldOfStudy": "Communications",
        "startYear": 2009,
        "endYear": 2013,
        "grade": "3.7 GPA"
      }
    ],
    "achievements": [
      {
        "title": "Marketing Executive of the Year",
        "description": "Awarded by Marketing Week for outstanding leadership in digital marketing",
        "date": "2022-06",
        "category": "Professional"
      },
      {
        "title": "Campaign of the Year",
        "description": "Won industry award for innovative Uber Eats campaign",
        "date": "2020-03",
        "category": "Professional"
      }
    ],
    "interests": [
      "Brand Building",
      "Startup Advising",
      "Women in Tech",
      "Public Speaking"
    ],
    "graduationYear": 2015,
    "currentCompany": "Airbnb",
    "currentDesignation": "Marketing Director"
  }
}
```

---

## Recruiter Profile Examples

### Example 1: Tech Recruiter

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440005",
  "role": "recruiter",
  "commonFields": {
    "name": "David Kim",
    "email": "david.kim@techcorp.com",
    "profilePhoto": "https://cdn.example.com/profiles/david-k.jpg",
    "bio": "Senior Technical Recruiter at TechCorp with 7 years of experience in engineering recruitment. Specialized in finding top talent for startups and Fortune 500 companies.",
    "location": "Austin, TX"
  },
  "roleSpecificData": {
    "companyName": "TechCorp Solutions",
    "designation": "Senior Technical Recruiter",
    "hiringRoles": [
      "Software Engineer",
      "Senior Software Engineer",
      "DevOps Engineer",
      "Data Scientist",
      "Machine Learning Engineer",
      "Product Manager",
      "Engineering Manager"
    ],
    "industry": "Technology",
    "companyDetails": {
      "website": "https://techcorp.com",
      "size": "1000-5000 employees",
      "description": "Leading enterprise software company specializing in cloud-based solutions for businesses. We build products that help companies scale their operations efficiently.",
      "headquarters": "Austin, TX"
    },
    "postedJobs": [
      "job-uuid-001",
      "job-uuid-002",
      "job-uuid-003"
    ],
    "yearsInRecruitment": 7
  }
}
```

### Example 2: Healthcare Recruiter

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440006",
  "role": "recruiter",
  "commonFields": {
    "name": "Lisa Martinez",
    "email": "lisa.martinez@healthsystems.com",
    "profilePhoto": "https://cdn.example.com/profiles/lisa-m.jpg",
    "bio": "Healthcare Talent Acquisition Specialist with focus on nursing and medical staff recruitment. Committed to connecting healthcare professionals with meaningful opportunities.",
    "location": "Chicago, IL"
  },
  "roleSpecificData": {
    "companyName": "HealthSystems America",
    "designation": "Healthcare Talent Acquisition Specialist",
    "hiringRoles": [
      "Registered Nurse",
      "Nurse Practitioner",
      "Physician Assistant",
      "Medical Technologist",
      "Healthcare Administrator",
      "Physical Therapist"
    ],
    "industry": "Healthcare",
    "companyDetails": {
      "website": "https://healthsystems.com",
      "size": "10000+ employees",
      "description": "One of the largest healthcare providers in the Midwest, operating 50+ hospitals and 200+ clinics.",
      "headquarters": "Chicago, IL"
    },
    "postedJobs": [],
    "yearsInRecruitment": 5
  }
}
```

---

## Admin Profile Examples

### Example 1: Platform Administrator

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440007",
  "role": "admin",
  "commonFields": {
    "name": "Robert Anderson",
    "email": "robert.anderson@alumniconnect.com",
    "profilePhoto": "https://cdn.example.com/profiles/robert-a.jpg",
    "bio": "Platform Administrator for Alumni Connect. Managing user accounts, system configurations, and ensuring smooth platform operations.",
    "location": "Remote"
  },
  "roleSpecificData": {
    "department": "Platform Operations",
    "permissions": [
      "user_management",
      "content_moderation",
      "system_configuration",
      "analytics_access",
      "role_assignment",
      "data_export",
      "security_settings"
    ],
    "systemAccessLevel": "full",
    "managedModules": [
      "user-management",
      "profiles",
      "jobs",
      "events",
      "mentorship"
    ],
    "adminNotes": "Primary administrator responsible for day-to-day platform operations and user support."
  }
}
```

### Example 2: Content Moderator Admin

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440008",
  "role": "admin",
  "commonFields": {
    "name": "Jennifer Lee",
    "email": "jennifer.lee@alumniconnect.com",
    "profilePhoto": "https://cdn.example.com/profiles/jennifer-l.jpg",
    "bio": "Content Moderation Specialist ensuring community guidelines are followed and maintaining a safe environment for all users.",
    "location": "New York, NY"
  },
  "roleSpecificData": {
    "department": "Community Management",
    "permissions": [
      "content_moderation",
      "user_warnings",
      "post_removal",
      "comment_moderation",
      "report_review"
    ],
    "systemAccessLevel": "limited",
    "managedModules": [
      "community",
      "events",
      "forums"
    ],
    "adminNotes": "Focuses on content moderation and community safety. Reports to Platform Operations Director."
  }
}
```

---

## Donor Profile Examples

### Example 1: Individual Donor

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440009",
  "role": "donor",
  "commonFields": {
    "name": "William Thompson",
    "email": "william.thompson@email.com",
    "profilePhoto": "https://cdn.example.com/profiles/william-t.jpg",
    "bio": "Proud alumnus and supporter of educational initiatives. Passionate about providing scholarships to underprivileged students.",
    "location": "Boston, MA"
  },
  "roleSpecificData": {
    "organizationName": null,
    "contributionHistory": [
      {
        "amount": 50000,
        "date": "2023-12-15",
        "campaign": "Annual Scholarship Fund",
        "purpose": "Student Scholarships",
        "transactionId": "TXN-2023-12-001"
      },
      {
        "amount": 25000,
        "date": "2023-06-20",
        "campaign": "Library Renovation",
        "purpose": "Infrastructure Development",
        "transactionId": "TXN-2023-06-045"
      },
      {
        "amount": 10000,
        "date": "2022-12-10",
        "campaign": "Annual Scholarship Fund",
        "purpose": "Student Scholarships",
        "transactionId": "TXN-2022-12-089"
      }
    ],
    "interests": [
      "Education",
      "Student Scholarships",
      "STEM Programs",
      "Campus Development"
    ],
    "donationType": "individual",
    "engagementActivity": [
      "Attended Annual Gala 2023",
      "Guest speaker at Donor Appreciation Event",
      "Mentored 3 scholarship recipients",
      "Participated in campus tour for prospective donors"
    ],
    "totalContributed": 85000,
    "preferredCauses": [
      "Student Scholarships",
      "STEM Education",
      "Campus Infrastructure"
    ]
  }
}
```

### Example 2: Corporate Donor

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440010",
  "role": "donor",
  "commonFields": {
    "name": "Patricia Williams",
    "email": "patricia.williams@techfoundation.org",
    "profilePhoto": "https://cdn.example.com/profiles/patricia-w.jpg",
    "bio": "Director of Corporate Giving at Tech Foundation. Managing corporate philanthropy initiatives focused on education and technology access.",
    "location": "San Francisco, CA"
  },
  "roleSpecificData": {
    "organizationName": "Tech Foundation",
    "contributionHistory": [
      {
        "amount": 500000,
        "date": "2023-09-01",
        "campaign": "Computer Science Building Fund",
        "purpose": "Infrastructure Development",
        "transactionId": "TXN-CORP-2023-09-001"
      },
      {
        "amount": 250000,
        "date": "2023-03-15",
        "campaign": "Technology Scholarship Program",
        "purpose": "Student Scholarships",
        "transactionId": "TXN-CORP-2023-03-012"
      },
      {
        "amount": 100000,
        "date": "2022-11-20",
        "campaign": "Research Grant Program",
        "purpose": "Research Funding",
        "transactionId": "TXN-CORP-2022-11-034"
      }
    ],
    "interests": [
      "Technology Education",
      "Research Funding",
      "Student Scholarships",
      "Innovation Labs"
    ],
    "donationType": "corporate",
    "engagementActivity": [
      "Sponsored Annual Tech Conference",
      "Provided internship opportunities for 20 students",
      "Hosted corporate mentorship program",
      "Funded 3 research projects",
      "Donated computer equipment worth $50,000"
    ],
    "totalContributed": 850000,
    "preferredCauses": [
      "Technology Education",
      "Research & Innovation",
      "Student Career Development"
    ]
  }
}
```

---

## Common Operations

### Update Profile - Add New Skill (Student)

```http
PUT /api/role-profiles/user/550e8400-e29b-41d4-a716-446655440001
Content-Type: application/json

{
  "roleSpecificData": {
    "skills": [
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "Python",
      "PostgreSQL",
      "Docker",
      "Git",
      "Kubernetes"
    ]
  }
}
```

### Add Activity - Job Application

```http
POST /api/role-profiles/user/550e8400-e29b-41d4-a716-446655440001/activity
Content-Type: application/json

{
  "action": "job_applied",
  "metadata": {
    "jobId": "job-uuid-123",
    "company": "Google",
    "position": "Software Engineer Intern",
    "appliedDate": "2024-01-15"
  }
}
```

### Add Activity - Donation Made

```http
POST /api/role-profiles/user/550e8400-e29b-41d4-a716-446655440009/activity
Content-Type: application/json

{
  "action": "donation_made",
  "metadata": {
    "amount": 5000,
    "campaign": "Emergency Scholarship Fund",
    "date": "2024-01-20"
  }
}
```

### Search Profiles by Name

```http
GET /api/role-profiles/search?q=michael&page=1&limit=10
```

### Get All Alumni Profiles

```http
GET /api/role-profiles/role/alumni?page=1&limit=20&sortBy=created_at&sortOrder=desc
```

### Check if Profile Exists

```http
GET /api/role-profiles/user/550e8400-e29b-41d4-a716-446655440001/exists
```

**Response:**
```json
{
  "success": true,
  "exists": true
}
```

---

## Error Examples

### Validation Error - Student with Internship Mismatch

```http
POST /api/role-profiles
Content-Type: application/json

{
  "userId": "550e8400-e29b-41d4-a716-446655440099",
  "role": "student",
  "commonFields": {...},
  "roleSpecificData": {
    "skills": ["JavaScript"],
    "education": [...],
    "projects": [],
    "interests": [],
    "internshipAvailable": false,
    "internshipExperience": [
      {
        "company": "TechCorp",
        "role": "Intern",
        "duration": "3 months"
      }
    ]
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Validation failed: Internship experience must be empty when internshipAvailable is false"
}
```

### Profile Already Exists Error

```http
POST /api/role-profiles
Content-Type: application/json

{
  "userId": "550e8400-e29b-41d4-a716-446655440001",
  "role": "student",
  ...
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Profile already exists for this user"
}
```

### Profile Not Found Error

```http
GET /api/role-profiles/user/non-existent-user-id
```

**Error Response:**
```json
{
  "success": false,
  "message": "Profile not found"
}
```

---

**Note**: All UUIDs in these examples are for demonstration purposes. In production, use actual UUIDs from your user management system.
