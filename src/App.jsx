import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Sparkles, Bot, X } from "lucide-react";

import { useApp } from "./context/AppContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Admin from "./pages/Admin";
import Home from "./pages/Home";
import Library from "./pages/Library";
import Login from "./pages/Login";
import Materials from "./pages/Materials";
import Profile from "./pages/Profile";
import Subjects from "./pages/Subjects";
import Upload from "./pages/Upload";
import BannedPage from "./pages/BannedPage";

function App() {
  const { user, loading } = useApp();
  const [isUserBanned, setIsUserBanned] = useState(false);
  const [userDataLoading, setUserDataLoading] = useState(true);

  // Check if user is banned
  useEffect(() => {
    if (!user?.uid) {
      setUserDataLoading(false);
      setIsUserBanned(false);
      return;
    }
    
    const checkBanStatus = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setIsUserBanned(userData.isBanned || false);
        } else {
          setIsUserBanned(false);
        }
      } catch (error) {
        console.error("Error checking ban status:", error);
        setIsUserBanned(false);
      } finally {
        setUserDataLoading(false);
      }
    };
    
    checkBanStatus();
  }, [user?.uid]);

  // Loading state
  if (loading || userDataLoading) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  // Show banned page if user is banned
  if (user && isUserBanned) {
    return <BannedPage />;
  }

  // Not logged in
  if (!user) {
    return <Login />;
  }

  // Logged in - return the router with all routes
  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={
          {
            style: {
              borderRadius: '8px',
              background: '#333',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#FACC15', // Yellow-400
                secondary: 'black',
              },
            },
          }
        }
      />
      <div className="bg-[#0a0a0a] text-white pb-24 relative">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/semester/:semId" element={<Subjects />} />
        <Route path="/semester/:semId/:subjectId" element={<Materials />} />
        <Route path="/library" element={<Library />} />
        <Route path="/upload" element={<ProtectedRoute requiredRole="admin"><Upload /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><Admin /></ProtectedRoute>} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Navbar />
      
      {/* Floating AI Assistant Button */}
      <FloatingAIButton />
    </div>
    </>
  );
}

function FloatingAIButton() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  // Define allowed paths
  const showAiButton = ['/', '/library', '/profile'].includes(location.pathname);
  
  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleChatGPTClick = () => {
    window.open("https://chatgpt.com/g/g-6989c41dba348191812205212e4f644c-b-n-n-assignment-bot", "_blank");
    closeModal();
  };

  const handleGeminiClick = () => {
    window.open("https://gemini.google.com/gem/7fafd606ec16", "_blank");
    closeModal();
  };

  return (
    <>
      {showAiButton && (
        <>
          {/* Floating Button */}
          <button
            onClick={toggleModal}
            className="fixed bottom-24 right-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-lg z-50 hover:scale-105 transition-transform duration-200 flex items-center gap-2"
          >
            <Sparkles size={20} />
            <span className="hidden sm:inline font-medium text-sm">Assignment AI</span>
          </button>

          {/* Modal Backdrop */}
          {isOpen && (
            <div 
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300"
              onClick={closeModal}
            >
              {/* Decorative Glow Blob */}
              <div className="absolute w-64 h-64 bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-full blur-3xl -top-10 -right-10"></div>
              <div className="absolute w-56 h-56 bg-gradient-to-r from-emerald-600/30 to-cyan-600/30 rounded-full blur-3xl -bottom-10 -left-10"></div>
              
              {/* Modal Box */}
              <div 
                className="w-full max-w-sm bg-[#09090b] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-5 border-b border-zinc-800 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-white tracking-wide">AI Assignment Writer</h2>
                  <button
                    onClick={closeModal}
                    className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>

                {/* Content - Compact Horizontal Layout */}
                <div className="p-5 space-y-3">
                  {/* Card 1: ChatGPT Bot */}
                  <div
                    onClick={handleChatGPTClick}
                    className="flex items-center gap-4 p-4 rounded-xl border border-emerald-500/20 hover:border-emerald-400 bg-gradient-to-r from-emerald-900/40 to-zinc-900/60 hover:bg-emerald-900/50 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 flex-shrink-0">
                      <Bot size={28} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">ChatGPT Edition</h3>
                      <p className="text-xs text-emerald-200/70">Logical & Precise.</p>
                    </div>
                  </div>

                  {/* Card 2: Gemini Bot */}
                  <div
                    onClick={handleGeminiClick}
                    className="flex items-center gap-4 p-4 rounded-xl border border-blue-500/20 hover:border-blue-400 bg-gradient-to-r from-blue-900/40 to-purple-900/40 hover:bg-blue-900/50 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 flex-shrink-0">
                      <Sparkles size={28} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Gemini Edition</h3>
                      <p className="text-xs text-blue-200/70">Creative & Fast.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default App;