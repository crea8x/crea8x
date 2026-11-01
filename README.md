# Crea∞X (Crea8X)

> **Where Creators Build Together** — An AI-powered collaborative platform for creators, designers, and developers.

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-lightgrey?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Gemini](https://img.shields.io/badge/AI-Google_Gemini_2.0_Flash-orange?logo=google)](https://aistudio.google.com/)

---

## 🌟 Key Features

- **🚀 Project Showcase**: Publish and browse creative projects with tagging, search, and an interactive like system.
- **🤖 Gemini AI Assistance**:
  - Auto-generate captivating project descriptions based on brief prompts.
  - Auto-craft personalized creator bios based on your skills and goals.
  - Smart tag suggestions for better project discoverability.
  - AI-driven skill gap insights to suggest ideal teammates and collaborators.
- **🎯 Smart Recommendations**: Discover and connect with creators based on complementary skill sets.
- **🔐 Secure Authentication**: JWT-based session security with salted bcrypt password hashing and protected endpoints.
- **📱 Responsive Modern Design**: Fast, dark-mode first UI built with React 19 and Vite.

---

## 🏗️ Architecture

```text
Crea8X/
├── client/                 # React 19 + Vite Frontend SPA
│   ├── src/
│   │   ├── components/     # UI building blocks (Navbar, Footer, ProtectedRoute)
│   │   ├── context/        # Auth Context & global state
│   │   ├── pages/          # Landing, Explore, Dashboard, Profile, etc.
│   │   └── services/       # Axios API client configured for local & cloud environments
│   ├── .env.example
│   ├── .gitignore
│   └── README.md           # Detailed client documentation
│
├── server/                 # Node.js + Express 5 Backend REST API
│   ├── config/             # MongoDB connection
│   ├── controllers/        # Auth, User, Project, AI logic
│   ├── middleware/         # JWT verification middleware
│   ├── models/             # Mongoose schemas (User, Project)
│   ├── routes/             # REST endpoints (/api/auth, /api/users, /api/projects, /api/ai)
│   ├── .env.example
│   ├── .gitignore
│   └── README.md           # Detailed server documentation
│
├── .gitignore              # Root workspace ignore
└── README.md               # Main project overview & deployment guide
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 8, React Router DOM 7, Axios, Modern CSS3 |
| **Backend** | Node.js, Express 5, Mongoose 9, CORS, Dotenv |
| **Database** | MongoDB Atlas |
| **Authentication** | JSON Web Tokens (JWT), Bcrypt.js |
| **AI / LLM** | Google Gemini 2.0 Flash (`@google/generative-ai`) |
| **Deployment** | Render (Web Service for Backend, Static Site for Frontend) |

---

## ⚡ Quick Start (Local Development)

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or later)
- [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (or local MongoDB instance)
- [Google AI Studio API Key](https://aistudio.google.com/) for Gemini features

### 1. Clone Repository

```bash
git clone https://github.com/crea8x/crea8x.git
cd crea8x
```

### 2. Configure Backend (`server`)

1. Navigate to the `server` directory and install dependencies:
   ```bash
   cd server
   npm install
   ```

2. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

3. Fill in your environment credentials:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Start the backend:
   ```bash
   npm run dev
   # or: npm start
   ```
   Backend runs at: `http://localhost:5000` (Health check: `http://localhost:5000/api/health`)

### 3. Configure Frontend (`client`)

1. Open a new terminal, navigate to `client`, and install dependencies:
   ```bash
   cd client
   npm install
   ```

2. (Optional) Create `.env` if customising API base URL:
   ```bash
   cp .env.example .env
   ```
   *(Defaults to `http://localhost:5000/api` if omitted).*

3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   Frontend runs at: `http://localhost:5173`

---

## 🌐 Deploying to Render

This repository is designed to be deployed on **[Render](https://render.com/)** in two parts:
1. **Backend**: Express API deployed as a **Render Web Service**.
2. **Frontend**: React + Vite SPA deployed as a **Render Static Site**.

### Step 1: Prepare Database & API Keys
1. **MongoDB Atlas**: Ensure your IP Access List allows connections from anywhere (`0.0.0.0/0`) so Render instances can connect.
2. **Google AI Studio**: Obtain your Gemini API key from [aistudio.google.com](https://aistudio.google.com/).

### Step 2: Deploy Backend (`server`) on Render
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Web Service**.
2. Connect your repository: `https://github.com/crea8x/crea8x`.
3. Configure the service:
   - **Name**: `crea8x-api` (or your preferred name)
   - **Region**: Choose closest to you or your users (e.g. Frankfurt, Oregon, Singapore)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free
4. Add **Environment Variables**:
   - `MONGO_URI`: `your_mongodb_atlas_connection_string`
   - `JWT_SECRET`: `your_random_secret_key`
   - `GEMINI_API_KEY`: `your_gemini_api_key`
   *(Render automatically provides the `PORT` variable; do not override it).*
5. Click **Create Web Service**.
6. Once deployed, copy your backend URL (e.g., `https://crea8x-api.onrender.com`). Verify by visiting `https://crea8x-api.onrender.com/api/health`.

### Step 3: Deploy Frontend (`client`) on Render
1. In Render Dashboard, click **New +** -> **Static Site**.
2. Select the same repository: `https://github.com/crea8x/crea8x`.
3. Configure the site:
   - **Name**: `crea8x` (or your preferred name)
   - **Branch**: `main`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add **Environment Variable**:
   - `VITE_API_URL`: `https://crea8x-api.onrender.com/api` *(use your actual backend URL from Step 2 with `/api` appended)*
5. **Add SPA Rewrite Rule** (Essential for React Router page reloads):
   - Go to **Redirects / Rewrites** in the settings of your Static Site.
   - Click **Add Rule**:
     - **Type**: `Rewrite`
     - **Source**: `/*`
     - **Destination**: `/index.html`
6. Click **Create Static Site**.

Your live Crea8X web app is now online! 🚀

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Health check endpoint | No |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Login and obtain JWT token | No |
| `GET` | `/api/auth/me` | Fetch current logged-in user profile | Yes |
| `GET` | `/api/users` | List / search creators | Yes |
| `GET` | `/api/users/:id` | Get user profile by ID | No |
| `PUT` | `/api/users/:id` | Update profile information | Yes |
| `GET` | `/api/users/:id/recommendations` | Get creator recommendations | Yes |
| `GET` | `/api/projects` | List projects with search & tag filters | Yes |
| `GET` | `/api/projects/:id` | Get project details by ID | No |
| `POST` | `/api/projects` | Create a new project | Yes |
| `PUT` | `/api/projects/:id` | Update existing project | Yes |
| `DELETE` | `/api/projects/:id` | Remove a project | Yes |
| `POST` | `/api/projects/:id/like` | Toggle like status on project | Yes |
| `POST` | `/api/ai/generate-description` | Generate project description with Gemini | Yes |
| `POST` | `/api/ai/generate-bio` | Generate creator bio with Gemini | Yes |
| `POST` | `/api/ai/suggest-tags` | Suggest tags for a project with Gemini | Yes |
| `POST` | `/api/ai/skill-insights` | Skill gap analysis and insights with Gemini | Yes |

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
