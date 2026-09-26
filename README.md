# 📚 Book Library Management System

A professional full-stack Library Management Application built with **React**, **Node.js**, **Express**, and **MongoDB**.

> **Developer:** Mohammed Ayan Khan  
> **Degree:** BE in CSE (2023–2027)  
> **GitHub:** [github.com/mdayankhan60](https://github.com/mdayankhan60)

---

## 🌟 Features

- 🔐 **Authentication** — Register, Login, Logout with JWT
- 📖 **Book Management** — Add, Edit, Delete books
- 🔍 **Search** — Real-time search by title or author
- 🏷️ **Filter** — Filter by status (Available/Issued) and category
- 📊 **Dashboard** — Statistics with total, available, issued books
- 🔄 **Status Toggle** — Switch books between Available ↔ Issued
- 📱 **Responsive UI** — Works on desktop, tablet, and mobile
- 🛡️ **Security** — Hashed passwords, JWT auth, CORS, validation
- ✅ **Validation** — Frontend and backend input validation

---

## 🛠️ Technologies Used

### Frontend
| Tech | Purpose |
|------|---------|
| React 18 | UI framework |
| Vite | Build tool |
| React Router v6 | Client-side routing |
| Axios | HTTP client |
| CSS | Styling |

### Backend
| Tech | Purpose |
|------|---------|
| Node.js | Runtime |
| Express.js | Web framework |
| Mongoose | MongoDB ODM |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT authentication |
| dotenv | Environment variables |
| cors | Cross-origin requests |

### Database & Deployment
| Service | Purpose |
|---------|---------|
| MongoDB Atlas | Cloud database |
| Render | Backend hosting |
| Netlify | Frontend hosting |

---

## 📁 Project Structure

```
book-library-management/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Sidebar + top navigation
│   │   │   ├── BookCard.jsx      # Book card view
│   │   │   ├── BookTable.jsx     # Book table view
│   │   │   ├── BookForm.jsx      # Add/Edit form
│   │   │   ├── StatsCard.jsx     # Dashboard stat card
│   │   │   ├── Modal.jsx         # Confirmation dialog
│   │   │   ├── Toast.jsx         # Notifications
│   │   │   └── Loader.jsx        # Loading spinner
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── BooksPage.jsx
│   │   │   ├── AddBookPage.jsx
│   │   │   ├── EditBookPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── services/
│   │   │   └── api.js            # Centralized API service
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   └── package.json
│
├── backend/
│   ├── models/
│   │   ├── User.js              # User Mongoose schema
│   │   └── Book.js              # Book Mongoose schema
│   ├── routes/
│   │   ├── authRoutes.js        # Register & Login endpoints
│   │   └── bookRoutes.js        # CRUD book endpoints
│   ├── middleware/
│   │   └── auth.js              # JWT verification middleware
│   ├── server.js                # Express app entry point
│   ├── .env                     # Environment variables (git-ignored)
│   ├── .env.example             # Example env file
│   ├── .gitignore
│   └── package.json
│
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- MongoDB Atlas account (free tier works)

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/mdayankhan60/book-library-management.git
cd book-library-management
```

---

### 2️⃣ MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with read/write access
4. Whitelist IP: `0.0.0.0/0` (for development)
5. Get your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/book-library?retryWrites=true&w=majority
   ```

---

### 3️⃣ Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/book-library?retryWrites=true&w=majority
JWT_SECRET=your_very_secure_random_jwt_secret_key_here
PORT=5000
FRONTEND_URL=http://localhost:5173
```

Start the backend:
```bash
npm run dev
```

Backend runs at: `http://localhost:5000`

---

### 4️⃣ Frontend Setup

Open a new terminal:
```bash
cd frontend
npm install
```

Create your `.env` file:
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |

**Register Request Body:**
```json
{
  "name": "Mohammed Ayan Khan",
  "email": "ayankhanmohammed100@gmail.com",
  "password": "securepassword",
  "confirmPassword": "securepassword"
}
```

**Login Request Body:**
```json
{
  "email": "ayankhanmohammed100@gmail.com",
  "password": "securepassword"
}
```

**Auth Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGci...",
    "user": {
      "_id": "...",
      "name": "Mohammed Ayan Khan",
      "email": "ayankhanmohammed100@gmail.com"
    }
  }
}
```

---

### Books (All require Authorization header)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/books` | Get all books |
| GET | `/api/books?search=harry` | Search books |
| GET | `/api/books?status=Available` | Filter by status |
| GET | `/api/books?category=Fiction` | Filter by category |
| GET | `/api/books/:id` | Get single book |
| POST | `/api/books` | Create book |
| PUT | `/api/books/:id` | Update book |
| DELETE | `/api/books/:id` | Delete book |

**Request Header:**
```
Authorization: Bearer <your_jwt_token>
```

**Create/Update Book Body:**
```json
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "category": "Fiction",
  "status": "Available"
}
```

---

## 🗄️ Database Models

### User Model
```js
{
  name:      String (required, min 2 chars)
  email:     String (required, unique, valid email)
  password:  String (required, hashed, min 6 chars)
  createdAt: Date   (auto)
}
```

### Book Model
```js
{
  title:     String   (required)
  author:    String   (required)
  category:  String   (required, enum values)
  status:    String   (Available | Issued, default: Available)
  createdBy: ObjectId (ref: User, required)
  createdAt: Date     (auto)
  updatedAt: Date     (auto)
}
```

**Category Options:**
`Fiction` | `Non-Fiction` | `Science` | `Technology` | `History` | `Biography` | `Mystery` | `Romance` | `Self-Help` | `Other`

---

## 🌐 Deployment Guide

### Backend → Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add Environment Variables:
   - `MONGODB_URI` = your Atlas connection string
   - `JWT_SECRET` = your secret key
   - `FRONTEND_URL` = `https://your-app.netlify.app`
   - `PORT` = `5000`
6. Deploy → copy your Render URL (e.g., `https://book-library-api.onrender.com`)

### Frontend → Netlify

1. Go to [netlify.com](https://netlify.com) → New site from Git
2. Connect your GitHub repo
3. Configure:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
4. Add Environment Variable:
   - `VITE_API_URL` = `https://book-library-api.onrender.com/api`
5. Deploy!

### Update Backend CORS (after Netlify deploy)

In Render environment variables, update:
```
FRONTEND_URL=https://your-actual-app.netlify.app
```

---

## 🔒 Environment Variables Reference

### Backend `.env`
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/book-library
JWT_SECRET=super_secret_random_key_minimum_32_chars
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
```

> ⚠️ **Never commit `.env` files to GitHub!** Both `.gitignore` files exclude them.

---

## 🧪 Testing Checklist

- [x] User registration with validation
- [x] User login and JWT token
- [x] Logout (clears localStorage)
- [x] Add book with all fields
- [x] Display all books in table
- [x] Search books by title/author
- [x] Filter by status and category
- [x] Edit book
- [x] Change book status (Available ↔ Issued)
- [x] Delete book with confirmation
- [x] MongoDB data persistence
- [x] API error handling
- [x] Responsive UI
- [x] Frontend/backend connection

---

## 📜 License

MIT License — Free to use for educational purposes.

---

*Built with ❤️ by Mohammed Ayan Khan — CSE Student (2023–2027)*
