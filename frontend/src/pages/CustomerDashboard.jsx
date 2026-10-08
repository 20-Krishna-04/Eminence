import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Package, CheckCircle, Wallet, MapPin, Plus, Gift, Copy, 
  Crown, Target, Star, Leaf, Truck, Bell, Check, AlertCircle, RefreshCw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { updateProfileSuccess } from '../redux/slices/authSlice';
import ReviewModal from '../components/Customer/ReviewModal';
import { addressSchema, profileSchema } from '../utils/formSchemas';

const CustomerDashboard = () => {
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('history');
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [walletData, setWalletData] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const copyTimeoutRef = useRef(null);

  // Live booking state
  const [bookings, setBookingsData] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);
  const isPro = Boolean(user?.isPro);
  const totalTrips = user?.totalTrips ?? 0;
  const [downloadingInvoice, setDownloadingInvoice] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewTrip, setReviewTrip] = useState(null);
  const [reviewedBookings, setReviewedBookings] = useState({});
  
  // Addresses State with explicit request tracking
  const [addressState, setAddressState] = useState({
    loading: false,
    error: null,
    data: []
  });
  const [addressFormError, setAddressFormError] = useState('');
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: '', street: '', city: '', postalCode: '' });

  // Wallet State with explicit request tracking
  const [walletState, setWalletState] = useState({
    loading: false,
    error: null,
    data: null
  });

  // Profile State with explicit request tracking
  const [profileState, setProfileState] = useState({
    loading: false,
    error: null,
    success: false
  });
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || '',
    state: user?.state || '',
  });

  // Trip History State
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/api/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const res = await api.get('/api/bookings');
      setBookingsData(res.data.bookings || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    console.log('CustomerDashboard useEffect running. user:', !!user, 'activeTab:', activeTab);
    if (user) {
      fetchWallet();
      fetchBookings();
    }
    if (activeTab === 'addresses' && user) {
      fetchAddresses();
    }
    if (activeTab === 'notifications' && user) {
      fetchNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user]);

  const fetchAddresses = async () => {
    setAddressState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const res = await api.get('/api/address');
      setAddressState({ loading: false, error: null, data: Array.isArray(res.data) ? res.data : [] });
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setAddressState({ 
        loading: false, 
        error: error.response?.data?.message || 'Unable to load addresses. Please check your connection.', 
        data: [] 
      });
    }
  };

  const handleSaveAddress = async () => {
    setAddressFormError('');
    const validation = addressSchema.safeParse(newAddress);
    if (!validation.success) {
      setAddressFormError(validation.error.issues[0]?.message || 'Please verify address fields');
      return;
    }
    setIsSavingAddress(true);
    try {
      const res = await api.post('/api/address', newAddress);
      setAddressState(prev => ({ ...prev, data: [...prev.data, res.data] }));
      setIsAddAddressOpen(false);
      setNewAddress({ label: '', street: '', city: '', postalCode: '' });
    } catch (error) {
      console.error('Error saving address:', error);
      setAddressFormError(error.response?.data?.message || 'Failed to save address.');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await api.delete(`/api/address/${id}`);
      setAddressState(prev => ({ ...prev, data: prev.data.filter(addr => addr.id !== id) }));
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Unable to delete address.');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileState({ loading: true, error: null, success: false });
    const validation = profileSchema.safeParse(profileForm);
    if (!validation.success) {
      setProfileState({ 
        loading: false, 
        error: validation.error.issues[0]?.message || 'Please check profile fields', 
        success: false 
      });
      return;
    }
    try {
      const res = await api.post('/api/auth/complete-profile', profileForm);
      dispatch(updateProfileSuccess(res.data.user));
      setProfileState({ loading: false, error: null, success: true });
    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileState({ 
        loading: false, 
        error: error.response?.data?.message || 'Error updating profile', 
        success: false 
      });
    }
  };

  const fetchWallet = async () => {
    setWalletState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const res = await api.get('/api/wallet');
      setWalletData(res.data);
      setWalletState({ loading: false, error: null, data: res.data });
    } catch (error) {
      console.error('Error fetching wallet:', error);
      setWalletState({ 
        loading: false, 
        error: error.response?.data?.message || 'Unable to load wallet information.', 
        data: null 
      });
    }
  };

  const copyToClipboard = async () => {
    const code = walletData?.referralCode || user?.referralCode || 'EMN-DEMO-2026';
    if (code) {
      try {
        await navigator.clipboard.writeText(code);
        setCopySuccess(true);
        
        if (copyTimeoutRef.current) {
          clearTimeout(copyTimeoutRef.current);
        }
        
        copyTimeoutRef.current = setTimeout(() => {
          setCopySuccess(false);
        }, 2000);
      } catch (error) {
        console.error('Clipboard copy failed:', error);
      }
    }
  };

  const handleDownloadInvoice = (id) => {
    console.log('Downloading invoice for id:', id);
    setDownloadingInvoice(id);
    setTimeout(() => {
      setDownloadingInvoice(null);
      
      const blob = new Blob(['Invoice Data'], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `INV-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 500);
  };

  return (
    <div className="w-full pt-12 pb-24 relative min-h-[80vh]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(85,108,145,0.1),transparent_70%)] pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-loft-50 mb-2 flex items-center gap-3">
              Dashboard
              {isPro && <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-widest"><Crown className="w-3 h-3"/> Pro</span>}
            </h1>
            <p className="text-loft-300">Welcome back, <span className="text-copper-400 font-medium">{user?.name || 'User'}</span>!</p>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex space-x-2 border-b border-loft-800 mb-8 overflow-x-auto hide-scrollbar">
          {['history', 'tracking', 'invoices', 'addresses', 'payments', 'rewards', 'notifications', 'support', 'profile'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium text-sm rounded-t-lg transition-colors whitespace-nowrap capitalize ${
                activeTab === tab
                  ? 'bg-copper-500/15 text-copper-300 border-b-2 border-copper-500'
                  : 'text-loft-400 hover:text-loft-200 hover:bg-loft-900/50'
              }`}
            >
              {tab === 'history' ? 'Bookings' : tab}
              {tab === 'notifications' && unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Statistics Cards — Live from API */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Total Bookings', value: bookings.length || 0, icon: Package },
            { label: 'Completed Rides', value: bookings.filter(b => b.status === 'completed').length || 0, icon: CheckCircle },
            { label: 'Total Spent', value: `₹${bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (parseFloat(b.estimatedFare) || 0), 0).toLocaleString('en-IN')}`, icon: Wallet },
          ].map((stat, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className="card p-6 flex items-center justify-between"
            >
              <div>
                <p className="text-loft-400 text-sm font-medium uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-loft-50">{stat.value}</p>
              </div>
              <div className="w-12 h-12 bg-loft-800 rounded-full flex items-center justify-center text-copper-500">
                <stat.icon className="w-6 h-6" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Gamification & Retention Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Eminence Pro Upsell (Only show if not Pro) */}
          {!isPro ? (
            <div className="card p-6 bg-gradient-to-br from-loft-900 to-loft-950 border-yellow-500/30 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-2xl"></div>
              <div>
                <h3 className="text-xl font-bold text-yellow-500 mb-2 flex items-center gap-2"><Crown className="w-5 h-5"/> Eminence Pro</h3>
                <p className="text-loft-300 text-sm mb-4">Upgrade for ₹499/mo to get <strong className="text-yellow-400">Zero Cancellation Fees</strong>, Priority Allocation, and <strong className="text-yellow-400">5% OFF</strong> all bookings.</p>
              </div>
              <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded-lg shadow-[0_0_15px_rgba(234,179,8,0.2)] transition-all w-full md:w-auto self-start">
                Upgrade Now
              </button>
            </div>
          ) : (
            <div className="card p-6 bg-gradient-to-br from-loft-900 to-loft-950 border-yellow-500/30 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-2xl"></div>
              <div>
                <h3 className="text-xl font-bold text-yellow-500 mb-2 flex items-center gap-2"><Crown className="w-5 h-5"/> Eminence Pro Active</h3>
                <p className="text-loft-300 text-sm">You are enjoying Zero Cancellation Fees, Priority Allocation, and 5% OFF all bookings.</p>
              </div>
            </div>
          )}

          {/* Milestone Rewards */}
          <div className="card p-6 bg-loft-900 border-loft-800">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-loft-50 flex items-center gap-2"><Target className="w-5 h-5 text-moss-500"/> Current Milestone</h3>
                <p className="text-loft-400 text-sm">Complete 10 rides to unlock <strong className="text-moss-400">₹500 Wallet Cash</strong></p>
              </div>
              <div className="w-10 h-10 bg-moss-500/10 rounded-full flex items-center justify-center border border-moss-500/30">
                <Star className="w-5 h-5 text-moss-500"/>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-loft-300">
                <span>{totalTrips} Rides</span>
                <span>10 Rides</span>
              </div>
              <div className="w-full bg-loft-950 rounded-full h-3 overflow-hidden border border-loft-800">
                <div 
                  className="bg-gradient-to-r from-moss-600 to-moss-400 h-3 rounded-full transition-all duration-1000 relative"
                  style={{ width: `${(totalTrips / 10) * 100}%` }}
                >
                  <div className="absolute top-0 right-0 bottom-0 left-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
                </div>
              </div>
              <p className="text-xs text-right text-moss-500 mt-1">{10 - totalTrips} rides remaining!</p>
            </div>
          </div>

          {/* Refer & Earn Shortcut */}
          <div className="card p-6 bg-gradient-to-br from-loft-900 to-loft-950 border-moss-500/30 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-moss-500/10 rounded-full blur-2xl"></div>
            <div>
              <h3 className="text-xl font-bold text-moss-500 mb-2 flex items-center gap-2"><Gift className="w-5 h-5"/> Refer & Earn</h3>
              <p className="text-loft-300 text-sm mb-4">Share code: <strong className="text-copper-400">{walletData?.referralCode || user?.referralCode || 'EMN-DEMO-2026'}</strong></p>
            </div>
            <button onClick={copyToClipboard} className="bg-moss-600 hover:bg-moss-500 text-white font-bold py-2 px-6 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.2)] transition-all w-full md:w-auto self-start flex items-center gap-2 justify-center">
              {copySuccess ? <><CheckCircle className="w-4 h-4"/> Copied!</> : <><Copy className="w-4 h-4"/> Copy Code</>}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[300px]">
          {activeTab === 'history' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-loft-50">Recent Bookings</h3>
                <button onClick={fetchBookings} className="text-copper-500 text-sm font-medium hover:text-copper-400 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>
              <div className="space-y-4">
                {bookingsLoading ? (
                  <div className="card p-8 text-center">
                    <div className="w-8 h-8 border-2 border-copper-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-loft-400 text-sm">Loading your bookings...</p>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="card p-12 text-center">
                    <Package className="w-12 h-12 text-loft-600 mx-auto mb-3" />
                    <h4 className="text-loft-300 font-semibold mb-1">No bookings yet</h4>
                    <p className="text-loft-500 text-sm">Your ride history will appear here once you book your first trip.</p>
                  </div>
                ) : bookings.map((booking) => {
                  const statusLabel = booking.status === 'completed' ? 'Completed' : booking.status === 'cancelled' ? 'Cancelled' : booking.status;
                  const isCompleted = booking.status === 'completed';
                  const isCancelled = booking.status === 'cancelled';
                  return (
                  <div key={booking.id} className="card p-5 bg-loft-900 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-transparent hover:border-l-copper-500 transition-all">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-loft-50 font-mono text-sm">{booking.id?.slice(0, 8).toUpperCase()}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isCompleted ? 'bg-moss-500/20 text-moss-500' : isCancelled ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {statusLabel}
                        </span>
                        <span className="text-loft-400 text-sm">{new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-loft-300">
                        <Package className="w-4 h-4 text-loft-500" />
                        <span>{booking.vehicle?.type || booking.tempoType || 'Vehicle'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-loft-300 mt-1">
                        <MapPin className="w-4 h-4 text-copper-500" />
                        <span>{booking.pickupAddress || 'Pickup'} &rarr; {booking.dropAddress || (booking.drops?.[0]) || 'Drop'}</span>
                      </div>
                      {booking.esgEmissions && (
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          <span className="flex items-center gap-1.5 text-xs text-moss-400 bg-moss-900/30 px-2 py-1 rounded-md border border-moss-800">
                            <Leaf className="w-3 h-3" />
                            {booking.esgEmissions} KG CO2 Saved
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
                      <span className="text-xl font-bold text-loft-100">₹{parseFloat(booking.estimatedFare || 0).toLocaleString('en-IN')}</span>
                      <div className="flex items-center gap-2">
                        {isCompleted && (
                          reviewedBookings[booking.id] ? (
                            <span className="text-xs font-semibold text-moss-400 bg-moss-900/30 px-2 py-1 rounded border border-moss-800">
                              ★ {reviewedBookings[booking.id]}.0 Rated
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setReviewTrip(booking);
                                setIsReviewModalOpen(true);
                              }}
                              className="btn-secondary py-1.5 px-2.5 text-xs text-amber-400 border-amber-500/30 hover:border-amber-500/60"
                            >
                              ⭐ Rate Driver
                            </button>
                          )
                        )}
                        <button 
                          onClick={() => setSelectedTrip(booking)}
                          className="btn-secondary py-1.5 px-3 text-xs"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'invoices' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-loft-50">Invoices & Receipts</h3>
                <button className="text-copper-500 text-sm font-medium hover:text-copper-400">Download All</button>
              </div>
              <div className="card bg-loft-900 border-loft-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-loft-300">
                    <thead className="bg-loft-950/50 text-xs uppercase font-medium">
                      <tr>
                        <th className="px-6 py-4">Invoice No.</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Booking Ref</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-loft-800">
                      {bookings.filter(b => b.status === 'completed').length === 0 ? (
                        <tr><td colSpan="5" className="px-6 py-8 text-center text-loft-500 text-sm">No invoices yet. Completed bookings will appear here.</td></tr>
                      ) : bookings.filter(b => b.status === 'completed').map((booking, idx) => (
                        <tr key={idx} className="hover:bg-loft-800/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-loft-200 font-mono text-sm">INV-{booking.id?.slice(0,8).toUpperCase()}</td>
                          <td className="px-6 py-4">{new Date(booking.updatedAt || booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          <td className="px-6 py-4 font-mono text-sm">{booking.id?.slice(0,8).toUpperCase()}</td>
                          <td className="px-6 py-4 font-bold text-loft-100">₹{parseFloat(booking.estimatedFare || 0).toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => handleDownloadInvoice(booking.id)}
                              disabled={downloadingInvoice === booking.id}
                              className="text-copper-500 hover:text-copper-400 font-medium text-xs flex items-center gap-1 disabled:opacity-50"
                            >
                              {downloadingInvoice === booking.id ? 'Downloading...' : 'Download PDF'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'addresses' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-loft-50">Your Addresses</h3>
                <button 
                  onClick={() => setIsAddAddressOpen(true)}
                  className="btn-secondary py-2 px-4 text-sm"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Address
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.length === 0 ? (
                  <p className="text-loft-400">No saved addresses yet.</p>
                ) : (
                  addresses.map((address) => (
                    <div key={address.id} className="card p-6 border-l-4 border-l-copper-500">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-loft-50 mb-1">{address.label}</h4>
                          <p className="text-loft-300 text-sm leading-relaxed">
                            {address.street}<br/>
                            {address.city}, {address.postalCode}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="p-2 bg-loft-800 rounded-lg text-copper-500">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <button 
                            onClick={() => handleDeleteAddress(address.id)}
                            className="p-1.5 text-xs text-red-500 hover:bg-red-500/10 rounded transition-colors text-center"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* Placeholders for new tabs */}
          {activeTab === 'rewards' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Wallet Balance Card */}
                <div className="card p-8 bg-gradient-to-br from-loft-900 to-loft-950 border-copper-500/20 relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-copper-500/10 rounded-full blur-2xl"></div>
                  <h3 className="text-lg font-bold text-loft-300 mb-2">Available Balance</h3>
                  <div className="flex items-end gap-2 mb-6">
                    <span className="text-4xl font-bold text-copper-400">
                      ₹{walletData?.wallet?.balance?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <button className="btn-primary py-2 px-6 w-full md:w-auto text-sm">
                    Add Funds
                  </button>
                </div>

                {/* Referral Card */}
                <div className="card p-8 bg-loft-900 border-loft-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-moss-500/10 text-moss-500 flex items-center justify-center">
                      <Gift className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-loft-50">Refer & Earn ₹100</h3>
                  </div>
                  <p className="text-loft-300 text-sm mb-6">
                    Share your unique referral code with friends. When they sign up and complete their first booking, you both get ₹100 in your wallet!
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-loft-950 border border-loft-800 rounded-lg px-4 py-3 font-mono text-copper-400 text-center tracking-wider font-bold">
                      {walletData?.referralCode || user?.referralCode || 'EMN-DEMO-2026'}
                    </div>
                    <button 
                      onClick={copyToClipboard}
                      className="p-3 bg-loft-800 hover:bg-loft-700 rounded-lg text-loft-200 transition-colors"
                      title="Copy Code"
                    >
                      {copySuccess ? <CheckCircle className="w-5 h-5 text-moss-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Transactions List */}
              <div className="card p-6 bg-loft-900 border-loft-800">
                <h3 className="text-lg font-bold text-loft-50 mb-4">Recent Transactions</h3>
                {walletData?.wallet?.transactions?.length > 0 ? (
                  <div className="space-y-3">
                    {walletData.wallet.transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg bg-loft-950/50 border border-loft-800/50">
                        <div>
                          <p className="font-medium text-loft-100">{tx.description}</p>
                          <p className="text-xs text-loft-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className={`font-bold ${tx.type === 'CREDIT' ? 'text-moss-500' : 'text-red-500'}`}>
                          {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-loft-400 text-sm">
                    No transactions yet.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {['tracking', 'payments', 'support'].includes(activeTab) && (
             <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card p-12 text-center flex flex-col items-center justify-center border-dashed border-loft-800/80"
            >
              <h3 className="text-xl font-bold text-loft-200 mb-2 capitalize">{activeTab}</h3>
              <p className="text-loft-400 max-w-md">This section is currently under development.</p>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-loft-50">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-copper-500 text-sm font-medium hover:text-copper-400">Mark all as read</button>
                )}
              </div>
              <div className="card bg-loft-900 border-loft-800 overflow-hidden p-6">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-loft-400">No notifications yet.</div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div key={notification.id} className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${notification.isRead ? 'bg-loft-950/50 border-loft-800/50' : 'bg-copper-900/10 border-copper-500/30'}`}>
                        <div className={`p-2 rounded-full ${notification.isRead ? 'bg-loft-800 text-loft-400' : 'bg-copper-500/20 text-copper-400'}`}>
                          <Bell className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-bold ${notification.isRead ? 'text-loft-300' : 'text-loft-50'}`}>{notification.title}</h4>
                          <p className={`text-sm mt-1 ${notification.isRead ? 'text-loft-400' : 'text-loft-200'}`}>{notification.message}</p>
                          <span className="text-xs text-loft-500 mt-2 block">{new Date(notification.createdAt).toLocaleString()}</span>
                        </div>
                        {!notification.isRead && (
                          <button onClick={() => markAsRead(notification.id)} className="p-2 text-moss-500 hover:bg-moss-500/10 rounded-full" title="Mark as read">
                            <Check className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="card p-6 md:p-8 bg-loft-900 border-loft-800">
                <h3 className="text-2xl font-bold text-loft-50 mb-6 border-b border-loft-800 pb-4">Profile Settings</h3>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-loft-300 mb-2">Full Name</label>
                      <input 
                        type="text" 
                        required
                        className="input-field" 
                        value={profileForm.name} 
                        onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-loft-300 mb-2">Phone Number</label>
                      <input 
                        type="tel" 
                        required
                        className="input-field" 
                        value={profileForm.phone} 
                        onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-loft-300 mb-2">Email Address</label>
                      <input 
                        type="email" 
                        className="input-field" 
                        value={profileForm.email} 
                        onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-loft-300 mb-2">City</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        value={profileForm.city} 
                        onChange={(e) => setProfileForm({...profileForm, city: e.target.value})} 
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <button type="submit" className="btn-primary py-3 px-8 text-sm">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </div>

        {/* Gamification & Retention Section */}
        <div className="grid grid-cols-1 gap-6 mt-12 mb-12">
          {/* Eminence Pro Upsell (Only show if not Pro) */}
          {!isPro ? (
            <div className="card p-6 bg-gradient-to-br from-loft-900 to-loft-950 border-yellow-500/30 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-2xl"></div>
              <div>
                <h3 className="text-xl font-bold text-yellow-500 mb-2 flex items-center gap-2"><Crown className="w-5 h-5"/> Eminence Pro</h3>
                <p className="text-loft-300 text-sm mb-4">Upgrade for ₹499/mo to get <strong className="text-yellow-400">Zero Cancellation Fees</strong>, Priority Allocation, and <strong className="text-yellow-400">5% OFF</strong> all bookings.</p>
              </div>
              <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded-lg shadow-[0_0_15px_rgba(234,179,8,0.2)] transition-all w-full md:w-auto self-start">
                Upgrade Now
              </button>
            </div>
          ) : (
            <div className="card p-6 bg-gradient-to-br from-loft-900 to-loft-950 border-yellow-500/30 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-2xl"></div>
              <div>
                <h3 className="text-xl font-bold text-yellow-500 mb-2 flex items-center gap-2"><Crown className="w-5 h-5"/> Eminence Pro Active</h3>
                <p className="text-loft-300 text-sm">You are enjoying Zero Cancellation Fees, Priority Allocation, and 5% OFF all bookings.</p>
              </div>
            </div>
          )}

          {/* Milestone Rewards */}
          <div className="card p-6 bg-loft-900 border-loft-800">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-loft-50 flex items-center gap-2"><Target className="w-5 h-5 text-moss-500"/> Current Milestone</h3>
                <p className="text-loft-400 text-sm">Complete 10 rides to unlock <strong className="text-moss-400">₹500 Wallet Cash</strong></p>
              </div>
              <div className="w-10 h-10 bg-moss-500/10 rounded-full flex items-center justify-center border border-moss-500/30">
                <Star className="w-5 h-5 text-moss-500"/>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-loft-300">
                <span>{totalTrips} Rides</span>
                <span>10 Rides</span>
              </div>
              <div className="w-full bg-loft-950 rounded-full h-3 overflow-hidden border border-loft-800">
                <div 
                  className="bg-gradient-to-r from-moss-600 to-moss-400 h-3 rounded-full transition-all duration-1000 relative"
                  style={{ width: `${(totalTrips / 10) * 100}%` }}
                >
                  <div className="absolute top-0 right-0 bottom-0 left-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
                </div>
              </div>
              <p className="text-xs text-right text-moss-500 mt-1">{10 - totalTrips} rides remaining!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Modal (Mock) */}
      <AnimatePresence>
        {isAddAddressOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-loft-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card w-full max-w-md p-6"
            >
              <h3 className="text-xl font-bold text-loft-50 mb-6">Add New Address</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-loft-200 mb-1">Label (e.g. Home, Office)</label>
                  <input type="text" className="input-field" placeholder="Enter label" value={newAddress.label} onChange={(e) => setNewAddress({...newAddress, label: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-loft-200 mb-1">Street Address</label>
                  <textarea className="input-field resize-none h-24" placeholder="Enter full address" value={newAddress.street} onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-loft-200 mb-1">City</label>
                    <input type="text" className="input-field" placeholder="Pune" value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-loft-200 mb-1">Postal Code</label>
                    <input type="text" className="input-field" placeholder="411001" value={newAddress.postalCode} onChange={(e) => setNewAddress({...newAddress, postalCode: e.target.value})} />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 mt-8">
                <button 
                  onClick={() => setIsAddAddressOpen(false)}
                  className="btn-secondary w-full"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveAddress}
                  className="btn-primary w-full"
                  disabled={!newAddress.label || !newAddress.street}
                >
                  Save Address
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Trip Details Modal */}
      <AnimatePresence>
        {selectedTrip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-loft-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card w-full max-w-lg p-0 overflow-hidden"
            >
              {/* Mock Map Area */}
              <div className="h-48 bg-loft-800 relative w-full overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')]"></div>
                <div className="text-center z-10">
                  <MapPin className="w-8 h-8 text-copper-500 mx-auto mb-2 drop-shadow-lg" />
                  <span className="text-copper-400 font-bold bg-loft-950/80 px-3 py-1 rounded-full border border-copper-500/30">Route Map Unavailable</span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-loft-50">{selectedTrip.id}</h3>
                    <p className="text-sm text-loft-400">{selectedTrip.date}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    selectedTrip.status === 'Completed' ? 'bg-moss-500/20 text-moss-500' : 'bg-red-500/20 text-red-500'
                  }`}>
                    {selectedTrip.status}
                  </span>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-2 h-2 rounded-full bg-copper-500"></div>
                    <div>
                      <p className="text-xs text-loft-400 uppercase tracking-wider mb-1">Pickup</p>
                      <p className="text-sm font-medium text-loft-100">{selectedTrip.from}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-2 h-2 rounded-full bg-moss-500"></div>
                    <div>
                      <p className="text-xs text-loft-400 uppercase tracking-wider mb-1">Drop-off</p>
                      <p className="text-sm font-medium text-loft-100">{selectedTrip.to}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-loft-800 pt-4 mb-6">
                  <h4 className="text-sm font-bold text-loft-200 mb-3">Fare Breakdown</h4>
                  <div className="flex justify-between text-sm text-loft-300 mb-2">
                    <span>Base Fare</span>
                    <span>{selectedTrip.amount}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-loft-50 mt-4 pt-4 border-t border-loft-800/50">
                    <span>Total Paid</span>
                    <span className="text-copper-500">{selectedTrip.amount}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedTrip(null)}
                  className="btn-secondary w-full py-3"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      {reviewTrip && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setReviewedBookings((prev) => ({ ...prev, [reviewTrip.id]: 5 }));
            setReviewTrip(null);
          }}
          bookingId={reviewTrip.id}
          driverId={reviewTrip.driverId || 'd1234567-89ab-cdef-0123-456789abcdef'}
          driverName={reviewTrip.driverName || 'Ramesh Kumar'}
        />
      )}

    </div>
  );
};

export default CustomerDashboard;
