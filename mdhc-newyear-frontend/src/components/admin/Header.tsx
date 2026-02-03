import { Bell, User } from 'lucide-react';

interface HeaderProps {
  title: string;
  userName?: string;
}

export function Header({ title, userName = 'Admin User' }: HeaderProps) {
  return (
    <header className="bg-[#0A0A0A] border-b border-[#D4AF37]/20 px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Page Title */}
        <h1 className="text-white" style={{ fontSize: '24px', fontWeight: 600 }}>
          {title}
        </h1>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
            <Bell size={20} className="text-white/70" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#D4AF37] rounded-full" />
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-[#D4AF37]/20">
            <div className="text-right">
              <p className="text-white text-sm" style={{ fontWeight: 500 }}>
                {userName}
              </p>
              <p className="text-white/50 text-xs">Administrator</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#FFD966] flex items-center justify-center">
              <User size={20} className="text-[#0A0A0A]" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
