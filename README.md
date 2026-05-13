# 🎫 Customer Complaint & Resolution Tracking System (CCRTS)

## 📌 Project Overview

The **Customer Complaint & Resolution Tracking System (CCRTS)** is a centralized web-based application designed to help organizations efficiently manage, monitor, and resolve customer complaints and service issues.

The platform enables customers, support agents, supervisors, and administrators to log complaints, assign issues, track progress, and ensure timely resolution — from initiation to closure.

---

## 🚀 Features Implemented

### Authentication & Authorization
- JWT-based secure login and logout
- Role-based access control (Admin, Agent, Supervisor, Customer, Quality Team)
- Customer self-registration

### Complaint Management
- Create and register new complaints with auto-generated complaint IDs (`CCRTS-YYYY-XXXXX`)
- Assign complaints to support agents
- Update complaint status through defined workflow
- Full complaint audit trail and history
- File/document attachments support
- Reopen closed complaints

### Workflow & Escalation
- 7-stage complaint workflow: Open → Assigned → In Progress → Pending → Escalated → Resolved → Closed
- SLA deadline auto-calculated based on priority
- Auto-escalation on SLA breach
- Manual escalation by Supervisor

### SLA Tracking
| Priority | Resolution Time |
|----------|----------------|
| Low | 72 Hours |
| Medium | 48 Hours |
| High | 24 Hours |
| Critical | 4 Hours |

### Dashboard & Analytics
- Total, Open, Resolved, and Escalated complaint counts
- Monthly complaint trend chart
- Category breakdown chart
- Agent performance metrics
- SLA compliance report

### Notifications
- In-app notifications for complaint creation, assignment, status updates, escalation, and resolution
- Mark as read / Mark all read

### Feedback
- Customer satisfaction rating (1–5 stars) after resolution
- Resolution feedback comments

### Search & Filtering
- Search complaints by keyword
- Filter by status, priority, category, and date range
- Pagination support

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 + Vite | Frontend framework |
| React Router v6 | Client-side routing |
| TailwindCSS | Styling |
| Axios | HTTP requests |
| Recharts | Charts and analytics |
| React Hot Toast | Notifications |

### Backend
| Technology | Purpose |
|------------|---------|
| FastAPI (Python) | REST API framework |
| SQLAlchemy | ORM |
| PyMySQL | MySQL driver |
| Python-Jose | JWT authentication |
| Passlib + Bcrypt | Password hashing |
| Pydantic v2 | Data validation |

### Database
| Technology | Purpose |
|------------|---------|
| MySQL 8.0 | Primary database |

### Tools
| Tool | Purpose |
|------|---------|
| GitHub | Version control |
| Postman | API testing |
| VS Code | Code editor |

---

## 📁 Project Structure

```
AFDE_Jan26_<Name>_CCRTS/
│
├── frontend/                  # React + Vite application
│   ├── src/
│   │   ├── api/               # Axios instance & interceptors
│   │   ├── components/        # Reusable UI components
│   │   │   ├── layout/        # Sidebar, Header, Layout
│   │   │   ├── common/        # Badges, Cards, Modals
│   │   │   └── charts/        # Dashboard charts
│   │   ├── pages/             # Application pages
│   │   │   ├── auth/          # Login, Register
│   │   │   ├── dashboard/     # Dashboard
│   │   │   ├── complaints/    # List, Detail, Form
│   │   │   ├── users/         # User management
│   │   │   ├── feedback/      # Feedback list
│   │   │   └── reports/       # Reports page
│   │   ├── context/           # Auth & Notification context
│   │   ├── hooks/             # Custom hooks
│   │   └── utils/             # Formatters, role guards
│   ├── package.json
│   └── vite.config.js
│
├── backend/                   # FastAPI application
│   ├── main.py                # App entry point
│   ├── config.py              # Configuration
│   ├── database.py            # DB connection
│   ├── models/                # SQLAlchemy models
│   ├── schemas/               # Pydantic schemas
│   ├── routers/               # API route handlers
│   ├── services/              # Business logic
│   ├── middleware/            # Auth middleware
│   └── utils/                 # SLA calculator
│
├── database/
│   ├── schema.sql             # Table creation scripts
│   └── seed.sql               # Sample data
│
├── screenshots/               # UI screenshots
├── docs/                      # Additional documentation
├── README.md
├── requirements.txt
└── .gitignore
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- Python 3.10+
- MySQL 8.0+
- Git

---

### 1. Clone the Repository

```bash
git clone https://github.com/<YourUsername>/AFDE_Jan26_<YourName>_CCRTS.git
cd AFDE_Jan26_<YourName>_CCRTS
```

---

### 2. Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Run schema and seed scripts
source database/schema.sql
source database/seed.sql
```

