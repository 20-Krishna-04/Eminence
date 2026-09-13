import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function DriverDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isOnline, setIsOnline] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pilotBadge}>DRIVER PARTNER</Text>
          <Text style={styles.userName}>{user?.name || 'Driver Pilot'}</Text>
          <Text style={styles.userPhone}>+91 {user?.phone || '9999999999'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Online / Offline Toggle (TC-020) */}
        <View style={[styles.statusCard, isOnline ? styles.statusCardOnline : styles.statusCardOffline]}>
          <View>
            <Text style={styles.statusLabel}>Duty Status</Text>
            <Text style={[styles.statusState, { color: isOnline ? '#22c55e' : '#94a3b8' }]}>
              {isOnline ? '🟢 ONLINE — Receiving Trips' : '⚪ OFFLINE — Paused'}
            </Text>
          </View>
          <Switch
            value={isOnline}
            onValueChange={setIsOnline}
            thumbColor={isOnline ? '#22c55e' : '#cbd5e1'}
            trackColor={{ false: '#334155', true: 'rgba(34, 197, 94, 0.4)' }}
          />
        </View>

        {/* Today's Earnings (TC-024) */}
        <View style={styles.earningsCard}>
          <Text style={styles.earningsTitle}>Today's Earnings</Text>
          <Text style={styles.earningsAmount}>₹1,850.00</Text>
          <View style={styles.earningsBreakdown}>
            <Text style={styles.subEarning}>Trips: 4</Text>
            <Text style={styles.subEarning}>Online: 5h 20m</Text>
            <Text style={styles.subEarning}>Incentive: ₹200</Text>
          </View>
        </View>

        {/* Quick Driver Action Tiles */}
        <Text style={styles.sectionTitle}>Quick Tools</Text>
        <View style={styles.toolsRow}>
          <TouchableOpacity style={styles.toolCard}>
            <Text style={styles.toolIcon}>📦</Text>
            <Text style={styles.toolText}>WMS Scanner</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolCard}>
            <Text style={styles.toolIcon}>🔥</Text>
            <Text style={styles.toolText}>Demand Heatmap</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolCard}>
            <Text style={styles.toolIcon}>💳</Text>
            <Text style={styles.toolText}>Instant Payout</Text>
          </TouchableOpacity>
        </View>
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
  pilotBadge: {
    color: '#3b82f6',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  userName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
  },
  userPhone: {
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
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  statusCardOnline: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: '#22c55e',
  },
  statusCardOffline: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  statusLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  statusState: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  earningsCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 24,
  },
  earningsTitle: {
    color: '#94a3b8',
    fontSize: 13,
  },
  earningsAmount: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
    marginVertical: 8,
  },
  earningsBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 12,
  },
  subEarning: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '500',
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  toolsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  toolCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  toolIcon: {
    fontSize: 26,
    marginBottom: 8,
  },
  toolText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
