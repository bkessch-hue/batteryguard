import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../utils/constants';

export default function TermsOfServiceScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
      <Text style={styles.lastUpdated}>Last Updated: July 14, 2026</Text>

      <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
      <Text style={styles.body}>
        By downloading, installing, or using the BatteryGuard AI application ("App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the App.
      </Text>

      <Text style={styles.sectionTitle}>2. Description of Service</Text>
      <Text style={styles.body}>
        BatteryGuard AI provides battery health diagnostics for vehicles through OBD-II Bluetooth adapters. The App reads battery voltage, state of charge, and charging system data to help you monitor your vehicle's battery health.
      </Text>
      <Text style={styles.important}>
        The App is NOT a substitute for professional automotive diagnosis or repair. Always consult a qualified mechanic for vehicle issues.
      </Text>

      <Text style={styles.sectionTitle}>3. Eligibility</Text>
      <Text style={styles.body}>
        You must be at least 13 years of age (16 in the EEA) to use the App. By using the App, you represent that you meet this age requirement and have the legal capacity to enter into these Terms.
      </Text>

      <Text style={styles.sectionTitle}>4. Account Registration</Text>
      <Text style={styles.body}>
        You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate and complete information during registration and to update it as necessary. You are responsible for all activities that occur under your account.
      </Text>

      <Text style={styles.sectionTitle}>5. Subscriptions and Payments</Text>
      <Text style={styles.body}>The App offers the following subscription tiers:</Text>
      <Text style={styles.listItem}>Free Trial: 7-day trial with limited scans (3 per day), 1 vehicle profile, 7-day history.</Text>
      <Text style={styles.listItem}>Basic: $14.99/month with unlimited scans, 3 vehicles, 1-year history.</Text>
      <Text style={styles.listItem}>Pro: $24.99/month with AI predictions, 5 vehicles, temperature analysis.</Text>
      <Text style={styles.listItem}>Advanced: $39.99/month with unlimited access, warranty tracking, priority support.</Text>
      <Text style={styles.body}>
        Subscriptions auto-renew unless canceled at least 24 hours before the end of the current billing period. You may manage or cancel your subscription through your device's app store account settings.
      </Text>
      <Text style={styles.body}>
        Prices may vary by location and are subject to change. Any price changes will take effect at the start of your next billing cycle.
      </Text>

      <Text style={styles.sectionTitle}>6. Free Trial</Text>
      <Text style={styles.body}>
        New users receive a 7-day free trial with no credit card required. At the end of the trial, you must subscribe to continue using premium features. Your scan data is preserved and accessible after subscribing.
      </Text>

      <Text style={styles.sectionTitle}>7. Acceptable Use</Text>
      <Text style={styles.body}>You agree NOT to:</Text>
      <Text style={styles.listItem}>Use the App for any unlawful purpose</Text>
      <Text style={styles.listItem}>Attempt to reverse engineer, decompile, or disassemble the App</Text>
      <Text style={styles.listItem}>Share your account credentials with others</Text>
      <Text style={styles.listItem}>Use the App to harm, defraud, or deceive others</Text>
      <Text style={styles.listItem}>Interfere with or disrupt the App's functionality</Text>
      <Text style={styles.listItem}>Use automated tools to access or interact with the App</Text>
      <Text style={styles.listItem}>Circumvent any subscription or payment mechanisms</Text>

      <Text style={styles.sectionTitle}>8. Intellectual Property</Text>
      <Text style={styles.body}>
        All content, features, and functionality of the App, including but not limited to text, graphics, logos, icons, images, software, and design, are the exclusive property of BatteryGuard AI and are protected by copyright, trademark, and other intellectual property laws.
      </Text>

      <Text style={styles.sectionTitle}>9. Disclaimer of Warranties</Text>
      <Text style={styles.important}>
        The App is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied.
      </Text>
      <Text style={styles.body}>
        We do not warrant that: (a) the App will be uninterrupted, timely, secure, or error-free; (b) the battery readings or health predictions will be accurate or complete; (c) the App will meet your specific requirements; (d) defects will be corrected.
      </Text>
      <Text style={styles.body}>
        Battery health data provided by the App is for informational purposes only. Actual battery condition may differ from what the App reports. Always have your battery tested by a professional before making decisions about replacement or repair.
      </Text>

      <Text style={styles.sectionTitle}>10. Limitation of Liability</Text>
      <Text style={styles.body}>
        To the maximum extent permitted by law, BatteryGuard AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to: loss of profits, data, vehicle damage, personal injury, or any damages resulting from vehicle breakdown due to battery failure.
      </Text>
      <Text style={styles.body}>
        Our total liability shall not exceed the amount you paid for the App subscription in the twelve (12) months preceding the claim.
      </Text>

      <Text style={styles.sectionTitle}>11. Indemnification</Text>
      <Text style={styles.body}>
        You agree to indemnify, defend, and hold harmless BatteryGuard AI, its officers, directors, employees, and agents from any claims, losses, damages, liabilities, costs, and expenses arising from your use of the App or violation of these Terms.
      </Text>

      <Text style={styles.sectionTitle}>12. Third-Party Hardware</Text>
      <Text style={styles.body}>
        The App requires a compatible OBD-II Bluetooth adapter (sold separately). We are not responsible for the performance, compatibility, or accuracy of any third-party hardware. Use of third-party adapters is at your own risk.
      </Text>

      <Text style={styles.sectionTitle}>13. Termination</Text>
      <Text style={styles.body}>
        We may terminate or suspend your access to the App immediately, without prior notice, for any reason, including breach of these Terms. Upon termination, your right to use the App ceases immediately. You may also terminate your account by deleting the App and contacting support.
      </Text>

      <Text style={styles.sectionTitle}>14. Changes to Terms</Text>
      <Text style={styles.body}>
        We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms on this page and updating the "Last Updated" date. Your continued use of the App after changes constitutes acceptance of the new Terms.
      </Text>

      <Text style={styles.sectionTitle}>15. Governing Law</Text>
      <Text style={styles.body}>
        These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to conflict of law principles. Any disputes shall be resolved in the courts of competent jurisdiction.
      </Text>

      <Text style={styles.sectionTitle}>16. Severability</Text>
      <Text style={styles.body}>
        If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
      </Text>

      <Text style={styles.sectionTitle}>17. Entire Agreement</Text>
      <Text style={styles.body}>
        These Terms, together with our Privacy Policy, constitute the entire agreement between you and BatteryGuard AI regarding the use of the App and supersede all prior agreements.
      </Text>

      <Text style={styles.sectionTitle}>18. Contact Us</Text>
      <Text style={styles.body}>
        If you have any questions about these Terms, please contact us:{"\n\n"}Email: support@batteryguardai.com{"\n"}Website: www.batteryguardai.com
      </Text>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 20, paddingTop: 10 },
  lastUpdated: { fontSize: 12, color: COLORS.textMuted, marginBottom: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginTop: 22, marginBottom: 8 },
  body: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 6 },
  listItem: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 4, paddingLeft: 14 },
  important: { fontSize: 14, color: COLORS.danger, lineHeight: 22, fontWeight: '600', marginTop: 8, marginBottom: 6, padding: 12, backgroundColor: COLORS.danger + '10', borderRadius: 10, borderWidth: 1, borderColor: COLORS.danger + '30' },
});
