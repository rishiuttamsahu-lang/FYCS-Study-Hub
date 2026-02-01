import { ChevronLeft, ExternalLink, FileText, Download } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import MaterialCard from "../components/MaterialCard";

export default function Materials() {
  const navigate = useNavigate();
  const { semId, subjectId } = useParams();

  const { getSemesterById, getSubjectById, getMaterialsBySubject, incrementView } = useApp();
  const semester = getSemesterById(semId);
  const subject = getSubjectById(subjectId);
  const [typeTab, setTypeTab] = useState("Notes"); // Notes | Practicals | IMP | Assignment
  
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

  const approvedForSubject = useMemo(
    () => getMaterialsBySubject(subjectId),
    [getMaterialsBySubject, subjectId]
  );

  const filtered = approvedForSubject.filter((m) => m.type === typeTab);

  if (!semester || !subject) {
    return (
      <div className="p-5 pt-8 max-w-md mx-auto">
        <div className="glass-card p-4">
          <div className="font-semibold">Subject not found</div>
          <div className="text-[11px] text-white/55 mt-1">
            Please go back and choose a valid subject.
          </div>
          <button
            type="button"
            className="btn-primary w-full mt-4"
            onClick={() => navigate(`/semester/${semId}`)}
          >
            Back to Subjects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 pt-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-5">
        <Link
          to={`/semester/${semester.id}`}
          className="glass-card h-10 w-10 flex items-center justify-center hover:bg-white/10 transition-colors"
          aria-label="Back"
          title="Back"
        >
          <ChevronLeft size={18} className="text-white/80" />
        </Link>

        <div className="text-center min-w-0 px-2">
          <div className="text-[11px] text-white/55 truncate">
            {semester.name}
          </div>
          <div className="font-bold truncate">{subject.name}</div>
        </div>

        <div className="w-10" />
      </div>

      {/* Type Tabs (Notes / Practicals / IMP / Assignment) */}
      <div className="glass-card p-2 mb-4 rounded-full">
        <div className="flex gap-2">
          {["Notes", "Practicals", "IMP", "Assignment"].map((t) => {
            const active = typeTab === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTypeTab(t)}
                className={[
                  "flex-1 rounded-full py-2 text-[11px] font-extrabold transition-colors",
                  active ? "bg-[#FFD700] text-black" : "text-white/70 hover:bg-white/5",
                ].join(" ")}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((m) => (
          <MaterialCard 
            key={m.id} 
            material={m} 
            onIncrementView={incrementView}
            convertToDownloadLink={convertToDownloadLink}
          />
        ))}

        {!filtered.length ? (
          <div className="glass-card p-4 text-center text-white/60 text-sm">
            No {typeTab} found for this subject.
          </div>
        ) : null}
      </div>
    </div>
  );
}

