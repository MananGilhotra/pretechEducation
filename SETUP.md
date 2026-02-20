# Pretech Computer Education — Setup & Deployment Guide

## Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Razorpay account (test keys for dev)

---

## Backend Setup

```bash
cd backend
cp .env.example .env     # edit with your credentials
npm install
node server.js           # runs on port 5000
```

### Environment Variables (`backend/.env`)
| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `RAZORPAY_KEY_ID` | Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret |
| `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_USER` / `EMAIL_PASS` | SMTP for email confirmations |
| `CLIENT_URL` | Frontend URL (e.g. `http://localhost:5173`) |

### Create Admin User
```bash
# Use the register endpoint with role override, or directly in MongoDB:
# In MongoDB shell:
db.users.insertOne({
  name: "Admin",
  email: "admin@pretech.in",
  password: "<bcrypt-hashed-password>",
  role: "admin"
})
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev              # runs on port 5173
```

### Environment Variables (`frontend/.env`)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL (default: `/api`) |
| `VITE_RAZORPAY_KEY_ID` | Razorpay Key ID (public) |

---

## Production Deployment

### Backend (Render)
1. Create a **Web Service** on Render
2. Root directory: `backend`
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add all environment variables

### Frontend (Vercel)
1. Import repo to Vercel
2. Root directory: `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variables
6. Configure rewrites: `/* → /index.html`

---

## API Endpoints Summary

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | User | Get profile |
| GET | `/api/courses` | Public | List courses |
| POST | `/api/courses` | Admin | Create course |
| PUT | `/api/courses/:id` | Admin | Update course |
| DELETE | `/api/courses/:id` | Admin | Delete course |
| POST | `/api/enquiries` | Public | Submit enquiry |
| GET | `/api/enquiries` | Admin | List enquiries |
| DELETE | `/api/enquiries/:id` | Admin | Delete enquiry |
| POST | `/api/admissions` | Public | Submit admission |
| GET | `/api/admissions` | Admin | List admissions |
| GET | `/api/admissions/me` | Student | My admission |
| PUT | `/api/admissions/:id/approve` | Admin | Approve admission |
| GET | `/api/admissions/export` | Admin | Export CSV |
| POST | `/api/payments/create-order` | User | Create Razorpay order |
| POST | `/api/payments/verify` | User | Verify payment |
| GET | `/api/payments` | Admin | List payments |
| GET | `/api/payments/me` | Student | My payments |
| GET | `/api/payments/:id/receipt` | User | Download receipt PDF |
| GET | `/api/dashboard/stats` | Admin | Dashboard stats |
| GET | `/api/dashboard/recent` | Admin | Recent admissions |
