import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

export class GoogleMeetService {
  private calendar: any;
  private isConfigured = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      const credentialsPath = path.join(process.cwd(), 'google-credentials.json');
      
      if (fs.existsSync(credentialsPath)) {
        const auth = new google.auth.GoogleAuth({
          keyFile: credentialsPath,
          scopes: ['https://www.googleapis.com/auth/calendar.events'],
        });
        
        this.calendar = google.calendar({ version: 'v3', auth });
        this.isConfigured = true;
        console.log('Google Calendar API configured with Service Account.');
      } else {
        console.warn('google-credentials.json not found. Google Meet API integration will run in mock mode.');
      }
    } catch (err) {
      console.error('Failed to initialize Google Meet Service:', err);
    }
  }

  /**
   * Creates a Google Meet meeting.
   * If credentials are not set up, returns a generic meet.google.com/new link.
   */
  async createMeeting(params: {
    summary: string;
    description: string;
    startTime: string; // ISO String
    endTime: string;   // ISO String
  }): Promise<string> {
    if (!this.isConfigured) {
      throw new Error('Google Cloud credentials not found. Please paste your own Google Meet link into the form.');
    }

    try {
      const event = {
        summary: params.summary,
        description: params.description,
        start: {
          dateTime: params.startTime,
          timeZone: 'UTC', // Assuming UTC, but ideally pass real timezone
        },
        end: {
          dateTime: params.endTime,
          timeZone: 'UTC',
        },
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        },
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: 1,
        requestBody: event,
      });

      const meetLink = response.data.hangoutLink;
      if (!meetLink) {
        throw new Error('Google Calendar API did not return a hangoutLink');
      }

      return meetLink;
    } catch (err) {
      console.error('Error creating Google Meet link:', err);
      throw new Error('Failed to create Google Meet link');
    }
  }
}

export const googleMeetService = new GoogleMeetService();
