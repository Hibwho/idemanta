import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useEditorStore } from "../../stores/editorStore";
import { Search, FileCode, Loader2 } from "lucide-react";

interface SearchResult {
  file: string;
  line: number;
  text: string;
}

export function SearchPanel({ projectPath }: { projectPath: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const { openFile } = useEditorStore();

  const handleSearch = async () => {
    if (!query.trim() || !projectPath) return;
    setSearching(true);
    try {
      const includes = ["ts","tsx","js","jsx","rs","py","json","md","css","html","yaml","yml","toml","sh","txt"]
        .flatMap((ext) => ["--include", `*.${ext}`]);
      const rawLines = await invoke<string>("run_shell_command", {
        command: "grep",
        args: ["-rn", ...includes, "--", query, projectPath],
      });
      const parsed: SearchResult[] = rawLines
        .split("\n")
        .filter(Boolean)
        .slice(0, 100)
        .map((line) => {
          const match = line.match(/^(.+?):(\d+):(.*)$/);
          if (match) return { file: match[1], line: parseInt(match[2]), text: match[3].trim() };
          return null;
        })
        .filter(Boolean) as SearchResult[];
      setResults(parsed);
    } catch {
      setResults([]);
    }
    setSearching(false);
  };

  const handleClickResult = async (result: SearchResult) => {
    try {
      const content = await invoke<string>("read_file_content", { path: result.file });
      const name = result.file.split("/").pop() || result.file;
      openFile({ path: result.file, name, content, language: "", modified: false });
    } catch (e) {
      console.error("Failed to open:", e);
    }
  };

  // Group results by file
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.file]) acc[r.file] = [];
    acc[r.file].push(r);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-[var(--border)]">
        <div className="flex items-center gap-1.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-2 focus-within:border-[var(--accent)] transition-colors">
          <Search size={11} className="text-[var(--text-muted)] shrink-0" />
          <input
            className="w-full bg-transparent py-1.5 text-[11px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none cursor-text"
            placeholder="Search in files..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            autoFocus
          />
          {searching && <Loader2 size={11} className="text-[var(--accent)] animate-spin shrink-0" />}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {results.length === 0 && !searching && query && (
          <div className="px-4 py-4 text-[11px] text-[var(--text-muted)] text-center">
            No results. Press Enter to search.
          </div>
        )}
        {results.length === 0 && !searching && !query && (
          <div className="px-4 py-8 text-[11px] text-[var(--text-muted)] text-center">
            Type to search across project files
          </div>
        )}
        {Object.entries(grouped).map(([file, matches]) => (
          <div key={file} className="mb-3">
            {/* File header */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[var(--text-primary)] bg-[var(--bg-elevated)]/40 sticky top-0">
              <FileCode size={13} className="text-[var(--accent)] shrink-0" />
              <span className="truncate">{file.replace(projectPath + "/", "")}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-muted)] ml-auto shrink-0">
                {matches.length}
              </span>
            </div>
            {/* Results */}
            <div className="ml-3 border-l-2 border-[var(--border)]">
              {matches.map((m, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 px-3 py-1.5 text-[12px] cursor-pointer hover:bg-[var(--accent-glow)] transition-colors rounded-r-md ml-1"
                  onClick={() => handleClickResult(m)}
                >
                  <span className="text-[var(--text-muted)] font-mono text-[10px] shrink-0 w-8 text-right">
                    L{m.line}
                  </span>
                  <span className="text-[var(--text-secondary)] truncate leading-relaxed">
                    {m.text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi")).map((part, j) =>
                      part.toLowerCase() === query.toLowerCase() ? (
                        <span key={j} className="text-[var(--accent)] font-semibold bg-[var(--accent-glow)] rounded px-0.5">{part}</span>
                      ) : (
                        <span key={j}>{part}</span>
                      )
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {results.length > 0 && (
          <div className="px-3 py-2 text-[10px] text-[var(--text-muted)]">
            {results.length} results in {Object.keys(grouped).length} files
          </div>
        )}
      </div>
    </div>
  );
}
