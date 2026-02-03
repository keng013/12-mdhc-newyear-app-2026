import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Users, Gift, Award, Sparkles } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { getDashboardStats, getLuckyDrawResults } from "../../services/api";

interface DashboardPageProps {
  onStartLuckyDraw: () => void;
}

export function DashboardPage({ onStartLuckyDraw }: DashboardPageProps) {
  const [stats, setStats] = useState<any>(null);
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const resStats = await getDashboardStats();
        const resWinners = await getLuckyDrawResults();

        setStats(resStats.data.data);
        // Get latest 5 winners
        setWinners(resWinners.data.slice(0, 5));
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-white text-center">Loading dashboard...</div>
    );
  }

  return (
    <div className="p-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Total Participants"
          value={stats.totalParticipants}
          icon={Users}
          delay={0.1}
          trend={{
            value: `Checked in: ${stats.checkedInParticipants}`,
            positive: true,
          }}
        />

        <MetricCard
          title="Total Prizes"
          value={stats.remainingPrizes}
          icon={Gift}
          delay={0.2}
        />

        <MetricCard
          title="Distributed Prizes"
          value={stats.distributedPrizes}
          icon={Award}
          delay={0.3}
        />
      </div>

      {/* Lucky Draw Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-gradient-to-br from-[#001F3F] to-[#0A1A2F] rounded-2xl p-10 border border-[#D4AF37]/30 text-center relative overflow-hidden"
        style={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)" }}
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle, #D4AF37 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />

        <div className="relative z-10">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-6"
          >
            <Sparkles size={64} className="text-[#D4AF37]" />
          </motion.div>

          <h2
            className="text-white mb-4"
            style={{ fontSize: "32px", fontWeight: 700 }}
          >
            Ready to Draw?
          </h2>
          <p className="text-white/70 mb-8 max-w-2xl mx-auto">
            Start the lucky draw session to select winners for tonight's amazing
            prizes!
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStartLuckyDraw}
            className="bg-gradient-to-r from-[#D4AF37] to-[#FFD966] text-[#0A0A0A] px-16 py-5 rounded-2xl transition-all inline-flex items-center gap-3"
            style={{
              fontSize: "20px",
              fontWeight: 700,
              boxShadow: "0 0 50px rgba(212, 175, 55, 0.6)",
            }}
          >
            <Sparkles size={24} />
            Start Lucky Draw
          </motion.button>
        </div>
      </motion.div>

      {/* Recent Winners */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-8 bg-[#001F3F] rounded-2xl p-6 border border-[#D4AF37]/20"
      >
        <h3
          className="text-white mb-4"
          style={{ fontSize: "20px", fontWeight: 600 }}
        >
          Recent Winners
        </h3>

        <div className="space-y-3">
          {winners.length === 0 && (
            <p className="text-white/50">No recent winners</p>
          )}

          {winners.map((winner, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 px-4 bg-[#0A0A0A]/50 rounded-xl"
            >
              <div className="flex-1">
                <p className="text-white font-medium">{winner.winner_name}</p>
                <p className="text-[#D4AF37] text-sm">{winner.prize_name}</p>
              </div>

              <div className="text-right">
                <p className="text-white/60 text-sm">
                  {winner.department || "-"}
                </p>
                <p className="text-white/40 text-xs">
                  {new Date(winner.created_at).toLocaleString("th-TH", {
                    timeZone: "Asia/Bangkok",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
