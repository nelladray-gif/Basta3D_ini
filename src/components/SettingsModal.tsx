import { motion, AnimatePresence } from "motion/react";
import { X, Key, ShieldCheck, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export default function SettingsModal({ isOpen, onClose, apiKey, onApiKeyChange }: SettingsModalProps) {
  const [localKey, setLocalKey] = useState(apiKey);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setLocalKey(apiKey);
  }, [apiKey]);

  const handleSave = () => {
    onApiKeyChange(localKey);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass w-full max-w-lg rounded-3xl border-border relative overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-lg">System Configuration</h3>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-text-sub hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                   <label className="text-xs font-technical uppercase tracking-widest text-text-muted">Gemini API Integration</label>
                   <div className="flex items-center gap-1.5 text-[10px] text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded-full">
                     <ShieldCheck className="w-3 h-3" /> SECURE
                   </div>
                </div>
                
                <div className="relative group">
                  <input
                    type={isVisible ? "text" : "password"}
                    value={localKey}
                    onChange={(e) => setLocalKey(e.target.value)}
                    placeholder="Enter your Gemini API key manually..."
                    className="w-full bg-bg-accent border border-border rounded-2xl px-5 py-4 text-sm font-mono focus:outline-none focus:border-brand/50 transition-colors group-hover:border-white/10"
                  />
                  <button 
                    onClick={() => setIsVisible(!isVisible)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-text-sub hover:text-white transition-colors"
                  >
                    {isVisible ? "Hide" : "Show"}
                  </button>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                  <AlertCircle className="w-4 h-4 text-text-sub mt-0.5 shrink-0" />
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    This key will be used for AI features in the current session.
                    It is sent securely to the spatial engine backend and never exposed directly in the browser source.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white/5 border-t border-white/5 flex gap-3 justify-end">
              <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-white/5 transition-all">Cancel</button>
              <button onClick={handleSave} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-brand text-white hover:brightness-110 shadow-lg shadow-brand/20 transition-all">Apply Configuration</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
