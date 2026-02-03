import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Users,
  Gift,
  Sparkles,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { getPrizes } from "../../services/api";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  activePage,
  onNavigate,
  onLogout,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const [totalPrizes, setTotalPrizes] = useState<number>(0);

  useEffect(() => {
    const fetchPrizesCount = async () => {
      try {
        const response = await getPrizes();
        const prizes = response.data || [];
        const total = prizes.reduce(
          (sum: number, p: any) => sum + (p.remaining || 0),
          0,
        );
        setTotalPrizes(total);
      } catch (error) {
        console.error("Failed to fetch prizes:", error);
      }
    };
    fetchPrizesCount();
  }, [activePage]);

  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "participants", icon: Users, label: "Participants" },
    { id: "prizes", icon: Gift, label: "Prizes", badge: totalPrizes },
    { id: "lucky-draw", icon: Sparkles, label: "Lucky Draw" },
  ];

  return (
    <div
      className={`${isCollapsed ? "w-20" : "w-64"} bg-[#0A0A0A] border-r border-[#D4AF37]/20 h-screen flex flex-col transition-all duration-300`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-[#D4AF37]/20 relative">
        {/* Hamburger Button */}
        <motion.button
          onClick={onToggleCollapse}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-6 right-4 text-[#D4AF37] hover:text-[#FFD966] transition-colors"
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </motion.button>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#FFD966] flex items-center justify-center"
            style={{ boxShadow: "0 0 20px rgba(212, 175, 55, 0.3)" }}
          >
            <span className="text-[#0A0A0A]" style={{ fontWeight: 700 }}>
              MD
            </span>
          </div>
          {!isCollapsed && (
            <div>
              <h2
                className="text-white"
                style={{ fontSize: "16px", fontWeight: 600 }}
              >
                New Year Party
              </h2>
              <p className="text-white/50" style={{ fontSize: "12px" }}>
                Admin Panel
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              whileHover={{ x: isCollapsed ? 0 : 4 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center ${isCollapsed ? "justify-center" : "gap-3"} px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className="relative">
                <Icon size={20} />
                {isCollapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-[#0A0A0A] w-4 h-4 flex items-center justify-center rounded-full text-[10px] font-semibold">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              {!isCollapsed && (
                <>
                  <span style={{ fontWeight: isActive ? 600 : 400 }}>
                    {item.label}
                  </span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-auto bg-[#D4AF37] text-[#0A0A0A] px-2 py-0.5 rounded-full text-xs font-semibold">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-[#D4AF37]/20">
        <motion.button
          onClick={onLogout}
          whileHover={{ x: isCollapsed ? 0 : 4 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex items-center ${isCollapsed ? "justify-center" : "gap-3"} px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all`}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Logout</span>}
        </motion.button>
      </div>
    </div>
  );
}
