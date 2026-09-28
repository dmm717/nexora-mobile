import { logger } from './logger';

export type EventName = 
  | 'login_success' 
  | 'login_failed' 
  | 'upload_cv_start' 
  | 'upload_cv_success'
  | 'interview_start'
  | 'interview_complete'
  | 'purchase_pro_success';

export interface AnalyticsEvent {
  name: EventName;
  params?: Record<string, string | number | boolean>;
  timestamp: string;
}

// Allowlist for safe keys
const SAFE_PARAM_KEYS = new Set([
  'method', 'error_code', 'duration_seconds', 'file_size', 'package_id', 'source'
]);

export type AnalyticsEventParams = {
  method?: string;
  error_code?: string;
  duration_seconds?: number;
  file_size?: number;
  package_id?: string;
  source?: string;
};

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private readonly MAX_QUEUE_SIZE = 100;
  private hasConsent: boolean = false; // Phase 4.12: Consent state

  public setConsent(granted: boolean): void {
    this.hasConsent = granted;
  }

  public logEvent(name: EventName, params?: AnalyticsEventParams): void {
    if (!this.hasConsent && !__DEV__) {
      return; // SECURITY (Phase 4.12): No-op if consent not granted in production
    }

    let safeParams: Record<string, string | number | boolean> | undefined;

    if (params) {
      safeParams = {};
      for (const [key, value] of Object.entries(params)) {
        if (SAFE_PARAM_KEYS.has(key) && value !== undefined) {
          safeParams[key] = value as string | number | boolean;
        }
      }
    }

    const event: AnalyticsEvent = {
      name,
      params: safeParams,
      timestamp: new Date().toISOString(),
    };
    
    // SECURITY & PERFORMANCE (Phase 4.12): Prevent memory leak by capping queue
    this.events.push(event);
    if (this.events.length > this.MAX_QUEUE_SIZE) {
      this.events.shift(); // Remove oldest event
    }

    if (__DEV__) {
      logger.info(`[Analytics] ${name}`, safeParams || {});
    }
  }

  public recordError(error: Error | string, context?: string): void {
    logger.error(`[CrashReport] (${context || 'Global'})`, error);
  }
}

export const analyticsService = new AnalyticsService();
