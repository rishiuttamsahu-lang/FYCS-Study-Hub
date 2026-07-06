import { Trash2, Loader2, Send, Eye, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { CapacitorUpdater } from "@capgo/capacitor-updater";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export default function AdminSettings({
  notificationEmail, setNotificationEmail,
  notificationTitle, setNotificationTitle,
  notificationMessage, setNotificationMessage,
  handleSendNotification, isSending,
  sentNotifications, handleDeleteGlobal,
  CREATOR_EMAILS, user, handleResetAnalytics
}) {
  const [updateInfo, setUpdateInfo] = useState({ checking: false, version: "v1.0.0", latest: null });

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      CapacitorUpdater.getLatest().then(v => {
        if (v) setUpdateInfo(prev => ({ ...prev, version: v.version || "bundled" }));
      });
    }
  }, []);

  const handleSyncApp = async () => {
    if (!Capacitor.isNativePlatform()) {
      toast.error("OTA Sync is only available on native Android/iOS apps.");
      return;
    }

    setUpdateInfo(prev => ({ ...prev, checking: true }));
    const loadingToast = toast.loading("Checking for updates...");

    try {
      // 1. Fetch latest version info from GitHub Releases / JSON
      // Update this URL to your public version.json
      const VERSION_URL = "https://raw.githubusercontent.com/rishiuttamsahu-lang/cs-study-hub/main/version.json";
      const response = await fetch(VERSION_URL, { cache: 'no-store' });
      const data = await response.json();

      setUpdateInfo(prev => ({ ...prev, latest: data.version }));

      if (data.version === updateInfo.version) {
        toast.dismiss(loadingToast);
        toast.success("App is already up to date!");
      } else {
        toast.dismiss(loadingToast);
        toast.loading(`Downloading v${data.version}...`);

        // 2. Download and Install
        const result = await CapacitorUpdater.download({
          url: data.url,
          version: data.version,
        });

        await CapacitorUpdater.set(result);
        toast.dismiss();
        toast.success("Update installed! Reloading...");

        setTimeout(() => {
          CapacitorUpdater.reload();
        }, 1500);
      }
    } catch (error) {
      console.error("Sync Error:", error);
      toast.dismiss(loadingToast);
      toast.error("Failed to check for updates. Check your internet connection.");
    } finally {
      setUpdateInfo(prev => ({ ...prev, checking: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* 🔄 OTA Sync Section */}
      <div className="glass-card p-4 sm:p-5 border-emerald-500/20 bg-emerald-500/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
            <RefreshCw size={20} className={updateInfo.checking ? "animate-spin" : ""} />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">OTA Sync System</h3>
            <p className="text-[10px] text-emerald-400/70 uppercase tracking-widest font-bold">App Content Updater</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/5">
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-xs text-white/50">Current Local Bundle</p>
            <p className="text-sm font-mono font-bold text-white bg-white/5 px-3 py-1 rounded-lg inline-block">
              {updateInfo.version}
            </p>
          </div>

          <button
            onClick={handleSyncApp}
            disabled={updateInfo.checking}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-700 text-black font-bold rounded-xl transition-all shadow-[0_10px_20px_rgba(16,185,129,0.2)]"
          >
            {updateInfo.checking ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <RefreshCw size={18} />
            )}
            Sync Latest Content
          </button>
        </div>

        <p className="mt-3 text-[10px] text-center sm:text-left text-white/30 leading-relaxed">
          Syncing will pull the latest code from GitHub and install it offline.
          Use this when you update the website but don't want to release a new APK.
        </p>
      </div>

      <div className="glass-card p-3 sm:p-4">
        <h3 className="font-bold text-sm sm:text-base mb-2 sm:mb-3 text-white/90">📢 Send Notification</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-white/70 text-xs sm:text-sm mb-1">Target User Email (leave blank for ALL)</label>
            <input
              type="email"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              className="w-full glass-card px-3 py-2 sm:px-4 sm:py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none text-sm"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-white/70 text-xs sm:text-sm mb-1">Notification Title</label>
            <input
              type="text"
              value={notificationTitle}
              onChange={(e) => setNotificationTitle(e.target.value)}
              className="w-full glass-card px-3 py-2 sm:px-4 sm:py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none text-sm"
              placeholder="Notification title"
              required
            />
          </div>
          <div>
            <label className="block text-white/70 text-xs sm:text-sm mb-1">Message</label>
            <textarea
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              rows="2"
              className="w-full glass-card px-3 py-2 sm:px-4 sm:py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none resize-y text-sm"
              placeholder="Notification message"
              required
            ></textarea>
          </div>
          <button
            type="button"
            onClick={handleSendNotification}
            disabled={isSending}
            className="w-full btn-primary px-3 py-2 sm:px-4 sm:py-3 font-bold flex items-center justify-center gap-2 text-sm"
          >
            {isSending ? (
              <><Loader2 className="animate-spin" size={16} /> Sending...</>
            ) : (
              <><Send size={16} /> Send</>
            )}
          </button>
        </div>
      </div>

      <div className="glass-card p-4 md:p-6">
        <h3 className="font-bold text-base md:text-lg mb-4 text-white/90">📋 Sent Notifications</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sentNotifications.length > 0 ? (
            sentNotifications.map((notif) => (
              <div key={notif.id} className="flex items-center justify-between p-3 bg-zinc-800/40 rounded-xl border border-zinc-700/50">
                <div className="min-w-0 flex-1 pr-4">
                  <h4 className="font-bold text-sm text-white truncate">{notif.title}</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">To: {notif.targetEmail === 'ALL' ? 'Everyone' : notif.targetEmail}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-medium border border-blue-500/20"
                    title={`${notif.readBy?.length || 0} users have read this`}
                  >
                    <Eye size={14} />
                    <span>{notif.readBy?.length || 0}</span>
                  </div>

                  {CREATOR_EMAILS.includes(user.email) && (
                    <button
                      onClick={() => handleDeleteGlobal(notif.id)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete Notification"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-white/50 text-center py-4">No notifications sent yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
