import { useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Sun, Moon, Minus } from "lucide-react";
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
  // keep it compact-ish; you can change to toLocaleString() if you prefer
  return new Date(ts).toLocaleString();
}

export function ResultsPane(props: {
  entries: LogEntry[];
  filteredIndexes: number[];
  hasTimestamps: boolean;
  onExcludeCategory: (category: string) => void;
}) {
  const { entries, filteredIndexes, onExcludeCategory, hasTimestamps } = props;

  const [showTimestamps, setShowTimestamps] = useState(true);
  const [viewMode, setViewMode] = useState<"dark" | "light">("dark");

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

  // When timestamps are shown, use normalized text to avoid duplicating timestamps from e.raw
  const buildDisplayLine = (e: LogEntry) => {
    if (!showTimestamps) return e.raw;

    const cat = e.category;
    const v = e.verbosity && e.verbosity !== "Unknown" ? e.verbosity : "";
    const prefix =
      (cat ? `${cat}: ` : "") +
      (v ? `${v}: ` : "");

    // message already excludes the timestamp/header in your parser
    return `${prefix}${e.message}`;
  };

  return (
    <Card className="gaming-card">
      <CardHeader>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>Results</CardTitle>
            <CardDescription>
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
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

                const displayLine = buildDisplayLine(e);
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
                      <div className={`w-[150px] shrink-0 select-none pt-[2px] ${lineNoClass}`}>
                        {formatTs(e.ts)}
                      </div>
                    )}

                    {/* line text */}
                    <div className="min-w-0 flex-1 whitespace-pre-wrap break-words leading-5">
                      {displayLine}
                    </div>

                    {/* actions cluster (appears on hover) */}
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
                        onClick={() => void copyText(displayLine)}
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
