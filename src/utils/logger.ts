const LOG_LEVELS = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  silent: 5,
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

type LogContext = Record<string, unknown>;

interface Logger {
  trace(message: string, context?: LogContext): void;
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  setLevel(level: LogLevel): void;
  getLevel(): LogLevel;
}

function createLogger(initialLevel?: LogLevel): Logger {
  const isProd =
    typeof import.meta !== "undefined" && import.meta.env?.PROD === true;
  let currentLevel: LogLevel = initialLevel ?? (isProd ? "info" : "debug");

  function shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
  }

  function formatEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
  ): string {
    const timestamp = new Date().toISOString();
    const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    return context ? `${base} ${JSON.stringify(context)}` : base;
  }

  function log(
    level: LogLevel,
    message: string,
    context?: LogContext,
  ): void {
    if (!shouldLog(level)) return;

    const entry = formatEntry(level, message, context);

    switch (level) {
      case "error":
        console.error(entry); // eslint-disable-line no-console
        break;
      case "warn":
        console.warn(entry); // eslint-disable-line no-console
        break;
      case "trace":
      case "debug":
        console.debug(entry); // eslint-disable-line no-console
        break;
      default:
        console.info(entry); // eslint-disable-line no-console
    }
  }

  return {
    trace: (msg, ctx?) => log("trace", msg, ctx),
    debug: (msg, ctx?) => log("debug", msg, ctx),
    info: (msg, ctx?) => log("info", msg, ctx),
    warn: (msg, ctx?) => log("warn", msg, ctx),
    error: (msg, ctx?) => log("error", msg, ctx),
    setLevel: (level: LogLevel) => {
      currentLevel = level;
    },
    getLevel: () => currentLevel,
  };
}

export const logger = createLogger();
export { createLogger };
export type { Logger, LogLevel, LogContext };
