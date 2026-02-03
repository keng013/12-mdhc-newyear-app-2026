import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface EventCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  delay: number;
}

export function EventCard({ icon: Icon, title, subtitle, delay }: EventCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group relative"
    >
      <div 
        className="bg-[#0A1A2F] rounded-2xl p-8 border border-[#D4AF37] transition-all duration-300 group-hover:border-[#FFD966] h-full"
        style={{
          boxShadow: '0 4px 20px rgba(212, 175, 55, 0.15)',
        }}
      >
        {/* Glow effect on hover */}
        <div 
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'radial-gradient(circle at center, rgba(212, 175, 55, 0.1), transparent 70%)',
            pointerEvents: 'none'
          }}
        />
        
        <div className="relative z-10">
          {/* Icon */}
          <div className="mb-6 inline-block">
            <div 
              className="bg-gradient-to-br from-[#D4AF37] to-[#FFD966] p-4 rounded-xl"
              style={{
                boxShadow: '0 0 20px rgba(212, 175, 55, 0.4)'
              }}
            >
              <Icon size={32} className="text-[#0D0D0D]" strokeWidth={2.5} />
            </div>
          </div>

          {/* Content */}
          <h3 
            className="text-[#D4AF37] mb-3"
            style={{ fontSize: '22px', fontWeight: 600 }}
          >
            {title}
          </h3>
          <p 
            className="text-white/90 leading-relaxed"
            style={{ fontSize: '16px' }}
          >
            {subtitle}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
