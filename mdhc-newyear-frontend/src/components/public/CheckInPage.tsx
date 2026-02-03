import { useState } from "react";
import { Search, Camera, CheckCircle } from "lucide-react";
import { checkRegistered, checkInParticipant } from "../../services/api";

export default function CheckInPage() {
  const [employeeId, setEmployeeId] = useState("");
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    setError("");
    setProfile(null);

    try {
      const res = await checkRegistered(employeeId);

      if (!res.data) {
        setError("ไม่พบข้อมูลพนักงานนี้");
      } else {
        setProfile(res.data);
      }
    } catch {
      setError("ไม่สามารถค้นหาข้อมูลได้");
    }
  };

  const handleCheckIn = async () => {
    try {
      console.log("Checking in employee:", employeeId);
      const res = await checkInParticipant(employeeId);
      console.log("Check-in response:", res);
      setProfile((p) => ({ ...p, checkedIn: true }));
    } catch (err) {
      console.error("Check-in error:", err);
      setError("Check-in ไม่สำเร็จ");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6 flex flex-col items-center">
      <h1 className="text-[#FFD966] text-3xl font-bold mb-8">
        🎫 Check-in หน้างาน
      </h1>

      {/* Search box */}
      <div className="w-full max-w-md flex gap-3 mb-6">
        <div className="flex items-center px-4 py-3 bg-[#001F3F] border border-[#D4AF37]/30 rounded-xl flex-1">
          <Search className="text-[#D4AF37]/70 mr-2" />
          <input
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="กรอกรหัสพนักงาน"
            className="bg-transparent text-white flex-1 outline-none"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-5 bg-gradient-to-r from-[#D4AF37] to-[#FFD966] text-black rounded-xl font-semibold"
        >
          ค้นหา
        </button>
      </div>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {/* Profile Card */}
      {profile && (
        <div className="bg-[#001F3F] border border-[#D4AF37]/30 rounded-xl p-6 w-full max-w-md">
          <div className="flex gap-4 mb-4">
            <img
              src={profile.photo || "/default-avatar.png"}
              className="w-16 h-16 rounded-full border border-[#D4AF37]/20"
            />
            <div>
              <h3 className="text-white text-lg font-bold">{profile.name}</h3>
              <p className="text-white/60">{profile.department}</p>

              {profile.checkedIn ? (
                <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                  <CheckCircle size={14} /> Checked-in แล้ว
                </p>
              ) : (
                <p className="text-yellow-300 text-sm mt-2">ยังไม่ Check-in</p>
              )}
            </div>
          </div>

          {/* Upload Photo */}
          <button className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FFD966] to-[#D4AF37] text-black font-semibold mb-3 flex items-center justify-center gap-2">
            <Camera size={18} /> อัปโหลดรูป
          </button>

          {!profile.checkedIn && (
            <button
              onClick={handleCheckIn}
              className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold"
            >
              Check-in
            </button>
          )}
        </div>
      )}
    </div>
  );
}
