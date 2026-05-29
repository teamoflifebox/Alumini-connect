import pool from '../../core/config/db';

export class DonationsRepository {
  async createCampaign(adminId: number, data: any) {
    const result = await pool.query(
      `INSERT INTO donation_campaigns (
        title, category, description, purpose, beneficiary_details,
        target_amount, start_date, end_date, contact_information,
        payment_instructions, created_by, campaign_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Draft') RETURNING *`,
      [
        data.title, data.category, data.description, data.purpose, data.beneficiary_details,
        data.target_amount, data.start_date || new Date(), data.end_date, data.contact_information,
        data.payment_instructions, adminId
      ]
    );
    return result.rows[0];
  }

  async getAllCampaigns(isAdmin: boolean = false) {
    // If not admin, only show active campaigns
    const query = isAdmin 
      ? `SELECT c.*, u.name as admin_name FROM donation_campaigns c LEFT JOIN users u ON c.created_by = u.id ORDER BY c.created_at DESC`
      : `SELECT c.*, u.name as admin_name FROM donation_campaigns c LEFT JOIN users u ON c.created_by = u.id WHERE c.campaign_status = 'Active' ORDER BY c.created_at DESC`;
    const result = await pool.query(query);
    return result.rows;
  }

  async getCampaignById(id: string) {
    const result = await pool.query(
      `SELECT c.*, u.name as admin_name FROM donation_campaigns c LEFT JOIN users u ON c.created_by = u.id WHERE c.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  async updateCampaignStatus(id: string, status: string) {
    const result = await pool.query(
      `UPDATE donation_campaigns SET campaign_status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return result.rows[0];
  }

  // --- Transactions & Razorpay Integration ---

  async createTransaction(campaignId: string, donorId: number, amount: number, orderId: string) {
    const result = await pool.query(
      `INSERT INTO donation_transactions (campaign_id, donor_id, amount, razorpay_order_id, payment_status)
       VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
      [campaignId, donorId, amount, orderId]
    );
    return result.rows[0];
  }

  async verifyAndUpdateTransaction(orderId: string, paymentId: string, status: string) {
    // Start PostgreSQL Transaction for race-condition prevention
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Lock the transaction row
      const txResult = await client.query(
        `SELECT * FROM donation_transactions WHERE razorpay_order_id = $1 FOR UPDATE`,
        [orderId]
      );
      const tx = txResult.rows[0];

      if (!tx || tx.payment_status === 'success') {
        // Prevent duplicate updates
        await client.query('ROLLBACK');
        return tx;
      }

      // Update Transaction
      const updatedTxResult = await client.query(
        `UPDATE donation_transactions 
         SET payment_status = $1, payment_id = $2, transaction_status = 'completed'
         WHERE razorpay_order_id = $3 RETURNING *`,
        [status, paymentId, orderId]
      );

      // If successful, update the Campaign totals safely
      if (status === 'success') {
        await client.query(
          `UPDATE donation_campaigns 
           SET collected_amount = collected_amount + $1, 
               supporter_count = supporter_count + 1,
               updated_at = NOW()
           WHERE id = $2`,
          [tx.amount, tx.campaign_id]
        );
      }

      await client.query('COMMIT');
      return updatedTxResult.rows[0];
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async getCampaignTransactions(campaignId: string) {
    const result = await pool.query(
      `SELECT t.*, u.name as donor_name, u.email as donor_email 
       FROM donation_transactions t 
       LEFT JOIN users u ON t.donor_id = u.id 
       WHERE t.campaign_id = $1 AND t.payment_status = 'success'
       ORDER BY t.donated_at DESC`,
      [campaignId]
    );
    return result.rows;
  }

  async getTopDonors() {
    const result = await pool.query(
      `SELECT u.name, u.role as batch, SUM(t.amount) as total_amount
       FROM donation_transactions t
       JOIN users u ON t.donor_id = u.id
       WHERE t.payment_status = 'success'
       GROUP BY u.id, u.name, u.role
       ORDER BY total_amount DESC
       LIMIT 8`
    );
    return result.rows;
  }
}
