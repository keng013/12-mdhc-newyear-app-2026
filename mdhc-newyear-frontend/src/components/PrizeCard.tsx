import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface PrizeCardProps {
  icon: LucideIcon;
  title: string;
  delay: number;
}

export function PrizeCard({ icon: Icon, title, delay }: PrizeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
      className="group"
    >
      <div 
        className="relative bg-gradient-to-br from-[#0D0D0D] to-[#001F3F] rounded-2xl p-8 border border-[#D4AF37]/40 overflow-hidden"
        style={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Animated glow effect */}
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              'radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.3), transparent 60%)',
              'radial-gradient(circle at 50% 50%, rgba(255, 217, 102, 0.3), transparent 60%)',
              'radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.3), transparent 60%)',
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Sparkle effect */}
        <div className="absolute top-4 right-4">
          <motion.div
            animate={{ 
              rotate: [0, 180, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-2 h-2 bg-[#FFD966] rounded-full shadow-lg"
              style={{
                boxShadow: '0 0 10px rgba(255, 217, 102, 0.8)'
              }}
            />
          </motion.div>
        </div>

        <div className="relative z-10 text-center">
          {/* Icon with glow */}
          <motion.div
            className="mb-6 inline-block"
            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
          >
            <div 
              className="bg-gradient-to-br from-[#D4AF37] to-[#FFD966] p-6 rounded-full"
              style={{
                boxShadow: '0 0 40px rgba(212, 175, 55, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.3)'
              }}
            >
              <Icon size={48} className="text-[#0D0D0D]" strokeWidth={2} />
            </div>
          </motion.div>

          {/* Title */}
          <h3 
            className="text-[#FFD966]"
            style={{ fontSize: '20px', fontWeight: 600 }}
          >
            {title}
          </h3>
          
          {/* Decorative line */}
          <div className="mt-4 h-1 w-16 mx-auto bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent rounded-full" />
        </div>
      </div>
    </motion.div>
  );
}
