export const updateProfileSchema = (data: any) => {
  const errors = [];
  
  if (data.first_name && data.first_name.length < 2) errors.push('First name is too short');
  if (data.last_name && data.last_name.length < 2) errors.push('Last name is too short');
  if (data.skills && !Array.isArray(data.skills)) errors.push('Skills must be an array');
  if (data.domains && !Array.isArray(data.domains)) errors.push('Domains must be an array');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
