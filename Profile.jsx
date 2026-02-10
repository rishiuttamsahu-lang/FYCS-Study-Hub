import { User, LogOut, ExternalLink, Clock, Trash2, Settings, Download, X, Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useState, useEffect } from "react";
import { updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import { toast } from "react-hot-toast";

export default function Profile() {
  const { user, login, logout } = useApp();
  const [recentHistory, setRecentHistory] = useState([]);
  const [downloadHistory, setDownloadHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("recent"); // "recent" | "downloads" | "settings"
  const [showClearModal, setShowClearModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Edit Profile states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user?.displayName || "");
  const [editPhoto, setEditPhoto] = useState(user?.photoURL || "");
  
  // Load both histories on component mount
  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem('recentHistory') || '[]');
    const downloads = JSON.parse(localStorage.getItem('downloadHistory') || '[]');
    setRecentHistory(recent);
    setDownloadHistory(downloads);
  }, []);
  
  const clearRecentHistory = () => {
    localStorage.removeItem('recentHistory');
    setRecentHistory([]);
  };
  
  const clearDownloadHistory = () => {
    localStorage.removeItem('downloadHistory');
    setDownloadHistory([]);
  };
  
  const clearAllData = () => {
    localStorage.removeItem('recentHistory');
    localStorage.removeItem('downloadHistory');
    setRecentHistory([]);
    setDownloadHistory([]);
  };
  
  // Helper to get initials
  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : "U";
  
  // Handle profile update function
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    try {
      // Update Firebase profile
      await updateProfile(auth.currentUser, {
        displayName: editName,
        photoURL: editPhoto || null
      });
      
      // Close modal
      setIsEditingProfile(false);
      
      // Show success toast
      toast.success("Profile Updated Successfully!");
      
      // Refresh the page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile: " + error.message);
    }
  };
  
  // If user is not logged in
  if (!user) {
    return (
      <div className="p-5 pt-4 max-w-md mx-auto">
        <div className="glass-card p-8 text-center">
          <User size={48} className="mx-auto mb-4 text-white/30" />
          <div className="font-bold text-lg mb-2">Please Login</div>
          <div className="text-white/55 text-sm mb-6">You need to be logged in to view your profile.</div>
          
          <button
            type="button"
            onClick={async () => {
              try {
                await login();
                // Navigation will happen automatically via auth state change
              } catch (error) {
                console.error('Login error:', error);
                toast.error('Login failed. Please try again.');
              }
            }}
            className="w-full py-3 rounded-xl bg-white/10 text-white font-bold flex items-center justify-center gap-2 hover:bg-white/20 border border-white/20 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 1.76-1.77 3.12-3.77 3.12-2.29 0-4.14-1.86-4.14-4.15s1.85-4.15 4.14-4.15c1.11 0 2.08.41 2.81 1.19l2.06-2.06c-1.27-1.19-2.88-1.92-4.87-1.92-4.02 0-7.29 3.27-7.29 7.29s3.27 7.29 7.29 7.29c3.68 0 6.74-2.69 6.74-7.29 0-.58-.1-1.14-.2-1.67z"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }
  
  // User is logged in - show profile
  return (
    <div className="bg-black pt-4">
      {/* HEADER BANNER - Clean solid black */}
      <div className="h-25 bg-black">
        {/* Empty banner space - clean and solid */}
      </div>

      <div className="px-5 pb-8 max-w-md mx-auto">
        {/* OVERLAPPING PROFILE PIC */}
        <div className="-mt-16 mb-6">
          {user.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.displayName} 
              className="w-24 h-24 rounded-full border-[6px] border-zinc-900 object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full border-[6px] border-zinc-900 bg-zinc-800 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {getInitials(user.displayName)}
              </span>
            </div>
          )}
        </div>

        {/* USER INFO & ACTIONS */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">{user.displayName || "User"}</h1>
          <p className="text-white/60 text-sm mb-4">{user.email}</p>
          
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>

        {/* TABBED NAVIGATION - Scrollable */}
        <div className="flex gap-4 mb-4 border-b border-zinc-800 overflow-x-auto whitespace-nowrap no-scrollbar pr-4">
          <button
            type="button"
            onClick={() => setActiveTab("recent")}
            className={`flex-shrink-0 py-2 px-4 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "recent"
                ? "text-white border-b-2 border-yellow-400"
                : "text-white/50 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock size={14} />
              Recent
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab("downloads")}
            className={`flex-shrink-0 py-2 px-4 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "downloads"
                ? "text-white border-b-2 border-yellow-400"
                : "text-white/50 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <Download size={14} />
              Downloads
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`flex-shrink-0 py-2 px-4 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "settings"
                ? "text-white border-b-2 border-yellow-400"
                : "text-white/50 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings size={14} />
              Settings
            </div>
          </button>
        </div>

        {/* CONTENT AREA */}
        {activeTab === "recent" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-white">Recent</h3>
              {recentHistory.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowClearModal(true)}
                  className="text-xs text-white/50 hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  <Trash2 size={14} />
                  Clear History
                </button>
              )}
            </div>
            
            <div className="glass-card">
              {recentHistory.length === 0 ? (
                <div className="text-center py-8 text-white/40">
                  No recent history.
                </div>
              ) : (
                <div className="divide-y divide-zinc-800 max-h-80 overflow-y-auto">
                  {recentHistory.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="p-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-1.5 py-0.5 bg-zinc-800 text-gray-300 text-[10px] rounded whitespace-nowrap">
                            {(item.subject && item.subject.length > 12) ? item.subject.substring(0, 9) + "..." : (item.subject || "N/A")}
                          </span>
                          <span className="text-[10px] text-white/50">{item.type}</span>
                        </div>
                        <h4 className="text-sm text-white/90 truncate">
                          {(item.title && item.title.length > 40) ? item.title.substring(0, 37) + "..." : (item.title || "Untitled")}
                        </h4>
                        <div className="text-[10px] text-white/40 mt-1">
                          Viewed: {new Date(item.viewedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => window.open(item.link, "_blank", "noopener,noreferrer")}
                        className="text-blue-400 hover:text-blue-300 transition-colors flex-shrink-0"
                        title="Open material"
                      >
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "downloads" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-white">Downloads</h3>
              {downloadHistory.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowClearModal(true)}
                  className="text-xs text-white/50 hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  <Trash2 size={14} />
                  Clear History
                </button>
              )}
            </div>
            
            <div className="glass-card">
              {downloadHistory.length === 0 ? (
                <div className="text-center py-8 text-white/40">
                  No download history.
                </div>
              ) : (
                <div className="divide-y divide-zinc-800 max-h-80 overflow-y-auto">
                  {downloadHistory.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="p-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-1.5 py-0.5 bg-zinc-800 text-gray-300 text-[10px] rounded whitespace-nowrap">
                            {(item.subject && item.subject.length > 12) ? item.subject.substring(0, 9) + "..." : (item.subject || "N/A")}
                          </span>
                          <span className="text-[10px] text-white/50">{item.type}</span>
                        </div>
                        <h4 className="text-sm text-white/90 truncate">
                          {(item.title && item.title.length > 40) ? item.title.substring(0, 37) + "..." : (item.title || "Untitled")}
                        </h4>
                        <div className="text-[10px] text-white/40 mt-1">
                          Downloaded: {new Date(item.downloadedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => window.open(item.link, "_blank", "noopener,noreferrer")}
                        className="text-blue-400 hover:text-blue-300 transition-colors flex-shrink-0"
                        title="Open material"
                      >
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="glass-card p-6 max-w-full overflow-x-hidden">
            <h3 className="font-bold text-lg mb-6 text-white">Settings</h3>
            
            <div className="space-y-4">
              <div 
                className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg cursor-pointer hover:bg-zinc-800/50 transition-colors"
                onClick={() => setIsEditingProfile(true)}
              >
                <div>
                  <div className="font-medium text-white">Edit Profile</div>
                  <div className="text-xs text-white/50">Update your profile information</div>
                </div>
                <Settings size={18} className="text-white/50" />
              </div>
              
              <div className="pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={clearAllData}
                  className="w-full py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg font-medium hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Clear All Data
                </button>
                <p className="text-xs text-white/50 mt-2 text-center">
                  This will remove all history and reset your profile
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card p-6 w-full max-w-md rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Edit Profile</h3>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="text-white/50 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {/* Display Name */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Display Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full glass-card px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter your display name"
                  required
                />
              </div>
              
              {/* Profile Picture URL */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Profile Picture URL</label>
                <input
                  type="url"
                  value={editPhoto}
                  onChange={(e) => setEditPhoto(e.target.value)}
                  className="w-full glass-card px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none"
                  placeholder="https://example.com/image.jpg"
                />
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
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 glass-card py-3 text-center font-bold rounded-xl border border-white/10 text-white/70 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showClearModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700/50 w-full max-w-sm p-6 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 relative overflow-hidden">
            {/* Decorative Background Glow */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            <div className="flex flex-col items-center text-center gap-4 mt-2">
              <div className="p-4 bg-zinc-800 rounded-full text-purple-400 mb-1 ring-1 ring-purple-500/30">
                <Sparkles size={32} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Time for a Fresh Start?</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  This will wipe your entire viewing history. <br />
                  It&apos;s like it never happened. ✨
                </p>
              </div>
              <div className="flex gap-3 w-full mt-4">
                <button
                  type="button"
                  onClick={() => setShowClearModal(false)}
                  className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all font-medium border border-zinc-700"
                >
                  Nah, keep it
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearAllData();
                    setShowClearModal(false);
                  }}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl transition-all font-bold shadow-lg shadow-purple-500/20"
                >
                  Yes, Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-red-500/50 w-full max-w-sm p-6 rounded-2xl shadow-2xl">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">Log Out?</h3>
              <p className="text-zinc-400 mb-6">Are you sure you want to log out?</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all font-medium border border-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await logout();
                      setShowLogoutConfirm(false);
                    } catch (error) {
                      console.error('Logout error:', error);
                      setShowLogoutConfirm(false);
                    }
                  }}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-bold"
                >
                  Yes, Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

