import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS, SUBSCRIPTION_TIERS } from '../utils/constants';
import { setSubscription } from '../store';
import ReferralService from '../services/referralService';

export default function SubscriptionScreen({ navigation }) {
  const { subscription } = useSelector(s => s.app);
  const dispatch = useDispatch();
  const [selectedTier, setSelectedTier] = useState(subscription?.tier || 'FREE');
  const [discountActive, setDiscountActive] = useState(false);
  const [discountedPrices, setDiscountedPrices] = useState({});

  useEffect(() => {
    checkDiscount();
  }, []);

  const checkDiscount = async () => {
    const active = await ReferralService.isDiscountActive();
    setDiscountActive(active);
    if (active) {
      const prices = {};
      Object.values(SUBSCRIPTION_TIERS).forEach(tier => {
        if (tier.price > 0) {
          prices[tier.id] = ReferralService.getDiscountedPrice(tier.price);
        }
      });
      setDiscountedPrices(prices);
    }
  };

  const tiers = Object.values(SUBSCRIPTION_TIERS);

  const handleSubscribe = (tier) => {
    const price = discountActive && discountedPrices[tier.id]
      ? discountedPrices[tier.id]
      : tier.price;

    Alert.alert(
      `Subscribe to ${tier.name}`,
      tier.price === 0
        ? 'Start your free trial with no credit card required.'
        : discountActive
          ? `Special price: $${price.toFixed(2)}/month (10% referral discount!). You can cancel anytime.`
          : `Subscribe for $${tier.price}/month. You can cancel anytime.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: tier.price === 0 ? 'Start Free' : 'Subscribe',
          onPress: () => {
            dispatch(setSubscription({ tier: tier.id.toUpperCase(), startDate: new Date().toISOString() }));
            Alert.alert('Success!', `You are now subscribed to ${tier.name}.`, [
              { text: 'OK', onPress: () => navigation.goBack() },
            ]);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={true}>
      <Text style={styles.title}>Choose Your Plan</Text>
      <Text style={styles.subtitle}>Monitor your battery health with the right plan</Text>

      {discountActive && (
        <View style={styles.discountBanner}>
          <MaterialCommunityIcons name="ticket-percent" size={22} color={COLORS.accent} />
          <View style={{ flex: 1 }}>
            <Text style={styles.discountBannerTitle}>10% Referral Discount Active!</Text>
            <Text style={styles.discountBannerSub}>Your referral discount is applied to all plans below.</Text>
          </View>
        </View>
      )}

      <Text style={styles.tierHint}>Scroll down to see all plans</Text>

      {tiers.map((tier) => {
        const isActive = subscription?.tier === tier.id.toUpperCase();
        const hasDiscount = discountActive && discountedPrices[tier.id];
        const displayPrice = hasDiscount ? discountedPrices[tier.id] : tier.price;

        return (
          <TouchableOpacity
            key={tier.id}
            style={[styles.tierCard, isActive && styles.tierCardActive, { borderColor: tier.color + '40' }]}
            onPress={() => setSelectedTier(tier.id.toUpperCase())}
          >
            {tier.popular && (
              <View style={[styles.popularBadge, { backgroundColor: tier.color }]}>
                <Text style={styles.popularText}>MOST POPULAR</Text>
              </View>
            )}

            <View style={styles.tierHeader}>
              <View>
                <Text style={[styles.tierName, { color: tier.color }]}>{tier.name}</Text>
                <View style={styles.priceRow}>
                  {hasDiscount && (
                    <View style={styles.originalPriceBox}>
                      <Text style={styles.originalPrice}>${tier.price.toFixed(2)}</Text>
                    </View>
                  )}
                  <Text style={styles.priceSymbol}>$</Text>
                  <Text style={styles.price}>{displayPrice === 0 ? '0' : displayPrice.toFixed(2).split('.')[0]}</Text>
                  {displayPrice > 0 && <Text style={styles.period}>.{displayPrice.toFixed(2).split('.')[1]}/{tier.period}</Text>}
                </View>
                {hasDiscount && (
                  <View style={styles.savingsBadge}>
                    <MaterialCommunityIcons name="tag" size={12} color={COLORS.accent} />
                    <Text style={styles.savingsText}>10% off — you save ${(tier.price - displayPrice).toFixed(2)}/mo</Text>
                  </View>
                )}
              </View>
              {isActive && (
                <View style={styles.activeBadge}>
                  <MaterialCommunityIcons name="check" size={14} color={COLORS.white} />
                  <Text style={styles.activeText}>Current</Text>
                </View>
              )}
            </View>

            <View style={styles.featuresList}>
              {tier.features.map((feature, i) => (
                <View key={i} style={styles.featureRow}>
                  <MaterialCommunityIcons name="check-circle" size={16} color={tier.color} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            {!isActive && (
              <TouchableOpacity
                style={[styles.subscribeButton, { backgroundColor: tier.color }]}
                onPress={() => handleSubscribe(tier)}
              >
                <Text style={styles.subscribeButtonText}>
                  {tier.price === 0 ? 'Start Free Trial' : `Subscribe - $${displayPrice.toFixed(2)}/mo`}
                </Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        );
      })}

      <View style={styles.faqSection}>
        <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
        <FAQItem q="Can I cancel anytime?" a="Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period." />
        <FAQItem q="What happens after the free trial?" a="After 7 days, choose Basic ($14.99/mo), Pro ($24.99/mo), or Advanced ($39.99/mo). Your scan data is always saved." />
        <FAQItem q="What OBD-II adapter do I need?" a="Any ELM327-compatible Bluetooth adapter works (Veepeak Mini, BAFX, KONNWEI, etc.). Works with ALL cars since 1996." />
        <FAQItem q="Will this work with my car?" a="Yes! The app works with ANY car that has an OBD-II port - that's every car sold in the US since 1996, including Chevrolet, Ford, Toyota, Honda, BMW, and more." />
        <FAQItem q="Is my data secure?" a="Yes, all data is encrypted and stored securely. We never share your personal information with third parties." />
        <FAQItem q="How does the referral discount work?" a="Share your referral code with friends. When they subscribe, you both get 10% off your next billing cycle! Find your code in Settings > Share with Friends." />
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function FAQItem({ q, a }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <TouchableOpacity style={styles.faqItem} onPress={() => setExpanded(!expanded)}>
      <View style={styles.faqRow}>
        <Text style={styles.faqQuestion}>{q}</Text>
        <MaterialCommunityIcons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.textMuted} />
      </View>
      {expanded && <Text style={styles.faqAnswer}>{a}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 20, paddingTop: 20 },
  scrollContent: { paddingBottom: 80, flexGrow: 1 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4, marginBottom: 10 },
  discountBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.accent + '15', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.accent + '30', gap: 12 },
  discountBannerTitle: { fontSize: 14, fontWeight: '700', color: COLORS.accent },
  discountBannerSub: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  tierHint: { fontSize: 12, color: COLORS.textMuted, marginBottom: 16, fontStyle: 'italic' },
  tierCard: { backgroundColor: COLORS.surface, borderRadius: 18, padding: 20, marginBottom: 16, borderWidth: 2, borderColor: COLORS.border },
  tierCardActive: { borderWidth: 2 },
  popularBadge: { position: 'absolute', top: -1, right: 20, paddingHorizontal: 12, paddingVertical: 4, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
  popularText: { fontSize: 10, fontWeight: '800', color: COLORS.white, letterSpacing: 1 },
  tierHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  tierName: { fontSize: 20, fontWeight: '800' },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 4 },
  priceSymbol: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  price: { fontSize: 36, fontWeight: '900', color: COLORS.text },
  period: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 4 },
  originalPriceBox: { marginRight: 8 },
  originalPrice: { fontSize: 16, color: COLORS.textMuted, textDecorationLine: 'line-through', marginBottom: 4 },
  savingsBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  savingsText: { fontSize: 12, fontWeight: '600', color: COLORS.accent },
  activeBadge: { flexDirection: 'row', backgroundColor: COLORS.success, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, gap: 4, alignItems: 'center' },
  activeText: { fontSize: 12, fontWeight: '700', color: COLORS.white },
  featuresList: { gap: 10, marginBottom: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  subscribeButton: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  subscribeButtonText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
  faqSection: { marginTop: 20 },
  faqTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  faqItem: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  faqRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { fontSize: 14, fontWeight: '600', color: COLORS.text, flex: 1 },
  faqAnswer: { fontSize: 13, color: COLORS.textSecondary, marginTop: 10, lineHeight: 18 },
});
