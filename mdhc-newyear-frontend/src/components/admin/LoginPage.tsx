import { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Mail, Sparkles } from 'lucide-react';
import { login } from "../../services/api";

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await login({ email, password });
      const token = res.data.token;

      localStorage.setItem("token", token);
      onLogin(); // แจ้ง AdminApp
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };
  


  return (
    <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden flex items-center justify-center">

      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(2px 2px at 20% 30%, #D4AF37, transparent),
                             radial-gradient(2px 2px at 60% 70%, #FFD966, transparent),
                             radial-gradient(1px 1px at 50% 50%, #D4AF37, transparent),
                             radial-gradient(1px 1px at 80% 10%, #FFD966, transparent),
                             radial-gradient(2px 2px at 90% 60%, #D4AF37, transparent),
                             radial-gradient(1px 1px at 30% 80?, #FFD966, transparent)`
          }}
        />
      </div>

      {/* Glow effects */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37] rounded-full blur-[150px]"
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity, delay: 4 }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FFD966] rounded-full blur-[150px]"
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <div
          className="bg-[#001F3F] rounded-3xl p-10 border border-[#D4AF37]/30"
          style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)' }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-4"
            >
              <div
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#FFD966] flex items-center justify-center"
                style={{ boxShadow: '0 0 30px rgba(212, 175, 55, 0.5)' }}
              >
                <Sparkles size={32} className="text-[#0A0A0A]" />
              </div>
            </motion.div>

            <h1 className="text-white mb-2 text-2xl font-bold">Admin Login</h1>
             <h2 className="text-white/60">MD Healthcare</h2>
             <p className="text-white/60">New Year Party 2026 Management</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div>
              <label className="block text-white/70 mb-2">Email Address</label>
              <div className="relative">
                <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#0A0A0A] text-white pl-12 pr-4 py-3 rounded-xl border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                  placeholder="admin@company.com"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-white/70 mb-2">Password</label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#0A0A0A] text-white pl-12 pr-4 py-3 rounded-xl border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-400 text-center">{error}</p>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#FFD966] text-[#0A0A0A] py-3 rounded-xl transition-all mt-6 font-semibold"
            >
              {loading ? "Logging in..." : "Login"}
            </motion.button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            Authorized Personnel Only
          </p>
        </div>
      </motion.div>
    </div>
  );
}
