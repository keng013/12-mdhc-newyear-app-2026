import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Search,
  Download,
  Filter,
  ToggleLeft,
  ToggleRight,
  Upload,
  UserCheck,
  Edit2,
  Trash2,
} from "lucide-react";
import {
  getParticipants,
  checkInParticipant,
  bulkImportParticipants,
  bulkCheckInAll,
  updateParticipant,
  deleteParticipant,
} from "../../services/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { ModalAlert } from "../ui/ModalAlert";
import { ModalConfirm } from "../ui/ModalConfirm";

interface Participant {
  id: string;
  employeeId: string;
  fullName: string;
  department: string;
  dietary: string | null;
  checkedIn: boolean;
}

export function ParticipantsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit modal state
  const [editingParticipant, setEditingParticipant] =
    useState<Participant | null>(null);
  const [editForm, setEditForm] = useState({
    fullName: "",
    department: "",
    dietary: "",
  });

  // Alert & Confirm modals
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingParticipant, setDeletingParticipant] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Load participants from API
  useEffect(() => {
    async function load() {
      try {
        const res = await getParticipants();
        setParticipants(res.data.data);
      } catch (err) {
        console.error("Failed to load participants", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Toggle check-in status
  const toggleCheckIn = async (employeeId: string) => {
    try {
      const res = await checkInParticipant(employeeId);
      const updated = res.data.participant;

      // Update ใช้ id แทน employeeId เพราะ id เป็น unique key
      setParticipants((prev) =>
        prev.map((p) => (p.id === updated.id ? { ...updated } : p)),
      );
    } catch (err) {
      console.error("Failed to toggle check-in", err);
      setAlertMessage("Failed to toggle check-in");
      setShowAlert(true);
    }
  };

  // Open edit modal
  const handleEdit = (participant: Participant) => {
    setEditingParticipant(participant);
    setEditForm({
      fullName: participant.fullName,
      department: participant.department,
      dietary: participant.dietary || "",
    });
  };

  // Update participant
  const handleUpdate = async () => {
    if (!editingParticipant) return;

    try {
      const res = await updateParticipant(editingParticipant.id, editForm);
      const updated = res.data.data;

      setParticipants((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p)),
      );

      setEditingParticipant(null);
      setAlertMessage("Updated successfully");
      setShowAlert(true);
    } catch (err) {
      console.error("Failed to update", err);
      setAlertMessage("Failed to update participant");
      setShowAlert(true);
    }
  };

  // Delete participant - show confirm modal
  const handleDelete = (id: string, name: string) => {
    setDeletingParticipant({ id, name });
    setShowDeleteConfirm(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!deletingParticipant) return;

    try {
      await deleteParticipant(deletingParticipant.id);
      setParticipants((prev) =>
        prev.filter((p) => p.id !== deletingParticipant.id),
      );
      setShowDeleteConfirm(false);
      setDeletingParticipant(null);
      setAlertMessage("Deleted successfully");
      setShowAlert(true);
    } catch (err: any) {
      console.error("Failed to delete", err);
      setShowDeleteConfirm(false);
      setDeletingParticipant(null);
      setAlertMessage(
        err.response?.data?.error || "Failed to delete participant",
      );
      setShowAlert(true);
    }
  };

  // Filter logic
  const filteredParticipants = participants.filter((p) => {
    const matchesSearch =
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.employeeId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment =
      filterDepartment === "all" || p.department === filterDepartment;

    return matchesSearch && matchesDepartment;
  });

  if (loading) {
    return (
      <div className="p-8 text-center text-white">Loading participants...</div>
    );
  }
  const exportToExcel = () => {
    // แปลงข้อมูล participants ให้เป็นรูปแบบสำหรับ Excel
    const data = participants.map((p) => ({
      EmployeeID: p.employeeId,
      Name: p.fullName,
      Department: p.department,
      Dietary: p.dietary || "None",
      CheckedIn: p.checkedIn ? "Yes" : "No",
    }));

    // สร้าง worksheet + workbook
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");

    // แปลงเป็นไฟล์ Excel
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // โหลดไฟล์ออกไป
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `participants_${new Date().toISOString()}.xlsx`);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log("Imported data:", jsonData);

      if (jsonData.length === 0) {
        alert("No data found in Excel file");
        return;
      }

      // Send data to API to create participants
      const response = await bulkImportParticipants(jsonData);
      const results = response.data.data;

      // Show results
      let message = `Import completed!\n\n`;
      message += `✅ Created: ${results.created}\n`;
      message += `⏭️ Skipped: ${results.skipped}\n`;

      if (results.errors.length > 0) {
        message += `\n❌ Errors:\n${results.errors.slice(0, 5).join("\n")}`;
        if (results.errors.length > 5) {
          message += `\n... and ${results.errors.length - 5} more errors`;
        }
      }

      alert(message);

      // Reload participants list
      if (results.created > 0) {
        const res = await getParticipants();
        setParticipants(res.data.data);
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("Failed to import Excel:", error);
      const errorMessage =
        error.response?.data?.error || error.message || "Unknown error";
      alert(`Failed to import Excel file: ${errorMessage}`);
    }
  };

  const handleBulkCheckIn = async () => {
    const uncheckedCount = participants.filter((p) => !p.checkedIn).length;

    if (uncheckedCount === 0) {
      alert("All participants are already checked in!");
      return;
    }

    if (!confirm(`Check in all ${uncheckedCount} remaining participants?`)) {
      return;
    }

    try {
      const response = await bulkCheckInAll();
      const count = response.data.data.count;

      alert(`Successfully checked in ${count} participants!`);

      // Reload participants list
      const res = await getParticipants();
      setParticipants(res.data.data);
    } catch (error: any) {
      console.error("Failed to bulk check-in:", error);
      const errorMessage =
        error.response?.data?.error || error.message || "Unknown error";
      alert(`Failed to check in all: ${errorMessage}`);
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

      {/* Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search
            size={20}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or employee ID..."
            className="w-full bg-[#001F3F] text-white pl-12 pr-4 py-3 rounded-xl border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
          />
        </div>

        {/* Filter */}
        <div className="relative">
          <Filter
            size={20}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40"
          />
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="bg-[#001F3F] text-white pl-12 pr-10 py-3 rounded-xl border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Departments</option>
            <option value="Service">Service</option>
            <option value="Sales">Sales</option>
            <option value="Project">Project</option>
            <option value="Product">Product</option>
            <option value="Finance">Finance</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        {/* All Check-in Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleBulkCheckIn}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-all flex items-center gap-2 font-semibold"
        >
          <UserCheck size={20} />
          All Check-in
        </motion.button>

        {/* Import Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleImportClick}
          className="bg-[#D4AF37] hover:bg-[#C49F2F] text-[#0A0A0A] px-6 py-3 rounded-xl transition-all flex items-center gap-2 font-semibold"
        >
          <Upload size={20} />
          Import Excel
        </motion.button>

        {/* Export Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={exportToExcel}
          className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl transition-all flex items-center gap-2"
        >
          <Download size={20} />
          Export Excel
        </motion.button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#001F3F] rounded-xl p-4 border border-[#D4AF37]/20">
          <p className="text-white/70 text-sm mb-1">Total Registered</p>
          <p className="text-white text-2xl font-bold">{participants.length}</p>
        </div>
        <div className="bg-[#001F3F] rounded-xl p-4 border border-[#D4AF37]/20">
          <p className="text-white/70 text-sm mb-1">Checked In</p>
          <p className="text-[#D4AF37] text-2xl font-bold">
            {participants.filter((p) => p.checkedIn).length}
          </p>
        </div>
        <div className="bg-[#001F3F] rounded-xl p-4 border border-[#D4AF37]/20">
          <p className="text-white/70 text-sm mb-1">Pending</p>
          <p className="text-white text-2xl font-bold">
            {participants.filter((p) => !p.checkedIn).length}
          </p>
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-[#001F3F] rounded-2xl border border-[#D4AF37]/20 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#D4AF37]/20">
                <th className="text-left py-4 px-6 text-[#D4AF37] font-semibold">
                  Employee ID
                </th>
                <th className="text-left py-4 px-6 text-[#D4AF37] font-semibold">
                  Name
                </th>
                <th className="text-left py-4 px-6 text-[#D4AF37] font-semibold">
                  Department
                </th>
                <th className="text-left py-4 px-6 text-[#D4AF37] font-semibold">
                  Dietary Restriction
                </th>
                <th className="text-center py-4 px-6 text-[#D4AF37] font-semibold">
                  Checked In
                </th>
                <th className="text-center py-4 px-6 text-[#D4AF37] font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredParticipants.map((p, index) => (
                <tr
                  key={p.id}
                  className={`border-b border-[#D4AF37]/10 hover:bg-[#0A1A2F] transition-colors ${
                    index % 2 === 0 ? "bg-[#001F3F]" : "bg-[#001F3F]/50"
                  }`}
                >
                  <td className="py-4 px-6 text-white/90">{p.employeeId}</td>
                  <td className="py-4 px-6 text-white">{p.fullName}</td>
                  <td className="py-4 px-6 text-white/80">{p.department}</td>
                  <td className="py-4 px-6 text-white/70">
                    {p.dietary || "None"}
                  </td>

                  <td className="py-4 px-6 text-center">
                    <button onClick={() => toggleCheckIn(p.employeeId)}>
                      {p.checkedIn ? (
                        <ToggleRight size={32} className="text-[#D4AF37]" />
                      ) : (
                        <ToggleLeft size={32} className="text-white/30" />
                      )}
                    </button>
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="p-2 hover:bg-[#D4AF37]/20 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={18} className="text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.fullName)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} className="text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <p className="text-white/50 text-sm mt-4 text-center">
        Showing {filteredParticipants.length} of {participants.length}{" "}
        participants
      </p>

      {/* Edit Modal */}
      {editingParticipant && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#001F3F] rounded-2xl border border-[#D4AF37]/30 p-6 max-w-md w-full"
          >
            <h2 className="text-[#D4AF37] text-2xl font-bold mb-4">
              Edit Participant
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-white/70 text-sm mb-1 block">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, fullName: e.target.value })
                  }
                  className="w-full bg-[#0A1A2F] text-white px-4 py-2 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] outline-none"
                />
              </div>

              <div>
                <label className="text-white/70 text-sm mb-1 block">
                  Department
                </label>
                <select
                  value={editForm.department}
                  onChange={(e) =>
                    setEditForm({ ...editForm, department: e.target.value })
                  }
                  className="w-full bg-[#0A1A2F] text-white px-4 py-2 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] outline-none"
                >
                  <option value="Service">Service</option>
                  <option value="Sales">Sales</option>
                  <option value="Project">Project</option>
                  <option value="Product">Product</option>
                  <option value="Finance">Finance</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="text-white/70 text-sm mb-1 block">
                  Dietary Restriction
                </label>
                <input
                  type="text"
                  value={editForm.dietary}
                  onChange={(e) =>
                    setEditForm({ ...editForm, dietary: e.target.value })
                  }
                  placeholder="None"
                  className="w-full bg-[#0A1A2F] text-white px-4 py-2 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdate}
                className="flex-1 bg-[#D4AF37] text-[#0A0A0A] py-2 rounded-lg font-semibold hover:bg-[#FFD966] transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditingParticipant(null)}
                className="flex-1 bg-white/10 text-white py-2 rounded-lg font-semibold hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Alert */}
      <ModalAlert
        show={showAlert}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />

      {/* Delete Confirmation Modal */}
      <ModalConfirm
        show={showDeleteConfirm}
        title="Delete Participant"
        message={`Are you sure you want to delete ${deletingParticipant?.name}? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeletingParticipant(null);
        }}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
