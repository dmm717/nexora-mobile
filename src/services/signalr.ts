import { API_BASE_URL } from '@/api/client';

export interface ResourceChangedEvent {
  eventId: string;
  resourceType: string; // 'resume' | 'cv_analysis' | 'interview' | 'report' | 'scenario_attempt'
  resourceId: string;
  status: string;
  timestamp: string;
}

class SignalRService {
  private processedEventIds = new Set<string>();

  /**
   * Deduplicate resourceChanged event ID and return whether this event is new
   */
  public isNewEvent(event: ResourceChangedEvent): boolean {
    if (!event || !event.eventId) return false;
    if (this.processedEventIds.has(event.eventId)) {
      return false;
    }
    this.processedEventIds.add(event.eventId);
    if (this.processedEventIds.size > 200) {
      const firstKey = this.processedEventIds.values().next().value;
      if (firstKey) this.processedEventIds.delete(firstKey);
    }
    return true;
  }

  public getHubUrl(): string {
    const baseUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
    return `${baseUrl}/hubs/realtime`;
  }
}

export const signalRService = new SignalRService();
