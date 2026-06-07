import { Code, Edit3, FileText, Filter, Search as SearchIcon, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import SubjectCard from "../components/SubjectCard";

export default function Search() {
  const [q, setQ] = useState("");
  const { materials, getSubjectById } = useApp();

  const filtered = useMemo(() => {
    return (materials || []).filter((m) => {
      // Show only approved (or legacy empty-status) materials
      const status = (m.status || "").toLowerCase().trim();
      const isApproved = status === "" || status === "approved";
      if (!isApproved) return false;

      if (!q.trim()) return true;

      const subjectName = getSubjectById?.(m.subjectId)?.name || "";
      const queryText = q.toLowerCase().trim();

      return (
        (m.title || "").toLowerCase().includes(queryText) ||
        (m.type || "").toLowerCase().includes(queryText) ||
        `semester ${m.semId}`.includes(queryText) ||
        `sem ${m.semId}`.includes(queryText) ||
        subjectName.toLowerCase().includes(queryText)
      );
    });
  }, [materials, q, getSubjectById]);

  return (
    <div className="p-5 pt-6 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 glass-card px-4 py-3 flex items-center gap-3">
          <SearchIcon size={18} className="text-white/50" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search materials, subjects..."
            className="w-full bg-transparent outline-none text-sm placeholder:text-white/35"
          />
        </div>
        <button
          type="button"
          className="glass-card h-12 w-12 flex items-center justify-center hover:bg-white/10 transition-colors"
          aria-label="Filters"
          title="Filters"
        >
          <Filter size={18} className="text-white/70" />
        </button>
      </div>

      <div className="space-y-4">
        {filtered.map((m) => {
          const subject = getSubjectById?.(m.subjectId);
          const subtitleText = `Semester ${m.semId} • ${subject?.name || "Subject"}`;
          return (
            <SubjectCard
              key={m.id}
              icon={
                m.type === 'Notes' ? <FileText size={18} className="text-blue-400" /> :
                m.type === 'Practicals' ? <Code size={18} className="text-green-400" /> :
                m.type === 'IMP' ? <Star size={18} className="text-yellow-400" /> :
                m.type === 'Assignment' ? <Edit3 size={18} className="text-purple-400" /> :
                <FileText size={18} className="text-white/90" />
              }
              title={m.title}
              subtitle={subtitleText}
              tags={[m.type]}
              isLive={(m.status || "").toLowerCase() === "approved" || !m.status}
              onView={() => window.open(m.link, "_blank", "noopener,noreferrer")}
            />
          );
        })}
      </div>
    </div>
  );
}
