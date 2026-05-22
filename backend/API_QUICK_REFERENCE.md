# API Quick Reference Card

**Base URL:** `http://localhost:5001/api`

---

## 🚀 Quick Start

```bash
# 1. Create first admin
npm run create-admin

# 2. Login
curl -X POST http://localhost:5001/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@alumniconnect.com","password":"Admin123!"}'

# 3. Save the accessToken from response
```

---

## 🔐 Authentication (No Auth Required)

```bash
# Universal Login
POST /auth/login
{"email":"user@example.com","password":"pass"}

# Alumni Register
POST /auth/alumni/register
{"firstName":"John","lastName":"Doe","email":"john@alumni.com","password":"Pass123!","confirmPassword":"Pass123!"}

# Forgot Password
POST /auth/forgot-password
{"email":"user@example.com"}

# Reset Password
POST /auth/reset-password
{"token":"reset_token","newPassword":"NewPass123!","confirmPassword":"NewPass123!"}

# Refresh Token
POST /auth/refresh
{"refreshToken":"your_refresh_token"}
```

---

## 👥 User Management (Admin Only)

```bash
# Create Student
POST /user-management/students
Authorization: Bearer <admin_token>
{"firstName":"Jane","lastName":"Smith","email":"jane@uni.edu","password":"Pass123!","batchYear":2024,"department":"CS"}

# Create Admin
POST /user-management/admins
Authorization: Bearer <admin_token>
{"firstName":"Admin","lastName":"User","email":"admin2@platform.com","password":"Pass123!","department":"Ops"}

# Get All Users
GET /user-management/users?page=1&limit=10
Authorization: Bearer <admin_token>

# Get Users by Role
GET /user-management/users/role/student
Authorization: Bearer <admin_token>

# Approve Alumni
PATCH /user-management/alumni/verify
Authorization: Bearer <admin_token>
{"userId":"alumni_uuid","isApproved":true}

# Delete User
DELETE /user-management/users/:userId
Authorization: Bearer <admin_token>
```

---

## 👤 Profiles (Auth Required)

```bash
# Get My Profile
GET /profiles/me
Authorization: Bearer <token>

# Update My Profile
PATCH /profiles/me
Authorization: Bearer <token>
{"current_company":"Google","designation":"Engineer","skills":["JS","Python"],"is_mentor_available":true}
```

---

## 🎯 Role-Based Profiles (Auth Required)

```bash
# Create Profile
POST /role-profiles
Authorization: Bearer <token>
{"userId":"uuid","role":"student","commonFields":{...},"roleSpecificData":{...}}

# Get Profile
GET /role-profiles/user/:userId
Authorization: Bearer <token>

# Update Profile
PUT /role-profiles/user/:userId
Authorization: Bearer <token>
{"commonFields":{"bio":"Updated"},"roleSpecificData":{"skills":["JS","TS"]}}

# Search Profiles
GET /role-profiles/search?q=software&role=alumni
Authorization: Bearer <token>

# Get by Role
GET /role-profiles/role/alumni?page=1&limit=20
Authorization: Bearer <token>

# Add Activity
POST /role-profiles/user/:userId/activity
Authorization: Bearer <token>
{"action":"job_applied","metadata":{"jobId":"uuid"}}

# Get Stats
GET /role-profiles/stats
Authorization: Bearer <token>
```

---

## 💼 Jobs

```bash
# Get All Jobs (Public)
GET /jobs?page=1&limit=10

# Create Job (Auth Required)
POST /jobs
Authorization: Bearer <token>
{"title":"Engineer","company":"TechCorp","location":"SF","type":"Full-time","description":"...","requirements":["5+ years"],"salary_range":"$120k-$180k"}
```

---

## 🏥 Health Checks

```bash
# Server Health
GET http://localhost:5001/health

# API Health
GET /health
```

---

## 📊 Response Format

### Success
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

### Error
```json
{
  "success": false,
  "message": "Error message",
  "errors": [{"field":"email","message":"Invalid"}]
}
```

---

## 🔑 HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Rate Limited |
| 500 | Server Error |

---

## 🎭 User Roles

| Role | Creation | Login Endpoint |
|------|----------|----------------|
| Admin | By super admin | `/auth/admin/login` |
| Student | By admin | `/auth/student/login` |
| Alumni | Self-register | `/auth/alumni/login` |
| Recruiter | Self-register | `/auth/login` |
| Donor | Self-register | `/auth/login` |

---

## 🔄 Token Lifecycle

```
1. Login → Get accessToken (1h) + refreshToken (7d)
2. Use accessToken for requests
3. Token expires → 401 error
4. POST /auth/refresh with refreshToken
5. Get new tokens
6. Retry request
```

---

## 📝 Common Workflows

### Create Student
```bash
# 1. Admin login
POST /auth/admin/login

# 2. Create student
POST /user-management/students
Authorization: Bearer <admin_token>

# 3. Student login
POST /auth/student/login
```

### Alumni Registration
```bash
# 1. Register
POST /auth/alumni/register

# 2. Verify email (click link)
GET /auth/verify-email?token=...

# 3. Admin approves
PATCH /user-management/alumni/verify
Authorization: Bearer <admin_token>

# 4. Alumni login
POST /auth/alumni/login
```

---

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Port in use | `taskkill /PID <PID> /F` |
| DB connection failed | Check PostgreSQL running |
| Invalid credentials | Check email/password |
| Token expired | Use refresh token |
| Forbidden | Check user role |

---

## 📚 Full Documentation

- **[API_README.md](./API_README.md)** - Quick start
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete reference
- **[API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md)** - Testing guide
- **[API_COMPLETE_SUMMARY.md](./API_COMPLETE_SUMMARY.md)** - Overview

---

## 🎯 Essential Commands

```bash
# Start server
npm run dev

# Create admin
npm run create-admin

# Run migrations
npm run db:migrate
npm run db:migrate-role-profiles

# Test health
curl http://localhost:5001/health
```

---

**Print this card for quick reference! 📄**
