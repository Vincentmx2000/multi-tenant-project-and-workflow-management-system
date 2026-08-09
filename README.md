# Multi-Tenant Project & Workflow Management System

A full-stack MERN application for managing projects and tasks across multiple companies (tenants), with role-based access control, a real-time Kanban board, and activity tracking.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

---

## Overview

This app lets multiple companies use the same platform while keeping their data completely isolated from one another. Within each company, four roles (Owner, Admin, Manager, Member) control what actions a user can take, and teams manage work through a live-updating Kanban board.

---

## Screenshots

| Login | Register |
|---|---|
| <img width="960" alt="Login" src="https://github.com/user-attachments/assets/0fc447ae-c828-4b17-8184-1873437763c2" /> | <img width="960" alt="Register" src="https://github.com/user-attachments/assets/7d61c425-c267-4f19-a447-9f8353ecc2bf" /> |

| Dashboard | Projects |
|---|---|
| <img width="960" alt="Dashboard" src="https://github.com/user-attachments/assets/4c1289f7-d887-487d-9fef-374ae008d354" /> | <img width="960" alt="Projects" src="https://github.com/user-attachments/assets/f320f7c0-b139-4fe6-8fd5-3d06c34f8c04" /> |

| Kanban Board | Team Management |
|---|---|
| <img width="960" alt="Tasks" src="https://github.com/user-attachments/assets/deb369b1-61d8-413d-9b8a-207e9aa807a3" /> | <img width="960" alt="Team" src="https://github.com/user-attachments/assets/c267425d-5303-46ff-b610-ed8e2c7fe6c6" /> |

| Activity Log | Comments |
|---|---|
| <img width="960" alt="Activity" src="https://github.com/user-attachments/assets/618c9408-1a38-4176-b5af-b3d31c5feb26" /> | <img width="960" alt="Comments" src="https://github.com/user-attachments/assets/34e974d5-3ebc-455f-8260-300c83a77c6b" /> |

| Notifications |
|---|
| <img width="960" alt="Notification" src="https://github.com/user-attachments/assets/02e3d64c-dd99-466f-b8bb-fc3f141db9bb" /> |

---

## Features

- **JWT Authentication** — register/login with protected routes
- **Role-Based Access Control** — Owner, Admin, Manager, Member, each with distinct permissions, enforced server-side
- **Multi-Tenancy** — every record is scoped to a `companyId`; users can only ever access their own company's data
- **Team Management** — Owner can view all company members and assign/change roles directly in the app, no database access required
- **Project Management** — create, update, delete projects with members, status, and deadlines
- **Task Management** — create and assign tasks with priority, status, due date, and labels
- **Kanban Board** — drag-and-drop status updates with persistent state (`PATCH /tasks/:id/status`)
- **Comments** — add and manage comments on individual tasks
- **Real-Time Updates** — Socket.IO pushes task changes, assignments, and notifications live to other users in the same company
- **Activity Logs** — tracks key project and task actions per company
- **Dashboard** — task/project stats, status distribution chart, overdue task tracking
- **Validation, pagination, and filtering** on core list endpoints
- **Responsive UI** — mobile-friendly layout with collapsible navigation

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS, React Router, dnd-kit, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT, bcrypt |
| Real-Time | Socket.IO |
| Validation | express-validator |

---

## Roles & Permissions

| Action | Owner | Admin | Manager | Member |
|---|---|---|---|---|
| Assign/change team roles | ✅ | ❌ | ❌ | ❌ |
| Create/delete project | ✅ | ✅ | ❌ | ❌ |
| Create/assign task | ✅ | ✅ | ✅ | ❌ |
| Update task status (Kanban) | ✅ | ✅ | ✅ | ✅ |
| Comment on tasks | ✅ | ✅ | ✅ | ✅ |
| View dashboard & activity log | ✅ | ✅ | ✅ | ✅ |

Permissions are enforced by backend middleware (`checkRole`), not just hidden in the UI — verified via direct API testing with role-restricted tokens.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB instance)

### 1. Clone the repo
```bash
git clone https://github.com/Vincentmx2000/multi-tenant-project-and-workflow-management-system.git
cd multi-tenant-project-and-workflow-management-system
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
```
Fill in `.env`:
```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```
Run it:
```bash
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
```
Create `frontend/.env`:
```
VITE_API_URL=http://localhost:5000/api
```
Run it:
```bash
npm run dev
```

App runs at `http://localhost:5173`, API at `http://localhost:5000`.

---

## Test Accounts (Seed Script)

To quickly test all four roles without manually registering each one:
```bash
cd backend
node seed.js
```

This creates one company ("Seed Test Co") with a user per role:

| Email | Password | Role |
|---|---|---|
| owner@seed.com | test1234 | Owner |
| admin@seed.com | test1234 | Admin |
| manager@seed.com | test1234 | Manager |
| member@seed.com | test1234 | Member |

The script is idempotent — safe to re-run, it skips any account that already exists. Once logged in as `owner@seed.com`, use the **Team** page to promote or demote any of the other seeded users.

---

## Multi-Tenancy Design

Every collection (`Project`, `Task`, `Comment`, `ActivityLog`, `Notification`) stores a `companyId`. Every database query is filtered by the requesting user's `companyId`, taken from their verified JWT — never from client-supplied input. This is the core rule the entire access-control model is built on.

---

## Known Limitations

- **Admin** currently has identical permissions to **Owner** for project/task actions. Only role-assignment (the Team page) is restricted to Owner alone, to keep one clear authority for changing permissions. In a production version, Admin's scope would likely be narrowed further (e.g., unable to remove the Owner or delete the company).
- MongoDB Atlas network access is currently open (`0.0.0.0/0`) for development and deployment convenience. In production, this would be scoped to specific server IPs.

---

## Project Structure

```
project-root/
├── backend/
│   ├── config/         # DB connection
│   ├── models/         # Mongoose schemas
│   ├── middleware/     # Auth, role checks, validation, error handling
│   ├── controllers/    # Route logic
│   ├── routes/         # Express routers
│   ├── utils/          # Helpers (JWT, activity logging, notifications)
│   ├── socket/          # Socket.IO handler
│   ├── seed.js          # Test account generator (all 4 roles)
│   └── server.js
│
└── frontend/
    └── src/
        ├── api/         # Axios instance
        ├── context/     # Auth + Socket context
        ├── components/  # Kanban, tasks, projects, dashboard, team, layout
        ├── pages/       # Route-level views
        └── routes/      # Protected route wrapper
```

---

## Author

Built by Vincent A as a technical assessment submission.
