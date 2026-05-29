import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Variants } from 'framer-motion';
import { 
  ArrowRight, Users, Briefcase, GraduationCap, TrendingUp, 
  HeartHandshake, Award, Search, Zap, CheckCircle2, Shield, ChevronRight
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { statsApi, type LandingStats } from '../api/stats.api';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const stagger: Variants = {
  visible: { transition: { staggerChildren: 0.15 } }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 40 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<LandingStats | null>(null);

  useEffect(() => {
    statsApi.getLandingStats()
      .then(res => setStats(res.data.data))
      .catch(err => console.error('Failed to load stats', err));
  }, []);

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* NAVIGATION */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-white p-2 rounded-xl">
              <GraduationCap size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">Alumni Connect</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#roles" className="hover:text-primary transition-colors">Benefits</a>
            <a href="#scholarships" className="hover:text-primary transition-colors">Scholarships</a>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">Sign In</button>
            <button onClick={() => navigate('/register')} className="bg-primary hover:bg-brand-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-[0_0_20px_rgba(255,98,10,0.3)] hover:shadow-[0_0_30px_rgba(255,98,10,0.5)]">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-20">
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          {/* Background Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-4xl mx-auto">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8">
                <Zap size={16} /> <span>The Next-Gen Alumni & Opportunity Network</span>
              </motion.div>
              
              <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                Ignite Your Legacy Through <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-600">
                   Meaningful Connections
                </span>
              </motion.h1>
              
              <motion.p variants={fadeUp} className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                Break the boundaries between campus and career. Alumni Connect is the ultimate unified platform where students launch their dreams, alumni leave a lasting impact, and recruiters discover top-tier talent.
              </motion.p>
              
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button onClick={() => navigate('/register')} className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-brand-600 text-white rounded-full font-semibold transition-all shadow-[0_0_30px_rgba(255,98,10,0.4)] flex items-center justify-center gap-2 text-lg group">
                  Join the Network 
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </button>
                <button onClick={() => document.getElementById('scholarships')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto px-8 py-4 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full font-semibold transition-all flex items-center justify-center gap-2 text-lg">
                  Explore Scholarships
                </button>
              </motion.div>
            </motion.div>
            
            {/* Dashboard Mockup via Image and 3D Perspective Animation */}
            <motion.div 
              initial={{ opacity: 0, rotateX: 15, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-20 relative mx-auto max-w-5xl group perspective-[2000px]"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-10 pointer-events-none" />
              <div className="glass-card rounded-2xl border border-white/10 p-1 md:p-2 overflow-hidden shadow-2xl relative transform-gpu hover:shadow-[0_0_80px_rgba(255,98,10,0.2)] transition-shadow duration-700">
                <div className="h-8 bg-black/40 rounded-t-xl border-b border-white/5 flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  poster="/hero.png"
                  className="w-full h-[300px] md:h-[600px] object-cover rounded-b-xl border-t border-white/5 bg-[#0a0a0c]"
                >
                  <source src="https://cdn.coverr.co/videos/coverr-a-man-typing-on-a-keyboard-2256/1080p.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </motion.div>
          </div>
        </section>

        {/* STATISTICS SECTION */}
        <section className="py-12 border-y border-white/5 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/5 text-center">
              {[
                { label: 'Active Users', value: stats ? `${stats.activeUsers}+` : '...' },
                { label: 'Mentorships', value: stats ? `${stats.mentorships}+` : '...' },
                { label: 'Jobs Placed', value: stats ? `${stats.jobsPlaced}` : '...' },
                { label: 'Scholarship Funds', value: stats ? `$${(stats.scholarshipFunds / 1000).toFixed(0)}K+` : '...' },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center justify-center">
                  <div className="text-3xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PLATFORM OVERVIEW / FEATURES */}
        <section id="features" className="py-24 md:py-32 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Unleash the Power of Your Network</h2>
              <p className="text-lg text-muted-foreground">Purpose-built tools designed to accelerate careers, foster lifelong bonds, and drive transparent philanthropy.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: <HeartHandshake />, title: "Smart Mentorship", desc: "Our intelligent matching engine pairs driven students with seasoned alumni to navigate the journey from classroom to boardroom." },
                { icon: <Briefcase />, title: "Direct Referrals & Jobs", desc: "Bypass the resume black hole. Access exclusive opportunities and direct employee referrals from alumni at top companies." },
                { icon: <Search />, title: "Dynamic Directory", desc: "Instantly discover and connect with community members worldwide using powerful filters for industry, expertise, and location." },
                { icon: <Award />, title: "Revolutionary Scholarships", desc: "A frictionless, transparent ecosystem empowering alumni to fund education and students to easily access financial aid." },
                { icon: <TrendingUp />, title: "Verifiable Impact", desc: "Experience real-time transparency. Donors track their contributions to actual student success stories and institutional growth." },
                { icon: <Shield />, title: "Fortified Security", desc: "Built with enterprise-grade encryption and stringent role-based access, ensuring your community data remains completely secure." },
              ].map((feature, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="p-8 rounded-2xl glass border border-white/5 hover:border-primary/50 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ROLE-BASED BENEFITS */}
        <section id="roles" className="py-24 relative overflow-hidden bg-[#0c0c0e]">
          <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Built for everyone in the ecosystem</h2>
          </div>
          
          <div className="max-w-7xl mx-auto px-6 flex flex-col gap-12">
            {/* Alumni */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={scaleIn}
                className="order-2 md:order-1 glass-card rounded-3xl h-[400px] flex items-center justify-center border-white/5 relative overflow-hidden group shadow-xl"
              >
                <img src="/mentorship.png" alt="Alumni Mentorship" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8">
                   <div className="bg-brand-500/80 backdrop-blur text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wider mb-2 inline-block">MENTORSHIP</div>
                   <h4 className="text-white text-xl font-bold">1-on-1 Guidance</h4>
                </div>
              </motion.div>
              <div className="order-1 md:order-2">
                <div className="text-primary font-semibold tracking-wider uppercase mb-2">For Alumni</div>
                <h3 className="text-3xl md:text-4xl font-bold mb-6">Shape the Leaders of Tomorrow</h3>
                <ul className="space-y-4 mb-8">
                  {['Guide ambitious students through one-on-one mentorship', 'Champion talent by posting exclusive referrals and jobs', 'Leave a legacy by funding high-impact student scholarships', 'Forge powerful connections with fellow industry trailblazers'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="text-primary shrink-0 mt-1" size={20} />
                      <span className="text-muted-foreground text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={() => navigate('/register')} className="text-white font-medium flex items-center gap-2 hover:text-primary transition-colors">
                  Create Alumni Profile <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Students */}
            <div className="grid md:grid-cols-2 gap-12 items-center mt-12 md:mt-24">
              <div>
                <div className="text-primary font-semibold tracking-wider uppercase mb-2">For Students</div>
                <h3 className="text-3xl md:text-4xl font-bold mb-6">Launch Your Career Trajectory</h3>
                <ul className="space-y-4 mb-8">
                  {['Gain insider knowledge from elite alumni mentors', 'Secure essential funding through streamlined scholarship applications', 'Unlock hidden job markets with direct alumni referrals', 'Showcase your achievements to top-tier enterprise recruiters'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="text-primary shrink-0 mt-1" size={20} />
                      <span className="text-muted-foreground text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={() => navigate('/register')} className="text-white font-medium flex items-center gap-2 hover:text-primary transition-colors">
                  Sign up as Student <ChevronRight size={18} />
                </button>
              </div>
              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={scaleIn}
                className="glass-card rounded-3xl h-[400px] flex items-center justify-center border-white/5 relative overflow-hidden group shadow-xl"
              >
                <img src="/students.png" alt="University Students" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8">
                   <div className="bg-blue-500/80 backdrop-blur text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wider mb-2 inline-block">FUTURE LEADERS</div>
                   <h4 className="text-white text-xl font-bold">Collaborative Excellence</h4>
                </div>
              </motion.div>
            </div>

             {/* Recruiters */}
             <div className="grid md:grid-cols-2 gap-12 items-center mt-12 md:mt-24">
              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={scaleIn}
                className="order-2 md:order-1 glass-card rounded-3xl h-[400px] flex items-center justify-center border-white/5 relative overflow-hidden group shadow-xl"
              >
                <img src="/recruiter.png" alt="Corporate Recruiters" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8">
                   <div className="bg-emerald-500/80 backdrop-blur text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wider mb-2 inline-block">TALENT ACQUISITION</div>
                   <h4 className="text-white text-xl font-bold">Data-Driven Hiring</h4>
                </div>
              </motion.div>
              <div className="order-1 md:order-2">
                <div className="text-primary font-semibold tracking-wider uppercase mb-2">For Recruiters</div>
                <h3 className="text-3xl md:text-4xl font-bold mb-6">Discover Extraordinary Talent</h3>
                <ul className="space-y-4 mb-8">
                  {['Source pre-vetted candidates directly from specific academic programs', 'Leverage precision filters to find the exact skills and experience you need', 'Streamline your hiring pipeline with our integrated application manager', 'Engage directly with the brightest emerging minds'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="text-primary shrink-0 mt-1" size={20} />
                      <span className="text-muted-foreground text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={() => navigate('/register')} className="text-white font-medium flex items-center gap-2 hover:text-primary transition-colors">
                  Access Talent Pool <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SCHOLARSHIP CORE MODULE */}
        <section id="scholarships" className="py-24 md:py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary mb-6">
                <Award size={32} />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">A New Era of Philanthropy</h2>
              <p className="text-lg text-muted-foreground">We've completely reimagined the scholarship process. A seamless, transparent engine that connects donor generosity directly with student potential, eliminating the bureaucracy.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Box 1 */}
              <div className="bg-[#111318] border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-colors">
                <h4 className="text-xl font-semibold mb-4 text-white">Active Campaigns</h4>
                <p className="text-sm text-muted-foreground mb-6">Donors and alumni can establish named scholarships, set strict eligibility criteria (e.g., GPA, major, income), and fund them securely.</p>
                <div className="space-y-3">
                  {stats?.activeCampaigns?.map((campaign, idx) => (
                    <div key={idx} className="bg-white/5 rounded px-3 py-2 text-sm flex justify-between items-center">
                      <span className="text-white/70">"{campaign.title}"</span>
                      <span className="text-primary font-medium">${campaign.raised.toLocaleString()}</span>
                    </div>
                  ))}
                  {(!stats?.activeCampaigns || stats.activeCampaigns.length === 0) && (
                    <div className="bg-white/5 rounded px-3 py-2 text-sm flex justify-between items-center">
                      <span className="text-white/70">Loading...</span>
                    </div>
                  )}
                </div>
              </div>

               {/* Box 2 */}
               <div className="bg-[#111318] border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-colors shadow-[0_0_40px_rgba(255,98,10,0.1)] relative transform md:-translate-y-4">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
                <h4 className="text-xl font-semibold mb-4 text-white">Frictionless Applications</h4>
                <p className="text-sm text-muted-foreground mb-6">Say goodbye to endless paperwork. Students apply with a single click, with academic and financial data securely verified in real-time.</p>
                <div className="w-full h-32 border border-white/10 rounded-xl bg-background flex flex-col justify-center items-center gap-2">
                  <HeartHandshake className="text-primary" size={32} />
                  <span className="text-xs text-muted-foreground">{stats?.verificationProgress || 0}% Verified Users</span>
                  <div className="w-3/4 h-1 bg-white/10 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-primary rounded-full blur-[1px]" style={{ width: `${stats?.verificationProgress || 0}%` }} />
                  </div>
                </div>
              </div>

               {/* Box 3 */}
               <div className="bg-[#111318] border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-colors">
                <h4 className="text-xl font-semibold mb-4 text-white">Data-Driven Disbursement</h4>
                <p className="text-sm text-muted-foreground mb-6">Smart algorithms assist admins in evaluating candidates fairly. Funds are allocated with absolute precision, and donors receive vivid impact reports.</p>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2 text-white/80"><CheckCircle2 size={14} className="text-green-500" /> Automated Scoring</li>
                  <li className="flex items-center gap-2 text-white/80"><CheckCircle2 size={14} className="text-green-500" /> Fraud Detection</li>
                  <li className="flex items-center gap-2 text-white/80"><CheckCircle2 size={14} className="text-green-500" /> Real-time Audit Logs</li>
                </ul>
              </div>
            </div>
          </div>
        </section>



        {/* FINAL CTA */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
          
          <div className="max-w-4xl mx-auto px-6 relative z-10 text-center text-white">
            <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">Ready to Transform Your Future?</h2>
            <p className="text-xl md:text-2xl text-white/80 mb-10">
              Join the most innovative institutional network. Where ambition meets opportunity, and success is shared.
            </p>
            <button onClick={() => navigate('/register')} className="bg-white text-primary hover:bg-neutral-100 px-8 py-4 rounded-full font-bold text-lg transition-all shadow-xl hover:shadow-2xl">
              Create Your Free Account
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-background border-t border-white/10 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-12 mb-12">
          <div className="max-w-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary text-white p-1.5 rounded-lg">
                <GraduationCap size={20} />
              </div>
              <span className="text-lg font-bold">Alumni Connect</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              A product of <strong>LifeBox NextGen</strong>. The premier platform converging alumni success, student ambition, and institutional growth under one beautiful interface.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-white transition-colors">Twitter</a>
              <a href="#" className="text-muted-foreground hover:text-white transition-colors">GitHub</a>
              <a href="#" className="text-muted-foreground hover:text-white transition-colors">LinkedIn</a>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
            <div>
              <div className="font-semibold text-white mb-4">Product</div>
              <ul className="space-y-3 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Scholarship Engine</a></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-white mb-4">Resources</div>
              <ul className="space-y-3 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Success Stories</a></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-white mb-4">Legal</div>
              <ul className="space-y-3 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 border-t border-white/10 pt-8 text-center text-sm text-muted-foreground">
          © 2026 Alumni Connect, a product of LifeBox NextGen. All rights reserved. Designed for excellence.
        </div>
      </footer>
    </div>
  );
}


