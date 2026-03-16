<div align="center">

<img src="fycs-study-hub/public/logo.png" alt="FYCS Study Hub Logo" width="100" height="100" />

# 📚 FYCS Study Hub

### *Your Central Hub for BNN Computer Science Students*

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Deployed on GitHub Pages](https://img.shields.io/badge/Deployed-GitHub%20Pages-181717?style=for-the-badge&logo=github)](https://rishiuttamsahu-lang.github.io/cs-study-hub)

**[🌐 Live Demo](https://rishiuttamsahu-lang.github.io/cs-study-hub)** · **[🐛 Report a Bug](https://github.com/rishiuttamsahu-lang/FYCS-Study-Hub/issues/new)** · **[✨ Request a Feature](https://github.com/rishiuttamsahu-lang/FYCS-Study-Hub/issues/new)**

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Firebase Setup](#firebase-setup)
  - [Running Locally](#running-locally)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)

---

## 🎯 About the Project

**FYCS Study Hub** is a community-driven, open-source academic resource platform built exclusively for **First Year Computer Science (FYCS)** students at BNN College. It aggregates semester-wise study materials — notes, practicals, previous year question papers, and assignment solutions — in one beautifully organized, searchable hub.

> 💡 *Stop hunting across WhatsApp groups and Google Drive folders. Everything you need, right here.*

### Why FYCS Study Hub?

- 📂 **Centralized** — All study materials organized by semester and subject
- ⚡ **Fast** — Route-level code splitting with React's `Suspense` + Vite
- 🔒 **Secure** — Google Auth with Firestore role-based access control
- 🤖 **AI-Powered** — Built-in AI Assignment Writer (ChatGPT & Gemini)
- 📱 **Mobile-First** — Designed for students on the go

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Google Sign-In** | One-click authentication via Firebase Auth |
| 📚 **Semester Navigator** | Browse materials organized by semester → subject → type |
| 📖 **Library** | Full searchable archive of all uploaded materials |
| ⬆️ **Upload Portal** | Admin-only material uploads linked to Google Drive |
| 🛡️ **Admin Panel** | User management, analytics reports, ban control |
| 🤖 **AI Assistant** | Floating AI button linking to custom ChatGPT & Gemini bots |
| 📊 **Analytics** | Daily visitor tracking with Firestore |
| 🔔 **NEW Badge** | Materials uploaded in the last 24 hours are highlighted |
| 🚫 **Ban System** | Admins can restrict access for specific users |
| 🌙 **Dark UI** | Sleek dark theme optimized for long study sessions |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | [React 19](https://react.dev) |
| **Build Tool** | [Vite 7](https://vitejs.dev) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com) |
| **Routing** | [React Router DOM v7](https://reactrouter.com) |
| **Backend / Database** | [Firebase Firestore](https://firebase.google.com/products/firestore) |
| **Authentication** | [Firebase Auth](https://firebase.google.com/products/auth) (Google Provider) |
| **Icons** | [Lucide React](https://lucide.dev) + [React Icons](https://react-icons.github.io) |
| **Notifications** | [React Hot Toast](https://react-hot-toast.com) + [SweetAlert2](https://sweetalert2.github.io) |
| **Deployment** | [GitHub Pages](https://pages.github.com) via `gh-pages` |

---

## 📁 Project Structure

```
FYCS-Study-Hub/
└── fycs-study-hub/           # Main React application
    ├── public/               # Static assets
    │   ├── logo.png          # App logo
    │   ├── favicon.ico
    │   └── sitemap.xml
    ├── src/
    │   ├── components/       # Reusable UI components
    │   │   ├── admin/        # Admin-specific components
    │   │   │   └── AdminReports.jsx
    │   │   ├── DownloadModal.jsx
    │   │   ├── LoadingSpinner.jsx
    │   │   ├── Logo.jsx
    │   │   ├── MaterialCard.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   └── SubjectCard.jsx
    │   ├── context/          # React context providers
    │   │   ├── AppContext.jsx # Auth, user roles, semesters
    │   │   └── DataContext.jsx # Cached data (materials, home feed)
    │   ├── data/             # Static reference data
    │   │   ├── fycsData.js   # Semester/subject/material schema
    │   │   └── mockData.js
    │   ├── pages/            # Route-level page components
    │   │   ├── Admin.jsx     # Admin dashboard
    │   │   ├── AdminPanel.jsx
    │   │   ├── BannedPage.jsx
    │   │   ├── Home.jsx      # Landing page
    │   │   ├── Library.jsx   # Full material archive
    │   │   ├── Login.jsx     # Google login page
    │   │   ├── Materials.jsx # Subject material listing
    │   │   ├── Profile.jsx   # User profile
    │   │   ├── Search.jsx    # Search page
    │   │   ├── Semesters.jsx # Semester selection
    │   │   ├── Subjects.jsx  # Subject listing per semester
    │   │   └── Upload.jsx    # Admin upload portal
    │   ├── utils/
    │   │   └── driveHelper.js # Google Drive URL utilities
    │   ├── App.jsx           # Root component + routing
    │   ├── firebase.js       # Firebase initialization
    │   ├── main.jsx          # React entry point
    │   ├── App.css           # Global styles
    │   └── index.css         # Tailwind directives
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── eslint.config.js
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** ≥ 18.x — [Download](https://nodejs.org)
- **npm** ≥ 9.x (bundled with Node.js)
- A **Firebase** project with Firestore and Google Auth enabled

```bash
# Verify your environment
node --version   # should be ≥ v18
npm --version    # should be ≥ v9
```

### Installation

1. **Fork** this repository, then **clone** your fork:

```bash
git clone https://github.com/<your-username>/FYCS-Study-Hub.git
cd FYCS-Study-Hub/fycs-study-hub
```

2. **Install dependencies:**

```bash
npm install
```

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com) and create a new project.
2. Enable **Authentication** → Sign-in method → **Google**.
3. Enable **Firestore Database** in production mode.
4. Copy your Firebase config credentials.
5. Create a `.env` file in `fycs-study-hub/` (see `.env.example` below) — or update `src/firebase.js` directly:

```js
// src/firebase.js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

> ⚠️ **Never commit real credentials.** Add `src/firebase.js` to `.gitignore` or use environment variables for your own fork.

### Running Locally

```bash
# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

```bash
# Lint the project
npm run lint

# Build for production
npm run build

# Preview the production build
npm run preview
```

---

## 🌍 Deployment

This project is configured to deploy to **GitHub Pages** via `gh-pages`.

1. Update the `homepage` field in `package.json`:

```json
"homepage": "https://<your-username>.github.io/<your-repo-name>"
```

2. Deploy with a single command:

```bash
npm run deploy
```

This runs `vite build` and then publishes the `dist/` folder to the `gh-pages` branch automatically.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn and grow. **All contributions are warmly welcome!**

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit** your changes with a clear message:
   ```bash
   git commit -m "feat: add search filter by material type"
   ```
4. **Push** to your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open a Pull Request** against the `main` branch

### Contribution Guidelines

- Follow the existing code style (ESLint rules are enforced via `npm run lint`)
- Keep components small and focused — one responsibility per file
- Use **Tailwind CSS** utility classes; avoid inline styles
- Write descriptive commit messages (prefer [Conventional Commits](https://www.conventionalcommits.org))
- For major changes, open an **issue first** to discuss what you'd like to change

### Good First Issues

Look for issues tagged [`good first issue`](https://github.com/rishiuttamsahu-lang/FYCS-Study-Hub/issues?q=label%3A%22good+first+issue%22) — these are great starting points for new contributors.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

## 🙏 Acknowledgements

- [React](https://react.dev) — The UI library powering everything
- [Vite](https://vitejs.dev) — Lightning-fast build tooling
- [Firebase](https://firebase.google.com) — Backend, auth, and database
- [Tailwind CSS](https://tailwindcss.com) — Utility-first styling
- [Lucide Icons](https://lucide.dev) — Beautiful open-source icons
- All the BNN CS students who contributed materials and feedback 💛

---

<div align="center">

Made with ❤️ for BNN FYCS Students

[![GitHub stars](https://img.shields.io/github/stars/rishiuttamsahu-lang/FYCS-Study-Hub?style=social)](https://github.com/rishiuttamsahu-lang/FYCS-Study-Hub/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/rishiuttamsahu-lang/FYCS-Study-Hub?style=social)](https://github.com/rishiuttamsahu-lang/FYCS-Study-Hub/network/members)

</div>
