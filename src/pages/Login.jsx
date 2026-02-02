import { useApp } from "../context/AppContext";

export default function Login() {
  const { login } = useApp();
  
  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login error:', error);
    }
  };
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
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
                  src="/src/assets/image.png" 
                  alt="FYCS Hub Logo" 
                  className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                />
              </div>
            </div>
            
            {/* Heading */}
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              FYCS Study Hub
            </h1>
            
            {/* Subtext */}
            <p className="text-zinc-400 text-sm mb-10">
              Your central hub for notes, practicals, important materials, and assignments.
            </p>
            
            {/* Login Button */}
            <button
              type="button"
              onClick={handleLogin}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold flex items-center justify-center gap-3 hover:scale-105 hover:shadow-lg transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 1.76-1.77 3.12-3.77 3.12-2.29 0-4.14-1.86-4.14-4.15s1.85-4.15 4.14-4.15c1.11 0 2.08.41 2.81 1.19l2.06-2.06c-1.27-1.19-2.88-1.92-4.87-1.92-4.02 0-7.29 3.27-7.29 7.29s3.27 7.29 7.29 7.29c3.68 0 6.74-2.69 6.74-7.29 0-.58-.1-1.14-.2-1.67z"/>
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}