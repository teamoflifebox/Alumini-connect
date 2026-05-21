export interface MentorshipRequest {
  id: string;
  mentee_id: string; // References UserProfile (Student/Junior Alumni)
  mentor_id: string; // References UserProfile (Alumni)
  status: 'Pending' | 'Accepted' | 'Declined' | 'Completed';
  message: string;
  goals: string[];
  scheduled_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateMentorshipRequestDTO {
  mentor_id: string;
  message: string;
  goals: string[];
}
