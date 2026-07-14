import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS } from '../utils/constants';
import { addVehicle, removeVehicle, setActiveVehicle } from '../store';
import VehicleCard from '../components/VehicleCard';
import SubscriptionService from '../services/subscriptionService';
import { v4 as uuidv4 } from 'uuid';

export default function VehicleManagerScreen() {
  const { vehicles, activeVehicle, subscription } = useSelector(s => s.app);
  const dispatch = useDispatch();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ name: '', year: '', make: '', model: '', batteryAgeMonths: '', designCca: '600' });

  const handleAddVehicle = async () => {
    if (!newVehicle.name || !newVehicle.make) {
      Alert.alert('Missing Info', 'Please enter at least a name and make for your vehicle.');
      return;
    }

    const canAdd = await SubscriptionService.canAddVehicle(vehicles.length);
    if (!canAdd) {
      Alert.alert('Vehicle Limit Reached', 'Upgrade your subscription to add more vehicles.', [
        { text: 'Upgrade', onPress: () => {} },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }

    dispatch(addVehicle({
      id: uuidv4(),
      name: newVehicle.name,
      year: newVehicle.year,
      make: newVehicle.make,
      model: newVehicle.model,
      batteryAgeMonths: newVehicle.batteryAgeMonths ? parseInt(newVehicle.batteryAgeMonths) : null,
      designCca: newVehicle.designCca ? parseInt(newVehicle.designCca) : 600,
      addedAt: new Date().toISOString(),
    }));

    setNewVehicle({ name: '', year: '', make: '', model: '', batteryAgeMonths: '', designCca: '600' });
    setShowAddModal(false);
  };

  const handleDeleteVehicle = (vehicle) => {
    Alert.alert('Remove Vehicle', `Remove "${vehicle.name}" from your vehicles?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => dispatch(removeVehicle(vehicle.id)),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Vehicles</Text>
        <Text style={styles.subtitle}>{vehicles.length} vehicle(s) added</Text>
      </View>

      {vehicles.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="car-off" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No Vehicles Yet</Text>
          <Text style={styles.emptySubtitle}>Add your first vehicle to start monitoring</Text>
        </View>
      ) : (
        <FlatList
          data={vehicles}
          renderItem={({ item }) => (
            <View style={styles.vehicleItem}>
              <VehicleCard
                vehicle={item}
                isActive={activeVehicle?.id === item.id}
                onSelect={() => dispatch(setActiveVehicle(item))}
              />
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteVehicle(item)}>
                <MaterialCommunityIcons name="delete-outline" size={20} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
        <MaterialCommunityIcons name="plus" size={22} color={COLORS.white} />
        <Text style={styles.addButtonText}>Add Vehicle</Text>
      </TouchableOpacity>

      <Modal visible={showAddModal} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Vehicle</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <TextInput style={styles.modalInput} placeholder="Vehicle Name (e.g., My Car)" placeholderTextColor={COLORS.textMuted} value={newVehicle.name} onChangeText={(t) => setNewVehicle({ ...newVehicle, name: t })} />

            <View style={styles.modalRow}>
              <TextInput style={[styles.modalInput, { flex: 1 }]} placeholder="Year" placeholderTextColor={COLORS.textMuted} value={newVehicle.year} onChangeText={(t) => setNewVehicle({ ...newVehicle, year: t })} keyboardType="numeric" />
              <TextInput style={[styles.modalInput, { flex: 1 }]} placeholder="Make" placeholderTextColor={COLORS.textMuted} value={newVehicle.make} onChangeText={(t) => setNewVehicle({ ...newVehicle, make: t })} />
            </View>

            <TextInput style={styles.modalInput} placeholder="Model" placeholderTextColor={COLORS.textMuted} value={newVehicle.model} onChangeText={(t) => setNewVehicle({ ...newVehicle, model: t })} />

            <View style={styles.modalRow}>
              <TextInput style={[styles.modalInput, { flex: 1 }]} placeholder="Battery Age (months)" placeholderTextColor={COLORS.textMuted} value={newVehicle.batteryAgeMonths} onChangeText={(t) => setNewVehicle({ ...newVehicle, batteryAgeMonths: t })} keyboardType="numeric" />
              <TextInput style={[styles.modalInput, { flex: 1 }]} placeholder="Design CCA" placeholderTextColor={COLORS.textMuted} value={newVehicle.designCca} onChangeText={(t) => setNewVehicle({ ...newVehicle, designCca: t })} keyboardType="numeric" />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleAddVehicle}>
              <Text style={styles.saveButtonText}>Add Vehicle</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 20, paddingTop: 20 },
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  vehicleItem: { position: 'relative' },
  deleteBtn: { position: 'absolute', top: 14, right: 14, padding: 8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, gap: 8, position: 'absolute', bottom: 30, left: 20, right: 20 },
  addButtonText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  modalInput: { backgroundColor: COLORS.background, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  modalRow: { flexDirection: 'row', gap: 12 },
  saveButton: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  saveButtonText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
});
