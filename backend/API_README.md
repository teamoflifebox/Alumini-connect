# Alumni Connect - API Documentation

Complete API documentation for the Alumni Connect platform.

---

## 📚 Documentation Files

1. **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API reference with all endpoints
2. **[API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md)** - Step-by-step testing guide
3. **[COMPLETE_API_COLLECTION.postman_collection.json](./COMPLETE_API_COLLECTION.postman_collection.json)** - Postman collection

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Ensure Server is Running

```bash
npm run dev
```

Server should be running on `http://localhost:5001`

---

### Step 2: Create First Admin User

```bash
npm run create-admin
```

**Output:**
```
✅ Admin user created successfully!

📋 Admin Details:
─────────────────────────────────────
🆔 ID: uuid-here
👤 Name: Super Admin
📧 Email: admin@alumniconnect.com
🔑 Password: Admin123!
👔 Role: admin
─────────────────────────────────────
```

**Save these credentials!**

---

### Step 3: Test Admin Login

**Using cURL:**
```bash
curl -X POST http://localhost:5001/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@alumniconnect.com",
    "password": "Admin123!"
  }'
```

**Using Postman:**
1. Import `COMPLETE_API_COLLECTION.postman_collection.json`
2. Open "1. Authentication" → "1.2 Admin Login"
3. Click **Send**
4. Copy the `accessToken` from response

---

### Step 4: Create a Student

**Request:**
```bash
curl -X POST http://localhost:5001/api/user-management/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@university.edu",
    "password": "Student123!",
    "batchYear": 2024,
    "department": "Computer Science"
  }'
```

---

### Step 5: Test Student Login

```bash
curl -X POST http://localhost:5001/api/auth/student/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.smith@university.edu",
    "password": "Student123!"
  }'
```

---

## 📖 Complete API Reference

### Base URL
```
http://localhost:5001/api
```

### Authentication Header
```
Authorization: Bearer <access_token>
```

---

## 🔐 Authentication APIs

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/login` | POST | No | Universal login (auto-detects role) |
| `/auth/admin/login` | POST | No | Admin login |
| `/auth/student/login` | POST | No | Student login |
| `/auth/alumni/login` | POST | No | Alumni login |
| `/auth/alumni/register` | POST | No | Alumni self-registration |
| `/auth/google` | POST | No | Google OAuth login |
| `/auth/linkedin` | POST | No | LinkedIn OAuth login |
| `/auth/forgot-password` | POST | No | Request password reset |
| `/auth/reset-password` | POST | No | Reset password with token |
| `/auth/send-verification` | POST | Yes | Resend verification email |
| `/auth/verify-email` | GET | No | Verify email with token |
| `/auth/refresh` | POST | No | Refresh access token |
| `/auth/logout` | POST | Yes | Logout |

---

## 👥 User Management APIs (Admin Only)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/user-management/students` | POST | Admin | Create student account |
| `/user-management/admins` | POST | Admin | Create admin account |
| `/user-management/users` | GET | Admin | Get all users |
| `/user-management/users/role/:role` | GET | Admin | Get users by role |
| `/user-management/alumni/verify` | PATCH | Admin | Approve/reject alumni |
| `/user-management/users/:userId/role` | PATCH | Admin | Update user role |
| `/user-management/users/:userId` | DELETE | Admin | Delete user |

---

## 👤 Profile APIs

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/profiles/me` | GET | Yes | Get my profile |
| `/profiles/me` | PATCH | Yes | Update my profile |

---

## 🎯 Role-Based Profile APIs

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/role-profiles` | POST | Yes | Create role-based profile |
| `/role-profiles` | GET | Yes | Get all profiles |
| `/role-profiles/stats` | GET | Yes | Get profile statistics |
| `/role-profiles/search` | GET | Yes | Search profiles |
| `/role-profiles/role/:role` | GET | Yes | Get profiles by role |
| `/role-profiles/user/:userId` | GET | Yes | Get profile by user ID |
| `/role-profiles/user/:userId/exists` | GET | Yes | Check if profile exists |
| `/role-profiles/:profileId` | GET | Yes | Get profile by ID |
| `/role-profiles/user/:userId` | PUT | Yes | Update profile |
| `/role-profiles/user/:userId/activity` | POST | Yes | Add activity log |
| `/role-profiles/user/:userId` | DELETE | Yes | Delete profile |

---

## 💼 Jobs APIs

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/jobs` | GET | No | Get all jobs (public) |
| `/jobs` | POST | Yes | Create job posting |

---

## 🔒 RBAC APIs

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/rbac/capabilities/me` | GET | Yes | Get my capabilities |
| `/rbac/capabilities/assign` | POST | Admin | Assign capability to user |

---

## 🏥 Health Check APIs

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/health` | GET | No | API health check |
| `http://localhost:5001/health` | GET | No | Server health check |

---

## 🎭 User Roles

### 1. Admin
- Can create students and other admins
- Can approve/reject alumni registrations
- Can manage all users
- Full system access

### 2. Student
- Created by admin only
- Cannot self-register
- Can view and update own profile
- Can apply to jobs

### 3. Alumni
- Can self-register
- Requires email verification
- Requires admin approval
- Can post jobs
- Can offer mentorship

### 4. Recruiter
- Can self-register (as alumni, then role changed)
- Can post jobs
- Can view student/alumni profiles

### 5. Donor
- Can self-register (as alumni, then role changed)
- Can make donations
- Can view engagement activities

---

