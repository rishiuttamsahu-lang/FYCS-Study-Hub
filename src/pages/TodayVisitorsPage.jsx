import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { ArrowLeft, Users, Clock, Search } from "lucide-react";

export default function TodayVisitorsPage() {
  const navigate = useNavigate();
  const [visitorDetails, setVisitorDetails] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toLocaleDateString('en-CA');
    const statRef = doc(db, 'analytics', today);
    const unsubscribe = onSnapshot(statRef, (docSnap) => {
      if (docSnap.exists()) {
        setVisitorDetails(docSnap.data().visitorDetails || []);
      } else {
        setVisitorDetails([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore onSnapshot error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const sortedVisitors = useMemo(() => {
    const sorted = [...visitorDetails].sort((a, b) => new Date(b.time) - new Date(a.time));
    if (!searchTerm.trim()) return sorted;
    const term = searchTerm.toLowerCase();
    return sorted.filter(v => 
      (v.name || "").toLowerCase().includes(term) || 
      (v.email || "").toLowerCase().includes(term)
    );
  }, [visitorDetails, searchTerm]);

  return (
    <div className="p-4 pt-6 max-w-md mx-auto min-h-[100dvh] pb-24 relative bg-[#0a0a0a]">
      {/* 📱 Mobile Optimized Header Row */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate("/admin/analytics")}
          className="h-9 w-9 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all flex items-center justify-center shrink-0"
          title="Back to Admin"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-bold text-white/90 truncate bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Today's Visitors
          </h1>
          <p className="text-[11px] text-white/50 truncate mt-0.5">Logs of verified student logins today</p>
        </div>
      </div>

      {loading ? (
        <div className="glass-card p-8 text-center flex flex-col items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#FFD700] border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-xs text-white/50">Syncing live analytics...</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          {/* Top Counter Bar Banner */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.05)]">
              <Users size={14} />
              <span className="text-[11px] font-extrabold tracking-wide">Logins: {visitorDetails.length}</span>
            </div>
            {searchTerm.trim() && (
              <div className="text-[10px] font-medium text-zinc-500">
                Found {sortedVisitors.length} matches
              </div>
            )}
          </div>

          {/* Search Box with Dense Padding Layout */}
          <div className="p-3 border-b border-white/10 bg-black/20">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={14} className="text-white/40" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full glass-card pl-9 pr-4 py-2 text-xs bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-[#FFD700] focus:outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Ultra Dense Mobile Scrolling List Box */}
          <div className="p-2 space-y-1.5 max-h-[calc(100vh-220px)] overflow-y-auto no-scrollbar">
            {sortedVisitors.length > 0 ? (
              sortedVisitors.map((visitor, index) => (
                <div 
                  key={index} 
                  className="bg-zinc-900/50 border border-zinc-800/50 p-2.5 px-3 rounded-xl flex items-center justify-between gap-3 transition-colors hover:bg-zinc-800/50 hover:border-zinc-700 duration-150 animate-in fade-in slide-in-from-bottom-1"
                >
                  {/* Left Metadata Panel Stack */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-bold text-white text-xs truncate tracking-wide">
                      {visitor.name}
                    </span>
                    <span className="text-[10px] text-white/40 truncate mt-0.5">
                      {visitor.email}
                    </span>
                  </div>
                  
                  {/* Right Dense Time Stamp Badge Container */}
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold rounded-md border border-cyan-500/15">
                      <Clock size={10} />
                      {new Date(visitor.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Users size={28} className="mx-auto text-white/10 mb-2" />
                <p className="text-xs font-bold text-white/50">No matching logins found.</p>
                <p className="text-[10px] text-white/30 mt-0.5">Try refining your search keyword.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
