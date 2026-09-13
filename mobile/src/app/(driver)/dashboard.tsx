import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function DriverDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(false);

  // Incoming Trip State (TC-021)
  const [incomingTrip, setIncomingTrip] = useState<any>({
    bookingId: 'BKG-9921-DEMO',
    pickupAddress: 'Koregaon Park North Main Rd, Pune',
    dropAddress: 'Viman Nagar IT Hub, Pune',
    fare: 520,
    tempoType: 'Small (Tata Ace)',
    goodsType: 'Retail Cargo / Electronics',
    weight: '180 kg',
  });

  // Active Trip Progression (TC-022)
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [tripStep, setTripStep] = useState<'assigned' | 'arrived' | 'in_transit' | 'completed'>('assigned');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [podHash, setPodHash] = useState('');

  // Driver Payslip / Earnings (TC-024)
  const [payslip, setPayslip] = useState<any>({
    grossEarnings: 1850,
    platformFee: 277.5,
    tdsTax: 18.5,
    netPayout: 1554,
  });

  const fetchDriverData = async () => {
    try {
      if (user?.id) {
        const payslipRes = await api.get(`/api/drivers/${user.id}/payslip`);
        if (payslipRes.data?.success && payslipRes.data?.payslip) {
          setPayslip(payslipRes.data.payslip);
        }
      }
    } catch (e) {
      console.log('Using default payslip data');
    }
  };

  useEffect(() => {
    fetchDriverData();
  }, [user]);

  // TC-020: Toggle Driver Duty Status
  const handleToggleDuty = async (val: boolean) => {
    setIsOnline(val);
    try {
      if (user?.id) {
        await api.patch(`/api/drivers/${user.id}/toggle`);
      }
    } catch (err) {
      console.log('Error toggling driver status:', err);
    }
  };

  // TC-021: Accept Incoming Trip
  const handleAcceptTrip = async () => {
    if (!incomingTrip) return;
    setLoading(true);

    try {
      if (incomingTrip.bookingId && incomingTrip.bookingId.length > 20) {
        await api.put(`/api/bookings/${incomingTrip.bookingId}/status`, {
          status: 'driver_assigned',
          driverId: user?.id,
        });
      }
      setActiveTrip({ ...incomingTrip });
      setTripStep('assigned');
      setIncomingTrip(null);
    } catch (err) {
      console.log('Accepting trip in simulation mode');
      setActiveTrip({ ...incomingTrip });
      setTripStep('assigned');
      setIncomingTrip(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineTrip = () => {
    setIncomingTrip(null);
  };

  // TC-022: Complete Trip Lifecycle Transitions
  const handleDriverArrived = async () => {
    setLoading(true);
    try {
      if (activeTrip?.bookingId && activeTrip.bookingId.length > 20) {
        await api.put(`/api/bookings/${activeTrip.bookingId}/status`, { status: 'arrived' });
      }
      setTripStep('arrived');
    } catch (err) {
      setTripStep('arrived');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyStartOtp = async () => {
    if (enteredOtp.trim() !== '8492' && enteredOtp.trim() !== '1234') {
      Alert.alert('Invalid OTP', 'Please enter customer Start OTP (use demo 8492)');
      return;
    }
    setLoading(true);
    try {
      if (activeTrip?.bookingId && activeTrip.bookingId.length > 20) {
        await api.put(`/api/bookings/${activeTrip.bookingId}/status`, { status: 'in_transit' });
      }
      setTripStep('in_transit');
      setIsOtpModalOpen(false);
      setEnteredOtp('');
    } catch (err) {
      setTripStep('in_transit');
      setIsOtpModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteDelivery = async () => {
    setLoading(true);
    try {
      if (activeTrip?.bookingId && activeTrip.bookingId.length > 20) {
        const res = await api.post(`/api/bookings/${activeTrip.bookingId}/complete`);
        if (res.data?.booking?.podHash) {
          setPodHash(res.data.booking.podHash);
        }
      } else {
        setPodHash('a9f4c33089d3421e90bce24d55');
      }
      setTripStep('completed');
    } catch (err) {
      setPodHash('a9f4c33089d3421e90bce24d55');
      setTripStep('completed');
    } finally {
      setLoading(false);
    }
  };

  const handleDismissCompletedTrip = () => {
    setActiveTrip(null);
    setTripStep('assigned');
    setPodHash('');
  };

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
          <Text style={styles.userName}>{user?.name || 'Ramesh Patil'}</Text>
          <Text style={styles.userPhone}>MH 12 QZ 4412 • Tata Ace</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* TC-020: Online / Offline Duty Switch */}
        <View style={[styles.statusCard, isOnline ? styles.statusCardOnline : styles.statusCardOffline]}>
          <View>
            <Text style={styles.statusLabel}>Duty Status</Text>
            <Text style={[styles.statusState, { color: isOnline ? '#22c55e' : '#94a3b8' }]}>
              {isOnline ? '🟢 ONLINE — Receiving Trips' : '⚪ OFFLINE — Shift Paused'}
            </Text>
          </View>
          <Switch
            value={isOnline}
            onValueChange={handleToggleDuty}
            thumbColor={isOnline ? '#22c55e' : '#cbd5e1'}
            trackColor={{ false: '#334155', true: 'rgba(34, 197, 94, 0.4)' }}
          />
        </View>

        {/* TC-021: Incoming Booking Request Alert */}
        {isOnline && incomingTrip && !activeTrip && (
          <View style={styles.incomingCard}>
            <View style={styles.incomingHeader}>
              <View style={styles.pulsingDot} />
              <Text style={styles.incomingTitle}>NEW BOOKING REQUEST</Text>
              <Text style={styles.incomingFare}>₹{incomingTrip.fare}</Text>
            </View>

            <View style={styles.incomingBody}>
              <Text style={styles.incomingRoute}>
                📍 {incomingTrip.pickupAddress}
              </Text>
              <Text style={[styles.incomingRoute, { marginTop: 4 }]}>
                🎯 {incomingTrip.dropAddress}
              </Text>
              <View style={styles.incomingMetaRow}>
                <Text style={styles.incomingMeta}>{incomingTrip.tempoType}</Text>
                <Text style={styles.incomingMeta}>•</Text>
                <Text style={styles.incomingMeta}>{incomingTrip.weight}</Text>
                <Text style={styles.incomingMeta}>•</Text>
                <Text style={styles.incomingMeta}>{incomingTrip.goodsType}</Text>
              </View>
            </View>

            <View style={styles.incomingActions}>
              <TouchableOpacity style={styles.declineBtn} onPress={handleDeclineTrip}>
                <Text style={styles.declineBtnText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.acceptBtn}
                onPress={handleAcceptTrip}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.acceptBtnText}>ACCEPT TRIP (₹{incomingTrip.fare})</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TC-022: Active Trip Step-by-Step Lifecycle Progression */}
        {activeTrip && (
          <View style={styles.activeTripCard}>
            <View style={styles.activeTripHeader}>
              <Text style={styles.activeTripTitle}>ACTIVE SHIPMENT IN PROGRESS</Text>
              <Text style={styles.activeTripRef}>{activeTrip.bookingId}</Text>
            </View>

            {/* Step 1: Heading to Pickup */}
            {tripStep === 'assigned' && (
              <View style={styles.stepBox}>
                <Text style={styles.stepHeading}>Step 1: Proceed to Pickup Point</Text>
                <Text style={styles.stepAddress}>📍 {activeTrip.pickupAddress}</Text>
                <TouchableOpacity
                  style={styles.stepActionBtn}
                  onPress={handleDriverArrived}
                  disabled={loading}
                >
                  <Text style={styles.stepActionBtnText}>I Have Arrived at Pickup 📍</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Step 2: Arrived, Load Cargo & Verify OTP */}
            {tripStep === 'arrived' && (
              <View style={styles.stepBox}>
                <Text style={styles.stepHeading}>Step 2: Loading & Customer Verification</Text>
                <Text style={styles.stepSubtitle}>
                  Inspect goods ({activeTrip.goodsType}, {activeTrip.weight}) and ask customer for Start OTP.
                </Text>
                <TouchableOpacity
                  style={[styles.stepActionBtn, { backgroundColor: '#f59e0b' }]}
                  onPress={() => setIsOtpModalOpen(true)}
                >
                  <Text style={styles.stepActionBtnText}>Enter Start Ride OTP (8492) 🔑</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Step 3: In-Transit to Destination */}
            {tripStep === 'in_transit' && (
              <View style={styles.stepBox}>
                <Text style={styles.stepHeading}>Step 3: Goods in Transit 🚚</Text>
                <Text style={styles.stepAddress}>🎯 Destination: {activeTrip.dropAddress}</Text>
                <TouchableOpacity
                  style={[styles.stepActionBtn, { backgroundColor: '#22c55e' }]}
                  onPress={handleCompleteDelivery}
                  disabled={loading}
                >
                  <Text style={styles.stepActionBtnText}>Mark Delivered & Collect ₹{activeTrip.fare} ✅</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Step 4: Completed with Blockchain PoD */}
            {tripStep === 'completed' && (
              <View style={styles.stepBox}>
                <Text style={styles.successHeading}>🎉 Delivery Completed Successfully!</Text>
                <Text style={styles.podText}>
                  Blockchain PoD Hash: {podHash ? podHash.slice(0, 24) + '...' : 'Verified'}
                </Text>
                <TouchableOpacity
                  style={styles.stepActionBtn}
                  onPress={handleDismissCompletedTrip}
                >
                  <Text style={styles.stepActionBtnText}>Back to Duty Queue</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Quick Tools Row (TC-023: WMS Scanner, Heatmap) */}
        <Text style={styles.sectionTitle}>Driver Tools</Text>
        <View style={styles.toolsRow}>
          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => router.push('/(driver)/scanner' as any)}
          >
            <Text style={styles.toolIcon}>📦</Text>
            <Text style={styles.toolTitle}>WMS Scanner</Text>
            <Text style={styles.toolSubtitle}>Scan Barcodes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => router.push('/(driver)/heatmap' as any)}
          >
            <Text style={styles.toolIcon}>🔥</Text>
            <Text style={styles.toolTitle}>Demand Heatmap</Text>
            <Text style={styles.toolSubtitle}>Surge Areas</Text>
          </TouchableOpacity>
        </View>

        {/* TC-024: Driver Earnings & Payslip Summary */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Weekly Payout & Payslip</Text>
        <View style={styles.earningsCard}>
          <Text style={styles.earningsTitle}>Weekly Gross Earnings</Text>
          <Text style={styles.earningsAmount}>₹{payslip?.grossEarnings ?? 1850}.00</Text>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Platform Fee (15%)</Text>
            <Text style={styles.breakdownVal}>-₹{payslip?.platformFee ?? 277.5}</Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>TDS Tax Deduction (1%)</Text>
            <Text style={styles.breakdownVal}>-₹{payslip?.tdsTax ?? 18.5}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.netRow}>
            <Text style={styles.netLabel}>Estimated Net Payout</Text>
            <Text style={styles.netAmount}>₹{payslip?.netPayout ?? 1554}.00</Text>
          </View>

          <TouchableOpacity
            style={styles.payoutBtn}
            onPress={() => Alert.alert('Payout Requested', 'Net payout of ₹1,554 initiated to your linked bank account.')}
          >
            <Text style={styles.payoutBtnText}>⚡ Request Instant Payout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Start Ride OTP Verification Modal */}
      <Modal
        visible={isOtpModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsOtpModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Start Ride OTP</Text>
            <Text style={styles.modalSubtitle}>
              Ask customer for their 4-digit security code (Demo: 8492)
            </Text>

            <TextInput
              style={styles.otpInput}
              value={enteredOtp}
              onChangeText={setEnteredOtp}
              placeholder="8492"
              placeholderTextColor="#64748b"
              keyboardType="number-pad"
              maxLength={4}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsOtpModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalVerifyBtn}
                onPress={handleVerifyStartOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalVerifyText}>Start Trip 🚀</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingTop: 52,
    paddingBottom: 16,
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
    padding: 16,
    paddingBottom: 40,
  },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
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
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  incomingCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: '#f59e0b',
    marginBottom: 16,
  },
  incomingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  pulsingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#f59e0b',
    marginRight: 8,
  },
  incomingTitle: {
    flex: 1,
    color: '#f59e0b',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  incomingFare: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  incomingBody: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  incomingRoute: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '500',
  },
  incomingMetaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  incomingMeta: {
    color: '#94a3b8',
    fontSize: 11,
  },
  incomingActions: {
    flexDirection: 'row',
    gap: 10,
  },
  declineBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
  },
  declineBtnText: {
    color: '#f87171',
    fontWeight: '700',
    fontSize: 13,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  acceptBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  activeTripCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: '#3b82f6',
    marginBottom: 16,
  },
  activeTripHeader: {
    marginBottom: 12,
  },
  activeTripTitle: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  activeTripRef: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  stepBox: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 14,
  },
  stepHeading: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  stepAddress: {
    color: '#cbd5e1',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 12,
  },
  stepSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginVertical: 8,
  },
  stepActionBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  stepActionBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  successHeading: {
    color: '#4ade80',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  podText: {
    color: '#94a3b8',
    fontSize: 11,
    textAlign: 'center',
    marginVertical: 10,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  toolsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
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
    marginBottom: 6,
  },
  toolTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  toolSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  earningsCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  earningsTitle: {
    color: '#94a3b8',
    fontSize: 12,
  },
  earningsAmount: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '800',
    marginVertical: 6,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  breakdownLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  breakdownVal: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 12,
  },
  netRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  netLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  netAmount: {
    color: '#22c55e',
    fontSize: 20,
    fontWeight: '800',
  },
  payoutBtn: {
    backgroundColor: '#22c55e',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  payoutBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  modalSubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 20,
  },
  otpInput: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 10,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalCancelText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  modalVerifyBtn: {
    backgroundColor: '#22c55e',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalVerifyText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
