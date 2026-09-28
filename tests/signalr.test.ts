import { signalRService } from '../src/services/signalr';

describe('SignalR Service', () => {
  it('deduplicates events correctly', () => {
    const event = {
      eventId: 'test-event-1',
      resourceType: 'report',
      resourceId: '123',
      status: 'completed',
      timestamp: '2023-01-01'
    };

    expect(signalRService.isNewEvent(event)).toBe(true);
    // Should be false on second call
    expect(signalRService.isNewEvent(event)).toBe(false);
  });
});
