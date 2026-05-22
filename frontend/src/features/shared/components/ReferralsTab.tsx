import { motion } from 'framer-motion';
import { Briefcase, UserPlus, CheckCircle, Clock, XCircle, Search } from 'lucide-react';

export default function ReferralsTab() {
  const referrals = [
    {
      id: 1,
      candidate: 'John Doe',
      role: 'Frontend Developer',
      company: 'Google',
      date: 'May 20, 2026',
      status: 'Pending Review',
      type: 'Received'
    },
    {
      id: 2,
      candidate: 'Sarah Jenkins',
      role: 'Product Manager',
      company: 'Microsoft',
      date: 'May 18, 2026',
      status: 'Interviewing',
      type: 'Sent'
    },
    {
      id: 3,
      candidate: 'Michael Chang',
      role: 'Data Scientist',
      company: 'Meta',
      date: 'May 10, 2026',
      status: 'Hired',
      type: 'Received'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Hired': return <CheckCircle size={16} className="text-emerald-400" />;
      case 'Pending Review': return <Clock size={16} className="text-yellow-400" />;
      case 'Interviewing': return <Clock size={16} className="text-blue-400" />;
      default: return <XCircle size={16} className="text-red-400" />;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-8">
      
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#15171c] border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px]" />
          <UserPlus className="text-blue-400 mb-4" size={24} />
          <h4 className="text-3xl font-bold text-white mb-1">12</h4>
          <p className="text-sm text-muted-foreground">Referrals Sent</p>
        </div>
        <div className="bg-[#15171c] border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px]" />
          <Briefcase className="text-purple-400 mb-4" size={24} />
          <h4 className="text-3xl font-bold text-white mb-1">5</h4>
          <p className="text-sm text-muted-foreground">Referrals Received</p>
        </div>
        <div className="bg-[#15171c] border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px]" />
          <CheckCircle className="text-emerald-400 mb-4" size={24} />
          <h4 className="text-3xl font-bold text-white mb-1">3</h4>
          <p className="text-sm text-muted-foreground">Successful Hires</p>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-[#15171c] border border-white/5 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-white">Referral Tracker</h3>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input type="text" placeholder="Search referrals..." className="bg-[#1c1f26] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary" />
            </div>
            <button className="bg-primary hover:bg-brand-600 text-white px-6 py-2 rounded-xl font-bold text-sm transition-colors">
              Request Referral
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/[0.02] text-muted-foreground text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Candidate / Referrer</th>
                <th className="px-6 py-4">Target Role</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {referrals.map((ref) => (
                <tr key={ref.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-bold text-white">{ref.candidate}</td>
                  <td className="px-6 py-4 text-muted-foreground">{ref.role}</td>
                  <td className="px-6 py-4 text-white font-medium">{ref.company}</td>
                  <td className="px-6 py-4 text-muted-foreground">{ref.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded border text-xs font-bold ${ref.type === 'Sent' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'}`}>
                      {ref.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(ref.status)}
                      <span className="text-white font-medium">{ref.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-primary hover:text-white transition-colors font-semibold">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
