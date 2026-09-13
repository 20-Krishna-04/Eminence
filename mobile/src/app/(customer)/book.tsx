import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function BookScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [pickup, setPickup] = useState('Koregaon Park, Pune');
  const [drops, setDrops] = useState<string[]>(['Viman Nagar, Pune']);
  const [tempoType, setTempoType] = useState<'small' | 'medium' | 'large'>('small');
  const [weight, setWeight] = useState('150');
  const [goodsType, setGoodsType] = useState('Electronics');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fare Estimation
  const calculateEstimatedFare = () => {
    const baseRates = { small: 350, medium: 550, large: 1100 };
    let total = baseRates[tempoType] || 350;

    // Surcharge for extra multi-stops (+₹150 each)
    if (drops.length > 1) {
      total += (drops.length - 1) * 150;
    }

    // Small weight adjustment
    const w = parseFloat(weight) || 0;
    if (w > 200) {
      total += Math.round((w - 200) * 0.5);
    }

    return total;
  };

  const addStop = () => {
    if (drops.length >= 4) {
      Alert.alert('Limit Reached', 'Maximum 4 stops allowed per booking');
      return;
    }
    setDrops([...drops, '']);
  };

  const removeStop = (index: number) => {
    if (drops.length <= 1) return;
    const next = [...drops];
    next.splice(index, 1);
    setDrops(next);
  };

  const handleDropChange = (index: number, val: string) => {
    const next = [...drops];
    next[index] = val;
    setDrops(next);
  };

  const handleConfirmBooking = async () => {
    if (!pickup.trim()) {
      setErrorMessage('Please enter a pickup address');
      return;
    }
    if (drops.some((d) => !d.trim())) {
      setErrorMessage('Please fill in all destination drop stops');
      return;
    }
    if (!weight || parseInt(weight, 10) <= 0) {
      setErrorMessage('Please specify cargo weight in kg');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const estimatedFare = calculateEstimatedFare();
      const payload = {
        pickupAddress: pickup.trim(),
        dropAddress: drops[0].trim(),
        drops: drops.map((d) => d.trim()),
        tempoType,
        weight: parseInt(weight, 10),
        goodsType: goodsType.trim(),
        date,
        time,
        estimatedFare,
        paymentMethod: 'online',
        customerId: user?.id,
      };

      const res = await api.post('/api/bookings', payload);

      if (res.data?.success && res.data?.booking) {
        const bookingId = res.data.booking.id;
        router.replace(`/(customer)/track?bookingId=${bookingId}` as any);
      } else {
        setErrorMessage(res.data?.message || 'Failed to create booking');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Error creating booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const estimatedFare = calculateEstimatedFare();

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book a Tempo</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* SECTION 1: PICKUP & MULTI-STOP DROPS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Route & Stops</Text>

          <Text style={styles.inputLabel}>Pickup Address</Text>
          <TextInput
            style={styles.input}
            value={pickup}
            onChangeText={setPickup}
            placeholder="e.g. Koregaon Park, Pune"
            placeholderTextColor="#64748b"
          />

          {drops.map((dropVal, idx) => (
            <View key={idx} style={{ marginTop: 12 }}>
              <View style={styles.dropHeaderRow}>
                <Text style={styles.inputLabel}>
                  {idx === 0 ? 'Destination Drop Address' : `Additional Stop #${idx + 1}`}
                </Text>
                {idx > 0 && (
                  <TouchableOpacity onPress={() => removeStop(idx)}>
                    <Text style={styles.removeStopText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                style={styles.input}
                value={dropVal}
                onChangeText={(val) => handleDropChange(idx, val)}
                placeholder={idx === 0 ? 'e.g. Viman Nagar, Pune' : `Stop #${idx + 1} Address`}
                placeholderTextColor="#64748b"
              />
            </View>
          ))}

          {/* Add Stop Button (TC-012) */}
          <TouchableOpacity style={styles.addStopBtn} onPress={addStop}>
            <Text style={styles.addStopBtnText}>+ Add Another Stop (+₹150)</Text>
          </TouchableOpacity>
        </View>

        {/* SECTION 2: VEHICLE SELECTION */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚚 Select Vehicle Size</Text>

          <View style={styles.tempoGrid}>
            <TouchableOpacity
              style={[styles.tempoOption, tempoType === 'small' && styles.tempoOptionActive]}
              onPress={() => setTempoType('small')}
            >
              <Text style={styles.tempoIcon}>🛺</Text>
              <Text style={styles.tempoName}>Small</Text>
              <Text style={styles.tempoModel}>Tata Ace</Text>
              <Text style={styles.tempoWeight}>Max 500kg</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tempoOption, tempoType === 'medium' && styles.tempoOptionActive]}
              onPress={() => setTempoType('medium')}
            >
              <Text style={styles.tempoIcon}>🚐</Text>
              <Text style={styles.tempoName}>Medium</Text>
              <Text style={styles.tempoModel}>Bolero Pickup</Text>
              <Text style={styles.tempoWeight}>Max 1,200kg</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tempoOption, tempoType === 'large' && styles.tempoOptionActive]}
              onPress={() => setTempoType('large')}
            >
              <Text style={styles.tempoIcon}>🚛</Text>
              <Text style={styles.tempoName}>Large</Text>
              <Text style={styles.tempoModel}>14ft Truck</Text>
              <Text style={styles.tempoWeight}>Max 2,500kg</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SECTION 3: CARGO DETAILS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📦 Cargo Specifications</Text>

          <View style={styles.rowInputs}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                placeholder="150"
                placeholderTextColor="#64748b"
              />
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.inputLabel}>Goods Category</Text>
              <TextInput
                style={styles.input}
                value={goodsType}
                onChangeText={setGoodsType}
                placeholder="Electronics"
                placeholderTextColor="#64748b"
              />
            </View>
          </View>

          <View style={[styles.rowInputs, { marginTop: 12 }]}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.inputLabel}>Pickup Date</Text>
              <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#64748b"
              />
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.inputLabel}>Pickup Time</Text>
              <TextInput
                style={styles.input}
                value={time}
                onChangeText={setTime}
                placeholder="14:00"
                placeholderTextColor="#64748b"
              />
            </View>
          </View>
        </View>

        {/* SECTION 4: FARE BREAKDOWN & CONFIRM */}
        <View style={styles.fareCard}>
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Base Fare ({tempoType.toUpperCase()})</Text>
            <Text style={styles.fareVal}>
              ₹{tempoType === 'small' ? 350 : tempoType === 'medium' ? 550 : 1100}
            </Text>
          </View>

          {drops.length > 1 && (
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Multi-Stop Surcharge ({drops.length - 1} stops)</Text>
              <Text style={styles.fareVal}>₹{(drops.length - 1) * 150}</Text>
            </View>
          )}

          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Estimated CO2 Offset</Text>
            <Text style={styles.esgVal}>🌿 ~3.2 kg</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Estimated Cost</Text>
            <Text style={styles.totalVal}>₹{estimatedFare}</Text>
          </View>

          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={handleConfirmBooking}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.confirmBtnText}>Confirm Booking (₹{estimatedFare})</Text>
            )}
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
    paddingTop: 52,
    paddingBottom: 16,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#334155',
  },
  backBtnText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#ef4444',
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 13,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  inputLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  dropHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  removeStopText: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: '#ffffff',
    fontSize: 14,
  },
  addStopBtn: {
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderStyle: 'dashed',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  addStopBtnText: {
    color: '#60a5fa',
    fontSize: 13,
    fontWeight: '600',
  },
  tempoGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  tempoOption: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
  },
  tempoOptionActive: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  tempoIcon: {
    fontSize: 26,
    marginBottom: 4,
  },
  tempoName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  tempoModel: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  tempoWeight: {
    color: '#60a5fa',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  fareCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fareLabel: {
    color: '#94a3b8',
    fontSize: 13,
  },
  fareVal: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  esgVal: {
    color: '#4ade80',
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  totalVal: {
    color: '#3b82f6',
    fontSize: 24,
    fontWeight: '800',
  },
  confirmBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
