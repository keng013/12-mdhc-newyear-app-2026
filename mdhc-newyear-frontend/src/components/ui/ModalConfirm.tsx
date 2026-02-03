import { AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ModalConfirmProps {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function ModalConfirm({
  show,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
}: ModalConfirmProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="
              bg-[#001A38] 
              w-[90%]
              max-w-[480px]
              rounded-2xl 
              p-6 
              border border-[#D4AF37]/40 
              shadow-xl
            "
          >
            <div className="flex justify-center mb-4">
              <AlertTriangle size={48} className="text-[#FFD966]" />
            </div>

            <h3 className="text-white text-xl font-semibold text-center mb-3">
              {title}
            </h3>

            <p className="text-white/80 text-base mb-6 leading-relaxed text-center whitespace-pre-line">
              {message}
            </p>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="
                  flex-1
                  bg-[#0A0A0A]
                  text-white
                  border border-[#D4AF37]/20
                  py-3 
                  rounded-xl 
                  font-semibold 
                  hover:bg-[#0A0A0A]/80
                  transition
                "
              >
                {cancelText}
              </button>

              <button
                onClick={onConfirm}
                className="
                  flex-1
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
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
