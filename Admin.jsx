import { BarChart2, Book, CheckCircle, Clock, Download, Eye, FileText, Plus, Settings, Shield, Trash2, Upload, User, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { useApp } from "../context/AppContext";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
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
  
  const [newSubject, setNewSubject] = useState({
    name: "",
    semesterId: "1",
    icon: "Book"
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
  
  const ADMIN_EMAIL = "rishiuttamsahu@gmail.com";
  
  useEffect(() => {
    // If loaded and user is NOT the admin, kick them out
    if (!loading && user?.email !== ADMIN_EMAIL) {
      navigate("/");
    }
  }, [user, loading, navigate]);
  
  // Prevent render if user is not admin
  if (!loading && user?.email !== ADMIN_EMAIL) {
    return null;
  }
  
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
    try {
      await updateDoc(doc(db, "users", userId), { role: "admin" });
      toast.success("User promoted to admin successfully!");
    } catch (error) {
      console.error("Error promoting user:", error);
      toast.error("Error promoting user: " + error.message);
    }
  };
  
  const demoteUser = async (userId) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: "student" });
      toast.success("User demoted to student successfully!");
    } catch (error) {
      console.error("Error demoting user:", error);
      toast.error("Error demoting user: " + error.message);
    }
  };

  return (
    <div className="p-5 pt-8 max-w-4xl mx-auto bg-[#0a0a0a]/50 backdrop-blur-sm rounded-xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-white/55 text-sm mt-2">
          Manage all aspects of FYCS Study Hub
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="glass-card p-2 mb-8 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[#FFD700] text-black shadow-lg"
                    : "bg-white/0 text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-white/50 text-xs uppercase tracking-wider font-bold">Total Materials</div>
                  <FileText size={20} className="text-white/70" />
                </div>
                <div className="text-2xl font-extrabold">{safeStats.totalMaterials}</div>
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
            
            <div className="glass-card p-6">
              <h3 className="font-bold text-lg mb-4 text-white/90">Platform Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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
            <div className="glass-card p-4 mb-6">
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
            </div>
            
            <div className="space-y-4">
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
                                <Clock className="text-amber-400" size={18} />
                              </div>
                              <div>
                                <h3 className="font-bold text-white/90">{material.title}</h3>
                                <div className="text-sm text-white/50 mt-1">
                                  {semester?.name} • {subject?.name} • {material.type}
                                </div>
                                <div className="text-xs text-white/40 mt-2">
                                  Uploaded by {material.uploadedBy} • {new Date(material.date).toLocaleDateString()}
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
                              onClick={() => {
                                const result = rejectMaterial(material.id);
                                if (result.success) {
                                  toast.success("Material rejected successfully!");
                                }
                              }}
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
                : getApprovedMaterials().map((material) => {
                    const semester = getSemesterById(material.semId);
                    const subject = getSubjectById(material.subjectId);
                    
                    return (
                      <div key={material.id} className="glass-card p-5">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              <div className="mt-1">
                                <CheckCircle className="text-emerald-400" size={18} />
                              </div>
                              <div>
                                <h3 className="font-bold text-white/90">{material.title}</h3>
                                <div className="text-sm text-white/50 mt-1">
                                  {semester?.name} • {subject?.name} • {material.type}
                                </div>
                                <div className="text-xs text-white/40 mt-2">
                                  Uploaded by {material.uploadedBy} • {new Date(material.date).toLocaleDateString()}
                                </div>
                                <div className="flex gap-4 mt-2 text-xs text-white/50">
                                  <span>👁 {material.views} views</span>
                                  <span>⬇ {material.downloads} downloads</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <a
                              href={material.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/15 border border-blue-500/25 text-blue-200 font-bold hover:bg-blue-500/20 transition-colors"
                            >
                              <Upload size={16} />
                              View
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                const result = deleteMaterial(material.id);
                                if (result.success) {
                                  toast.success("Material deleted successfully!");
                                }
                              }}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 font-bold hover:bg-rose-500/15 transition-colors"
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              
              {materials.filter(m => m.status === materialFilter).length === 0 && (
                <div className="glass-card p-12 text-center">
                  <div className="text-white/50 mb-2">No {materialFilter.toLowerCase()} materials found</div>
                  <div className="text-sm text-white/40">
                    {materialFilter === "Pending" 
                      ? "All materials are approved!" 
                      : "No approved materials yet."}
                  </div>
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
                  <div key={semester.id} className="glass-card p-5">
                    <h3 className="font-bold text-lg mb-4 text-white/90 border-b border-white/10 pb-2">
                      {semester.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(semSubjects || []).map(subject => (
                        <div key={subject.id} className="glass-card p-4 flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{subject.name}</div>
                            <div className="text-xs text-white/50 mt-1">Icon: {subject.icon}</div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="p-2 rounded-lg bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 transition-colors"
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
                              className="p-2 rounded-lg bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition-colors"
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
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-white/50 text-sm font-bold uppercase tracking-wider">Name</th>
                    <th className="text-left p-4 text-white/50 text-sm font-bold uppercase tracking-wider">Email</th>
                    <th className="text-left p-4 text-white/50 text-sm font-bold uppercase tracking-wider">Role</th>
                    <th className="text-left p-4 text-white/50 text-sm font-bold uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(users || []).map(user => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/2">
                      <td className="p-4 font-medium">{user.displayName || user.name}</td>
                      <td className="p-4 text-white/70">{user.email}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          user.role === "admin" 
                            ? "bg-purple-500/20 text-purple-300" 
                            : "bg-blue-500/20 text-blue-300"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {user.role === "student" ? (
                            <button
                              type="button"
                              onClick={() => promoteUser(user.id)}
                              className="px-3 py-1 rounded-lg bg-purple-500/15 text-purple-300 text-sm font-bold hover:bg-purple-500/25 transition-colors"
                            >
                              Promote to Admin
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => demoteUser(user.id)}
                              className="px-3 py-1 rounded-lg bg-amber-500/15 text-amber-300 text-sm font-bold hover:bg-amber-500/25 transition-colors"
                            >
                              Demote to Student
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => toast.error("Ban user functionality would be implemented here")}
                            className="px-3 py-1 rounded-lg bg-rose-500/15 text-rose-300 text-sm font-bold hover:bg-rose-500/25 transition-colors"
                          >
                            Ban User
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Empty state */}
                  {(!users || users.length === 0) && (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-white/50">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-bold text-lg mb-4 text-white/90">System Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/50">Platform Version</span>
                  <span className="font-mono font-bold">1.0.0</span>
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
            
            <div className="glass-card p-6 border border-rose-500/20 bg-rose-500/5">
              <h3 className="font-bold text-lg mb-2 text-rose-300">Danger Zone</h3>
              <p className="text-white/50 text-sm mb-4">
                These actions cannot be undone. Proceed with caution.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Are you sure you want to reset all analytics? This cannot be undone.")) {
                    toast.error("Reset analytics functionality would be implemented here");
                  }
                }}
                className="btn-danger px-6 py-3 font-bold flex items-center gap-2"
              >
                <Trash2 size={18} />
                Reset All Analytics
              </button>
              <p className="text-xs text-white/40 mt-2">
                This will reset all views and downloads to zero
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

