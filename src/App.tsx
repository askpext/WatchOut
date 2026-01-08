import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import TitleBar from "./components/TitleBar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import ProcessList from "./components/ProcessList";
import StartupManager from "./components/StartupManager";
import Settings from "./components/Settings";
import "./App.css";

function App() {
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [refreshRate, setRefreshRate] = useState(1000);
  const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(false);
  const [theme, setTheme] = useState("neon");
  const [isMiniMode, setIsMiniMode] = useState(false);

  const themeColors: any = {
    neon:   { primary: "#ff0055", secondary: "#00ff9d", tertiary: "#bf00ff" },
    frost:  { primary: "#00ccff", secondary: "#0077ff", tertiary: "#ffffff" },
    sunset: { primary: "#ff9900", secondary: "#ff0055", tertiary: "#cc00ff" },
  };

  const currentColors = themeColors[theme];

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  const toGB = (bytes: number) => (bytes / 1024 / 1024 / 1024).toFixed(2);
  const toMB = (bytes: number) => (bytes / 1024 / 1024).toFixed(0);
  const formatSpeed = (bytes: number) => 
    bytes > 1024 * 1024 
      ? `${(bytes / 1024 / 1024).toFixed(1)} MB/s` 
      : `${(bytes / 1024).toFixed(0)} KB/s`;

  const toggleMiniMode = async () => {
    if (!isMiniMode) {
      setIsMiniMode(true);
      await invoke("set_window_size", { width: 320, height: 150 });
      await invoke("set_always_on_top", { state: true });
    } else {
      setIsMiniMode(false);
      await invoke("set_window_size", { width: 1000, height: 700 });
      await invoke("set_always_on_top", { state: isAlwaysOnTop });
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await invoke<any>("get_stats");
      setStats(data);
      
      setHistory(prev => {
        const newPoint = { 
          time: new Date().toLocaleTimeString(), 
          cpu: data.cpu_usage, 
          ram: data.used_memory / 1024 / 1024 / 1024,
          net: data.net_down / 1024 / 1024
        };
        const newHistory = [...prev, newPoint];
        if (newHistory.length > 60) newHistory.shift();
        return newHistory;
      });
    }, refreshRate);
    return () => clearInterval(interval);
  }, [refreshRate]);

  return (
    <div className={`app-layout ${isMiniMode ? 'mini-mode' : ''}`}>
      <TitleBar toggleMiniMode={toggleMiniMode} />
      {!isMiniMode && <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />}
      
      <main className="content">
        {!stats ? <div className="loading">Initializing Core...</div> : (
          <>
            {(activeTab === "dashboard" || isMiniMode) && (
              <Dashboard 
                stats={stats} 
                history={history} 
                toGB={toGB} 
                formatSpeed={formatSpeed} 
                colors={currentColors} 
                isMini={isMiniMode} 
              />
            )}
            
            {!isMiniMode && activeTab === "processes" && (
              <ProcessList processes={stats.processes} toMB={toMB} />
            )}
            
            {!isMiniMode && activeTab === "startup" && (
              <StartupManager />
            )}
            
            {!isMiniMode && activeTab === "settings" && (
              <Settings 
                refreshRate={refreshRate} 
                setRefreshRate={setRefreshRate} 
                isAlwaysOnTop={isAlwaysOnTop} 
                setIsAlwaysOnTop={setIsAlwaysOnTop} 
                currentTheme={theme} 
                setTheme={setTheme} 
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;