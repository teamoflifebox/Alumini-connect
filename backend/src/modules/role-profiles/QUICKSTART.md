# Quick Start Guide - Role-Based Profile Service

Get up and running with the Role-Based Profile Service in 5 minutes!

## ⚡ Quick Setup (5 Steps)

### Step 1: Run Database Migration (1 minute)

```bash
npm run db:migrate-role-profiles
```

**Expected Output:**
```
Starting role-based profiles migration...
✓ Created primary_role enum type
✓ Created role_based_profiles table
✓ Created indexes
✓ Created update timestamp function
✓ Created update timestamp trigger
✓ Created profile statistics view
✅ Role-based profiles migration completed successfully!
```

### Step 2: Register Routes (30 seconds)

Open `src/app.ts` or `src/createApp.ts` and add:

```typescript
import roleProfilesRoutes from './modules/role-profiles/role-profiles.routes';

// Add this line with your other routes
app.use('/api/role-profiles', roleProfilesRoutes);
```

### Step 3: Start Your Server (10 seconds)

```bash
npm run dev
```

### Step 4: Test the API (2 minutes)

**Create a Student Profile:**

```bash
curl -X POST http://localhost:3000/api/role-profiles \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "role": "student",
    "commonFields": {
      "name": "Test Student",
      "email": "test@university.edu"
    },
    "roleSpecificData": {
      "skills": ["JavaScript", "Python"],
      "education": [{
        "institution": "Test University",
        "degree": "Bachelor of Science",
        "fieldOfStudy": "Computer Science",
        "startYear": 2020
      }],
      "projects": [],
      "interests": ["Web Development"],
      "internshipAvailable": false,
      "internshipExperience": []
    }
  }'
```

**Get the Profile:**

```bash
curl http://localhost:3000/api/role-profiles/user/550e8400-e29b-41d4-a716-446655440000
```

### Step 5: Verify (30 seconds)

Check your database:

```bash
psql -U your_username -d your_database -c "SELECT id, user_id, role FROM role_based_profiles;"
```

---

## 🎯 Common Use Cases

### Use Case 1: Create Profile on User Registration

```typescript
// In your auth.service.ts
import { roleProfilesService } from './modules/role-profiles';

async register(data: RegisterDTO) {
  // 1. Create user
  const user = await this.createUser(data);
  
  // 2. Create profile
  await roleProfilesService.createProfile({
    userId: user.id,
    role: user.primary_role,
    commonFields: {
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
    },
    roleSpecificData: getDefaultRoleData(user.primary_role),
  });
  
  return user;
}
```

### Use Case 2: Get User Profile

```typescript
import { roleProfilesService } from './modules/role-profiles';

async function getUserProfile(userId: string) {
  const profile = await roleProfilesService.getProfileByUserId(userId);
  return profile;
}
```

### Use Case 3: Update Profile

```typescript
async function updateUserSkills(userId: string, newSkills: string[]) {
  const updated = await roleProfilesService.updateProfile(userId, {
    roleSpecificData: {
      skills: newSkills,
    },
  });
  return updated;
}
```

### Use Case 4: Track Activity

```typescript
async function trackJobApplication(userId: string, jobId: string) {
  await roleProfilesService.addActivity(userId, {
    action: 'job_applied',
    metadata: { jobId, timestamp: new Date() },
  });
}
```

### Use Case 5: Search Profiles

```typescript
async function searchAlumni(query: string) {
  const { profiles, total } = await roleProfilesService.searchProfiles(query, {
    role: 'alumni',
    page: 1,
    limit: 20,
  });
  return profiles;
}
```

---

## 📋 API Cheat Sheet

### Create Profile
```http
POST /api/role-profiles
Body: { userId, role, commonFields, roleSpecificData }
```

### Get Profile
```http
GET /api/role-profiles/user/:userId
```

### Update Profile
```http
PUT /api/role-profiles/user/:userId
Body: { commonFields?, roleSpecificData? }
```

### Add Activity
```http
POST /api/role-profiles/user/:userId/activity
Body: { action, metadata? }
```

### Search Profiles
```http
GET /api/role-profiles/search?q=searchTerm&role=student
```

### Get by Role
```http
GET /api/role-profiles/role/alumni?page=1&limit=20
```

