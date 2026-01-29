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
  full?: string;    
  ts?: number;
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
