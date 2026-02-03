import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  delay?: number;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export function MetricCard({ title, value, icon: Icon, delay = 0, trend }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-[#001F3F] rounded-2xl p-6 border border-[#D4AF37]/20"
      style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-white/70 mb-2">{title}</p>
          <h3 className="text-white" style={{ fontSize: '32px', fontWeight: 700 }}>
            {value}
          </h3>
          {trend && (
            <span 
              className={`text-sm ${trend.positive ? 'text-green-400' : 'text-red-400'}`}
            >
              {trend.value}
            </span>
          )}
        </div>
        <div 
          className="bg-[#D4AF37]/10 p-3 rounded-xl"
          style={{ boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)' }}
        >
          <Icon size={24} className="text-[#D4AF37]" />
        </div>
      </div>
    </motion.div>
  );
}
