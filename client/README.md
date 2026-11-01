# Crea8X — Frontend Client 🎨

The frontend for **Crea8X**, a modern collaborative web platform where creators showcase projects, discover peers, and collaborate with AI-powered assistance.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Styling**: Modern CSS3 (Dark/Light design system, Responsive layout)
- **Linter**: [Oxlint](https://oxc.rs/)

---

## 📁 Directory Structure

```text
client/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images, SVGs, and brand assets
│   ├── components/         # Reusable UI components (Navbar, Footer, ProtectedRoute)
│   ├── context/            # Global context (AuthContext for user state)
│   ├── pages/              # Route pages (Landing, Login, Register, Explore, Dashboard, Profile, AddProject, ProjectDetail)
│   ├── services/           # API integration with Axios (api.js)
│   ├── App.jsx             # Router and top-level layout
│   ├── index.css           # Global design tokens and styles
│   └── main.jsx            # Application entrypoint
├── .env.example            # Sample environment variables
├── index.html              # HTML shell
├── package.json
└── vite.config.js
```

---

## ⚙️ Environment Variables

Create a `.env` file in this directory (or duplicate `.env.example`):

```bash
cp .env.example .env
```

| Variable | Description | Default (Local) | Production (Render) |
|---|---|---|---|
| `VITE_API_URL` | Base URL for backend Express API | `http://localhost:5000/api` | `https://<your-backend>.onrender.com/api` |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
npm run build
```
The optimized production bundle will be generated in `dist/`.

### 4. Preview Production Build
```bash
npm run preview
```

### 5. Run Linter
```bash
npm run lint
```

---

## 🌐 Deploying to Render (Static Site)

1. Create a **New Static Site** on Render.
2. Connect your GitHub repository: `https://github.com/crea8x/crea8x`.
3. Configure the settings:
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Set Environment Variable:
   - `VITE_API_URL`: `https://<your-backend-api-name>.onrender.com/api`
5. **Critical for React Router (SPA)**: Add a Rewrite Rule in Render:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`
