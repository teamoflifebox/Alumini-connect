import { Request, Response } from 'express';
import { EventsService } from './events.service';

const eventsService = new EventsService();

export class EventsController {
  async createEvent(req: Request, res: Response) {
    try {
      const user_id = (req as any).user.id;
      const event = await eventsService.createEvent(user_id, req.body);
      res.status(201).json({ status: 'success', data: event });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async updateEvent(req: Request, res: Response) {
    try {
      const user_id = (req as any).user.id;
      const event = await eventsService.updateEvent(req.params.id as string, user_id, req.body);
      res.status(200).json({ status: 'success', data: event });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async getAllEvents(req: Request, res: Response) {
    try {
      const query = req.query.q as string;
      const events = query 
        ? await eventsService.searchEvents(query)
        : await eventsService.getAllEvents();
      res.status(200).json({ status: 'success', data: events });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async getAdminEvents(req: Request, res: Response) {
    try {
      const events = await eventsService.getAdminEvents();
      res.status(200).json({ status: 'success', data: events });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async approveEvent(req: Request, res: Response) {
    try {
      const event = await eventsService.approveEvent(req.params.id as string);
      res.status(200).json({ status: 'success', data: event });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async getEventById(req: Request, res: Response) {
    try {
      const event = await eventsService.getEventById(req.params.id as string);
      res.status(200).json({ status: 'success', data: event });
    } catch (error: any) {
      res.status(404).json({ status: 'error', message: error.message });
    }
  }

  async deleteEvent(req: Request, res: Response) {
    try {
      const user_id = (req as any).user.id;
      await eventsService.deleteEvent(req.params.id as string, user_id);
      res.status(200).json({ status: 'success', message: 'Event deleted' });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async registerForEvent(req: Request, res: Response) {
    try {
      const user_id = (req as any).user.id;
      const reg = await eventsService.registerForEvent(req.params.id as string, user_id);
      res.status(201).json({ status: 'success', data: reg });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async reportEvent(req: Request, res: Response) {
    try {
      const user_id = (req as any).user.id;
      const { reason } = req.body;
      if (!reason) {
        res.status(400).json({ status: 'error', message: 'Reason is required' });
        return;
      }
      const result = await eventsService.reportEvent(req.params.id as string, user_id, reason);
      res.status(200).json({ status: 'success', data: result });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async unregisterFromEvent(req: Request, res: Response) {
    try {
      const user_id = (req as any).user.id;
      await eventsService.unregisterFromEvent(req.params.id as string, user_id);
      res.status(200).json({ status: 'success', message: 'Unregistered' });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async getMyEvents(req: Request, res: Response) {
    try {
      const user_id = (req as any).user.id;
      const events = await eventsService.getMyEvents(user_id);
      res.status(200).json({ status: 'success', data: events });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
}
