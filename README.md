<div align="center">

<img src="public/logo.png" alt="FYCS Study Hub Logo" width="96" />

# 📚 FYCS Study Hub

**A centralized study-material platform for First Year Computer Science students**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-blue?style=for-the-badge&logo=github)](https://rishiuttamsahu-lang.github.io/cs-study-hub)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%26%20Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![TailwindCSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## 🌟 About

**FYCS Study Hub** is a modern, mobile-first web application designed to help First Year Computer Science students access study materials — notes, practicals, PYQs, and assignments — organized by semester and subject.  
It features Google Authentication, an admin panel for uploading materials, an AI assignment assistant, and real-time visitor analytics powered by Firebase.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📖 **Semester-wise Library** | Browse materials organized across 4 semesters and their subjects |
| 🔐 **Google Sign-In** | Secure, one-tap login via Firebase Authentication |
| 📤 **Admin Upload Panel** | Admins can upload and manage study materials |
| 🤖 **AI Assignment Assistant** | Quick access to ChatGPT & Gemini bots for assignment help |
| 🔍 **Search** | Find materials across all semesters and subjects instantly |
| 📊 **Analytics** | Daily visitor tracking using Firestore |
| 🚫 **Ban Management** | Admins can ban/unban users from the platform |
| 📱 **Responsive Design** | Optimized for mobile and desktop with a sleek dark UI |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | [React 19](https://react.dev) + [Vite 7](https://vite.dev) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com) |
| **Routing** | [React Router DOM 7](https://reactrouter.com) |
| **Backend / Database** | [Firebase Firestore](https://firebase.google.com/products/firestore) |
| **Authentication** | [Firebase Auth](https://firebase.google.com/products/auth) (Google Provider) |
| **Icons** | [Lucide React](https://lucide.dev) · [React Icons](https://react-icons.github.io/react-icons) |
| **Notifications** | [React Hot Toast](https://react-hot-toast.com) · [SweetAlert2](https://sweetalert2.github.io) |
| **Deployment** | [GitHub Pages](https://pages.github.com) via `gh-pages` |

---

## 📂 Project Structure

```
FYCS-Study-Hub/
├── public/                  # Static assets (logo, favicon, sitemap)
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── MaterialCard.jsx
│   │   ├── SubjectCard.jsx
│   │   ├── DownloadModal.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── Logo.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── admin/           # Admin-specific components
│   ├── context/             # React Context providers
│   ├── data/                # Static data (semesters, subjects, materials)
│   ├── pages/               # Route-level page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Library.jsx
│   │   ├── Semesters.jsx
│   │   ├── Subjects.jsx
│   │   ├── Materials.jsx
│   │   ├── Upload.jsx
│   │   ├── Admin.jsx
│   │   ├── Profile.jsx
│   │   ├── Search.jsx
│   │   └── BannedPage.jsx
│   ├── utils/               # Utility / helper functions
│   ├── firebase.js          # Firebase initialization
│   ├── App.jsx              # Root application component & routing
│   └── main.jsx             # React entry point
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18 and **npm** ≥ 9
- A [Firebase](https://console.firebase.google.com) project with **Firestore** and **Google Authentication** enabled

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/rishiuttamsahu-lang/FYCS-Study-Hub.git
cd FYCS-Study-Hub

# 2. Install dependencies
npm install
```

### Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com) and create a new project.
2. Enable **Firestore Database** and **Authentication → Google provider**.
3. Copy your project's Firebase config and update `src/firebase.js`:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Environment Variables

Create a local `.env` file for browser-safe keys used by the app:

```bash
VITE_WEB3FORMS_ACCESS_KEY=your_web3forms_access_key
```

The upload flow uses this value to send the admin notification email after a successful submission.

### Running Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
npm run build
```

The production-ready files will be output to the `dist/` directory.

---

## 🌐 Deployment

The project is configured for **GitHub Pages** deployment.

```bash
# Build and deploy to GitHub Pages
npm run deploy
```

> Make sure the `homepage` field in `package.json` points to your GitHub Pages URL before deploying.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. **Fork** the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and **commit**: `git commit -m 'feat: add your feature'`
4. **Push** to the branch: `git push origin feature/your-feature-name`
5. Open a **Pull Request**

---

## 📜 License

This project is open-source. Feel free to use, modify, and distribute it with attribution.

---

<div align="center">
Made with ❤️ for FYCS students
</div>
