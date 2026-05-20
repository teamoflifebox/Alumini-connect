export const verifyAlumniSchema = (data: any) => {
  const errors = [];
  
  if (!data.user_id) errors.push('User ID is required');
  if (typeof data.is_verified !== 'boolean') errors.push('is_verified must be a boolean');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
