# TRAK Backend — Setup Guide

## What you're building
A Python FastAPI backend that handles:
- User registration & login (with JWT tokens)
- Driving profile storage
- Violation history (stored in a real database)
- Risk score calculation

---

## Step 1 — Install Python
Make sure you have Python 3.10+ installed.
Check by running in your terminal:
```
python --version
```
If not installed → https://www.python.org/downloads/

---

## Step 2 — Set up the backend folder
Place the trak-backend folder next to your existing trak folder:
```
your-projects/
├── trak/              ← your React app (already exists)
└── trak-backend/      ← new Python backend
```

---

## Step 3 — Copy your rules.json
Copy your rules.json from trak/src/data/rules.json into trak-backend/rules.json
(a sample one is already provided, replace it with yours)

---

## Step 4 — Open a NEW terminal in the trak-backend folder
```
cd path/to/trak-backend
```

---

## Step 5 — Create a virtual environment
A virtual environment keeps your Python packages isolated to this project.
```
python -m venv venv
```

Then activate it:
- Windows:   venv\Scripts\activate
- Mac/Linux: source venv/bin/activate

You'll see (venv) appear in your terminal. That means it's active. ✅

---

## Step 6 — Install dependencies
```
pip install -r requirements.txt
```
This installs FastAPI, the database tools, JWT auth, etc.
Wait for it to finish (takes ~1 min).

---

## Step 7 — Run the backend
```
uvicorn main:app --reload --port 8000
```

You should see:
  INFO:     Uvicorn running on http://127.0.0.1:8000

The --reload flag means it auto-restarts when you edit files. 🔄

---

## Step 8 — Test it in your browser
Open: http://localhost:8000
You should see: {"message":"TRAK API is running 🚗"}

Open: http://localhost:8000/docs
This is the auto-generated API explorer — you can test every endpoint here! ✅

---

## Step 9 — Connect your React frontend
In your React app, make API calls like this:

### Register:
```js
const res = await fetch("http://localhost:8000/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, full_name, password })
});
const data = await res.json();
localStorage.setItem("token", data.access_token);
```

### Login:
```js
const res = await fetch("http://localhost:8000/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password })
});
const data = await res.json();
localStorage.setItem("token", data.access_token);
```

### Get risk score (requires login):
```js
const token = localStorage.getItem("token");
const res = await fetch("http://localhost:8000/risk/score", {
  headers: { "Authorization": `Bearer ${token}` }
});
const score = await res.json();
```

### Add a violation:
```js
await fetch("http://localhost:8000/violations/", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify({ violation_id: "V001" })
});
```

---

## All API Endpoints

| Method | URL                | What it does              | Auth needed? |
|--------|--------------------|---------------------------|--------------|
| POST   | /auth/register     | Create account            | No           |
| POST   | /auth/login        | Login, get token          | No           |
| GET    | /users/me          | Get your profile          | Yes          |
| PUT    | /users/me          | Update driving details    | Yes          |
| POST   | /violations/       | Log a violation           | Yes          |
| GET    | /violations/       | Get violation history     | Yes          |
| DELETE | /violations/       | Clear all violations      | Yes          |
| GET    | /risk/score        | Get risk score + label    | Yes          |

---

## Common errors

**"ModuleNotFoundError"** → Make sure your venv is activated (you see (venv) in terminal)

**"Address already in use"** → Something is using port 8000. Run on a different port:
  uvicorn main:app --reload --port 8001

**CORS error in React** → Make sure the backend is running and the origin in main.py matches your React port (default 3000)

---

## Project file overview

```
trak-backend/
├── main.py          ← App entry point, starts everything
├── database.py      ← Database connection setup
├── models.py        ← Database table definitions (User, Violation)
├── schemas.py       ← Request/response data shapes
├── auth.py          ← Password hashing + JWT tokens
├── rules.json       ← Your violation rules (copy from React app)
├── requirements.txt ← Python packages to install
├── trak.db          ← SQLite database (auto-created on first run)
└── routers/
    ├── auth.py        ← /auth/register, /auth/login
    ├── users.py       ← /users/me
    ├── violations.py  ← /violations/
    └── risk.py        ← /risk/score
```
