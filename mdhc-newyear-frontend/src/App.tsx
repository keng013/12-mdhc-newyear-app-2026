import { useState } from "react";
import { motion } from "motion/react";
import {
  Calendar,
  MapPin,
  Shirt,
  Sparkles,
  Gift,
  Smartphone,
  Award,
  Settings,
  Ticket,
} from "lucide-react";
import { CountdownTimer } from "./components/CountdownTimer";
import { RegistrationModal } from "./components/RegistrationModal";
import { EventCard } from "./components/EventCard";
import { PrizeCard } from "./components/PrizeCard";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";

import CheckInPage from "./components/public/CheckInPage";
import AdminApp from "./AdminApp";
import { AdminGuard } from "./components/admin/AdminGuard";

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  // Set target date for New Year 2026 (February 6, 2026, 6:00 PM)
  const targetDate = new Date("2026-02-06T18:00:00");

  const token = localStorage.getItem("token");

  // ถ้าเข้าโหมด admin
  if (showAdmin) {
    return (
      // <AdminGuard>
      <AdminApp onAuthSuccess={() => setShowAdmin(true)} />
      // </AdminGuard>
    );
    // เข้าหน้า check-in
    if (window.location.pathname === "/checkin") {
      return <CheckInPage />;
    }
  }
  return (
    <div className="min-h-screen bg-[#0D0D0D] overflow-x-hidden">
      {/* Admin Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAdmin(true)}
        className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-[#D4AF37] to-[#FFD966] p-4 rounded-full shadow-lg"
        style={{ boxShadow: "0 0 30px rgba(212, 175, 55, 0.5)" }}
        title="Admin Dashboard"
      >
        <Settings size={24} className="text-[#0A0A0A]" />
      </motion.button>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1571616050325-2b2c1f55324c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBnb2xkZW4lMjBwYXJ0eSUyMGJva2VoJTIwY2VsZWJyYXRpb258ZW58MXx8fHwxNzYzMTk2Mjk2fDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="New Year Party"
            className="w-full h-full object-cover"
          />
          {/* Dark gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(13, 13, 13, 0.7), rgba(13, 13, 13, 0.85))",
            }}
          />
          {/* Golden bokeh effect overlay */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background:
                "radial-gradient(circle at 20% 50%, rgba(212, 175, 55, 0.3), transparent 40%), radial-gradient(circle at 80% 30%, rgba(255, 217, 102, 0.3), transparent 40%)",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Decorative sparkle */}
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="inline-block mb-6"
            >
              <Sparkles size={48} className="text-[#FFD966]" />
            </motion.div>

            {/* Main Headline */}
            <h1
              className="text-[#D4AF37] mb-4 max-w-5xl mx-auto leading-tight"
              style={{ fontSize: "52px", fontWeight: 700, lineHeight: "1.2" }}
            >
              MD HEALTHCARE 'S NEW YEAR PARTY 2026
            </h1>

            {/* Subtitle */}
            <p
              className="text-white/90 mb-12 max-w-2xl mx-auto"
              style={{ fontSize: "24px", fontWeight: 300 }}
            >
              Join us for a night of celebration!
            </p>

            {/* Countdown Timer */}
            <div className="mb-12">
              <CountdownTimer targetDate={targetDate} />
            </div>

            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-[#D4AF37] to-[#FFD966] text-[#0D0D0D] px-12 py-5 rounded-2xl transition-all"
              style={{
                fontSize: "20px",
                fontWeight: 600,
                boxShadow:
                  "0 0 40px rgba(212, 175, 55, 0.6), 0 10px 30px rgba(0, 0, 0, 0.3)",
              }}
            >
              ลงทะเบียนเข้าร่วมงาน (Register Now)
            </motion.button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-[#D4AF37] rounded-full p-1">
            <motion.div
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-[#FFD966] rounded-full mx-auto"
            />
          </div>
        </motion.div>
      </section>

      {/* Event Details Section */}
      <section className="relative py-24 bg-gradient-to-b from-[#0D0D0D] to-[#001F3F]">
        <div className="container mx-auto px-4">
          {/* Section Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2
              className="text-[#FFD966] mb-4"
              style={{ fontSize: "42px", fontWeight: 700 }}
            >
              Event Details
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto" />
          </motion.div>

          {/* Event Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <EventCard
              icon={Calendar}
              title="วันที่ & เวลา"
              subtitle="February 6, 2026 18:00 - 22:00"
              delay={0.1}
            />
            <EventCard
              icon={MapPin}
              title="สถานที่"
              subtitle="Grand Ballroom Luxury Hotel Bangkok"
              delay={0.2}
            />
            <EventCard
              icon={Shirt}
              title="ธีมการแต่งกาย"
              subtitle="Cocktail Attire Elegant & Festive"
              delay={0.3}
            />
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#D4AF37] rounded-full blur-[100px] opacity-20" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#FFD966] rounded-full blur-[120px] opacity-20" />
      </section>

      {/* Prize Sneak Peek Section */}
      <section className="relative py-24 bg-[#0D0D0D]">
        <div className="container mx-auto px-4">
          {/* Section Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2
              className="text-[#FFD966] mb-4"
              style={{ fontSize: "42px", fontWeight: 700 }}
            >
              ไฮไลท์รางวัลใหญ่ปีนี้!
            </h2>
            <p
              className="text-white/80 max-w-2xl mx-auto"
              style={{ fontSize: "18px" }}
            >
              Amazing prizes await our lucky winners
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-4" />
          </motion.div>

          {/* Prize Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <PrizeCard
              icon={Smartphone}
              title="iPhone 17 Pro Max"
              delay={0.1}
            />
            <PrizeCard icon={Award} title="MacBook Pro 16-inch" delay={0.2} />
            <PrizeCard icon={Gift} title="Luxury Gift Vouchers" delay={0.3} />
            <PrizeCard
              icon={Award}
              title="Exclusive Travel Packages"
              delay={0.4}
            />
          </div>

          {/* Additional info */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <p className="text-[#D4AF37]" style={{ fontSize: "16px" }}>
              ...and many more exciting prizes!
            </p>
          </motion.div>
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#D4AF37] rounded-full blur-[150px]"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4,
            }}
            className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#FFD966] rounded-full blur-[150px]"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-[#0D0D0D] border-t border-[#D4AF37]/20 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center space-y-6">
            {/* Logo placeholder */}
            <div className="flex items-center justify-center">
              <div
                className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#FFD966] flex items-center justify-center"
                style={{
                  boxShadow: "0 0 30px rgba(212, 175, 55, 0.4)",
                }}
              >
                <span
                  className="text-[#0D0D0D]"
                  style={{ fontSize: "24px", fontWeight: 700 }}
                >
                  MD
                </span>
              </div>
            </div>

            {/* Company info */}
            <div className="text-center">
              <h3
                className="text-[#FFD966] mb-2"
                style={{ fontSize: "20px", fontWeight: 600 }}
              >
                MD Healthcare
              </h3>
              <p className="text-white/70">Making 2026 memorable together</p>
            </div>

            {/* Divider */}
            <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />

            {/* Copyright */}
            <p className="text-white/50 text-center">
              © 2024-2025 MD Healthcare. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
