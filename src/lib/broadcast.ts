// BroadcastChannel for syncing appointments across tabs
const CHANNEL_NAME = 'appointments_sync';

export class AppointmentBroadcast {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(data: any) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.addEventListener('message', this.handleMessage.bind(this));
    }
  }

  private handleMessage(event: MessageEvent) {
    this.listeners.forEach(listener => {
      try {
        listener(event.data);
      } catch (error) {
        console.error('Error in broadcast listener:', error);
      }
    });
  }

  // Send appointment update to other tabs
  sendAppointmentUpdate(type: 'created' | 'updated' | 'cancelled', appointment: any) {
    if (this.channel) {
      this.channel.postMessage({
        type: 'appointment_update',
        action: type,
        appointment,
        timestamp: Date.now()
      });
    }
  }

  // Listen for appointment updates
  onAppointmentUpdate(callback: (data: { action: string; appointment: any }) => void) {
    const listener = (data: any) => {
      if (data.type === 'appointment_update') {
        callback({
          action: data.action,
          appointment: data.appointment
        });
      }
    };
    
    this.listeners.add(listener);
    
    // Return cleanup function
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Close the channel
  close() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.listeners.clear();
  }
}

// Singleton instance
let broadcastInstance: AppointmentBroadcast | null = null;

export function getAppointmentBroadcast(): AppointmentBroadcast {
  if (!broadcastInstance) {
    broadcastInstance = new AppointmentBroadcast();
  }
  return broadcastInstance;
}