---

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your MySQL credentials and JWT secret

# Start the server
uvicorn main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`
API Docs: `http://localhost:8000/docs`

---

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000/api" > .env

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---
## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Customer registration |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |

### Complaints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/complaints` | List complaints (role-filtered) |
| POST | `/api/complaints` | Create complaint |
| GET | `/api/complaints/{id}` | Get complaint detail |
| PUT | `/api/complaints/{id}` | Update complaint |
| DELETE | `/api/complaints/{id}` | Delete complaint (Admin) |
| POST | `/api/complaints/{id}/assign` | Assign to agent |
| POST | `/api/complaints/{id}/escalate` | Escalate complaint |
| POST | `/api/complaints/{id}/resolve` | Mark as resolved |
| POST | `/api/complaints/{id}/close` | Close complaint |
| POST | `/api/complaints/{id}/reopen` | Reopen complaint |
| GET | `/api/complaints/{id}/history` | Get audit trail |
| GET | `/api/complaints/search` | Search & filter |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Summary counts |
| GET | `/api/dashboard/trends` | Monthly trend data |
| GET | `/api/dashboard/category-breakdown` | Category distribution |
| GET | `/api/dashboard/agent-performance` | Agent metrics |
| GET | `/api/dashboard/sla-status` | SLA compliance |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users (Admin) |
| POST | `/api/users` | Create user (Admin) |
| PUT | `/api/users/{id}` | Update user |
| DELETE | `/api/users/{id}` | Deactivate user (Admin) |

### Feedback
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/feedback/{complaint_id}` | Submit feedback |
| GET | `/api/feedback` | List all feedback |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get user notifications |
| PUT | `/api/notifications/{id}/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all as read |

---

## 🖥️ UI Screens

| Screen | Description |
|--------|-------------|
| Login | User authentication with role detection |
| Register | Customer self-registration |
| Dashboard | Role-aware analytics and charts |
| Complaint List | Filterable table with search |
| Complaint Detail | Full view with timeline history |
| Create Complaint | Form with file upload |
| Agent Work Queue | Agent's assigned complaints |
| User Management | Admin user CRUD |
| Reports | Analytics and export |
| Notifications | In-app notification center |

---

## 📸 Screenshots

> Screenshots are available in the `/screenshots` folder.

- `dashboard.png` — Main dashboard
- `complaint-list.png` — Complaint table with filters
- `complaint-detail.png` — Complaint detail with timeline
- `complaint-create.png` — Create complaint form
- `reports.png` — Reports dashboard
- `user-management.png` — Admin user management
- `postman-api.png` — API testing in Postman

---

## 🗄️ Database Schema

Key tables:
- `roles` — User role definitions
- `users` — All system users
- `categories` — Complaint categories
- `complaints` — Core complaint records
- `complaint_history` — Full audit trail
- `attachments` — Uploaded files
- `feedback` — Customer satisfaction ratings
- `notifications` — In-app notifications

Full schema available in `database/schema.sql`.

---

## 📊 Evaluation Criteria Coverage

| Criteria | Weightage | Implemented |
|----------|-----------|-------------|
| Frontend Development | 20% | ✅ React, TailwindCSS, responsive UI |
| Backend API Development | 25% | ✅ FastAPI REST APIs |
| Database Integration | 15% | ✅ MySQL with relationships |
| CRUD Functionality | 15% | ✅ Full CRUD for all modules |
| Search/Filtering | 10% | ✅ Multi-field search and filters |
| Code Quality & Structure | 10% | ✅ Modular, layered architecture |
| Documentation | 5% | ✅ README, API docs, setup guide |

---


## 👨‍💻 Author

**Name:** `Vustela Dinesh Chandra`
**Batch:** `AFDE_May26`
**Project Code:** `CCRTS`
**GitHub:** [AFDE_May26_DineshChandra_CCRTS]

---

## 📄 License

This project is developed as part of the AFDE Capstone Program — Phase 1.
