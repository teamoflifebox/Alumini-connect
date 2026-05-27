import { DonationsRepository } from './donations.repository';
import Razorpay from 'razorpay';
import crypto from 'crypto';

export class DonationsService {
  private repository: DonationsRepository;
  private razorpay: Razorpay;

  constructor() {
    this.repository = new DonationsRepository();
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
      key_secret: process.env.RAZORPAY_SECRET || 'dummy_secret',
    });
  }

  async createCampaign(adminId: number, data: any) {
    if (!data.title || !data.target_amount || !data.purpose || !data.beneficiary_details) {
      throw new Error('Missing mandatory campaign details');
    }
    // Check mandatory legal declaration as requested by user
    if (data.legal_declaration !== true) {
      throw new Error('You must accept the legal responsibility declaration to create a campaign.');
    }
    return await this.repository.createCampaign(adminId, data);
  }

  async getAllCampaigns(isAdmin: boolean = false) {
    return await this.repository.getAllCampaigns(isAdmin);
  }

  async getCampaignById(id: string) {
    const campaign = await this.repository.getCampaignById(id);
    if (!campaign) throw new Error('Campaign not found');
    const transactions = await this.repository.getCampaignTransactions(id);
    return { ...campaign, recent_donations: transactions };
  }

  async getTopDonors() {
    return await this.repository.getTopDonors();
  }

  async updateCampaignStatus(id: string, status: string) {
    return await this.repository.updateCampaignStatus(id, status);
  }

  // --- Payment Flow ---

  async createDonationOrder(campaignId: string, donorId: number, amount: number) {
    const campaign = await this.repository.getCampaignById(campaignId);
    if (!campaign || campaign.campaign_status !== 'Active') {
      throw new Error('Campaign is not active or does not exist');
    }

    // Amount is in smallest currency unit (paise for INR)
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_campaign_${campaignId.substring(0, 8)}`,
    };

    try {
      const order = await this.razorpay.orders.create(options);
      // Store pending transaction in our DB
      const transaction = await this.repository.createTransaction(campaignId, donorId, amount, order.id);
      
      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
        transactionId: transaction.id
      };
    } catch (error: any) {
      console.error('Razorpay order creation failed:', error);
      throw new Error('Payment gateway error');
    }
  }

  // The true source of truth: Webhook
  async verifyPaymentWebhook(body: string, signature: string) {
    const secret = process.env.WEBHOOK_SECRET || 'dummy_webhook_secret';
    
    // Validate SHA256 HMAC signature
    const expectedSignature = crypto.createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new Error('Invalid signature');
    }

    // Parse the JSON body now that it is trusted
    const event = JSON.parse(body);

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const paymentEntity = event.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      const status = paymentEntity.status === 'captured' ? 'success' : 'failed';

      // Use safe database locking via repository
      await this.repository.verifyAndUpdateTransaction(orderId, paymentId, status);
      return { verified: true };
    }

    return { verified: false, ignored: true };
  }

  // Backup frontend verification method (less secure than webhooks, but necessary for immediate UI feedback)
  async verifyPaymentFrontend(orderId: string, paymentId: string, signature: string) {
    const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET || 'dummy_secret')
      .update(orderId + "|" + paymentId)
      .digest('hex');

    if (generatedSignature === signature) {
      // Trigger update, but webhook might have already done it! (Safe due to SELECT FOR UPDATE in repo)
      await this.repository.verifyAndUpdateTransaction(orderId, paymentId, 'success');
      return { success: true };
    } else {
      throw new Error('Payment verification failed');
    }
  }
}
