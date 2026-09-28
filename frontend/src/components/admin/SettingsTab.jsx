import { useState } from 'react';
import { Plus, Edit2, Trash2, ShieldAlert, DollarSign, MessageSquare } from 'lucide-react';
import { adminApi } from '../../services/adminApi';

const SettingsTab = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [adminForm, setAdminForm] = useState({
    name: '', email: '', password: '', role: 'Superadmin'
  });

  const handleOpenCreateModal = () => {
    setEditMode(false);
    setCurrentItem(null);
    setAdminForm({ name: '', email: '', password: '', role: 'Superadmin' });
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      if (editMode && currentItem) {
        await adminApi.updateAdmin(currentItem.id, adminForm);
      } else {
        await adminApi.createAdmin(adminForm);
      }
      setIsModalOpen(false);
      // fetchAdmins() if there was a list
    } catch (err) {
      console.error('Form submit error:', err);
      alert(err.response?.data?.message || 'Save operation failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-loft-50 font-serif">Roles & Permissions</h1>
        <button 
          onClick={handleOpenCreateModal}
          className="btn-primary flex items-center gap-2 py-2 px-4 text-sm font-semibold rounded-xl cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Admin
        </button>
      </div>

      <div className="card bg-loft-900 border-loft-800 overflow-hidden">
        <div className="p-6 border-b border-loft-800">
          <h3 className="text-lg font-bold text-loft-50">Admin Users</h3>
          <p className="text-sm text-loft-400">Manage dashboard access and role-based permissions.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-loft-300">
            <thead className="bg-loft-950/50 text-xs uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Last Login</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-loft-800">
              {[
                { name: 'Super Admin', email: 'admin@eminence.com', role: 'Superadmin', login: 'Just now' },
                { name: 'Priya Sharma', email: 'priya.s@eminence.com', role: 'Finance Admin', login: '2 hrs ago' },
                { name: 'Rohan Gupta', email: 'rohan.g@eminence.com', role: 'Support Admin', login: '1 day ago' },
              ].map((admin, idx) => (
                <tr key={idx} className="hover:bg-loft-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-loft-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-copper-500/20 text-copper-500 flex items-center justify-center font-bold">
                      {admin.name.charAt(0)}
                    </div>
                    {admin.name}
                  </td>
                  <td className="px-6 py-4">{admin.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      admin.role === 'Superadmin' ? 'bg-moss-500/20 text-moss-500 border border-moss-500/30' :
                      admin.role === 'Finance Admin' ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30' :
                      'bg-copper-500/20 text-copper-500 border border-copper-500/30'
                    }`}>
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">{admin.login}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button className="p-2 text-loft-400 hover:text-copper-500 rounded-lg hover:bg-loft-800 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-loft-400 hover:text-red-500 rounded-lg hover:bg-loft-800 transition-colors" disabled={admin.role === 'Superadmin'}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="card p-6 bg-loft-900 border-loft-800">
          <h4 className="text-moss-500 font-bold mb-2 flex items-center gap-2"><ShieldAlert className="w-5 h-5"/> Superadmin</h4>
          <p className="text-loft-400 text-sm">Full access to all modules, settings, user management, and financials.</p>
        </div>
        <div className="card p-6 bg-loft-900 border-loft-800">
          <h4 className="text-blue-500 font-bold mb-2 flex items-center gap-2"><DollarSign className="w-5 h-5"/> Finance Admin</h4>
          <p className="text-loft-400 text-sm">Access to invoices, business contracts, and overall revenue analytics.</p>
        </div>
        <div className="card p-6 bg-loft-900 border-loft-800">
          <h4 className="text-copper-500 font-bold mb-2 flex items-center gap-2"><MessageSquare className="w-5 h-5"/> Support Admin</h4>
          <p className="text-loft-400 text-sm">Limited to the Support Inbox, tracking active trips, and driver management.</p>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-loft-900 border border-loft-800 rounded-2xl max-w-md w-full p-8 relative z-50 shadow-2xl">
            <h2 className="text-2xl font-bold text-loft-50 mb-6 font-serif capitalize">
              {editMode ? 'Edit' : 'Add'} Admin
            </h2>
            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-loft-300 uppercase tracking-wider mb-2">Name</label>
                <input 
                  type="text" required className="input-field" 
                  value={adminForm.name} onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-loft-300 uppercase tracking-wider mb-2">Email</label>
                <input 
                  type="email" required className="input-field" 
                  value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-loft-300 uppercase tracking-wider mb-2">
                  {editMode ? 'Reset Password (optional)' : 'Password'}
                </label>
                <input 
                  type="password" required={!editMode} className="input-field" 
                  value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  placeholder={editMode ? 'Leave blank to keep current' : 'Enter temporary password'}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-loft-300 uppercase tracking-wider mb-2">Role</label>
                <select 
                  className="input-field py-3 bg-loft-950" 
                  value={adminForm.role} onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value })}
                >
                  <option value="Superadmin">Superadmin</option>
                  <option value="Finance Admin">Finance Admin</option>
                  <option value="Support Admin">Support Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-loft-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-transparent border border-loft-700 hover:bg-loft-800 text-loft-300 rounded-xl text-sm font-semibold transition-all cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2.5 px-5 text-sm font-semibold rounded-xl cursor-pointer">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsTab;
