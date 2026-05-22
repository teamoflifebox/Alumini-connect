# Integration Guide - Role-Based Profile Service

This guide walks you through integrating the Role-Based Profile Service into your Alumni Connect application.

## 📋 Prerequisites

- Node.js and npm installed
- PostgreSQL database running
- Existing user authentication system
- TypeScript configured

## 🚀 Step-by-Step Integration

### Step 1: Run Database Migration

First, create the database table and indexes:

```bash
npm run db:migrate-role-profiles
```

This will:
- Create the `role_based_profiles` table
- Set up JSONB indexes for efficient querying
- Create triggers for automatic timestamp updates
- Create a statistics view

**Verify Migration:**
```bash
# Connect to your PostgreSQL database
psql -U your_username -d your_database

# Check if table exists
\dt role_based_profiles

# Check table structure
\d role_based_profiles

# Exit
\q
```

### Step 2: Register Routes in Main Application

Open your main application file (e.g., `src/app.ts` or `src/createApp.ts`) and add the role-profiles routes:

```typescript
import express from 'express';
import roleProfilesRoutes from './modules/role-profiles/role-profiles.routes';

const app = express();

// ... other middleware ...

// Register role-profiles routes
app.use('/api/role-profiles', roleProfilesRoutes);

// ... other routes ...

export default app;
```

### Step 3: Add Authentication Middleware (Recommended)

Protect the routes with authentication:

```typescript
import { authMiddleware } from './modules/auth/auth.middleware';
import roleProfilesRoutes from './modules/role-profiles/role-profiles.routes';

// Apply authentication to all role-profile routes
app.use('/api/role-profiles', authMiddleware, roleProfilesRoutes);
```

### Step 4: Add Authorization Middleware (Optional but Recommended)

Create authorization rules to ensure users can only access/modify their own profiles:

**Create `role-profiles.middleware.ts`:**

```typescript
import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../auth/auth.types';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Ensure user can only access their own profile
 */
export const canAccessProfile = (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  const currentUser = req.user;

  if (!currentUser) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  // Allow if user is accessing their own profile or is an admin
  if (currentUser.id === userId || currentUser.primary_role === 'admin') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'You do not have permission to access this profile',
  });
};

/**
 * Ensure only admins can access this route
 */
export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  const currentUser = req.user;

  if (!currentUser) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (currentUser.primary_role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }

  next();
};
```

**Update routes with authorization:**

```typescript
import { Router } from 'express';
import { roleProfilesController } from './role-profiles.controller';
import { canAccessProfile, adminOnly } from './role-profiles.middleware';
import { authMiddleware } from '../auth/auth.middleware';

const router = Router();

// Public routes (no auth required)
// ... none for now ...

// Protected routes (auth required)
router.post('/', authMiddleware, (req, res, next) => 
  roleProfilesController.createProfile(req, res, next)
);

router.get('/user/:userId', authMiddleware, canAccessProfile, (req, res, next) => 
  roleProfilesController.getProfileByUserId(req, res, next)
);

router.put('/user/:userId', authMiddleware, canAccessProfile, (req, res, next) => 
  roleProfilesController.updateProfile(req, res, next)
);

router.delete('/user/:userId', authMiddleware, canAccessProfile, (req, res, next) => 
  roleProfilesController.deleteProfile(req, res, next)
);

// Admin-only routes
router.get('/', authMiddleware, adminOnly, (req, res, next) => 
  roleProfilesController.getAllProfiles(req, res, next)
);

router.get('/stats', authMiddleware, adminOnly, (req, res, next) => 
  roleProfilesController.getProfileStats(req, res, next)
);

export default router;
```

### Step 5: Auto-Create Profile on User Registration

Integrate profile creation into your user registration flow:

**In `auth.service.ts` or similar:**

