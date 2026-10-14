import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { adminApi } from '../../services/adminApi';

const DriversTab = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [driverForm, setDriverForm] = useState({
    name: '', phone: '', email: '', licenseNumber: '', status: 'active', password: ''
  });

  const [pendingBookings, setPendingBookings] = useState([]);
  const [assigningId, setAssigningId] = useState(null);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getDrivers();
      if (res.data.success) setDrivers(res.data.drivers);

      const bookingsRes = await adminApi.getBookings();
      if (bookingsRes.data.success) {
        setPendingBookings(
          (bookingsRes.data.bookings || []).filter(b => b.status === 'pending' || !b.driverId)
        );
      }
    } catch (err) {
      console.error('Error fetching drivers or bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAppointBooking = async (bookingId, driverId) => {
    if (!driverId) return;
    setAssigningId(bookingId);
    try {
      await adminApi.assignDriverToBooking(bookingId, driverId);
      alert('Trip successfully assigned to driver!');
      fetchDrivers();
    } catch (err) {
      console.error('Error appointing trip:', err);
      alert(err.response?.data?.message || 'Failed to appoint trip to driver');
    } finally {
      setAssigningId(null);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleOpenCreateModal = () => {
    setEditMode(false);
    setCurrentItem(null);
    setDriverForm({ name: '', phone: '', email: '', licenseNumber: '', status: 'active', password: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditMode(true);
    setCurrentItem(item);
    setDriverForm({
      name: item.name || '',
      phone: item.phone || '',
      email: item.email || '',
      licenseNumber: item.licenseNumber || '',
      status: item.status || 'active',
      password: ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteItem = (id) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const executeDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      const res = await adminApi.deleteDriver(deleteConfirm.id);
      if (res.data.success) {
        setDeleteConfirm({ isOpen: false, id: null });
        fetchDrivers();
      }
    } catch (err) {
      console.error('Error deleting driver:', err);
      alert(err.response?.data?.message || 'Delete operation failed');
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      if (editMode && currentItem) {
        await adminApi.updateDriver(currentItem.id, driverForm);
      } else {
        await adminApi.createDriver(driverForm);
      }
      setIsModalOpen(false);
      fetchDrivers();
    } catch (err) {
      console.error('Form submit error:', err);
      alert(err.response?.data?.message || 'Save operation failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-loft-50 font-serif">Manage Drivers</h1>
        <button 
          onClick={handleOpenCreateModal}
          className="btn-primary flex items-center gap-2 py-2 px-4 text-sm font-semibold rounded-xl cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Driver
        </button>
      </div>

      <div className="card bg-loft-900 border-loft-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-loft-400">Loading drivers...</div>
        ) : drivers.length === 0 ? (
          <div className="p-12 text-center text-loft-400">No drivers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-loft-300">
              <thead className="bg-loft-950/50 text-xs uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">License Number</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-loft-800">
                {drivers.map((drv) => (
                  <tr key={drv.id} className="hover:bg-loft-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-loft-100">{drv.name}</td>
                    <td className="px-6 py-4">{drv.phone}</td>
                    <td className="px-6 py-4">{drv.licenseNumber}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${
                        drv.status === 'active' ? 'bg-moss-500/10 text-moss-500' :
                        drv.status === 'on_trip' ? 'bg-copper-500/10 text-copper-500' : 'bg-loft-700 text-loft-400'
                      }`}>
                        {drv.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenEditModal(drv)}
                        className="p-2 text-loft-400 hover:text-copper-500 rounded-lg hover:bg-loft-800 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(drv.id)}
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

      {/* Direct Work Appointment Panel */}
      <div className="card bg-loft-900 border-loft-800 p-6">
        <h2 className="text-xl font-bold text-loft-50 mb-2 font-serif flex items-center justify-between">
          <span>Appoint Work to Drivers</span>
          <span className="text-xs font-sans font-medium px-2.5 py-1 rounded-full bg-copper-500/20 text-copper-400 border border-copper-500/30">
            {pendingBookings.length} Unassigned / Pending Trips
          </span>
        </h2>
        <p className="text-xs text-loft-400 mb-6">
          Directly dispatch customer bookings to qualified drivers in your fleet.
        </p>

        {pendingBookings.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-loft-800 rounded-xl text-loft-400 text-sm">
            All customer bookings are currently appointed!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-loft-300">
              <thead className="bg-loft-950/50 text-xs uppercase font-medium">
                <tr>
                  <th className="px-4 py-3">Booking ID</th>
                  <th className="px-4 py-3">Route (Pickup → Drop)</th>
                  <th className="px-4 py-3">Goods / Tempo</th>
                  <th className="px-4 py-3">Fare</th>
                  <th className="px-4 py-3">Directly Appoint Driver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-loft-800">
                {pendingBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-loft-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-loft-400">{b.id.slice(0, 8)}...</td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-loft-100 font-medium truncate max-w-xs">{b.pickupAddress}</p>
                      <p className="text-xs text-copper-400 truncate max-w-xs">→ {b.dropAddress || 'Multi-stop'}</p>
                    </td>
                    <td className="px-4 py-3 capitalize text-xs">{b.tempoType} • {b.goodsType}</td>
                    <td className="px-4 py-3 font-semibold text-loft-100">₹{b.estimatedFare}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <select
                          defaultValue=""
                          onChange={(e) => handleAppointBooking(b.id, e.target.value)}
                          disabled={assigningId === b.id}
                          className="input-field py-1.5 px-3 text-xs bg-loft-950"
                        >
                          <option value="" disabled>Select Driver to Appoint</option>
                          {drivers.filter(d => d.status === 'active').map((drv) => (
                            <option key={drv.id} value={drv.id}>
                              {drv.name} ({drv.phone})
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-loft-900 border border-loft-800 rounded-2xl max-w-md w-full p-6 sm:p-8 relative z-50 shadow-2xl max-h-[90vh] flex flex-col my-auto">
            <h2 className="text-2xl font-bold text-loft-50 mb-4 font-serif capitalize shrink-0">
              {editMode ? 'Edit' : 'Add'} Driver
            </h2>
            <form onSubmit={handleSubmitForm} className="space-y-4 overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block text-xs font-semibold text-loft-300 uppercase tracking-wider mb-2">Name</label>
                <input 
                  type="text" required className="input-field" 
                  value={driverForm.name} onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-loft-300 uppercase tracking-wider mb-2">Phone</label>
                <input 
                  type="text" required className="input-field" 
                  value={driverForm.phone} onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-loft-300 uppercase tracking-wider mb-2">Email</label>
                <input 
                  type="email" className="input-field" 
                  value={driverForm.email} onChange={(e) => setDriverForm({ ...driverForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-loft-300 uppercase tracking-wider mb-2">License Number</label>
                <input 
                  type="text" required className="input-field" 
                  value={driverForm.licenseNumber} onChange={(e) => setDriverForm({ ...driverForm, licenseNumber: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-loft-300 uppercase tracking-wider mb-2">
                  {editMode ? 'Reset Password (optional)' : 'Password (Initial Credentials)'}
                </label>
                <input 
                  type="password" 
                  placeholder={editMode ? 'Leave blank to keep unchanged' : 'Min 6 characters'}
                  className="input-field" 
                  value={driverForm.password} 
                  onChange={(e) => setDriverForm({ ...driverForm, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-loft-300 uppercase tracking-wider mb-2">Status</label>
                <select 
                  className="input-field py-3 bg-loft-950" 
                  value={driverForm.status} onChange={(e) => setDriverForm({ ...driverForm, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_trip">On Trip</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-loft-800 shrink-0 bg-loft-900 sticky bottom-0">
                <button 
                  type="button" onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-transparent border border-loft-700 hover:bg-loft-800 text-loft-300 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                >
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

      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-loft-900 border border-loft-800 rounded-2xl max-w-sm w-full p-6 relative z-50 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-loft-50 mb-2 font-serif capitalize">Delete Driver</h2>
            <p className="text-loft-400 text-sm mb-6">Are you sure you want to delete this driver? This action cannot be undone.</p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setDeleteConfirm({ isOpen: false, id: null })}
                className="px-5 py-2.5 bg-transparent border border-loft-700 hover:bg-loft-800 text-loft-300 rounded-xl text-sm font-semibold transition-all cursor-pointer flex-1"
              >
                Cancel
              </button>
              <button onClick={executeDelete} className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer flex-1">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriversTab;
