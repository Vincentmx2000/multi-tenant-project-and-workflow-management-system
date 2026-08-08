# Multi-Tenant Project & Workflow Management System — Build Structure

Fresher-level structure: plain MVC (routes → controllers → models), simple middleware functions,
no service/repository layers or dependency injection. Same pattern as your Food-Rescue role checks,
extended with company-scoped multi-tenancy.

---

## 1. Folder Structure

```
project-root/
├── backend/
│   ├── config/
│   │   └── db.js                     # mongoose.connect()
│   │
│   ├── models/
│   │   ├── Company.js                # tenant entity
│   │   ├── User.js                   # has companyId + role
│   │   ├── Project.js                # has companyId
│   │   ├── Task.js                   # has companyId + projectId
│   │   ├── Comment.js                # has companyId + taskId
│   │   ├── ActivityLog.js            # has companyId
│   │   └── Notification.js           # has companyId + userId, read: Boolean
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js         # verifyToken -> sets req.user
│   │   ├── roleMiddleware.js         # checkRole(['Owner','Admin'])
│   │   ├── validateMiddleware.js     # runs express-validator checks, returns 400 on fail
│   │   └── errorMiddleware.js        # centralized error handler
│   │
│   ├── validators/
│   │   ├── authValidators.js         # register/login field rules
│   │   ├── projectValidators.js
│   │   └── taskValidators.js
│   │
│   ├── controllers/
│   │   ├── authController.js         # register, login
│   │   ├── companyController.js      # create company, invite users
│   │   ├── projectController.js      # CRUD (supports ?page, ?limit)
│   │   ├── taskController.js         # CRUD + assign + status update (supports ?page,?status,?priority,?assignedTo)
│   │   ├── commentController.js      # add/edit/delete
│   │   ├── activityController.js     # get logs
│   │   ├── notificationController.js # list, mark as read
│   │   └── dashboardController.js    # stats aggregation
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── companyRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── commentRoutes.js
│   │   ├── activityRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── dashboardRoutes.js
│   │
│   ├── utils/
│   │   ├── generateToken.js          # jwt.sign wrapper
│   │   ├── logActivity.js            # helper to write ActivityLog entries
│   │   └── paginate.js               # small helper: parses ?page/?limit, returns skip/limit
│   │
│   ├── socket/
│   │   └── socketHandler.js          # io.on('connection'), room join by companyId
│   │
│   ├── .env.example
│   ├── server.js                     # app entry, mounts routes + socket
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js              # axios instance with baseURL + interceptor for token
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # user, company, role, login/logout
│   │   │   └── SocketContext.jsx     # socket connection instance, listens for 'notification' events
│   │   │
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── NotificationBell.jsx   # dropdown, unread count, marks read on open
│   │   │   ├── kanban/
│   │   │   │   ├── KanbanBoard.jsx
│   │   │   │   ├── KanbanColumn.jsx
│   │   │   │   └── TaskCard.jsx
│   │   │   ├── tasks/
│   │   │   │   ├── TaskModal.jsx
│   │   │   │   └── CommentSection.jsx
│   │   │   ├── projects/
│   │   │   │   ├── ProjectList.jsx
│   │   │   │   ├── ProjectCard.jsx
│   │   │   │   └── ProjectForm.jsx
│   │   │   └── dashboard/
│   │   │       ├── StatsCard.jsx
│   │   │       └── StatusChart.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Projects.jsx
│   │   │   └── ProjectDetail.jsx     # contains Kanban board
│   │   │
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx    # redirects if no token / wrong role
│   │   │
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## 2. Schema Fields (plan before coding)

**Company**
- name, createdAt

**User**
- name, email, password (hashed)
- companyId (ref Company)
- role: enum ['Owner', 'Admin', 'Manager', 'Member']

**Project**
- title, description, status, deadline
- companyId (ref Company)
- members: [userId]
- createdBy: userId

**Task**
- title, description, priority, status, dueDate, labels: [String]
- companyId (ref Company)
- projectId (ref Project)
- assignedTo: userId
- createdBy: userId

**Comment**
- text, taskId, userId, companyId, createdAt

**ActivityLog**
- companyId, projectId (optional), userId
- action (String, e.g. "Task status changed")
- createdAt

**Notification**
- companyId, userId (recipient)
- message (String, e.g. "You were assigned to Task X")
- type (String: 'assignment' | 'status_change' | 'comment')
- read (Boolean, default false)
- createdAt

> Rule to repeat to yourself on every single query you write: **every `find`, `findOne`, `update`, `delete` must include `companyId` in the filter.** This is the #1 place multi-tenancy bugs slip in.

---

## 2b. Notifications vs. Real-Time Events (these are two different things)

The task asks for Socket.IO on "task assignments, status changes, **and notifications**" — that third item means an actual notification system, not just live UI updates. Build both:

- **Live event** (ephemeral): `io.to(companyId).emit('taskUpdated', data)` — updates other open browsers instantly
- **Notification** (persisted): when a task is assigned or its status changes, also `Notification.create({...})` in the DB, so the recipient sees it even if they weren't online at that moment — then push it live too if they are

Simplest fresher-level flow: in `taskController.js`, after a successful assign/status-update, call both `logActivity()` and a small `createNotification()` helper, then emit the socket event.

---

## 2c. Validation

Use `express-validator` (simplest for a fresher to justify — declarative, well-documented):

- `authValidators.js` — email format, password min length, required fields
- `projectValidators.js` — title required, deadline must be a valid date
- `taskValidators.js` — priority must be one of enum values, dueDate valid

Wire it as: route → validator chain → `validateMiddleware` (checks `validationResult`, returns 400 with field errors) → controller. Controllers stay clean since bad input never reaches them.

---

## 2d. Pagination & Filtering

Applies to `GET /projects` and `GET /tasks`. Keep it simple — query params only, no cursor-based pagination:

```
GET /tasks?page=1&limit=10&status=in-progress&priority=high&assignedTo=<userId>
```

`paginate.js` helper takes `req.query`, returns `{ skip, limit }`; controller builds a `filter` object conditionally (only add keys that were actually passed), always merged with `{ companyId: req.user.companyId }`. Return `{ data, total, page, totalPages }` so the frontend can build pager controls.

---

## 2e. UI / Responsiveness

- Use Tailwind CSS (matches your existing stack/experience) — utility classes make responsive breakpoints (`sm:`, `md:`, `lg:`) fast to apply without a separate CSS file per component
- Minimum bar for "responsive": sidebar collapses to a hamburger/drawer below `md`, Kanban columns scroll horizontally on mobile instead of squashing
- Loading states (skeletons or simple spinners) and empty states ("No tasks yet — create one") on every list view — evaluators notice when these are missing

---

## 3. Role Permission Matrix (plan before coding)

| Action | Owner | Admin | Manager | Member |
|---|---|---|---|---|
| Manage company/users | ✅ | ✅ | ❌ | ❌ |
| Create/delete project | ✅ | ✅ | ❌ | ❌ |
| Create/assign task | ✅ | ✅ | ✅ | ❌ |
| Update own task status | ✅ | ✅ | ✅ | ✅ |
| Comment | ✅ | ✅ | ✅ | ✅ |
| View dashboard | ✅ | ✅ | ✅ | ✅ (own tasks only, optional) |

Keep this simple: two middleware functions cover it —
`checkRole(['Owner','Admin'])` for admin-only routes, and default (any authenticated + same company) for the rest.

---

## 4. Build Order (maps to your 48-hour window)

1. **Backend scaffold** — Express app, MongoDB connection, folder structure, `.env`
2. **Company + User models**, register/login controllers, JWT issuing, express-validator on auth routes
3. **authMiddleware** (verify token → `req.user`) + **roleMiddleware** (`checkRole`)
4. **Project CRUD** — remember `companyId` filter on every query; add pagination + validation
5. **Task CRUD** — assign, priority, status, due date, labels; add pagination/filtering + validation
6. **Kanban endpoints** — likely just `PATCH /tasks/:id/status`, frontend handles drag state
7. **Comments** — simple CRUD tied to taskId
8. **Notifications** — `Notification` model + `createNotification()` helper, called from task assign/status-change
9. **Socket.IO** — company-scoped rooms (`socket.join(companyId)`), emit on task update/comment/assignment/notification
10. **Activity log** — call `logActivity()` helper inside task/project controllers after key actions
11. **Dashboard aggregation** — counts by status, overdue count (`dueDate < now && status !== 'done'`)
12. **Frontend auth flow** — Login/Register, AuthContext, ProtectedRoute
13. **Frontend Kanban** — dnd-kit or react-beautiful-dnd, optimistic update + socket listener
14. **Frontend notification bell** — dropdown + unread count, listens on SocketContext
15. **Frontend dashboard + polish** — stats cards, empty/loading states, Tailwind responsive pass
16. **README + deploy** — Render (backend), Vercel (frontend), Atlas (DB)

---

## 5. Fresher-Level Code Conventions (keep it defensible in interview)

- Controllers: plain async functions, `try/catch`, no classes
- One `if (req.user.companyId.toString() !== resource.companyId.toString()) return res.status(403)...` check per protected route — don't hide this in abstraction, keep it visible and explainable
- Comments in code explaining *why*, not just *what*, especially around role checks and tenant scoping — this is what you'll be asked about
- No premature optimization — a working `.find({ companyId, status })` is fine, don't chase advanced aggregation pipelines unless the dashboard genuinely needs them
- Consistent naming: match your Food-Rescue casing conventions for roles (this was a bug you already fixed once — don't reintroduce it here across register/login/middleware)