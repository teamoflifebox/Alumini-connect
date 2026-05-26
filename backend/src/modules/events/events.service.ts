import { EventsRepository } from './events.repository';
import { CreateEventDTO } from './events.types';
import { meiliClient, EVENTS_INDEX } from '../../core/config/meilisearch';

export class EventsService {
  private repository: EventsRepository;

  constructor() {
    this.repository = new EventsRepository();
  }

  async createEvent(organizer_id: number, data: CreateEventDTO) {
    const trustScore = await this.repository.getUserTrustScore(organizer_id);
    
    const spamKeywords = ['crypto', 'free money', 'guaranteed job', 'earn fast', 'investment'];
    const textToCheck = (data.title + ' ' + data.description).toLowerCase();
    const hasSpam = spamKeywords.some(kw => textToCheck.includes(kw));

    let status = 'pending';
    if (hasSpam) {
      status = 'flagged';
    } else if (trustScore >= 80) {
      status = 'verified';
    } else if (trustScore < 40) {
      status = 'flagged';
    }

    const event = await this.repository.createEvent(organizer_id, data, status);
    
    // Sync to MeiliSearch ONLY if it's verified (auto-verified)
    if (status === 'verified') {
      try {
        await meiliClient.index(EVENTS_INDEX).addDocuments([{
          id: event.id,
          title: event.title,
          description: event.description,
          event_type: event.event_type,
          location_type: event.location_type,
          start_time: new Date(event.start_time).getTime(),
          end_time: new Date(event.end_time).getTime(),
        }]);
      } catch (e) {
        console.error('[MeiliSearch] Failed to index event:', e);
      }
    }

    return event;
  }

  async updateEvent(id: string, organizer_id: number, data: any) {
    const event = await this.repository.getEventById(id);
    if (!event) throw new Error('Event not found');
    if (event.organizer_id !== organizer_id) throw new Error('Unauthorized');

    if (data.start_time || data.end_time) {
      const now = new Date();
      const existingStart = new Date(event.start_time);
      const timeDiffHours = (existingStart.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (timeDiffHours < 48) {
        const newStart = new Date(data.start_time || event.start_time);
        const newEnd = new Date(data.end_time || event.end_time);
        if (newStart.getTime() !== existingStart.getTime() || newEnd.getTime() !== new Date(event.end_time).getTime()) {
          throw new Error('Cannot change event timings within 48 hours of the scheduled start time.');
        }
      }
    }

    const updated = await this.repository.updateEvent(id, organizer_id, data);
    
    if (updated.status !== 'flagged') {
      try {
        await meiliClient.index(EVENTS_INDEX).updateDocuments([{
          id: updated.id,
          title: updated.title,
          description: updated.description,
          event_type: updated.event_type,
          location_type: updated.location_type,
          start_time: new Date(updated.start_time).getTime(),
          end_time: new Date(updated.end_time).getTime(),
        }]);
      } catch (e) {
        console.error('[MeiliSearch] Failed to update event in index:', e);
      }
    }

    return updated;
  }

  async getAllEvents() {
    const all = await this.repository.getAllEvents();
    // Public feed ONLY shows verified events!
    return all.filter(e => e.status === 'verified');
  }

  async getAdminEvents() {
    // Admin gets everything
    return await this.repository.getAllEvents();
  }

  async approveEvent(id: string) {
    const updated = await this.repository.updateEventStatus(id, 'verified');
    if (!updated) throw new Error('Event not found');
    
    try {
      await meiliClient.index(EVENTS_INDEX).addDocuments([{
        id: updated.id,
        title: updated.title,
        description: updated.description,
        event_type: updated.event_type,
        location_type: updated.location_type,
        start_time: new Date(updated.start_time).getTime(),
        end_time: new Date(updated.end_time).getTime(),
      }]);
    } catch (e) {
      console.error('[MeiliSearch] Failed to index event after approval:', e);
    }
    return updated;
  }

  async searchEvents(query: string) {
    try {
      const searchResults = await meiliClient.index(EVENTS_INDEX).search(query, {
        sort: ['start_time:desc'],
      });
      
      const ids = searchResults.hits?.map((hit: any) => hit.id) || [];
      if (ids.length === 0) return [];
      
      const allEvents = await this.getAllEvents();
      return allEvents.filter(e => ids.includes(e.id));
    } catch (error) {
      console.error('[MeiliSearch] Search error:', error);
      return this.getAllEvents();
    }
  }

  async reportEvent(event_id: string, user_id: number, reason: string) {
    const reportCount = await this.repository.reportEvent(event_id, user_id, reason);
    
    if (reportCount >= 5) {
      await this.repository.flagEvent(event_id);
      
      try {
        await meiliClient.index(EVENTS_INDEX).deleteDocument(event_id);
      } catch (e) {
        console.error('[MeiliSearch] Failed to delete flagged event:', e);
      }
    }
    
    return { success: true, reportCount };
  }

  async getEventById(id: string) {
    const event = await this.repository.getEventById(id);
    if (!event) throw new Error('Event not found');
    
    const attendees = await this.repository.getEventAttendees(id);
    return { ...event, attendees, attendee_count: attendees.length };
  }

  async deleteEvent(id: string, organizer_id: number) {
    const success = await this.repository.deleteEvent(id, organizer_id);
    if (!success) throw new Error('Event not found or unauthorized');
    
    // Remove from MeiliSearch
    try {
      await meiliClient.index(EVENTS_INDEX).deleteDocument(id);
    } catch (e) {
      console.error('[MeiliSearch] Failed to delete event:', e);
    }

    return true;
  }

  async registerForEvent(event_id: string, user_id: number) {
    const event = await this.repository.getEventById(event_id);
    if (!event) throw new Error('Event not found');
    
    const reg = await this.repository.registerForEvent(event_id, user_id);
    if (!reg) throw new Error('Already registered');
    return reg;
  }

  async unregisterFromEvent(event_id: string, user_id: number) {
    return this.repository.unregisterFromEvent(event_id, user_id);
  }

  async getMyEvents(user_id: number) {
    return this.repository.getMyRegisteredEvents(user_id);
  }
}
