import { BarChart3, ClipboardCheck, Download, Eye, Users } from "lucide-react";
import { useMemo, useState } from "react";

const tabs = [
  { id: "analytics", label: "Analytics", icon: <BarChart3 size={16} /> },
  { id: "subjects", label: "Subjects", icon: <ClipboardCheck size={16} /> },
  { id: "materials", label: "Materials", icon: <Download size={16} /> },
  { id: "users", label: "Users", icon: <Users size={16} /> },
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("analytics");

  const stats = useMemo(
    () => [
      {
        label: "Total Views",
        value: "24.8K",
        icon: <Eye size={18} className="text-white/70" />,
      },
      {
        label: "Total Downloads",
        value: "6.2K",
        icon: <Download size={18} className="text-white/70" />,
      },
      {
        label: "Pending Requests",
        value: "8",
        icon: <ClipboardCheck size={18} className="text-white/70" />,
      },
    ],
    []
  );

  const pendingApprovals = useMemo(
    () => [
      {
        id: "pa-1",
        name: "Unit 1 Notes",
        meta: "Unit 1 Notes • C Programming",
        uploader: "Student",
        time: "2h ago",
      },
      {
        id: "pa-2",
        name: "IMP Questions 2023",
        meta: "IMP • Mathematics I",
        uploader: "Student",
        time: "6h ago",
      },
      {
        id: "pa-3",
        name: "DBMS Assignment 2",
        meta: "Assignment • DBMS",
        uploader: "Student",
        time: "1d ago",
      },
      {
        id: "pa-4",
        name: "Digital Electronics Viva",
        meta: "Practicals • Digital Electronics",
        uploader: "Student",
        time: "2d ago",
      },
    ],
    []
  );

  return (
    <div className="p-5 pt-8 max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <p className="text-white/55 text-xs mt-1">
          Manage analytics, subjects, materials, and users.
        </p>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-3">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/55">
                {s.label}
              </div>
              {s.icon}
            </div>
            <div className="mt-2 text-lg font-extrabold">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Management Tabs */}
      <div className="glass-card p-2 mb-5">
        <div className="grid grid-cols-4 gap-2">
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={[
                  "rounded-xl px-2 py-2 text-[11px] font-bold transition-colors flex items-center justify-center gap-1",
                  isActive
                    ? "bg-[#FFD700] text-black"
                    : "bg-white/0 text-white/70 hover:bg-white/5",
                ].join(" ")}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content (lightweight placeholders + approvals always visible per spec) */}
      <div className="glass-card p-4 mb-4">
        <div className="text-white/50 uppercase text-[10px] tracking-widest font-bold">
          {tabs.find((t) => t.id === activeTab)?.label}
        </div>
        <div className="mt-2 text-[12px] text-white/70 leading-relaxed">
          {activeTab === "analytics" &&
            "Overview of platform performance (dummy)."}
          {activeTab === "subjects" && "Manage semesters and subjects (dummy)."}
          {activeTab === "materials" &&
            "Manage materials library, tags and links (dummy)."}
          {activeTab === "users" && "Manage users and roles (dummy)."}
        </div>
      </div>

      {/* Pending Approvals Section */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-white/50 uppercase text-[10px] tracking-widest font-bold">
          Pending approvals
        </div>
        <div className="badge-live">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Live
        </div>
      </div>

      <div className="space-y-3">
        {pendingApprovals.map((p) => (
          <div key={p.id} className="glass-card p-4">
            <div className="font-semibold text-sm">{p.name}</div>
            <div className="text-[11px] text-white/55 mt-1">{p.meta}</div>
            <div className="text-[11px] text-white/40 mt-1">
              Uploaded by {p.uploader} • {p.time}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                type="button"
                className="flex-1 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-200 font-extrabold py-3 text-sm hover:bg-emerald-500/20 transition-colors"
              >
                Approve
              </button>
              <button
                type="button"
                className="flex-1 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 font-extrabold py-3 text-sm hover:bg-rose-500/15 transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

