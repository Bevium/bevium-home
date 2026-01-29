import UnrealLogParserWorker from "@/workers/unrealLogParser.worker?worker";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LogEntry, LogVerbosity, ParseResult } from "./types";

function toDateInputValue(ts: number) {
  const d = new Date(ts);
  const yyyy = String(d.getFullYear()).padStart(4, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function startOfDayMs(dateStr: string) {
  const [Y, M, D] = dateStr.split("-").map(Number);
  return new Date(Y, (M || 1) - 1, D || 1, 0, 0, 0, 0).getTime();
}
function endOfDayMs(dateStr: string) {
  const [Y, M, D] = dateStr.split("-").map(Number);
  return new Date(Y, (M || 1) - 1, D || 1, 23, 59, 59, 999).getTime();
}

export function useUnrealLogParser() {
  const workerRef = useRef<Worker | null>(null);

  const [rawText, setRawText] = useState("");
  const [parsing, setParsing] = useState(false);

  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [verbosities, setVerbosities] = useState<LogVerbosity[]>([]);
  const [hasTimestamps, setHasTimestamps] = useState(false);

  const [query, setQuery] = useState("");
  const [activeCats, setActiveCats] = useState<Set<string>>(new Set());
  const [activeVerb, setActiveVerb] = useState<Set<LogVerbosity>>(new Set());

  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const [excludedCats, setExcludedCats] = useState<Set<string>>(new Set());

  useEffect(() => {
    const w = new UnrealLogParserWorker();
    workerRef.current = w;

    w.onmessage = (ev: MessageEvent<ParseResult>) => {
      const res = ev.data;

      setQuery("");
      setActiveCats(new Set());
      setExcludedCats(new Set());

      setEntries(res.entries);
      setCategories(res.categories);
      setVerbosities(res.verbosities);
      setHasTimestamps(res.hasTimestamps);

      // default: everything except VeryVerbose
      setActiveVerb(new Set());

      // date defaults if timestamps exist
      if (res.hasTimestamps) {
        const ts = res.entries.map((e) => e.ts).filter((x): x is number => typeof x === "number");
        if (ts.length) {
          ts.sort((a, b) => a - b);
          setFromDate(toDateInputValue(ts[0]));
          setToDate(toDateInputValue(ts[ts.length - 1]));
        }
      } else {
        setFromDate("");
        setToDate("");
      }

      setParsing(false);
    };

    w.onerror = (err) => {
      console.error("[UnrealLogParserWorker] error", err);
      setParsing(false);
    };

    w.onmessageerror = (err) => {
      console.error("[UnrealLogParserWorker] messageerror", err);
      setParsing(false);
    };

    return () => {
      w.terminate();
      workerRef.current = null;
    };
  }, []);

  const parseText = (text: string) => {
    const w = workerRef.current;
    if (!w) return;
    setParsing(true);
    w.postMessage({ text });
  };

  const setText = (text: string, opts?: { autoParse?: boolean }) => {
    setRawText(text);
    if (opts?.autoParse) parseText(text);
  };

  const clearAll = () => {
    setRawText("");
    setEntries([]);
    setCategories([]);
    setVerbosities([]);
    setHasTimestamps(false);

    setQuery("");
    setActiveCats(new Set());
    setActiveVerb(new Set());
    setFromDate("");
    setToDate("");

    setExcludedCats(new Set());
  };

  const filteredIndexes = useMemo(() => {

    const q = query.trim().toLowerCase();
    const hasCatFilter = activeCats.size > 0;
    const hasVerbFilter = activeVerb.size > 0;
    const hasExcluded = excludedCats.size > 0;

    const fromMs = hasTimestamps && fromDate ? startOfDayMs(fromDate) : undefined;
    const toMs = hasTimestamps && toDate ? endOfDayMs(toDate) : undefined;

    const out: number[] = [];
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      const c = e.category || "";

      if (hasExcluded && excludedCats.has(c)) continue;

      if (hasVerbFilter && !activeVerb.has(e.verbosity)) continue;

      if (hasCatFilter) {
        if (!activeCats.has(c)) continue;
      }

      if (fromMs != null || toMs != null) {
        if (typeof e.ts !== "number") continue;
        if (fromMs != null && e.ts < fromMs) continue;
        if (toMs != null && e.ts > toMs) continue;
      }

      if (q) {
        const hay = `${e.category ?? ""} ${e.verbosity} ${e.message}`.toLowerCase();
        if (!hay.includes(q)) continue;
      }

      out.push(i);
    }
    return out;
  }, [entries, query, activeCats, activeVerb, fromDate, toDate, hasTimestamps, excludedCats]);

  // Actions
  const toggleCat = (c: string) =>
    setActiveCats((prev) => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });

  const toggleVerb = (v: LogVerbosity) =>
    setActiveVerb((prev) => {
      const next = new Set(prev);
      next.has(v) ? next.delete(v) : next.add(v);
      return next;
    });

  const setCatsAll = () => setActiveCats(new Set());
  const setVerbAll = () => setActiveVerb(new Set(verbosities));
  const quickErrorsWarnings = () => setActiveVerb(new Set<LogVerbosity>(["Fatal", "Error", "Warning"]));

  const excludeCategory = (c: string) =>
    setExcludedCats((prev) => {
      const next = new Set(prev);
      next.add(c);
      return next;
    });

  const unexcludeCategory = (c: string) =>
    setExcludedCats((prev) => {
      const next = new Set(prev);
      next.delete(c);
      return next;
    });

  const clearExcludedCats = () => setExcludedCats(new Set());

  return {
    // state
    rawText,
    parsing,
    entries,
    categories,
    verbosities,
    hasTimestamps,

    query,
    setQuery,
    activeCats,
    activeVerb,
    fromDate,
    toDate,
    setFromDate,
    setToDate,

    excludedCats,

    // derived
    filteredIndexes,

    // actions
    setText,
    parseText,
    clearAll,
    toggleCat,
    toggleVerb,
    setCatsAll,
    setVerbAll,
    quickErrorsWarnings,

    excludeCategory,
    unexcludeCategory,
    clearExcludedCats,
  };
}
