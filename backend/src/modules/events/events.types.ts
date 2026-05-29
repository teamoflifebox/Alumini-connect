export interface Event {
  id: string;
  title: string;
  description: string;
  event_type: 'Webinar' | 'Meetup' | 'Reunion' | 'Workshop';
  organizer_id: number;
  start_time: Date;
  end_time: Date;
  location_type: 'Online' | 'In-Person';
  location_details: string;
  capacity?: number;
  created_at: Date;
  updated_at: Date;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: number;
  status: 'Registered' | 'Attended' | 'Cancelled';
  registered_at: Date;
}

export interface CreateEventDTO {
  title: string;
  description: string;
  event_type: string;
  start_time: Date;
  end_time: Date;
  location_type: string;
  location_details: string;
  capacity?: number;
}
