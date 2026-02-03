import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  RotateCcw,
  Gift,
  Package,
  Award,
  Trophy,
  Download,
  Upload,
} from "lucide-react";
import {
  getPrizes,
  createPrize,
  deletePrize,
  updatePrize,
  deleteAllPrizes,
} from "../../services/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { ModalAlert } from "../ui/ModalAlert";
import { ModalConfirm } from "../ui/ModalConfirm";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface Prize {
  id: string;
  name: string;
  description: string;
  category: "SMALL" | "MEDIUM" | "BIG" | "GRAND";
  stock: number;
  remaining: number;
}

export function PrizesPage() {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<
    Prize["category"] | "ALL"
  >("ALL");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add Modal
  const [showAddModal, setShowAddModal] = useState(false);

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);

  // Reset Confirmation Dialog
  const [showResetDialog, setShowResetDialog] = useState(false);

  // Alert Modal
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // Add Prize Data
  const [newPrize, setNewPrize] = useState({
    name: "",
    description: "",
    category: "SMALL" as Prize["category"],
    stock: 1,
  });

  // ===== LOAD PRIZES FROM API =====
  const loadPrizes = async () => {
    try {
      const res = await getPrizes();

      const normalized: Prize[] = res.data.map((p: any) => {
        const rawCat =
          typeof p.category === "string" ? p.category.toUpperCase() : "";

        return {
          id: p.id,
          name: p.name,
          description: p.description ?? "",
          category: (["SMALL", "MEDIUM", "BIG", "GRAND"].includes(rawCat)
            ? rawCat
            : "SMALL") as Prize["category"],
          stock: Number(p.stock) || 0,
          remaining: Number(p.remaining) || 0,
        };
      });

      setPrizes(normalized);
    } catch (err) {
      console.error("Failed to load prizes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrizes();
  }, []);

  // ===== ADD PRIZE =====
  const handleAddPrize = async () => {
    try {
      const res = await createPrize({
        name: newPrize.name,
        description: newPrize.description,
        category: newPrize.category,
        stock: newPrize.stock,
      });

      const p = res.data;

      setPrizes([
        ...prizes,
        {
          id: p.id,
          name: p.name,
          description: p.description,
          category: p.category,
          stock: p.stock,
          remaining: p.remaining,
        },
      ]);

      setShowAddModal(false);
      setNewPrize({ name: "", description: "", category: "SMALL", stock: 1 });
    } catch (err) {
      alert("Failed to add prize");
    }
  };

  // ===== OPEN EDIT MODAL =====
  const openEditModal = (prize: Prize) => {
    setEditingPrize(prize);
    setShowEditModal(true);
  };

  // ===== UPDATE PRIZE =====
  const handleUpdatePrize = async () => {
    if (!editingPrize) return;

    try {
      const res = await updatePrize(editingPrize.id, {
        name: editingPrize.name,
        description: editingPrize.description,
        category: editingPrize.category,
        stock: editingPrize.stock,
        remaining: editingPrize.remaining,
      });

      const updated = res.data;

      setPrizes(
        prizes.map((p) =>
          p.id === updated.id
            ? {
                id: updated.id,
                name: updated.name,
                description: updated.description,
                category: updated.category,
                stock: updated.stock,
                remaining: updated.remaining,
              }
            : p,
        ),
      );

      setShowEditModal(false);
      setAlertMessage("Prize updated successfully");
      setShowAlert(true);
    } catch (err) {
      console.error("Update failed:", err);
      setAlertMessage("Failed to update prize");
      setShowAlert(true);
    }
  };

  // ===== DELETE PRIZE =====
  const handleDeletePrize = async (id: string) => {
    if (!confirm("Delete this prize?")) return;

    try {
      await deletePrize(id);
      setPrizes(prizes.filter((p) => p.id !== id));
      setAlertMessage("Prize deleted successfully");
      setShowAlert(true);
    } catch (err) {
      console.error("Delete failed:", err);
      setAlertMessage("Failed to delete prize");
      setShowAlert(true);
    }
  };

  const handleResetPrizes = async () => {
    // ปิด modal ทันที
    setShowResetDialog(false);

    try {
      const response = await deleteAllPrizes();
      const result = response.data.data;

      setAlertMessage(`Successfully deleted ${result.count} prizes!`);
      setShowAlert(true);

      // Reload prizes
      await loadPrizes();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || error.message || "Unknown error";
      setAlertMessage(`Failed to delete prizes: ${errorMessage}`);
      setShowAlert(true);
    }
  };

  const getCategoryColor = (category: Prize["category"]) => {
    switch (category) {
      case "SMALL":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "MEDIUM":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "BIG":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "GRAND":
        return "bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30";
    }
  };

  // ===== EXPORT TO EXCEL =====
  const exportToExcel = () => {
    const data = prizes.map((p) => ({
      Name: p.name,
      Description: p.description,
      Category: p.category,
      Stock: p.stock,
      Remaining: p.remaining,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Prizes");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `prizes_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // ===== IMPORT FROM EXCEL =====
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        // Create prizes from imported data
        for (const item of json as any[]) {
          const prizeData = {
            name: item.Name || "",
            description: item.Description || "",
            category: (item.Category || "SMALL").toUpperCase(),
            stock: Number(item.Stock) || 1,
          };

          if (prizeData.name) {
            await createPrize(prizeData);
          }
        }

        await loadPrizes();
        setAlertMessage(`Successfully imported ${json.length} prizes`);
        setShowAlert(true);
      } catch (err) {
        console.error("Import failed:", err);
        setAlertMessage("Failed to import prizes");
        setShowAlert(true);
      }
    };
    reader.readAsArrayBuffer(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-8">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white mb-2 text-2xl font-semibold">
            Prize Management
          </h2>
          <p className="text-white/60">Manage all prizes for the lucky draw</p>
        </div>

        <div className="flex gap-3">
          {/* Export Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportToExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-all flex items-center gap-2"
            title="Export to Excel"
          >
            <Download size={20} />
            Export
          </motion.button>

          {/* Import Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all flex items-center gap-2"
            title="Import from Excel"
          >
            <Upload size={20} />
            Import
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowResetDialog(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl transition-all flex items-center gap-2"
          >
            <RotateCcw size={20} />
            Reset All Prizes
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-[#D4AF37] to-[#FFD966] text-black px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
          >
            <Plus size={20} />
            Add New Prize
          </motion.button>
        </div>
      </div>

      {/* Loading */}
      {loading && <p className="text-white/60">Loading...</p>}

      {/* Filter indicator */}
      {selectedCategory !== "ALL" && (
        <div className="mb-4 flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg px-4 py-2">
            <span className="text-[#D4AF37] text-sm">
              Filtering: <strong>{selectedCategory}</strong> Prizes
            </span>
            <button
              onClick={() => setSelectedCategory("ALL")}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <span className="text-white/50 text-sm">
            Click category card again to clear filter
          </span>
        </div>
      )}

      {/* Statistics - Category Cards */}
      <div className="flex gap-3 mb-8">
        {["SMALL", "MEDIUM", "BIG", "GRAND"].map((category) => {
          const categoryPrizes = prizes.filter((p) => p.category === category);
          const total = categoryPrizes.reduce((sum, p) => sum + p.stock, 0);
          const remaining = categoryPrizes.reduce(
            (sum, p) => sum + p.remaining,
            0,
          );
          const isActive = selectedCategory === category;

          // Define icon for each category
          const categoryIcons = {
            SMALL: Gift,
            MEDIUM: Package,
            BIG: Award,
            GRAND: Trophy,
          };
          const IconComponent =
            categoryIcons[category as keyof typeof categoryIcons];

          return (
            <motion.div
              key={category}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                setSelectedCategory(
                  selectedCategory === category
                    ? "ALL"
                    : (category as Prize["category"]),
                )
              }
              className={`flex-1 bg-[#001F3F] rounded-xl p-3 border cursor-pointer transition-all ${
                isActive
                  ? "border-[#D4AF37] shadow-lg shadow-[#D4AF37]/20 bg-[#001F3F]/80"
                  : "border-[#D4AF37]/20 hover:border-[#D4AF37]/40"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/70 text-xs">{category} Prizes</p>
                <IconComponent size={18} className="text-[#D4AF37]" />
              </div>
              <p
                className="text-white mb-1"
                style={{ fontSize: "20px", fontWeight: 700 }}
              >
                {remaining}/{total}
              </p>

              <div className="w-full bg-[#0A0A0A] rounded-full h-2 mt-2">
                <div
                  className="bg-[#D4AF37] h-2 rounded-full transition-all"
                  style={{
                    width: `${total > 0 ? (remaining / total) * 100 : 0}%`,
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Prize Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prizes
          .filter(
            (p) =>
              selectedCategory === "ALL" || p.category === selectedCategory,
          )
          .map((p) => {
            const pct =
              p.stock > 0 ? Math.min(100, (p.remaining / p.stock) * 100) : 0;

            return (
              <motion.div
                key={p.id}
                className="bg-[#001F3F] rounded-2xl p-6 border border-[#D4AF37]/20"
                whileHover={{ y: -4 }}
              >
                <div className="flex justify-between mb-4">
                  <span
                    className={`px-3 py-1 rounded-lg text-sm border ${getCategoryColor(p.category)}`}
                  >
                    {p.category}
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-2 hover:bg-[#D4AF37]/10 rounded-lg"
                    >
                      <Edit2 size={16} className="text-[#D4AF37]" />
                    </button>

                    <button
                      onClick={() => handleDeletePrize(p.id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                </div>

                <h3 className="text-white text-lg font-semibold mb-2">
                  {p.name}
                </h3>
                <p className="text-white/50 text-sm mb-4">{p.description}</p>

                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-white/60">Remaining</span>
                  <span className="text-[#D4AF37] font-bold text-lg">
                    {p.remaining}/{p.stock}
                  </span>
                </div>

                <div className="w-full bg-[#0A0A0A] rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#D4AF37] to-[#FFD966] h-2 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </motion.div>
            );
          })}
      </div>

      {/* =========================================================== */}
      {/*                     ADD MODAL                               */}
      {/* =========================================================== */}

      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" />

            <motion.div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div className="bg-[#001F3F] p-8 rounded-2xl max-w-md w-full border border-[#D4AF37]/30">
                <div className="flex justify-between mb-6">
                  <h3 className="text-white text-2xl font-semibold">
                    Add New Prize
                  </h3>
                  <button onClick={() => setShowAddModal(false)}>
                    <X size={24} className="text-white/70 hover:text-white" />
                  </button>
                </div>

                {/* Name */}
                <label className="block text-white/70 mb-1">Prize Name</label>
                <input
                  className="w-full bg-[#0A0A0A] text-white px-4 py-3 rounded-xl mb-4 border border-[#D4AF37]/20"
                  value={newPrize.name}
                  onChange={(e) =>
                    setNewPrize({ ...newPrize, name: e.target.value })
                  }
                />

                {/* Description */}
                <label className="block text-white/70 mb-1">Description</label>
                <textarea
                  className="w-full bg-[#0A0A0A] text-white px-4 py-3 rounded-xl mb-4 border border-[#D4AF37]/20"
                  value={newPrize.description}
                  onChange={(e) =>
                    setNewPrize({ ...newPrize, description: e.target.value })
                  }
                />

                {/* Category */}
                <label className="block text-white/70 mb-1">Category</label>
                <select
                  className="w-full bg-[#0A0A0A] text-white px-4 py-3 rounded-xl mb-4 border border-[#D4AF37]/20"
                  value={newPrize.category}
                  onChange={(e) =>
                    setNewPrize({
                      ...newPrize,
                      category: e.target.value as Prize["category"],
                    })
                  }
                >
                  <option value="SMALL">SMALL</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="BIG">BIG</option>
                  <option value="GRAND">GRAND</option>
                </select>

                {/* Stock */}
                <label className="block text-white/70 mb-1">Stock</label>
                <input
                  type="number"
                  min={1}
                  className="w-full bg-[#0A0A0A] text-white px-4 py-3 rounded-xl mb-4 border border-[#D4AF37]/20"
                  value={newPrize.stock}
                  onChange={(e) =>
                    setNewPrize({ ...newPrize, stock: Number(e.target.value) })
                  }
                />

                <button
                  onClick={handleAddPrize}
                  className="w-full bg-gradient-to-r from-[#D4AF37] to-[#FFD966] py-3 rounded-xl font-semibold text-black"
                >
                  Add Prize
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* =========================================================== */}
      {/*                     EDIT MODAL                               */}
      {/* =========================================================== */}

      <AnimatePresence>
        {showEditModal && editingPrize && (
          <>
            <motion.div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" />

            <motion.div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div className="bg-[#001F3F] p-8 rounded-2xl max-w-md w-full border border-[#D4AF37]/30">
                <div className="flex justify-between mb-6">
                  <h3 className="text-white text-2xl font-semibold">
                    Edit Prize
                  </h3>
                  <button onClick={() => setShowEditModal(false)}>
                    <X size={24} className="text-white/70 hover:text-white" />
                  </button>
                </div>

                {/* Name */}
                <label className="block text-white/70 mb-1">Prize Name</label>
                <input
                  className="w-full bg-[#0A0A0A] text-white px-4 py-3 rounded-xl mb-4 border border-[#D4AF37]/20"
                  value={editingPrize.name}
                  onChange={(e) =>
                    setEditingPrize({ ...editingPrize, name: e.target.value })
                  }
                />

                {/* Description */}
                <label className="block text-white/70 mb-1">Description</label>
                <textarea
                  className="w-full bg-[#0A0A0A] text-white px-4 py-3 rounded-xl mb-4 border border-[#D4AF37]/20"
                  value={editingPrize.description}
                  onChange={(e) =>
                    setEditingPrize({
                      ...editingPrize,
                      description: e.target.value,
                    })
                  }
                />

                {/* Category */}
                <label className="block text-white/70 mb-1">Category</label>
                <select
                  className="w-full bg-[#0A0A0A] text-white px-4 py-3 rounded-xl mb-4 border border-[#D4AF37]/20"
                  value={editingPrize.category}
                  onChange={(e) =>
                    setEditingPrize({
                      ...editingPrize,
                      category: e.target.value as Prize["category"],
                    })
                  }
                >
                  <option value="SMALL">SMALL</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="BIG">BIG</option>
                  <option value="GRAND">GRAND</option>
                </select>

                {/* Stock */}
                <label className="block text-white/70 mb-1">Stock</label>
                <input
                  type="number"
                  min={1}
                  className="w-full bg-[#0A0A0A] text-white px-4 py-3 rounded-xl mb-4 border border-[#D4AF37]/20"
                  value={editingPrize.stock}
                  onChange={(e) =>
                    setEditingPrize({
                      ...editingPrize,
                      stock: Number(e.target.value),
                    })
                  }
                />
                {/* Remaining */}
                <label className="block text-white/70 mb-1">Remaining</label>
                <input
                  type="number"
                  min={0}
                  max={editingPrize.stock}
                  className="w-full bg-[#0A0A0A] text-white px-4 py-3 rounded-xl mb-4 border border-[#D4AF37]/20"
                  value={editingPrize.remaining}
                  onChange={(e) =>
                    setEditingPrize({
                      ...editingPrize,
                      remaining: Number(e.target.value),
                    })
                  }
                />
                <button
                  onClick={handleUpdatePrize}
                  className="w-full bg-gradient-to-r from-[#D4AF37] to-[#FFD966] py-3 rounded-xl font-semibold text-black"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Reset Confirmation Dialog */}
      <ModalConfirm
        show={showResetDialog}
        title="⚠️ Delete All Prizes?"
        message="This action will permanently delete all prizes from the database and all lucky draw results. This action cannot be undone."
        onConfirm={handleResetPrizes}
        onCancel={() => setShowResetDialog(false)}
        confirmText="Delete All Prizes"
        cancelText="Cancel"
      />

      {/* Modal Alert */}
      <ModalAlert
        show={showAlert}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />
    </div>
  );
}
