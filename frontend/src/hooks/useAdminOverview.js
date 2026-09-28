import { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';

export const useAdminOverview = () => {
  const [stats, setStats] = useState({
    revenue: '₹0',
    activeDrivers: '0',
    totalVehicles: '0',
    totalCustomers: '0',
    activities: []
  });
  const [revenueData, setRevenueData] = useState([]);
  const [routeData, setRouteData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      const statsRes = await adminApi.getOverviewStats();
      if (statsRes.data.success) {
        setStats(prev => ({
          ...prev,
          revenue: statsRes.data.stats.revenue,
          activeDrivers: statsRes.data.stats.activeDrivers,
          totalVehicles: statsRes.data.stats.totalVehicles,
          totalCustomers: statsRes.data.stats.totalCustomers,
          activities: [
            { time: '10:42 AM', event: 'New Booking Created', user: 'Rahul D.', status: 'Processing' },
            { time: '10:39 AM', event: 'Driver Offline (MH 12)', status: 'Completed', user: 'System' },
            { time: '10:30 AM', event: 'B2B Contract Signed', user: 'DMart', status: 'Success' },
            { time: '10:15 AM', event: 'Support Ticket Raised', user: 'Sneha K.', status: 'Pending' }
          ]
        }));
      }
      
      const revRes = await adminApi.getRevenueStats();
      if (revRes.data.success) {
        setRevenueData(revRes.data.revenueData);
      }

      const routeRes = await adminApi.getRouteStats();
      if (routeRes.data.success) {
        setRouteData(routeRes.data.routeData);
      }
    } catch (err) {
      console.error('Error fetching overview data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  return { stats, revenueData, routeData, loading, fetchOverviewData };
};
