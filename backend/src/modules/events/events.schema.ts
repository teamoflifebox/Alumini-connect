export const createEventSchema = (data: any) => {
  const errors = [];
  
  if (!data.title || data.title.length < 5) errors.push('Title must be at least 5 characters');
  if (!data.event_type) errors.push('Event type is required');
  if (!data.start_time || !data.end_time) errors.push('Start and end times are required');
  if (new Date(data.start_time) >= new Date(data.end_time)) errors.push('Start time must be before end time');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
