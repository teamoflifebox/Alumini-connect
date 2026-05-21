import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';

interface StudentOnboardingProps {
  showOnboarding: boolean;
  step: number;
  setStep: (step: number) => void;
  goals: string[];
  setGoals: (goals: string[]) => void;
  skills: string[];
  setSkills: (skills: string[]) => void;
  handleNext: () => void;
  handleSkipOnboarding: () => void;
  toggleSelection: (item: string, list: string[], setList: (l: string[]) => void) => void;
}

export function StudentOnboarding({
  showOnboarding,
  step,
  goals,
  setGoals,
  skills,
  setSkills,
  handleNext,
  handleSkipOnboarding,
  toggleSelection
}: StudentOnboardingProps) {
  if (!showOnboarding) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
          className="bg-[#15171c] border border-white/10 rounded-3xl p-8 md:p-12 max-w-2xl w-full shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
            <motion.div 
              initial={{ width: 0 }} animate={{ width: `${(step / 3) * 100}%` }} 
              className="h-full bg-primary"
            />
          </div>

          <div className="mb-8">
            <span className="text-primary text-sm font-bold tracking-wider uppercase mb-2 block">Step {step} of 3</span>
            <h2 className="text-3xl font-bold text-white mb-2">
              {step === 1 && "What are your primary goals?"}
              {step === 2 && "What are your core interests?"}
              {step === 3 && "You're all set!"}
            </h2>
            <p className="text-muted-foreground">
              {step === 1 && "Select all that apply so we can customize your network feed."}
              {step === 2 && "We'll use this to match you with the perfect mentors and scholarships."}
              {step === 3 && "Your profile is optimized. Let's start connecting you with opportunities."}
            </p>
          </div>

          {step === 1 && (
            <div className="grid grid-cols-2 gap-4 mb-8">
              {['Find a Mentor', 'Apply for Scholarships', 'Networking', 'Job Opportunities'].map(goal => (
                <button 
                  key={goal} onClick={() => toggleSelection(goal, goals, setGoals)}
                  className={`p-4 rounded-xl border text-left transition-all ${goals.includes(goal) ? 'bg-primary/20 border-primary text-white' : 'bg-[#1c1f26] border-white/5 text-muted-foreground hover:border-white/20'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{goal}</span>
                    {goals.includes(goal) && <Check size={16} className="text-primary" />}
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-wrap gap-3 mb-8">
              {['Software Engineering', 'Data Science', 'Marketing', 'Finance', 'Design', 'Product Management', 'Cybersecurity', 'AI/ML'].map(skill => (
                <button 
                  key={skill} onClick={() => toggleSelection(skill, skills, setSkills)}
                  className={`px-4 py-2 rounded-full border text-sm transition-all ${skills.includes(skill) ? 'bg-primary text-white border-primary' : 'bg-[#1c1f26] border-white/5 text-muted-foreground hover:text-white hover:border-white/20'}`}
                >
                  {skill}
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="flex justify-center py-8">
              <div className="w-24 h-24 rounded-full bg-primary/20 border border-primary text-primary flex items-center justify-center">
                <Check size={48} />
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mt-8">
            <button 
              onClick={handleSkipOnboarding} 
              className="text-muted-foreground hover:text-white transition-colors text-sm font-medium"
            >
              Skip for now
            </button>
            <button 
              onClick={handleNext}
              className="bg-primary hover:bg-brand-600 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(255,98,10,0.3)] flex items-center gap-2"
            >
              {step === 3 ? "Enter Dashboard" : "Continue"}
              {step !== 3 && <ChevronRight size={18} />}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
