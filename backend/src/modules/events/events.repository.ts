import pool from '../../core/config/db';
import { Event, EventRegistration, CreateEventDTO } from './events.types';

export class EventsRepository {
  async getUserTrustScore(user_id: number): Promise<number> {
    const result = await pool.query(`SELECT trust_score FROM users WHERE id = $1`, [user_id]);
    return result.rows[0]?.trust_score || 50;
  }

  async createEvent(organizer_id: number, data: CreateEventDTO, status: string = 'pending'): Promise<Event> {
    const result = await pool.query(
      `INSERT INTO events (title, description, event_type, organizer_id, start_time, end_time, location_type, location_details, capacity, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        data.title,
        data.description,
        data.event_type,
        organizer_id,
        data.start_time,
        data.end_time,
        data.location_type,
        data.location_details,
        data.capacity || null,
        status
      ]
    );
    return result.rows[0];
  }

  async updateEvent(id: string, organizer_id: number, data: any): Promise<any> {
    const result = await pool.query(
      `UPDATE events
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           event_type = COALESCE($3, event_type),
           start_time = COALESCE($4, start_time),
           end_time = COALESCE($5, end_time),
           location_type = COALESCE($6, location_type),
           location_details = COALESCE($7, location_details)
       WHERE id = $8 AND organizer_id = $9
       RETURNING *`,
      [data.title, data.description, data.event_type, data.start_time, data.end_time, data.location_type, data.location_details, id, organizer_id]
    );
    return result.rows[0];
  }

  async updateEventStatus(id: string, status: string): Promise<any> {
    const result = await pool.query(
      `UPDATE events SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return result.rows[0];
  }

  async getAllEvents(): Promise<any[]> {
    const result = await pool.query(`
      SELECT e.*, u.verified_organizer, u.name as organizer_name, u.email as organizer_email,
             (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.id) as attendee_count
      FROM events e 
      JOIN users u ON e.organizer_id = u.id 
      ORDER BY e.start_time DESC
    `);
    return result.rows;
  }

  async getEventById(id: string): Promise<any | null> {
    const result = await pool.query(`
      SELECT e.*, u.verified_organizer, u.name as organizer_name, u.email as organizer_email,
             (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.id) as attendee_count
      FROM events e 
      JOIN users u ON e.organizer_id = u.id 
      WHERE e.id = $1
    `, [id]);
    return result.rows[0] || null;
  }

  async reportEvent(event_id: string, reporter_id: number, reason: string): Promise<number> {
    await pool.query(
      `INSERT INTO event_reports (event_id, reporter_id, reason) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
      [event_id, reporter_id, reason]
    );
    const result = await pool.query(`SELECT COUNT(*) as count FROM event_reports WHERE event_id = $1`, [event_id]);
    return parseInt(result.rows[0].count, 10);
  }

  async flagEvent(event_id: string): Promise<void> {
    await pool.query(`UPDATE events SET status = 'flagged' WHERE id = $1`, [event_id]);
  }

  async deleteEvent(id: string, organizer_id: number): Promise<boolean> {
    const result = await pool.query(`DELETE FROM events WHERE id = $1 AND organizer_id = $2`, [id, organizer_id]);
    return (result.rowCount || 0) > 0;
  }

  async registerForEvent(event_id: string, user_id: number): Promise<EventRegistration> {
    const result = await pool.query(
      `INSERT INTO event_registrations (event_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (event_id, user_id) DO NOTHING
       RETURNING *`,
      [event_id, user_id]
    );
    return result.rows[0];
  }

  async getRegistrationsForEvent(event_id: string): Promise<EventRegistration[]> {
    const result = await pool.query(`SELECT * FROM event_registrations WHERE event_id = $1`, [event_id]);
    return result.rows;
  }

  async getEventAttendees(event_id: string): Promise<any[]> {
    const result = await pool.query(
      `SELECT er.*, u.name, u.email 
       FROM event_registrations er
       JOIN users u ON er.user_id = u.id
       WHERE er.event_id = $1`,
      [event_id]
    );
    return result.rows;
  }

  async unregisterFromEvent(event_id: string, user_id: number): Promise<boolean> {
    const result = await pool.query(
      `DELETE FROM event_registrations WHERE event_id = $1 AND user_id = $2`,
      [event_id, user_id]
    );
    return (result.rowCount || 0) > 0;
  }

  async getMyRegisteredEvents(user_id: number): Promise<Event[]> {
    const result = await pool.query(
      `SELECT e.* 
       FROM events e
       JOIN event_registrations er ON e.id = er.event_id
       WHERE er.user_id = $1`,
      [user_id]
    );
    return result.rows;
  }
}
