use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::process::Stdio;
use std::sync::Arc;
use tauri::{Emitter, State};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command;
use tokio::sync::Mutex;
use portable_pty::{CommandBuilder, PtySize, native_pty_system};
use std::io::{Read, Write};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentInfo {
    pub id: String,
    pub name: String,
    pub role: String,
    pub status: String,
    pub working_dir: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentEvent {
    pub agent_id: String,
    pub event_type: String,
    pub data: serde_json::Value,
}

pub struct AgentProcess {
    pub info: AgentInfo,
    pub session_id: Option<String>,
}

pub struct AppState {
    pub agents: Arc<Mutex<HashMap<String, AgentProcess>>>,
    pub pty_writer: Arc<Mutex<Option<Box<dyn Write + Send>>>>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            agents: Arc::new(Mutex::new(HashMap::new())),
            pty_writer: Arc::new(Mutex::new(None)),
        }
    }
}

/// Spawn a claude CLI process and stream its output as events
fn spawn_claude_stream(
    app: tauri::AppHandle,
    agents: Arc<Mutex<HashMap<String, AgentProcess>>>,
    agent_id: String,
    prompt: String,
    working_dir: String,
    resume_session: Option<String>,
    auto_approve: bool,
) {
    tokio::spawn(async move {
        let mut cmd = Command::new("claude");
        cmd.arg("--output-format")
            .arg("stream-json")
            .arg("--verbose");

        if auto_approve {
            cmd.arg("--dangerously-skip-permissions");
        }

        cmd.arg("-p")
            .arg(&prompt);

        if let Some(ref session) = resume_session {
            cmd.arg("--resume").arg(session);
        }

        cmd.current_dir(&working_dir)
            .stdin(Stdio::null())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());

        let mut child = match cmd.spawn() {
            Ok(c) => c,
            Err(e) => {
                let event = AgentEvent {
                    agent_id: agent_id.clone(),
                    event_type: "error".to_string(),
                    data: serde_json::json!({"error": format!("Failed to spawn claude: {}", e)}),
                };
                let _ = app.emit("agent-event", &event);
                return;
            }
        };

        let stdout = match child.stdout.take() {
            Some(s) => s,
            None => return,
        };

        let reader = BufReader::new(stdout);
        let mut lines = reader.lines();

        while let Ok(Some(line)) = lines.next_line().await {
            if let Ok(json) = serde_json::from_str::<serde_json::Value>(&line) {
                // Try to capture session_id from the result message
                if let Some(sid) = json.get("session_id").and_then(|s| s.as_str()) {
                    let mut agents_lock = agents.lock().await;
                    if let Some(agent) = agents_lock.get_mut(&agent_id) {
                        agent.session_id = Some(sid.to_string());
                    }
                }

                let event = AgentEvent {
                    agent_id: agent_id.clone(),
                    event_type: json
                        .get("type")
                        .and_then(|t| t.as_str())
                        .unwrap_or("unknown")
                        .to_string(),
                    data: json,
                };
                let _ = app.emit("agent-event", &event);
            }
        }

        // Wait for process to finish
        let _ = child.wait().await;

        // Mark as ready (not "completed" — agent can still receive messages)
        let event = AgentEvent {
            agent_id: agent_id.clone(),
            event_type: "ready".to_string(),
            data: serde_json::json!({"status": "ready"}),
        };
        let _ = app.emit("agent-event", &event);
    });
}

#[tauri::command]
async fn spawn_agent(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    name: String,
    role: String,
    working_dir: String,
    initial_prompt: String,
    auto_approve: Option<bool>,
) -> Result<AgentInfo, String> {
    let id = uuid::Uuid::new_v4().to_string();

    let info = AgentInfo {
        id: id.clone(),
        name: name.clone(),
        role: role.clone(),
        status: "running".into(),
        working_dir: working_dir.clone(),
    };

    let process = AgentProcess {
        info: info.clone(),
        session_id: None,
    };

    {
        let mut agents = state.agents.lock().await;
        agents.insert(id.clone(), process);
    }

    spawn_claude_stream(
        app,
        state.agents.clone(),
        id,
        initial_prompt,
        working_dir,
        None,
        auto_approve.unwrap_or(false),
    );

    Ok(info)
}

