import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Loader2, BookOpen, Share2, Shield, Github } from "lucide-react";

export default function Login() {
  const { login, user } = useApp();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  const handleLogin = async () => {
    try {
      setIsLoading(true);
      await login();
      // Navigate immediately after successful authentication
      navigate('/');
      // Don't set setIsLoading(false) here - we navigate away
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false); // Only set false on error
    }
  };
  
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-y-auto font-sans relative">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* Simple Public Navbar */}
        <nav className="flex justify-between items-center px-6 py-6 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
            <span className="font-bold text-xl tracking-tight hidden sm:block">BNN CS Study Hub</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-zinc-400">
            <a href="/privacy.html" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/terms.html" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="max-w-6xl mx-auto px-6 pt-12 pb-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium border border-blue-500/20 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Built for FYCS Students
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
              Master Your <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">CS Journey</span>
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-400 mb-10 leading-relaxed max-w-2xl mx-auto">
              The ultimate collaborative platform for BNN computer science students. Access, share, and organize semester-wise notes, previous year question papers, and assignments securely.
            </p>

            {/* The Login Action */}
            <div className="bg-zinc-900/40 p-2 rounded-2xl border border-white/5 inline-block backdrop-blur-xl">
              <button
                type="button"
                onClick={handleLogin}
                disabled={isLoading}
                className={`px-8 py-4 rounded-xl bg-white text-black font-bold flex items-center gap-3 transition-all duration-300 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105 hover:bg-zinc-200'}`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in securely...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 1.76-1.77 3.12-3.77 3.12-2.29 0-4.14-1.86-4.14-4.15s1.85-4.15 4.14-4.15c1.11 0 2.08.41 2.81 1.19l2.06-2.06c-1.27-1.19-2.88-1.92-4.87-1.92-4.02 0-7.29 3.27-7.29 7.29s3.27 7.29 7.29 7.29c3.68 0 6.74-2.69 6.74-7.29 0-.58-.1-1.14-.2-1.67z"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Features Grid - Crucial for Google Verification */}
          <div className="grid md:grid-cols-3 gap-6 text-left mt-24">
            <div className="p-8 bg-zinc-900/30 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="text-blue-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Structured Materials</h3>
              <p className="text-zinc-400 leading-relaxed">
                Everything is perfectly organized by semesters and subjects. Stop scrolling through endless WhatsApp groups to find that one PDF.
              </p>
            </div>

            <div className="p-8 bg-zinc-900/30 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                <Share2 className="text-purple-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Drive Integration</h3>
              <p className="text-zinc-400 leading-relaxed">
                We utilize the Google Drive API to let you seamlessly attach your educational files. We only access the exact files you explicitly choose to share.
              </p>
            </div>

            <div className="p-8 bg-zinc-900/30 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6">
                <Shield className="text-emerald-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">100% Secure</h3>
              <p className="text-zinc-400 leading-relaxed">
                Your data stays private. Authenticate securely via Google. We don't store your personal files on our servers, only the public links you provide.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}