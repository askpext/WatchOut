import { Zap, Activity, Cpu, Rocket, Settings } from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab }: any) {
  return (
    <nav className="sidebar">
      <div className="brand">
        <Zap size={24} color="#ff0055" fill="#ff0055" />
        <span>WATCHOUT</span>
      </div>
      <div className="menu">
        <button className={activeTab === "dashboard" ? "active" : ""} onClick={() => setActiveTab("dashboard")}>
          <Activity size={20} /> Dashboard
        </button>
        <button className={activeTab === "processes" ? "active" : ""} onClick={() => setActiveTab("processes")}>
          <Cpu size={20} /> Processes
        </button>
        {/* NEW TAB */}
        <button className={activeTab === "startup" ? "active" : ""} onClick={() => setActiveTab("startup")}>
          <Rocket size={20} /> Startup
        </button>
        <button className={activeTab === "settings" ? "active" : ""} onClick={() => setActiveTab("settings")}>
          <Settings size={20} /> Settings
        </button>
      </div>
    </nav>
  );
}