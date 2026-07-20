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

  const [stage, setStage] = useState("idle"); // idle | processing | ready
  const [progress, setProgress] = useState(0);

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
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center px-4">
      {/* Top Banner (Responsive: 320x50 on mobile, 728x90 on md+) */}
      <div className="w-full flex justify-center py-3">
        <div className="hidden md:block">
          <AdBanner adKey="460599b54c2ff48b922f509d238da5dc" width={728} height={90} />
        </div>
        <div className="block md:hidden">
          <AdBanner adKey="1580001d5d517502f4a88637fa4a71fc" width={320} height={50} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 w-full max-w-7xl gap-4 items-center justify-center">
        {/* Left Desktop Sidebar */}
        <div className="hidden lg:flex w-[160px] shrink-0 justify-center">
          <AdBanner adKey="a589dee8adb4ee32752f08ffa84d6b2f" width={160} height={600} />
        </div>

        {/* Central Content Area (Mobile First layout & padding) */}
        <div className="flex-1 flex flex-col items-center justify-center py-6 w-full max-w-sm sm:max-w-md mx-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full text-center shadow-lg mx-auto">
            <p className="text-gray-300 text-sm font-medium mb-4 truncate px-2">{fileName}</p>

            {stage === "idle" && (
              <button
                onClick={startProcess}
                className="bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all px-6 py-4 rounded-xl font-semibold w-full text-base shadow-lg shadow-blue-500/20"
              >
                Download File
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

          {/* Native Ad (Directly below download card) */}
          <NativeAd />

          {/* Extra Banner Slot (468x60 - hidden on tight mobile screens < 480px, shown on sm+) */}
          <div className="hidden sm:block w-full text-center my-3">
            <AdBanner adKey="c7c3d1f2df201accee2e5e6dd5ae4f3e" width={468} height={60} />
          </div>

          {/* Middle Banner (300x250 - highly optimized for all devices) */}
          <div className="w-full flex justify-center mt-4">
            <AdBanner adKey="3a20a0c9de1d599239beb32f5556ec91" width={300} height={250} />
          </div>
        </div>

        {/* Right Desktop Sidebar */}
        <div className="hidden lg:flex w-[160px] shrink-0 justify-center">
          <AdBanner adKey="89c8057a29aa045de216722e2c7fdc99" width={160} height={300} />
        </div>
      </div>

      {/* Bottom Banner (Responsive: 320x50 on mobile, 728x90 on md+) */}
      <div className="w-full flex justify-center py-3">
        <div className="hidden md:block">
          <AdBanner adKey="460599b54c2ff48b922f509d238da5dc" width={728} height={90} />
        </div>
        <div className="block md:hidden">
          <AdBanner adKey="1580001d5d517502f4a88637fa4a71fc" width={320} height={50} />
        </div>
      </div>
    </div>
  );
}
