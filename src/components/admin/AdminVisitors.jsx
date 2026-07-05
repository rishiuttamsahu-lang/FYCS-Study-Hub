import { useState, useMemo } from "react";
import { Search, Users, Clock } from "lucide-react";

export default function AdminVisitors({ visitorDetails }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredVisitors = useMemo(() => {
    if (!searchTerm.trim()) {
      return [...visitorDetails].sort((a, b) => new Date(b.time) - new Date(a.time));
    }
    const term = searchTerm.toLowerCase();
    return [...visitorDetails]
      .filter(v => 
        (v.name || "").toLowerCase().includes(term) || 
        (v.email || "").toLowerCase().includes(term)
      )
      .sort((a, b) => new Date(b.time) - new Date(a.time));
  }, [visitorDetails, searchTerm]);

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-5 border-b border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg text-white/90">Today's Visitors List</h3>
            <p className="text-sm text-white/50 mt-1">Logs of all verified student logins for today</p>
          </div>
          <div className="flex items-center gap-2 self-start bg-cyan-500/10 text-cyan-400 px-3 py-1.5 rounded-full border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <Users size={16} />
            <span className="text-xs font-bold">Total: {visitorDetails?.length || 0}</span>
          </div>
        </div>

        <div className="mt-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-white/50" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search visitors by name or email..."
            className="w-full glass-card pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[#FFD700] focus:outline-none transition-all duration-300"
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-hide">
        <table className="w-full">
          <thead className="sticky top-0 bg-[#0a0a0a] z-10">
            <tr className="border-b border-white/10">
              <th className="text-left p-4 text-white/50 text-sm font-bold uppercase tracking-wider">Visitor Name</th>
              <th className="text-left p-4 text-white/50 text-sm font-bold uppercase tracking-wider">Email Address</th>
              <th className="text-right p-4 text-white/50 text-sm font-bold uppercase tracking-wider">Login Time</th>
            </tr>
          </thead>
          <tbody>
            {filteredVisitors.length > 0 ? (
              filteredVisitors.map((visitor, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/2 transition-colors duration-200">
                  <td className="p-4 font-semibold text-white/90">{visitor.name}</td>
                  <td className="p-4 text-white/60">{visitor.email}</td>
                  <td className="p-4 text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 text-cyan-400 text-xs font-bold rounded-lg border border-cyan-500/20">
                      <Clock size={12} />
                      {new Date(visitor.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-10 text-center">
                  <Users size={32} className="mx-auto text-zinc-600 mb-3" />
                  <p className="text-sm font-bold text-zinc-400">No visitors found.</p>
                  <p className="text-xs text-zinc-500 mt-1">Try resetting the search filter or checking back later.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden p-4 space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar">
        {filteredVisitors.length > 0 ? (
          filteredVisitors.map((visitor, index) => (
            <div key={index} className="glass-card p-4 border border-white/5 space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-bold text-white text-sm truncate pr-2">{visitor.name}</span>
                <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold rounded-md border border-cyan-500/20">
                  {new Date(visitor.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="text-xs text-white/60 truncate">{visitor.email}</div>
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <Users size={32} className="mx-auto text-zinc-600 mb-3" />
            <p className="text-sm font-bold text-zinc-400">No visitors found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
