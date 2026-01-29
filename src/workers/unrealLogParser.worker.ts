export type LogVerbosity =
  | "VeryVerbose"
  | "Verbose"
  | "Display"
  | "Log"
  | "Warning"
  | "Error"
  | "Fatal"
  | "Unknown";

export type LogEntry = {
  id: number;

  // ✅ stripped line: no [time][frame] prefix
  raw: string;

  // ✅ original full line (optional but recommended)
  full?: string;

  ts?: number; // unix ms
  frame?: number;
  category?: string;
  verbosity: LogVerbosity;
  message: string;
};

type ParseResult = {
  entries: LogEntry[];
  categories: string[];
  verbosities: LogVerbosity[];
  hasTimestamps: boolean;
};

function parseUETimeToMs(s: string): number | undefined {
  const m1 = s.match(/^(\d{4})\.(\d{2})\.(\d{2})-(\d{2})\.(\d{2})\.(\d{2}):(\d{3})$/);
  if (m1) {
    const [, Y, Mo, D, h, mi, se, ms] = m1;
    return new Date(
      Number(Y),
      Number(Mo) - 1,
      Number(D),
      Number(h),
      Number(mi),
      Number(se),
      Number(ms)
    ).getTime();
  }

  const m2 = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})\.(\d{3})$/);
  if (m2) {
    const [, Y, Mo, D, h, mi, se, ms] = m2;
    return new Date(
      Number(Y),
      Number(Mo) - 1,
      Number(D),
      Number(h),
      Number(mi),
      Number(se),
      Number(ms)
    ).getTime();
  }

  return undefined;
}

function normalizeVerbosity(v?: string): LogVerbosity {
  const x = (v || "").trim();
  if (!x) return "Unknown";
  const known: LogVerbosity[] = ["VeryVerbose", "Verbose", "Display", "Log", "Warning", "Error", "Fatal"];
  const match = known.find((k) => k.toLowerCase() === x.toLowerCase());
  return match ?? "Unknown";
}

function parseLines(rawText: string): ParseResult {
  const lines = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");

  const entries: LogEntry[] = [];
  const cats = new Set<string>();
  const vers = new Set<LogVerbosity>();
  let hasTimestamps = false;

  // Typical UE line:
  // [2026.01.26-14.46.28:413][432]LogViewport: Display: Viewport ...
  const reFull =
    /^\[(?<time>[^\]]+)\]\[(?<frame>\d+)\](?<cat>[A-Za-z0-9_]+):\s*(?<verb>[A-Za-z]+):\s*(?<msg>.*)$/;

  // Simpler:
  // LogTemp: Warning: Hello
  const reSimple = /^(?<cat>[A-Za-z0-9_]+):\s*(?<verb>[A-Za-z]+):\s*(?<msg>.*)$/;

  // Continuation lines: stack traces, call stacks, indented blocks, etc.
  const isContinuation = (line: string) =>
    line.startsWith(" ") ||
    line.startsWith("\t") ||
    line.startsWith("    ") ||
    line.startsWith("0x") ||
    (line.startsWith("Log") === false && line.includes("!"));

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    let m = line.match(reFull);
    if (m?.groups) {
      const full = line;

      const timeStr = m.groups.time;
      const ts = parseUETimeToMs(timeStr);
      if (ts != null) hasTimestamps = true;

      const frame = Number(m.groups.frame);
      const category = m.groups.cat;
      const verbosity = normalizeVerbosity(m.groups.verb);
      const msg = m.groups.msg ?? "";

      // ✅ stripped raw
      const raw = `${category}: ${verbosity}: ${msg}`;

      const e: LogEntry = {
        id: entries.length,
        raw,
        full,
        ts,
        frame: Number.isFinite(frame) ? frame : undefined,
        category,
        verbosity,
        message: msg,
      };

      entries.push(e);
      cats.add(category);
      vers.add(verbosity);
      continue;
    }

    m = line.match(reSimple);
    if (m?.groups) {
      const full = line;

      const category = m.groups.cat;
      const verbosity = normalizeVerbosity(m.groups.verb);
      const msg = m.groups.msg ?? "";

      // ✅ already stripped enough
      const raw = `${category}: ${verbosity}: ${msg}`;

      const e: LogEntry = {
        id: entries.length,
        raw,
        full,
        category,
        verbosity,
        message: msg,
      };

      entries.push(e);
      cats.add(category);
      vers.add(verbosity);
      continue;
    }

    // Continuation: append to previous entry if it looks like a stack/extra line
    const last = entries[entries.length - 1];
    if (last && isContinuation(line)) {
      last.raw += "\n" + line;
      last.message += "\n" + line;

      // ✅ keep full in sync too
      last.full = (last.full ?? last.raw) + "\n" + line;
      continue;
    }

    // Fallback: unknown line becomes its own entry
    const e: LogEntry = {
      id: entries.length,
      raw: line,
      full: line,
      verbosity: "Unknown",
      message: line,
    };
    entries.push(e);
    vers.add("Unknown");
  }

  const categories = Array.from(cats).sort((a, b) => a.localeCompare(b));
  const verbosities = Array.from(vers);

  const order: LogVerbosity[] = ["Fatal", "Error", "Warning", "Display", "Log", "Verbose", "VeryVerbose", "Unknown"];
  verbosities.sort((a, b) => order.indexOf(a) - order.indexOf(b));

  return { entries, categories, verbosities, hasTimestamps };
}

self.onmessage = (ev: MessageEvent<{ text: string }>) => {
  const { text } = ev.data;
  const res = parseLines(text);
  // @ts-ignore
  self.postMessage(res);
};
