# Deployment Checklist - Role-Based Profile Service

Complete checklist for deploying the Role-Based Profile Service to production.

---

## 📋 Pre-Deployment Checklist

### ✅ Development Environment

- [ ] All files are created and in place
- [ ] Database migration runs successfully
- [ ] All API endpoints tested locally
- [ ] TypeScript compiles without errors
- [ ] No console errors in development

### ✅ Code Quality

- [ ] Code follows project conventions
- [ ] All functions have proper error handling
- [ ] Input validation is comprehensive
- [ ] SQL queries use parameterized statements
- [ ] No hardcoded credentials or secrets

### ✅ Testing

- [ ] Unit tests written for service layer
- [ ] Integration tests for repository layer
- [ ] API endpoint tests (manual or automated)
- [ ] Edge cases tested
- [ ] Error scenarios tested

### ✅ Documentation

- [ ] README.md reviewed
- [ ] API documentation complete
- [ ] Code comments are clear
- [ ] Integration guide followed
- [ ] Examples tested

---

## 🗄️ Database Preparation

### Step 1: Backup Existing Database

```bash
# Create backup before migration
pg_dump -U your_username -d your_database > backup_before_profiles_$(date +%Y%m%d).sql
```

### Step 2: Run Migration in Staging

```bash
# Test migration in staging environment first
NODE_ENV=staging npm run db:migrate-role-profiles
```

### Step 3: Verify Migration

```sql
-- Connect to database
psql -U your_username -d your_database

-- Check table exists
\dt role_based_profiles

-- Check indexes
\di role_based_profiles*

-- Check triggers
\dS role_based_profiles

-- Verify enum type
\dT primary_role

-- Exit
\q
```

### Step 4: Test Rollback Plan

```sql
-- Create rollback script (save as rollback-profiles.sql)
DROP TABLE IF EXISTS role_based_profiles CASCADE;
DROP TYPE IF EXISTS primary_role CASCADE;
DROP FUNCTION IF EXISTS update_role_profiles_updated_at() CASCADE;
DROP VIEW IF EXISTS role_profile_stats CASCADE;
```

---

## 🔧 Configuration

### Environment Variables

Ensure these are set in production:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database
# OR
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=your-database
DB_USER=your-username
DB_PASSWORD=your-secure-password

# Application
NODE_ENV=production
PORT=3000

# Security
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=1h
```

### Database Connection Pool

Update `src/config/database.ts` for production:

```typescript
const pool = new Pool({
  connectionString: buildConnectionString(),
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});
```

---

## 🔐 Security Hardening

### 1. Add Authentication Middleware

```typescript
// In your main app file
import { authMiddleware } from './modules/auth/auth.middleware';
import roleProfilesRoutes from './modules/role-profiles/role-profiles.routes';

app.use('/api/role-profiles', authMiddleware, roleProfilesRoutes);
```

### 2. Add Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const profileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/role-profiles', profileLimiter);
```

### 3. Add CORS Configuration

```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 4. Add Helmet for Security Headers

```typescript
import helmet from 'helmet';

app.use(helmet());
```

### 5. Enable HTTPS

```typescript
// Use HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

---

## 📊 Monitoring Setup

### 1. Add Logging

```typescript
import morgan from 'morgan';

// Production logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}
```

### 2. Add Error Tracking

```typescript
// Example with Sentry
import * as Sentry from '@sentry/node';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
  });
}
```

### 3. Add Health Check Endpoint

```typescript
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await pool.query('SELECT 1');
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    });
  }
});
```

### 4. Add Metrics Endpoint

```typescript
app.get('/metrics', async (req, res) => {
  try {
    const stats = await roleProfilesService.getProfileStats();
    
    res.status(200).json({
      profiles: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});
```

---

## 🚀 Deployment Steps

### Step 1: Build TypeScript

```bash
npm run build
```

Verify `dist/` folder is created with compiled JavaScript.

### Step 2: Run Tests

```bash
npm test
```

Ensure all tests pass before deploying.

### Step 3: Deploy to Staging

```bash
# Deploy to staging environment
git push staging main

# Or use your deployment tool
# Example: Heroku
heroku git:remote -a your-staging-app
git push heroku main
```

### Step 4: Run Migration in Staging

```bash
# SSH into staging server or use deployment tool
heroku run npm run db:migrate-role-profiles -a your-staging-app
```

### Step 5: Test in Staging

```bash
# Test all endpoints
curl https://your-staging-app.com/health
curl https://your-staging-app.com/api/role-profiles/stats
```

### Step 6: Deploy to Production

```bash
# Deploy to production
git push production main

# Or
heroku git:remote -a your-production-app
git push heroku main
```

### Step 7: Run Migration in Production

```bash
# Run migration
heroku run npm run db:migrate-role-profiles -a your-production-app

# Or SSH and run
ssh your-server
cd /path/to/app
npm run db:migrate-role-profiles
```

### Step 8: Verify Production

```bash
# Check health
curl https://your-app.com/health

# Check stats
curl https://your-app.com/api/role-profiles/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔍 Post-Deployment Verification

### Database Checks

```sql
-- Connect to production database
psql -U your_username -d your_database

-- Verify table
SELECT COUNT(*) FROM role_based_profiles;

