import { BookOpen, Download, FileText, GraduationCap, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import dbLogo from "../assets/image.png";
import MaterialCard from "../components/MaterialCard";

const Home = () => {
  const navigate = useNavigate();
  const { semesters, subjects, getRecentMaterials, getSubjectById, getSemesterById, isAdmin } = useApp();

  const semestersVm = semesters.map((s) => ({
    id: s.id,
    title: s.name,
    subjects: subjects.filter((sub) => Number(sub.semId) === Number(s.id)).length,
  }));

  const recentApproved = getRecentMaterials(10);
  
  // Helper function to check if material is new (within 24 hours)
  const isNewMaterial = (material) => {
    if (!material.createdAt) return false;
    
    // Handle both Timestamp objects and regular dates
    const createdAt = material.createdAt?.toDate ? 
      material.createdAt.toDate() : 
      new Date(material.createdAt || material.date || Date.now());
    
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return createdAt > twentyFourHoursAgo;
  };
  
  // Helper function to convert Google Drive view links to direct download links
  const convertToDownloadLink = (viewLink) => {
    if (!viewLink) return viewLink;
    
    // Handle different Google Drive URL formats
    if (viewLink.includes("drive.google.com/file/d/")) {
      // Extract file ID from the URL
      const fileIdMatch = viewLink.match(/\/file\/d\/([^\/]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        return `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`;
      }
    } else if (viewLink.includes("drive.google.com/open?id=")) {
      // Extract file ID from the legacy URL format
      const urlObj = new URL(viewLink);
      const fileId = urlObj.searchParams.get("id");
      if (fileId) {
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
      }
    }
    
    // If it's not a Google Drive link, return the original link
    return viewLink;
  };

  return (
    <div className="p-5 pt-10 max-w-md mx-auto">
      {/* Header Section */}
      <div className="text-center mb-10">
        <img src={dbLogo} alt="FYCS Study Hub Logo" className="w-16 h-16 object-contain mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-1">FYCS Study Hub</h1>
        <p className="text-gray-400 text-xs">Your central hub for first year computer science</p>
      </div>

      {/* Quick Section Title */}
      <div className="flex items-center gap-2 mb-4 text-white/50 uppercase text-[10px] tracking-widest font-bold">
        <BookOpen size={14} />
        <span>Quick Section</span>
      </div>

      {/* Semesters Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {semestersVm.map((sem) => (
          <button
            key={sem.id}
            type="button"
            onClick={() => navigate(`/semester/${sem.id}`)}
            className="glass-card p-4 text-left transition-colors hover:bg-white/5"
          >
            <div className="bg-white/5 border border-white/10 w-9 h-9 rounded-xl flex items-center justify-center mb-3">
              <GraduationCap size={18} className="text-white/90" />
            </div>
            <h3 className="font-bold text-sm mb-1">{sem.title}</h3>
            <p className="text-[10px] text-white/50">{sem.subjects} subjects available</p>
          </button>
        ))}
      </div>

      {/* Materials Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-white/50 uppercase text-[10px] tracking-widest font-bold">
          <Layers size={14} />
          <span>Materials</span>
        </div>
        <button
          type="button"
          className="text-[11px] font-semibold text-[#FFD700] hover:opacity-90 transition-opacity"
          onClick={() => navigate("/admin")}
        >
          Explore
        </button>
      </div>

      <div className="space-y-4">
        {recentApproved.length > 0 ? (
          recentApproved.map((m) => (
            <MaterialCard 
              key={m.id} 
              material={m} 
              convertToDownloadLink={convertToDownloadLink}
              navigateToSubject={true}
              navigate={navigate}
              isNewMaterial={isNewMaterial}
              getSubjectById={getSubjectById}
            />
          ))
        ) : (
          <div className="glass-card p-8 text-center">
            <div className="text-white/50 mb-2">No materials found</div>
            <div className="text-sm text-white/40">
              Be the first to upload!
            </div>
            {isAdmin && (
              <button
                type="button"
                className="btn-primary mt-4 px-6 py-2 text-sm"
                onClick={() => navigate("/upload")}
              >
                Upload Material
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;