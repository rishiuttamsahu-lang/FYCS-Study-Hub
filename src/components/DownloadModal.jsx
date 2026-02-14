import { DownloadCloud } from "lucide-react";

export default function DownloadModal({ isOpen, onClose, onConfirm, fileName }) {
  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-[90%] max-w-sm animate-scale-in">
        <div className="text-center">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
              <DownloadCloud size={48} className="text-blue-500" />
            </div>
          </div>
          
          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-2">Ready to Download?</h3>
          
          {/* File Name */}
          <p className="text-zinc-400 text-sm truncate mb-2">{fileName}</p>
          
          {/* Warning */}
          <p className="text-xs text-zinc-400 mb-6">Download will start immediately.</p>
          
          {/* Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold hover:opacity-90 transition-opacity"
            >
              Download Now
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 text-zinc-400 font-bold hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}