export interface LogContext {
  requestId?: string;
  scope?: string;
  [key: string]: unknown;
}

export class LoggerService {
  private formatLog(level: 'INFO' | 'WARN' | 'ERROR', message: string, context?: LogContext) {
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

  public warn(message: string, context?: LogContext) {
    if (__DEV__) {
      console.warn(this.formatLog('WARN', message, context), context ? JSON.stringify(context) : '');
    }
  }

  public error(message: string, error?: unknown, context?: LogContext) {
    const formatted = this.formatLog('ERROR', message, context);
    console.error(formatted, error || '');

    // Observability Integration Gate (Sentry / Datadog in production)
    if (!__DEV__) {
      // In production builds, this feeds telemetry loggers like Sentry.captureException(error)
    }
  }
}

export const logger = new LoggerService();
