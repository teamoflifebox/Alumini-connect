import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Variants } from 'framer-motion';
import { 
  ArrowRight, Users, Briefcase, GraduationCap, TrendingUp, 
  HeartHandshake, Award, Search, Zap, CheckCircle2, Shield, ChevronRight
} from 'lucide-react';

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

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* NAVIGATION */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-white p-2 rounded-xl">
              <GraduationCap size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">Gnan-AI Alumni Connect</span>
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
                Empowering Futures Through <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-600">
                   Connection & Mentorship
                </span>
              </motion.h1>
              
              <motion.p variants={fadeUp} className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                A unified ecosystem bringing together students, alumni, and recruiters. Find mentors, hire top talent, and fund the next generation of leaders.
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
                { label: 'Active Users', value: '50K+' },
                { label: 'Mentorships', value: '12K+' },
                { label: 'Jobs Placed', value: '8,500' },
                { label: 'Scholarship Funds', value: '$2.5M' },
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
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Everything you need to grow and give back</h2>
              <p className="text-lg text-muted-foreground">A robust feature set designed for networking, career advancement, and philanthropic impact.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: <HeartHandshake />, title: "Mentorship Matching", desc: "AI-driven algorithms pair students with the perfect alumni mentor based on career goals." },
                { icon: <Briefcase />, title: "Exclusive Job Portal", desc: "Access verified job listings and referral opportunities posted directly by alumni." },
                { icon: <Search />, title: "Advanced Search", desc: "Find peers, mentors, or candidates using advanced filters across skills, location, and industry." },
                { icon: <Award />, title: "Scholarship System", desc: "End-to-end transparent platform for creating, funding, and applying for scholarships." },
                { icon: <TrendingUp />, title: "Impact Tracking", desc: "Donors see exactly where their funds go with verifiable tracking and success stories." },
                { icon: <Shield />, title: "Verified Enterprise Security", desc: "Role-based access, JWT auth, and rigid verification keeps the network secure." },
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
                <h3 className="text-3xl md:text-4xl font-bold mb-6">Give Back & Expand Your Network</h3>
                <ul className="space-y-4 mb-8">
                  {['Offer mentorship to ambitious students', 'Post exclusive job opportunities & referrals', 'Donate directly to impactful scholarships', 'Connect with fellow industry leaders'].map((item, i) => (
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
                <h3 className="text-3xl md:text-4xl font-bold mb-6">Kickstart Your Future</h3>
                <ul className="space-y-4 mb-8">
                  {['Find industry mentors to guide your career', 'Apply for verified scholarships & financial aid', 'Discover exclusive job postings before anyone else', 'Build a compelling profile to attract recruiters'].map((item, i) => (
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
                <h3 className="text-3xl md:text-4xl font-bold mb-6">Hire Top Institution Talent</h3>
                <ul className="space-y-4 mb-8">
                  {['Post job openings directly to targeted majors', 'Search candidates by skills, GPA, & projects', 'Manage applications easily in-platform', 'Host virtual campus drives'].map((item, i) => (
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
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Transparent Scholarship System</h2>
              <p className="text-lg text-muted-foreground">A rigorous, end-to-end framework enabling donors to fund the future and giving students the financial aid they deserve without the red tape.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Box 1 */}
              <div className="bg-[#111318] border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-colors">
                <h4 className="text-xl font-semibold mb-4 text-white">Create & Fund</h4>
                <p className="text-sm text-muted-foreground mb-6">Donors and alumni can establish named scholarships, set strict eligibility criteria (e.g., GPA, major, income), and fund them securely.</p>
                <div className="space-y-3">
                  <div className="bg-white/5 rounded px-3 py-2 text-sm flex justify-between items-center">
                    <span className="text-white/70">"Tech Women Fund"</span>
                    <span className="text-primary font-medium">$10,000</span>
                  </div>
                  <div className="bg-white/5 rounded px-3 py-2 text-sm flex justify-between items-center">
                    <span className="text-white/70">"First-Gen Engineers"</span>
                    <span className="text-primary font-medium">$5,000</span>
                  </div>
                </div>
              </div>

               {/* Box 2 */}
               <div className="bg-[#111318] border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-colors shadow-[0_0_40px_rgba(255,98,10,0.1)] relative transform md:-translate-y-4">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
                <h4 className="text-xl font-semibold mb-4 text-white">Seamless Applications</h4>
                <p className="text-sm text-muted-foreground mb-6">Students apply instantly. Academic records, income proof, and SOPS are uploaded and verified on a single secure dashboard.</p>
                <div className="w-full h-32 border border-white/10 rounded-xl bg-background flex flex-col justify-center items-center gap-2">
                  <HeartHandshake className="text-primary" size={32} />
                  <span className="text-xs text-muted-foreground">Verification in Progress</span>
                  <div className="w-3/4 h-1 bg-white/10 rounded-full overflow-hidden mt-2">
                    <div className="w-2/3 h-full bg-primary rounded-full blur-[1px]" />
                  </div>
                </div>
              </div>

               {/* Box 3 */}
               <div className="bg-[#111318] border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-colors">
                <h4 className="text-xl font-semibold mb-4 text-white">Admin Approval & Impact</h4>
                <p className="text-sm text-muted-foreground mb-6">Admins score applications based on predefined metrics. Funds are disbursed accurately, and donors receive an impact report.</p>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2 text-white/80"><CheckCircle2 size={14} className="text-green-500" /> Automated Scoring</li>
                  <li className="flex items-center gap-2 text-white/80"><CheckCircle2 size={14} className="text-green-500" /> Fraud Detection</li>
                  <li className="flex items-center gap-2 text-white/80"><CheckCircle2 size={14} className="text-green-500" /> Real-time Audit Logs</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-24 bg-[#0a0a0c]">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-16 text-center">Transforming lives, one connection at a time.</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: "Sarah J.", role: "Computer Science, Class of '24", quote: "The scholarship system allowed me to finish my senior year without financial stress. The UI is so simple, and tracking my application was seamless." },
                { name: "David M.", role: "Senior Engineer at Google (Alum)", quote: "I wanted to give back to my university. Setting up a scholarship only took 5 minutes, and I get updates on how the students are doing!" },
                { name: "Elena R.", role: "Campus Recruiter at Stripe", quote: "The quality of candidates we source through Gnan-AI is unmatched. The platform's filtering tools save our team hundreds of hours." }
              ].map((t, i) => (
                <div key={i} className="p-8 rounded-2xl border border-white/5 bg-white/[0.02]">
                  <div className="flex gap-1 text-primary mb-4">
                    {[1,2,3,4,5].map(star => <StarIcon key={star} />)}
                  </div>
                  <p className="text-white/80 italic mb-6 leading-relaxed">"{t.quote}"</p>
                  <div>
                    <div className="font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
          
          <div className="max-w-4xl mx-auto px-6 relative z-10 text-center text-white">
            <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">Ready to bridge the gap?</h2>
            <p className="text-xl md:text-2xl text-white/80 mb-10">
              Join the institutional network that drives success, philanthropy, and career growth.
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
              <span className="text-lg font-bold">Gnan-AI</span>
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
          © 2026 Gnan-AI, a product of LifeBox NextGen. All rights reserved. Designed for excellence.
        </div>
      </footer>
    </div>
  );
}

function StarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )
}
