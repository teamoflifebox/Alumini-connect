export interface Job {
  id: string;
  title: string;
  description: string;
  company: string;
  posted_by: string; // User ID of the alumni posting the job
  created_at: Date;
  updated_at: Date;
  // We can add more fields later like: salary_range, location, job_type, etc.
}

export interface CreateJobDTO {
  title: string;
  description: string;
  company: string;
}
