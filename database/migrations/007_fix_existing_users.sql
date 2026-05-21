-- Fix existing users to have proper approval status

-- Update all existing users to be approved if they are admin or student
UPDATE users 
SET is_approved = TRUE, 
    approval_status = 'approved',
    updated_at = NOW()
WHERE role IN ('admin', 'student') 
  AND (is_approved IS NULL OR is_approved = FALSE);

-- Ensure all other existing users have proper approval status
UPDATE users 
SET approval_status = COALESCE(approval_status, 'pending'),
    is_approved = COALESCE(is_approved, FALSE),
    updated_at = NOW()
WHERE role NOT IN ('admin', 'student');
