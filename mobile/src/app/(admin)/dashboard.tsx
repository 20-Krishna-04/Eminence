import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOverviewStats = async () => {
    try {
      const res = await api.get('/api/admin/stats/overview');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.log('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverviewStats();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeLabel}>Admin Portal</Text>
          <Text style={styles.userName}>{user?.name || 'Operations Lead'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'admin@eminence.com'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchOverviewStats();
            }}
            tintColor="#6366f1"
          />
        }
      >
        {/* KPI Grid */}
        <Text style={styles.sectionTitle}>Fleet & Dispatch Overview</Text>

        {loading ? (
          <ActivityIndicator color="#6366f1" style={{ marginVertical: 30 }} />
        ) : (
          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiTitle}>Active Drivers</Text>
              <Text style={styles.kpiValue}>{stats?.activeDrivers ?? 12}</Text>
              <Text style={styles.kpiBadgeGreen}>🟢 8 En-route</Text>
            </View>

            <View style={styles.kpiCard}>
              <Text style={styles.kpiTitle}>Today's Bookings</Text>
              <Text style={styles.kpiValue}>{stats?.totalBookings ?? 47}</Text>
              <Text style={styles.kpiBadgeBlue}>+14% vs yesterday</Text>
            </View>

            <View style={styles.kpiCard}>
              <Text style={styles.kpiTitle}>Gross Revenue</Text>
              <Text style={styles.kpiValue}>₹{stats?.revenue ?? '34,250'}</Text>
              <Text style={styles.kpiBadgeGreen}>98.2% Collected</Text>
            </View>

            <View style={styles.kpiCard}>
              <Text style={styles.kpiTitle}>Pending Dispatch</Text>
              <Text style={styles.kpiValue}>{stats?.pendingDispatches ?? 3}</Text>
              <Text style={styles.kpiBadgeAmber}>Needs Allocation</Text>
            </View>
          </View>
        )}

        {/* Quick Operations Menu */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Fleet Control Actions</Text>
        
        <TouchableOpacity style={styles.actionRow}>
          <View style={styles.actionInfo}>
            <Text style={styles.actionIcon}>🗺️</Text>
            <View>
              <Text style={styles.actionHeading}>Live Map Telemetry</Text>
              <Text style={styles.actionSub}>Track 12 active vehicles across Pune</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionRow}>
          <View style={styles.actionInfo}>
            <Text style={styles.actionIcon}>⚡</Text>
            <View>
              <Text style={styles.actionHeading}>Surge & Dynamic Pricing</Text>
              <Text style={styles.actionSub}>Adjust peak multipliers & zone tariffs</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionRow}>
          <View style={styles.actionInfo}>
            <Text style={styles.actionIcon}>🏢</Text>
            <View>
              <Text style={styles.actionHeading}>Corporate B2B Invoices</Text>
              <Text style={styles.actionSub}>Manage enterprise contracts & credits</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 20,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  welcomeLabel: {
    color: '#818cf8',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  userName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
  },
  userEmail: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  logoutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  logoutBtnText: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  kpiTitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  kpiValue: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '800',
    marginVertical: 6,
  },
  kpiBadgeGreen: {
    color: '#4ade80',
    fontSize: 11,
    fontWeight: '600',
  },
  kpiBadgeBlue: {
    color: '#60a5fa',
    fontSize: 11,
    fontWeight: '600',
  },
  kpiBadgeAmber: {
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionHeading: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  actionSub: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  chevron: {
    color: '#64748b',
    fontSize: 20,
    fontWeight: '600',
  },
});
