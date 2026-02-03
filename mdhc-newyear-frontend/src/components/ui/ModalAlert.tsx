import { AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ModalAlertProps {
  show: boolean;
  message: string;
  onClose: () => void;
}

export function ModalAlert({ show, message, onClose }: ModalAlertProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="
              bg-[#001A38] 
              w-[90%]
              max-w-[420px]
              rounded-2xl 
              p-6 
              border border-[#D4AF37]/40 
              text-center 
              shadow-xl
            "
          >
            <div className="flex justify-center mb-4">
              <AlertTriangle size={42} className="text-[#FFD966]" />
            </div>

            <p className="text-white text-lg mb-6 leading-relaxed">
              {message}
            </p>

            <button
              onClick={onClose}
              className="
                w-full 
                bg-gradient-to-r from-[#D4AF37] to-[#FFD966] 
                text-[#0A0A0A] 
                py-3 
                rounded-xl 
                font-semibold 
                shadow-md 
                hover:opacity-90 
                transition
              "
            >
              OK
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
