import { useEffect, useMemo, useRef, useState, useCallback } from "react";
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

import {
  Copy,
  Sun,
  Moon,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  AlertTriangle,
  CornerDownLeft,
  Filter,
  Plus,
} from "lucide-react";
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
  const s = (v ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function isTypingTarget(t: EventTarget | null) {
  const el = t as HTMLElement | null;
  if (!el) return false;
  const tag = (el.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if ((el as any).isContentEditable) return true;
  return false;
}

export function ResultsPane(props: {
  entries: LogEntry[];
  filteredIndexes: number[];
  hasTimestamps: boolean;

  navTargetPos: number | null;
  navCurrent: number;
  navTotal: number;
  navLabel: string;
  navNext: (scope?: "error" | "warn") => void;
  navPrev: (scope?: "error" | "warn") => void;
  navGoToLine: (line1Based: number) => boolean;

  onExcludeCategory: (category: string) => void;

  // quick filters
  onlyCategory: (c: string) => void;
  toggleIncludeCategory: (c: string) => void;
  onlyVerbosity: (v: LogEntry["verbosity"]) => void;
  toggleIncludeVerbosity: (v: LogEntry["verbosity"]) => void;
}) {
  const {
    entries,
    filteredIndexes,
    hasTimestamps,

    navTargetPos,
    navCurrent,
    navTotal,
    navLabel,
    navNext,
    navPrev,
    navGoToLine,

    onExcludeCategory,

    onlyCategory,
    toggleIncludeCategory,
    onlyVerbosity,
    toggleIncludeVerbosity,
  } = props;

  const [showTimestamps, setShowTimestamps] = useState(false);
  const [viewMode, setViewMode] = useState<"dark" | "light">("dark");

  // Export options
  const [exportUseFull, setExportUseFull] = useState(true);
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

  const highlightClass =
    viewMode === "dark"
      ? "bg-amber-500/10 ring-1 ring-amber-500/40"
      : "bg-amber-500/15 ring-1 ring-amber-500/40";

  // -------- Export builders (filtered only) --------
  const filteredEntries = useMemo(
    () => filteredIndexes.map((idx) => entries[idx]).filter(Boolean),
    [filteredIndexes, entries]
  );

  function getExportLine(e: LogEntry) {
    const base = exportUseFull ? (e.full ?? e.raw) : e.raw;

    if (exportUseFull) return base;

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
    await copyText(buildTxt());
  }

  function onDownloadTxt() {
    downloadFile("unreal-log-filtered.txt", "text/plain;charset=utf-8", buildTxt());
  }

  function onDownloadCsv() {
    downloadFile("unreal-log-filtered.csv", "text/csv;charset=utf-8", buildCsv());
  }

  // -------- Navigator: scroll + keyboard --------
  useEffect(() => {
    if (navTargetPos == null) return;
    if (navTargetPos < 0 || navTargetPos >= filteredIndexes.length) return;
    rowVirtualizer.scrollToIndex(navTargetPos, { align: "center" });
  }, [navTargetPos, filteredIndexes.length, rowVirtualizer]);

  const goToLinePrompt = useCallback(() => {
    const s = window.prompt("Go to line (1-based):");
    if (!s) return;
    const n = Number(String(s).trim());
    if (!Number.isFinite(n) || n <= 0) return;

    const ok = navGoToLine(Math.floor(n));
    if (!ok) console.warn("[LogInspector] line not in filtered view:", n);
  }, [navGoToLine]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key;

      if (key === "n" || key === "N") {
        e.preventDefault();
        navNext(e.shiftKey ? "warn" : "error");
        return;
      }
      if (key === "p" || key === "P") {
        e.preventDefault();
        navPrev(e.shiftKey ? "warn" : "error");
        return;
      }
      if (key === "g" || key === "G") {
        e.preventDefault();
        goToLinePrompt();
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navNext, navPrev, goToLinePrompt]);

  return (
    <Card className="gaming-card">
      <CardHeader>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>Results</CardTitle>
            <CardDescription />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* --- Error navigator cluster --- */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                {navLabel === "Warn+" ? <AlertTriangle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>
                  {navTotal > 0 ? (
                    <>
                      {navLabel} <span className="text-foreground font-medium">{navCurrent}</span> /{" "}
                      <span className="text-foreground font-medium">{navTotal}</span>
                    </>
                  ) : (
                    <>
                      {navLabel} <span className="text-foreground font-medium">0</span>
                    </>
                  )}
                </span>
              </div>

              <Button size="sm" variant="outline" disabled={navTotal === 0} className="gap-2" onClick={() => navPrev()} title="Prev (p). Shift+p = Warn+">
                <ChevronLeft className="w-4 h-4" />
                Prev
              </Button>

              <Button size="sm" variant="outline" disabled={navTotal === 0} className="gap-2" onClick={() => navNext()} title="Next (n). Shift+n = Warn+">
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>

              <Button size="sm" variant="outline" className="gap-2" onClick={goToLinePrompt} title="Go to line (g)">
                <CornerDownLeft className="w-4 h-4" />
                Go
              </Button>

              <Button size="sm" variant="outline" disabled={navTotal === 0} onClick={() => navNext("error")} title="Switch to Error-only nav">
                Error
              </Button>

              <Button size="sm" variant="outline" disabled={navTotal === 0} onClick={() => navNext("warn")} title="Switch to Warn+ nav">
                Warn+
              </Button>
            </div>

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

                <DropdownMenuCheckboxItem checked={exportUseFull} onCheckedChange={(v) => setExportUseFull(Boolean(v))}>
                  Use full lines (original)
                </DropdownMenuCheckboxItem>

                <DropdownMenuCheckboxItem checked={exportIncludeTs} onCheckedChange={(v) => setExportIncludeTs(Boolean(v))} disabled={!hasTimestamps}>
                  Include timestamps
                </DropdownMenuCheckboxItem>

                <DropdownMenuCheckboxItem checked={exportIncludeFrame} onCheckedChange={(v) => setExportIncludeFrame(Boolean(v))}>
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
            <Button variant="outline" size="sm" disabled={!hasTimestamps} onClick={() => setShowTimestamps((v) => !v)} title={!hasTimestamps ? "No timestamps detected in this log" : "Toggle timestamps column"}>
              {showTimestamps ? "Hide timestamps" : "Show timestamps"}
            </Button>

            <Button variant="outline" size="sm" className="gap-2" onClick={() => setViewMode((m) => (m === "dark" ? "light" : "dark"))} title="Toggle viewer theme">
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
                const line = e?.raw ?? "";
                const cat = e?.category ?? "";
                const verb = e?.verbosity;
                const isTarget = navTargetPos != null && vi.index === navTargetPos;

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
                    className={`group flex items-start gap-3 px-3 ${hoverBg} ${isTarget ? highlightClass : ""}`}
                  >
                    {/* line number */}
                    <div className={`w-16 shrink-0 select-none text-right pt-[2px] ${lineNoClass}`}>
                      {entryIndex + 1}
                    </div>

                    {/* timestamp column */}
                    {showTimestamps && (
                      <div className={`w-[220px] shrink-0 select-none pt-[2px] ${lineNoClass}`}>
                        {formatTs(e?.ts)}
                      </div>
                    )}

                    {/* line text */}
                    <div className="min-w-0 flex-1 whitespace-pre-wrap break-words leading-5">{line}</div>

                    {/* actions cluster */}
                    <div className={`shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-md ${actionBg}`}>
                      {/* Filter menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="outline" className="h-7 w-7" title="Filter…">
                            <Filter className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Filter</DropdownMenuLabel>

                          {cat && (
                            <>
                              <DropdownMenuItem onClick={() => onlyCategory(cat)}>
                                Only category: {cat}
                              </DropdownMenuItem>

                              <DropdownMenuItem onClick={() => onExcludeCategory(cat)}>
                                Exclude category: {cat}
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />
                            </>
                          )}

                          {verb && verb !== "Unknown" && (
                            <DropdownMenuItem onClick={() => onlyVerbosity(verb)}>
                              Only verbosity: {verb}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Add/toggle menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="outline" className="h-7 w-7" title="Add…">
                            <Plus className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Add / Toggle</DropdownMenuLabel>

                          {cat && (
                            <DropdownMenuItem onClick={() => toggleIncludeCategory(cat)}>
                              Toggle include category: {cat}
                            </DropdownMenuItem>
                          )}

                          {verb && verb !== "Unknown" && (
                            <DropdownMenuItem onClick={() => toggleIncludeVerbosity(verb)}>
                              Toggle include verbosity: {verb}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Copy */}
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => void copyText(line)} title="Copy line">
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
