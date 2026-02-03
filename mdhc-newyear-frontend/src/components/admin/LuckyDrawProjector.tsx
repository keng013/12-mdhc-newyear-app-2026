import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles } from "lucide-react";

interface LuckyDrawProjectorProps {
  isOpen: boolean;
  onClose: () => void;
  participants: any[];
  selectedPrize: { name: string } | null;
  winner: {
    winner_name: string;
    department: string;
    prize_name: string;
    employeeId: string;
    avatarUrl?: string | null;
  } | null;
}

type DrawState = "standby" | "drawing" | "winner";

interface Winner {
  name: string;
  department: string;
  prize: string;
  employeeId: string;
  avatarUrl?: string | null;
}

// Confetti component
const Confetti = ({ delay }: { delay: number }) => {
  const colors = ["#D4AF37", "#FFD966", "#FF6B9D", "#4ECDC4", "#FFA07A"];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const randomX = Math.random() * 100 - 50;
  const randomRotate = Math.random() * 360;

  return (
    <motion.div
      initial={{ y: -20, x: 0, rotate: 0, opacity: 1 }}
      animate={{
        y: window.innerHeight + 100,
        x: randomX,
        rotate: randomRotate,
        opacity: 0,
      }}
      transition={{ duration: 3 + Math.random() * 2, delay, ease: "linear" }}
      className="absolute"
      style={{ left: `${Math.random() * 100}%`, top: -20 }}
    >
      <div
        className="w-3 h-3"
        style={{
          backgroundColor: randomColor,
          transform: `rotate(${Math.random() * 45}deg)`,
        }}
      />
    </motion.div>
  );
};

