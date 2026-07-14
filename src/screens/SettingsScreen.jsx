import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput, FlatList, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS } from '../utils/constants';
import { logout } from '../store';
import SubscriptionBadge from '../components/SubscriptionBadge';
import ReferralService from '../services/referralService';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'zh', name: 'Chinese (Mandarin)', native: '中文' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
  { code: 'th', name: 'Thai', native: 'ไทย' },
  { code: 'pl', name: 'Polish', native: 'Polski' },
  { code: 'uk', name: 'Ukrainian', native: 'Українська' },
  { code: 'ro', name: 'Romanian', native: 'Română' },
  { code: 'cs', name: 'Czech', native: 'Čeština' },
  { code: 'sv', name: 'Swedish', native: 'Svenska' },
  { code: 'da', name: 'Danish', native: 'Dansk' },
  { code: 'fi', name: 'Finnish', native: 'Suomi' },
  { code: 'no', name: 'Norwegian', native: 'Norsk' },
  { code: 'el', name: 'Greek', native: 'Ελληνικά' },
  { code: 'hu', name: 'Hungarian', native: 'Magyar' },
  { code: 'he', name: 'Hebrew', native: 'עברית' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
  { code: 'ms', name: 'Malay', native: 'Bahasa Melayu' },
  { code: 'tl', name: 'Filipino', native: 'Filipino' },
  { code: 'sw', name: 'Swahili', native: 'Kiswahili' },
  { code: 'am', name: 'Amharic', native: 'አማርኛ' },
  { code: 'yo', name: 'Yoruba', native: 'Yorùbá' },
  { code: 'ig', name: 'Igbo', native: 'Igbo' },
  { code: 'ha', name: 'Hausa', native: 'Hausa' },
  { code: 'zu', name: 'Zulu', native: 'isiZulu' },
  { code: 'af', name: 'Afrikaans', native: 'Afrikaans' },
  { code: 'ca', name: 'Catalan', native: 'Català' },
  { code: 'cy', name: 'Welsh', native: 'Cymraeg' },
  { code: 'ga', name: 'Irish', native: 'Gaeilge' },
  { code: 'mt', name: 'Maltese', native: 'Malti' },
  { code: 'is', name: 'Icelandic', native: 'Íslenska' },
  { code: 'lv', name: 'Latvian', native: 'Latviešu' },
  { code: 'lt', name: 'Lithuanian', native: 'Lietuvių' },
  { code: 'et', name: 'Estonian', native: 'Eesti' },
  { code: 'sl', name: 'Slovenian', native: 'Slovenščina' },
  { code: 'sk', name: 'Slovak', native: 'Slovenčina' },
  { code: 'hr', name: 'Croatian', native: 'Hrvatski' },
  { code: 'bs', name: 'Bosnian', native: 'Bosanski' },
  { code: 'sr', name: 'Serbian', native: 'Српски' },
  { code: 'mk', name: 'Macedonian', native: 'Македонски' },
  { code: 'sq', name: 'Albanian', native: 'Shqip' },
  { code: 'ka', name: 'Georgian', native: 'ქართული' },
  { code: 'hy', name: 'Armenian', native: 'Հայերեն' },
  { code: 'az', name: 'Azerbaijani', native: 'Azərbaycanca' },
  { code: 'kk', name: 'Kazakh', native: 'Қазақша' },
  { code: 'uz', name: 'Uzbek', native: "O'zbekcha" },
  { code: 'tg', name: 'Tajik', native: 'Тоҷикӣ' },
  { code: 'mn', name: 'Mongolian', native: 'Монгол' },
  { code: 'ne', name: 'Nepali', native: 'नेपाली' },
  { code: 'si', name: 'Sinhala', native: 'සිංහල' },
  { code: 'my', name: 'Myanmar', native: 'မြန်မာစာ' },
  { code: 'km', name: 'Khmer', native: 'ភាសាខ្មែរ' },
  { code: 'lo', name: 'Lao', native: 'ພາສາລາວ' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
  { code: 'ps', name: 'Pashto', native: 'پښتو' },
  { code: 'fa', name: 'Persian', native: 'فارسی' },
  { code: 'ku', name: 'Kurdish', native: 'Kurdî' },
  { code: 'rw', name: 'Kinyarwanda', native: 'Ikinyarwanda' },
  { code: 'rn', name: 'Kirundi', native: 'Kirundi' },
  { code: 'lg', name: 'Luganda', native: 'Luganda' },
  { code: 'ak', name: 'Akan', native: 'Akan' },
  { code: 'bm', name: 'Bambara', native: 'Bamanankan' },
  { code: 'wo', name: 'Wolof', native: 'Wolof' },
  { code: 'ff', name: 'Fula', native: 'Fulfulde' },
  { code: 'om', name: 'Oromo', native: 'Afaan Oromoo' },
  { code: 'so', name: 'Somali', native: 'Soomaali' },
  { code: 'ti', name: 'Tigrinya', native: 'ትግርኛ' },
  { code: 'eo', name: 'Esperanto', native: 'Esperanto' },
  { code: 'la', name: 'Latin', native: 'Latina' },
  { code: 'haw', name: 'Hawaiian', native: 'ʻŌlelo Hawaiʻi' },
  { code: 'mi', name: 'Maori', native: 'Te Reo Māori' },
  { code: 'sm', name: 'Samoan', native: 'Gagana Samoa' },
  { code: 'to', name: 'Tongan', native: 'Lea faka-Tonga' },
  { code: 'fj', name: 'Fijian', native: 'Na Vosa Vakaviti' },
  { code: 'ceb', name: 'Cebuano', native: 'Cebuano' },
  { code: 'jv', name: 'Javanese', native: 'Basa Jawa' },
  { code: 'su', name: 'Sundanese', native: 'Basa Sunda' },
  { code: 'ny', name: 'Chichewa', native: 'Chichewa' },
  { code: 'tet', name: 'Tetum', native: 'Tetun' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', native: 'Português (Brasil)' },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', native: 'Português (Portugal)' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', native: '繁體中文' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', native: '简体中文' },
];

const uniqueLanguages = LANGUAGES.filter((lang, index, self) =>
  index === self.findIndex(l => l.code === lang.code && l.name === lang.name)
).sort((a, b) => a.name.localeCompare(b.name));

export default function SettingsScreen({ navigation }) {
  const { user, subscription, vehicles } = useSelector(s => s.app);
  const dispatch = useDispatch();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [languageSearch, setLanguageSearch] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareInput, setShareInput] = useState('');
  const [shareType, setShareType] = useState('email');
  const [referralCode, setReferralCode] = useState('');
  const [referralCount, setReferralCount] = useState(0);
  const [discountActive, setDiscountActive] = useState(false);
  const [referralHistory, setReferralHistory] = useState([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    const code = await ReferralService.getReferralCode();
    const count = await ReferralService.getReferralCount();
    const discount = await ReferralService.isDiscountActive();
    const history = await ReferralService.getReferralsSent();
    setReferralCode(code);
    setReferralCount(count);
    setDiscountActive(discount);
    setReferralHistory(history);
  };

  const filteredLanguages = uniqueLanguages.filter(lang =>
    lang.name.toLowerCase().includes(languageSearch.toLowerCase()) ||
    lang.native.toLowerCase().includes(languageSearch.toLowerCase())
  );

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          dispatch(logout());
          navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
        },
      },
    ]);
  };

  const handleShare = async () => {
    if (!shareInput.trim()) {
      Alert.alert('Missing Info', `Please enter a valid ${shareType === 'email' ? 'email address' : 'phone number'}.`);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s-]{10,}$/;

    if (shareType === 'email' && !emailRegex.test(shareInput)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (shareType === 'phone' && !phoneRegex.test(shareInput.replace(/\s/g, ''))) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number with country code (e.g., +1 555 123 4567).');
      return;
    }

    setSending(true);
    const result = await ReferralService.sendReferral(shareInput, shareType);
    setSending(false);

    if (result.success) {
      Alert.alert(
        'Referral Sent! 🎉',
        `Your referral has been sent to ${shareInput}.\n\nYour referral code: ${result.referralCode}\n\nWhen they subscribe, you BOTH get 10% off!`,
        [{ text: 'Great!' }]
      );
      setShareInput('');
      setShowShareModal(false);
      loadReferralData();
    } else {
      Alert.alert('Already Sent', result.message);
    }
  };

  const sections = [
    {
      title: 'Account',
      items: [
        { icon: 'account', label: 'Profile', subtitle: user?.name || 'Guest', onPress: () => {} },
        { icon: 'car', label: 'My Vehicles', subtitle: `${vehicles.length} vehicle(s)`, onPress: () => navigation.navigate('VehicleManager') },
        { icon: 'credit-card', label: 'Subscription', subtitle: subscription?.tier || 'Free', onPress: () => navigation.navigate('Subscription') },
      ],
    },
    {
      title: 'App',
      items: [
        { icon: 'bell', label: 'Notifications', subtitle: 'Manage alerts', onPress: () => {} },
        { icon: 'theme-light-dark', label: 'Appearance', subtitle: 'Dark mode', onPress: () => {} },
        { icon: 'translate', label: 'Language', subtitle: selectedLanguage, onPress: () => setShowLanguageModal(true) },
      ],
    },
    {
      title: 'Referrals & Rewards',
      items: [
        { icon: 'share-variant', label: 'Share with Friends', subtitle: discountActive ? '10% discount active!' : 'Get 10% off for each referral', onPress: () => setShowShareModal(true) },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: 'help-circle', label: 'Help Center', subtitle: '24/7 live support & FAQs', onPress: () => navigation.navigate('HelpCenter') },
        { icon: 'email', label: 'Contact Support', subtitle: 'Get help', onPress: () => navigation.navigate('HelpCenter') },
        { icon: 'star', label: 'Rate the App', subtitle: 'Share your feedback', onPress: () => {} },
      ],
    },
    {
      title: 'Legal',
      items: [
        { icon: 'file-document', label: 'Privacy Policy', subtitle: '', onPress: () => navigation.navigate('PrivacyPolicy') },
        { icon: 'file-document', label: 'Terms of Service', subtitle: '', onPress: () => navigation.navigate('TermsOfService') },
      ],
    },
  ];

  return (
    <View style={styles.outerContainer}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={true} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'Not signed in'}</Text>
          <SubscriptionBadge tier={subscription?.tier || 'FREE'} />
        </View>

        {discountActive && (
          <View style={styles.discountBanner}>
            <MaterialCommunityIcons name="ticket-percent" size={24} color={COLORS.accent} />
            <View style={styles.discountInfo}>
              <Text style={styles.discountTitle}>10% Discount Active!</Text>
              <Text style={styles.discountDesc}>Your referral discount applies to all subscription plans.</Text>
            </View>
          </View>
        )}

        {sections.map((section, si) => (
          <View key={si} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, ii) => (
                <TouchableOpacity key={ii} style={styles.menuItem} onPress={item.onPress}>
                  <MaterialCommunityIcons name={item.icon} size={22} color={COLORS.primary} />
                  <View style={styles.menuInfo}>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    {item.subtitle ? <Text style={[styles.menuSubtitle, item.label === 'Share with Friends' && discountActive && { color: COLORS.accent }]}>{item.subtitle}</Text> : null}
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color={COLORS.danger} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>BatteryGuard AI v1.0.0</Text>
      </ScrollView>

      {/* Share Modal */}
      <Modal visible={showShareModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Share & Earn 10% Off</Text>
              <TouchableOpacity onPress={() => { setShowShareModal(false); setShareInput(''); }}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.referralCodeBox}>
              <Text style={styles.referralCodeLabel}>Your Referral Code</Text>
              <Text style={styles.referralCode}>{referralCode}</Text>
              <Text style={styles.referralCodeHint}>Share this code with friends</Text>
            </View>

            <View style={styles.shareStats}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{referralCount}</Text>
                <Text style={styles.statLabel}>Referrals Sent</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{discountActive ? '10%' : '0%'}</Text>
                <Text style={styles.statLabel}>Discount</Text>
              </View>
            </View>

            <Text style={styles.shareTitle}>Send via</Text>
            <View style={styles.typeToggle}>
              <TouchableOpacity
                style={[styles.typeBtn, shareType === 'email' && styles.typeBtnActive]}
                onPress={() => { setShareType('email'); setShareInput(''); }}
              >
                <MaterialCommunityIcons name="email" size={18} color={shareType === 'email' ? COLORS.white : COLORS.textSecondary} />
                <Text style={[styles.typeBtnText, shareType === 'email' && styles.typeBtnTextActive]}>Email</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, shareType === 'phone' && styles.typeBtnActive]}
                onPress={() => { setShareType('phone'); setShareInput(''); }}
              >
                <MaterialCommunityIcons name="phone" size={18} color={shareType === 'phone' ? COLORS.white : COLORS.textSecondary} />
                <Text style={[styles.typeBtnText, shareType === 'phone' && styles.typeBtnTextActive]}>Phone</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name={shareType === 'email' ? 'email-outline' : 'phone-outline'} size={20} color={COLORS.textMuted} />
              <TextInput
                style={styles.input}
                placeholder={shareType === 'email' ? 'friend@email.com' : '+1 555 123 4567'}
                placeholderTextColor={COLORS.textMuted}
                value={shareInput}
                onChangeText={setShareInput}
                keyboardType={shareType === 'email' ? 'email-address' : 'phone-pad'}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity style={[styles.sendButton, sending && { opacity: 0.6 }]} onPress={handleShare} disabled={sending}>
              <MaterialCommunityIcons name="send" size={18} color={COLORS.white} />
              <Text style={styles.sendButtonText}>{sending ? 'Sending...' : 'Send Referral'}</Text>
            </TouchableOpacity>

            {referralHistory.length > 0 && (
              <View style={styles.historySection}>
                <Text style={styles.historyTitle}>Recent Referrals</Text>
                {referralHistory.slice(-5).reverse().map((ref, i) => (
                  <View key={i} style={styles.historyItem}>
                    <MaterialCommunityIcons name={ref.type === 'email' ? 'email' : 'phone'} size={16} color={COLORS.textMuted} />
                    <Text style={styles.historyContact}>{ref.contact}</Text>
                    <Text style={styles.historyStatus}>{ref.status}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Language Modal */}
      <Modal visible={showLanguageModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <TouchableOpacity onPress={() => { setShowLanguageModal(false); setLanguageSearch(''); }}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchWrapper}>
              <MaterialCommunityIcons name="magnify" size={20} color={COLORS.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search languages..."
                placeholderTextColor={COLORS.textMuted}
                value={languageSearch}
                onChangeText={setLanguageSearch}
              />
              {languageSearch.length > 0 && (
                <TouchableOpacity onPress={() => setLanguageSearch('')}>
                  <MaterialCommunityIcons name="close-circle" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.langCount}>{filteredLanguages.length} languages</Text>

            <FlatList
              data={filteredLanguages}
              keyExtractor={(item) => `${item.code}-${item.name}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.langItem, selectedLanguage === item.name && styles.langItemActive]}
                  onPress={() => {
                    setSelectedLanguage(item.name);
                    setShowLanguageModal(false);
                    setLanguageSearch('');
                  }}
                >
                  <View style={styles.langInfo}>
                    <Text style={[styles.langName, selectedLanguage === item.name && styles.langNameActive]}>
                      {item.name}
                    </Text>
                    <Text style={styles.langNative}>{item.native}</Text>
                  </View>
                  {selectedLanguage === item.name && (
                    <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={true}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    ...(Platform.OS === 'web' ? {
      WebkitOverflowScrolling: 'touch',
      overflowY: 'auto',
    } : {}),
  },
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 20, paddingTop: 20 },
  profileSection: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.primary + '20', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.primary + '40' },
  avatarText: { fontSize: 30, fontWeight: '800', color: COLORS.primary },
  userName: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  userEmail: { fontSize: 14, color: COLORS.textSecondary },
  discountBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.accent + '15', borderRadius: 14, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: COLORS.accent + '30', gap: 12 },
  discountInfo: { flex: 1 },
  discountTitle: { fontSize: 15, fontWeight: '700', color: COLORS.accent },
  discountDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginLeft: 4 },
  sectionCard: { backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuInfo: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  menuSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.danger + '10', borderRadius: 14, paddingVertical: 16, gap: 8, borderWidth: 1, borderColor: COLORS.danger + '30' },
  logoutText: { fontSize: 15, fontWeight: '700', color: COLORS.danger },
  version: { textAlign: 'center', fontSize: 12, color: COLORS.textMuted, marginTop: 16, marginBottom: 20 },
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', paddingBottom: 30 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 12 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  referralCodeBox: { alignItems: 'center', backgroundColor: COLORS.primary + '10', borderRadius: 14, padding: 16, marginHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.primary + '30' },
  referralCodeLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  referralCode: { fontSize: 24, fontWeight: '900', color: COLORS.primary, letterSpacing: 3 },
  referralCodeHint: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  shareStats: { flexDirection: 'row', gap: 12, marginHorizontal: 16, marginBottom: 16 },
  statBox: { flex: 1, alignItems: 'center', backgroundColor: COLORS.background, borderRadius: 12, paddingVertical: 12, borderWidth: 1, borderColor: COLORS.border },
  statNumber: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  shareTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginHorizontal: 16, marginBottom: 8 },
  typeToggle: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 12 },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background, borderRadius: 10, paddingVertical: 12, gap: 6, borderWidth: 1, borderColor: COLORS.border },
  typeBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  typeBtnTextActive: { color: COLORS.white },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderRadius: 12, paddingHorizontal: 14, marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  input: { flex: 1, height: 48, fontSize: 15, color: COLORS.text },
  sendButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, marginHorizontal: 16, gap: 8 },
  sendButtonText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
  historySection: { marginTop: 16, marginHorizontal: 16 },
  historyTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  historyItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  historyContact: { flex: 1, fontSize: 14, color: COLORS.text },
  historyStatus: { fontSize: 12, color: COLORS.accent, fontWeight: '600' },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, marginHorizontal: 16, borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: COLORS.border, gap: 8, marginBottom: 8 },
  searchInput: { flex: 1, height: 44, fontSize: 15, color: COLORS.text },
  langCount: { fontSize: 12, color: COLORS.textMuted, paddingHorizontal: 20, paddingBottom: 8 },
  langItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  langItemActive: { backgroundColor: COLORS.primary + '10' },
  langInfo: { flex: 1 },
  langName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  langNameActive: { color: COLORS.primary },
  langNative: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
});
