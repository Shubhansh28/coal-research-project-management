# Coal Research Project Monitoring System (S&T / R&D)

[![React](https://img.shields.io/badge/React-19.x-blue.svg?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.x-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-v8.x-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5.x-339933.svg?logo=node.js)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma_7.x-2D3748.svg?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1.svg?logo=postgresql)](https://www.postgresql.org/)

A web-based administration and surveillance platform for monitoring **Science & Technology (S&T)** and **Research & Development (R&D)** projects in the coal sector. 

The system enables institutional administrators to oversee project portfolios, enforce budget compliance, review quarterly progress, and allocate scientific personnel, while providing researchers with dedicated workspaces to submit milestone progress and fund utilization statements.

---

## Architecture Overview

```
├── client/                     # Frontend Application (React 19 + Vite + Tailwind CSS v4)
│   ├── src/
│   │   ├── api/                # HTTP-only cookie-enabled API client
│   │   ├── components/         # Shell layouts, modals, status indicators, badges
│   │   ├── context/            # Global AuthContext & session validation
│   │   └── pages/              # Admin & Researcher dashboards, auth screens, directories
└── server/                     # Backend API (Node.js + Express + Prisma ORM)
    ├── prisma/                 # PostgreSQL schema models & migrations
    └── src/
        ├── controllers/        # Request handling & validations
        ├── middleware/         # Cookie JWT authentication & RBAC guards
        ├── routes/             # RESTful API route definitions
        └── services/           # Prisma database query engine
```

---

## Key Features & Capabilities

### 1. Role-Based Access Control (RBAC)
- **ADMINISTRATOR**:
  - Global oversight across all coal research initiatives.
  - Project registration, budget allocation, and specification editing.
  - Controlled lifecycle state machine (`PENDING` $\rightarrow$ `APPROVED` / `REJECTED`, `APPROVED` $\rightarrow$ `COMPLETED`).
  - Allocation and deallocation of researchers to projects.
  - Review, approval, or rejection of quarterly progress reports.
- **RESEARCHER**:
  - Scoped strictly to assigned research projects.
  - Submission of quarterly progress reports ($Q_1 - Q_4$) with completion metrics ($0-100\%$).
  - Submission of quarterly fund receipts and expenditure statements.
  - Access to project-linked documentation and reference materials.

### 2. Secure Cookie-Based Authentication
- Authentication is governed by signed JSON Web Tokens (JWT) stored exclusively in **HTTP-only cookies** to mitigate XSS vulnerabilities.
- Automatic session hydration via `GET /api/auth/me` on boot.
- Protected routes dynamically prevent unauthorized access with role-aware redirection.

### 3. Administrative Cockpit
- Real-time KPI surveillance:
  - Active project breakdown across statuses.
  - Financial monitoring with Indian Rupee (₹) formatting: Sanctioned Budget, Disbursed Grants, and Total Utilized.
  - Actionable alerts for pending quarterly report reviews.
- Searchable and filterable project registry table with inline status transitions and quick management actions.

### 4. Milestone & Fiscal Surveillance
- **Quarterly Progress Tracking**: Structured submission of completed work, percentage progress, and administrative review remarks.
- **Fund Utilization Engine**: Continuous monitoring of received grants vs. recorded expenditures with utilization percentages.
- **Document Management**: Centralized repository for project agreements, sanction letters, and technical reports.

---

## Backend API Specification

| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/api/auth/signup` | `POST` | Public | Register new researcher account |
| `/api/auth/login` | `POST` | Public | Authenticate user & set HTTP-only cookie |
| `/api/auth/me` | `GET` | Authenticated | Validate active session & return user role |
| `/api/dashboard` | `GET` | Admin | Aggregate portfolio metrics & financial summary |
| `/api/dashboard/researcher`| `GET` | Researcher | Assigned projects summary & latest reports |
| `/api/projects` | `POST` | Admin | Register new S&T / R&D project |
| `/api/projects` | `GET` | Authenticated | List all projects (Admin) or assigned (Researcher) |
| `/api/projects/:id` | `GET` | Authenticated | Fetch project details and assigned team |
| `/api/projects/:id` | `PATCH` | Admin | Update project specifications & budget |
| `/api/projects/:id/status` | `PATCH` | Admin | Execute project status transition |
| `/api/projects/:id/available-researchers` | `GET` | Admin | List researchers eligible for allocation |
| `/api/projects/:id/researchers` | `POST` | Admin | Assign researchers to project |
| `/api/projects/:id/researchers/:userId` | `DELETE` | Admin | Remove researcher from project |
| `/api/reports` | `POST` | Researcher | Submit quarterly progress report |
| `/api/reports` | `GET` | Authenticated | List progress reports with filters |
| `/api/reports/:id/review` | `PATCH` | Admin | Review, approve, or reject report |
| `/api/fund-reports` | `POST` | Researcher | File quarterly fund receipt & spend statement |
| `/api/fund-reports` | `GET` | Authenticated | Retrieve fund utilization records |
| `/api/projects/:id/documents` | `POST` | Admin | Upload/link project document |
| `/api/projects/:id/documents` | `GET` | Authenticated | List documents associated with project |

---

## Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/) database instance
- [npm](https://www.npmjs.com/)

---

### 1. Server Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in `server/`:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_ORIGIN=http://localhost:5173
   COOKIE_SAME_SITE=lax
   JWT_SECRET=your_super_secret_jwt_key
   DATABASE_URL="postgresql://username:password@localhost:5432/coal_research_db?schema=public"
   ```

4. Run Prisma database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The API will be available at `http://localhost:5000`.*

---

### 2. Client Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Create a `.env` file in `client/`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```
   *If omitted, defaults to `http://localhost:5000` automatically.*

4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The application will launch at `http://localhost:5173`.*

---

## Quality & Build Verification

Run linting and production bundling in the `client/` workspace:

```bash
cd client
npm run lint    # ESLint verification (0 errors, 0 warnings)
npm run build   # Production asset compilation via Vite
```

---

## Contributing & Development Workflow

This project is developed collaboratively with modular scopes:
- **Phase 1 & 2** (Committed by **RishiByte**): Foundation design system, HTTP-only cookie AuthContext, Shell Navigation, and Admin Project Management Engine.
- **Phase 3 & 4**: Researcher Workspace Hub, Project Details, Quarterly Milestone Submissions, and Fiscal Analytics.
