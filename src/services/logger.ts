export interface LogContext {
  requestId?: string;
  scope?: string;
  [key: string]: unknown;
}

export class LoggerService {
  private formatLog(level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR', message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const reqIdStr = context?.requestId ? ` [ReqID: ${context.requestId}]` : '';
    const scopeStr = context?.scope ? ` [${context.scope}]` : '';
    return `[${timestamp}] [${level}]${scopeStr}${reqIdStr} ${message}`;
  }

  public info(message: string, context?: LogContext) {
    if (__DEV__) {
      console.log(this.formatLog('INFO', message, context), context ? JSON.stringify(context) : '');
    }
  }

  public debug(message: string, context?: LogContext) {
    if (__DEV__) {
      console.debug(this.formatLog('DEBUG', message, context), context ? JSON.stringify(context) : '');
    }
  }

  public warn(message: string, context?: LogContext) {
    if (__DEV__) {
      console.warn(this.formatLog('WARN', message, context), context ? JSON.stringify(context) : '');
    }
  }

  public error(message: string, error?: unknown, context?: LogContext) {
    const formatted = this.formatLog('ERROR', message, context);
    if (__DEV__) {
      console.error(formatted, error || '');
    }

    // Production Mobile has no external crash/analytics transport.
  }
}

export const logger = new LoggerService();
