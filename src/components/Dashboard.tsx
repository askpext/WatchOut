import { AreaChart, Area, Tooltip, ResponsiveContainer } from "recharts";
import { HardDrive, Clock, Monitor } from "lucide-react";

export default function Dashboard({ stats, history, toGB, formatSpeed, colors, isMini }: any) {
  
  const formatUptime = (sec: number) => {
    const d = Math.floor(sec / (3600*24));
    const h = Math.floor((sec % (3600*24)) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  const getMainDisk = () => {
    if(!stats.disks || stats.disks.length === 0) return null;
    return stats.disks[0]; 
  };
  const disk = getMainDisk();

  if (isMini) {
    return (
      <div className="mini-dashboard">
        <div className="mini-card">
           <span className="mini-label">CPU</span>
           <span className="mini-val" style={{color: colors.primary}}>{stats.cpu_usage.toFixed(0)}%</span>
        </div>
        <div className="mini-sep" />
        <div className="mini-card">
           <span className="mini-label">RAM</span>
           <span className="mini-val" style={{color: colors.secondary}}>{toGB(stats.used_memory)}<span className="unit-small">GB</span></span>
        </div>
        <div className="mini-sep" />
        <div className="mini-card">
           <span className="mini-label">NET</span>
           <span className="mini-val" style={{color: colors.tertiary, fontSize: '1.2rem'}}>{formatSpeed(stats.net_down).split(' ')[0]}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="view-dashboard">
      <header>
        <h1>System Overview</h1>
        <span className="live-badge">LIVE MONITORING</span>
      </header>

      <div className="grid-graphs three-col">
        {/* CPU */}
        <div className="glass-card">
          <div className="card-header">
            <h3>CPU Usage</h3>
            <span className="val-cpu" style={{ color: colors.primary }}>{stats.cpu_usage.toFixed(1)}%</span>
          </div>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="gradCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.primary} stopOpacity={0.5}/>
                    <stop offset="95%" stopColor={colors.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip contentStyle={{background: '#111', border: '1px solid #333'}} itemStyle={{color:'#fff'}}/>
                <Area type="monotone" dataKey="cpu" stroke={colors.primary} strokeWidth={2} fill="url(#gradCpu)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RAM */}
        <div className="glass-card">
          <div className="card-header">
            <h3>Memory Usage</h3>
            <span className="val-ram" style={{ color: colors.secondary }}>{toGB(stats.used_memory)} GB</span>
          </div>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="gradRam" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.secondary} stopOpacity={0.5}/>
                    <stop offset="95%" stopColor={colors.secondary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip contentStyle={{background: '#111', border: '1px solid #333'}} itemStyle={{color:'#fff'}}/>
                <Area type="monotone" dataKey="ram" stroke={colors.secondary} strokeWidth={2} fill="url(#gradRam)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* NETWORK */}
        <div className="glass-card">
          <div className="card-header">
            <h3>Network (Down)</h3>
            <span className="val-net" style={{ color: colors.tertiary }}>{formatSpeed(stats.net_down)}</span>
          </div>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="gradNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.tertiary} stopOpacity={0.5}/>
                    <stop offset="95%" stopColor={colors.tertiary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip contentStyle={{background: '#111', border: '1px solid #333'}} itemStyle={{color:'#fff'}}/>
                <Area type="monotone" dataKey="net" stroke={colors.tertiary} strokeWidth={2} fill="url(#gradNet)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="subtitle-sm">Upload: {formatSpeed(stats.net_up)}</p>
        </div>
      </div>

      {/* SYSTEM STATUS ROW */}
      <div className="grid-graphs two-col mt-4">
        {/* DISK USAGE */}
        <div className="glass-card">
           <div className="card-header">
             <h3>Storage ({disk ? disk.mount_point : 'N/A'})</h3>
             <HardDrive size={18} color={colors.secondary} />
           </div>
           {disk ? (
             <div className="disk-info">
               <div className="disk-text">
                 <span>{toGB(disk.used)} GB used</span>
                 <span className="dim">of {toGB(disk.total)} GB</span>
               </div>
               <div className="bar-bg">
                 <div 
                   className="bar-fill" 
                   style={{ 
                     width: `${(disk.used / disk.total) * 100}%`,
                     background: colors.secondary,
                     boxShadow: `0 0 10px ${colors.secondary}`
                   }} 
                 />
               </div>
             </div>
           ) : <p>No Disk Found</p>}
        </div>

        {/* UPTIME & OS */}
        <div className="glass-card flex-card">
           <div className="stat-item">
              <div className="icon-box"><Clock size={20} color={colors.primary} /></div>
              <div>
                <h3>Uptime</h3>
                <p className="mono-text">{formatUptime(stats.uptime)}</p>
              </div>
           </div>
           <div className="sep-vert"></div>
           <div className="stat-item">
              <div className="icon-box"><Monitor size={20} color={colors.tertiary} /></div>
              <div>
                <h3>System</h3>
                <p className="mono-text">{stats.os_name.replace("Microsoft ", "")}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}