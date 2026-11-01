# Crea8X — Backend API 🚀

The backend REST API for **Crea8X**, built with Express.js, MongoDB Atlas (Mongoose), JWT authentication, and Google Gemini 2.0 Flash AI.

---

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (v18+)
- **Framework**: [Express 5](https://expressjs.com/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) with [Mongoose 9](https://mongoosejs.com/)
- **Authentication**: JSON Web Tokens ([jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **AI Integration**: [Google Generative AI SDK](https://github.com/google/generative-ai-js) (`@google/generative-ai` — Gemini 2.0 Flash)
- **CORS & Environment**: [cors](https://github.com/expressjs/cors), [dotenv](https://github.com/motdotla/dotenv)

---

## 📁 Directory Structure

```text
server/
├── config/
│   └── db.js                 # MongoDB Mongoose connection
├── controllers/
│   ├── aiController.js       # Gemini AI integrations (bio, project descriptions, skills)
│   ├── authController.js     # User registration, login, profile check
│   ├── projectController.js  # Project CRUD and like toggle
│   └── userController.js     # User profiles and skill-based recommendations
├── middleware/
│   └── authMiddleware.js     # Bearer token JWT authentication guard
├── models/
│   ├── Project.js            # Project schema (title, desc, tags, likes, author)
│   └── User.js               # User schema (name, email, password, bio, skills)
├── routes/
│   ├── aiRoutes.js           # /api/ai routes
│   ├── authRoutes.js         # /api/auth routes
│   ├── projectRoutes.js      # /api/projects routes
│   └── userRoutes.js         # /api/users routes
├── .env.example              # Sample environment variables
├── package.json
└── server.js                 # Express server bootstrap & routes registration
```

---

## ⚙️ Environment Variables

Create a `.env` file inside `server/` (or copy `.env.example`):

```bash
cp .env.example .env
```

| Variable | Description | Example / Default |
|---|---|---|
| `PORT` | Port the server listens on | `5000` *(Render sets this automatically)* |
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster0.mongodb.net/crea8x?retryWrites=true&w=majority` |
| `JWT_SECRET` | Secret key for JWT token generation | `your_secure_random_secret_key` |
| `GEMINI_API_KEY` | Google Gemini API key | Obtain from [Google AI Studio](https://aistudio.google.com/) |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Ensure your `.env` contains valid `MONGO_URI`, `JWT_SECRET`, and `GEMINI_API_KEY`.

### 3. Start Server

**Production mode:**
```bash
npm start
```

**Development mode (auto-reload on Node 18+):**
```bash
npm run dev
```

The server will start on [http://localhost:5000](http://localhost:5000).

---

## 📡 API Reference

### Health Check
- `GET /api/health` — Check server status.

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account (`name`, `email`, `password`, `skills`).
- `POST /api/auth/login` — Sign in and receive JWT token (`email`, `password`).
- `GET /api/auth/me` *(Protected)* — Get authenticated user's profile.

### Users (`/api/users`)
- `GET /api/users` *(Protected)* — Search/list users with filter query.
- `GET /api/users/:id` — Get user profile by ID.
- `PUT /api/users/:id` *(Protected)* — Update user bio, skills, profile info.
- `GET /api/users/:id/recommendations` *(Protected)* — Skill-based creator recommendations.

### Projects (`/api/projects`)
- `GET /api/projects` *(Protected)* — Get projects list with search/tag filters.
- `GET /api/projects/:id` — Get single project details.
- `POST /api/projects` *(Protected)* — Create a new project.
- `PUT /api/projects/:id` *(Protected)* — Update project details.
- `DELETE /api/projects/:id` *(Protected)* — Delete a project.
- `POST /api/projects/:id/like` *(Protected)* — Toggle like on a project.

### AI Endpoints (`/api/ai`)
- `POST /api/ai/generate-description` *(Protected)* — Generate project description with Gemini.
- `POST /api/ai/generate-bio` *(Protected)* — Generate creator bio tailored to skills.
- `POST /api/ai/suggest-tags` *(Protected)* — Suggest project tags.
- `POST /api/ai/skill-insights` *(Protected)* — Analyze skill gaps and project collaboration needs.

---

## 🌐 Deploying to Render (Web Service)

1. Create a **New Web Service** on Render.
2. Select your repository: `https://github.com/crea8x/crea8x`.
3. Configure settings:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js` (or `npm start`)
4. Add Environment Variables:
   - `MONGO_URI`: Your MongoDB Atlas URI.
   - `JWT_SECRET`: A long random secret string.
   - `GEMINI_API_KEY`: Your Google AI Studio API key.
   *(Note: Do NOT set `PORT` manually; Render provides it automatically).*

