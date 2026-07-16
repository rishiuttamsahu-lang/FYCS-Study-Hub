import { ChevronLeft, ExternalLink, FileText, Download, Search, ArrowUpDown, Check } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import MaterialCard from "../components/MaterialCard";

const convertToDownloadLink = (link) => {
  if (!link) return '';
  const idMatch = link.match(/\/d\/(.+?)\/|id=(.+?)(\&|$)/);
  const fileId = idMatch ? (idMatch[1] || idMatch[2]) : null;
  return fileId ? `https://docs.google.com/uc?export=download&id=${fileId}` : link;
};

// Skeleton for just the material cards — header, tab bar, and search/sort
// are static UI and render immediately.
const MaterialsListSkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="glass-card p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/10 animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 rounded bg-white/10 animate-pulse" style={{ width: `${[70, 55, 80, 60, 75][i]}%` }} />
          <div className="h-3 rounded bg-white/10 animate-pulse" style={{ width: `${[45, 40, 50, 42, 48][i]}%` }} />
          <div className="h-2.5 rounded bg-white/10 animate-pulse w-24" />
        </div>
        <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
      </div>
    ))}
  </div>
);

export default function Materials() {
  const navigate = useNavigate();
  const { semId, subjectId } = useParams();
  const [searchParams] = useSearchParams();

  const { materialsLoading, subjectsLoading, getSemesterById, getSubjectById, getMaterialsBySubject } = useApp();

  const initialTab = searchParams.get('tab') || 'notes';
  const tabMapping = {
    'notes': 'Notes',
    'practicals': 'Practicals',
    'imp': 'IMP',
    'assignment': 'Assignment'
  };
  const mappedTab = tabMapping[initialTab.toLowerCase()] || 'Notes';
  const [typeTab, setTypeTab] = useState(mappedTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("a-z");
  const [showSortMenu, setShowSortMenu] = useState(false);

  const materialsForSubject = getMaterialsBySubject(subjectId) || [];

  const approvedForSubject = useMemo(() => {
    return materialsForSubject.filter(m => {
      const stat = (m.status || "").toString().trim().toLowerCase();
      return stat === "" || stat === "approved";
    });
  }, [materialsForSubject]);

  const filteredAndSorted = useMemo(() => {
    let result = [...approvedForSubject];
    result = result.filter(m => m.type === typeTab);
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(m => m.title.toLowerCase().includes(query));
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case "newest": {
          const dA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || a.date || 0);
          const dB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || b.date || 0);
          return dB - dA;
        }
        case "oldest": {
          const dA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || a.date || 0);
          const dB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || b.date || 0);
          return dA - dB;
        }
        case "a-z":
          return (a.title || "").localeCompare(b.title || "");
        default:
          return 0;
      }
    });
    return result;
  }, [approvedForSubject, typeTab, searchQuery, sortBy]);

  // `semesters` is a static local array — always available immediately.
  const semester = getSemesterById(semId);

  // Bad route (semester doesn't exist at all) — this is a real error
  // state, not a loading state, so show it right away.
  if (!semester) {
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

  const subject = getSubjectById(subjectId);

  // Only treat a missing subject as "not found" once subjects have
  // actually finished loading — otherwise this would flash briefly on
  // every refresh while `subjects` is still in flight.
  if (!subjectsLoading && !subject) {
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
    <div className="p-5 pt-6 max-w-md mx-auto pb-24">
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
          {subjectsLoading ? (
            <div className="h-4 w-28 rounded bg-white/10 animate-pulse mx-auto mt-1" />
          ) : (
            <div className="font-bold truncate">{subject.name}</div>
          )}
        </div>

        <div className="w-10" />
      </div>

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
                  active ? "bg-[#FFD700] text-black shadow-lg shadow-[#FFD700]/20" : "text-white/70 hover:bg-white/5",
                ].join(" ")}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-white/70" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, practicals..."
            className="w-full glass-card pl-10 pr-4 py-2 rounded-xl border border-white/20 bg-zinc-800 text-white placeholder:text-white/60 focus:border-[#FFD700] focus:outline-none"
          />
        </div>
        
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="glass-card w-12 h-12 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10"
            title="Sort materials"
          >
            <ArrowUpDown size={18} className="text-white/80" />
          </button>
          
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

      {materialsLoading ? (
        <MaterialsListSkeleton />
      ) : (
        <div className="space-y-3">
          {filteredAndSorted.map((m) => (
            <MaterialCard 
              key={m.id} 
              material={m} 
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
      )}
    </div>
  );
}
