import { Router, Response, NextFunction } from 'express';
import { requireAuth, AuthRequest } from '../auth/auth.middleware';
import pool from '../../core/config/db';

const router = Router();
router.use(requireAuth);

// Get unread notification count
router.get('/unread/count', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }
    
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );
    res.status(200).json({ status: 'success', data: parseInt(result.rows[0].count, 10) });
  } catch (err) {
    next(err);
  }
});

// Get all notifications
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }
    
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [userId]
    );
    res.status(200).json({ status: 'success', data: result.rows });
  } catch (err) {
    next(err);
  }
});

// Mark single notification as read (supports both PUT and PATCH)
const markSingleRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const notificationId = Number(req.params.id);
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }
    
    await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
      [notificationId, userId]
    );
    res.status(200).json({ status: 'success', message: 'Notification marked as read' });
  } catch (err) {
    next(err);
  }
};

router.put('/:id/read', markSingleRead);
router.patch('/:id/read', markSingleRead);

// Mark all notifications as read (supports both PUT and PATCH)
const markAllRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }
    
    await pool.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
      [userId]
    );
    res.status(200).json({ status: 'success', message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

router.put('/read-all', markAllRead);
router.patch('/read-all', markAllRead);

export default router;
