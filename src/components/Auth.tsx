import { motion } from 'motion/react';
import { LogIn, Github, Mail, Rotate3D } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';
import { useState } from 'react';

export default function Auth() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass w-full max-w-md p-10 rounded-[32px] border-border relative overflow-hidden"
      >
        {/* Visual accents */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand/5 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand flex items-center justify-center mb-8 shadow-xl shadow-brand/20">
            <Rotate3D className="text-white w-8 h-8" />
          </div>

          <h2 className="text-3xl font-display font-bold tracking-tight mb-2">Access Dimension Pro</h2>
          <p className="text-text-muted text-sm mb-10 leading-relaxed max-w-[280px]">
            Sign in to save your spatial configurations and access advanced rendering features.
          </p>

          <div className="w-full flex flex-col gap-4">
            <button 
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-white text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-brand hover:text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <LogIn className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              <span>{loading ? 'Authenticating...' : 'Sign in with Google'}</span>
            </button>

            <div className="flex items-center gap-4 my-2">
              <div className="flex-1 h-[1px] bg-border"></div>
              <span className="text-[10px] font-technical text-text-sub uppercase tracking-widest">Enterprise Only</span>
              <div className="flex-1 h-[1px] bg-border"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <button className="flex-1 glass py-4 rounded-2xl text-[13px] font-bold flex items-center justify-center gap-2 opacity-50 cursor-not-allowed border-dashed">
                 <Mail className="w-4 h-4" /> Email
               </button>
               <button className="flex-1 glass py-4 rounded-2xl text-[13px] font-bold flex items-center justify-center gap-2 opacity-50 cursor-not-allowed border-dashed">
                 <Github className="w-4 h-4" /> GitHub
               </button>
            </div>
          </div>

          <p className="mt-8 text-[11px] text-text-sub leading-relaxed px-4">
            By signing in, you agree to the <span className="text-text-muted underline cursor-pointer">Spatial Governance Protocol</span> and <span className="text-text-muted underline cursor-pointer">Data Residency Act</span>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
