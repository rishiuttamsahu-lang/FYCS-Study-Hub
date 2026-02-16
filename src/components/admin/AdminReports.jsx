import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase";
import { Flag, CheckCircle, Trash2, AlertTriangle, Loader2 } from "lucide-react";

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const reportsQuery = query(
        collection(db, "reports"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(reportsQuery);
      const reportsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReports(reportsData);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      const reportRef = doc(db, "reports", id);
      await updateDoc(reportRef, { status: "resolved" });
      setReports((prev) =>
        prev.map((report) =>
          report.id === id ? { ...report, status: "resolved" } : report
        )
      );
    } catch (error) {
      console.error("Error resolving report:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const reportRef = doc(db, "reports", id);
      await deleteDoc(reportRef);
      setReports((prev) => prev.filter((report) => report.id !== id));
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin" size={24} />
          <span>Loading reports...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Flag className="text-red-500 w-6 h-6 md:w-7 md:h-7" />
          <h1 className="text-xl md:text-2xl font-bold">User Reports</h1>
          <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full text-xs md:text-sm">
            {reports.filter((r) => r.status !== "resolved").length} unresolved
          </span>
        </div>

        {reports.length === 0 ? (
          <div className="bg-[#1a1a1a] rounded-xl p-6 md:p-10 text-center">
            <CheckCircle className="mx-auto text-green-500 mb-3 w-10 h-10 md:w-12 md:h-12" />
            <h2 className="text-lg md:text-xl font-semibold mb-2">No Reports Yet</h2>
            <p className="text-sm md:text-base text-white/55">All materials are working correctly!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#3a3a3a] transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {report.materialTitle || "Unknown Material"}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          report.status === "resolved"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {report.status === "resolved" ? "Resolved" : "Unread"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={16} className="text-yellow-500" />
                        <span>
                          {report.reason === "Broken Link"
                            ? "Broken Link"
                            : report.reason?.startsWith("Other:")
                            ? report.reason
                            : report.reason || "Unknown issue"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white/50">•</span>
                        <span>{formatDate(report.createdAt)}</span>
                      </div>
                      {report.reporterEmail && (
                        <div className="flex items-center gap-2">
                          <span className="text-white/50">•</span>
                          <span className="text-white/50">Reported by: {report.reporterEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {report.status !== "resolved" && (
                      <button
                        onClick={() => handleResolve(report.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        <CheckCircle size={16} />
                        Mark Resolved
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="mt-3 bg-zinc-800/40 border border-zinc-700/50 rounded-lg p-3">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 text-sm">
                      <span className="text-zinc-400 flex items-center gap-1 shrink-0 mt-0.5">
                        📍 Location:
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-yellow-400 font-medium px-2 py-0.5 bg-yellow-400/10 rounded-md whitespace-nowrap">
                          Sem {report.semester || 'N/A'}
                        </span>
                        <span className="text-zinc-400">➔</span>
                        <span className="text-white font-medium leading-snug">
                          {report.subject || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 italic">
                    * Go to the Materials tab and filter by this semester/subject to edit or delete this file.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}