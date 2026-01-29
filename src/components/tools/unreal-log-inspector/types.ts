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
  raw: string;
  ts?: number; // unix ms
  frame?: number;
  category?: string;
  verbosity: LogVerbosity;
  message: string;
};

export type ParseResult = {
  entries: LogEntry[];
  categories: string[];
  verbosities: LogVerbosity[];
  hasTimestamps: boolean;
};
