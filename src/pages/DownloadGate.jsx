import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebase";
import AdBanner from "../components/AdBanner";

function NativeAd() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const adContainer = document.createElement("div");
    adContainer.id = "container-f086433aa457e5252b84f8136e979116";
    containerRef.current.appendChild(adContainer);

    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = "https://pl30438977.effectivecpmnetwork.com/f086433aa457e5252b84f8136e979116/invoke.js";
    
    containerRef.current.appendChild(script);
  }, []);

  return <div ref={containerRef} className="w-full max-w-sm mx-auto my-3" />;
}

export default function DownloadGate() {
  const [searchParams] = useSearchParams();
  const fileId = searchParams.get("id");
  const fileName = searchParams.get("name") || "file";
  const materialId = searchParams.get("materialId");
  const subjectName = searchParams.get("subject") || "";
  const materialType = searchParams.get("type") || "";
  const semester = searchParams.get("sem") || "";

  const [stage, setStage] = useState("idle"); // idle | processing | ready
  const [progress, setProgress] = useState(0);

  const [loadingLink, setLoadingLink] = useState(true);
  const [dots, setDots] = useState("");

  useEffect(() => {
    // Cycle dots: "", ".", "..", "..."
    const dotsInterval = setInterval(() => {
      setDots(prev => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 400);

    // After 5 seconds, disable loadingLink
    const timer = setTimeout(() => {
      setLoadingLink(false);
      clearInterval(dotsInterval);
    }, 5000);

    return () => {
      clearInterval(dotsInterval);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    // Inject Social Bar script
    const socialBarScript = document.createElement("script");
    socialBarScript.src = "https://pl30438978.effectivecpmnetwork.com/64/10/e4/6410e414e7ba94bfac887476372ef40e.js";
    socialBarScript.async = true;
    document.body.appendChild(socialBarScript);

    return () => {
      if (document.body.contains(socialBarScript)) {
        document.body.removeChild(socialBarScript);
      }
    };
  }, []);

  const startProcess = () => {
    setStage("processing");
    const totalMs = 11000; // 11 seconds total duration
    const stepMs = 100;
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += stepMs;
      
      const timeRatio = elapsed / totalMs;
      // Ease-out curve (exponent 0.7) for non-linear speed progression
      const baseProgress = Math.pow(timeRatio, 0.7) * 100;
      const jitter = (Math.random() - 0.5) * 2; // -1% to +1% organic jitter
      const rawProgress = Math.round(baseProgress + jitter);
      
      const currentProgress = elapsed >= totalMs ? 100 : Math.max(0, Math.min(99, rawProgress));
      setProgress(currentProgress);

      if (elapsed >= totalMs) {
        clearInterval(interval);
        setStage("ready");
        triggerDownload();
      }
    }, stepMs);
  };

  const triggerDownload = async () => {
    if (materialId) {
      try {
        const downloadedMaterials = JSON.parse(localStorage.getItem('downloadedMaterials') || '[]');
        if (!downloadedMaterials.includes(materialId)) {
          downloadedMaterials.push(materialId);
          localStorage.setItem('downloadedMaterials', JSON.stringify(downloadedMaterials));
          await updateDoc(doc(db, "materials", materialId), { downloads: increment(1) });
        }
      } catch (err) {
        console.error("Download count update failed:", err);
      }
    }
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const baseUrl = isLocalhost ? "https://fycs-study-hub.vercel.app" : window.location.origin;
    window.location.href = `${baseUrl}/api/download?id=${fileId}&name=${encodeURIComponent(fileName)}`;
  };

  return (
    <div className="bg-gray-950 text-white min-h-screen">
      {/* FOLD 1: Exact viewport height containing Top/Bottom Banners and Centered Card */}
      <div className="h-[100dvh] flex flex-col justify-between items-center px-4 py-4 relative">
        {/* Top Banner (Responsive: 320x50 on mobile, 728x90 on md+) */}
        <div className="w-full flex justify-center">
          <div className="hidden md:block">
            <AdBanner adKey="460599b54c2ff48b922f509d238da5dc" width={728} height={90} />
          </div>
          <div className="block md:hidden">
            <AdBanner adKey="1580001d5d517502f4a88637fa4a71fc" width={320} height={50} />
          </div>
        </div>

        {/* Central Card Area (Vertically centered inside remaining viewport height) */}
        <div className="flex flex-col lg:flex-row flex-1 w-full max-w-7xl gap-6 items-center justify-center my-4">
          {/* Left Desktop Sidebar */}
          <div className="hidden lg:flex w-[160px] shrink-0 justify-center">
            <AdBanner adKey="a589dee8adb4ee32752f08ffa84d6b2f" width={160} height={600} />
          </div>

          {/* Centered Download Card */}
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm sm:max-w-md mx-auto">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full text-center shadow-lg mx-auto">
              {/* Metadata Badges */}
              <div className="flex justify-center items-center gap-1.5 mb-3 flex-wrap">
                {materialType && (
                  <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-bold rounded-md uppercase tracking-wider">
                    {materialType}
                  </span>
                )}
                {semester && (
                  <span className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-bold rounded-md">
                    Sem {semester}
                  </span>
                )}
              </div>

              {/* Subject Title */}
              {subjectName && (
                <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider mb-1 px-2 truncate">
                  {subjectName}
                </p>
              )}

              {/* File Title */}
              <p className="text-white text-base font-bold mb-4 truncate px-2">{fileName}</p>

              {stage === "idle" && (
                <button
                  disabled={loadingLink}
                  onClick={startProcess}
                  className={`${
                    loadingLink
                      ? "bg-gray-800 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 active:scale-95 text-white"
                  } transition-all px-6 py-4 rounded-xl font-semibold w-full text-base shadow-lg shadow-blue-500/20`}
                >
                  {loadingLink ? `Getting Link${dots}` : "Download File"}
                </button>
              )}

              {stage === "processing" && (
                <div className="py-2">
                  <p className="text-sm text-gray-400 mb-3">Preparing your download...</p>
                  <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-blue-500 h-full transition-all duration-100 ease-out" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 font-semibold">{progress}%</p>
                </div>
              )}

              {stage === "ready" && (
                <div className="py-2">
                  <p className="text-green-400 font-semibold text-sm">Download started ✓</p>
                  <p className="text-xs text-gray-500 mt-1">If the download didn't start automatically, click here to download again.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Desktop Sidebar */}
          <div className="hidden lg:flex w-[160px] shrink-0 justify-center">
            <AdBanner adKey="89c8057a29aa045de216722e2c7fdc99" width={160} height={300} />
          </div>
        </div>

        {/* Bottom Banner (Responsive: 320x50 on mobile, 728x90 on md+) */}
        <div className="w-full flex justify-center">
          <div className="hidden md:block">
            <AdBanner adKey="460599b54c2ff48b922f509d238da5dc" width={728} height={90} />
          </div>
          <div className="block md:hidden">
            <AdBanner adKey="1580001d5d517502f4a88637fa4a71fc" width={320} height={50} />
          </div>
        </div>
      </div>

      {/* FOLD 2: Additional Ads (Placed below the fold / requires scrolling) */}
      <div className="w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center gap-4 py-8 px-4">
        <NativeAd />

        {/* Extra Banner Slot (468x60 - hidden on tight mobile screens < 480px, shown on sm+) */}
        <div className="hidden sm:block w-full text-center my-1">
          <AdBanner adKey="c7c3d1f2df201accee2e5e6dd5ae4f3e" width={468} height={60} />
        </div>

        {/* Middle Banner (300x250) */}
        <div className="w-full flex justify-center">
          <AdBanner adKey="3a20a0c9de1d599239beb32f5556ec91" width={300} height={250} />
        </div>
      </div>
    </div>
  );
}
