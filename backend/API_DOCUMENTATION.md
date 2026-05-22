# Alumni Connect - Complete API Documentation

**Base URL:** `http://localhost:5001/api`

**Version:** 1.0.0

---

## 📋 Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [User Management APIs (Admin Only)](#user-management-apis)
3. [Profile APIs](#profile-apis)
4. [Role-Based Profile APIs](#role-based-profile-apis)
5. [Jobs APIs](#jobs-apis)
6. [RBAC APIs](#rbac-apis)
7. [Health Check APIs](#health-check-apis)
8. [Error Responses](#error-responses)

---

## 🔐 Authentication APIs

Base Path: `/api/auth`

### 1. **Universal Login** (Auto-detects role)

**Endpoint:** `POST /api/auth/login`

**Description:** Login with email and password. System automatically detects user role.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "yourPassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "user@example.com",
      "primary_role": "student",
      "is_verified": true,
      "is_approved": true,
      "created_at": "2024-01-15T10:30:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400` - Invalid credentials
- `401` - Email not verified
- `403` - Account not approved (for alumni)
- `429` - Too many login attempts

---

### 2. **Role-Specific Login**

**Endpoints:**
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/student/login` - Student login
- `POST /api/auth/alumni/login` - Alumni login

**Request Body:** Same as universal login

**Use Case:** When you want to explicitly specify the role during login.

---

### 3. **Alumni Registration** (Self-Registration)

**Endpoint:** `POST /api/auth/alumni/register`

**Description:** Alumni can self-register. Account requires admin approval.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@alumni.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email and wait for admin approval.",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john.doe@alumni.com",
      "primary_role": "alumni",
      "is_verified": false,
      "approval_status": "pending"
    }
  }
}
```

**Validation Rules:**
- Email must be valid format
- Password minimum 8 characters
- Password must match confirmPassword
- Email must be unique

---

### 4. **Universal Registration** (Defaults to Alumni)

**Endpoint:** `POST /api/auth/register`

**Request Body:** Same as alumni registration

**Description:** Alias for alumni registration.

---

### 5. **Google OAuth Login**

**Endpoint:** `POST /api/auth/google`

**Description:** Login/Register using Google OAuth token.

**Request Body:**
```json
{
  "token": "google_oauth_token_here",
  "role": "alumni"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Google authentication successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john.doe@gmail.com",
      "primary_role": "alumni",
      "provider": "google",
      "avatar_url": "https://lh3.googleusercontent.com/..."
    },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

**How to Get Google Token:**
1. Use Google Sign-In button on frontend
2. Get the ID token from Google
3. Send it to this endpoint

---

### 6. **LinkedIn OAuth Login**

**Endpoint:** `POST /api/auth/linkedin`

**Description:** Login/Register using LinkedIn OAuth.

**Request Body:**
```json
{
  "code": "linkedin_authorization_code",
  "role": "alumni"
}
```

**Alternative Flow (Redirect-based):**

**Step 1:** Redirect user to:
```
GET /api/v1/auth/linkedin/redirect
```

**Step 2:** User authorizes on LinkedIn

**Step 3:** LinkedIn redirects to:
```
GET /api/v1/auth/linkedin/callback?code=...
```

**Step 4:** Backend processes and redirects to frontend with tokens

---

### 7. **Forgot Password**

**Endpoint:** `POST /api/auth/forgot-password`

**Description:** Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent. Please check your inbox."
}
```

**Note:** Email contains a reset link valid for 1 hour.

---

### 8. **Reset Password**

**Endpoint:** `POST /api/auth/reset-password`

**Description:** Reset password using token from email.

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful. You can now login with your new password."
}
```

---

### 9. **Send Email Verification**

**Endpoint:** `POST /api/auth/send-verification`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Description:** Resend email verification link.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Verification email sent"
}
```

---

### 10. **Verify Email**

**Endpoint:** `GET /api/auth/verify-email?token=<verification_token>`

**Description:** Verify email address using token from email.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

### 11. **Refresh Token**

**Endpoint:** `POST /api/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "your_refresh_token_here"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token",
    "refreshToken": "new_refresh_token"
  }
}
```

**Use Case:** When access token expires (typically after 1 hour).

---

### 12. **Logout**

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 👥 User Management APIs (Admin Only)

Base Path: `/api/user-management`

**All endpoints require:**
- Authentication: `Authorization: Bearer <admin_access_token>`
- Admin role

---

### 1. **Create Student Account**

**Endpoint:** `POST /api/user-management/students`

**Description:** Admin creates a student account.

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@university.edu",
  "password": "TempPass123!",
  "batchYear": 2024,
  "department": "Computer Science"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Student account created successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "Jane Smith",
      "email": "jane.smith@university.edu",
      "primary_role": "student",
      "is_verified": true,
      "is_approved": true
    }
  }
}
```

**Note:** Students cannot self-register. Only admins can create student accounts.

---

### 2. **Create Admin Account**

**Endpoint:** `POST /api/user-management/admins`

**Description:** Admin creates another admin account.

**Request Body:**
```json
{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@alumniconnect.com",
  "password": "AdminPass123!",
  "department": "Operations"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Admin account created successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "Admin User",
      "email": "admin@alumniconnect.com",
      "primary_role": "admin"
    }
  }
}
```

---

### 3. **Get All Users**

**Endpoint:** `GET /api/user-management/users`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or email

**Example:**
```
GET /api/user-management/users?page=1&limit=20&search=john
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "primary_role": "student",
        "is_verified": true,
        "is_approved": true,
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "totalPages": 8
    }
  }
}
```

---

### 4. **Get Users by Role**

**Endpoint:** `GET /api/user-management/users/role/:role`

**Parameters:**
- `role`: admin | student | alumni | recruiter | donor

**Example:**
```
GET /api/user-management/users/role/student
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "name": "Jane Smith",
        "email": "jane@university.edu",
        "primary_role": "student",
        "batch_year": 2024,
        "department": "Computer Science"
      }
    ],
    "total": 45
  }
}
```

---

### 5. **Verify/Approve Alumni Account**

**Endpoint:** `PATCH /api/user-management/alumni/verify`

**Description:** Approve or reject alumni registration.

**Request Body:**
```json
{
  "userId": "alumni_user_uuid",
  "isApproved": true,
  "rejectionReason": null
}
```

**For Rejection:**
```json
{
  "userId": "alumni_user_uuid",
  "isApproved": false,
  "rejectionReason": "Invalid credentials or documentation"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Alumni account approved successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@alumni.com",
      "primary_role": "alumni",
      "is_approved": true,
      "approval_status": "approved"
    }
  }
}
```

---

### 6. **Update User Role**

**Endpoint:** `PATCH /api/user-management/users/:userId/role`

**Description:** Change a user's primary role.

**Request Body:**
```json
{
  "newRole": "alumni"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "primary_role": "alumni"
    }
  }
}
```

---

### 7. **Delete User**

**Endpoint:** `DELETE /api/user-management/users/:userId`

**Description:** Permanently delete a user account.

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Warning:** This action is irreversible and will cascade delete all related data.

---

## 👤 Profile APIs

Base Path: `/api/profiles`

**All endpoints require authentication**

---

### 1. **Get My Profile**

**Endpoint:** `GET /api/profiles/me`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "uuid",
      "user_id": "uuid",
      "first_name": "John",
      "last_name": "Doe",
      "batch_year": 2020,
      "department": "Computer Science",
      "current_company": "Google",
      "designation": "Software Engineer",
      "skills": ["JavaScript", "Python", "React"],
      "domains": ["Web Development", "AI"],
      "is_mentor_available": true,
      "created_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

### 2. **Update My Profile**

**Endpoint:** `PATCH /api/profiles/me`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "current_company": "Microsoft",
  "designation": "Senior Software Engineer",
  "skills": ["JavaScript", "TypeScript", "React", "Node.js"],
  "domains": ["Web Development", "Cloud Computing"],
  "is_mentor_available": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "profile": {
      "id": "uuid",
      "current_company": "Microsoft",
      "designation": "Senior Software Engineer",
      "skills": ["JavaScript", "TypeScript", "React", "Node.js"],
      "updated_at": "2024-01-16T14:20:00Z"
    }
  }
}
```

