import { FileText, ExternalLink, Download, Edit3, Pencil, Flag, Eye, Calendar, User, CheckCircle } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useState } from "react";
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { createPortal } from 'react-dom';

export default function MaterialCard({ material, onIncrementView, convertToDownloadLink, navigateToSubject = false, navigate, isNewMaterial, getSubjectById, onEdit }) {
  const { isAdmin } = useApp();
  
  // Local state for optimistic updates
  const [viewCount, setViewCount] = useState(material.views || 0);
  const [downloadCount, setDownloadCount] = useState(material.downloads || 0);
  
  // Report issue state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Broken Link');
  const [otherReason, setOtherReason] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "Just now";
    
    try {
      // Handle Firestore Timestamp objects
      if (dateString?.toDate) {
        return dateString.toDate().toLocaleDateString()
      }
      // Handle ISO date strings
      else if (typeof dateString === 'string') {
        return new Date(dateString).toLocaleDateString()
      }
      // Handle regular Date objects
      else if (dateString instanceof Date) {
        return dateString.toLocaleDateString()
      }
      // Handle timestamp objects
      else {
        return new Date(dateString).toLocaleDateString()
      }
    } catch (error) {
      console.warn('Invalid date:', dateString, error);
      return "Just now";
    }
  };

  // Helper function to get subject abbreviation
  const getSubjectAbbreviation = (subjectName) => {
    const abbreviations = {
      "Human Resource Management": "HRM",
      "Web Development": "Web Dev",
      "Algorithm": "Algo",
      "Number Theory": "Maths",
      "Co-Curriculum": "CC",
      "Environmental Management and Sustainable Development": "EMSD",
      "Marketing Mix-2": "MM-2",
      "Object Oriented Programming": "OOPs"
    };
    
    if (abbreviations[subjectName]) {
      return abbreviations[subjectName];
    }
    
    // Return a truncated version if no abbreviation is found
    if (subjectName.length > 15) {
      return subjectName.substring(0, 12) + "...";
    }
    
    return subjectName;
  };

  // Helper function to add material to recent history (views)
  const addToRecentHistory = (material) => {
    const historyItem = {
      id: material.id,
      title: material.title,
      subject: getSubjectById?.(material.subjectId)?.name || "Unknown",
      link: material.link,
      type: material.type,
      viewedAt: new Date().toISOString()
    };
    
    // Get existing recent history
    const existingHistory = JSON.parse(localStorage.getItem('recentHistory') || '[]');
    
    // Remove duplicates (same ID)
    const filteredHistory = existingHistory.filter(item => item.id !== material.id);
    
    // Add new item to the top
    const updatedHistory = [historyItem, ...filteredHistory].slice(0, 10); // Keep last 10 items
    
    // Save to localStorage
    localStorage.setItem('recentHistory', JSON.stringify(updatedHistory));
  };

  // Helper function to add material to download history
  const addToDownloadHistory = (material) => {
    const historyItem = {
      id: material.id,
      title: material.title,
      subject: getSubjectById?.(material.subjectId)?.name || "Unknown",
      link: material.link,
      type: material.type,
      downloadedAt: new Date().toISOString()
    };
    
    // Get existing download history
    const existingHistory = JSON.parse(localStorage.getItem('downloadHistory') || '[]');
    
    // Remove duplicates (same ID)
    const filteredHistory = existingHistory.filter(item => item.id !== material.id);
    
    // Add new item to the top
    const updatedHistory = [historyItem, ...filteredHistory].slice(0, 10); // Keep last 10 items
    
    // Save to localStorage
    localStorage.setItem('downloadHistory', JSON.stringify(updatedHistory));
  };

  const handleViewClick = async () => {
    if (navigateToSubject && navigate) {
      // Convert material type to lowercase for URL parameter
      const tabParam = material.type.toLowerCase();
      navigate(`/semester/${material.semId}/${material.subjectId}?tab=${tabParam}`);
    } else {
      try {
        // Open the file link immediately for good UX
        window.open(material.link, "_blank", "noopener,noreferrer");

        // Check localStorage to see if this user already viewed this specific material
        const viewedMaterials = JSON.parse(localStorage.getItem('viewedMaterials') || '[]');

        // If they haven't viewed it yet, increment the db and save to localStorage
        if (!viewedMaterials.includes(material.id)) {
          // Add to localStorage
          viewedMaterials.push(material.id);
          localStorage.setItem('viewedMaterials', JSON.stringify(viewedMaterials));

          // Increment in Firestore
          await updateDoc(doc(db, "materials", material.id), { 
            views: increment(1) 
          });

          // Add to recent history
          addToRecentHistory(material);

          // Optimistic update: increment view count locally
          setViewCount(prev => prev + 1);

          if (onIncrementView) {
            onIncrementView(material.id);
          }
        }
      } catch (error) {
        console.error("Error updating view count:", error);
        // Still open the link even if DB update fails
        window.open(material.link, "_blank", "noopener,noreferrer");
      }
    }
  };

  const handleDownloadClick = async () => {
    try {
      // Update database with increment
      await updateDoc(doc(db, "materials", material.id), { 
        downloads: increment(1) 
      });
      
      // Add to download history
      addToDownloadHistory(material);
      
      // Optimistic update: increment download count locally
      setDownloadCount(prev => prev + 1);
      
      const downloadUrl = convertToDownloadLink(material.link);
      
      // Create a temporary anchor element and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', ''); // Hint to browser to download
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error updating download count:", error);
      // Still attempt download even if DB update fails
      const downloadUrl = convertToDownloadLink(material.link);
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Handle report submission
  const handleSubmitReport = async () => {
    // Validate "Other" reason if selected
    if (reportReason === 'Other' && !otherReason.trim()) {
      alert("Please specify the issue.");
      return;
    }
    
    setIsReporting(true);
    
    try {
      // Define the final reason to save
      const finalReason = reportReason === 'Other' ? `Other: ${otherReason}` : reportReason;
      
      await addDoc(collection(db, 'reports'), {
        materialId: material.id,
        materialTitle: material.title,
        materialLink: material.link,
        subject: getSubjectById?.(material.subjectId)?.name || material.subject || 'Unknown Subject',
        semester: material.semester || material.semId || 'Unknown Semester',
        reason: finalReason,
        status: 'unread',
        createdAt: serverTimestamp()
      });
      
      setIsSuccess(true);
      setTimeout(() => {
        setIsReportModalOpen(false);
        setIsSuccess(false);
        setReportReason('Broken Link');
        setOtherReason('');
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error submitting report. Please try again.');
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div className="glass-card p-4">
      <div className="flex items-start gap-3">
        <div className="mt-1">
          {material.type === 'Notes' ? <FileText className="text-blue-400" size={18} /> :
           material.type === 'Practicals' ? <FileText className="text-green-400" size={18} /> :
           material.type === 'IMP' ? <FileText className="text-yellow-400" size={18} /> :
           material.type === 'Assignment' ? <FileText className="text-purple-400" size={18} /> :
           <FileText className="text-emerald-400" size={18} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-white/90 truncate">{material.title}</h3>
            {isNewMaterial && isNewMaterial(material) && (
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full whitespace-nowrap">
                New
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="text-xs text-zinc-400">
              {material.type}
            </div>
            {getSubjectById && material.subjectId && (
              <span className="px-2 py-0.5 bg-zinc-800 text-gray-300 text-xs rounded-md whitespace-nowrap">
                {getSubjectAbbreviation(getSubjectById(material.subjectId)?.name || "Unknown")}
              </span>
            )}
            <span className="text-xs text-zinc-400 whitespace-nowrap">
              • {formatDate(material.createdAt || material.date)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        {/* Button Layout: Big View + Small Download Square */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleViewClick}
            className="flex-1 py-2 rounded-xl bg-blue-500/15 border border-blue-500/25 text-blue-200 font-bold hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-2"
          >
            View <ExternalLink size={16} />
          </button>
          <button
            type="button"
            onClick={handleDownloadClick}
            className="hidden md:flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-colors"
            title="Download"
            aria-label="Download material"
          >
            <Download size={18} />
          </button>
        </div>

        {/* Unified Card Footer */}
        <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-1 mt-4 pt-3 border-t border-zinc-800/50 text-[11px] sm:text-xs text-zinc-400">
          
          {/* 1. Left: Uploader Name */}
          <span className="flex items-center gap-1 text-zinc-300">
            <User size={12} /> by {
              (!material.uploaderName || material.uploaderName === 'Student' || material.uploaderName === 'Admin') 
              ? 'Rishikesh' 
              : material.uploaderName
            }
          </span>

          {/* 2. Center: Admin Stats (Only visible to Admin) */}
          {isAdmin && (
            <div className="flex items-center gap-2 sm:gap-3 font-medium mx-auto">
              <span className="flex items-center gap-1 text-blue-400" title="Views">
                <Eye size={12} className="sm:w-[14px] sm:h-[14px]" /> {material.views || 0}
              </span>
              <span className="flex items-center gap-1 text-green-400" title="Downloads">
                <Download size={12} className="sm:w-[14px] sm:h-[14px]" /> {material.downloads || 0}
              </span>
              <span className="flex items-center gap-1 text-purple-400" title="Date">
                <Calendar size={12} className="sm:w-[14px] sm:h-[14px]" /> 
                {material.createdAt?.seconds ? new Date(material.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          )}

          {/* 3. Right: Report Button */}
          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1 hover:text-red-400 transition-colors ml-auto sm:ml-0"
          >
            <Flag size={12} /> Report
          </button>

        </div>

        {/* Admin-only Edit Button */}
        {isAdmin && onEdit && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => onEdit(material)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/15 text-amber-300 text-[10px] font-bold hover:bg-amber-500/25 transition-colors"
              title="Edit material"
            >
              <Pencil size={12} />
              Edit
            </button>
          </div>
        )}
      </div>
      
      {/* Report Issue Modal */}
      {isReportModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border-t-2 border-red-500 rounded-xl p-6 shadow-2xl relative">
            {isSuccess ? (
              <div className="text-center py-6 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-green-500" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Report Submitted!</h3>
                <p className="text-zinc-400 text-sm">Thank you for helping us keep the library clean. Admins will look into it.</p>
              </div>
            ) : (
              <>
                {/* Decorative Background Glow */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Report Issue</h3>
                    <button
                      type="button"
                      onClick={() => setIsReportModalOpen(false)}
                      className="text-white/50 hover:text-white transition-colors"
                      aria-label="Close report modal"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="text-sm text-white/70">
                    For: <span className="font-semibold text-white">{material.title}</span>
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Reason for reporting:</label>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full bg-zinc-800 text-white rounded border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500 p-3"
                    >
                      <option value="Broken Link">Broken Link</option>
                      <option value="Wrong File Attached">Wrong File Attached</option>
                      <option value="Outdated / Old Syllabus">Outdated / Old Syllabus</option>
                      <option value="Other">Other</option>
                    </select>
                    {reportReason === 'Other' && (
                      <textarea 
                        value={otherReason} 
                        onChange={(e) => setOtherReason(e.target.value)} 
                        placeholder="Please describe the issue..." 
                        className="w-full mt-3 bg-zinc-800 border border-zinc-700 text-white rounded-lg p-3 text-sm focus:outline-none focus:border-yellow-500 min-h-[80px] resize-none"
                        required
                      />
                    )}
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsReportModalOpen(false)}
                      disabled={isReporting}
                      className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all font-medium border border-zinc-700 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitReport}
                      disabled={isReporting}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl transition-all font-bold shadow-lg shadow-red-500/20 disabled:opacity-50"
                    >
                      {isReporting ? 'Submitting...' : 'Submit Report'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}