import { useState, useEffect } from 'react';
import { Edit2 } from 'lucide-react';
import { adminApi } from '../../services/adminApi';

const ContractsTab = () => {
  const [contracts, setContracts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [contractForm, setContractForm] = useState({
    status: 'pending', volumeCommitment: 0, discountPercentage: 0, dailyRate: 0
  });

  const fetchContracts = async () => {
    try {
      const res = await adminApi.getContracts();
      if (res.data.success) setContracts(res.data.contracts);
    } catch (err) {
      console.error('Error fetching contracts:', err);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const handleOpenEditModal = (item) => {
    setCurrentItem(item);
    setContractForm({ 
      status: item.status || 'pending', 
      volumeCommitment: item.volumeCommitment || 0, 
      discountPercentage: item.discountPercentage || 0, 
      dailyRate: item.dailyRate || 0 
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      if (currentItem) {
        await adminApi.updateContract(currentItem.id, contractForm);
      }
      setIsModalOpen(false);
      fetchContracts();
    } catch (err) {
      console.error('Form submit error:', err);
      alert(err.response?.data?.message || 'Save operation failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-loft-50 font-serif">B2B Contracts</h1>
      </div>

      <div className="card bg-loft-900 border-loft-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-loft-300">
            <thead className="bg-loft-950/50 text-xs uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Business Name</th>
                <th className="px-6 py-4">Start Date</th>
                <th className="px-6 py-4">End Date</th>
                <th className="px-6 py-4">Commitment</th>
                <th className="px-6 py-4">Discount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-loft-800/50">
              {contracts.map(contract => (
                <tr key={contract.id} className="hover:bg-loft-800/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-loft-100">{contract.customer?.name || 'Unknown'}</td>
                  <td className="px-6 py-4">{contract.startDate}</td>
                  <td className="px-6 py-4">{contract.endDate}</td>
                  <td className="px-6 py-4">{contract.volumeCommitment} rides</td>
                  <td className="px-6 py-4">{contract.discountPercentage}%</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      contract.status === 'active' ? 'bg-moss-500/10 text-moss-400 border-moss-500/20' : 
                      contract.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                      contract.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-loft-800 text-loft-400 border-loft-700'
                    }`}>
                      {contract.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button 
                      onClick={() => handleOpenEditModal(contract)}
                      className="text-loft-400 hover:text-copper-400 transition-colors"
                      title="Edit Contract"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {contracts.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-loft-500">
                    No B2B contracts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-loft-900 border border-loft-800 rounded-2xl max-w-md w-full p-8 relative z-50 shadow-2xl">
            <h2 className="text-2xl font-bold text-loft-50 mb-6 font-serif capitalize">
              Edit Contract
            </h2>
            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-loft-300 uppercase tracking-wider mb-2">Status</label>
                <select 
                  className="input-field py-3 bg-loft-950" 
                  value={contractForm.status} onChange={(e) => setContractForm({ ...contractForm, status: e.target.value })}
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-loft-300 uppercase tracking-wider mb-2">Volume Commitment (Rides)</label>
                <input 
                  type="number" className="input-field" 
                  value={contractForm.volumeCommitment} onChange={(e) => setContractForm({ ...contractForm, volumeCommitment: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-loft-300 uppercase tracking-wider mb-2">Discount Percentage (%)</label>
                <input 
                  type="number" step="0.01" className="input-field" 
                  value={contractForm.discountPercentage} onChange={(e) => setContractForm({ ...contractForm, discountPercentage: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-loft-300 uppercase tracking-wider mb-2">Daily Rate Override (₹)</label>
                <input 
                  type="number" step="0.01" className="input-field" 
                  value={contractForm.dailyRate} onChange={(e) => setContractForm({ ...contractForm, dailyRate: parseFloat(e.target.value) || 0 })}
                />
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

export default ContractsTab;
