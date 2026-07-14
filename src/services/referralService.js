import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  REFERRAL_CODE: '@batteryguard_referral_code',
  REFERRALS_SENT: '@batteryguard_referrals_sent',
  DISCOUNT_ACTIVE: '@batteryguard_discount_active',
  REFERRAL_COUNT: '@batteryguard_referral_count',
};

class ReferralService {
  async getReferralCode() {
    let code = await AsyncStorage.getItem(STORAGE_KEYS.REFERRAL_CODE);
    if (!code) {
      code = this.generateCode();
      await AsyncStorage.setItem(STORAGE_KEYS.REFERRAL_CODE, code);
    }
    return code;
  }

  generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'BG-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async sendReferral(contact, type) {
    const referralCode = await this.getReferralCode();
    const referralsSent = await this.getReferralsSent();
    const existing = referralsSent.find(r => r.contact === contact);

    if (existing) {
      return { success: false, message: 'You have already sent a referral to this contact.' };
    }

    const referral = {
      contact,
      type,
      code: referralCode,
      sentAt: new Date().toISOString(),
      status: 'pending',
    };

    referralsSent.push(referral);
    await AsyncStorage.setItem(STORAGE_KEYS.REFERRALS_SENT, JSON.stringify(referralsSent));

    return {
      success: true,
      message: `Referral link sent to ${contact}! You'll receive a 10% discount when they subscribe.`,
      referralCode,
    };
  }

  async activateDiscount() {
    await AsyncStorage.setItem(STORAGE_KEYS.DISCOUNT_ACTIVE, 'true');
    const count = await this.getReferralCount();
    await AsyncStorage.setItem(STORAGE_KEYS.REFERRAL_COUNT, String(count + 1));
  }

  async isDiscountActive() {
    const discount = await AsyncStorage.getItem(STORAGE_KEYS.DISCOUNT_ACTIVE);
    return discount === 'true';
  }

  async getReferralCount() {
    const count = await AsyncStorage.getItem(STORAGE_KEYS.REFERRAL_COUNT);
    return count ? parseInt(count) : 0;
  }

  async getReferralsSent() {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.REFERRALS_SENT);
    return data ? JSON.parse(data) : [];
  }

  getDiscountedPrice(originalPrice) {
    return Math.round(originalPrice * 0.9 * 100) / 100;
  }

  getDiscountMessage() {
    return '🎉 You earned a 10% referral discount on your next subscription!';
  }

  async getReferralLink() {
    const code = await this.getReferralCode();
    return `https://batteryguardai.com/ref/${code}`;
  }
}

export default new ReferralService();
