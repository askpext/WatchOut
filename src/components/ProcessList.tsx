import { useState, useMemo } from "react";
import { Search, Trash2, X } from "lucide-react"; // <--- REMOVED Unused Imports
import { invoke } from "@tauri-apps/api/core";

export default function ProcessList({ processes, toMB }: any) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'cpu', direction: 'desc' });
  const [selectedProcess, setSelectedProcess] = useState<any>(null);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') direction = 'asc';
    setSortConfig({ key, direction });
  };

  const processedList = useMemo(() => {
    let filtered = processes.filter((p: any) => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.pid.toString().includes(searchTerm)
    );
    return filtered.sort((a: any, b: any) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [processes, searchTerm, sortConfig]);

  const terminateApp = async (pid: number) => {
    await invoke("kill_process", { pid });
  };

  return (
    <div className="view-processes">
      <header>
        <h1>Process Manager</h1>
        <div className="search-bar">
          <Search size={16} color="#888" />
          <input type="text" placeholder="Search executable..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </header>
      
      <div className="glass-card full-height-table">
        <table className="clean-table full-width">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} className="sortable">Name</th>
              <th onClick={() => handleSort('pid')} className="sortable">ID</th>
              <th onClick={() => handleSort('cpu')} className="sortable">CPU</th>
              <th onClick={() => handleSort('memory')} className="sortable">Memory</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {processedList.map((p: any) => (
              <tr key={p.pid} onClick={() => setSelectedProcess(p)} className="clickable-row">
                <td className="bold">{p.name}</td>
                <td className="mono">{p.pid}</td>
                <td className={p.cpu > 10 ? "danger" : ""}>{p.cpu.toFixed(1)}%</td>
                <td className="mono">{toMB(p.memory)} MB</td>
                <td>
                  <button className="icon-btn" onClick={(e) => { e.stopPropagation(); terminateApp(p.pid); }}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* INSPECTOR MODAL */}
      {selectedProcess && (
        <div className="modal-overlay" onClick={() => setSelectedProcess(null)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedProcess.name}</h2>
              <button className="icon-btn" onClick={() => setSelectedProcess(null)}><X size={18}/></button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="label">Path:</span>
                <span className="value mono">{selectedProcess.exe_path || "Access Denied"}</span>
              </div>
              <div className="detail-row">
                <span className="label">Command:</span>
                <span className="value mono code-box">{selectedProcess.cmd || "N/A"}</span>
              </div>
              <div className="detail-row">
                <span className="label">Uptime:</span>
                <span className="value">{selectedProcess.run_time} seconds</span>
              </div>
              <div className="modal-actions">
                <button className="kill-btn-large" onClick={() => { terminateApp(selectedProcess.pid); setSelectedProcess(null); }}>
                  FORCE KILL PROCESS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}