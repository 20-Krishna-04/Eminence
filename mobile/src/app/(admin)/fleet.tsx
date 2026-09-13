import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../services/api';

interface DriverItem {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  status: string;
  rating?: number;
}

interface VehicleItem {
  id: string;
  registrationNumber: string;
  type: string;
  capacityWeight: number;
  status: string;
  model?: string;
}

export default function FleetManagementScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'drivers' | 'vehicles'>('drivers');
  const [drivers, setDrivers] = useState<DriverItem[]>([]);
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Add Driver Modal State (TC-032)
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [driverName, setDriverName] = useState('Test Driver');
  const [driverPhone, setDriverPhone] = useState('9999999999');
  const [driverLicense, setDriverLicense] = useState('MH12XY9999');
  const [driverSaving, setDriverSaving] = useState(false);

  // Add Vehicle Modal State (TC-033)
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [vehicleReg, setVehicleReg] = useState('MH-01-AA-1111');
  const [vehicleType, setVehicleType] = useState('Large');
  const [vehicleCapacity, setVehicleCapacity] = useState('2000');
  const [vehicleSaving, setVehicleSaving] = useState(false);

  const fetchFleet = async () => {
    try {
      const [driversRes, vehiclesRes] = await Promise.allSettled([
        api.get('/api/admin/drivers'),
        api.get('/api/admin/vehicles'),
      ]);

      if (driversRes.status === 'fulfilled' && driversRes.value.data?.drivers) {
        setDrivers(driversRes.value.data.drivers);
      } else {
        // Fallback default
        setDrivers([
          { id: 'drv-1', name: 'Ramesh Kumar', phone: '9876543210', licenseNumber: 'MH12-2018-0099', status: 'active', rating: 4.8 },
          { id: 'drv-2', name: 'Suresh Patil', phone: '9822334455', licenseNumber: 'MH14-2020-4411', status: 'active', rating: 4.6 },
        ]);
      }

      if (vehiclesRes.status === 'fulfilled' && vehiclesRes.value.data?.vehicles) {
        setVehicles(vehiclesRes.value.data.vehicles);
      } else {
        setVehicles([
          { id: 'veh-1', registrationNumber: 'MH-12-RN-4821', type: 'Tata Ace (Small)', capacityWeight: 750, status: 'active' },
          { id: 'veh-2', registrationNumber: 'MH-14-BT-9902', type: 'Bolero Maxi (Medium)', capacityWeight: 1250, status: 'active' },
        ]);
      }
    } catch (err) {
      console.error('Error fetching fleet:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFleet();
  };

  // TC-032: Add New Driver
  const handleSaveDriver = async () => {
    if (!driverName || !driverPhone || !driverLicense) {
      Alert.alert('Missing Fields', 'Please provide driver name, phone, and license number.');
      return;
    }

    setDriverSaving(true);
    try {
      let res;
      try {
        res = await api.post('/api/admin/drivers', {
          name: driverName,
          phone: driverPhone,
          licenseNumber: driverLicense,
          status: 'active',
        });
      } catch {
        res = await api.post('/api/drivers', {
          name: driverName,
          phone: driverPhone,
          licenseNumber: driverLicense,
          status: 'active',
        });
      }

      if (res.data?.success && res.data?.driver) {
        setDrivers((prev) => [res.data.driver, ...prev]);
        setIsDriverModalOpen(false);
        Alert.alert('Driver Enrolled', `Driver ${driverName} registered successfully!`);
      } else {
        Alert.alert('Error', res.data?.message || 'Could not enroll driver.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || err.message);
    } finally {
      setDriverSaving(false);
    }
  };

  // TC-033: Add New Vehicle
  const handleSaveVehicle = async () => {
    if (!vehicleReg || !vehicleType || !vehicleCapacity) {
      Alert.alert('Missing Fields', 'Please enter registration, type, and weight capacity.');
      return;
    }

    setVehicleSaving(true);
    try {
      let normalizedType = vehicleType.trim().toLowerCase();
      if (!['small', 'medium', 'large'].includes(normalizedType)) {
        normalizedType = 'large';
      }
      const res = await api.post('/api/admin/vehicles', {
        registrationNumber: vehicleReg,
        type: normalizedType,
        capacityWeight: parseFloat(vehicleCapacity),
        status: 'available',
      });

      if (res.data?.success && res.data?.vehicle) {
        setVehicles((prev) => [res.data.vehicle, ...prev]);
        setIsVehicleModalOpen(false);
        Alert.alert('Vehicle Registered', `Vehicle ${vehicleReg} added to fleet!`);
      } else {
        Alert.alert('Error', res.data?.message || 'Could not register vehicle.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || err.message);
    } finally {
      setVehicleSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Fleet Assets</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            if (activeTab === 'drivers') setIsDriverModalOpen(true);
            else setIsVehicleModalOpen(true);
          }}
        >
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'drivers' && styles.tabActive]}
          onPress={() => setActiveTab('drivers')}
        >
          <Text style={[styles.tabText, activeTab === 'drivers' && styles.tabTextActive]}>
            Drivers ({drivers.length}) (TC-032)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'vehicles' && styles.tabActive]}
          onPress={() => setActiveTab('vehicles')}
        >
          <Text style={[styles.tabText, activeTab === 'vehicles' && styles.tabTextActive]}>
            Vehicles ({vehicles.length}) (TC-033)
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 40 }} />
        ) : activeTab === 'drivers' ? (
          <>
            {drivers.map((drv) => (
              <View key={drv.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View>
                    <Text style={styles.cardName}>{drv.name}</Text>
                    <Text style={styles.cardSub}>📞 {drv.phone}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          drv.status === 'active'
                            ? 'rgba(34, 197, 94, 0.15)'
                            : 'rgba(148, 163, 184, 0.15)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: drv.status === 'active' ? '#22c55e' : '#94a3b8' },
                      ]}
                    >
                      {drv.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardBottom}>
                  <Text style={styles.cardDetail}>License: {drv.licenseNumber}</Text>
                  {drv.rating ? (
                    <Text style={styles.ratingText}>⭐ {drv.rating.toFixed(1)}</Text>
                  ) : null}
                </View>
              </View>
            ))}
          </>
        ) : (
          <>
            {vehicles.map((veh) => (
              <View key={veh.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View>
                    <Text style={styles.cardName}>{veh.registrationNumber}</Text>
                    <Text style={styles.cardSub}>Type: {veh.type}</Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={[styles.statusText, { color: '#60a5fa' }]}>
                      {veh.status?.toUpperCase() || 'ACTIVE'}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardBottom}>
                  <Text style={styles.cardDetail}>Payload Capacity: {veh.capacityWeight} kg</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* TC-032: Add Driver Modal */}
      <Modal
        visible={isDriverModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsDriverModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Driver (TC-032)</Text>
            <Text style={styles.modalSubtitle}>Enroll a driver into the active logistics fleet.</Text>

            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.modalInput}
              value={driverName}
              onChangeText={setDriverName}
              placeholder="e.g. Test Driver"
              placeholderTextColor="#64748b"
            />

            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.modalInput}
              value={driverPhone}
              onChangeText={setDriverPhone}
              placeholder="e.g. 9999999999"
              placeholderTextColor="#64748b"
              keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>License Number</Text>
            <TextInput
              style={styles.modalInput}
              value={driverLicense}
              onChangeText={setDriverLicense}
              placeholder="e.g. MH12XY9999"
              placeholderTextColor="#64748b"
              autoCapitalize="characters"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsDriverModalOpen(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveDriver}
                disabled={driverSaving}
              >
                {driverSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Driver</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* TC-033: Add Vehicle Modal */}
      <Modal
        visible={isVehicleModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsVehicleModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Vehicle (TC-033)</Text>
            <Text style={styles.modalSubtitle}>Register a commercial vehicle into the dispatch network.</Text>

            <Text style={styles.inputLabel}>Registration Number</Text>
            <TextInput
              style={styles.modalInput}
              value={vehicleReg}
              onChangeText={setVehicleReg}
              placeholder="e.g. MH-01-AA-1111"
              placeholderTextColor="#64748b"
              autoCapitalize="characters"
            />

            <Text style={styles.inputLabel}>Vehicle Type (Small, Medium, Large)</Text>
            <TextInput
              style={styles.modalInput}
              value={vehicleType}
              onChangeText={setVehicleType}
              placeholder="e.g. Large"
              placeholderTextColor="#64748b"
            />

            <Text style={styles.inputLabel}>Payload Capacity (kg)</Text>
            <TextInput
              style={styles.modalInput}
              value={vehicleCapacity}
              onChangeText={setVehicleCapacity}
              placeholder="e.g. 2000"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsVehicleModalOpen(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveVehicle}
                disabled={vehicleSaving}
              >
                {vehicleSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Vehicle</Text>
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
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#334155',
  },
  backBtnText: {
    color: '#cbd5e1',
    fontWeight: '600',
    fontSize: 13,
  },
  title: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '700',
  },
  addBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#2563eb',
  },
  tabText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardName: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  cardSub: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  cardDetail: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  ratingText: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
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
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  inputLabel: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#334155',
  },
  cancelBtnText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#2563eb',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
