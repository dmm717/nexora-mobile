export interface AnalyticsEvent {
  name: string;
  params?: Record<string, any>;
  timestamp: string;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];

  public logEvent(name: string, params?: Record<string, any>): void {
    const event: AnalyticsEvent = {
      name,
      params,
      timestamp: new Date().toISOString(),
    };
    this.events.push(event);
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
