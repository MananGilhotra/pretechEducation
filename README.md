<![CDATA[<div align="center">

# 🎓 Pretech Computer Education — Institute Management Platform

**A production-grade, full-stack web application for end-to-end management of educational institutes — built and deployed as a freelance project for a real-world client.**

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Deployed](https://img.shields.io/badge/Live-Vercel%20%2B%20Render-00C7B7?style=for-the-badge&logo=vercel&logoColor=white)](#deployment)

---

**🔗 Live Demo:** [pretecheducation.vercel.app](https://pretecheducation.vercel.app) &nbsp;|&nbsp; **📡 API:** [pretecheducation-1.onrender.com](https://pretecheducation-1.onrender.com)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Role-Based Access](#-role-based-access)
- [Screenshots](#-screenshots)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [License](#-license)

---

## 🧾 Overview

Developed as a **freelance project** for *Pretech Computer Education*, this platform replaces legacy pen-and-paper workflows with a unified digital system that handles the complete lifecycle of an educational institute — from student enquiries and admissions to fee collection, attendance tracking, test management, teacher payroll, and daily financial bookkeeping.

### Business Impact
- **Eliminated manual record-keeping** — digitised 100 % of admissions, payments, and attendance data
- **Reduced administrative overhead** by automating fee reminders, receipt generation, and installment tracking
- **Enabled real-time visibility** into institute finances via an integrated daybook and analytics dashboard
- **Improved student engagement** with an online test module and self-service student portal

---

## ✨ Key Features

### 🏠 Public-Facing Website
| Feature | Description |
|---|---|
| **Landing Page** | Modern, responsive homepage with animated hero section (Three.js / GSAP), course catalog, testimonials, and statistics |
| **Course Catalog** | Dynamic listing of all courses with fees, duration, and descriptions |
| **Online Enquiry** | Public enquiry form with email notification to admin |
| **Self-Service Admission** | Multi-step admission form with photo & signature upload, auto-generated Student ID |
| **Online Fee Payment** | Razorpay-integrated payment gateway supporting full & installment plans |

### 🛡️ Admin Dashboard
| Feature | Description |
|---|---|
| **Analytics Dashboard** | Real-time stats — total students, revenue, pending fees, recent admissions (Recharts) |
| **Course Management** | Full CRUD for courses with batch timings and pricing |
| **Admissions Management** | View, search, filter, approve/reject admissions; inline editing of student details; CSV export |
| **Fee & Installment Tracker** | Per-student fee breakdown, installment schedule management, discount application, payment status tracking |
| **Payment History** | Comprehensive ledger with filters; downloadable PDF receipts (PDFKit) |
| **Teacher Management** | Add / view / edit teacher profiles, assign subjects |
| **Salary Management** | Monthly salary processing and tracking for teaching staff |
| **Expense Management** | Record and categorise operational expenses |
| **Attendance System** | Mark & view daily attendance for students and teachers with date-range reports |
| **Test & Examination** | Create tests (MCQ / descriptive), assign to courses, auto-grade submissions, view analytics |
| **Day Book** | Daily financial journal aggregating fees collected, salaries disbursed, and expenses incurred |
| **Certificate Generator** | Auto-generated printable course-completion certificates per student |
| **Student ID Card** | Printable ID cards with QR code, photo, and student details |

### 👨‍🎓 Student Portal
| Feature | Description |
|---|---|
| **Dashboard** | View admission status, course details, payment history, and upcoming tests |
| **Take Tests** | Attempt assigned tests online with timed submissions |
| **View Results** | Detailed score breakdowns and answer analysis |

### 👩‍🏫 Teacher Portal
| Feature | Description |
|---|---|
| **Dashboard** | View assigned courses, attendance, salary history, and tests |

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | Component-based UI with hooks and context API |
| **Vite 5** | Lightning-fast HMR and optimised production builds |
| **Tailwind CSS 3** | Utility-first responsive styling with dark mode support |
| **React Router v6** | Client-side routing with protected route guards |
| **Framer Motion** | Page transitions and micro-animations |
| **Three.js + R3F** | 3D animated elements on the landing page |
| **GSAP** | Advanced scroll-driven animations |
| **Recharts** | Data visualisation for dashboard analytics |
| **React Hook Form** | Performant form handling with validation |
| **React Hot Toast** | Toast notifications |
| **React Icons** | Icon library |
| **react-qr-code** | QR code generation for student ID cards |
| **Axios** | HTTP client with interceptors for auth tokens |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express 4** | RESTful API server |
| **MongoDB + Mongoose 8** | NoSQL database with schema validation |
| **JWT (jsonwebtoken)** | Stateless authentication with role-based access control |
| **bcryptjs** | Secure password hashing |
| **Multer** | Multipart file uploads (photos, signatures) |
| **PDFKit** | Server-side PDF receipt generation |
| **Nodemailer** | Transactional email (SMTP) |
| **Razorpay SDK** | Payment order creation and verification |
| **dotenv** | Environment variable management |
| **CORS** | Cross-origin request handling |

### Infrastructure
| Service | Purpose |
|---|---|
| **Vercel** | Frontend hosting with edge CDN and SPA rewrites |
| **Render** | Backend hosting with auto-deploy from Git |
| **MongoDB Atlas** | Managed cloud database |
| **Razorpay** | Payment processing (test + live modes) |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Vercel)                      │
│  React 18 + Vite + Tailwind + Three.js + Framer Motion  │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Public   │  │  Admin   │  │ Student  │  │ Teacher │ │
│  │  Pages    │  │  Panel   │  │  Portal  │  │ Portal  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
│       └──────────────┼───────────┬─┘             │      │
│                      │  Axios + JWT              │      │
└──────────────────────┼───────────────────────────┘      │
                       ▼                                   │
┌──────────────────────────────────────────────────────────┐
│                   API SERVER (Render)                     │
│           Node.js + Express + Mongoose                   │
│                                                          │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐  │
│  │  Auth   │ │ Courses  │ │Admissions│ │  Payments   │  │
│  │  API    │ │  API     │ │   API    │ │  (Razorpay) │  │
│  └────┬────┘ └────┬─────┘ └────┬─────┘ └─────┬───────┘  │
│  ┌────┴────┐ ┌────┴─────┐ ┌────┴─────┐ ┌─────┴───────┐  │
│  │Teachers │ │Attendance│ │  Tests   │ │  Expenses   │  │
│  │  API    │ │  API     │ │   API    │ │  + Daybook  │  │
│  └─────────┘ └──────────┘ └──────────┘ └─────────────┘  │
│                       │                                  │
│        JWT Auth Middleware + Role Guards                  │
└───────────────────────┬──────────────────────────────────┘
                        ▼
┌──────────────────────────────────────────────────────────┐
│                  MongoDB Atlas (Cloud)                    │
│                                                          │
│  Collections: Users, Courses, Admissions, Payments,      │
│  Enquiries, Teachers, Attendance, TeacherAttendance,     │
│  Tests, TestSubmissions, Salaries, Expenses              │
└──────────────────────────────────────────────────────────┘
```

---

## 🔐 Role-Based Access

The platform implements **three-tier role-based access control** enforced at both the API middleware and frontend route-guard levels:

| Role | Access Level |
|---|---|
| **Admin** | Full platform access — manage all modules, approve admissions, process salaries, view financials |
| **Student** | View own admission details, payment history, take assigned tests, view results |
| **Teacher** | View assigned courses, attendance records, salary slips, and tests |

Authentication is handled via **JWT tokens** stored client-side and validated on every protected API request.

---

## 📸 Screenshots

> *Screenshots can be added here. Run the application locally or visit the live demo to capture them.*

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Login and receive JWT |
| `GET` | `/api/auth/me` | 🔒 User | Get authenticated profile |

### Courses
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/courses` | Public | List all courses |
| `POST` | `/api/courses` | 🔒 Admin | Create a course |
| `PUT` | `/api/courses/:id` | 🔒 Admin | Update a course |
| `DELETE` | `/api/courses/:id` | 🔒 Admin | Delete a course |

### Admissions
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/admissions` | Public | Submit admission application |
| `GET` | `/api/admissions` | 🔒 Admin | List all admissions |
| `GET` | `/api/admissions/me` | 🔒 Student | Get own admission |
| `PUT` | `/api/admissions/:id/approve` | 🔒 Admin | Approve an admission |
| `GET` | `/api/admissions/export` | 🔒 Admin | Export admissions as CSV |

### Payments
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/payments/create-order` | 🔒 User | Create Razorpay order |
| `POST` | `/api/payments/verify` | 🔒 User | Verify payment signature |
| `GET` | `/api/payments` | 🔒 Admin | List all payments |
| `GET` | `/api/payments/me` | 🔒 Student | Get own payments |
| `GET` | `/api/payments/:id/receipt` | 🔒 User | Download PDF receipt |

### Teachers & Salaries
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/teachers` | 🔒 Admin | Add a teacher |
| `GET` | `/api/teachers` | 🔒 Admin | List teachers |
| `PUT` | `/api/teachers/:id` | 🔒 Admin | Update teacher |
| `DELETE` | `/api/teachers/:id` | 🔒 Admin | Remove teacher |

### Attendance, Tests, Expenses, Daybook
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/attendance` | 🔒 Admin | Mark attendance |
| `GET` | `/api/attendance` | 🔒 Admin | Fetch attendance records |
| `POST` | `/api/tests` | 🔒 Admin | Create a test |
| `GET` | `/api/tests` | 🔒 Auth | List tests |
| `POST` | `/api/expenses` | 🔒 Admin | Record expense |
| `GET` | `/api/expenses` | 🔒 Admin | List expenses |
| `GET` | `/api/daybook` | 🔒 Admin | Fetch daybook summary |

### Dashboard
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | 🔒 Admin | Aggregated statistics |
| `GET` | `/api/dashboard/recent` | 🔒 Admin | Recent admissions feed |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB** (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Razorpay** account ([dashboard.razorpay.com](https://dashboard.razorpay.com)) — test keys work for development

### 1. Clone the Repository

```bash
git clone https://github.com/MananGilhotra/pretechEducation.git
cd pretechEducation
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env   # Fill in your credentials
npm install
npm run dev             # Starts on http://localhost:5000
```

**Backend Environment Variables** (`backend/.env`):

| Variable | Description |
|---|---|
| `PORT` | Server port (default: `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `RAZORPAY_KEY_ID` | Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret |
| `EMAIL_HOST` | SMTP host (e.g. `smtp.gmail.com`) |
| `EMAIL_PORT` | SMTP port (e.g. `587`) |
| `EMAIL_USER` | SMTP username |
| `EMAIL_PASS` | SMTP password / app password |
| `CLIENT_URL` | Frontend URL (e.g. `http://localhost:5173`) |

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev             # Starts on http://localhost:5173
```

**Frontend Environment Variables** (`frontend/.env`):

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (default: `/api`) |
| `VITE_RAZORPAY_KEY_ID` | Razorpay Key ID (public) |

### 4. Create Admin Account

```bash
# Using the helper script:
node backend/createAdmin.js

# Or directly in MongoDB:
db.users.insertOne({
  name: "Admin",
  email: "admin@pretech.in",
  password: "<bcrypt-hashed-password>",
  role: "admin"
})
```

---

## ☁️ Deployment

### Frontend → Vercel

1. Import the repository into [Vercel](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. Add environment variables (`VITE_API_URL`, `VITE_RAZORPAY_KEY_ID`)
6. Vercel automatically handles SPA rewrites via `vercel.json`

### Backend → Render

1. Create a **Web Service** on [Render](https://render.com)
2. Set **Root Directory** to `backend`
3. **Build Command:** `npm install`
4. **Start Command:** `node server.js`
5. Add all backend environment variables

---

## 📂 Project Structure

```
institute_management_website/
├── backend/
│   ├── config/             # Database connection config
│   ├── controllers/        # Route handler logic
│   │   ├── admissionController.js
│   │   ├── attendanceController.js
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── dashboardController.js
│   │   ├── daybookController.js
│   │   ├── enquiryController.js
│   │   ├── expenseController.js
│   │   ├── paymentController.js
│   │   ├── teacherController.js
│   │   └── testController.js
│   ├── middleware/          # Auth & file upload middleware
│   ├── models/             # Mongoose schemas (12 models)
│   │   ├── Admission.js
│   │   ├── Attendance.js
│   │   ├── Course.js
│   │   ├── Enquiry.js
│   │   ├── Expense.js
│   │   ├── Payment.js
│   │   ├── Salary.js
│   │   ├── Teacher.js
│   │   ├── TeacherAttendance.js
│   │   ├── Test.js
│   │   ├── TestSubmission.js
│   │   └── User.js
│   ├── routes/             # Express route definitions
│   ├── utils/              # PDF generation, email, ID helpers
│   ├── server.js           # App entry point
│   └── package.json
│
├── frontend/
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── api/            # Axios instance with interceptors
│   │   ├── components/     # Shared UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── SplashScreen.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── ConfirmModal.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── context/        # React Context (Auth + Theme)
│   │   ├── pages/
│   │   │   ├── Home/       # Landing page sections (8 components)
│   │   │   ├── admin/      # Admin dashboard pages (17 views)
│   │   │   ├── student/    # Student portal (3 views)
│   │   │   └── teacher/    # Teacher portal (1 view)
│   │   ├── App.jsx         # Root component with routing
│   │   ├── main.jsx        # Vite entry point
│   │   └── index.css       # Global styles
│   ├── vercel.json         # Vercel rewrite rules
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── SETUP.md                # Detailed setup & deployment guide
└── README.md               # ← You are here
```

---

## 📊 Project Metrics

| Metric | Value |
|---|---|
| **Frontend Components** | 35+ React components |
| **Backend API Endpoints** | 30+ RESTful endpoints |
| **Database Models** | 12 Mongoose schemas |
| **Role Types** | 3 (Admin, Student, Teacher) |
| **Admin Views** | 17 dedicated management pages |
| **Payment Integration** | Razorpay (full + installment plans) |
| **Deployment** | Vercel (frontend) + Render (backend) |

---

## 🤝 Client Context

> This project was developed as a **freelance engagement** for *Pretech Computer Education*, a computer training institute. The client required a complete digital transformation of their operations — replacing spreadsheet-based workflows with a centralised, role-based web platform. The system is currently **in active production use** managing real student admissions, fee collections, and day-to-day institute operations.

---

## 📄 License

This project is proprietary software developed for Pretech Computer Education.  
All rights reserved.

---

<div align="center">

**Built with ❤️ by [Manan Gilhotra](https://github.com/MananGilhotra)**

</div>
]]>
