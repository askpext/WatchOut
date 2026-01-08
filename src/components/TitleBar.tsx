import { getCurrentWindow } from '@tauri-apps/api/window';
import { Minus, Square, X, MonitorPlay } from 'lucide-react'; // Added MonitorPlay icon
import './TitleBar.css'; // Make sure you have this file or use App.css

export default function TitleBar({ toggleMiniMode }: any) {
  const appWindow = getCurrentWindow();

  return (
    <div data-tauri-drag-region className="titlebar">
      <div className="titlebar-branding">
        <span className="title-text">WATCHOUT</span>
      </div>

      <div className="titlebar-controls">
        {/* NEW MINI MODE BUTTON */}
        <button className="titlebar-btn" onClick={toggleMiniMode} title="Mini Mode">
          <MonitorPlay size={14} />
        </button>
        
        <button className="titlebar-btn" onClick={() => appWindow.minimize()}>
          <Minus size={16} />
        </button>
        <button className="titlebar-btn" onClick={() => appWindow.toggleMaximize()}>
          <Square size={14} />
        </button>
        <button className="titlebar-btn close-btn" onClick={() => appWindow.close()}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
}