#[tauri::command]
async fn send_to_agent(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    agent_id: String,
    message: String,
    auto_approve: Option<bool>,
) -> Result<(), String> {
    let (session_id, working_dir) = {
        let agents = state.agents.lock().await;
        let agent = agents.get(&agent_id).ok_or("Agent not found")?;
        (agent.session_id.clone(), agent.info.working_dir.clone())
    };

    let session = session_id.ok_or("No session ID yet — agent may still be starting")?;

    // Update status to running
    {
        let mut agents = state.agents.lock().await;
        if let Some(agent) = agents.get_mut(&agent_id) {
            agent.info.status = "running".into();
        }
    }

    spawn_claude_stream(
        app,
        state.agents.clone(),
        agent_id,
        message,
        working_dir,
        Some(session),
        auto_approve.unwrap_or(false),
    );

    Ok(())
}

#[tauri::command]
async fn list_agents(state: State<'_, AppState>) -> Result<Vec<AgentInfo>, String> {
    let agents = state.agents.lock().await;
    Ok(agents.values().map(|a| a.info.clone()).collect())
}

#[tauri::command]
async fn stop_agent(state: State<'_, AppState>, agent_id: String) -> Result<(), String> {
    let mut agents = state.agents.lock().await;
    if let Some(agent) = agents.get_mut(&agent_id) {
        agent.info.status = "stopped".into();
    }
    Ok(())
}

#[tauri::command]
async fn get_project_files(path: String) -> Result<Vec<FileEntry>, String> {
    let mut entries = Vec::new();
    read_dir_recursive(&path, &mut entries, 0, 3).map_err(|e| e.to_string())?;
    Ok(entries)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub children: Option<Vec<FileEntry>>,
}

#[tauri::command]
async fn get_dir_children(path: String) -> Result<Vec<FileEntry>, String> {
    let mut entries = Vec::new();
    read_dir_single(&path, &mut entries).map_err(|e| e.to_string())?;
    Ok(entries)
}

fn read_dir_single(path: &str, entries: &mut Vec<FileEntry>) -> Result<(), std::io::Error> {
    let mut dir_entries: Vec<_> = std::fs::read_dir(path)?
        .filter_map(|e| e.ok())
        .collect();
    dir_entries.sort_by_key(|e| e.file_name());

    for entry in dir_entries {
        let name = entry.file_name().to_string_lossy().to_string();
        if name.starts_with('.') || name == "node_modules" || name == "target" {
            continue;
        }
        let file_path = entry.path().to_string_lossy().to_string();
        let is_dir = entry.file_type().map(|t| t.is_dir()).unwrap_or(false);
        entries.push(FileEntry {
            name,
            path: file_path,
            is_dir,
            children: if is_dir { Some(vec![]) } else { None },
        });
    }
    Ok(())
}

fn read_dir_recursive(
    path: &str,
    entries: &mut Vec<FileEntry>,
    depth: usize,
    max_depth: usize,
) -> Result<(), std::io::Error> {
    if depth >= max_depth {
        return Ok(());
    }

    let mut dir_entries: Vec<_> = std::fs::read_dir(path)?
        .filter_map(|e| e.ok())
        .collect();
    dir_entries.sort_by_key(|e| e.file_name());

    for entry in dir_entries {
        let name = entry.file_name().to_string_lossy().to_string();

        if name.starts_with('.') || name == "node_modules" || name == "target" {
            continue;
        }

        let file_path = entry.path().to_string_lossy().to_string();
        let is_dir = entry.file_type().map(|t| t.is_dir()).unwrap_or(false);

        let children = if is_dir {
            let mut child_entries = Vec::new();
            let _ = read_dir_recursive(&file_path, &mut child_entries, depth + 1, max_depth);
            Some(child_entries)
        } else {
            None
        };

        entries.push(FileEntry {
            name,
            path: file_path,
            is_dir,
            children,
        });
    }
    Ok(())
}

