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
          activities: statsRes.data.stats.activities || []
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
