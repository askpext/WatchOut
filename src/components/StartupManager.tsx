import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Trash2, ShieldAlert } from "lucide-react";

interface StartupApp { name: string; path: string; }

export default function StartupManager() {
  const [apps, setApps] = useState<StartupApp[]>([]);

  const loadApps = async () => {
    const list = await invoke<StartupApp[]>("get_startup_apps");
    setApps(list);
  };

  useEffect(() => { loadApps(); }, []);

  const removeApp = async (name: string) => {
    await invoke("remove_startup_app", { name });
    loadApps(); // Refresh list
  };

  return (
    <div className="view-startup">
      <header>
        <h1>Startup Apps</h1>
      </header>
      <div className="glass-card">
        <div className="warning-box">
          <ShieldAlert size={20} color="#ff9900" />
          <p>These apps start automatically when you log in. Removing them can speed up boot time.</p>
        </div>
        <table className="clean-table full-width mt-4">
          <thead>
            <tr>
              <th>Name</th>
              <th>Path / Command</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {apps.length === 0 ? <tr><td colSpan={3}>No startup apps found in Registry (HKCU).</td></tr> : null}
            {apps.map((app) => (
              <tr key={app.name}>
                <td className="bold">{app.name}</td>
                <td className="mono small-text">{app.path}</td>
                <td>
                  <button className="icon-btn" onClick={() => removeApp(app.name)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}