## 🔄 Authentication Flow

### For Students:
1. Admin creates account → `POST /user-management/students`
2. Student receives email with credentials
3. Student logs in → `POST /auth/student/login`
4. Student updates profile

### For Alumni:
1. Alumni registers → `POST /auth/alumni/register`
2. Alumni verifies email → `GET /auth/verify-email?token=...`
3. Admin approves → `PATCH /user-management/alumni/verify`
4. Alumni logs in → `POST /auth/alumni/login`

### For Admin:
1. Super admin creates account → `POST /user-management/admins`
2. Admin logs in → `POST /auth/admin/login`

---

## 🔑 Token Management

### Access Token
- Expires in: **1 hour**
- Used for: All authenticated requests
- Header: `Authorization: Bearer <access_token>`

### Refresh Token
- Expires in: **7 days**
- Used for: Getting new access token
- Endpoint: `POST /auth/refresh`

### Token Refresh Flow:
1. Access token expires (401 error)
2. Call `POST /auth/refresh` with refresh token
3. Receive new access token and refresh token
4. Retry original request with new access token

---

## 📊 Response Format

### Success Response:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

---

## 🚨 HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (not authenticated) |
| 403 | Forbidden (not authorized) |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 429 | Too Many Requests (rate limit) |
| 500 | Internal Server Error |

---

## 🔒 Security Features

### Rate Limiting
- Login endpoints: 5 requests per 15 minutes
- Registration: 3 requests per hour
- Password reset: 3 requests per hour
- General API: 100 requests per 15 minutes

### Password Requirements
- Minimum 8 characters
- Must contain letters and numbers
- Case-sensitive

### Email Verification
- Required for alumni accounts
- Token expires in 24 hours
- Can resend verification email

### Admin Approval
- Required for alumni accounts
- Admin can approve or reject
- Rejection reason can be provided

---

## 🧪 Testing with Postman

### Import Collection:
1. Open Postman
2. Click **Import**
3. Select `COMPLETE_API_COLLECTION.postman_collection.json`
4. Collection imported with 40+ requests

### Set Variables:
1. Click on collection
2. Go to **Variables** tab
3. Set `baseUrl` to `http://localhost:5001/api`
4. `accessToken` will be auto-set after login

### Auto-Save Tokens:
The collection automatically saves tokens after login:
- Login → Saves `accessToken` and `refreshToken`
- All subsequent requests use saved token

---

## 🐛 Troubleshooting

### Issue: "Connection refused"
**Solution:** Ensure server is running on port 5001
```bash
npm run dev
```

### Issue: "Database connection failed"
**Solution:** Check PostgreSQL is running and credentials are correct
```bash
psql -U postgres -d alumni_connect
```

### Issue: "Invalid credentials"
**Solution:** 
- Check email and password are correct
- For alumni: Ensure email is verified and account is approved
- For students: Use credentials provided by admin

### Issue: "Token expired"
**Solution:** Use refresh token to get new access token
```bash
POST /api/auth/refresh
{
  "refreshToken": "your_refresh_token"
}
```

### Issue: "Forbidden"
**Solution:** 
- Check you have the right role for this endpoint
- Admin-only endpoints require admin access token
- Check token is valid and not expired

---

## 📝 Example Workflows

### Workflow 1: Create and Login Student

```bash
# 1. Admin logs in
curl -X POST http://localhost:5001/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@alumniconnect.com","password":"Admin123!"}'

# 2. Admin creates student
curl -X POST http://localhost:5001/api/user-management/students \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"Jane",
    "lastName":"Smith",
    "email":"jane@university.edu",
    "password":"Student123!",
    "batchYear":2024,
    "department":"CS"
  }'

# 3. Student logs in
curl -X POST http://localhost:5001/api/auth/student/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@university.edu","password":"Student123!"}'
```

### Workflow 2: Alumni Registration and Approval

```bash
# 1. Alumni registers
curl -X POST http://localhost:5001/api/auth/alumni/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"John",
    "lastName":"Doe",
    "email":"john@alumni.com",
    "password":"Alumni123!",
    "confirmPassword":"Alumni123!"
  }'

# 2. Alumni verifies email (click link in email)
# GET /api/auth/verify-email?token=...

# 3. Admin approves
curl -X PATCH http://localhost:5001/api/user-management/alumni/verify \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"alumni-uuid",
    "isApproved":true
  }'

# 4. Alumni logs in
curl -X POST http://localhost:5001/api/auth/alumni/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@alumni.com","password":"Alumni123!"}'
```

---

## 📚 Additional Resources

- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Detailed API reference
- **[API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md)** - Complete testing guide
- **[Role-Based Profiles README](./src/modules/role-profiles/README.md)** - Profile system docs

---

## 🎯 Quick Commands

```bash
# Start server
npm run dev

# Create first admin
npm run create-admin

# Run database migrations
npm run db:migrate
npm run db:migrate-role-profiles

# Build for production
npm run build

# Start production server
npm start
```

---

## 📞 Support

For issues or questions:
1. Check [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md)
2. Review [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
3. Check server logs for errors
4. Verify database connection

---

## ✅ API Health Check

Test if API is running:

```bash
curl http://localhost:5001/health
```

Expected response:
```json
{
  "status": "success",
  "message": "Server is healthy"
}
```

---

**API Version:** 1.0.0  
**Last Updated:** January 2024  
**Server:** http://localhost:5001  
**API Base:** http://localhost:5001/api  

---

**Happy Coding! 🚀**
