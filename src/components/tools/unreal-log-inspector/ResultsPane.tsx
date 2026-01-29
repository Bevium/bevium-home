import { useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Copy, Sun, Moon, Minus, Download, Share2 } from "lucide-react";
import type { LogEntry } from "./types";

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // ignore
  }
}

function formatTs(ts?: number) {
  if (typeof ts !== "number") return "";
  return new Date(ts).toISOString(); // stable for exporting
}

function downloadFile(filename: string, mime: string, content: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function csvEscape(v: string) {
  // Quote if needed; also normalize CRLF
  const s = (v ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function ResultsPane(props: {
  entries: LogEntry[];
  filteredIndexes: number[];
  hasTimestamps: boolean;
  onExcludeCategory: (category: string) => void;
}) {
  const { entries, filteredIndexes, onExcludeCategory, hasTimestamps } = props;

  const [showTimestamps, setShowTimestamps] = useState(false);
  const [viewMode, setViewMode] = useState<"dark" | "light">("dark");

  // Export options
  const [exportUseFull, setExportUseFull] = useState(true); // default: original UE line
  const [exportIncludeTs, setExportIncludeTs] = useState(true);
  const [exportIncludeFrame, setExportIncludeFrame] = useState(false);

  const parentRef = useRef<HTMLDivElement | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: filteredIndexes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 24,
    overscan: 30,
  });

  const viewerClass =
    viewMode === "dark"
      ? "bg-zinc-950 text-zinc-100 border-zinc-800"
      : "bg-white text-zinc-900 border-zinc-200";

  const lineNoClass = viewMode === "dark" ? "text-zinc-500" : "text-zinc-400";
  const hoverBg = viewMode === "dark" ? "hover:bg-zinc-900/60" : "hover:bg-zinc-100/70";
  const actionBg = viewMode === "dark" ? "bg-zinc-950/60" : "bg-white/70";

  // -------- Export builders (filtered only) --------
  const filteredEntries = useMemo(
    () => filteredIndexes.map((idx) => entries[idx]).filter(Boolean),
    [filteredIndexes, entries]
  );

  function getExportLine(e: LogEntry) {
    const base = exportUseFull ? (e.full ?? e.raw) : e.raw;

    if (exportUseFull) return base; // full already contains timestamp/frame if present

    // stripped export: optionally prefix metadata
    const parts: string[] = [];
    if (exportIncludeTs && typeof e.ts === "number") parts.push(`[${formatTs(e.ts)}]`);
    if (exportIncludeFrame && typeof e.frame === "number") parts.push(`[${e.frame}]`);
    return (parts.length ? parts.join("") + " " : "") + base;
  }

  function buildTxt() {
    return filteredEntries.map(getExportLine).join("\n");
  }

  function buildCsv() {
    const cols = [
      exportIncludeTs ? "timestamp" : null,
      exportIncludeFrame ? "frame" : null,
      "category",
      "verbosity",
      exportUseFull ? "line" : "message",
    ].filter(Boolean) as string[];

    const header = cols.join(",");

    const rows = filteredEntries.map((e) => {
      const cells: string[] = [];
      if (exportIncludeTs) cells.push(csvEscape(formatTs(e.ts)));
      if (exportIncludeFrame) cells.push(csvEscape(typeof e.frame === "number" ? String(e.frame) : ""));
      cells.push(csvEscape(e.category ?? ""));
      cells.push(csvEscape(e.verbosity ?? ""));
      cells.push(csvEscape(exportUseFull ? (e.full ?? e.raw) : e.message ?? e.raw));
      return cells.join(",");
    });

    return header + "\n" + rows.join("\n");
  }

  async function onCopyFiltered() {
    const txt = buildTxt();
    await copyText(txt);
  }

  function onDownloadTxt() {
    const txt = buildTxt();
    downloadFile("unreal-log-filtered.txt", "text/plain;charset=utf-8", txt);
  }

  function onDownloadCsv() {
    const csv = buildCsv();
    downloadFile("unreal-log-filtered.csv", "text/csv;charset=utf-8", csv);
  }

  return (
    <Card className="gaming-card">
      <CardHeader>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>Results</CardTitle>
            <CardDescription></CardDescription>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Export dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Export options</DropdownMenuLabel>

                <DropdownMenuCheckboxItem
                  checked={exportUseFull}
                  onCheckedChange={(v) => setExportUseFull(Boolean(v))}
                >
                  Use full lines (original)
                </DropdownMenuCheckboxItem>

                <DropdownMenuCheckboxItem
                  checked={exportIncludeTs}
                  onCheckedChange={(v) => setExportIncludeTs(Boolean(v))}
                  disabled={!hasTimestamps}
                >
                  Include timestamps
                </DropdownMenuCheckboxItem>

                <DropdownMenuCheckboxItem
                  checked={exportIncludeFrame}
                  onCheckedChange={(v) => setExportIncludeFrame(Boolean(v))}
                >
                  Include frame
                </DropdownMenuCheckboxItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={onCopyFiltered}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy filtered (TXT)
                </DropdownMenuItem>

                <DropdownMenuItem onClick={onDownloadTxt}>
                  <Download className="w-4 h-4 mr-2" />
                  Download .txt
                </DropdownMenuItem>

                <DropdownMenuItem onClick={onDownloadCsv}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Download .csv
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Existing toggles */}
            <Button
              variant="outline"
              size="sm"
              disabled={!hasTimestamps}
              onClick={() => setShowTimestamps((v) => !v)}
              title={!hasTimestamps ? "No timestamps detected in this log" : "Toggle timestamps column"}
            >
              {showTimestamps ? "Hide timestamps" : "Show timestamps"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setViewMode((m) => (m === "dark" ? "light" : "dark"))}
              title="Toggle viewer theme"
            >
              {viewMode === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              {viewMode === "dark" ? "Dark" : "Light"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredIndexes.length === 0 ? (
          <div className="text-center text-muted-foreground py-16">
            {entries.length === 0 ? "Parse a log to see results." : "No entries match your filters."}
          </div>
        ) : (
          <div ref={parentRef} className={`h-[640px] overflow-auto rounded-xl border ${viewerClass}`}>
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
              className="font-mono text-xs"
            >
              {rowVirtualizer.getVirtualItems().map((vi) => {
                const entryIndex = filteredIndexes[vi.index];
                const e = entries[entryIndex];
                const line = e.raw;
                const cat = e.category;

                return (
                  <div
                    key={vi.key}
                    ref={rowVirtualizer.measureElement}
                    data-index={vi.index}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${vi.start}px)`,
                    }}
                    className={`group flex items-start gap-3 px-3 ${hoverBg}`}
                  >
                    {/* line number */}
                    <div className={`w-16 shrink-0 select-none text-right pt-[2px] ${lineNoClass}`}>
                      {entryIndex + 1}
                    </div>

                    {/* timestamp column */}
                    {showTimestamps && (
                      <div className={`w-[220px] shrink-0 select-none pt-[2px] ${lineNoClass}`}>
                        {formatTs(e.ts)}
                      </div>
                    )}

                    {/* line text */}
                    <div className="min-w-0 flex-1 whitespace-pre-wrap break-words leading-5">
                      {line}
                    </div>

                    {/* actions cluster */}
                    <div
                      className={`shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-md ${actionBg}`}
                    >
                      {cat && (
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7"
                          onClick={() => onExcludeCategory(cat)}
                          title={`Filter out category: ${cat}`}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                      )}

                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => void copyText(line)}
                        title="Copy line"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
