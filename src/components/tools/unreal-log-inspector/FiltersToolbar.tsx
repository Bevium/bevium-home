import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, Calendar, X } from "lucide-react";
import type { LogVerbosity } from "./types";

export function FiltersToolbar(props: {
  // search
  query: string;
  setQuery: (v: string) => void;

  // verbosities
  verbosities: LogVerbosity[];
  activeVerb: Set<LogVerbosity>;
  toggleVerb: (v: LogVerbosity) => void;
  setVerbAll: () => void;
  quickErrorsWarnings: () => void;

  // dates
  hasTimestamps: boolean;
  fromDate: string;
  toDate: string;
  setFromDate: (v: string) => void;
  setToDate: (v: string) => void;

  // excluded chips (quick clear/remove)
  excludedCats: Set<string>;
  unexcludeCategory: (c: string) => void;
  clearExcludedCats: () => void;

  // meta
  shown: number;
  total: number;

  // advanced toggle
  advancedOpen: boolean;
  setAdvancedOpen: (v: boolean) => void;

  clearAllFilters: () => void;
}) {
  const {
    query,
    setQuery,
    verbosities,
    activeVerb,
    toggleVerb,
    setVerbAll,
    quickErrorsWarnings,
    hasTimestamps,
    fromDate,
    toDate,
    setFromDate,
    setToDate,
    excludedCats,
    unexcludeCategory,
    clearExcludedCats,
    shown,
    total,
    advancedOpen,
    setAdvancedOpen,
    clearAllFilters
  } = props;

  const excludedList = Array.from(excludedCats).sort((a, b) => a.localeCompare(b));

  return (
    <div className="gaming-card rounded-2xl border border-primary/20 bg-card/50 backdrop-blur p-4 md:p-5">
      {/* top row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Showing <span className="text-foreground font-medium">{shown}</span> /{" "}
            <span className="text-foreground font-medium">{total}</span>
          </span>
        </div>

        <Button variant="outline" size="sm" onClick={clearAllFilters}>
          Clear all filters
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setAdvancedOpen(!advancedOpen)}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {advancedOpen ? "Hide advanced" : "Advanced filters"}
        </Button>
      </div>

      {/* search + date */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search (category, verbosity, message)…"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className={`lg:col-span-6 grid grid-cols-2 gap-3 ${!hasTimestamps ? "opacity-50 pointer-events-none" : ""}`}>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="date"
              className="pl-9"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              title="From date"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="date"
              className="pl-9"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              title="To date"
            />
          </div>
        </div>
      </div>

      {/* verbosity row */}
      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <Button size="sm" variant="outline" onClick={setVerbAll}>
          Verbosity: All
        </Button>
        <Button size="sm" variant="outline" onClick={quickErrorsWarnings}>
          Errors/Warnings
        </Button>

        <div className="flex flex-wrap gap-2">
          {verbosities.map((v) => {
            const on = activeVerb.has(v);
            return (
              <Badge
                key={v}
                variant={on ? "secondary" : "outline"}
                className={`cursor-pointer ${on ? "border-primary/40" : ""}`}
                onClick={() => toggleVerb(v)}
              >
                {v}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* excluded chips quick strip */}
      {excludedList.length > 0 && (
        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Excluded:</span>
            {excludedList.slice(0, 8).map((c) => (
              <Badge
                key={c}
                variant="secondary"
                className="cursor-pointer border border-primary/20"
                onClick={() => unexcludeCategory(c)}
                title="Click to unexclude"
              >
                {c}
                <X className="w-3 h-3 ml-1 opacity-70" />
              </Badge>
            ))}
            {excludedList.length > 8 && (
              <span className="text-xs text-muted-foreground">+{excludedList.length - 8} more</span>
            )}
          </div>

          <Button size="sm" variant="outline" onClick={clearExcludedCats}>
            Clear excluded
          </Button>
        </div>
      )}
    </div>
  );
}
