import React, { useState } from 'react';
import { Patient, User, UserRole } from '../types';
import { Users, Plus, Search, UserPlus, Phone, Calendar, MapPin, X, Loader2 } from 'lucide-react';

interface PatientManagerProps {
  patients: Patient[];
  currentUser: User;
  onAddPatient: (patient: Patient) => Promise<void>;
}

export const PatientManager: React.FC<PatientManagerProps> = ({ patients, currentUser, onAddPatient }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Patient>>({
    id: '',
    name: '',
    dob: '',
    gender: 'Male',
    phone: '',
    email: '',
    roomNumber: ''
  });

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.dob || !formData.phone) return;

    setLoading(true);
    // Auto-generate MRN if not provided or use timestamp
    const newPatient: Patient = {
      id: formData.id || `MRN-${Math.floor(100000 + Math.random() * 900000)}`,
      name: formData.name!,
      dob: formData.dob!,
      gender: formData.gender as 'Male' | 'Female' | 'Other',
      phone: formData.phone!,
      email: formData.email,
      roomNumber: formData.roomNumber,
      createdAt: new Date().toISOString()
    };

    await onAddPatient(newPatient);
    setLoading(false);
    setShowModal(false);
    setFormData({ id: '', name: '', dob: '', gender: 'Male', phone: '', email: '', roomNumber: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Patient Records</h1>
          <p className="text-slate-500">Manage patient admission details and contact information.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-colors"
        >
          <UserPlus size={18} className="mr-2" /> Add New Patient
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center">
        <Search size={20} className="text-slate-400 mr-3" />
        <input 
          type="text" 
          placeholder="Search by Name, MRN, or Phone..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent outline-none text-slate-700 placeholder-slate-400"
        />
      </div>

      {/* Patient List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {filteredPatients.length === 0 ? (
           <div className="p-12 text-center">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <Users size={32} className="text-slate-400" />
             </div>
             <h3 className="text-lg font-medium text-slate-800">No patients found</h3>
             <p className="text-slate-500 mt-1">Try adjusting your search or add a new patient.</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">MRN</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Patient Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Gender / Age</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Contact</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Room</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map(p => {
                  const age = new Date().getFullYear() - new Date(p.dob).getFullYear();
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono text-sm text-slate-600 font-bold">{p.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{p.name}</div>
                        <div className="text-xs text-slate-400">{new Date(p.dob).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {p.gender}, {age} yrs
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="flex items-center"><Phone size={14} className="mr-2 text-slate-400"/> {p.phone}</div>
                        {p.email && <div className="text-xs text-slate-400 ml-6">{p.email}</div>}
                      </td>
                      <td className="px-6 py-4">
                        {p.roomNumber ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                             {p.roomNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Patient Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800">Register New Patient</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                    <input 
                      type="text" required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth *</label>
                    <input 
                      type="date" required
                      value={formData.dob}
                      onChange={e => setFormData({...formData, dob: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                    <select 
                      value={formData.gender}
                      onChange={e => setFormData({...formData, gender: e.target.value as any})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Room No (Optional)</label>
                    <input 
                      type="text"
                      value={formData.roomNumber}
                      onChange={e => setFormData({...formData, roomNumber: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                <input 
                  type="tel" required
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address (Optional)</label>
                <input 
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                 <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium"
                 >
                   Cancel
                 </button>
                 <button 
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center"
                 >
                   {loading && <Loader2 size={16} className="animate-spin mr-2" />}
                   Register Patient
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
