/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { 
  Box, 
  Layers, 
  Rotate3D, 
  Cpu, 
  ChevronRight,
  Eye,
  Camera,
  Sun,
  Layout,
  Maximize2,
  MousePointer,
  RotateCcw,
  Scale
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, logout } from "./lib/firebase";
import Scene from "./components/Scene";
import Auth from "./components/Auth";
import SettingsModal from "./components/SettingsModal";
import AIAssistant from "./components/AIAssistant";

function Header({ user, onOpenSettings }: { user: any, onOpenSettings: () => void }) {
  return (
    <header className="h-[56px] border-b border-border bg-bg-sidebar flex items-center justify-between px-5 shrink-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded bg-brand flex items-center justify-center">
          <Rotate3D className="text-white w-3 h-3" />
        </div>
        <span className="font-display font-black text-sm tracking-tighter uppercase">Dimension Pro</span>
      </div>

      <div className="hidden md:flex items-center gap-6">
        {["Project", "Edit", "Render", "Assets"].map((item) => (
          <span key={item} className="nav-item">{item}</span>
        ))}
        <span onClick={onOpenSettings} className="nav-item">Settings</span>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3 px-3 py-1 bg-bg-accent rounded-full border border-border">
            <div className="w-6 h-6 rounded-full overflow-hidden border border-brand/50">
               <img src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <span className="text-[11px] font-technical uppercase font-bold text-text-muted hidden sm:block">{user.displayName?.split(' ')[0]}</span>
            <button 
              onClick={() => logout()}
              className="text-[10px] text-text-sub hover:text-white transition-colors uppercase font-bold tracking-tighter cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        )}
        <button className="bg-brand text-white px-4 py-1.5 rounded text-[12px] font-bold hover:brightness-110 active:scale-95 transition-all">
          EXPORT .GLB
        </button>
      </div>
    </header>
  );
}

function SidebarItem({ icon: Icon, children, active = false }: { icon: any, children: React.ReactNode, active?: boolean }) {
  return (
    <div className={`panel-item ${active ? 'active' : ''}`}>
      <Icon className="w-4 h-4" />
      <span>{children}</span>
    </div>
  );
}

function PropertyRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] text-text-muted">{label}</span>
      <div className="grid grid-cols-2 gap-2">
        <input 
          readOnly 
          value={value} 
          className="bg-bg-accent border border-border rounded px-2.5 py-1.5 text-[12px] font-mono text-brand focus:outline-none" 
        />
        <input 
          readOnly 
          value="0.00" 
          className="bg-bg-accent border border-border rounded px-2.5 py-1.5 text-[12px] font-mono text-brand focus:outline-none" 
        />
      </div>
    </div>
  );
}

export default function App() {
  const [user, loading] = useAuthState(auth);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("gemini_api_key") || "");

  useEffect(() => {
    localStorage.setItem("gemini_api_key", apiKey);
  }, [apiKey]);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-bg-main flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Rotate3D className="text-brand w-12 h-12 animate-spin" style={{ animationDuration: '3s' }} />
          <span className="text-xs font-technical uppercase tracking-[0.4em] text-text-sub animate-pulse">Initializing Neural Interface</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden text-slate-200" id="main-container">
      {!user && <Auth />}
      <Header user={user} onOpenSettings={() => setIsSettingsOpen(true)} />
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        apiKey={apiKey} 
        onApiKeyChange={setApiKey} 
      />
      <AIAssistant apiKey={apiKey} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-[220px] sidebar border-r p-4 flex flex-col gap-8">
          <div>
            <h4 className="section-title">Hierarchy</h4>
            <div className="flex flex-col gap-0.5">
              <SidebarItem icon={Box} active>Default_Sphere</SidebarItem>
              <SidebarItem icon={Camera}>Main_Camera</SidebarItem>
              <SidebarItem icon={Sun}>Directional_Light</SidebarItem>
              <SidebarItem icon={Box}>Environment_Grid</SidebarItem>
            </div>
          </div>

          <div>
            <h4 className="section-title">Layers</h4>
            <div className="flex flex-col gap-0.5">
              <SidebarItem icon={Eye}>Geometry</SidebarItem>
              <SidebarItem icon={Sun}>Lighting</SidebarItem>
              <SidebarItem icon={Layers}>Post_Processing</SidebarItem>
            </div>
          </div>
        </aside>

        {/* Viewport */}
        <main className="flex-1 relative bg-black flex flex-col">
          <div className="absolute top-5 right-5 z-20 text-right pointer-events-none">
            <div className="text-[12px] font-bold text-brand uppercase tracking-wider">Perspective</div>
            <div className="text-[10px] text-text-sub uppercase">Wireframe: Off</div>
          </div>

          <Scene />

          {/* Viewport Toolbar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 glass p-1.5 rounded-lg z-20">
            <button className="w-9 h-9 flex items-center justify-center rounded bg-brand text-white"><MousePointer className="w-4 h-4" /></button>
            <button className="w-9 h-9 flex items-center justify-center rounded hover:bg-bg-accent text-text-muted"><RotateCcw className="w-4 h-4" /></button>
            <button className="w-9 h-9 flex items-center justify-center rounded hover:bg-bg-accent text-text-muted"><Scale className="w-4 h-4" /></button>
            <div className="w-[1px] h-4 bg-border mx-1"></div>
            <button className="w-9 h-9 flex items-center justify-center rounded hover:bg-bg-accent text-text-muted"><Box className="w-4 h-4" /></button>
            <button className="w-9 h-9 flex items-center justify-center rounded hover:bg-bg-accent text-text-muted">< Sun className="w-4 h-4" /></button>
          </div>
        </main>

        {/* Right Sidebar - Properties */}
        <aside className="w-[260px] sidebar border-l p-4 flex flex-col gap-8">
          <div>
            <h4 className="section-title">Transform</h4>
            <div className="flex flex-col gap-4">
              <PropertyRow label="Position" value="0.00" />
              <PropertyRow label="Rotation" value="-25.0" />
              <PropertyRow label="Scale" value="1.00" />
            </div>
          </div>

          <div>
            <h4 className="section-title">Material</h4>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-[11px] text-text-muted">Base Color</span>
                <div className="flex items-center gap-3">
                   <div className="w-6 h-6 rounded border-2 border-white bg-brand shadow-lg"></div>
                   <div className="flex-1 bg-bg-accent border border-border rounded px-2.5 py-1.5 text-[12px] font-mono text-brand">#3B82F6</div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[11px] text-text-muted">Roughness</span>
                <input type="range" className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-brand" />
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[11px] text-text-muted">Metallic</span>
                <input type="range" className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-brand" />
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Footer / Status Bar */}
      <footer className="h-[32px] bg-bg-sidebar border-t border-border flex items-center justify-between px-5 font-technical text-[10px] tracking-widest text-text-sub shrink-0">
        <div className="flex gap-4">
          <span>TRIANGLES: 8,192</span>
          <span>VERTICES: 4,098</span>
          <span>MEMORY: 2.4 MB</span>
        </div>
        <div className="flex gap-4">
          <span>FPS: 144</span>
          <span>RENDER: 0.1ms</span>
          <span className="text-brand font-bold">V1.5.0-STABLE</span>
        </div>
      </footer>
    </div>
  );
}