```typescript
import { roleProfilesService } from '../role-profiles/role-profiles.service';

export class AuthService {
  async register(data: RegisterDTO) {
    // 1. Create user account
    const user = await this.createUser(data);

    // 2. Auto-create profile
    try {
      await roleProfilesService.createProfile({
        userId: user.id,
        role: user.primary_role,
        commonFields: {
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          profilePhoto: user.avatar_url || undefined,
        },
        roleSpecificData: this.getDefaultRoleData(user.primary_role),
      });
    } catch (error) {
      console.error('Failed to create profile:', error);
      // Decide whether to rollback user creation or continue
    }

    return user;
  }

  private getDefaultRoleData(role: PrimaryRole) {
    switch (role) {
      case 'student':
        return {
          skills: [],
          education: [],
          projects: [],
          interests: [],
          internshipAvailable: false,
          internshipExperience: [],
        };
      case 'alumni':
        return {
          skills: [],
          workExperience: [],
          education: [],
          achievements: [],
          interests: [],
        };
      case 'recruiter':
        return {
          companyName: '',
          designation: '',
          hiringRoles: [],
          industry: '',
        };
      case 'admin':
        return {
          department: '',
          permissions: [],
          systemAccessLevel: 'read-only' as const,
        };
      case 'donor':
        return {
          contributionHistory: [],
          interests: [],
          donationType: 'individual' as const,
          engagementActivity: [],
        };
      default:
        throw new Error(`Unknown role: ${role}`);
    }
  }
}
```

### Step 6: Add Activity Tracking

Track user activities across your application:

**Example: Track job application:**

```typescript
import { roleProfilesService } from '../role-profiles/role-profiles.service';

// In your jobs service
export class JobsService {
  async applyToJob(userId: string, jobId: string) {
    // ... job application logic ...

    // Track activity
    await roleProfilesService.addActivity(userId, {
      action: 'job_applied',
      metadata: {
        jobId,
        appliedAt: new Date().toISOString(),
      },
    });
  }
}
```

**Example: Track login:**

```typescript
// In your auth service
export class AuthService {
  async login(email: string, password: string) {
    const user = await this.validateCredentials(email, password);

    // Track login activity
    try {
      await roleProfilesService.addActivity(user.id, {
        action: 'login',
        metadata: {
          timestamp: new Date().toISOString(),
          ipAddress: req.ip,
        },
      });
    } catch (error) {
      // Log but don't fail login
      console.error('Failed to track login activity:', error);
    }

    return user;
  }
}
```

### Step 7: Frontend Integration Examples

**Fetch user profile:**