-- Check indexes are being used
EXPLAIN ANALYZE SELECT * FROM role_based_profiles WHERE user_id = 'some-uuid';

-- Check table size
SELECT pg_size_pretty(pg_total_relation_size('role_based_profiles'));
```

### API Checks

```bash
# Test create profile
curl -X POST https://your-app.com/api/role-profiles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"userId":"test-uuid","role":"student",...}'

# Test get profile
curl https://your-app.com/api/role-profiles/user/test-uuid \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test search
curl "https://your-app.com/api/role-profiles/search?q=test" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Performance Checks

```bash
# Check response times
time curl https://your-app.com/api/role-profiles/stats

# Check database query performance
# Run EXPLAIN ANALYZE on common queries
```

---

## 📈 Performance Optimization

### 1. Enable Database Query Caching (Redis)

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache profile data
async function getCachedProfile(userId: string) {
  const cached = await redis.get(`profile:${userId}`);
  if (cached) return JSON.parse(cached);
  
  const profile = await roleProfilesService.getProfileByUserId(userId);
  await redis.setex(`profile:${userId}`, 3600, JSON.stringify(profile));
  
  return profile;
}
```

### 2. Add Database Connection Pooling

Already configured in `database.ts`, but verify settings:

```typescript
const pool = new Pool({
  max: 20, // Adjust based on load
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 3. Add Compression

```typescript
import compression from 'compression';

app.use(compression());
```

### 4. Optimize JSONB Queries

```sql
-- Create additional indexes if needed
CREATE INDEX idx_role_profiles_skills 
  ON role_based_profiles USING GIN ((role_specific_data->'skills'));

CREATE INDEX idx_role_profiles_name 
  ON role_based_profiles ((common_fields->>'name'));
```

---

## 🔄 Rollback Plan

### If Issues Occur

1. **Revert Application Code**
   ```bash
   git revert HEAD
   git push production main
   ```

2. **Rollback Database (if needed)**
   ```bash
   psql -U your_username -d your_database < rollback-profiles.sql
   ```

3. **Restore from Backup**
   ```bash
   psql -U your_username -d your_database < backup_before_profiles_YYYYMMDD.sql
   ```

---

## 📊 Monitoring Checklist

### Application Monitoring

- [ ] Error tracking configured (Sentry, etc.)
- [ ] Logging configured (CloudWatch, Datadog, etc.)
- [ ] Performance monitoring (New Relic, etc.)
- [ ] Uptime monitoring (Pingdom, UptimeRobot, etc.)

### Database Monitoring

- [ ] Query performance monitoring
- [ ] Connection pool monitoring
- [ ] Disk space monitoring
- [ ] Backup verification

### Alerts Setup

- [ ] High error rate alerts
- [ ] Slow query alerts
- [ ] Database connection alerts
- [ ] Disk space alerts

---

## 📝 Documentation Updates

### Update Internal Docs

- [ ] Add API endpoints to internal documentation
- [ ] Update architecture diagrams
- [ ] Document deployment process
- [ ] Update runbooks

### Update External Docs

- [ ] Update API documentation for clients
- [ ] Update changelog
- [ ] Notify stakeholders

---

## ✅ Final Checklist

### Before Going Live

- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Database migration tested
- [ ] Staging environment verified
- [ ] Security hardening complete
- [ ] Monitoring configured
- [ ] Rollback plan documented
- [ ] Team notified
- [ ] Documentation updated

### After Going Live

- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify database queries
- [ ] Test critical user flows
- [ ] Monitor for 24 hours
- [ ] Collect feedback
- [ ] Document lessons learned

---

## 🆘 Troubleshooting

### Common Issues

**Issue: Migration fails**
```bash
# Check database connection
psql -U your_username -d your_database -c "SELECT NOW();"

# Check if table already exists
psql -U your_username -d your_database -c "\dt role_based_profiles"

# Check logs
tail -f /var/log/postgresql/postgresql.log
```

**Issue: High response times**
```sql
-- Check slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan 
FROM pg_stat_user_indexes 
WHERE tablename = 'role_based_profiles';
```

**Issue: Database connection errors**
```typescript
// Check pool status
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Alert monitoring system
});

// Check connection count
const { rows } = await pool.query(
  'SELECT count(*) FROM pg_stat_activity WHERE datname = $1',
  [process.env.DB_NAME]
);
console.log('Active connections:', rows[0].count);
```

---

## 📞 Support Contacts

**Development Team:**
- Lead Developer: [name@email.com]
- Backend Team: [team@email.com]

**Operations Team:**
- DevOps Lead: [name@email.com]
- On-call: [oncall@email.com]

**Emergency Contacts:**
- Emergency Hotline: [phone]
- Slack Channel: #production-alerts

---

## 🎉 Success Criteria

Deployment is successful when:

✅ All API endpoints respond correctly  
✅ Database queries perform well (< 100ms)  
✅ No error spikes in monitoring  
✅ User flows work end-to-end  
✅ No security vulnerabilities  
✅ Monitoring and alerts active  
✅ Team is confident in rollback plan  

---

**Deployment Date:** _____________  
**Deployed By:** _____________  
**Verified By:** _____________  
**Status:** ⬜ Success ⬜ Rollback ⬜ Issues  

---

**Good luck with your deployment! 🚀**
