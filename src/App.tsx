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
  Scale,
  Save,
  Plus,
  Trash2,
  Settings,
  ShieldCheck,
  Zap,
  Activity
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, logout, db, handleFirestoreError, OperationType } from "./lib/firebase";
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import Scene from "./components/Scene";
import Auth from "./components/Auth";
import SettingsModal from "./components/SettingsModal";
import AIAssistant from "./components/AIAssistant";

const ADMIN_EMAILS = ["nelladray@gmail.com"];

function Header({ user, onOpenSettings, activeTab, setActiveTab, isAdmin }: { 
  user: any, 
  onOpenSettings: () => void, 
  activeTab: string, 
  setActiveTab: (t: string) => void,
  isAdmin: boolean
}) {
  return (
    <header className="h-[56px] border-b border-border bg-bg-sidebar flex items-center justify-between px-5 shrink-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded bg-brand flex items-center justify-center">
          <Rotate3D className="text-white w-3 h-3" />
        </div>
        <div className="flex flex-col">
          <span className="font-display font-black text-sm tracking-tighter uppercase">Dimension Pro</span>
          {isAdmin && <span className="text-[8px] text-brand font-bold uppercase tracking-[0.2em] -mt-1">ADMIN ACCESS</span>}
        </div>
      </div>

      <div className="hidden md:flex items-center gap-6">
        {["Project", "Edit", "Render", "Assets"].map((item) => (
          <span 
            key={item} 
            onClick={() => setActiveTab(item)}
            className={`nav-item ${activeTab === item ? 'text-white' : ''}`}
          >
            {item}
          </span>
        ))}
        <span onClick={onOpenSettings} className="nav-item">Settings</span>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3 px-2 py-0.5 bg-bg-accent rounded-full border border-border">
            <div className={`w-6 h-6 rounded-full overflow-hidden border ${isAdmin ? 'border-brand' : 'border-border'}`}>
               <img src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <button 
              onClick={() => logout()}
              className="text-[10px] text-text-sub hover:text-white transition-colors uppercase font-bold tracking-tighter pr-2"
            >
              Sign Out
            </button>
          </div>
        )}
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
  const [activeTab, setActiveTab] = useState("Project");
  
  // 3D parameters state
  const [rotationX, setRotationX] = useState(-25);
  const [rotationY, setRotationY] = useState(45);
  const [scale, setScale] = useState(1);
  const [lightIntensity, setLightIntensity] = useState(1);
  const [ambientIntensity, setAmbientIntensity] = useState(0.5);
  const [projectName, setProjectName] = useState("New Dimension");
  
  // Projects from Firebase
  const [projects, setProjects] = useState<any[]>([]);

  const isAdmin = useMemo(() => user?.email ? ADMIN_EMAILS.includes(user.email) : false, [user]);

  useEffect(() => {
    localStorage.setItem("gemini_api_key", apiKey);
  }, [apiKey]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "projects"), where("ownerId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, "projects"));
    return () => unsubscribe();
  }, [user]);

  const saveProject = async () => {
    if (!user) return;
    try {
      await addDoc(collection(db, "projects"), {
        name: projectName,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        rotationX,
        rotationY,
        scale,
        lightIntensity,
        ambientIntensity
      });
      alert("Project saved successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "projects");
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await deleteDoc(doc(db, "projects", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `projects/${id}`);
    }
  };

  const loadProject = (proj: any) => {
    setProjectName(proj.name);
    setRotationX(proj.rotationX || -25);
    setRotationY(proj.rotationY || 45);
    setScale(proj.scale || 1);
    setLightIntensity(proj.lightIntensity || 1);
    setAmbientIntensity(proj.ambientIntensity || 0.5);
    setActiveTab("Edit");
  };

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
      <Header 
        user={user} 
        onOpenSettings={() => setIsSettingsOpen(true)} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
      />
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        apiKey={apiKey} 
        onApiKeyChange={setApiKey} 
      />
      <AIAssistant apiKey={apiKey} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Navigation Panels */}
        <aside className="w-[260px] sidebar border-r flex flex-col overflow-hidden">
          {activeTab === "Project" && (
            <div className="p-4 flex flex-col gap-6 overflow-y-auto">
               <div className="flex items-center justify-between">
                <h4 className="section-title">Saved Projects</h4>
                <button onClick={() => setProjectName("Untitled Dimension")} className="p-1 hover:bg-bg-accent rounded text-brand"><Plus className="w-3 h-3" /></button>
               </div>
               <div className="flex flex-col gap-2">
                 <input 
                  value={projectName} 
                  onChange={(e) => setProjectName(e.target.value)} 
                  className="bg-bg-accent border border-border rounded-lg px-3 py-2 text-xs focus:border-brand/50 outline-none w-full"
                  placeholder="Project name..."
                 />
                 <button onClick={saveProject} className="w-full bg-brand text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:brightness-110">
                   <Save className="w-3 h-3" /> Save Current
                 </button>
               </div>
               <div className="flex flex-col gap-1">
                 {projects.length === 0 && <p className="text-[10px] text-text-sub italic text-center p-4">No projects yet.</p>}
                 {projects.map(p => (
                   <div key={p.id} className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-bg-accent transition-colors cursor-pointer border border-transparent hover:border-border">
                     <div onClick={() => loadProject(p)} className="flex items-center gap-3">
                        <Box className="w-4 h-4 text-text-sub group-hover:text-brand" />
                        <span className="text-xs font-medium truncate w-[140px] uppercase tracking-tight">{p.name}</span>
                     </div>
                     <button onClick={() => deleteProject(p.id)} className="p-1 hover:text-brand opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3"/></button>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {activeTab === "Edit" && (
            <div className="p-4 flex flex-col gap-8">
               <div>
                <h4 className="section-title">Coordinate Logic</h4>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-[10px] text-text-muted"><span>ROTATION X</span><span>{rotationX}°</span></div>
                    <input type="range" min="-180" max="180" value={rotationX} onChange={(e) => setRotationX(Number(e.target.value))} className="w-full appearance-none h-1 bg-border rounded-full accent-brand" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-[10px] text-text-muted"><span>ROTATION Y</span><span>{rotationY}°</span></div>
                    <input type="range" min="-180" max="180" value={rotationY} onChange={(e) => setRotationY(Number(e.target.value))} className="w-full appearance-none h-1 bg-border rounded-full accent-brand" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-[10px] text-text-muted"><span>UNIFORM SCALE</span><span>{scale.toFixed(2)}x</span></div>
                    <input type="range" min="0.1" max="3" step="0.01" value={scale} onChange={(e) => setScale(Number(e.target.value))} className="w-full appearance-none h-1 bg-border rounded-full accent-brand" />
                  </div>
                </div>
               </div>
               
               <div>
                <h4 className="section-title">Object Hierarchy</h4>
                <SidebarItem icon={Box} active>Root_Sphere</SidebarItem>
                <SidebarItem icon={Sun}>Dynamic_Environment</SidebarItem>
               </div>
            </div>
          )}

          {activeTab === "Render" && (
            <div className="p-4 flex flex-col gap-8">
               <div>
                <h4 className="section-title">Illumination</h4>
                <div className="flex flex-col gap-5">
                   <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-[10px] text-text-muted uppercase"><span>Point Intensity</span><span>{lightIntensity.toFixed(1)}</span></div>
                    <input type="range" min="0" max="5" step="0.1" value={lightIntensity} onChange={(e) => setLightIntensity(Number(e.target.value))} className="w-full h-1 bg-border rounded-full accent-brand appearance-none" />
                   </div>
                   <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-[10px] text-text-muted uppercase"><span>Ambient Bias</span><span>{ambientIntensity.toFixed(1)}</span></div>
                    <input type="range" min="0" max="2" step="0.1" value={ambientIntensity} onChange={(e) => setAmbientIntensity(Number(e.target.value))} className="w-full h-1 bg-border rounded-full accent-brand appearance-none" />
                   </div>
                </div>
               </div>

               <div>
                <h4 className="section-title">Global Shaders</h4>
                <div className="grid grid-cols-2 gap-2">
                   {['Standard', 'Neon', 'Wire', 'Ghost'].map(s => (
                     <button key={s} className="px-3 py-2 bg-bg-accent border border-border rounded-lg text-[10px] font-bold uppercase transition-all hover:border-brand/50">
                        {s}
                     </button>
                   ))}
                </div>
               </div>
            </div>
          )}

          {activeTab === "Assets" && (
            <div className="p-4 flex flex-col gap-6">
               <h4 className="section-title">Available Modules</h4>
               <div className="grid grid-cols-2 gap-3">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="aspect-square bg-bg-accent border border-border rounded-2xl flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-brand/50">
                       <Box className="w-6 h-6 text-text-sub group-hover:text-brand transition-colors" />
                       <span className="text-[10px] text-text-sub font-technical">MOD_{i}</span>
                    </div>
                  ))}
               </div>
               
               {isAdmin && (
                 <div className="mt-4 p-4 border border-brand/20 bg-brand/5 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3 text-brand text-[10px] uppercase font-black">
                       <ShieldCheck className="w-4 h-4" /> System Lab (Admin Only)
                    </div>
                    <p className="text-[10px] text-text-sub mb-4">Internal performance telemetry and raw node access.</p>
                    <button className="w-full py-2 bg-brand text-white rounded-lg text-[10px] font-bold uppercase">Open Engine Debugger</button>
                 </div>
               )}
            </div>
          )}
        </aside>

        {/* Viewport */}
        <main className="flex-1 relative bg-black flex flex-col">
          <div className="absolute top-5 right-5 z-20 text-right pointer-events-none">
            <div className="text-[12px] font-bold text-brand uppercase tracking-wider">Perspective</div>
            <div className="text-[10px] text-text-sub uppercase">Wireframe: Off</div>
            {isAdmin && <div className="text-[10px] text-green-500 font-bold uppercase mt-1 animate-pulse tracking-widest">REALTIME_SYNC: ACTIVE</div>}
          </div>

          <Scene rotationX={rotationX} rotationY={rotationY} scale={scale} lightIntensity={lightIntensity} ambientIntensity={ambientIntensity} />

          {/* Viewport Toolbar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 glass p-1.5 rounded-lg z-20">
            <button className="w-9 h-9 flex items-center justify-center rounded bg-brand text-white"><MousePointer className="w-4 h-4" /></button>
            <button onClick={() => {setRotationX(-25); setRotationY(45); setScale(1);}} className="w-9 h-9 flex items-center justify-center rounded hover:bg-bg-accent text-text-muted"><RotateCcw className="w-4 h-4" /></button>
            <button className="w-9 h-9 flex items-center justify-center rounded hover:bg-bg-accent text-text-muted"><Scale className="w-4 h-4" /></button>
            <div className="w-[1px] h-4 bg-border mx-1"></div>
            <button className="w-9 h-9 flex items-center justify-center rounded hover:bg-bg-accent text-text-muted"><Box className="w-4 h-4" /></button>
            <button className="w-9 h-9 flex items-center justify-center rounded hover:bg-bg-accent text-text-muted">< Sun className="w-4 h-4" /></button>
          </div>
        </main>
      </div>

      {/* Footer / Status Bar */}
      <footer className="h-[32px] bg-bg-sidebar border-t border-border flex items-center justify-between px-5 font-technical text-[10px] tracking-widest text-text-sub shrink-0">
        <div className="flex gap-4 items-center">
          <Activity className="w-3 h-3 text-brand" />
          <span>TRIANGLES: {isAdmin ? '1.2M' : '8,192'}</span>
          <span>VERTICES: 4,098</span>
          <span>SYSTEM_MEMORY: {isAdmin ? '14.2 MB' : '2.4 MB'}</span>
        </div>
        <div className="flex gap-4 items-center uppercase">
          {isAdmin && <Zap className="w-3 h-3 text-yellow-500" />}
          <span>FPS: 144</span>
          <span>LATENCY: {isAdmin ? '0.01ms' : '0.2ms'}</span>
          <span className={`font-bold ${isAdmin ? 'text-brand' : 'text-text-sub'}`}>V1.8.0-ALPHA</span>
        </div>
      </footer>
    </div>
  );
}
