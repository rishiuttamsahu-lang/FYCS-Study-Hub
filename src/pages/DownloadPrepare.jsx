import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Download, FileText, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';

export default function DownloadPrepare() {
  const [progress, setProgress] = useState(0);
  const [showDownload, setShowDownload] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const fileId = searchParams.get('id');
  const fileName = searchParams.get('name') || 'Document';

  useEffect(() => {
    // 10 second progress bar logic
    const duration = 10000; // 10 seconds
    const intervalTime = 100; // updates every 100ms for smooth transitions
    const step = (intervalTime / duration) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setShowDownload(true);
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);
    
    return () => clearInterval(interval);
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients for premium glassmorphic feel */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#FFD700]/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[250px] h-[250px] bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />

      {/* Back Button */}
      <button 
        onClick={handleGoBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors duration-200 text-sm font-semibold bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="glass-card w-full max-w-md p-6 sm:p-8 text-center bg-zinc-900/60 border border-white/10 rounded-3xl backdrop-blur-xl relative z-10 shadow-2xl">
        {/* Header Icon & Title */}
        <div className="mx-auto w-16 h-16 bg-[#FFD700]/10 rounded-2xl flex items-center justify-center mb-6 border border-[#FFD700]/20 animate-pulse">
          <FileText className="text-[#FFD700]" size={28} />
        </div>

        <h2 className="text-white text-xl font-bold mb-2">Preparing Download</h2>
        <p className="text-zinc-400 text-xs mb-6 px-4 truncate max-w-full font-medium" title={fileName}>
          {fileName}
        </p>
        
        {/* Progress Bar & Status Text */}
        <div className="w-full bg-zinc-800/50 h-2.5 rounded-full overflow-hidden mb-3 border border-white/5">
          <div 
            className="bg-gradient-to-r from-amber-400 to-[#FFD700] h-full transition-all duration-100 ease-out" 
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex justify-between items-center text-[11px] text-zinc-500 font-semibold mb-6">
          <span>{Math.round(progress)}% Completed</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck size={12} /> Secure Link
          </span>
        </div>

        {/* 🌟 Dedicated Premium Ad Space Container */}
        <div className="my-6 min-h-[200px] flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-black/30 p-4 transition-all duration-300 hover:border-white/20">
          {/* Ad Network Code Integration Area */}
          <div className="text-center">
            <p className="text-white/40 text-xs font-semibold mb-1">Sponsored Advertisement</p>
            <p className="text-white/20 text-[10px] max-w-[200px] mx-auto leading-relaxed">
              Ads support our servers to keep learning resources free for everyone.
            </p>
          </div>
          
          {/* Ad Script Injection Point */}
          <div id="ad-container-download-prepare" className="mt-4 w-full">
            {/* If there's direct code, it goes here */}
          </div>
        </div>

        {showDownload ? (
          <a 
            href={`/api/download?id=${fileId}&name=${encodeURIComponent(fileName)}`}
            className="block w-full py-3.5 bg-gradient-to-r from-amber-400 to-[#FFD700] text-black font-extrabold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#FFD700]/10 hover:shadow-[#FFD700]/20 text-center flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Download Now
          </a>
        ) : (
          <button 
            disabled 
            className="w-full py-3.5 bg-zinc-800/80 text-zinc-500 font-extrabold rounded-2xl cursor-not-allowed border border-white/5 animate-pulse text-sm"
          >
            Please Wait...
          </button>
        )}

        <div className="mt-6 flex items-center justify-center gap-1.5 text-zinc-500 text-[10px] font-medium">
          <AlertCircle size={12} />
          <span>If the download does not start, try disabling ad-blocker.</span>
        </div>
      </div>
    </div>
  );
}
