import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { setUser, addVehicle, setSubscription } from '../store';
import { COLORS } from '../utils/constants';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [vehicle, setVehicle] = useState({
    name: 'My Equinox',
    year: '2023',
    make: 'Chevrolet',
    model: 'Equinox LT',
  });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleNext = () => {
    if (!name || !email || !password) {
      Alert.alert('Missing Info', 'Please fill in all fields.');
      return;
    }
    setStep(2);
  };

  const handleRegister = () => {
    setLoading(true);
    dispatch(setUser({ id: Date.now().toString(), name, email }));

    if (vehicle.name && vehicle.make) {
      dispatch(addVehicle({
        id: Date.now().toString(),
        name: vehicle.name,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        batteryAgeMonths: null,
        designCca: 600,
        addedAt: new Date().toISOString(),
      }));
    }

    dispatch(setSubscription({ tier: 'ADVANCED', startDate: new Date().toISOString() }));

    setLoading(false);
    navigation.replace('MainApp');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {step === 1 ? (
          <View style={styles.form}>
            <Text style={styles.stepIndicator}>Step 1 of 2</Text>
            <Text style={styles.stepTitle}>Create Your Account</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="account-outline" size={20} color={COLORS.textMuted} />
                <TextInput style={styles.input} placeholder="John Doe" placeholderTextColor={COLORS.textMuted} value={name} onChangeText={setName} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="email-outline" size={20} color={COLORS.textMuted} />
                <TextInput style={styles.input} placeholder="your@email.com" placeholderTextColor={COLORS.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="lock-outline" size={20} color={COLORS.textMuted} />
                <TextInput style={styles.input} placeholder="Min. 8 characters" placeholderTextColor={COLORS.textMuted} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialCommunityIcons name={showPassword ? 'eye-off' : 'eye'} size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Next</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.white} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>
                Already have an account? <Text style={styles.loginHighlight}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.stepIndicator}>Step 2 of 2</Text>
            <Text style={styles.stepTitle}>Add Your Vehicle</Text>
            <Text style={styles.stepSubtitle}>We pre-filled your vehicle info. Edit if needed.</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Vehicle Name (nickname)</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="label-outline" size={20} color={COLORS.textMuted} />
                <TextInput style={styles.input} placeholder="My Car" placeholderTextColor={COLORS.textMuted} value={vehicle.name} onChangeText={(t) => setVehicle({ ...vehicle, name: t })} />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Year</Text>
                <View style={styles.inputWrapper}>
                  <TextInput style={styles.input} placeholder="2023" placeholderTextColor={COLORS.textMuted} value={vehicle.year} onChangeText={(t) => setVehicle({ ...vehicle, year: t })} keyboardType="numeric" />
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Make</Text>
                <View style={styles.inputWrapper}>
                  <TextInput style={styles.input} placeholder="Chevrolet" placeholderTextColor={COLORS.textMuted} value={vehicle.make} onChangeText={(t) => setVehicle({ ...vehicle, make: t })} />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Model</Text>
              <View style={styles.inputWrapper}>
                <TextInput style={styles.input} placeholder="Equinox LT" placeholderTextColor={COLORS.textMuted} value={vehicle.model} onChangeText={(t) => setVehicle({ ...vehicle, model: t })} />
              </View>
            </View>

            <TouchableOpacity style={[styles.nextButton, loading && { opacity: 0.6 }]} onPress={handleRegister} disabled={loading}>
              <Text style={styles.nextButtonText}>{loading ? 'Creating Account...' : 'Start Free Trial'}</Text>
              <MaterialCommunityIcons name="check" size={20} color={COLORS.white} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setStep(1)} style={styles.backButton}>
              <Text style={styles.backText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 40, paddingBottom: 40 },
  form: { gap: 16 },
  stepIndicator: { fontSize: 13, color: COLORS.primary, fontWeight: '600', marginBottom: 4 },
  stepTitle: { fontSize: 26, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  stepSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 8 },
  inputGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  input: { flex: 1, height: 48, fontSize: 15, color: COLORS.text },
  row: { flexDirection: 'row', gap: 12 },
  nextButton: { flexDirection: 'row', backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 },
  nextButtonText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  loginLink: { textAlign: 'center', fontSize: 14, color: COLORS.textSecondary, marginTop: 10 },
  loginHighlight: { color: COLORS.primary, fontWeight: '700' },
  backButton: { alignItems: 'center', paddingVertical: 10 },
  backText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
});
