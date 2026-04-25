# AlumniConnect
**The Next-Gen Alumni Networking, Mentorship, Job & Scholarship Enterprise Platform**

A production-ready platform seamlessly connecting Students, Alumni, Recruiters, and Admins. Built heavily around transparent mentorship matching and highly-auditable scholarship donation systems.

## 🚀 Tech Stack

- **Frontend:** React (Vite), Tailwind CSS v4, Zustand, React Query, Framer Motion, Lucide Icons, TypeScript
- **Backend:** Node.js, Express.js, TypeScript, PostgreSQL (pg)
- **Database:** PostgreSQL
- **Security:** Helmet, CORS, standard JWT workflows (to be implemented over basic auth structures)

## 📁 Repository Structure
\`\`\`
.
├── backend/                  # Node.js + Express backend
│   ├── src/
│   │   ├── config/           # Database & env configs
│   │   ├── controllers/      # API Request handlers 
│   │   ├── middlewares/      # Auth & Error handling
│   │   ├── models/           # DB wrapper patterns/ORM
│   │   ├── routes/           # API Routers
│   │   ├── services/         # Core business logic (Clean Architecture)
│   │   └── utils/            # Helper functions
│   ├── tsconfig.json
│   └── package.json
├── database/                 # Schema & Seed SQL scripts
│   ├── schema.sql            # Main database tables architecture
│   └── seed_data.sql         # Sample platform data
├── frontend/                 # React.js SPA powered by Vite
│   ├── src/
│   │   ├── components/       # Reusable UI elements
│   │   ├── pages/            # Application views (e.g. LandingPage)
│   │   ├── store/            # Zustand global state (auth, etc)
│   │   └── index.css         # Theme token definitions (Dark/Orange profile)
│   ├── vite.config.ts
│   └── tailwind.config.ts    # Replaced by @tailwindcss/vite in index.css
└── README.md
\`\`\`

## 🛠 Setup & Installation Local Environment

### 1. Database Setup
1. Define a PostgreSQL database named `alumniconnect`.
2. Run `database/schema.sql` against it to create tables and indexes.
3. (Optional) Run `database/seed_data.sql` to populate sample users (Admin, Alumni, Student, Recruiter), scholarships, and applications.
> Ensure `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT` match your system.

### 2. Backend Initialization
\`\`\`bash
cd backend
npm install
# Create a .env file containing:
# PORT=5000
# DB_USER=postgres
# DB_HOST=localhost
# DB_NAME=alumniconnect
# DB_PASSWORD=your_password
# DB_PORT=5432
npm run build
npm run start # Or configure dev scripts via nodemon
\`\`\`

### 3. Frontend Initialization
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`
Visit `http://localhost:5173` to view the premium dark-mode, orange-accented Landing Page dynamically animated using Framer Motion. 

## ☁️ Deployment Instructions

### Frontend (Vercel/Netlify)
1. Link your repository.
2. Select \`Vite\` or \`React\` framework presets.
3. Build command: \`npm run build\`. 
4. Output directory: \`dist\`.
Environment variables: Configure Vite API endpoint targets (e.g., \`VITE_API_BASE_URL\`).

### Backend (Render/Heroku/AWS ECS)
1. Standard Node.js environment build.
2. Build command: \`npm install && npx tsc\`
3. Start command: \`node dist/server.js\`
4. Inject production environment variables for PostgreSQL connection.

### PostgreSQL (Supabase/Neon/RDS)
Host the database separately utilizing platforms like Supabase for immediate scale. Connection pools should be managed accordingly in \`backend/config/db.ts\`.

## 💼 Core Functionalities Built
- Designed according to Clean Architecture reference architectures.
- Highly optimized premium, conversion-optimized Landing Page.
- Strict Role Based Access SQL design mapping (Student, Alumni, etc).
- Comprehensive Scholarship workflow with audit logs, academic scoring integrations, and disbursements.
