import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUBSCRIPTION_TIERS } from '../utils/constants';

const STORAGE_KEYS = {
  SUBSCRIPTION: '@batteryguard_subscription',
  SUBSCRIPTION_START: '@batteryguard_sub_start',
  SCANS_TODAY: '@batteryguard_scans_today',
  LAST_SCAN_DATE: '@batteryguard_last_scan_date',
};

class SubscriptionService {
  async getCurrentSubscription() {
    const sub = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
    return sub ? JSON.parse(sub) : { tier: 'FREE', startDate: null };
  }

  async setSubscription(tier) {
    const data = {
      tier,
      startDate: new Date().toISOString(),
    };
    await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(data));
    return data;
  }

  async canScan() {
    const sub = await this.getCurrentSubscription();
    const tier = SUBSCRIPTION_TIERS[sub.tier];

    if (tier.limits.scansPerDay === Infinity) return true;

    const scansToday = await this.getScansToday();
    return scansToday < tier.limits.scansPerDay;
  }

  async recordScan() {
    const today = new Date().toDateString();
    const lastDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SCAN_DATE);

    if (lastDate !== today) {
      await AsyncStorage.setItem(STORAGE_KEYS.SCANS_TODAY, '1');
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SCAN_DATE, today);
    } else {
      const count = await this.getScansToday();
      await AsyncStorage.setItem(STORAGE_KEYS.SCANS_TODAY, String(count + 1));
    }
  }

  async getScansToday() {
    const today = new Date().toDateString();
    const lastDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SCAN_DATE);

    if (lastDate !== today) return 0;

    const count = await AsyncStorage.getItem(STORAGE_KEYS.SCANS_TODAY);
    return count ? parseInt(count) : 0;
  }

  async getScansRemaining() {
    const sub = await this.getCurrentSubscription();
    const tier = SUBSCRIPTION_TIERS[sub.tier];

    if (tier.limits.scansPerDay === Infinity) return Infinity;

    const used = await this.getScansToday();
    return Math.max(0, tier.limits.scansPerDay - used);
  }

  async canAddVehicle(currentVehicleCount) {
    const sub = await this.getCurrentSubscription();
    const tier = SUBSCRIPTION_TIERS[sub.tier];
    return currentVehicleCount < tier.limits.vehicles;
  }

  async canAccessFeature(feature) {
    const sub = await this.getCurrentSubscription();
    const tier = sub.tier;

    const featureMap = {
      'basic_scan': ['FREE', 'BASIC', 'PRO', 'ADVANCED'],
      'health_percent': ['FREE', 'BASIC', 'PRO', 'ADVANCED'],
      'voltage_reading': ['FREE', 'BASIC', 'PRO', 'ADVANCED'],
      'low_battery_alerts': ['FREE', 'BASIC', 'PRO', 'ADVANCED'],
      'history_7days': ['FREE', 'BASIC', 'PRO', 'ADVANCED'],
      'detailed_analysis': ['BASIC', 'PRO', 'ADVANCED'],
      'cca_reading': ['BASIC', 'PRO', 'ADVANCED'],
      'charging_system_test': ['BASIC', 'PRO', 'ADVANCED'],
      'push_notifications': ['BASIC', 'PRO', 'ADVANCED'],
      'pdf_reports': ['BASIC', 'PRO', 'ADVANCED'],
      'battery_replacement_tracker': ['BASIC', 'PRO', 'ADVANCED'],
      'history_1year': ['BASIC', 'PRO', 'ADVANCED'],
      'ai_prediction': ['PRO', 'ADVANCED'],
      'personalized_tips': ['PRO', 'ADVANCED'],
      'temperature_analysis': ['PRO', 'ADVANCED'],
      'charge_cycle_tracking': ['PRO', 'ADVANCED'],
      'unlimited_history': ['ADVANCED'],
      'warranty_tracking': ['ADVANCED'],
      'priority_support': ['ADVANCED'],
      'family_sharing': ['ADVANCED'],
    };

    const allowedTiers = featureMap[feature] || [];
    return allowedTiers.includes(tier);
  }

  async isInTrial() {
    const sub = await this.getCurrentSubscription();
    if (sub.tier !== 'FREE' || !sub.startDate) return false;

    const start = new Date(sub.startDate);
    const now = new Date();
    const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return diffDays < 7;
  }

  async getTrialDaysRemaining() {
    const sub = await this.getCurrentSubscription();
    if (sub.tier !== 'FREE' || !sub.startDate) return 0;

    const start = new Date(sub.startDate);
    const now = new Date();
    const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return Math.max(0, 7 - diffDays);
  }

  getTierFeatures(tier) {
    return SUBSCRIPTION_TIERS[tier]?.features || [];
  }

  getTierLimits(tier) {
    return SUBSCRIPTION_TIERS[tier]?.limits || {};
  }
}

export default new SubscriptionService();
