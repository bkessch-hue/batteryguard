import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../utils/constants';

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
      <Text style={styles.lastUpdated}>Last Updated: July 14, 2026</Text>

      <Text style={styles.sectionTitle}>Introduction</Text>
      <Text style={styles.body}>
        BatteryGuard AI ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application BatteryGuard AI (the "App").
      </Text>

      <Text style={styles.sectionTitle}>Information We Collect</Text>
      <Text style={styles.subTitle}>Personal Information</Text>
      <Text style={styles.body}>When you create an account, we may collect your full name, email address, and password (stored securely in encrypted form).</Text>

      <Text style={styles.subTitle}>Vehicle Information</Text>
      <Text style={styles.body}>You may choose to provide your vehicle nickname, year, make, model, battery age, and specifications. If detected via OBD-II, we may also collect your Vehicle Identification Number (VIN).</Text>

      <Text style={styles.subTitle}>Device and Bluetooth Data</Text>
      <Text style={styles.body}>
        When you connect an OBD-II adapter, we access: battery voltage readings, state of charge, charging system voltage, engine RPM, coolant temperature, ambient temperature, and OBD-II protocol data.
      </Text>
      <Text style={styles.important}>
        Important: We do NOT collect any data related to your driving behavior, location tracking, speed, or driving patterns. All data collected is strictly related to your vehicle's battery and charging system health.
      </Text>

      <Text style={styles.sectionTitle}>How We Use Your Information</Text>
      <Text style={styles.body}>We use the information to provide battery diagnostic features, analyze battery health, send alerts and reminders, process subscriptions, and improve the App.</Text>

      <Text style={styles.sectionTitle}>Data Sharing</Text>
      <Text style={styles.body}>
        We do NOT sell, trade, or rent your personal information to third parties. We may share data only with service providers who assist in operating the App, when required by law, during business transfers, or with your explicit consent.
      </Text>

      <Text style={styles.sectionTitle}>Data Security</Text>
      <Text style={styles.body}>All personal data is stored with industry-standard encryption. Passwords are hashed. We use SSL/TLS encryption for all data transmission.</Text>

      <Text style={styles.sectionTitle}>Your Rights</Text>
      <Text style={styles.body}>Depending on your location, you have the right to access, correct, delete, or port your data. You may also opt out of marketing communications and withdraw consent at any time.</Text>

      <Text style={styles.sectionTitle}>Data Retention</Text>
      <Text style={styles.body}>Free Trial: 7 days. Basic/Pro: 12 months while active. Advanced: Indefinitely while active. Account deletion removes data within 30 days.</Text>

      <Text style={styles.sectionTitle}>Children's Privacy</Text>
      <Text style={styles.body}>The App is not intended for children under 13 (or 16 in the EEA). We do not knowingly collect data from children.</Text>

      <Text style={styles.sectionTitle}>California Residents (CCPA)</Text>
      <Text style={styles.body}>California residents have additional rights under the CCPA. We do not sell personal information as defined by the CCPA.</Text>

      <Text style={styles.sectionTitle}>European Residents (GDPR)</Text>
      <Text style={styles.body}>EEA residents have rights under GDPR including access, correction, erasure, portability, and the right to lodge complaints with local authorities.</Text>

      <Text style={styles.sectionTitle}>Contact Us</Text>
      <Text style={styles.body}>Email: privacy@batteryguardai.com{'\n'}Website: www.batteryguardai.com</Text>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 20, paddingTop: 10 },
  lastUpdated: { fontSize: 12, color: COLORS.textMuted, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: 20, marginBottom: 8 },
  subTitle: { fontSize: 15, fontWeight: '600', color: COLORS.primary, marginTop: 12, marginBottom: 4 },
  body: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 6 },
  important: { fontSize: 14, color: COLORS.warning, lineHeight: 22, fontWeight: '600', marginTop: 8, marginBottom: 6, padding: 12, backgroundColor: COLORS.warning + '10', borderRadius: 10, borderWidth: 1, borderColor: COLORS.warning + '30' },
});