### Get Statistics
```http
GET /api/role-profiles/stats
```

---

## 🔑 Role-Specific Quick Examples

### Student Profile (Minimal)
```json
{
  "userId": "uuid",
  "role": "student",
  "commonFields": {
    "name": "John Doe",
    "email": "john@edu.com"
  },
  "roleSpecificData": {
    "skills": ["JavaScript"],
    "education": [{
      "institution": "MIT",
      "degree": "BS",
      "fieldOfStudy": "CS",
      "startYear": 2020
    }],
    "projects": [],
    "interests": [],
    "internshipAvailable": false,
    "internshipExperience": []
  }
}
```

### Alumni Profile (Minimal)
```json
{
  "userId": "uuid",
  "role": "alumni",
  "commonFields": {
    "name": "Jane Smith",
    "email": "jane@gmail.com"
  },
  "roleSpecificData": {
    "skills": ["Java"],
    "workExperience": [{
      "company": "Google",
      "designation": "Engineer",
      "startDate": "2020-01"
    }],
    "education": [{
      "institution": "MIT",
      "degree": "MS",
      "fieldOfStudy": "CS",
      "startYear": 2018,
      "endYear": 2020
    }],
    "achievements": [],
    "interests": []
  }
}
```

### Recruiter Profile (Minimal)
```json
{
  "userId": "uuid",
  "role": "recruiter",
  "commonFields": {
    "name": "Mike Johnson",
    "email": "mike@company.com"
  },
  "roleSpecificData": {
    "companyName": "TechCorp",
    "designation": "Recruiter",
    "hiringRoles": ["Software Engineer"],
    "industry": "Technology"
  }
}
```

### Admin Profile (Minimal)
```json
{
  "userId": "uuid",
  "role": "admin",
  "commonFields": {
    "name": "Admin User",
    "email": "admin@platform.com"
  },
  "roleSpecificData": {
    "department": "Operations",
    "permissions": ["user_management"],
    "systemAccessLevel": "full"
  }
}
```

### Donor Profile (Minimal)
```json
{
  "userId": "uuid",
  "role": "donor",
  "commonFields": {
    "name": "William Thompson",
    "email": "william@email.com"
  },
  "roleSpecificData": {
    "contributionHistory": [],
    "interests": ["Education"],
    "donationType": "individual",
    "engagementActivity": []
  }
}
```

---

## 🛠️ Troubleshooting

### Problem: "Table does not exist"
**Solution:**
```bash
npm run db:migrate-role-profiles
```

### Problem: "Validation failed"
**Solution:** Check your request matches the role schema. See [EXAMPLES.md](./EXAMPLES.md)

### Problem: "Profile already exists"
**Solution:** Use PUT to update instead:
```bash
curl -X PUT http://localhost:3000/api/role-profiles/user/USER_ID
```

### Problem: TypeScript errors
**Solution:**
```bash
npm install --save-dev @types/pg
```

---

## 📚 Next Steps

1. ✅ **Add Authentication** - Protect routes with auth middleware
2. ✅ **Add Authorization** - Ensure users can only access their profiles
3. ✅ **Integrate with Registration** - Auto-create profiles on signup
4. ✅ **Add Activity Tracking** - Track user actions across the app
5. ✅ **Build Frontend UI** - Create profile pages
6. ✅ **Add Tests** - Write unit and integration tests
7. ✅ **Deploy** - Push to production

---

## 📖 Full Documentation

- **[README.md](./README.md)** - Complete documentation
- **[EXAMPLES.md](./EXAMPLES.md)** - Detailed examples for all roles
- **[INTEGRATION.md](./INTEGRATION.md)** - Step-by-step integration guide
- **[STRUCTURE.md](./STRUCTURE.md)** - Architecture and file structure

---

## 🎉 You're Ready!

Your Role-Based Profile Service is now set up and ready to use. Start creating profiles for your users!

**Need Help?**
- Check the [EXAMPLES.md](./EXAMPLES.md) for complete request/response examples
- Review [INTEGRATION.md](./INTEGRATION.md) for advanced integration patterns
- See [README.md](./README.md) for comprehensive documentation

---

**Happy Coding! 🚀**
