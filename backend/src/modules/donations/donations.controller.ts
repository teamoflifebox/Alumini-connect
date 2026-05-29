import { Request, Response } from 'express';
import { DonationsService } from './donations.service';

const donationsService = new DonationsService();

export class DonationsController {
  
  // --- Admin Endpoints ---
  async createCampaign(req: Request, res: Response) {
    try {
      // req.user exists because of auth middleware
      const campaign = await donationsService.createCampaign((req as any).user.id, req.body);
      res.status(201).json({ status: 'success', data: campaign });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async updateCampaignStatus(req: Request, res: Response) {
    try {
      const campaign = await donationsService.updateCampaignStatus(req.params.id as string, req.body.status);
      res.status(200).json({ status: 'success', data: campaign });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  // --- Public Endpoints ---
  async getPublicCampaigns(req: Request, res: Response) {
    try {
      const campaigns = await donationsService.getAllCampaigns(false);
      res.status(200).json({ status: 'success', data: campaigns });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async getTopDonors(req: Request, res: Response) {
    try {
      const donors = await donationsService.getTopDonors();
      res.status(200).json({ status: 'success', data: donors });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async getAdminCampaigns(req: Request, res: Response) {
    try {
      const campaigns = await donationsService.getAllCampaigns(true);
      res.status(200).json({ status: 'success', data: campaigns });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async getCampaignById(req: Request, res: Response) {
    try {
      const campaign = await donationsService.getCampaignById(req.params.id as string);
      res.status(200).json({ status: 'success', data: campaign });
    } catch (error: any) {
      res.status(404).json({ status: 'error', message: error.message });
    }
  }

  // --- Payment Endpoints ---
  async createOrder(req: Request, res: Response) {
    try {
      const { campaignId, amount } = req.body;
      const donorId = (req as any).user.id;
      const orderDetails = await donationsService.createDonationOrder(campaignId, donorId, amount);
      res.status(200).json({ status: 'success', data: orderDetails });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async verifyFrontendPayment(req: Request, res: Response) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      const result = await donationsService.verifyPaymentFrontend(razorpay_order_id, razorpay_payment_id, razorpay_signature);
      res.status(200).json({ status: 'success', data: result });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async razorpayWebhook(req: Request, res: Response) {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      const rawBody = (req as any).rawBody; // Need raw body for HMAC SHA256

      if (!rawBody) {
        // If raw body isn't available, stringify (not 100% reliable for signatures but fallback)
        await donationsService.verifyPaymentWebhook(JSON.stringify(req.body), signature);
      } else {
        await donationsService.verifyPaymentWebhook(rawBody, signature);
      }
      res.status(200).send('OK');
    } catch (error: any) {
      console.error('Webhook error:', error.message);
      res.status(400).send('Webhook failed');
    }
  }
}
