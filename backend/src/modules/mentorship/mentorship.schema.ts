export const createMentorshipSchema = (data: any) => {
  const errors = [];
  
  if (!data.mentor_id) errors.push('Mentor ID is required');
  if (!data.message || data.message.length < 20) errors.push('Message must be at least 20 characters');
  if (!data.goals || !Array.isArray(data.goals) || data.goals.length === 0) errors.push('At least one goal is required');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
