use std::sync::Mutex;
use tauri::{command, State, Builder, generate_handler, generate_context, Manager, AppHandle};
use window_vibrancy::apply_mica;
use sysinfo::{
    System, RefreshKind, CpuRefreshKind, MemoryRefreshKind, 
    ProcessRefreshKind, Pid, Networks, Disks
}; 
use winreg::enums::*;
use winreg::RegKey;

struct AppState {
    sys: Mutex<System>,
    networks: Mutex<Networks>,
    disks: Mutex<Disks>,
}

#[derive(serde::Serialize)]
struct ProcessInfo {
    pid: u32,
    name: String,
    cpu: f32,
    memory: u64,
    exe_path: String,
    cmd: String,
    run_time: u64, 
}

#[derive(serde::Serialize)]
struct StartupApp {
    name: String,
    path: String,
}

#[derive(serde::Serialize)]
struct DiskData {
    name: String,
    total: u64,
    used: u64,
    mount_point: String,
}

#[derive(serde::Serialize)]
struct SystemStats {
    total_memory: u64,
    used_memory: u64,
    cpu_usage: f32,
    processes: Vec<ProcessInfo>,
    net_down: u64,
    net_up: u64,
    disks: Vec<DiskData>,
    uptime: u64,
    os_name: String,
}

#[command]
fn get_stats(state: State<AppState>) -> SystemStats {
    let mut sys = state.sys.lock().unwrap();
    let mut networks = state.networks.lock().unwrap();
    let mut disks = state.disks.lock().unwrap();

    sys.refresh_all();
    networks.refresh();      
    disks.refresh_list();

    let mut total_down = 0;
    let mut total_up = 0;
    for (_name, data) in networks.iter() {
        total_down += data.received();
        total_up += data.transmitted();
    }

    let mut procs: Vec<ProcessInfo> = sys.processes()
        .iter()
        .map(|(pid, process)| {
            ProcessInfo {
                pid: pid.as_u32(),
                name: process.name().to_string(),
                cpu: process.cpu_usage(),
                memory: process.memory(),
                exe_path: process.exe().map(|p| p.to_string_lossy().to_string()).unwrap_or_default(),
                cmd: process.cmd().join(" "),
                run_time: process.run_time(),
            }
        })
        .collect();

    procs.sort_by(|a, b| b.cpu.partial_cmp(&a.cpu).unwrap());
    procs.truncate(50); 

    let mut disk_list = Vec::new();
    for disk in disks.list() {
        disk_list.push(DiskData {
            name: disk.name().to_string_lossy().to_string(),
            total: disk.total_space(),
            used: disk.total_space() - disk.available_space(),
            mount_point: disk.mount_point().to_string_lossy().to_string(),
        });
    }

    SystemStats {
        total_memory: sys.total_memory(),
        used_memory: sys.used_memory(),
        cpu_usage: sys.global_cpu_info().cpu_usage(),
        processes: procs,
        net_down: total_down,
        net_up: total_up,
        disks: disk_list,
        uptime: System::uptime(),
        os_name: System::name().unwrap_or("Unknown".to_string()),
    }
}

#[command]
fn kill_process(pid: u32) -> bool {
    let s = System::new_all();
    if let Some(process) = s.process(Pid::from_u32(pid)) {
        return process.kill();
    }
    false
}

#[command]
fn set_always_on_top(app: AppHandle, state: bool) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.set_always_on_top(state);
    }
}

#[command]
fn set_window_size(app: AppHandle, width: f64, height: f64) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.set_size(tauri::Size::Logical(tauri::LogicalSize { width, height }));
    }
}

#[command]
fn get_startup_apps() -> Vec<StartupApp> {
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let path = r"Software\Microsoft\Windows\CurrentVersion\Run";
    let mut apps = Vec::new();

    if let Ok(key) = hkcu.open_subkey(path) {
        for (name, value) in key.enum_values().filter_map(|x| x.ok()) {
            apps.push(StartupApp {
                name,
                path: value.to_string(),
            });
        }
    }
    apps
}

#[command]
fn remove_startup_app(name: String) -> bool {
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let path = r"Software\Microsoft\Windows\CurrentVersion\Run";
    if let Ok(key) = hkcu.open_subkey_with_flags(path, KEY_WRITE) {
        return key.delete_value(&name).is_ok();
    }
    false
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let sys = System::new_with_specifics(
        RefreshKind::new()
            .with_cpu(CpuRefreshKind::everything())
            .with_memory(MemoryRefreshKind::everything())
            .with_processes(ProcessRefreshKind::everything())
    );
    let networks = Networks::new_with_refreshed_list();
    let disks = Disks::new_with_refreshed_list();

    Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState { 
            sys: Mutex::new(sys),
            networks: Mutex::new(networks),
            disks: Mutex::new(disks)
        }) 
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            #[cfg(target_os = "windows")]
            let _ = apply_mica(&window, Some(true));
            Ok(())
        })
        .invoke_handler(generate_handler![
            get_stats, 
            kill_process, 
            set_always_on_top,
            get_startup_apps,
            remove_startup_app,
            set_window_size 
        ])
        .run(generate_context!())
        .expect("error while running tauri application");
}