#[tauri::command]
async fn run_shell_command(command: String, args: Vec<String>) -> Result<String, String> {
    let output = Command::new(&command)
        .args(&args)
        .output()
        .await
        .map_err(|e| format!("Failed to run {}: {}", command, e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();
        Err(format!("{} error: {}", command, stderr))
    }
}

#[tauri::command]
async fn run_ruflo_command(args: Vec<String>) -> Result<String, String> {
    let output = Command::new("ruflo")
        .args(&args)
        .output()
        .await
        .map_err(|e| format!("Failed to run ruflo: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();
        Err(format!("Ruflo error: {}", stderr))
    }
}

#[tauri::command]
async fn open_terminal(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    cwd: Option<String>,
) -> Result<(), String> {
    let pty_system = native_pty_system();
    let pair = pty_system
        .openpty(PtySize {
            rows: 24,
            cols: 80,
            pixel_width: 0,
            pixel_height: 0,
        })
        .map_err(|e| format!("Failed to open PTY: {}", e))?;

    let (shell, login_arg) = if cfg!(target_os = "windows") {
        (std::env::var("COMSPEC").unwrap_or_else(|_| "cmd.exe".to_string()), None)
    } else {
        (std::env::var("SHELL").unwrap_or_else(|_| "/bin/bash".to_string()), Some("--login"))
    };
    let mut cmd = CommandBuilder::new(&shell);
    if let Some(arg) = login_arg {
        cmd.arg(arg);
    }
    if let Some(ref dir) = cwd {
        cmd.cwd(dir);
    }

    let _child = pair
        .slave
        .spawn_command(cmd)
        .map_err(|e| format!("Failed to spawn shell: {}", e))?;

    // Store writer for input
    let writer = pair.master.take_writer().map_err(|e| format!("Failed to get writer: {}", e))?;
    {
        let mut w = state.pty_writer.lock().await;
        *w = Some(writer);
    }

    // Read output in background thread
    let mut reader = pair.master.try_clone_reader().map_err(|e| format!("Failed to get reader: {}", e))?;
    let app_handle = app.clone();

    std::thread::spawn(move || {
        let mut buf = [0u8; 4096];
        loop {
            match reader.read(&mut buf) {
                Ok(0) => break,
                Ok(n) => {
                    let data = String::from_utf8_lossy(&buf[..n]).to_string();
                    let _ = app_handle.emit("terminal-output", &data);
                }
                Err(_) => break,
            }
        }
    });

    Ok(())
}

#[tauri::command]
async fn write_terminal(
    state: State<'_, AppState>,
    data: String,
) -> Result<(), String> {
    let mut writer = state.pty_writer.lock().await;
    if let Some(ref mut w) = *writer {
        w.write_all(data.as_bytes()).map_err(|e| e.to_string())?;
        w.flush().map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("Terminal not open".into())
    }
}

#[tauri::command]
async fn resize_terminal(
    _state: State<'_, AppState>,
    _rows: u16,
    _cols: u16,
) -> Result<(), String> {
    // TODO: resize PTY
    Ok(())
}

#[tauri::command]
async fn get_home_dir() -> Result<String, String> {
    std::env::var("HOME")
        .or_else(|_| std::env::var("USERPROFILE"))
        .map_err(|_| "Cannot determine home directory".into())
}

#[tauri::command]
async fn get_platform() -> Result<String, String> {
    Ok(std::env::consts::OS.to_string())
}

#[tauri::command]
async fn read_file_content(path: String) -> Result<String, String> {
    tokio::fs::read_to_string(&path)
        .await
        .map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
async fn write_file_content(path: String, content: String) -> Result<(), String> {
    tokio::fs::write(&path, &content)
        .await
        .map_err(|e| format!("Failed to write file: {}", e))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            spawn_agent,
            list_agents,
            stop_agent,
            send_to_agent,
            run_shell_command,
            run_ruflo_command,
            open_terminal,
            write_terminal,
            resize_terminal,
            get_home_dir,
            get_platform,
            get_project_files,
            get_dir_children,
            read_file_content,
            write_file_content,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
