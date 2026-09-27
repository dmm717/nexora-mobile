export interface AnalyticsEvent {
  name: string;
  params?: Record<string, any>;
  timestamp: string;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private readonly MAX_QUEUE_SIZE = 100;

  public logEvent(name: string, params?: Record<string, any>): void {
    const event: AnalyticsEvent = {
      name,
      params,
      timestamp: new Date().toISOString(),
    };
    
    // SECURITY & PERFORMANCE (Phase 4.12): Prevent memory leak by capping queue
    this.events.push(event);
    if (this.events.length > this.MAX_QUEUE_SIZE) {
      this.events.shift(); // Remove oldest event
    }

    if (__DEV__) {
      console.log(`[Analytics] ${name}`, params || '');
    }
  }

  public recordError(error: Error | string, context?: string): void {
    if (__DEV__) {
      console.error(`[CrashReport] (${context || 'Global'})`, error);
    }
  }
}

export const analyticsService = new AnalyticsService();
