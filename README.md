# Hostel Management System

A full-stack web application for managing student hostels. Built with **Node.js + Express + MongoDB** on the Backend and **plain HTML / Bootstrap 5 / vanilla JavaScript** on the Frontend. Supports four distinct user roles: Admin, Warden, Student, and Parent.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Roles and Capabilities](#roles-and-capabilities)
- [Getting Started](#getting-started)
- [Default Admin Account](#default-admin-account)
- [Environment and Configuration](#environment-and-configuration)
- [API Reference](#api-reference)
- [Database Models](#database-models)
- [Frontend Pages](#frontend-pages)
- [Known Issues and Limitations](#known-issues-and-limitations)

---

## Tech Stack

### Backend
| Package | Version | Purpose |
|---|---|---|
| express | 5.2.1 | HTTP server and routing |
| mongoose | 9.3.2 | MongoDB ODM |
| bcryptjs | 3.0.3 | Password hashing |
| jsonwebtoken | 9.0.3 | JWT token generation and verification |
| cors | 2.8.6 | Cross-origin resource sharing |
| qrcode | 1.5.4 | QR code generation (returns base64 data URL) |
| multer | 2.1.1 | File upload middleware (installed but currently unused) |

### Frontend
- Bootstrap 5.3.0 (CSS + JS bundle via CDN)
- Bootstrap Icons 1.10.0 (via CDN)
- html5-qrcode (via unpkg CDN — used only in `scan.html`)
- Vanilla JavaScript (no framework)

---

## Project Structure

```
hostel-system/
├── backend/
│   ├── config/
│   │   └── db.js                  # Mongoose connection to hostelDB
│   ├── middleware/
│   │   └── auth.js                # JWT verification middleware (defined but not applied)
│   ├── models/
│   │   ├── user.js                # Single User model for all four roles
│   │   ├── Hostel.js              # Hostel definition
│   │   ├── Attendance.js          # Daily attendance records
│   │   ├── Leave.js               # Leave requests
│   │   ├── QR.js                  # Generated QR codes
│   │   └── HostelChangeRequest.js # Inter-hostel transfer requests
│   ├── routes/
│   │   ├── auth.js                # Auth, user CRUD, hostel change requests
│   │   ├── attendance.js          # Mark and fetch attendance
│   │   ├── leave.js               # Leave request lifecycle
│   │   ├── qr.js                  # QR code generation
│   │   ├── hostel.js              # Hostel creation and listing
│   │   └── room.js                # Students in a specific room
│   ├── server.js                  # App entry point, default admin creation
│   └── package.json
├── frontend/
│   ├── css/
│   │   └── style.css              # Dark-themed global styles
│   ├── js/
│   │   ├── app.js                 # Login logic and role-based redirect
│   │   ├── admin.js               # Admin dashboard SPA logic
│   │   ├── warden.js              # Warden dashboard SPA logic
│   │   ├── student.js             # Student dashboard logic
│   │   ├── parent.js              # Parent dashboard SPA logic
│   │   ├── register.js            # Registration form and role-toggle logic
│   │   └── logout.js              # Clears localStorage and redirects to index
│   ├── index.html                 # Login page
│   ├── register.html              # Registration page
│   ├── admin.html                 # Admin panel (sidebar layout)
│   ├── warden.html                # Warden panel (sidebar layout)
│   ├── dashboard.html             # Student dashboard
│   ├── parent.html                # Parent panel (sidebar layout)
│   ├── scan.html                  # QR scanner for attendance
│   └── leave.html                 # Standalone leave request form (legacy)
└── package.json                   # Root package (no dependencies)
```

---

## Roles and Capabilities

### Admin (`role: "admin"`)
- Created automatically on server start (see [Default Admin Account](#default-admin-account))
- Create hostels (name, total rooms, beds per room)
- Create wardens and assign them to a hostel
- Reassign a warden to a different hostel
- View all users in the system
- Delete any user
- View all hostel transfer requests (PENDING / APPROVED / REJECTED)
- Approve or reject hostel transfer requests submitted by wardens — approval automatically updates the student's `hostelName` and `room` in the database

### Warden (`role: "warden"`)
- Each warden has a `hostelName` field linking them to one hostel
- Generate daily QR code for attendance (stored in MongoDB, returned as base64 PNG)
- View list of all students in their hostel
- Update any student's room number within the current hostel
- Submit a hostel transfer request for a student to the admin, specifying the target hostel and room
- View attendance records filtered by date for their hostel
- View all leave requests from their hostel's students
- Approve or reject leave requests
- View all students in a specific room number

### Student (`role: "student"`)
- Scan the warden's QR code to mark daily attendance (`scan.html`)
- View personal attendance history (all dates, sorted descending)
- View personal leave request history with statuses

### Parent (`role: "parent"`)
- Linked to their ward via the `wardId` field (stores the ward's `studentId`)
- On login, the parent dashboard fetches the ward's current info from `/api/auth/student/:wardId`
- Submit a leave request on behalf of their ward (from date, to date, reason)
- View complete leave history for their ward
- View ward's details: name, hostel, room, student phone, parent contact

---

## Getting Started

### Prerequisites
- Node.js >= 20.19.0 (required by mongoose 9.x and mongodb 7.x)
- MongoDB running locally on port 27017

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd hostel-system

# Install backend dependencies
cd backend
npm install

# Start the backend server
npm start
```

The server starts on `http://0.0.0.0:5000` and logs `Server running on 5000`.

### Frontend
The frontend is plain HTML — no build step required. Open the `frontend/` folder in a browser or serve it with any static file server:

```bash
# Example using VS Code Live Server, or:
npx serve frontend
```

> **Important:** Before opening the frontend, update the hardcoded API base URL in every JS file. Search for `192.168.0.109:5000` and replace it with your machine's actual IP or `localhost:5000`. This address appears in: `js/app.js`, `js/admin.js`, `js/warden.js`, `js/student.js`, `js/parent.js`, `js/register.js`, `leave.html`, and `scan.html`.

---

## Default Admin Account

On every server start, `server.js` checks whether an admin account exists and creates one if not:

```
Email:    admin123@gmail.com
Password: adminpass123
```

This is hardcoded in `server.js`. Change these credentials before any deployment.

---

## Environment and Configuration

There is currently no `.env` file or environment variable support. The following values are hardcoded and must be changed manually before production use:

| Location | Value | What it controls |
|---|---|---|
| `backend/config/db.js` | `mongodb://127.0.0.1:27017/hostelDB` | MongoDB connection URI |
| `backend/server.js` | `admin123@gmail.com` / `adminpass123` | Default admin credentials |
| `backend/middleware/auth.js` | `"secretkey"` | JWT signing secret |
| All frontend JS files | `http://192.168.0.109:5000` | API base URL |

---

## API Reference

All routes are prefixed as shown. No authentication middleware is currently enforced on any route (see [Known Issues](#known-issues-and-limitations)).

### Auth — `/api/auth`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register a new user (student or parent) |
| POST | `/login` | Login — returns the full user object |
| GET | `/all` | Get all users |
| GET | `/students` | Get all students |
| GET | `/students/:hostel` | Get students filtered by hostel name |
| GET | `/student/:id` | Get a single student by `_id` or `studentId` |
| POST | `/create-warden` | Create a warden account |
| PUT | `/update-warden/:id` | Reassign warden to a different hostel |
| PUT | `/update-student/:id` | Update a student's room number |
| DELETE | `/delete/:id` | Delete a user by MongoDB `_id` |
| POST | `/request-hostel-change` | Warden submits a hostel transfer request |
| GET | `/hostel-change-requests` | Get all transfer requests (optional `?status=PENDING`) |
| PUT | `/hostel-change-requests/:id/approve` | Approve request and update student's hostel |
| PUT | `/hostel-change-requests/:id/reject` | Reject a transfer request |

### Attendance — `/api/attendance`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/mark` | Mark attendance. Idempotent — updates existing record if one exists for the same `studentId` + `date` |
| GET | `/student/:id` | Get all attendance records for a student by `studentId`, sorted by date descending |
| GET | `/date/:date` | Get attendance by date. Accepts `?hostel=` query param to filter by hostel |

The `/date/:date` endpoint normalises the date and matches against multiple formats (YYYY-MM-DD and DD/MM/YYYY).

### Leave — `/api/leave`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/request` | Submit a leave request |
| GET | `/student/:id` | Student's own leave history |
| GET | `/parent/:id` | Parent view — leave history for a ward by `studentId` |
| GET | `/` | All leaves (warden view). Accepts `?hostel=` query param |
| POST | `/update/:id` | Update leave status (APPROVED / REJECTED) |

### QR — `/api/qr`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/generate` | Creates a new QR record (`HOSTEL-<timestamp>`) in MongoDB and returns `{ qrImage, code }` |

### Hostel — `/api/hostel`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/create` | Create a hostel |
| GET | `/` | Get all hostels |

### Room — `/api/room`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/:hostel/:room` | Get all students in a specific hostel + room combination |

---

## Database Models

### User
All four roles share this single collection. Fields are selectively populated depending on the role.

```js
{
  name:         String,
  email:        String,
  password:     String,   // bcrypt hashed
  role:         String,   // "admin" | "warden" | "student" | "parent"

  // Student-specific
  studentId:    String,
  studentPhone: String,
  room:         Number,
  hostelName:   String,
  parentName:   String,
  parentPhone:  String,

  // Warden-specific
  wardenId:     String,
  hostelName:   String,

  // Parent-specific
  wardId:       String,   // stores the ward's studentId
  wardName:     String
}
```

### Hostel
```js
{
  hostelName:   String,   // unique
  totalRooms:   Number,
  bedsPerRoom:  Number
}
```

### Attendance
```js
{
  studentId:    String,
  studentName:  String,
  room:         Number,
  hostelName:   String,
  date:         String,   // stored as YYYY-MM-DD
  status:       String    // e.g. "PRESENT"
}
```

### Leave
```js
{
  studentId:    String,
  studentName:  String,
  parentName:   String,
  room:         Number,
  hostelName:   String,
  fromDate:     String,
  toDate:       String,
  reason:       String,
  status:       String,   // default: "PENDING"
  createdAt:    Date
}
```

### QR
```js
{
  code:   String,   // format: "HOSTEL-<timestamp>"
  date:   String    // ISO date string (YYYY-MM-DD)
}
```

### HostelChangeRequest
```js
{
  studentId:       String,
  studentName:     String,
  currentHostel:   String,
  currentRoom:     String,
  requestedHostel: String,
  requestedRoom:   String,
  wardenId:        String,
  wardenName:      String,
  status:          String,   // "PENDING" | "APPROVED" | "REJECTED"
  adminComment:    String,
  createdAt:       Date,
  updatedAt:       Date
}
```

---

## Frontend Pages

| File | Role | Description |
|---|---|---|
| `index.html` | All | Login form. On success, redirects to role-specific dashboard |
| `register.html` | Public | Registration. Role selector toggles between student fields and parent fields |
| `admin.html` | Admin | Sidebar SPA: dashboard stats, hostel creation, warden management, user list, transfer requests |
| `warden.html` | Warden | Sidebar SPA: QR generation, student list with room editing, hostel transfer submission, attendance view, leave management |
| `dashboard.html` | Student | Shows student name/hostel/room, links to QR scanner, attendance history, and leave status |
| `parent.html` | Parent | Sidebar SPA: leave request form, leave history, ward info |
| `scan.html` | Student | Opens device camera via `html5-qrcode`, marks attendance on successful scan |
| `leave.html` | Parent | Legacy standalone leave form (predates the sidebar-based `parent.html`) |

User session is stored in `localStorage` as the key `"user"` (the raw user object returned from `/api/auth/login`). `logout.js` removes this key and redirects to `index.html`.

---

## Known Issues and Limitations

These are observed directly from the source code, not assumptions.

### Security

1. **JWT middleware is not applied anywhere.**
   `backend/middleware/auth.js` defines a working JWT verifier, but it is never imported in `server.js` and never used as middleware on any route. All API endpoints are publicly accessible without a token.

2. **Hardcoded JWT secret.**
   The secret in `auth.js` is the literal string `"secretkey"`. This must be replaced with a strong random secret managed via an environment variable.

3. **Hardcoded admin credentials.**
   `admin123@gmail.com` / `adminpass123` are written directly in `server.js`.

4. **No role-based access control on the backend.**
   Any client can call any endpoint regardless of their role — e.g., a student can call `/api/auth/create-warden`.

### Functional

5. **QR attendance is not validated.**
   `scan.html` posts attendance directly using the logged-in user's data as soon as *any* QR code is successfully scanned. The scanned code value is never verified against the `QR` collection in MongoDB. A student could scan any QR code (or an old one) and mark themselves present.

6. **`multer` is installed but unused.**
   The leave request form in `parent.html` has a file input field for supporting documents, and `leave.html` also has a file input. However, no route in the backend accepts file uploads — `multer` is never imported or applied in any route handler.

7. **No required field validation in Mongoose models.**
   None of the six models declare any field as `required: true` (except `hostelName` having `unique: true` in the Hostel model). Invalid or incomplete documents can be saved silently.

8. **API URL is a LAN IP hardcoded in 8 files.**
   `http://192.168.0.109:5000` appears in `app.js`, `admin.js`, `warden.js`, `student.js`, `parent.js`, `register.js`, `leave.html`, and `scan.html`. The app will not work outside the original development machine's local network without a global find-and-replace.

9. **`leave.html` is a legacy page.**
   The standalone `leave.html` duplicates functionality now covered by `parent.html`. It is no longer linked from anywhere in the app but remains in the project.

10. **All roles share one User collection.**
    Fields like `wardenId`, `studentId`, `wardId`, `parentPhone`, `room`, etc., are all on the same schema. There is no enforcement that a warden document actually has a `wardenId`, or that a parent has a `wardId`. Missing fields simply resolve to `undefined`.

---

## How the Hostel Transfer Workflow Works

This is the most multi-step feature in the system:

1. Warden opens **Hostel Change Requests** in their sidebar.
2. Warden selects a student from their hostel, picks a target hostel from a dropdown, enters a target room number, and clicks **Transfer**.
3. Backend (`POST /api/auth/request-hostel-change`) validates that the student exists, the requested hostel is different from the current one, and no other PENDING request exists for that student. A `HostelChangeRequest` document is created with `status: "PENDING"`.
4. Admin opens **Hostel Transfer Requests** in their sidebar and sees all requests with current and requested details.
5. Admin clicks **Approve** (optionally adds a comment). Backend (`PUT /api/auth/hostel-change-requests/:id/approve`) updates the student's `hostelName` and `room` fields in the User collection, then sets the request `status` to `"APPROVED"`.
6. Admin clicks **Reject** to set `status: "REJECTED"` without changing the student's record.
