import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Filter, Search as SearchIcon, Tag as TagIcon } from "lucide-react";
import type { LogVerbosity } from "./types";

export function FiltersPanel(props: {
  hasTimestamps: boolean;
  categories: string[];
  verbosities: LogVerbosity[];

  query: string;
  setQuery: (v: string) => void;

  fromDate: string;
  toDate: string;
  setFromDate: (v: string) => void;
  setToDate: (v: string) => void;

  activeCats: Set<string>;
  activeVerb: Set<LogVerbosity>;

  toggleCat: (c: string) => void;
  toggleVerb: (v: LogVerbosity) => void;

  setCatsAll: () => void;
  setVerbAll: () => void;
  quickErrorsWarnings: () => void;
}) {
  const {
    hasTimestamps,
    categories,
    verbosities,
    query,
    setQuery,
    fromDate,
    toDate,
    setFromDate,
    setToDate,
    activeCats,
    activeVerb,
    toggleCat,
    toggleVerb,
    setCatsAll,
    setVerbAll,
    quickErrorsWarnings,
  } = props;

  return (
    <Card className="gaming-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          Filters
        </CardTitle>
        <CardDescription>Category, verbosity, search and date range.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search (category, verbosity, message)…"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className={`grid grid-cols-2 gap-3 ${!hasTimestamps ? "opacity-50 pointer-events-none" : ""}`}>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              From
            </div>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              To
            </div>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <TagIcon className="w-4 h-4" />
              Verbosity
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={setVerbAll}>
                All
              </Button>
              <Button size="sm" variant="outline" onClick={quickErrorsWarnings}>
                Errors/Warnings
              </Button>
            </div>
          </div>

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

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <TagIcon className="w-4 h-4" />
              Categories ({categories.length})
            </div>
            <Button size="sm" variant="outline" onClick={setCatsAll}>
              Clear
            </Button>
          </div>

          <div className="max-h-[180px] overflow-auto pr-2 flex flex-wrap gap-2">
            {categories.map((c) => {
              const on = activeCats.has(c);
              return (
                <Badge
                  key={c}
                  variant={on ? "secondary" : "outline"}
                  className={`cursor-pointer ${on ? "border-primary/40" : ""}`}
                  onClick={() => toggleCat(c)}
                >
                  {c}
                </Badge>
              );
            })}
            {categories.length === 0 && (
              <div className="text-sm text-muted-foreground">Parse a log to discover categories.</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