```typescript
// Frontend API service
export async function getUserProfile(userId: string) {
  const response = await fetch(`/api/role-profiles/user/${userId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }

  return response.json();
}
```

**Update profile:**

```typescript
export async function updateProfile(userId: string, updates: any) {
  const response = await fetch(`/api/role-profiles/user/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Failed to update profile');
  }

  return response.json();
}
```

**Search profiles:**

```typescript
export async function searchProfiles(query: string, role?: string) {
  const params = new URLSearchParams({ q: query });
  if (role) params.append('role', role);

  const response = await fetch(`/api/role-profiles/search?${params}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  return response.json();
}
```

## 🔧 Configuration

### Environment Variables

No additional environment variables are required. The module uses the existing database connection from `src/config/database.ts`.

### TypeScript Configuration

Ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  }
}
```

## 🧪 Testing the Integration

### 1. Test Database Connection

```bash
ts-node -e "import pool from './src/config/database'; pool.query('SELECT NOW()').then(r => console.log(r.rows[0])).catch(console.error).finally(() => pool.end());"
```

### 2. Test API Endpoints

**Create a test profile:**

```bash
curl -X POST http://localhost:3000/api/role-profiles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId": "test-user-uuid",
    "role": "student",
    "commonFields": {
      "name": "Test User",
      "email": "test@example.com"
    },
    "roleSpecificData": {
      "skills": ["JavaScript"],
      "education": [{
        "institution": "Test University",
        "degree": "BS",
        "fieldOfStudy": "CS",
        "startYear": 2020
      }],
      "projects": [],
      "interests": [],
      "internshipAvailable": false,
      "internshipExperience": []
    }
  }'
```

**Get profile:**

```bash
curl http://localhost:3000/api/role-profiles/user/test-user-uuid \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Test with Postman

Import the following collection:

```json
{
  "info": {
    "name": "Role-Based Profiles API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create Profile",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/role-profiles",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"userId\": \"{{userId}}\",\n  \"role\": \"student\",\n  \"commonFields\": {\n    \"name\": \"Test User\",\n    \"email\": \"test@example.com\"\n  },\n  \"roleSpecificData\": {\n    \"skills\": [\"JavaScript\"],\n    \"education\": [],\n    \"projects\": [],\n    \"interests\": [],\n    \"internshipAvailable\": false,\n    \"internshipExperience\": []\n  }\n}"
        }
      }
    },
    {
      "name": "Get Profile",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/role-profiles/user/{{userId}}"
      }
    }
  ]
}
```

## 🐛 Troubleshooting

### Issue: "Table does not exist"

**Solution:** Run the migration script:
```bash
npm run db:migrate-role-profiles
```

### Issue: "Validation failed"

**Solution:** Check that your request body matches the role-specific schema. See `EXAMPLES.md` for valid examples.

### Issue: "Profile already exists"

**Solution:** Each user can only have one profile. Use the update endpoint instead:
```http
PUT /api/role-profiles/user/:userId
```

### Issue: "Cannot read property 'id' of undefined"

**Solution:** Ensure authentication middleware is properly setting `req.user`.

### Issue: TypeScript errors

**Solution:** Install missing type definitions:
```bash
npm install --save-dev @types/pg
```

## 📊 Monitoring and Logging

Add logging to track profile operations:

```typescript
import { roleProfilesService } from './role-profiles.service';

// Wrap service calls with logging
export async function createProfileWithLogging(data: CreateProfileDTO) {
  console.log(`[Profile] Creating profile for user ${data.userId} with role ${data.role}`);
  
  try {
    const profile = await roleProfilesService.createProfile(data);
    console.log(`[Profile] Successfully created profile ${profile.id}`);
    return profile;
  } catch (error) {
    console.error(`[Profile] Failed to create profile:`, error);
    throw error;
  }
}
```

## 🔐 Security Best Practices

1. **Always use authentication middleware** on all routes
2. **Implement rate limiting** to prevent abuse
3. **Validate user permissions** before allowing profile access
4. **Sanitize user inputs** to prevent XSS attacks
5. **Use HTTPS** in production
6. **Implement CORS** properly
7. **Log security events** (failed access attempts, etc.)

## 📈 Performance Optimization

1. **Use pagination** for list endpoints
2. **Implement caching** for frequently accessed profiles (Redis)
3. **Add database indexes** (already included in migration)
4. **Use connection pooling** (already configured)
5. **Optimize JSONB queries** with GIN indexes

## 🎯 Next Steps

1. ✅ Run database migration
2. ✅ Register routes in main app
3. ✅ Add authentication middleware
4. ✅ Test API endpoints
5. ✅ Integrate with user registration
6. ✅ Add activity tracking
7. ✅ Build frontend UI
8. ✅ Deploy to production

## 📚 Additional Resources

- [README.md](./README.md) - Complete documentation
- [EXAMPLES.md](./EXAMPLES.md) - Request/response examples for all roles
- [PostgreSQL JSONB Documentation](https://www.postgresql.org/docs/current/datatype-json.html)
- [Zod Validation Documentation](https://zod.dev/)

## 💬 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the examples in `EXAMPLES.md`
3. Check the API documentation in `README.md`
4. Review the code comments in the source files

---

**Happy Coding! 🚀**
