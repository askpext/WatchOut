import { invoke } from "@tauri-apps/api/core";

export default function Settings({ refreshRate, setRefreshRate, isAlwaysOnTop, setIsAlwaysOnTop, currentTheme, setTheme }: any) {
  
  const toggleAlwaysOnTop = async () => {
    const newState = !isAlwaysOnTop;
    setIsAlwaysOnTop(newState);
    await invoke("set_always_on_top", { state: newState });
  };

  const themes = [
    { id: "neon", name: "Cyberpunk", color: "#ff0055" },
    { id: "frost", name: "Ice Blue", color: "#00ccff" },
    { id: "sunset", name: "Vaporwave", color: "#ff9900" },
  ];

  return (
    <div className="view-settings">
      <header><h1>Settings</h1></header>
      <div className="settings-grid">
        
        {/* THEME SELECTOR */}
        <div className="glass-card">
          <div className="setting-item">
            <div className="setting-label">
              <h3>Visual Theme</h3>
              <p>Customize the accent colors.</p>
            </div>
            <div className="setting-control theme-selector">
              {themes.map(t => (
                <button 
                  key={t.id}
                  className={`theme-btn ${currentTheme === t.id ? 'selected' : ''}`}
                  style={{ backgroundColor: t.color }}
                  onClick={() => setTheme(t.id)}
                  title={t.name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Refresh Rate */}
        <div className="glass-card">
          <div className="setting-item">
            <div className="setting-label">
              <h3>Update Speed</h3>
              <p>Faster updates use more CPU.</p>
            </div>
            <div className="setting-control">
              <input type="range" min="500" max="5000" step="500" value={refreshRate} onChange={(e) => setRefreshRate(Number(e.target.value))} />
              <span className="mono">{(refreshRate / 1000).toFixed(1)}s</span>
            </div>
          </div>
        </div>

        {/* Always On Top */}
        <div className="glass-card">
          <div className="setting-item">
            <div className="setting-label">
              <h3>Always On Top</h3>
              <p>Keep window floating above others.</p>
            </div>
            <div className="setting-control">
              <button className={`toggle-btn ${isAlwaysOnTop ? 'active' : ''}`} onClick={toggleAlwaysOnTop}>{isAlwaysOnTop ? 'ON' : 'OFF'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}