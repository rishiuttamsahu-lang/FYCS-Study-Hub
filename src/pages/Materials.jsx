import { ChevronLeft, ExternalLink, FileText, Download, Search, ArrowUpDown, Check } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import MaterialCard from "../components/MaterialCard";

export default function Materials() {
  const navigate = useNavigate();
  const { semId, subjectId } = useParams();
  const [searchParams] = useSearchParams();

  const { getSemesterById, getSubjectById, getMaterialsBySubject, incrementView } = useApp();
  const semester = getSemesterById(semId);
  const subject = getSubjectById(subjectId);
  
  // Get initial tab from URL parameter or default to "Notes"
  const initialTab = searchParams.get('tab') || 'notes';
  // Convert to proper case (Notes, Practicals, etc.)
  const tabMapping = {
    'notes': 'Notes',
    'practicals': 'Practicals',
    'imp': 'IMP',
    'assignment': 'Assignment'
  };
  const mappedTab = tabMapping[initialTab.toLowerCase()] || 'Notes';
  const [typeTab, setTypeTab] = useState(mappedTab); // Notes | Practicals | IMP | Assignment
  
  // Search and Sort states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, a-z
  const [showSortMenu, setShowSortMenu] = useState(false);
  
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

  // Filter and sort logic
  const filteredAndSorted = useMemo(() => {
    // First filter by type
    let result = approvedForSubject.filter((m) => m.type === typeTab);
    
    // Then filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((m) => 
        m.title.toLowerCase().includes(query) ||
        m.type.toLowerCase().includes(query)
      );
    }
    
    // Then sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          // Handle both Timestamp objects and regular dates
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || a.date || 0);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || b.date || 0);
          return dateB - dateA; // Descending
        
        case "oldest":
          const dateA2 = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || a.date || 0);
          const dateB2 = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || b.date || 0);
          return dateA2 - dateB2; // Ascending
        
        case "a-z":
          return a.title.localeCompare(b.title);
        
        default:
          return 0;
      }
    });
    
    return result;
  }, [approvedForSubject, typeTab, searchQuery, sortBy]);

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

      {/* Search and Sort Controls */}
      <div className="flex gap-2 mb-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-white/50" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, practicals..."
            className="w-full glass-card pl-10 pr-4 py-2 rounded-xl border border-white/10 bg-zinc-800 text-white placeholder:text-white/30 focus:border-[#FFD700] focus:outline-none"
          />
        </div>
        
        {/* Sort Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="glass-card w-12 h-12 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10"
            title="Sort materials"
          >
            <ArrowUpDown size={18} className="text-white/80" />
          </button>
          
          {/* Sort Dropdown Menu */}
          {showSortMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 glass-card rounded-xl border border-white/10 z-10">
              <div className="py-2">
                {[
                  { value: "newest", label: "Newest First" },
                  { value: "oldest", label: "Oldest First" },
                  { value: "a-z", label: "Title A-Z" }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSortBy(option.value);
                      setShowSortMenu(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between hover:bg-white/5 transition-colors ${
                      sortBy === option.value ? "text-[#FFD700] font-bold" : "text-white"
                    }`}
                  >
                    {option.label}
                    {sortBy === option.value && <Check size={16} />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {filteredAndSorted.map((m) => (
          <MaterialCard 
            key={m.id} 
            material={m} 
            onIncrementView={incrementView}
            convertToDownloadLink={convertToDownloadLink}
            getSubjectById={getSubjectById}
          />
        ))}

        {!filteredAndSorted.length ? (
          <div className="glass-card p-4 text-center text-white/60 text-sm">
            {searchQuery 
              ? `No ${typeTab} found matching "${searchQuery}"` 
              : `No ${typeTab} found for this subject.`}
          </div>
        ) : null}
      </div>
    </div>
  );
}

