import { FileText, Search, BookOpen, GraduationCap, Download } from "lucide-react";
import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import MaterialCard from "../components/MaterialCard";

export default function Library() {
  const { materials, subjects, semesters, getSubjectById, getSemesterById } = useApp();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedType, setSelectedType] = useState("");
  
  // Helper function to convert Google Drive view links to direct download links
  const convertToDownloadLink = (viewLink) => {
    if (!viewLink) return viewLink;
    
    // Handle different Google Drive URL formats
    if (viewLink.includes("drive.google.com/file/d/")) {
      // Extract file ID from the URL
      const fileIdMatch = viewLink.match(/\/file\/d\/([^\/]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        return `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`;
      }
    } else if (viewLink.includes("drive.google.com/open?id=")) {
      // Extract file ID from the legacy URL format
      const urlObj = new URL(viewLink);
      const fileId = urlObj.searchParams.get("id");
      if (fileId) {
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
      }
    }
    
    // If it's not a Google Drive link, return the original link
    return viewLink;
  };

  // Get unique types from materials
  const allTypes = useMemo(() => {
    const types = new Set();
    materials.forEach(material => {
      if (material.type) {
        types.add(material.type);
      }
    });
    return Array.from(types).sort();
  }, [materials]);

  // Filter materials based on search term and filters
  const filteredMaterials = useMemo(() => {
    return materials.filter(material => {
      // Filter by search term (title or subject name)
      const matchesSearch = !searchTerm || 
        material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getSubjectById(material.subjectId)?.name.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by semester
      const matchesSemester = !selectedSemester || 
        material.semId === selectedSemester || 
        selectedSemester === "all";

      // Filter by type
      const matchesType = !selectedType || 
        material.type.toLowerCase() === selectedType.toLowerCase() || 
        selectedType === "all";

      // Only show approved materials
      const isApproved = material.status === "Approved";

      return matchesSearch && matchesSemester && matchesType && isApproved;
    });
  }, [materials, searchTerm, selectedSemester, selectedType, getSubjectById]);

  return (
    <div className="p-5 pt-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-4 text-center">
        <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
          Study Library
        </h1>
        <p className="text-white/55 text-xs mt-1">
          Browse all notes, practicals, important materials, and assignments
        </p>
      </div>

      {/* Controls Section */}
      <div className="glass-card p-4 mb-4">
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-white/50" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search materials..."
              className="w-full glass-card pl-10 pr-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[#FFD700] focus:outline-none"
            />
          </div>

          {/* Filters - Side by Side */}
          <div className="grid grid-cols-2 gap-2">
            {/* Semester Filter */}
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="glass-card px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white focus:border-[#FFD700] focus:outline-none text-sm"
            >
              <option value="all" className="bg-[#0a0a0a]">All Sem</option>
              {semesters.map(semester => (
                <option key={semester.id} value={semester.id} className="bg-[#0a0a0a]">
                  {semester.name.replace('Semester ', 'Sem ')}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="glass-card px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white focus:border-[#FFD700] focus:outline-none text-sm"
            >
              <option value="all" className="bg-[#0a0a0a]">All Types</option>
              {allTypes.map(type => (
                <option key={type} value={type} className="bg-[#0a0a0a]">
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-2 flex items-center justify-between">
        <p className="text-white/70 text-xs">
          Showing <span className="font-bold text-[#FFD700]">{filteredMaterials.length}</span> of {materials.filter(m => m.status === "Approved").length} approved materials
        </p>
      </div>

      {/* Materials Grid */}
      <div className="space-y-4">
        {filteredMaterials.length > 0 ? (
          filteredMaterials.map((material) => (
            <MaterialCard 
              key={material.id} 
              material={material} 
              convertToDownloadLink={convertToDownloadLink}
              getSubjectById={getSubjectById}
            />
          ))
        ) : (
          <div className="glass-card p-12 text-center">
            <FileText size={32} className="mx-auto mb-4 text-white/30" />
            <div className="font-semibold text-white mb-2">No materials found</div>
            <div className="text-sm text-white/40">
              Try adjusting your search or filter criteria
            </div>
          </div>
        )}
      </div>
    </div>
  );
}