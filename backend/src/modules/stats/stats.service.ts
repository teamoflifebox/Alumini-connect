import pool from '../../config/database';

export class StatsService {
  async getLandingStats() {
    // Queries to fetch the dynamic counts
    const usersQuery = pool.query('SELECT COUNT(*) FROM users');
    const verifiedUsersQuery = pool.query('SELECT COUNT(*) FROM users WHERE is_verified = true');
    const mentorshipsQuery = pool.query('SELECT COUNT(*) FROM mentorship_sessions');
    // For jobs placed, we will count total referrals + total jobs in the system
    const jobsQuery = pool.query('SELECT COUNT(*) FROM jobs');
    const referralsQuery = pool.query('SELECT COUNT(*) FROM referrals');
    const campaignsQuery = pool.query('SELECT title, raised_amount as raised FROM campaigns ORDER BY raised_amount DESC LIMIT 3');
    const totalScholarshipFundsQuery = pool.query('SELECT SUM(raised_amount) as total FROM campaigns');
    
    const [usersRes, verifiedUsersRes, mentorshipsRes, jobsRes, referralsRes, campaignsRes, fundsRes] = await Promise.all([
      usersQuery,
      verifiedUsersQuery,
      mentorshipsQuery,
      jobsQuery,
      referralsQuery,
      campaignsQuery,
      totalScholarshipFundsQuery
    ]);

    const activeUsers = parseInt(usersRes.rows[0].count, 10);
    const verifiedUsers = parseInt(verifiedUsersRes.rows[0].count, 10);
    const mentorships = parseInt(mentorshipsRes.rows[0].count, 10);
    const jobsPlaced = parseInt(jobsRes.rows[0].count, 10) + parseInt(referralsRes.rows[0].count, 10);
    
    // Calculate verification progress as percentage
    const verificationProgress = activeUsers > 0 ? Math.round((verifiedUsers / activeUsers) * 100) : 0;
    
    // Dynamic campaigns from the DB
    const activeCampaigns = campaignsRes.rows;
    
    const scholarshipFunds = parseInt(fundsRes.rows[0].total || '0', 10);

    return {
      activeUsers,
      verificationProgress,
      mentorships,
      jobsPlaced,
      scholarshipFunds,
      activeCampaigns,
    };
  }
}

export const statsService = new StatsService();
