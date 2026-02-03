import { useState } from "react";
import { Sidebar } from "./components/admin/Sidebar";
import { Header } from "./components/admin/Header";
import { LoginPage } from "./components/admin/LoginPage";
import { DashboardPage } from "./components/admin/DashboardPage";
import { ParticipantsPage } from "./components/admin/ParticipantsPage";
import { PrizesPage } from "./components/admin/PrizesPage";
import { LuckyDrawControl } from "./components/admin/LuckyDrawControl";
import { LuckyDrawProjector } from "./components/admin/LuckyDrawProjector";

type Page = "dashboard" | "participants" | "prizes" | "lucky-draw";

export default function AdminApp({
  onAuthSuccess,
}: {
  onAuthSuccess: () => void;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [showProjector, setShowProjector] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [projectorData, setProjectorData] = useState<{
    participants: any[];
    selectedPrize: any;
    winner: any;
  }>({ participants: [], selectedPrize: null, winner: null });

  const handleLogin = () => {
    setIsAuthenticated(true);
    onAuthSuccess(); // แจ้ง App.tsx ว่า login สำเร็จแล้ว
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const getPageTitle = () => {
    switch (currentPage) {
      case "dashboard":
        return "Dashboard Overview";
      case "participants":
        return "Participants Management";
      case "prizes":
        return "Prize Management";
      case "lucky-draw":
        return "Lucky Draw Control";
    }
  };

  return (
    <div className="flex h-screen bg-[#0A0A0A]">
      <Sidebar
        activePage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={getPageTitle()} />

        <main className="flex-1 overflow-y-auto bg-[#001F3F]/30">
          {currentPage === "dashboard" && (
            <DashboardPage
              onStartLuckyDraw={() => setCurrentPage("lucky-draw")}
            />
          )}
          {currentPage === "participants" && <ParticipantsPage />}
          {currentPage === "prizes" && <PrizesPage />}
          {currentPage === "lucky-draw" && (
            <LuckyDrawControl
              onOpenProjector={(data) => {
                setProjectorData(data);
                setShowProjector(true);
              }}
            />
          )}
        </main>
      </div>

      <LuckyDrawProjector
        isOpen={showProjector}
        onClose={() => setShowProjector(false)}
        participants={projectorData.participants}
        selectedPrize={projectorData.selectedPrize}
        winner={projectorData.winner}
      />
    </div>
  );
}
