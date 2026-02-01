import { FileText, ExternalLink, Download } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useState } from "react";

export default function MaterialCard({ material, onIncrementView, convertToDownloadLink, navigateToSubject = false, navigate, isNewMaterial }) {
  const { isAdmin } = useApp();
  
  // Local state for optimistic updates
  const [viewCount, setViewCount] = useState(material.views || 0);
  const [downloadCount, setDownloadCount] = useState(material.downloads || 0);

  const handleViewClick = () => {
    if (navigateToSubject && navigate) {
      navigate(`/semester/${material.semId}/${material.subjectId}`);
    } else {
      // Optimistic update: increment view count locally
      setViewCount(prev => prev + 1);
      
      if (onIncrementView) {
        onIncrementView(material.id);
      }
      window.open(material.link, "_blank", "noopener,noreferrer");
    }
  };

  const handleDownloadClick = () => {
    // Optimistic update: increment download count locally
    setDownloadCount(prev => prev + 1);
    
    const downloadUrl = convertToDownloadLink(material.link);
    window.open(downloadUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="glass-card p-4">
      <div className="flex items-start gap-3">
        <div className="mt-1">
          {material.type === 'Notes' ? <FileText className="text-blue-400" size={18} /> :
           material.type === 'Practicals' ? <FileText className="text-green-400" size={18} /> :
           material.type === 'IMP' ? <FileText className="text-yellow-400" size={18} /> :
           material.type === 'Assignment' ? <FileText className="text-purple-400" size={18} /> :
           <FileText className="text-emerald-400" size={18} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white/90 truncate">{material.title}</h3>
            {isNewMaterial && isNewMaterial(material) && (
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full whitespace-nowrap">
                New
              </span>
            )}
          </div>
          <div className="text-xs text-white/40 mt-1">
            {material.type}
          </div>
        </div>
      </div>

      <div className="mt-4">
        {/* Button Layout: Big View + Small Download Square */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleViewClick}
            className="flex-1 py-2 rounded-xl bg-blue-500/15 border border-blue-500/25 text-blue-200 font-bold hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-2"
          >
            View <ExternalLink size={16} />
          </button>
          <button
            type="button"
            onClick={handleDownloadClick}
            className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-colors"
            title="Download"
          >
            <Download size={18} />
          </button>
        </div>

        {/* Admin-only Stats */}
        {isAdmin && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/10">
            <div className="text-[10px] text-white/55 flex items-center gap-1">
              <span>👁</span>
              <span>{viewCount} views</span>
            </div>
            <div className="text-[10px] text-white/55 flex items-center gap-1">
              <span>⬇</span>
              <span>{downloadCount} downloads</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}