---

## 🎯 Role-Based Profile APIs

Base Path: `/api/role-profiles`

**All endpoints require authentication**

---

### 1. **Create Role-Based Profile**

**Endpoint:** `POST /api/role-profiles`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body (Student):**
```json
{
  "userId": "user_uuid",
  "role": "student",
  "commonFields": {
    "name": "Alex Chen",
    "email": "alex@university.edu",
    "profilePhoto": "https://example.com/photo.jpg",
    "bio": "CS student passionate about AI",
    "location": "Boston, MA"
  },
  "roleSpecificData": {
    "skills": ["JavaScript", "Python", "React"],
    "education": [{
      "institution": "MIT",
      "degree": "Bachelor of Science",
      "fieldOfStudy": "Computer Science",
      "startYear": 2021,
      "endYear": 2025,
      "grade": "3.9 GPA"
    }],
    "projects": [{
      "title": "E-Commerce Platform",
      "description": "Built a full-stack e-commerce platform",
      "technologies": ["React", "Node.js", "PostgreSQL"],
      "link": "https://github.com/user/project"
    }],
    "interests": ["Web Development", "Machine Learning"],
    "internshipAvailable": true,
    "internshipExperience": [{
      "company": "TechCorp",
      "role": "Software Engineering Intern",
      "duration": "3 months",
      "description": "Developed REST APIs"
    }]
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Profile created successfully",
  "data": {
    "id": "profile_uuid",
    "userId": "user_uuid",
    "role": "student",
    "commonFields": {...},
    "roleSpecificData": {...},
    "activityLogs": [{
      "action": "profile_created",
      "timestamp": "2024-01-15T10:30:00Z"
    }],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 2. **Get Profile by User ID**

**Endpoint:** `GET /api/role-profiles/user/:userId`

**Example:**
```
GET /api/role-profiles/user/550e8400-e29b-41d4-a716-446655440001
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "profile_uuid",
    "userId": "user_uuid",
    "role": "student",
    "commonFields": {...},
    "roleSpecificData": {...},
    "activityLogs": [...],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-16T14:20:00Z"
  }
}
```

---

### 3. **Update Profile**

**Endpoint:** `PUT /api/role-profiles/user/:userId`

**Request Body:**
```json
{
  "commonFields": {
    "bio": "Updated bio text"
  },
  "roleSpecificData": {
    "skills": ["JavaScript", "TypeScript", "React", "Node.js", "Docker"]
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "profile_uuid",
    "userId": "user_uuid",
    "commonFields": {...},
    "roleSpecificData": {...},
    "activityLogs": [
      ...,
      {
        "action": "profile_updated",
        "timestamp": "2024-01-16T14:20:00Z",
        "metadata": {
          "updatedFields": ["bio", "skills"]
        }
      }
    ]
  }
}
```

---

### 4. **Search Profiles**

**Endpoint:** `GET /api/role-profiles/search`

**Query Parameters:**
- `q` (required): Search term
- `role` (optional): Filter by role
- `page` (optional): Page number
- `limit` (optional): Items per page

**Example:**
```
GET /api/role-profiles/search?q=software engineer&role=alumni&page=1&limit=10
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [...],
  "total": 25,
  "page": 1,
  "limit": 10
}
```

---

### 5. **Get Profiles by Role**

**Endpoint:** `GET /api/role-profiles/role/:role`

**Example:**
```
GET /api/role-profiles/role/alumni?page=1&limit=20
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [...],
  "total": 150,
  "page": 1,
  "limit": 20
}
```

---

### 6. **Add Activity Log**

**Endpoint:** `POST /api/role-profiles/user/:userId/activity`

**Request Body:**
```json
{
  "action": "job_applied",
  "metadata": {
    "jobId": "job_uuid",
    "company": "Google",
    "position": "Software Engineer"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Activity logged successfully",
  "data": {
    "activityLogs": [...]
  }
}
```

---

### 7. **Get Profile Statistics**

**Endpoint:** `GET /api/role-profiles/stats`

**Success Response (200):**
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

---

## 💼 Jobs APIs

Base Path: `/api/jobs`

---

### 1. **Get All Jobs** (Public)

**Endpoint:** `GET /api/jobs`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search term
- `location` (optional): Filter by location
- `type` (optional): Filter by job type

**Example:**
```
GET /api/jobs?page=1&limit=10&search=software&location=remote
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "uuid",
        "title": "Software Engineer",
        "company": "TechCorp",
        "location": "Remote",
        "type": "Full-time",
        "description": "We are looking for...",
        "requirements": ["3+ years experience", "JavaScript", "React"],
        "salary_range": "$100k - $150k",
        "posted_by": "recruiter_uuid",
        "posted_at": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 45,
    "page": 1,
    "limit": 10
  }
}
```

---

### 2. **Create Job** (Authenticated)

**Endpoint:** `POST /api/jobs`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "title": "Senior Software Engineer",
  "company": "TechCorp Inc.",
  "location": "San Francisco, CA",
  "type": "Full-time",
  "description": "We are seeking a talented Senior Software Engineer...",
  "requirements": [
    "5+ years of software development experience",
    "Strong knowledge of JavaScript/TypeScript",
    "Experience with React and Node.js"
  ],
  "salary_range": "$120k - $180k",
  "application_url": "https://techcorp.com/careers/apply/123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Job posted successfully",
  "data": {
    "job": {
      "id": "uuid",
      "title": "Senior Software Engineer",
      "company": "TechCorp Inc.",
      "posted_by": "user_uuid",
      "posted_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

## 🔒 RBAC APIs

Base Path: `/api/rbac`

**All endpoints require authentication and appropriate permissions**

---

### 1. **Get User Capabilities**

**Endpoint:** `GET /api/rbac/capabilities/me`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "primary_role": "alumni",
    "capability_groups": ["mentor", "recruiter"],
    "permissions": [
      "post_jobs",
      "offer_mentorship",
      "view_student_profiles"
    ]
  }
}
```

