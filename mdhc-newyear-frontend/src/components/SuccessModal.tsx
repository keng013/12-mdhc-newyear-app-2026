import { motion, AnimatePresence } from 'motion/react';
import { Gift, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SuccessModalProps {
  isOpen: boolean;
}

// Confetti piece component
const Confetti = ({ delay }: { delay: number }) => {
  const colors = ['#D4AF37', '#FFD966', '#FF6B9D', '#4ECDC4', '#FFA07A'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const randomX = Math.random() * 100 - 50;
  const randomRotate = Math.random() * 360;
  
  return (
    <motion.div
      initial={{ 
        y: -20, 
        x: 0, 
        rotate: 0, 
        opacity: 1 
      }}
      animate={{ 
        y: window.innerHeight, 
        x: randomX,
        rotate: randomRotate,
        opacity: 0 
      }}
      transition={{ 
        duration: 2 + Math.random() * 2, 
        delay,
        ease: "linear"
      }}
      className="absolute"
      style={{
        left: `${Math.random() * 100}%`,
        top: -10,
      }}
    >
      <div 
        className="w-2 h-2 md:w-3 md:h-3"
        style={{ 
          backgroundColor: randomColor,
          transform: `rotate(${Math.random() * 45}deg)`
        }}
      />
    </motion.div>
  );
};

export function SuccessModal({ isOpen }: SuccessModalProps) {
  const [confettiPieces, setConfettiPieces] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Generate confetti pieces
      const pieces = Array.from({ length: 80 }, (_, i) => i);
      setConfettiPieces(pieces);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Confetti */}
          <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
            {confettiPieces.map((piece) => (
              <Confetti key={piece} delay={piece * 0.01} />
            ))}
          </div>

          {/* Success Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 text-center relative overflow-hidden">
              {/* Background decoration */}
              <div 
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: 'radial-gradient(circle, #D4AF37 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}
              />
              
              <div className="relative z-10">
                {/* Success icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: 'spring', 
                    delay: 0.2,
                    stiffness: 200 
                  }}
                  className="inline-block mb-6"
                >
                  <div className="relative">
                    <CheckCircle 
                      size={80} 
                      className="text-green-500"
                      strokeWidth={2}
                    />
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.4, type: 'spring' }}
                      className="absolute -top-2 -right-2"
                    >
                      <Gift size={32} className="text-[#D4AF37]" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Success message */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-[#0D0D0D] mb-3"
                  style={{ fontSize: '32px', fontWeight: 700 }}
                >
                  ลงทะเบียนสำเร็จ!
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600 mb-6"
                  style={{ fontSize: '18px' }}
                >
                  คุณถูกเพิ่มในระบบสุ่มรางวัลเรียบร้อยแล้ว 🎁
                </motion.p>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-r from-[#FFD966]/20 to-[#D4AF37]/20 rounded-2xl p-4 border border-[#D4AF37]/30"
                >
                  <p className="text-gray-700">
                    We look forward to celebrating with you!
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
