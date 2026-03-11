import { ChevronRight, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Semesters() {
  const navigate = useNavigate();

  const semesters = [
    { id: 1, title: "Semester 1", subtitle: "4 subjects available" },
    { id: 2, title: "Semester 2", subtitle: "4 subjects available" },
    { id: 3, title: "Semester 3", subtitle: "3 subjects available" },
    { id: 4, title: "Semester 4", subtitle: "3 subjects available" },
  ];

  return (
    <div className="p-5 pt-8 max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold">Semesters</h2>
        <p className="text-white/55 text-xs mt-1">
          Pick your semester to explore materials.
        </p>
      </div>

      <div className="space-y-3">
        {semesters.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => navigate(`/semester/${s.id}`)}
            className="glass-card w-full p-4 flex items-center gap-3 text-left hover:bg-white/10 transition-colors"
          >
            <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <GraduationCap size={18} className="text-white/90" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">{s.title}</div>
              <div className="text-[11px] text-white/55 truncate">
                {s.subtitle}
              </div>
            </div>

            <ChevronRight size={18} className="text-white/40" />
          </button>
        ))}
      </div>
    </div>
  );
}