export function LuckyDrawProjector({
  isOpen,
  onClose,
  participants,
  selectedPrize,
  winner: externalWinner,
}: LuckyDrawProjectorProps) {
  const [drawState, setDrawState] = useState<DrawState>("standby");
  const [currentName, setCurrentName] = useState("");
  const [winner, setWinner] = useState<Winner | null>(null);
  const [confettiPieces, setConfettiPieces] = useState<number[]>([]);

  // Extract participant names from real data
  const participantNames = participants.map(
    (p) => p.fullName || p.name || "Unknown",
  );
  const validParticipants =
    participantNames.length > 0
      ? participantNames
      : ["Participant 1", "Participant 2", "Participant 3"];

  useEffect(() => {
    if (isOpen) {
      setDrawState("standby");
      setWinner(null);
      setConfettiPieces([]);

      // If winner data is provided, start drawing immediately
      if (externalWinner) {
        setTimeout(() => {
          startDrawing();
        }, 2000);
      }
    }
  }, [isOpen, externalWinner]);

  const startDrawing = () => {
    setDrawState("drawing");
    let counter = 0;
    const interval = setInterval(() => {
      setCurrentName(
        validParticipants[Math.floor(Math.random() * validParticipants.length)],
      );
      counter++;
      if (counter > 30) {
        clearInterval(interval);
        showWinner();
      }
    }, 100);
  };

  const showWinner = () => {
    if (externalWinner) {
      const winnerData: Winner = {
        name: externalWinner.winner_name,
        department: externalWinner.department,
        prize: externalWinner.prize_name,
        employeeId: externalWinner.employeeId,
        avatarUrl: externalWinner.avatarUrl,
      };
      setWinner(winnerData);
    } else {
      // Fallback if no winner data
      const winnerData: Winner = {
        name: "Winner",
        department: "Department",
        prize: selectedPrize?.name || "Prize",
        employeeId: "000",
        avatarUrl: null,
      };
      setWinner(winnerData);
    }
    setDrawState("winner");

    // Trigger confetti
    const pieces = Array.from({ length: 150 }, (_, i) => i);
    setConfettiPieces(pieces);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#0A0A0A] z-50 overflow-hidden"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-8 right-8 z-50 text-white/50 hover:text-white transition-colors"
      >
        <X size={32} />
      </button>

      {/* Background effects */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37] rounded-full blur-[200px]"
        />
        <motion.div
          animate={{
            scale: [1.5, 1, 1.5],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FFD966] rounded-full blur-[200px]"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          {/* Standby State */}
          {drawState === "standby" && (
            <motion.div
              key="standby"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="mb-8 inline-block"
              >
                <Sparkles size={80} className="text-[#D4AF37]" />
              </motion.div>

              <h1
                className="text-[#D4AF37] mb-8"
                style={{ fontSize: "64px", fontWeight: 700 }}
              >
                ขอเชิญพบกับผู้โชคดีคนต่อไป…
              </h1>

              {/* Scrolling names */}
              <div className="overflow-hidden h-20">
                <motion.div
                  animate={{ y: [0, -2000] }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="space-y-4"
                >
                  {[
                    ...validParticipants,
                    ...validParticipants,
                    ...validParticipants,
                  ].map((name, index) => (
                    <p key={index} className="text-white/50 text-xl">
                      {name}
                    </p>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Drawing State */}
          {drawState === "drawing" && (
            <motion.div
              key="drawing"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="text-center"
            >
              {/* Spinning animation */}
              <motion.div
                animate={{
                  rotateY: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="mb-12"
              >
                <div
                  className="bg-gradient-to-br from-[#D4AF37] to-[#FFD966] w-48 h-48 mx-auto rounded-3xl flex items-center justify-center"
                  style={{
                    boxShadow: "0 0 100px rgba(212, 175, 55, 0.6)",
                    transform: "perspective(1000px)",
                  }}
                >
                  <Sparkles size={64} className="text-[#0A0A0A]" />
                </div>
              </motion.div>

              {/* Rapidly changing name */}
              <motion.h2
                key={currentName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-white mb-4"
                style={{ fontSize: "72px", fontWeight: 700 }}
              >
                {currentName}
              </motion.h2>

              <p className="text-[#D4AF37]" style={{ fontSize: "32px" }}>
                Drawing...
              </p>
            </motion.div>
          )}

          {/* Winner State */}
          {drawState === "winner" && winner && (
            <motion.div
              key="winner"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="text-center max-w-4xl mx-auto px-8"
            >
              {/* Confetti */}
              <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {confettiPieces.map((piece) => (
                  <Confetti key={piece} delay={piece * 0.01} />
                ))}
              </div>

              {/* Congratulations */}
              <motion.h1
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-[#D4AF37] mb-6"
                style={{
                  fontSize: "64px",
                  fontWeight: 700,
                  textShadow: "0 0 40px rgba(212, 175, 55, 0.5)",
                }}
              >
                🎉 Congratulations! 🎉
              </motion.h1>

              {/* Winner Profile Photo */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="mb-6"
              >
                <div
                  className="w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-[#D4AF37] to-[#FFD966] flex items-center justify-center"
                  style={{
                    boxShadow: "0 0 80px rgba(212, 175, 55, 0.8)",
                    border: "6px solid #0A0A0A",
                  }}
                >
                  <span
                    className="text-[#0A0A0A]"
                    style={{ fontSize: "64px", fontWeight: 700 }}
                  >
                    {winner.name.charAt(0)}
                  </span>
                </div>
              </motion.div>

              {/* Winner Name */}
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-white mb-2"
                style={{ fontSize: "72px", fontWeight: 700 }}
              >
                {winner.name}
              </motion.h2>

              {/* Employee ID */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.75 }}
                className="text-[#D4AF37] mb-3"
                style={{ fontSize: "28px", fontWeight: 600 }}
              >
                {winner.employeeId}
              </motion.p>

              {/* Department */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-white/80 mb-8"
                style={{ fontSize: "32px" }}
              >
                {winner.department}
              </motion.p>

              {/* Prize */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="bg-gradient-to-r from-[#D4AF37] to-[#FFD966] rounded-3xl py-6 px-10 inline-block"
                style={{
                  boxShadow: "0 0 60px rgba(212, 175, 55, 0.6)",
                }}
              >
                <p className="text-[#0A0A0A] mb-2" style={{ fontSize: "20px" }}>
                  Prize:
                </p>
                <h3
                  className="text-[#0A0A0A]"
                  style={{ fontSize: "40px", fontWeight: 700 }}
                >
                  {winner.prize}
                </h3>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
