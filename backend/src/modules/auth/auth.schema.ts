// You can use a library like 'zod' or 'joi' here to validate incoming request bodies.
// This acts as the "Model schema" for your API validation.

// Example using a simple manual validation for now, but usually this is a Zod schema:
export const registerSchema = (data: any) => {
  const errors = [];
  if (!data.email || !data.email.includes('@')) errors.push('Valid email is required');
  if (!data.password || data.password.length < 6) errors.push('Password must be at least 6 characters');
  if (!data.name) errors.push('Name is required');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
