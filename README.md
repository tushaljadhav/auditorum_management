# 🎓 Auditorium Management System

A full-stack **College Auditorium Booking & GPS Attendance** system built with **React 19**, **Node.js/Express**, and **MySQL**.

Book venues instantly, generate PDF receipts, manage departments/faculty/venues from an admin panel, and track student attendance using GPS-based geofencing.

---

## 📸 Features

| Feature | Description |
|---|---|
| **Instant Booking** | Select a venue, pick date & time — booking is confirmed immediately if the slot is available |
| **Slot Conflict Prevention** | Real-time slot availability check prevents double-booking on the same hall |
| **PDF Receipt** | Download a professional receipt with QR code after every booking |
| **Admin Dashboard** | View stats, manage bookings, departments, faculty, and venues |
| **GPS Attendance** | Faculty starts an attendance session → students mark attendance from their phone if within the venue's geofence radius |
| **Excel Export** | Export booking and attendance data to Excel |
| **Responsive UI** | Works on desktop, tablet, and mobile |

---

## 🗂️ Project Structure

```
auditorium-management/
├── backend/
│   ├── server.js          # Express API server (port 5000)
│   ├── db_mysql.js        # MySQL database layer (connection pool)
│   ├── db.js              # JSON file-based fallback database
│   ├── schema.sql         # Full MySQL schema + seed data
│   ├── data/              # JSON fallback DB storage
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/         # React page components
│   │   ├── components/    # Shared UI components
│   │   └── utils/         # PDF generator, Excel export, etc.
│   ├── vite.config.js     # Vite dev server (port 3000)
│   └── package.json
├── .env.example           # Environment variable template
├── package.json           # Root scripts (install-all, dev)
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** v18+ — [Download](https://nodejs.org/)
- **MySQL** v8+ — [Download](https://dev.mysql.com/downloads/mysql/)

### 1. Clone the repository

```bash
git clone https://github.com/tushaljadhav/auditorum_management.git
cd auditorum_management
```

### 2. Setup the MySQL database

Open your MySQL client (MySQL Workbench, terminal, phpMyAdmin, etc.) and run the schema file:

```bash
mysql -u root -p < backend/schema.sql
```

Or open `backend/schema.sql` in MySQL Workbench and execute it. This will:
- Create the `auditorium_db` database
- Create all required tables (users, departments, faculty, venues, bookings, attendance)
- Seed default data (admin users, departments, faculty, venues, sample bookings)

### 3. Configure environment variables

```bash
# Copy the example env file
copy .env.example .env        # Windows
# cp .env.example .env        # Linux / Mac
```

Open `.env` and update your MySQL password:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=auditorium_db
PORT=5000
```

> **Note:** If you skip this step, the app uses default values (`root` / `12345678` / `auditorium_db`).

### 4. Install dependencies

```bash
npm run install-all
```

This installs dependencies for root, backend, and frontend in one command.

### 5. Start the application

```bash
npm run dev
```

This starts both servers concurrently:

| Service | URL |
|---|---|
| **Frontend** (React + Vite) | [http://localhost:3000](http://localhost:3000) |
| **Backend** (Express API) | [http://localhost:5000](http://localhost:5000) |

---

## 🔑 Default Admin Login

| Username | Password |
|---|---|
| `admin` | `admin123` |
| `dev` | `123` |

---

## 🛠️ Available Scripts

Run from the project root:

| Command | Description |
|---|---|
| `npm run dev` | Start both frontend + backend (development) |
| `npm run server` | Start backend only |
| `npm run client` | Start frontend only |
| `npm run install-all` | Install all dependencies (root + backend + frontend) |

---

## 🗄️ Database

### MySQL (Primary)

The app uses **MySQL** as the primary database. The schema is in [`backend/schema.sql`](backend/schema.sql).

**Tables:**
- `users` — Admin credentials
- `departments` — College departments
- `faculty` — Faculty members linked to departments
- `venues` — Auditorium halls with GPS coordinates & geofence radius
- `bookings` — Event bookings with instant confirmation
- `attendance` — Student check-in records with GPS verification

### JSON Fallback

If MySQL is unavailable, the backend has a JSON file-based fallback database (`backend/db.js`) that stores data in `backend/data/db.json`. To use it, change the import in `server.js` from `db_mysql` to `db`.

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/login` | Admin login |
| `POST` | `/api/logout` | Admin logout |
| `GET` | `/api/dashboard/stats` | Dashboard statistics |
| `GET` | `/api/departments` | List departments |
| `GET` | `/api/faculty` | List faculty |
| `GET` | `/api/venues` | List venues |
| `GET` | `/api/bookings` | List all bookings |
| `POST` | `/api/bookings` | Create a new booking (instant confirm) |
| `POST` | `/api/bookings/check-availability` | Check slot availability |
| `POST` | `/api/bookings/:id/start-attendance` | Start GPS attendance session |
| `POST` | `/api/attendance/mark` | Student marks attendance |
| `GET` | `/api/bookings/:id/attendance` | Get attendance list |

---

## 📱 How It Works

### Booking Flow
1. User fills the booking form (event name, department, venue, date, time slot)
2. System checks real-time slot availability
3. If available → booking is **instantly confirmed**
4. User can download a PDF receipt with QR code

### Attendance Flow
1. Faculty/coordinator opens the booking and starts an attendance session (sets time window)
2. Students scan the QR code or open the attendance link
3. Student's GPS location is verified against the venue's geofence
4. If within radius → attendance is marked ✅

---

## 🧑‍💻 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 7, Vite 8, Lucide Icons, SweetAlert2 |
| Backend | Node.js, Express 4, cookie-session |
| Database | MySQL 8 (mysql2), JSON fallback |
| PDF | jsPDF, html2canvas |
| QR Code | qrcode.react |

---

## 📄 License

This project is for educational purposes.

---

**Made with ❤️ by Tushal Jadhav**
