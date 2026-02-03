// RegistrationModal.tsx updated with handleSubmit (API + duplicate check)
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles } from 'lucide-react';
import { SuccessModal } from './SuccessModal';
import { registerParticipant, checkRegistered } from '../services/api';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RegistrationModal({ isOpen, onClose }: RegistrationModalProps) {
  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    department: '',
    dietaryRestrictions: '',
    otherDietary: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const check = await checkRegistered(formData.employeeId);
      if (check.data.exists) {
        alert('Employee ID นี้ลงทะเบียนแล้ว');
        return;
      }

      const payload = {
        employeeId: formData.employeeId,
        fullName: formData.fullName,
        department: formData.department,
        dietary:
          formData.dietaryRestrictions === 'Other'
            ? formData.otherDietary
            : formData.dietaryRestrictions,
        remark: null
      };

      await registerParticipant(payload);
      setShowSuccess(true);

      setTimeout(() => {
        setFormData({ employeeId: '', fullName: '', department: '', dietaryRestrictions: '', otherDietary: '' });
        setShowSuccess(false);
        onClose();
      }, 3000);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Registration failed');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && !showSuccess && (
          <>
            <motion.div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}/>

            <motion.div className="fixed inset-0 flex items-center justify-center z-50 p-4" initial={{opacity:0,scale:0.9,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.9,y:20}} transition={{type:'spring',duration:0.5}}>
              <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative">

                <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-gray-700 transition-colors"><X size={24}/></button>

                <div className="p-8 pb-6">
                  <div className="flex items-center gap-3 mb-2"><Sparkles className="text-[#D4AF37]" size={28}/><h2 className="text-[#0D0D0D]" style={{fontSize:'28px',fontWeight:700}}>ลงทะเบียน</h2></div>
                  <p className="text-gray-600">Register for New Year Party 2026</p>
                </div>

                <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
                  <div>
                    <label htmlFor="employeeId" className="block text-gray-700 mb-2">Employee ID <span className="text-red-500">*</span></label>
                    <input type="text" id="employeeId" name="employeeId" required value={formData.employeeId} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all" placeholder="Enter your employee ID"/>
                  </div>

                  <div>
                    <label htmlFor="fullName" className="block text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                    <input type="text" id="fullName" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all" placeholder="Enter your full name"/>
                  </div>

                  <div>
                    <label htmlFor="department" className="block text-gray-700 mb-2">Department <span className="text-red-500">*</span></label>
                    <select id="department" name="department" required value={formData.department} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none bg-white">
                      <option value="">Select department</option>
                      <option value="Service">Service</option>
                      <option value="Sales">Sales</option>
                      <option value="Project">Project</option>
                      <option value="Product">Product</option>
                      <option value="Finance">Finance</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="dietaryRestrictions" className="block text-gray-700 mb-2">Dietary Restrictions</label>
                    <select id="dietaryRestrictions" name="dietaryRestrictions" value={formData.dietaryRestrictions} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none bg-white">
                      <option value="">None</option>
                      <option value="Vegetarian">Vegetarian</option>
                      <option value="Vegan">Vegan</option>
                      <option value="Halal">Halal</option>
                      <option value="Gluten-Free">Gluten-Free</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {formData.dietaryRestrictions === 'Other' && (
                    <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}>
                      <input type="text" name="otherDietary" value={formData.otherDietary} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all" placeholder="Please specify" />
                    </motion.div>
                  )}

                  <button type="submit" className="w-full bg-gradient-to-r from-[#D4AF37] to-[#FFD966] text-[#0D0D0D] py-4 rounded-xl transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]" style={{fontWeight:600,boxShadow:'0 0 30px rgba(212,175,55,0.4)'}}>
                    Submit Registration
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SuccessModal isOpen={showSuccess} />
    </>
  );
}
