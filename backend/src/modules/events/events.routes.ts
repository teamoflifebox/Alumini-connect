import { Router } from 'express';
import { EventsController } from './events.controller';
import { authenticate, authorizeRoles } from '../auth/auth.middleware';

const router = Router();
const controller = new EventsController();

router.get('/', controller.getAllEvents);
router.get('/my-events', authenticate, controller.getMyEvents);
router.get('/admin/all', authenticate, authorizeRoles('admin'), controller.getAdminEvents);
router.get('/:id', controller.getEventById);

router.post('/', authenticate, controller.createEvent);
router.put('/:id', authenticate, controller.updateEvent);
router.put('/:id/approve', authenticate, authorizeRoles('admin'), controller.approveEvent);
router.delete('/:id', authenticate, controller.deleteEvent);

router.post('/:id/register', authenticate, controller.registerForEvent);
router.delete('/:id/register', authenticate, controller.unregisterFromEvent);

router.post('/:id/report', authenticate, controller.reportEvent);

export default router;
