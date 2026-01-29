import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import type { LogEntry } from "./types";

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // ignore
  }
}

export function ResultsPane(props: {
  entries: LogEntry[];
  filteredIndexes: number[];
}) {
  const { entries, filteredIndexes } = props;

  const parentRef = useRef<HTMLDivElement | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: filteredIndexes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 22, // one-line log feel
    overscan: 30,
  });

  return (
    <Card className="gaming-card">
      <CardHeader>
        <CardTitle>Results</CardTitle>
        <CardDescription>
          Hover a line for copy.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {filteredIndexes.length === 0 ? (
          <div className="text-center text-muted-foreground py-16">
            {entries.length === 0 ? "Parse a log to see results." : "No entries match your filters."}
          </div>
        ) : (
          <div
            ref={parentRef}
            className="h-[640px] overflow-auto rounded-xl border border-primary/10 bg-background/30"
          >
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

                // If you want the *exact* original line, use e.raw.
                // For readability you might prefer e.raw anyway.
                const line = e.raw;

                return (
                  <div
                    key={vi.key}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${vi.start}px)`,
                    }}
                    className="group flex items-start gap-3 px-3"
                  >
                    {/* line number */}
                    <div className="w-16 shrink-0 select-none text-muted-foreground/70 text-right pt-[2px]">
                      {entryIndex + 1}
                    </div>

                    {/* log line */}
                    <div className="min-w-0 flex-1 whitespace-pre overflow-hidden text-foreground/90 leading-5">
                      {line}
                    </div>

                    {/* copy button (only on hover) */}
                    <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => void copyText(line)}
                        title="Copy line"
                      >
                        <Copy className="w-4 h-4" />
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
