export const createJobSchema = (data: any) => {
  const errors = [];
  
  if (!data.title || data.title.length < 3) errors.push('Title must be at least 3 characters');
  if (!data.description || data.description.length < 10) errors.push('Description is too short');
  if (!data.company) errors.push('Company name is required');
  
  // We can easily add more validation rules later when we add more fields
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
