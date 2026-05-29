import { Router } from 'express';
import { statsController } from './stats.controller';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(statsController.getStats.bind(statsController)));

export const statsRoutes = router;
