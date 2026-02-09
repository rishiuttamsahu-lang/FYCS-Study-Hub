import { BarChart2, Book, CheckCircle, Clock, Code, Download, Edit3, Eye, FileText, Pen, Pencil, Plus, Search, Settings, Shield, Star, Trash2, Upload, User, XCircle, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { useApp } from "../context/AppContext";
import { doc, updateDoc, deleteDoc, writeBatch, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const tabs = [
  { id: "analytics", label: "Analytics", icon: <BarChart2 size={16} /> },
  { id: "subjects", label: "Subjects", icon: <Book size={16} /> },
  { id: "materials", label: "Materials", icon: <FileText size={16} /> },
  { id: "users", label: "Users", icon: <User size={16} /> },
  { id: "settings", label: "Settings", icon: <Settings size={16} /> },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState("analytics");
  const [materialFilter, setMaterialFilter] = useState("Pending"); // Pending | Approved
  const [showAddSubjectForm, setShowAddSubjectForm] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [editingMaterial, setEditingMaterial] = useState(null); // For edit modal
  const [editingSubject, setEditingSubject] = useState(null); // For subject edit modal
  const [editSubjectName, setEditSubjectName] = useState("");
  const [editSubjectIcon, setEditSubjectIcon] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToReject, setItemToReject] = useState(null);
  
  // Search, Filter, Sort states for Approved Materials
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [filterSem, setFilterSem] = useState("All");
  const [newSubject, setNewSubject] = useState({
    name: "",
    semesterId: "1",
    icon: "Book"
  });
  
  const [editForm, setEditForm] = useState({
    title: "",
    subjectId: "",
    type: "Notes",
    link: ""
  });
  
  const navigate = useNavigate();
  const { 
    semesters, 
    subjects, 
    materials, 
    users, 
    stats,
    user,
    loading,
    approveMaterial, 
    rejectMaterial, 
    deleteMaterial,
    addSubject,
    getSemesterById,
    getSubjectById,
    getPendingMaterials,
    getApprovedMaterials,
    getSubjectsBySemester
  } = useApp();
  
  // Admin access is now protected by ProtectedRoute component
  
  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl mb-2">Loading Admin Dashboard...</h2>
          <p className="text-white/55">Please wait while we fetch the data.</p>
        </div>
      </div>
    );
  }
  
  // Deduplicate users based on id or email
  const uniqueUsers = (users || []).filter((user, index, self) =>
    index === self.findIndex((t) => (t.id === user.id || t.email === user.email))
  );

  // Filter users based on search term
  const filteredUsers = uniqueUsers.filter(user => 
    user.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(userSearchTerm.toLowerCase())
  );
  
  // Safety check for stats calculation
  const safeStats = {
    totalViews: ((materials || []).filter(m => m?.status === 'Approved') || []).reduce((sum, material) => sum + (material?.views || 0), 0),
    totalDownloads: ((materials || []).filter(m => m?.status === 'Approved') || []).reduce((sum, material) => sum + (material?.downloads || 0), 0),
    pendingRequests: ((materials || []).filter(m => m?.status === 'Pending') || []).length,
    totalMaterials: (materials || []).length,
    approvedMaterials: ((materials || []).filter(m => m?.status === 'Approved') || []).length,
    totalSubjects: (subjects || []).length,
    totalSemesters: (semesters || []).length
  };
  
  // Get unique subjects for filter dropdown
  const uniqueSubjects = [...new Set(materials.filter(m => m.status === 'Approved').map(m => m.subjectId))];
  
  // Filter and sort approved materials (always A-Z by title)
  const filteredMaterials = getApprovedMaterials()
    .filter(material => {
      if (searchQuery && !material.title?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterSem !== "All" && material.semId !== filterSem) return false;
      if (filterType !== "All" && material.type !== filterType) return false;
      if (filterSubject !== "All" && material.subjectId !== filterSubject) return false;
      return true;
    })
    .sort((a, b) => (a.title || "").localeCompare(b.title || "", undefined, { sensitivity: "base" }));
  
  // Format numbers
  const formatNumber = (num) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  // Handle subject form submission
  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (newSubject.name.trim()) {
      const result = await addSubject(newSubject.name, newSubject.semesterId);
      if (result.success) {
        setNewSubject({ name: "", semesterId: "1", icon: "Book" });
        setShowAddSubjectForm(false);
        toast.success("Subject added successfully!");
      } else {
        toast.error(`Error adding subject: ${result.error}`);
      }
    }
  };
  
  // Delete subject function
  const deleteSubject = async (id) => {
    // Show premium floating glass card alert
    const result = await Swal.fire({
      titleHtml: '<div class="text-sm font-bold">Delete Subject?</div>',
      text: "This action cannot be undone.",
      icon: undefined,
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "No",
      buttonsStyling: false,
      background: "#121212",
      color: "#FFFFFF",
      width: "280px",
      padding: "0.8rem",
      customClass: {
        popup: "border border-[#4e4d4d] rounded-[15px] grid",
        title: "text-sm font-bold",
        content: "text-xs",
        actions: "flex justify-center gap-2 mt-2",
        confirmButton: "bg-[#ef4444] hover:bg-[#dc2626] px-4 py-1.5 rounded-xl text-xs font-medium text-white",
        cancelButton: "bg-[#2a2a2a] hover:bg-[#3a3a3a] px-4 py-1.5 rounded-xl text-xs font-medium text-white"
      }
    });
    
    if (!result.isConfirmed) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, "subjects", id));
      toast.success("Subject deleted successfully!");
    } catch (error) {
      console.error("Error deleting subject:", error);
      toast.error("Error deleting subject: " + error.message);
    }
  };
  
  const promoteUser = async (userId) => {
    // Show compact confirmation popup
    const result = await Swal.fire({
      title: 'Promote to Admin?',
      text: "This user will gain admin privileges.",
      icon: undefined,
      showCancelButton: true,
      confirmButtonText: "Yes, Promote",
      cancelButtonText: "Cancel",
      buttonsStyling: false,
      background: "#121212",
      color: "#FFFFFF",
      width: "280px",
      padding: "0.8rem",
      customClass: {
        popup: "border border-[#4e4d4d] rounded-[15px] shadow-2xl",
        title: "text-sm font-bold pt-2",
        htmlContainer: "text-[10px] text-gray-400 opacity-80",
        actions: "flex justify-center gap-3 mt-4 mb-2",
        confirmButton: "bg-purple-500 hover:bg-purple-600 px-5 py-2 rounded-[10px] text-[11px] font-bold text-white transition-all",
        cancelButton: "bg-[#2a2a2a] hover:bg-[#3a3a3a] px-5 py-2 rounded-[10px] text-[11px] font-bold text-white transition-all"
      }
    });

    if (result.isConfirmed) {
      try {
        await updateDoc(doc(db, "users", userId), { role: "admin" });
        toast.success("User promoted to admin successfully!");
      } catch (error) {
        console.error("Error promoting user:", error);
        toast.error("Error promoting user: " + error.message);
      }
    }
  };
  
  const demoteUser = async (userId) => {
    // Show compact confirmation popup
    const result = await Swal.fire({
      title: 'Demote to Student?',
      text: "This user will lose admin privileges.",
      icon: undefined,
      showCancelButton: true,
      confirmButtonText: "Yes, Demote",
      cancelButtonText: "Cancel",
      buttonsStyling: false,
      background: "#121212",
      color: "#FFFFFF",
      width: "280px",
      padding: "0.8rem",
      customClass: {
        popup: "border border-[#4e4d4d] rounded-[15px] shadow-2xl",
        title: "text-sm font-bold pt-2",
        htmlContainer: "text-[10px] text-gray-400 opacity-80",
        actions: "flex justify-center gap-3 mt-4 mb-2",
        confirmButton: "bg-amber-500 hover:bg-amber-600 px-5 py-2 rounded-[10px] text-[11px] font-bold text-white transition-all",
        cancelButton: "bg-[#2a2a2a] hover:bg-[#3a3a3a] px-5 py-2 rounded-[10px] text-[11px] font-bold text-white transition-all"
      }
    });

    if (result.isConfirmed) {
      try {
        await updateDoc(doc(db, "users", userId), { role: "student" });
        toast.success("User demoted to student successfully!");
      } catch (error) {
        console.error("Error demoting user:", error);
        toast.error("Error demoting user: " + error.message);
      }
    }
  };
  
  const handleToggleBan = async (user) => {
    const isCurrentlyBanned = user.isBanned || false;
    const action = isCurrentlyBanned ? "Unban" : "Ban";
    const confirmText = isCurrentlyBanned 
      ? "This user will be unbanned and regain access." 
      : "This user will be banned from the platform.";
    
    // Show compact confirmation popup
    const result = await Swal.fire({
      title: `${action} User?`,
      text: confirmText,
      icon: undefined,
      showCancelButton: true,
      confirmButtonText: `Yes, ${action}`,
      cancelButtonText: "Cancel",
      buttonsStyling: false,
      background: "#121212",
      color: "#FFFFFF",
      width: "280px",
      padding: "0.8rem",
      customClass: {
        popup: "border border-[#4e4d4d] rounded-[15px] shadow-2xl",
        title: "text-sm font-bold pt-2",
        htmlContainer: "text-[10px] text-gray-400 opacity-80",
        actions: "flex justify-center gap-3 mt-4 mb-2",
        confirmButton: isCurrentlyBanned 
          ? "bg-emerald-500 hover:bg-emerald-600 px-5 py-2 rounded-[10px] text-[11px] font-bold text-white transition-all"
          : "bg-rose-500 hover:bg-rose-600 px-5 py-2 rounded-[10px] text-[11px] font-bold text-white transition-all",
        cancelButton: "bg-[#2a2a2a] hover:bg-[#3a3a3a] px-5 py-2 rounded-[10px] text-[11px] font-bold text-white transition-all"
      }
    });

    if (result.isConfirmed) {
      try {
        await updateDoc(doc(db, "users", user.id), { isBanned: !isCurrentlyBanned });
        toast.success(`User ${isCurrentlyBanned ? "unbanned" : "banned"} successfully!`);
      } catch (error) {
        console.error(`Error ${action.toLowerCase()}ing user:`, error);
        toast.error(`Error ${action.toLowerCase()}ing user: ` + error.message);
      }
    }
  };
  
  const handleUnban = async (userId) => {
    // Show compact confirmation popup
    const result = await Swal.fire({
      title: 'Unban User?',
      text: "This user will be unbanned and regain access.",
      icon: undefined,
      showCancelButton: true,
      confirmButtonText: "Yes, Unban",
      cancelButtonText: "Cancel",
      buttonsStyling: false,
      background: "#121212",
      color: "#FFFFFF",
      width: "280px",
      padding: "0.8rem",
      customClass: {
        popup: "border border-[#4e4d4d] rounded-[15px] shadow-2xl",
        title: "text-sm font-bold pt-2",
        htmlContainer: "text-[10px] text-gray-400 opacity-80",
        actions: "flex justify-center gap-3 mt-4 mb-2",
        confirmButton: "bg-emerald-500 hover:bg-emerald-600 px-5 py-2 rounded-[10px] text-[11px] font-bold text-white transition-all",
        cancelButton: "bg-[#2a2a2a] hover:bg-[#3a3a3a] px-5 py-2 rounded-[10px] text-[11px] font-bold text-white transition-all"
      }
    });

    if (result.isConfirmed) {
      try {
        await updateDoc(doc(db, "users", userId), { isBanned: false });
        toast.success("User unbanned successfully!");
      } catch (error) {
        console.error("Error unbanning user:", error);
        toast.error("Error unbanning user: " + error.message);
      }
    }
  };
  
  // Handle edit button click
  const handleEditClick = (material) => {
    setEditingMaterial(material);
    setEditForm({
      title: material.title,
      subjectId: material.subjectId,
      type: material.type,
      link: material.link
    });
  };
  
  // Handle edit form submission
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      await updateDoc(doc(db, "materials", editingMaterial.id), {
        title: editForm.title,
        subjectId: editForm.subjectId,
        type: editForm.type,
        link: editForm.link
      });
      
      toast.success("Material updated successfully!");
      setEditingMaterial(null);
      setEditForm({ title: "", subjectId: "", type: "Notes", link: "" });
    } catch (error) {
      console.error("Error updating material:", error);
      toast.error("Error updating material: " + error.message);
    }
  };
  
  // Handle subject edit button click
  const handleEditSubjectClick = (subject) => {
    setEditingSubject(subject);
    setEditSubjectName(subject.name);
    setEditSubjectIcon(subject.icon);
  };
  
  // Handle subject update submission
  const handleUpdateSubject = async (e) => {
    e.preventDefault();
    
    try {
      await updateDoc(doc(db, "subjects", editingSubject.id), {
        name: editSubjectName,
        icon: editSubjectIcon
      });
      
      toast.success("Subject Updated!");
      setEditingSubject(null);
      setEditSubjectName("");
      setEditSubjectIcon("");
    } catch (error) {
      console.error("Error updating subject:", error);
      toast.error("Error updating subject: " + error.message);
    }
  };

  // Execute the actual reset logic
  const executeReset = async () => {
    try {
      // Close the modal first
      setShowResetModal(false);
      
      // Show loading state
      const loadingToast = toast.loading("Resetting all analytics...");
      
      // Fetch all documents from materials collection
      const materialsSnapshot = await getDocs(collection(db, "materials"));
      
      // Create batch
      const batch = writeBatch(db);
      
      // Queue updates for all documents
      materialsSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { 
          views: 0, 
          downloads: 0, 
          downloadedBy: [] 
        });
      });
      
      // Commit the batch
      await batch.commit();
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success("All analytics have been reset.");
      
      // Note: The UI will automatically update due to the real-time listener
      // in AppContext that fetches materials
      
    } catch (error) {
      console.error("Error resetting analytics:", error);
      toast.error("Error resetting analytics: " + error.message);
    }
  };

  // Handle reset analytics - opens the confirmation modal
  const handleResetAnalytics = () => {
    setShowResetModal(true);
  };

  return (
    <>
      <div className="p-5 pt-8 max-w-4xl mx-auto bg-[#0a0a0a]/50 backdrop-blur-sm rounded-xl">
        {/* Header */}
        <div className="mb-6 md:mb-8 text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-white/55 text-xs md:text-sm mt-1 md:mt-2">
            Manage all aspects of FYCS Study Hub
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="glass-card p-2 mb-6 md:mb-8 overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 md:gap-2 min-w-max">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-2 md:gap-2 px-4 py-3 md:px-5 md:py-3 rounded-full text-sm md:text-sm font-bold transition-all whitespace-nowrap min-w-[60px] md:min-w-0 ${
                    isActive
                      ? "bg-[#FFD700] text-black shadow-lg"
                      : "bg-white/0 text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {tab.icon}
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="glass-card p-4 md:p-5">
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <div className="text-white/50 text-[10px] md:text-xs uppercase tracking-wider font-bold">Total Materials</div>
                    <FileText size={16} className="text-white/70 md:w-5 md:h-5" />
                  </div>
                  <div className="text-xl md:text-2xl font-extrabold">{safeStats.totalMaterials}</div>
                </div>
                
                <div className="glass-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-white/50 text-xs uppercase tracking-wider font-bold">Total Views</div>
                    <Eye size={20} className="text-white/70" />
                  </div>
                  <div className="text-2xl font-extrabold">{formatNumber(safeStats.totalViews)}</div>
                </div>
                
                <div className="glass-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-white/50 text-xs uppercase tracking-wider font-bold">Total Downloads</div>
                    <Download size={20} className="text-white/70" />
                  </div>
                  <div className="text-2xl font-extrabold">{formatNumber(safeStats.totalDownloads)}</div>
                </div>
                
                <div className="glass-card p-5 border border-amber-500/30 bg-amber-500/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-amber-400 text-xs uppercase tracking-wider font-bold">Pending Requests</div>
                    <Clock size={20} className="text-amber-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-amber-300">{safeStats.pendingRequests}</div>
                </div>
              </div>
              
              <div className="glass-card p-4 md:p-6">
                <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4 text-white/90">Platform Overview</h3>
                <div className="grid grid-cols-3 gap-3 md:gap-4 text-xs md:text-sm">
                  <div>
                    <div className="text-white/50 mb-1">Semesters</div>
                    <div className="font-bold">{safeStats.totalSemesters}</div>
                  </div>
                  <div>
                    <div className="text-white/50 mb-1">Subjects</div>
                    <div className="font-bold">{safeStats.totalSubjects}</div>
                  </div>
                  <div>
                    <div className="text-white/50 mb-1">Registered Users</div>
                    <div className="font-bold">{(users || []).length}</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Materials Tab */}
          {activeTab === "materials" && (
            <>
              <div className="glass-card p-4 mb-6 overflow-visible">
                <div className="flex flex-wrap gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setMaterialFilter("Pending")}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                      materialFilter === "Pending"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    Pending ({getPendingMaterials().length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaterialFilter("Approved")}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                      materialFilter === "Approved"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    Approved ({getApprovedMaterials().length})
                  </button>
                </div>
                
                {/* Search, Filter, Sort Control Bar - Only show for Approved materials */}
                {materialFilter === "Approved" && (
                  <div className="relative grid grid-cols-2 md:grid-cols-4 gap-3 mb-4" style={{ position: 'relative', zIndex: 9999 }}>
                    {/* Search - full width on first row */}
                    <div className="relative col-span-2 md:col-span-4">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={16} className="text-white/50" />
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by title..."
                        className="w-full glass-card pl-10 pr-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none text-sm"
                      />
                    </div>
                    {/* Semester */}
                    <select
                      value={filterSem}
                      onChange={(e) => setFilterSem(e.target.value)}
                      className="glass-card px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white focus:border-blue-500 focus:outline-none text-sm"
                    >
                      <option value="All" className="bg-[#0a0a0a]">All Sem</option>
                      {(semesters || []).map(sem => (
                        <option key={sem.id} value={sem.id} className="bg-[#0a0a0a]">{sem.name}</option>
                      ))}
                    </select>
                    {/* Category */}
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="glass-card px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white focus:border-blue-500 focus:outline-none text-sm"
                    >
                      <option value="All" className="bg-[#0a0a0a]">All Types</option>
                      <option value="Notes" className="bg-[#0a0a0a]">Notes</option>
                      <option value="Practicals" className="bg-[#0a0a0a]">Practicals</option>
                      <option value="IMP" className="bg-[#0a0a0a]">IMP</option>
                      <option value="Assignment" className="bg-[#0a0a0a]">Assignment</option>
                    </select>
                    {/* Subject */}
                    <select
                      value={filterSubject}
                      onChange={(e) => setFilterSubject(e.target.value)}
                      className="glass-card px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white focus:border-blue-500 focus:outline-none text-sm"
                    >
                      <option value="All" className="bg-[#0a0a0a]">All Subjects</option>
                      {uniqueSubjects.map(subjectId => {
                        const subject = getSubjectById(subjectId);
                        return (
                          <option key={subjectId} value={subjectId} className="bg-[#0a0a0a]">
                            {subject?.name || subjectId}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>
              
              <div className="relative space-y-4" style={{ position: 'relative', zIndex: 1 }}>
                {materialFilter === "Pending" 
                  ? getPendingMaterials().map((material) => {
                      const semester = getSemesterById(material.semId);
                      const subject = getSubjectById(material.subjectId);
                      
                      return (
                        <div key={material.id} className="glass-card p-5">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start gap-3">
                                <div className="mt-1">
                                  {material.type === 'Notes' ? <FileText className="text-blue-400" size={18} /> :
                                   material.type === 'Practicals' ? <Code className="text-green-400" size={18} /> :
                                   material.type === 'IMP' ? <Star className="text-yellow-400" size={18} /> :
                                   material.type === 'Assignment' ? <Edit3 className="text-purple-400" size={18} /> :
                                   <FileText className="text-amber-400" size={18} />}
                                </div>
                                <div>
                                  <h3 className="font-bold text-white/90">{material.title}</h3>
                                  <div className="text-sm text-white/50 mt-1">
                                    {semester?.name} • {subject?.name} • {material.type}
                                  </div>
                                  <div className="text-xs text-white/40 mt-2">
                                    Uploaded by {material.uploadedBy?.split(' ')[0] || 'Admin'} • {material.date ? new Date(typeof material.date === 'object' && material.date.toDate ? material.date.toDate() : material.date).toLocaleDateString() : 'Just now'}
                                  </div>
                                  <div className="flex gap-4 mt-2 text-xs text-white/50">
                                    <span>👁 {material.views} views</span>
                                    <span>⬇ {material.downloads} downloads</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const result = approveMaterial(material.id);
                                  if (result.success) {
                                    toast.success("Material approved successfully!");
                                  }
                                }}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-200 font-bold hover:bg-emerald-500/20 transition-colors"
                              >
                                <CheckCircle size={16} />
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => setItemToReject(material.id)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 font-bold hover:bg-rose-500/15 transition-colors"
                              >
                                <XCircle size={16} />
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  : filteredMaterials.map((material) => {
                      const semester = getSemesterById(material.semId);
                      const subject = getSubjectById(material.subjectId);
                      
                      return (
                        <div key={material.id} className="glass-card p-5">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start gap-3">
                                <div className="mt-1">
                                  {material.type === 'Notes' ? <FileText className="text-blue-400" size={18} /> :
                                   material.type === 'Practicals' ? <Code className="text-green-400" size={18} /> :
                                   material.type === 'IMP' ? <Star className="text-yellow-400" size={18} /> :
                                   material.type === 'Assignment' ? <Edit3 className="text-purple-400" size={18} /> :
                                   <FileText className="text-emerald-400" size={18} />}
                                </div>
                                <div>
                                  <h3 className="font-bold text-white/90">{material.title}</h3>
                                  <div className="text-sm text-white/50 mt-1">
                                    {semester?.name} • {subject?.name} • {material.type}
                                  </div>
                                  <div className="text-xs text-white/40 mt-2">
                                    Uploaded by {material.uploadedBy?.split(' ')[0] || 'Admin'} • {material.date ? new Date(typeof material.date === 'object' && material.date.toDate ? material.date.toDate() : material.date).toLocaleDateString() : 'Just now'}
                                  </div>
                                  <div className="flex gap-4 mt-2 text-xs text-white/50">
                                    <span>👁 {material.views} views</span>
                                    <span>⬇ {material.downloads} downloads</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              <a
                                href={material.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-1 sm:gap-2 p-2 sm:px-4 sm:py-2 rounded-xl bg-blue-500/15 border border-blue-500/25 text-blue-200 font-bold hover:bg-blue-500/20 transition-colors min-w-[36px] sm:min-w-[auto]"
                              >
                                <Upload size={16} />
                                <span className="hidden sm:inline">View</span>
                              </a>
                              <button
                                type="button"
                                onClick={() => handleEditClick(material)}
                                className="flex items-center justify-center gap-1 sm:gap-2 p-2 sm:px-4 sm:py-2 rounded-xl bg-blue-600/15 border border-blue-500/25 text-blue-200 font-bold hover:bg-blue-600/20 transition-colors min-w-[36px] sm:min-w-[auto]"
                              >
                                <Pencil size={16} />
                                <span className="hidden sm:inline">Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setItemToDelete(material.id)}
                                className="flex items-center justify-center gap-1 sm:gap-2 p-2 sm:px-4 sm:py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 font-bold hover:bg-rose-500/15 transition-colors min-w-[36px] sm:min-w-[auto]"
                              >
                                <Trash2 size={16} />
                                <span className="hidden sm:inline">Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                
                {materialFilter === "Approved" && filteredMaterials.length === 0 && (
                  <div className="glass-card p-12 text-center">
                    <div className="text-white/50 mb-2">No matching materials found</div>
                    <div className="text-sm text-white/40">
                      Try adjusting your search, filter, or sort options
                    </div>
                  </div>
                )}
                
                {materialFilter === "Pending" && materials.filter(m => m.status === materialFilter).length === 0 && (
                  <div className="glass-card p-12 text-center">
                    <div className="text-white/50 mb-2">No pending materials found</div>
                    <div className="text-sm text-white/40">All materials are approved!</div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Subjects Tab */}
          {activeTab === "subjects" && (
            <>
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectForm(!showAddSubjectForm)}
                  className="w-full glass-card border-2 border-dashed border-white/20 p-8 flex flex-col items-center justify-center gap-3 rounded-2xl hover:bg-white/5 transition-colors"
                >
                  <Plus size={24} className="text-white/50" />
                  <span className="font-bold text-white/70">Add New Subject</span>
                  <span className="text-sm text-white/40 text-center">
                    Click to {showAddSubjectForm ? "cancel" : "open"} the form
                  </span>
                </button>
              </div>
              
              {showAddSubjectForm && (
                <div className="glass-card p-6 mb-6">
                  <h3 className="font-bold text-lg mb-4 text-white/90">Add Subject</h3>
                  <form onSubmit={handleAddSubject} className="space-y-4">
                    <div>
                      <label className="block text-white/50 text-sm mb-2">Subject Name</label>
                      <input
                        type="text"
                        value={newSubject.name}
                        onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full glass-card p-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[#FFD700] focus:outline-none"
                        placeholder="Enter subject name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/50 text-sm mb-2">Semester</label>
                      <select
                        value={newSubject.semesterId}
                        onChange={(e) => setNewSubject(prev => ({ ...prev, semesterId: e.target.value }))}
                        className="w-full glass-card p-3 rounded-xl border border-white/10 bg-white/5 text-white focus:border-[#FFD700] focus:outline-none"
                      >
                        {semesters.map(sem => (
                          <option key={sem.id} value={sem.id} className="bg-[#0a0a0a]">
                            {sem.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-white/50 text-sm mb-2">Icon</label>
                      <select
                        value={newSubject.icon}
                        onChange={(e) => setNewSubject(prev => ({ ...prev, icon: e.target.value }))}
                        className="w-full glass-card p-3 rounded-xl border border-white/10 bg-white/5 text-white focus:border-[#FFD700] focus:outline-none"
                      >
                        <option value="Book" className="bg-[#0a0a0a]">📚 Book</option>
                        <option value="Code" className="bg-[#0a0a0a]">💻 Code</option>
                        <option value="Sigma" className="bg-[#0a0a0a]">∑ Sigma</option>
                        <option value="Cpu" className="bg-[#0a0a0a]">🖥️ CPU</option>
                        <option value="Wrench" className="bg-[#0a0a0a]">🔧 Wrench</option>
                        <option value="Brackets" className="bg-[#0a0a0a]">[ ] Brackets</option>
                        <option value="Database" className="bg-[#0a0a0a]">🗄️ Database</option>
                        <option value="Boxes" className="bg-[#0a0a0a]">📦 Boxes</option>
                        <option value="Monitor" className="bg-[#0a0a0a]">🖥️ Monitor</option>
                        <option value="Network" className="bg-[#0a0a0a]">🌐 Network</option>
                        <option value="Coffee" className="bg-[#0a0a0a]">☕ Coffee</option>
                        <option value="Globe" className="bg-[#0a0a0a]">🌍 Globe</option>
                        <option value="Bot" className="bg-[#0a0a0a]">🤖 Bot</option>
                        <option value="Image" className="bg-[#0a0a0a]">🖼️ Image</option>
                      </select>
                    </div>
                    
                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        className="flex-1 btn-primary py-3"
                      >
                        Add Subject
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddSubjectForm(false)}
                        className="flex-1 glass-card py-3 text-center font-bold rounded-xl border border-white/10 text-white/70 hover:bg-white/5 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              <div className="space-y-6">
                {(semesters || []).map(semester => {
                  const semSubjects = getSubjectsBySemester?.(semester.id) || [];
                  if (semSubjects.length === 0) return null;
                  
                  return (
                    <div key={semester.id} className="glass-card p-4 md:p-5">
                      <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4 text-white/90 border-b border-white/10 pb-2">
                        {semester.name}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                        {(semSubjects || []).map(subject => (
                          <div key={subject.id} className="glass-card p-3 md:p-4 flex items-center justify-between">
                            <div>
                              <div className="font-semibold">{subject.name}</div>
                              <div className="text-xs text-white/50 mt-1">Icon: {subject.icon}</div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditSubjectClick(subject)}
                                className="p-1.5 md:p-2 rounded-lg bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 transition-colors"
                                title="Edit subject"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteSubject(subject.id)}
                                className="p-1.5 md:p-2 rounded-lg bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition-colors"
                                title="Delete subject"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                
                {/* Empty state if no semesters or subjects */}
                {(!semesters || semesters.length === 0) && (
                  <div className="glass-card p-8 text-center">
                    <Book size={32} className="mx-auto mb-3 text-white/30" />
                    <div className="font-semibold text-white mb-1">No semesters found</div>
                    <div className="text-sm text-white/40">Add semesters to manage subjects</div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="glass-card overflow-hidden">
              <div className="p-5 border-b border-white/10">
                <h3 className="font-bold text-lg text-white/90">User Management</h3>
                <p className="text-sm text-white/50 mt-1">Manage registered users and their roles</p>
                
                {/* Search Bar */}
                <div className="mt-4 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-white/50" />
                  </div>
                  <input
                    type="text"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full glass-card pl-10 pr-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[#FFD700] focus:outline-none"
                  />
                </div>
              </div>
              
              {/* Desktop Table View - Hidden on mobile */}
              <div className="hidden md:block overflow-x-auto max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-hide">
                <table className="w-full">
                  <thead className="sticky top-0 bg-[#0a0a0a]">
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-white/50 text-sm font-bold uppercase tracking-wider">Name</th>
                      <th className="text-left p-4 text-white/50 text-sm font-bold uppercase tracking-wider">Email</th>
                      <th className="text-left p-4 text-white/50 text-sm font-bold uppercase tracking-wider">Role</th>
                      <th className="text-left p-4 text-white/50 text-sm font-bold uppercase tracking-wider">Status</th>
                      <th className="text-left p-4 text-white/50 text-sm font-bold uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map(user => (
                        <tr key={`user-${user.id}`} className="border-b border-white/5 hover:bg-white/2">
                          <td className="p-4 font-medium">{user.displayName || user.name}</td>
                          <td className="p-4 text-white/70">{user.email}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                              user.role === "admin" 
                                ? "bg-purple-500/20 text-purple-300" 
                                : "bg-blue-500/20 text-blue-300"
                            }`}>
                              {user.role === "admin" ? (
                                <><Shield size={12} className="mr-1" /> Admin</>
                              ) : (
                                <><User size={12} className="mr-1" /> Student</>
                              )}
                            </span>
                          </td>
                          <td className="p-4">
                            {user.isBanned ? (
                              <span className="inline-flex items-center px-2 py-1 bg-rose-500/20 text-rose-300 text-xs font-bold rounded-full">
                                <XCircle size={12} className="mr-1" /> Banned
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full">
                                <CheckCircle size={12} className="mr-1" /> Active
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              {user.role === "student" ? (
                                <button
                                  type="button"
                                  onClick={() => promoteUser(user.id)}
                                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-500/15 text-purple-300 text-sm font-bold hover:bg-purple-500/25 transition-colors"
                                >
                                  <Shield size={14} />
                                  Promote
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => demoteUser(user.id)}
                                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500/15 text-amber-300 text-sm font-bold hover:bg-amber-500/25 transition-colors"
                                >
                                  <User size={14} />
                                  Demote
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleToggleBan(user)}
                                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-bold transition-colors ${
                                  user.isBanned 
                                    ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                                    : "bg-rose-500/15 text-rose-300 hover:bg-rose-500/25"
                                }`}
                              >
                                {user.isBanned ? (
                                  <>
                                    <CheckCircle size={14} />
                                    Unban
                                  </>
                                ) : (
                                  <>
                                    <XCircle size={14} />
                                    Ban
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="p-8 text-center">
                          <User size={32} className="mx-auto mb-3 text-white/30" />
                          <p className="text-white/50 text-sm">No users found</p>
                          {userSearchTerm && (
                            <p className="text-white/40 text-xs mt-1">Try a different search term</p>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Mobile Card View - Hidden on desktop */}
              <div className="md:hidden space-y-3 p-4 max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-hide">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <div key={`user-${user.id}`} className="glass-card p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-white text-sm">{user.displayName || user.name}</h3>
                          <p className="text-white/70 text-xs mt-1 truncate max-w-[200px]">{user.email}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold ${
                              user.role === "admin" 
                                ? "bg-purple-500/20 text-purple-300" 
                                : "bg-blue-500/20 text-blue-300"
                            }`}>
                              {user.role === "admin" ? (
                                <><Shield size={10} className="inline mr-1" /> Admin</>
                              ) : (
                                <><User size={10} className="inline mr-1" /> Student</>
                              )}
                            </span>
                            {user.isBanned && (
                              <span className="px-2 py-1 bg-rose-500/20 text-rose-300 text-[10px] font-bold rounded-full flex items-center">
                                <XCircle size={10} className="inline mr-1" /> Banned
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {user.role === "student" ? (
                          <button
                            type="button"
                            onClick={() => promoteUser(user.id)}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-purple-500/15 text-purple-300 text-xs font-bold hover:bg-purple-500/25 transition-colors"
                          >
                            <Shield size={12} />
                            Promote
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => demoteUser(user.id)}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-amber-500/15 text-amber-300 text-xs font-bold hover:bg-amber-500/25 transition-colors"
                          >
                            <User size={12} />
                            Demote
                          </button>
                        )}
                        
                        {user.isBanned ? (
                          <button
                            type="button"
                            onClick={() => handleUnban(user.id)}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 text-xs font-bold hover:bg-emerald-500/25 transition-colors"
                          >
                            <CheckCircle size={12} />
                            Unban
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleBan(user)}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-rose-500/15 text-rose-300 text-xs font-bold hover:bg-rose-500/25 transition-colors"
                          >
                            <XCircle size={12} />
                            Ban
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="glass-card p-8 text-center">
                    <User size={32} className="mx-auto mb-3 text-white/30" />
                    <p className="text-white/50 text-sm">No users found</p>
                    {userSearchTerm && (
                      <p className="text-white/40 text-xs mt-1">Try a different search term</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="glass-card p-4 md:p-6">
                <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4 text-white/90">System Information</h3>
                <div className="space-y-2 md:space-y-3">
                  <div className="flex justify-between items-center py-1.5 md:py-2 border-b border-white/10">
                    <span className="text-white/50 text-sm md:text-base">Platform Version</span>
                    <span className="font-mono font-bold text-sm md:text-base">1.0.0</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-white/50">Total Materials</span>
                    <span className="font-bold">{(materials || []).length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-white/50">Registered Users</span>
                    <span className="font-bold">{(users || []).length}</span>
                  </div>
                </div>
              </div>
              
              <div className="glass-card p-4 md:p-6 border border-rose-500/20 bg-rose-500/5">
                <h3 className="font-bold text-base md:text-lg mb-2 text-rose-300">Danger Zone</h3>
                <p className="text-white/50 text-xs md:text-sm mb-3 md:mb-4">
                  These actions cannot be undone. Proceed with caution.
                </p>
                <button
                  type="button"
                  onClick={handleResetAnalytics}
                  className="btn-danger px-4 py-2 md:px-6 md:py-3 font-bold flex items-center gap-2 mb-3 md:mb-4"
                >
                  <Trash2 size={18} />
                  Reset All Analytics
                </button>
                <p className="text-xs text-white/40 mt-2 mb-4">
                  This will reset all views and downloads to zero
                </p>
                
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Edit Material Modal */}
      {editingMaterial && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card p-6 w-full max-w-md rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Edit Material</h3>
              <button
                type="button"
                onClick={() => setEditingMaterial(null)}
                className="text-white/50 hover:text-white transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full glass-card px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter material title"
                  required
                />
              </div>
              
              {/* Subject */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Subject</label>
                <select
                  value={editForm.subjectId}
                  onChange={(e) => setEditForm(prev => ({ ...prev, subjectId: e.target.value }))}
                  className="w-full glass-card px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="" className="bg-[#0a0a0a]">Select subject</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id} className="bg-[#0a0a0a]">
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Type */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Type</label>
                <select
                  value={editForm.type}
                  onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full glass-card px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="Notes" className="bg-[#0a0a0a]">Notes</option>
                  <option value="Practicals" className="bg-[#0a0a0a]">Practicals</option>
                  <option value="IMP" className="bg-[#0a0a0a]">IMP</option>
                  <option value="Assignment" className="bg-[#0a0a0a]">Assignment</option>
                </select>
              </div>
              
              {/* Link */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Google Drive Link</label>
                <input
                  type="url"
                  value={editForm.link}
                  onChange={(e) => setEditForm(prev => ({ ...prev, link: e.target.value }))}
                  className="w-full glass-card px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none"
                  placeholder="https://drive.google.com/..."
                  required
                />
              </div>
              
              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  Update Material
                </button>
                <button
                  type="button"
                  onClick={() => setEditingMaterial(null)}
                  className="flex-1 glass-card py-3 text-center font-bold rounded-xl border border-white/10 text-white/70 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Subject Modal */}
      {editingSubject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card p-6 w-full max-w-md rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Edit Subject</h3>
              <button
                type="button"
                onClick={() => setEditingSubject(null)}
                className="text-white/50 hover:text-white transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateSubject} className="space-y-4">
              {/* Subject Name */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Subject Name</label>
                <input
                  type="text"
                  value={editSubjectName}
                  onChange={(e) => setEditSubjectName(e.target.value)}
                  className="w-full glass-card px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter subject name"
                  required
                />
              </div>
              
              {/* Icon Name */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Icon Name</label>
                <select
                  value={editSubjectIcon}
                  onChange={(e) => setEditSubjectIcon(e.target.value)}
                  className="w-full glass-card px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="Book" className="bg-[#0a0a0a]">📚 Book</option>
                  <option value="Code" className="bg-[#0a0a0a]">💻 Code</option>
                  <option value="Sigma" className="bg-[#0a0a0a]">∑ Sigma</option>
                  <option value="Cpu" className="bg-[#0a0a0a]">🖥️ CPU</option>
                  <option value="Wrench" className="bg-[#0a0a0a]">🔧 Wrench</option>
                  <option value="Brackets" className="bg-[#0a0a0a]">[ ] Brackets</option>
                  <option value="Database" className="bg-[#0a0a0a]">🗄️ Database</option>
                  <option value="Boxes" className="bg-[#0a0a0a]">📦 Boxes</option>
                  <option value="Monitor" className="bg-[#0a0a0a]">🖥️ Monitor</option>
                  <option value="Network" className="bg-[#0a0a0a]">🌐 Network</option>
                  <option value="Coffee" className="bg-[#0a0a0a]">☕ Coffee</option>
                  <option value="Globe" className="bg-[#0a0a0a]">🌍 Globe</option>
                  <option value="Bot" className="bg-[#0a0a0a]">🤖 Bot</option>
                  <option value="Image" className="bg-[#0a0a0a]">🖼️ Image</option>
                </select>
              </div>
              
              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
                  className="flex-1 glass-card py-3 text-center font-bold rounded-xl border border-white/10 text-white/70 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Danger Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-red-500/20 w-full max-w-md p-6 rounded-xl shadow-2xl">
            <div className="text-center">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                  <AlertTriangle size={32} className="text-red-400" />
                </div>
              </div>
              
              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-2">
                Reset All Analytics?
              </h3>
              
              {/* Description */}
              <p className="text-zinc-400 text-sm mb-6">
                This will permanently reset views and downloads to zero. This action cannot be undone.
              </p>
              
              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeReset}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Yes, Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {itemToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-red-500/30 w-full max-w-sm p-6 rounded-xl shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-full text-red-500">
                <Trash2 size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Delete Material?</h3>
                <p className="text-zinc-400 text-sm">
                  Are you sure you want to delete this? This action cannot be undone and the link will break.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button
                  type="button"
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const result = await deleteMaterial(itemToDelete);
                    if (result?.success) toast.success("Material deleted successfully!");
                    else if (result?.error) toast.error(result.error);
                    setItemToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-bold"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {itemToReject && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-red-500/30 w-full max-w-sm p-6 rounded-xl shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-full text-red-500">
                <XCircle size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Reject Material?</h3>
                <p className="text-zinc-400 text-sm">
                  Are you sure you want to reject this upload? This cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button
                  type="button"
                  onClick={() => setItemToReject(null)}
                  className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const result = await rejectMaterial(itemToReject);
                    if (result?.success) toast.success("Material rejected successfully!");
                    else if (result?.error) toast.error(result.error);
                    setItemToReject(null);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-bold"
                >
                  Yes, Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}




