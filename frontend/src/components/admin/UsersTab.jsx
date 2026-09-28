import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useAdminUsers } from '../../hooks/useAdminUsers';

const UsersTab = () => {
  const {
    customers, loading, isModalOpen, editMode, deleteConfirm, customerForm,
    setCustomerForm, setIsModalOpen, setDeleteConfirm,
    handleOpenCreateModal, handleOpenEditModal, handleDeleteItem, executeDelete, handleSubmitForm
  } = useAdminUsers();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-loft-50 font-serif">Manage Users</h1>
        <button 
          onClick={handleOpenCreateModal}
          className="btn-primary flex items-center gap-2 py-2 px-4 text-sm font-semibold rounded-xl cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      <div className="card bg-loft-900 border-loft-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-loft-400">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-loft-400">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-loft-300">
              <thead className="bg-loft-950/50 text-xs uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">City</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-loft-800">
                {customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-loft-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-loft-100">{cust.name || 'N/A'}</td>
                    <td className="px-6 py-4">{cust.phone || 'N/A'}</td>
                    <td className="px-6 py-4">{cust.email || 'N/A'}</td>
                    <td className="px-6 py-4">{cust.city || 'N/A'}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenEditModal(cust)}
                        className="p-2 text-loft-400 hover:text-copper-500 rounded-lg hover:bg-loft-800 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(cust.id)}
                        className="p-2 text-loft-400 hover:text-red-500 rounded-lg hover:bg-loft-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-loft-900 border border-loft-800 rounded-2xl max-w-md w-full p-8 relative z-50 shadow-2xl">
            <h2 className="text-2xl font-bold text-loft-50 mb-6 font-serif capitalize">
              {editMode ? 'Edit' : 'Add'} Customer
            </h2>
            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-loft-300 uppercase tracking-wider mb-2">Name</label>
                <input 
                  type="text" required className="input-field" 
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-loft-300 uppercase tracking-wider mb-2">Phone</label>
                <input 
                  type="text" required className="input-field" 
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-loft-300 uppercase tracking-wider mb-2">Email</label>
                <input 
                  type="email" className="input-field" 
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-loft-300 uppercase tracking-wider mb-2">City</label>
                  <input 
                    type="text" className="input-field" 
                    value={customerForm.city}
                    onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-loft-300 uppercase tracking-wider mb-2">State</label>
                  <input 
                    type="text" className="input-field" 
                    value={customerForm.state}
                    onChange={(e) => setCustomerForm({ ...customerForm, state: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-loft-300 uppercase tracking-wider mb-2">Address</label>
                <textarea 
                  rows="2" className="input-field py-2" 
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-loft-800">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-transparent border border-loft-700 hover:bg-loft-800 text-loft-300 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-primary py-2.5 px-5 text-sm font-semibold rounded-xl cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-loft-900 border border-loft-800 rounded-2xl max-w-sm w-full p-6 relative z-50 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-loft-50 mb-2 font-serif capitalize">
              Delete Customer
            </h2>
            <p className="text-loft-400 text-sm mb-6">
              Are you sure you want to delete this customer? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setDeleteConfirm({ isOpen: false, id: null })}
                className="px-5 py-2.5 bg-transparent border border-loft-700 hover:bg-loft-800 text-loft-300 rounded-xl text-sm font-semibold transition-all cursor-pointer flex-1"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete}
                className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer flex-1"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTab;