---

### 2. **Assign Capability to User**

**Endpoint:** `POST /api/rbac/capabilities/assign`

**Request Body:**
```json
{
  "userId": "user_uuid",
  "capabilityGroup": "mentor"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Capability assigned successfully"
}
```

---

## 🏥 Health Check APIs

---

### 1. **Server Health**

**Endpoint:** `GET /health`

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Server is healthy"
}
```

---

### 2. **API Health**

**Endpoint:** `GET /api/health`

**Success Response (200):**
```json
{
  "status": "success",
  "message": "API is running"
}
```

---

## ❌ Error Responses

### Standard Error Format

All errors follow this format:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

### Example Error Responses

**Validation Error (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

**Authentication Error (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**Authorization Error (403):**
```json
{
  "success": false,
  "message": "You do not have permission to access this resource"
}
```

**Not Found (404):**
```json
{
  "success": false,
  "message": "User not found"
}
```

**Rate Limit (429):**
```json
{
  "success": false,
  "message": "Too many requests. Please try again later."
}
```

---

## 🔑 Authentication Flow

### For Alumni/Recruiters/Donors:

1. **Register:** `POST /api/auth/alumni/register`
2. **Verify Email:** Click link in email → `GET /api/auth/verify-email?token=...`
3. **Wait for Admin Approval:** Admin approves via `PATCH /api/user-management/alumni/verify`
4. **Login:** `POST /api/auth/login`
5. **Use Access Token:** Include in `Authorization: Bearer <token>` header

### For Students:

1. **Admin Creates Account:** `POST /api/user-management/students`
2. **Student Receives Email:** With temporary password
3. **Login:** `POST /api/auth/login`
4. **Change Password:** (Optional) via profile settings

### For Admins:

1. **Super Admin Creates Account:** `POST /api/user-management/admins`
2. **Login:** `POST /api/auth/admin/login`

---

## 🔄 Token Refresh Flow

1. Access token expires (after 1 hour)
2. Frontend receives `401` error
3. Call `POST /api/auth/refresh` with refresh token
4. Receive new access token and refresh token
5. Retry original request with new access token

---

## 📱 OAuth Flow

### Google OAuth:

1. Frontend initiates Google Sign-In
2. User authorizes on Google
3. Frontend receives Google ID token
4. Send token to `POST /api/auth/google`
5. Receive access token and refresh token

### LinkedIn OAuth:

**Option 1: Redirect Flow**
1. Redirect to `GET /api/v1/auth/linkedin/redirect`
2. User authorizes on LinkedIn
3. LinkedIn redirects to callback
4. Backend redirects to frontend with tokens

**Option 2: Token Exchange**
1. Get authorization code from LinkedIn
2. Send to `POST /api/auth/linkedin`
3. Receive access token and refresh token

---

## 📊 Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Response Format:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15
  }
}
```

---

## 🔍 Search & Filtering

Most list endpoints support search and filtering:

**Query Parameters:**
- `search`: Search term (searches name, email, etc.)
- `role`: Filter by role
- `status`: Filter by status
- `sortBy`: Sort field
- `sortOrder`: asc | desc

**Example:**
```
GET /api/user-management/users?search=john&role=student&sortBy=created_at&sortOrder=desc
```

---

## 📝 Notes

1. **All timestamps are in ISO 8601 format (UTC)**
2. **All IDs are UUIDs**
3. **Rate limits apply to authentication endpoints**
4. **Access tokens expire after 1 hour**
5. **Refresh tokens expire after 7 days**
6. **Email verification is required for alumni**
7. **Admin approval is required for alumni accounts**

---

**API Version:** 1.0.0  
**Last Updated:** January 2024  
**Base URL:** `http://localhost:5001/api`  
**Production URL:** `https://your-domain.com/api`
