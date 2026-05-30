import { Router } from 'express';
import { settingsController } from './settings.controller';
import { authenticate as requireAuth } from '../auth/auth.middleware';
import { validate as validateRequest } from '../../core/middlewares/validate';
import { updateSettingsSchema } from './settings.schema';

const router = Router();

router.use(requireAuth);

router.get('/', settingsController.getSettings);
router.put('/', validateRequest(updateSettingsSchema), settingsController.updateSettings);

export const settingsRoutes = router;
