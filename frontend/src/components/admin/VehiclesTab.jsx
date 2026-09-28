import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { adminApi } from '../../services/adminApi';

const VehiclesTab = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [vehicleForm, setVehicleForm] = useState({
    registrationNumber: '', type: 'small', capacityWeight: '', status: 'available'
  });

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getVehicles();
      if (res.data.success) setVehicles(res.data.vehicles);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleOpenCreateModal = () => {
    setEditMode(false);
    setCurrentItem(null);
    setVehicleForm({ registrationNumber: '', type: 'small', capacityWeight: '', status: 'available' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditMode(true);
    setCurrentItem(item);
    setVehicleForm({
      registrationNumber: item.registrationNumber || '',
      type: item.type || 'small',
      model: item.model || '',
      capacityWeight: item.capacityWeight || 1000,
      status: item.status || 'available'
    });
    setIsModalOpen(true);
  };

  const handleDeleteItem = (id) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const executeDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      const res = await adminApi.deleteVehicle(deleteConfirm.id);
      if (res.data.success) {
        setDeleteConfirm({ isOpen: false, id: null });
        fetchVehicles();
      }
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      alert(err.response?.data?.message || 'Delete operation failed');
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      if (editMode && currentItem) {
        await adminApi.updateVehicle(currentItem.id, vehicleForm);
      } else {
        await adminApi.createVehicle(vehicleForm);
      }
      setIsModalOpen(false);
      fetchVehicles();
    } catch (err) {
      console.error('Form submit error:', err);
      alert(err.response?.data?.message || 'Save operation failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-loft-50 font-serif">Manage Vehicles</h1>
        <button 
          onClick={handleOpenCreateModal}
          className="btn-primary flex items-center gap-2 py-2 px-4 text-sm font-semibold rounded-xl cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      <div className="card bg-loft-900 border-loft-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-loft-400">Loading vehicles...</div>
        ) : vehicles.length === 0 ? (
          <div className="p-12 text-center text-loft-400">No vehicles found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-loft-300">
              <thead className="bg-loft-950/50 text-xs uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">Reg Number</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Model</th>
                  <th className="px-6 py-4">Weight (kg)</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-loft-800">
                {vehicles.map((vh) => (
                  <tr key={vh.id} className="hover:bg-loft-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-loft-100">{vh.registrationNumber}</td>
                    <td className="px-6 py-4 capitalize">{vh.type}</td>
                    <td className="px-6 py-4">{vh.model || 'N/A'}</td>
                    <td className="px-6 py-4">{vh.capacityWeight}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${
                        vh.status === 'available' ? 'bg-moss-500/10 text-moss-500' :
                        vh.status === 'on_trip' ? 'bg-copper-500/10 text-copper-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {vh.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenEditModal(vh)}
                        className="p-2 text-loft-400 hover:text-copper-500 rounded-lg hover:bg-loft-800 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(vh.id)}
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-loft-900 border border-loft-800 rounded-2xl max-w-md w-full p-8 relative z-50 shadow-2xl">
            <h2 className="text-2xl font-bold text-loft-50 mb-6 font-serif capitalize">
              {editMode ? 'Edit' : 'Add'} Vehicle
            </h2>
            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-loft-300 uppercase tracking-wider mb-2">Registration Number</label>
                <input 
                  type="text" required className="input-field" 
                  value={vehicleForm.registrationNumber} onChange={(e) => setVehicleForm({ ...vehicleForm, registrationNumber: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-loft-300 uppercase tracking-wider mb-2">Model</label>
                <input 
                  type="text" className="input-field" 
                  value={vehicleForm.model} onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-loft-300 uppercase tracking-wider mb-2">Type</label>
                  <select 
                    className="input-field py-3 bg-loft-950" 
                    value={vehicleForm.type} onChange={(e) => setVehicleForm({ ...vehicleForm, type: e.target.value })}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-loft-300 uppercase tracking-wider mb-2">Capacity (kg)</label>
                  <input 
                    type="number" required className="input-field" 
                    value={vehicleForm.capacityWeight} onChange={(e) => setVehicleForm({ ...vehicleForm, capacityWeight: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-loft-300 uppercase tracking-wider mb-2">Status</label>
                <select 
                  className="input-field py-3 bg-loft-950" 
                  value={vehicleForm.status} onChange={(e) => setVehicleForm({ ...vehicleForm, status: e.target.value })}
                >
                  <option value="available">Available</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="on_trip">On Trip</option>
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

      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-loft-900 border border-loft-800 rounded-2xl max-w-sm w-full p-6 relative z-50 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-loft-50 mb-2 font-serif capitalize">Delete Vehicle</h2>
            <p className="text-loft-400 text-sm mb-6">Are you sure you want to delete this vehicle? This action cannot be undone.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteConfirm({ isOpen: false, id: null })} className="px-5 py-2.5 bg-transparent border border-loft-700 hover:bg-loft-800 text-loft-300 rounded-xl text-sm font-semibold transition-all cursor-pointer flex-1">
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

export default VehiclesTab;
