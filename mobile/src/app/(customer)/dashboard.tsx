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

export default function CustomerDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRides = async () => {
    try {
      const res = await api.get('/api/bookings/my-rides');
      if (res.data.success) {
        setRides(res.data.rides || []);
      }
    } catch (err) {
      console.log('Error fetching customer rides:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRides();
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
          <Text style={styles.welcomeLabel}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || 'Demo User'}</Text>
          <Text style={styles.userPhone}>+91 {user?.phone || '1234567890'}</Text>
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
              fetchRides();
            }}
            tintColor="#3b82f6"
          />
        }
      >
        {/* Quick Booking Call to Action */}
        <View style={styles.actionCard}>
          <Text style={styles.actionTitle}>Need to move goods today?</Text>
          <Text style={styles.actionSubtitle}>
            Instant mini-truck dispatch with real-time GPS tracking & verified drivers.
          </Text>
          <TouchableOpacity
            style={styles.bookBtn}
            onPress={() => router.push('/(customer)/book' as any)}
          >
            <Text style={styles.bookBtnText}>🚚 Book a Tempo Now</Text>
          </TouchableOpacity>
        </View>

        {/* Gamification & ESG Sustainability Badge */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>🌿</Text>
            <Text style={styles.statValue}>18.4 kg</Text>
            <Text style={styles.statLabel}>CO2 Saved</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>Gold Tier</Text>
            <Text style={styles.statLabel}>Eminence Club</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>🎁</Text>
            <Text style={styles.statValue}>₹250</Text>
            <Text style={styles.statLabel}>Wallet Cash</Text>
          </View>
        </View>

        {/* Ride History Section (TC-010, TC-013) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Bookings & Activity</Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#3b82f6" style={{ marginTop: 24 }} />
        ) : rides.length > 0 ? (
          rides.map((ride: any, index: number) => (
            <View key={ride.id || index} style={styles.rideCard}>
              <View style={styles.rideHeader}>
                <Text style={styles.rideType}>{ride.vehicleType || 'Small Tempo'}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{ride.status || 'COMPLETED'}</Text>
                </View>
              </View>

              <View style={styles.routeContainer}>
                <View style={styles.routeItem}>
                  <Text style={styles.routeDotGreen}>●</Text>
                  <Text style={styles.routeText}>{ride.pickupAddress || 'Swargate, Pune'}</Text>
                </View>
                <View style={styles.routeDivider} />
                <View style={styles.routeItem}>
                  <Text style={styles.routeDotRed}>●</Text>
                  <Text style={styles.routeText}>{ride.dropAddress || 'Hinjewadi Phase 1, Pune'}</Text>
                </View>
              </View>

              <View style={styles.rideFooter}>
                <Text style={styles.esgTag}>🌿 4.2 kg CO2 Offset</Text>
                <Text style={styles.rideFare}>₹{ride.fare || '650'}</Text>
              </View>
            </View>
          ))
        ) : (
          /* Seeded preview if no API rides yet */
          <View style={styles.rideCard}>
            <View style={styles.rideHeader}>
              <Text style={styles.rideType}>Tata Ace (Small)</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>COMPLETED</Text>
              </View>
            </View>
            <View style={styles.routeContainer}>
              <View style={styles.routeItem}>
                <Text style={styles.routeDotGreen}>●</Text>
                <Text style={styles.routeText}>Swargate Market, Pune</Text>
              </View>
              <View style={styles.routeDivider} />
              <View style={styles.routeItem}>
                <Text style={styles.routeDotRed}>●</Text>
                <Text style={styles.routeText}>Hinjewadi Tech Park Phase 2, Pune</Text>
              </View>
            </View>
            <View style={styles.rideFooter}>
              <Text style={styles.esgTag}>🌿 3.8 kg CO2 Saved</Text>
              <Text style={styles.rideFare}>₹550</Text>
            </View>
          </View>
        )}
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
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  userName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
  },
  userPhone: {
    color: '#60a5fa',
    fontSize: 12,
    fontWeight: '600',
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
  actionCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#3b82f6',
    marginBottom: 20,
  },
  actionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  actionSubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  bookBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  bookBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statValue: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  rideCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rideType: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '600',
  },
  statusBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  statusText: {
    color: '#4ade80',
    fontSize: 11,
    fontWeight: '700',
  },
  routeContainer: {
    paddingLeft: 4,
    marginBottom: 14,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeDotGreen: {
    color: '#22c55e',
    marginRight: 8,
    fontSize: 14,
  },
  routeDotRed: {
    color: '#ef4444',
    marginRight: 8,
    fontSize: 14,
  },
  routeDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#475569',
    marginLeft: 4,
    marginVertical: 2,
  },
  routeText: {
    color: '#cbd5e1',
    fontSize: 13,
  },
  rideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 10,
  },
  esgTag: {
    color: '#4ade80',
    fontSize: 12,
    fontWeight: '600',
  },
  rideFare: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
