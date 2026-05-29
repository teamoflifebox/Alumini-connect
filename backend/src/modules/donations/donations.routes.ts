import { Router } from 'express';
import { DonationsController } from './donations.controller';
import { authenticate, authorizeRoles } from '../auth/auth.middleware';

const router = Router();
const controller = new DonationsController();

// Public routes
router.get('/', controller.getPublicCampaigns);
router.get('/top-donors', controller.getTopDonors);
router.get('/:id', controller.getCampaignById);

// Webhook route (must be unauthenticated and should parse raw body if possible)
router.post('/webhook', controller.razorpayWebhook);

// Protected User routes (Donations)
router.post('/order', authenticate, controller.createOrder);
router.post('/verify', authenticate, controller.verifyFrontendPayment);

// Admin Only Routes
router.get('/admin/all', authenticate, authorizeRoles('admin'), controller.getAdminCampaigns);
router.post('/admin/create', authenticate, authorizeRoles('admin'), controller.createCampaign);
router.put('/admin/:id/status', authenticate, authorizeRoles('admin'), controller.updateCampaignStatus);

export default router;
// Force nodemon restart to pick up .env keys
