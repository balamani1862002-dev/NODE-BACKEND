export interface LogContext {
  [key: string]: unknown;
}

type LogLevel = 'INFO' | 'ERROR' | 'WARN' | 'DEBUG';

const formatLog = (level: LogLevel, message: string, context?: LogContext): string => {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${level}] ${message}${contextStr}`;
};

export const logger = {
  info: (message: string, context?: LogContext): void => {
    console.log(formatLog('INFO', message, context));
  },

  error: (message: string, context?: LogContext): void => {
    console.error(formatLog('ERROR', message, context));
  },

  warn: (message: string, context?: LogContext): void => {
    console.warn(formatLog('WARN', message, context));
  },

  debug: (message: string, context?: LogContext): void => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(formatLog('DEBUG', message, context));
    }
  },
};
