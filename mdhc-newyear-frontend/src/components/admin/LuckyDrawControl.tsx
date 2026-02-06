import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Monitor,
  RefreshCw,
  Sparkles,
  Trash2,
  Download,
} from "lucide-react";
import {
  getPrizes,
  getParticipants,
  startLuckyDraw,
  redrawLuckyDraw,
  getLuckyDrawResults,
  resetPrizes,
} from "../../services/api";

import { ModalAlert } from "../ui/ModalAlert";
import { ModalConfirm } from "../ui/ModalConfirm";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface Winner {
  id: string;
  winner_name: string;
  department: string;
  prize_name: string;
  created_at: string;
  employeeId?: string;
}

interface Prize {
  id: string;
  name: string;
  category: "SMALL" | "MEDIUM" | "BIG" | "GRAND";
  remaining: number;
}

interface LuckyDrawControlProps {
  onOpenProjector: (data: {
    participants: any[];
    selectedPrize: any;
    winner: any;
  }) => void;
}

export function LuckyDrawControl({ onOpenProjector }: LuckyDrawControlProps) {
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);

  // Audio elements (lazy init and stable ref)
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({
    draw: null,
    winner: null,
    click: null,
  });

  // Confirmation modals
  const [showRedrawConfirm, setShowRedrawConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("SMALL");
  const [selectedPrize, setSelectedPrize] = useState<string>("");

  const [prizeList, setPrizeList] = useState<Prize[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [lastResultId, setLastResultId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isRedrawing, setIsRedrawing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [winner, setWinner] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isProjectorOpen, setProjectorOpen] = useState(false);

  // ----------------------------------------------------------
  // Play Sound
  // ----------------------------------------------------------
  const playSound = (type: "draw" | "winner" | "click") => {
    if (!soundEnabled) return;
    try {
      let audio = audioRefs.current[type];
      if (!audio) {
        // Respect Vite base URL (app may be served under a subpath)
        const base = (import.meta as any).env?.BASE_URL || "/";
        const src = `${base.replace(/\/$/, "")}/sounds/${type}.mp3`;
        audio = new Audio(src);
        audio.preload = "auto";
        audioRefs.current[type] = audio;
      }
      audio.currentTime = 0;
      const p = audio.play();
      if (p && typeof (p as any).catch === "function") {
        (p as Promise<void>).catch((err) =>
          console.log("Audio play failed:", err),
        );
      }
    } catch (error) {
      console.log("Sound error:", error);
    }
  };

  // ----------------------------------------------------------
  // Load participants + drawn results
  // ----------------------------------------------------------
  const loadData = async () => {
    const pRaw = await getParticipants();
    const rRaw = await getLuckyDrawResults();

    const participantsList = Array.isArray(pRaw?.data?.data)
      ? pRaw.data.data
      : [];

    const drawn = Array.isArray(rRaw?.data) ? rRaw.data : [];

    setParticipants(participantsList);
    setResults(drawn);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ----------------------------------------------------------
  // Get participants who have NOT been drawn
  // ----------------------------------------------------------
  const getAvailableParticipants = () => {
    const drawnIds = results.map((r) => r.employeeId);

    return participants.filter((p) => !drawnIds.includes(p.employeeId));
  };

  // ==== Modal Helper ====
  const showModal = (msg: string) => {
    setAlertMessage(msg);
    setShowAlert(true);
  };
  const formatThaiDateTime = (date: Date) => {
    return date.toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatWinnerDate = (isoString: string) => {
    const date = new Date(isoString);

    const formatted = date.toLocaleString("th-TH", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Bangkok",
    });

    // ได้รูปแบบ: 16/11/2568 15:26:42
    // ต้องแปลงเป็น DD-MM-YYYY HH:mm:ss
    const [d, t] = formatted.split(" ");
    const [day, month, yearBE] = d.split("/");

    const year = (parseInt(yearBE) - 543).toString(); // แปลง พ.ศ. → ค.ศ.

    return `${day}-${month}-${year} ${t}`;
  };

  // ==== Load Prizes ====
  const loadPrizes = async () => {
    try {
      const res = await getPrizes();
      const items = res.data.filter((p: Prize) => p.remaining > 0);
      setPrizeList(items);
    } catch (err) {
      console.error("Failed to load prizes:", err);
    }
  };

  // ==== Load Winners ====
  const loadWinners = async () => {
    try {
      const res = await getLuckyDrawResults();
      const list = res.data;
      setWinners(list);
      setLastUpdated(formatThaiDateTime(new Date()));
      // set last result id (index 0 = ล่าสุด)
      if (list.length > 0) {
        setLastResultId(list[0].id);
      }
    } catch (err) {
      console.error("Failed to load winners:", err);
    }
  };
  useEffect(() => {
    loadPrizes();
    loadWinners();
  }, []);

  // ==== Start Draw ====
  const handleStartDraw = async () => {
    if (!selectedPrize) {
      showModal("Please select a prize before drawing.");
      return;
    }

    // Clear previous winner
    setWinner(null);

    playSound("draw");
    setIsDrawing(true);

    try {
      const res = await startLuckyDraw({ prizeId: selectedPrize });

      console.log("Raw startLuckyDraw response =", res);

      const result = res?.data;
      if (!result || !result.participant || !result.prize) {
        throw new Error("Invalid response format");
      }

      // winner object based on real response
      const winnerData = {
        winner_name: result.participant.fullName,
        department: result.participant.department,
        prize_name: result.prize.name,
        employeeId: result.participant.employeeId,
        avatarUrl: result.participant.avatarUrl || null,
      };

      // Get selected prize details
      const selectedPrizeObj = prizeList.find((p) => p.id === selectedPrize);

      // Play winner sound and open projector FIRST
      playSound("winner");
      onOpenProjector({
        participants,
        selectedPrize: selectedPrizeObj || { name: result.prize.name },
        winner: winnerData,
      });

      // Then update UI and reload data
      setWinner(winnerData);

      await loadPrizes();
      await loadWinners();
      await loadData();
    } catch (err) {
      console.error("Start draw error:", err);
      showModal("Failed to start draw.");
    } finally {
      setIsDrawing(false);
    }
  };

  // ==== Re-Draw ====
  const handleRedraw = async () => {
    if (isRedrawing) return;
    if (!winners || winners.length === 0) {
      // show modal / toast
      setAlertMessage("No winners to redraw.");
      setShowAlert(true);
      return;
    }

    // assume winners are sorted newest-first
    const last = winners[0];
    if (!last || !last.id) {
      console.warn("Redraw: last winner or last.id missing", last);
      setAlertMessage("Unable to determine last winner.");
      setShowAlert(true);
      return;
    }

    // Show confirmation modal
    setShowRedrawConfirm(true);
  };

  const confirmRedraw = async () => {
    const last = winners[0];
    setShowRedrawConfirm(false);

    setIsRedrawing(true);
    try {
      // Call redraw API
      const res = await redrawLuckyDraw(last.id);

      console.log("Redraw response =", res);

      const result = res?.data;
      if (!result || !result.participant || !result.prize) {
        throw new Error("Invalid redraw response format");
      }

      // Create winner object from response
      const newWinnerData = {
        winner_name: result.participant.fullName,
        department: result.participant.department,
        prize_name: result.prize.name,
        employeeId: result.participant.employeeId,
        avatarUrl: result.participant.avatarUrl || null,
      };

      // Get selected prize details for projector
      const prizeObj = prizeList.find((p) => p.id === result.prize.id) || {
        name: result.prize.name,
      };

      // Play winner sound and open projector FIRST
      playSound("winner");
      onOpenProjector({
        participants,
        selectedPrize: prizeObj,
        winner: newWinnerData,
      });

      // Then update local winner state and reload data
      setWinner(newWinnerData);

      await loadPrizes();
      await loadWinners();
      await loadData();

      // Show success message
      showModal(
        `✅ Successfully redrawn! New winner: ${newWinnerData.winner_name}`,
      );
    } catch (err: any) {
      console.error("Redraw failed", err);
      setAlertMessage(err?.response?.data?.error || "Failed to redraw");
      setShowAlert(true);
    } finally {
      setIsRedrawing(false);
    }
  };

  // ==== Reset All Draws ====
  const handleResetDraw = async () => {
    if (isResetting) return;
    // Show confirmation modal
    setShowResetConfirm(true);
  };

  const confirmResetDraw = async () => {
    setShowResetConfirm(false);

    setIsResetting(true);
    try {
      await resetPrizes();

      // Clear local state
      setWinners([]);
      setResults([]);
      setLastResultId(null);
      setWinner(null);

      // Reload data
      await loadPrizes();
      await loadWinners();
      await loadData();

      showModal("✅ All draw results have been reset successfully.");
    } catch (err: any) {
      console.error("Reset failed", err);
      showModal(err?.response?.data?.error || "Failed to reset draws.");
    } finally {
      setIsResetting(false);
    }
  };

  // ==== Export Winners to Excel ====
  const exportWinnersToExcel = () => {
    if (!winners || winners.length === 0) {
      setAlertMessage("No winners to export");
      setShowAlert(true);
      return;
    }

    const data = winners.map((w, index) => ({
      No: index + 1,
      "Employee ID": w.employeeId || "-",
      Name: w.winner_name,
      Department: w.department || "-",
      Prize: w.prize_name,
      "Date/Time": new Date(w.created_at).toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      }),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Winners");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    saveAs(dataBlob, `lucky-draw-winners-${timestamp}.xlsx`);
  };

  return (
    <>
      {/* CONFIRMATION MODALS */}
      <ModalConfirm
        show={showRedrawConfirm}
        title="Re-draw Last Winner?"
        message="This will remove the previous result and draw a new winner. Are you sure?"
        onConfirm={confirmRedraw}
        onCancel={() => setShowRedrawConfirm(false)}
        confirmText="Re-draw"
        cancelText="Cancel"
      />

      <ModalConfirm
        show={showResetConfirm}
        title="⚠️ WARNING: Reset All Draws?"
        message={`This will delete ALL lucky draw results and reset all prize remaining counts.\n\nThis action cannot be undone.\n\nAre you sure?`}
        onConfirm={confirmResetDraw}
        onCancel={() => setShowResetConfirm(false)}
        confirmText="Reset All"
        cancelText="Cancel"
      />

      {/* MODAL ALERT */}
      <ModalAlert
        show={showAlert}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CONTROL PANEL */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#001F3F] rounded-2xl p-6 border border-[#D4AF37]/30 sticky top-8"
            >
              <h2 className="text-white mb-6 text-2xl font-semibold">
                Draw Control
              </h2>

              {/* Category */}
              <label className="block text-white/70 mb-2">Prize Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedPrize("");
                }}
                className="w-full bg-[#0A0A0A] text-white px-4 py-3 rounded-xl mb-4 border border-[#D4AF37]/20"
              >
                <option value="SMALL">Small</option>
                <option value="MEDIUM">Medium</option>
                <option value="BIG">Big</option>
                <option value="GRAND">Grand</option>
              </select>

              {/* Prize */}
              <label className="block text-white/70 mb-2">Select Prize</label>
              <select
                value={selectedPrize}
                onChange={(e) => setSelectedPrize(e.target.value)}
                className="w-full bg-[#0A0A0A] text-white px-4 py-3 rounded-xl mb-6 border border-[#D4AF37]/20"
              >
                <option value="">-- Choose Prize --</option>
                {prizeList
                  .filter((p) => p.category === selectedCategory)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.remaining} left)
                    </option>
                  ))}
              </select>

              {/* Start Draw */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartDraw}
                disabled={isDrawing}
                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#FFD966] 
                text-black py-4 rounded-xl mb-3 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles size={24} />
                Start Lucky Draw
              </motion.button>

              {/* Re-draw */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRedraw}
                disabled={isRedrawing}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl mb-3
                flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <RotateCcw size={20} />
                Re-draw Last Winner
              </motion.button>

              {/* Reset All Draws */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleResetDraw}
                disabled={isResetting}
                className="w-full bg-red-900 hover:bg-red-800 text-white py-3 rounded-xl mb-6
                flex items-center justify-center gap-2 transition-colors disabled:opacity-50 border border-red-700"
              >
                <Trash2 size={20} />
                Reset All Draws
              </motion.button>

              {/* Sound */}
              <button
                onClick={() => {
                  playSound("click");
                  setSoundEnabled(!soundEnabled);
                }}
                className="w-full bg-[#0A0A0A] text-white py-3 rounded-xl flex items-center justify-between px-4"
              >
                <span>Sound</span>
                {soundEnabled ? <Volume2 /> : <VolumeX />}
              </button>
            </motion.div>
          </div>

          {/* WINNER LIST */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#001F3F] rounded-2xl p-6 border border-[#D4AF37]/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-2xl font-semibold">
                  Recent Winners
                </h2>

                <div className="flex gap-2">
                  <button
                    onClick={exportWinnersToExcel}
                    className="p-2 rounded-xl border border-[#D4AF37]/30 text-[#D4AF37]
                       hover:bg-[#D4AF37]/10 transition-all"
                    title="Export to Excel"
                  >
                    <Download size={20} />
                  </button>
                  <button
                    onClick={loadWinners}
                    className="p-2 rounded-xl border border-[#D4AF37]/30 text-[#D4AF37]
                       hover:bg-[#D4AF37]/10 transition-all"
                    title="Refresh"
                  >
                    <RefreshCw size={20} />
                  </button>
                </div>
              </div>
              {/* LAST UPDATE TIME */}
              <p className="text-white/40 text-sm mb-6">
                Last update: {lastUpdated + " น." || "—"}
              </p>
              <div className="space-y-3">
                {winners.map((w, idx) => (
                  <motion.div
                    key={w.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-[#0A1A2F] rounded-xl p-4 border border-[#D4AF37]/10"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-semibold">
                          {w.winner_name}
                        </h4>
                        <p className="text-[#D4AF37] text-xs mb-1">
                          {w.employeeId || "N/A"}
                        </p>
                        <p className="text-white/60 text-sm">{w.department}</p>
                        <p className="text-[#D4AF37] text-sm mt-1">
                          🎁 Prize: {w.prize_name}
                        </p>
                      </div>
                      <span className="text-white/40 text-sm">
                        {formatWinnerDate(w.created_at)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {winners.length === 0 && (
                <div className="text-center py-12 text-white/50">
                  No winners yet.
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
