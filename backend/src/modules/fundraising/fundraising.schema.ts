export const createCampaignSchema = (data: any) => {
  const errors = [];
  
  if (!data.title || data.title.length < 5) errors.push('Title must be at least 5 characters');
  if (!data.target_amount || isNaN(data.target_amount) || data.target_amount <= 0) errors.push('Valid target amount is required');
  if (!data.end_date || new Date(data.end_date) <= new Date()) errors.push('End date must be in the future');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
