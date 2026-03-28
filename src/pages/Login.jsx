import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Loader2 } from "lucide-react";

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
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-black min-h-screen text-white overflow-y-auto font-sans">
      
      {/* 1. MAIN LOGIN SECTION (Viewport Height) */}
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background Blobs */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl animate-pulse" />
        
        {/* Glass Card Container */}
        <div className="relative z-10 max-w-md w-full">
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="text-center">
              {/* Logo */}
              <div className="flex justify-center mb-8">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-600/30 to-blue-500/30 border border-white/20 flex items-center justify-center shadow-lg shadow-purple-500/20 backdrop-blur-sm">
                  <img 
                    src="/logo.png" 
                    alt="BNN CS Study Hub Logo"
                    className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                  />
                </div>
              </div>
              
              {/* Heading */}
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                BNN CS Study Hub
              </h1>
              
              {/* Subtext */}
              <p className="text-zinc-400 text-sm mb-10">
                Your central hub for BNN computer science students.
              </p>
              
              {/* Login Button */}
              <button
                type="button"
                onClick={handleLogin}
                disabled={isLoading}
                className={`w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold flex items-center justify-center gap-3 transition-all duration-300 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105 hover:shadow-lg'}`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 1.76-1.77 3.12-3.77 3.12-2.29 0-4.14-1.86-4.14-4.15s1.85-4.15 4.14-4.15c1.11 0 2.08.41 2.81 1.19l2.06-2.06c-1.27-1.19-2.88-1.92-4.87-1.92-4.02 0-7.29 3.27-7.29 7.29s3.27 7.29 7.29 7.29c3.68 0 6.74-2.69 6.74-7.29 0-.58-.1-1.14-.2-1.67z"/>
                    </svg>
                    Sign in with Google
                  </>
                )}
              </button>

              {/* PUBLIC LINKS FOR GOOGLE BOT */}
              <div className="mt-8 pt-6 border-t border-white/10 flex flex-col items-center gap-2 text-xs text-zinc-500">
                <p>By signing in, you agree to our policies.</p>
                <div className="flex gap-4">
                  <a href="/privacy.html" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
                  <span className="text-zinc-700">•</span>
                  <a href="/terms.html" className="hover:text-blue-400 transition-colors">Terms of Service</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator (Optional but looks good) */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce text-zinc-500">
          <span className="text-xs mb-2">Read More</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
        </div>
      </div>

      {/* 2. SEO CONTENT SECTION (Hidden below the fold, satisfies the bots) */}
      <div className="max-w-4xl mx-auto px-6 py-24 text-zinc-400 border-t border-white/5">
        <h2 className="text-2xl font-bold text-white mb-6">Welcome to BNN CS Study Hub</h2>
        
        <div className="grid md:grid-cols-2 gap-8 text-sm leading-relaxed">
          <div>
            <p className="mb-4">
              BNN CS Study Hub is the premier digital academic library and collaborative platform designed exclusively for First Year and Second Year Computer Science (FYCS & SYCS) students. Our primary mission is to simplify the educational journey by providing a secure, centralized, and easy-to-navigate environment for managing academic resources.
            </p>
            <p>
              Whether you are preparing for your upcoming semester examinations or working on complex assignments, our platform offers structured access to high-quality study materials, comprehensive notes, previous year question papers, and practical reference files. Everything is organized meticulously by semester and subject to save your valuable time.
            </p>
          </div>
          <div>
            <p className="mb-4">
              We understand the importance of peer-to-peer learning in computer science. Therefore, BNN CS Study Hub leverages the power of Google Drive API to allow students to seamlessly upload and share their personal notes and educational materials with classmates, fostering a strong academic community.
            </p>
            <p>
              Security and privacy are at the core of our application. By utilizing secure Google Authentication, we ensure that only verified students can access the study vault. We do not store your personal files on our servers; instead, we efficiently manage public access links, maintaining absolute transparency and data safety. Join the hub today and elevate your academic performance!
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}