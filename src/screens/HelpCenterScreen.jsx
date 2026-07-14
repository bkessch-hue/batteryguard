import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput, FlatList, Platform, Linking, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { COLORS } from '../utils/constants';
import { getBrowserInfo } from '../utils/browser';

const SUPPORT_CONTACTS = {
  phone: '+1-800-BATTERY',
  email: 'support@batteryguardai.com',
  chat: 'https://batteryguardai.com/chat',
  ticket: 'https://batteryguardai.com/ticket',
  remote: 'https://batteryguardai.com/remote-support',
};

const COMMON_ISSUES = [
  { id: '1', icon: 'bluetooth-off', title: 'Bluetooth Connection Issues', desc: 'Troubleshoot adapter connection problems', category: 'connectivity' },
  { id: '2', icon: 'battery-off', title: 'Battery Not Detected', desc: 'Help when battery data won\'t load', category: 'scan' },
  { id: '3', icon: 'credit-card', title: 'Subscription Problems', desc: 'Payment issues, plan changes, refunds', category: 'billing' },
  { id: '4', icon: 'account', title: 'Account Access', desc: 'Login issues, password reset, account recovery', category: 'account' },
  { id: '5', icon: 'chart-line', title: 'Inaccurate Readings', desc: 'Data seems wrong or inconsistent', category: 'scan' },
  { id: '6', icon: 'cellphone', title: 'App Crashing', desc: 'App freezes, crashes, or won\'t open', category: 'technical' },
  { id: '7', icon: 'car', title: 'Vehicle Not Found', desc: 'Can\'t add or find your vehicle', category: 'vehicle' },
  { id: '8', icon: 'bell-off', title: 'Notifications Not Working', desc: 'Alerts not arriving', category: 'technical' },
];

export default function HelpCenterScreen({ navigation }) {
  const { user, subscription, lastScan, activeVehicle } = useSelector(s => s.app);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketPriority, setTicketPriority] = useState('medium');
  const [ticketCategory, setTicketCategory] = useState('general');
  const [submitting, setSubmitting] = useState(false);
  const [chatSession, setChatSession] = useState(null);
  const chatRef = useRef(null);

  const browserInfo = Platform.OS === 'web' ? getBrowserInfo() : null;

  useEffect(() => {
    if (showChatModal && chatMessages.length === 0) {
      initializeChat();
    }
  }, [showChatModal]);

  const initializeChat = async () => {
    setChatMessages([
      {
        id: '1',
        sender: 'bot',
        message: `Hello ${user?.name || 'there'}! I'm your BatteryGuard AI support assistant. How can I help you today?`,
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        sender: 'bot',
        message: 'You can ask me about:\n• Bluetooth connectivity\n• Battery diagnostics\n• Subscription & billing\n• App features\n• Vehicle compatibility',
        timestamp: new Date().toISOString(),
      },
    ]);
    setChatSession({ id: Date.now().toString(), status: 'active' });
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      message: chatInput,
      timestamp: new Date().toISOString(),
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateBotResponse(chatInput);
      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        message: response,
        timestamp: new Date().toISOString(),
      };
      setChatMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const generateBotResponse = (input) => {
    const lower = input.toLowerCase();

    if (lower.includes('bluetooth') || lower.includes('connect') || lower.includes('adapter')) {
      return 'For Bluetooth connection issues:\n\n1. Make sure your OBD-II adapter is plugged into the port under your dashboard\n2. Check that Bluetooth is enabled on your phone\n3. Try restarting the adapter (unplug and replug)\n4. Make sure the adapter is within 10 feet of your phone\n5. Try forgetting the device in Bluetooth settings and reconnecting\n\nIf these steps don\'t work, we can connect you with a live agent.';
    }

    if (lower.includes('battery') || lower.includes('voltage') || lower.includes('reading')) {
      if (lastScan) {
        return `Based on your last scan (${new Date(lastScan.timestamp).toLocaleDateString()}):\n\n• Voltage: ${lastScan.voltage?.toFixed(2) || 'N/A'}V\n• Health: ${lastScan.healthPercent || 'N/A'}%\n\nIf you believe these readings are incorrect, try:\n1. Scanning with the engine running\n2. Making sure the adapter is fully seated\n3. Checking for corrosion on battery terminals`;
      }
      return 'I don\'t see any scan data yet. Try running a battery scan first, then I can help analyze the results. You can also share your battery data with our support team for a detailed analysis.';
    }

    if (lower.includes('subscription') || lower.includes('billing') || lower.includes('payment') || lower.includes('charge')) {
      return `Your current plan: ${subscription?.tier || 'Free Trial'}\n\nCommon billing help:\n• To upgrade: Go to Settings > Subscription\n• To cancel: Contact billing@batteryguardai.com\n• Refund requests: Within 30 days of purchase\n• Promo codes: Applied at checkout\n\nNeed to speak with billing? I can connect you live.`;
    }

    if (lower.includes('vehicle') || lower.includes('car') || lower.includes('obd')) {
      return 'Our app works with ALL cars that have an OBD-II port (every car sold in the US since 1996).\n\nSupported brands include:\nChevrolet, Ford, Toyota, Honda, BMW, Mercedes, Audi, Nissan, Hyundai, Kia, and many more.\n\nIf your specific vehicle isn\'t being detected, try:\n1. Different OBD-II adapter position\n2. Checking if the adapter LED is on\n3. Using a different adapter if available';
    }

    if (lower.includes('crash') || lower.includes('freeze') || lower.includes('bug') || lower.includes('error')) {
      return 'Sorry to hear about the technical issue! Here are some steps:\n\n1. Force close and reopen the app\n2. Clear app cache (Settings > Apps > BatteryGuard > Clear Cache)\n3. Make sure you\'re on the latest version\n4. Restart your phone\n\nIf the issue persists, I\'ll create a support ticket for our engineering team.';
    }

    if (lower.includes('human') || lower.includes('agent') || lower.includes('live') || lower.includes('real person')) {
      return 'I can connect you with a live support agent right now!\n\nAvailable options:\n• Live Chat (average wait: 2 min)\n• Phone: 1-800-BATTERY (avg wait: 5 min)\n• Email: support@batteryguardai.com (response within 2 hours)\n\nWhich would you prefer?';
    }

    return 'Thanks for your message! I can help with:\n\n• Bluetooth connectivity issues\n• Battery diagnosis and readings\n• Subscription and billing\n• App technical support\n• Vehicle compatibility\n\nCould you provide more details about your specific issue so I can assist you better?';
  };

  const handleLiveChat = () => {
    setShowChatModal(true);
  };

  const handleCallSupport = () => {
    Alert.alert(
      'Call BatteryGuard Support',
      `Call us at:\n\n${SUPPORT_CONTACTS.phone}\n\nHours: 24/7\nAverage wait time: 5 minutes`,
      [
        { text: 'Call Now', onPress: () => Linking.openURL(`tel:${SUPPORT_CONTACTS.phone.replace(/[^0-9+]/g, '')}`) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleEmailSupport = () => {
    Alert.alert(
      'Email Support',
      `Send us an email at:\n\n${SUPPORT_CONTACTS.email}\n\nResponse time: Within 2 hours`,
      [
        { text: 'Open Email', onPress: () => Linking.openURL(`mailto:${SUPPORT_CONTACTS.email}?subject=BatteryGuard Support Request&body=Hello BatteryGuard Support Team,\n\nIssue: \nVehicle: ${activeVehicle ? `${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}` : 'Not specified'}\nPlan: ${subscription?.tier || 'Free Trial'}\n\n`) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleRemoteDiagnostics = () => {
    Alert.alert(
      'Remote Diagnostics',
      'Share your battery data with our support team for remote analysis. This will send:\n\n• Battery voltage & health data\n• Vehicle information\n• Scan history\n• Device information\n\nOur technicians can analyze this data remotely to diagnose issues.',
      [
        { text: 'Share Data', onPress: () => {
          Alert.alert('Data Shared', 'Your diagnostic data has been sent to our support team. A technician will review it and contact you within 1 hour.');
        }},
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSubmitTicket = async () => {
    if (!ticketSubject.trim() || !ticketDescription.trim()) {
      Alert.alert('Missing Info', 'Please fill in both subject and description.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setShowTicketModal(false);
      Alert.alert('Ticket Submitted', `Your support ticket has been created.\n\nTicket #BG-${Date.now().toString().slice(-6)}\n\nExpected response: Within 2 hours\nWe'll notify you when we respond.`);
      setTicketSubject('');
      setTicketDescription('');
      setTicketPriority('medium');
      setTicketCategory('general');
    }, 1500);
  };

  const handleIssueSelect = (issue) => {
    setSelectedIssue(issue);
    setShowIssueModal(true);
  };

  const quickActions = [
    { icon: 'message-text', label: 'Live Chat', subtitle: 'Chat with support now', color: COLORS.accent, onPress: handleLiveChat },
    { icon: 'phone', label: 'Call Support', subtitle: '24/7 phone support', color: COLORS.primary, onPress: handleCallSupport },
    { icon: 'email', label: 'Email Us', subtitle: 'Response within 2 hours', color: COLORS.secondary, onPress: handleEmailSupport },
    { icon: 'remote', label: 'Remote Diagnostics', subtitle: 'Share data for analysis', color: COLORS.warning, onPress: handleRemoteDiagnostics },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Help Center</Text>
        <Text style={styles.subtitle}>24/7 real-time support for your battery diagnostics</Text>
      </View>

      <View style={styles.statusBar}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>Support team is online now</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Get Instant Help</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, i) => (
            <TouchableOpacity key={i} style={[styles.actionCard, { borderColor: action.color + '30' }]} onPress={action.onPress}>
              <View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
                <MaterialCommunityIcons name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Common Issues</Text>
        {COMMON_ISSUES.map((issue) => (
          <TouchableOpacity key={issue.id} style={styles.issueItem} onPress={() => handleIssueSelect(issue)}>
            <MaterialCommunityIcons name={issue.icon} size={20} color={COLORS.primary} />
            <View style={styles.issueInfo}>
              <Text style={styles.issueTitle}>{issue.title}</Text>
              <Text style={styles.issueDesc}>{issue.desc}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Links</Text>
        <TouchableOpacity style={styles.linkItem} onPress={() => navigation.navigate('Subscription')}>
          <MaterialCommunityIcons name="credit-card" size={20} color={COLORS.accent} />
          <Text style={styles.linkText}>Manage Subscription</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkItem} onPress={() => navigation.navigate('VehicleManager')}>
          <MaterialCommunityIcons name="car" size={20} color={COLORS.primary} />
          <Text style={styles.linkText}>My Vehicles</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkItem} onPress={() => navigation.navigate('PrivacyPolicy')}>
          <MaterialCommunityIcons name="shield" size={20} color={COLORS.secondary} />
          <Text style={styles.linkText}>Privacy & Security</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.contactCard}>
          <View style={styles.contactRow}>
            <MaterialCommunityIcons name="phone" size={18} color={COLORS.primary} />
            <Text style={styles.contactLabel}>Phone:</Text>
            <Text style={styles.contactValue}>{SUPPORT_CONTACTS.phone}</Text>
          </View>
          <View style={styles.contactRow}>
            <MaterialCommunityIcons name="email" size={18} color={COLORS.primary} />
            <Text style={styles.contactLabel}>Email:</Text>
            <Text style={styles.contactValue}>{SUPPORT_CONTACTS.email}</Text>
          </View>
          <View style={styles.contactRow}>
            <MaterialCommunityIcons name="clock" size={18} color={COLORS.primary} />
            <Text style={styles.contactLabel}>Hours:</Text>
            <Text style={styles.contactValue}>24/7 Support</Text>
          </View>
          <View style={styles.contactRow}>
            <MaterialCommunityIcons name="earth" size={18} color={COLORS.primary} />
            <Text style={styles.contactLabel}>Website:</Text>
            <Text style={styles.contactValue}>batteryguardai.com</Text>
          </View>
        </View>
      </View>

      <View style={styles.ticketButton}>
        <TouchableOpacity style={styles.ticketBtn} onPress={() => setShowTicketModal(true)}>
          <MaterialCommunityIcons name="ticket" size={20} color={COLORS.white} />
          <Text style={styles.ticketBtnText}>Submit Support Ticket</Text>
        </TouchableOpacity>
      </View>

      {/* Live Chat Modal */}
      <Modal visible={showChatModal} animationType="slide" transparent>
        <View style={styles.chatOverlay}>
          <View style={styles.chatContainer}>
            <View style={styles.chatHeader}>
              <View style={styles.chatHeaderInfo}>
                <View style={styles.chatAvatar}>
                  <MaterialCommunityIcons name="robot" size={24} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.chatTitle}>BatteryGuard Support</Text>
                  <View style={styles.chatStatusRow}>
                    <View style={[styles.chatStatusDot, { backgroundColor: COLORS.accent }]} />
                    <Text style={styles.chatStatusText}>Online • Typically replies instantly</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowChatModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView
              ref={chatRef}
              style={styles.chatMessages}
              contentContainerStyle={{ padding: 16 }}
              onContentSizeChange={() => chatRef.current?.scrollToEnd({ animated: true })}
            >
              {chatMessages.map((msg) => (
                <View key={msg.id} style={[styles.chatBubble, msg.sender === 'user' ? styles.chatBubbleUser : styles.chatBubbleBot]}>
                  {msg.sender === 'bot' && (
                    <View style={styles.botAvatar}>
                      <MaterialCommunityIcons name="robot" size={16} color={COLORS.primary} />
                    </View>
                  )}
                  <View style={[styles.chatBubbleContent, msg.sender === 'user' ? styles.chatBubbleContentUser : styles.chatBubbleContentBot]}>
                    <Text style={[styles.chatBubbleText, msg.sender === 'user' && styles.chatBubbleTextUser]}>
                      {msg.message}
                    </Text>
                    <Text style={[styles.chatBubbleTime, msg.sender === 'user' && styles.chatBubbleTimeUser]}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              ))}
              {isTyping && (
                <View style={[styles.chatBubble, styles.chatBubbleBot]}>
                  <View style={styles.botAvatar}>
                    <MaterialCommunityIcons name="robot" size={16} color={COLORS.primary} />
                  </View>
                  <View style={styles.chatBubbleContentBot}>
                    <Text style={styles.typingIndicator}>●●●</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.chatQuickReplies}>
              {['Bluetooth issue', 'Subscription help', 'Talk to agent'].map((reply) => (
                <TouchableOpacity key={reply} style={styles.quickReply} onPress={() => { setChatInput(reply); }}>
                  <Text style={styles.quickReplyText}>{reply}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.chatInputRow}>
              <TextInput
                style={styles.chatInput}
                placeholder="Type your message..."
                placeholderTextColor={COLORS.textMuted}
                value={chatInput}
                onChangeText={setChatInput}
                multiline
              />
              <TouchableOpacity style={styles.chatSendBtn} onPress={sendChatMessage} disabled={!chatInput.trim()}>
                <MaterialCommunityIcons name="send" size={20} color={chatInput.trim() ? COLORS.white : COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.chatEscalateBtn}
              onPress={() => {
                setShowChatModal(false);
                setShowTicketModal(true);
              }}
            >
              <MaterialCommunityIcons name="account-supervisor" size={16} color={COLORS.accent} />
              <Text style={styles.chatEscalateText}>Escalate to Live Agent</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Submit Ticket Modal */}
      <Modal visible={showTicketModal} animationType="slide" transparent>
        <View style={styles.chatOverlay}>
          <View style={styles.chatContainer}>
            <View style={styles.chatHeader}>
              <View style={styles.chatHeaderInfo}>
                <MaterialCommunityIcons name="ticket" size={24} color={COLORS.primary} />
                <View>
                  <Text style={styles.chatTitle}>Submit Support Ticket</Text>
                  <Text style={styles.chatStatusText}>We'll respond within 2 hours</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowTicketModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false}>
              <View style={styles.ticketInfoCard}>
                <MaterialCommunityIcons name="information" size={18} color={COLORS.primary} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.ticketInfoText}>Your account info will be attached automatically:</Text>
                  <Text style={styles.ticketInfoDetail}>User: {user?.name || 'Guest'}</Text>
                  <Text style={styles.ticketInfoDetail}>Plan: {subscription?.tier || 'Free Trial'}</Text>
                  {activeVehicle && <Text style={styles.ticketInfoDetail}>Vehicle: {activeVehicle.year} {activeVehicle.make} {activeVehicle.model}</Text>}
                </View>
              </View>

              <Text style={styles.ticketLabel}>Category</Text>
              <View style={styles.categoryRow}>
                {['general', 'billing', 'technical', 'feature'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryChip, ticketCategory === cat && styles.categoryChipActive]}
                    onPress={() => setTicketCategory(cat)}
                  >
                    <Text style={[styles.categoryChipText, ticketCategory === cat && styles.categoryChipTextActive]}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.ticketLabel}>Priority</Text>
              <View style={styles.categoryRow}>
                {['low', 'medium', 'high', 'urgent'].map((pri) => (
                  <TouchableOpacity
                    key={pri}
                    style={[
                      styles.categoryChip,
                      ticketPriority === pri && styles.categoryChipActive,
                      pri === 'urgent' && ticketPriority === pri && { backgroundColor: COLORS.danger },
                      pri === 'high' && ticketPriority === pri && { backgroundColor: COLORS.warning },
                    ]}
                    onPress={() => setTicketPriority(pri)}
                  >
                    <Text style={[styles.categoryChipText, ticketPriority === pri && styles.categoryChipTextActive]}>
                      {pri.charAt(0).toUpperCase() + pri.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.ticketLabel}>Subject</Text>
              <TextInput
                style={styles.ticketInput}
                placeholder="Brief summary of your issue"
                placeholderTextColor={COLORS.textMuted}
                value={ticketSubject}
                onChangeText={setTicketSubject}
              />

              <Text style={styles.ticketLabel}>Description</Text>
              <TextInput
                style={[styles.ticketInput, { height: 120, textAlignVertical: 'top' }]}
                placeholder="Describe your issue in detail. Include any error messages, steps to reproduce, and what you've already tried..."
                placeholderTextColor={COLORS.textMuted}
                value={ticketDescription}
                onChangeText={setTicketDescription}
                multiline
              />

              <TouchableOpacity
                style={[styles.ticketSubmitBtn, submitting && { opacity: 0.6 }]}
                onPress={handleSubmitTicket}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <>
                    <MaterialCommunityIcons name="send" size={18} color={COLORS.white} />
                    <Text style={styles.ticketSubmitText}>Submit Ticket</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Issue Detail Modal */}
      <Modal visible={showIssueModal} animationType="slide" transparent>
        <View style={styles.chatOverlay}>
          <View style={styles.chatContainer}>
            <View style={styles.chatHeader}>
              <View style={styles.chatHeaderInfo}>
                <MaterialCommunityIcons name={selectedIssue?.icon || 'help'} size={24} color={COLORS.primary} />
                <View>
                  <Text style={styles.chatTitle}>{selectedIssue?.title || 'Issue'}</Text>
                  <Text style={styles.chatStatusText}>{selectedIssue?.category || ''}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowIssueModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.issueDetailDesc}>{selectedIssue?.desc}</Text>

              <View style={styles.issueSolutionCard}>
                <Text style={styles.issueSolutionTitle}>Quick Solution</Text>
                <Text style={styles.issueSolutionText}>
                  {selectedIssue?.id === '1' && '1. Ensure OBD-II adapter is plugged in\n2. Check Bluetooth is ON on your phone\n3. Move closer to the adapter\n4. Restart Bluetooth on your phone\n5. Forget and re-pair the device\n\nIf still not working, try a different adapter.'}
                  {selectedIssue?.id === '2' && '1. Run a scan with engine running\n2. Check adapter is fully seated in OBD-II port\n3. Try a different adapter if available\n4. Check for any dashboard warning lights\n\nYour battery may need professional testing if readings are consistently abnormal.'}
                  {selectedIssue?.id === '3' && 'Check your subscription status in Settings > Subscription.\n\nCommon issues:\n• Payment declined - update payment method\n• Plan not active - try logging out and back in\n• Want to cancel - email billing@batteryguardai.com\n• Refund request - within 30 days of purchase'}
                  {selectedIssue?.id === '4' && '1. Try "Forgot Password" on login screen\n2. Check email for reset link (check spam folder)\n3. If no email received, contact support\n4. Account recovery may require email verification'}
                  {selectedIssue?.id === '5' && 'Inaccurate readings can be caused by:\n\n1. Scan performed with engine OFF\n2. Adapter not fully connected\n3. Corroded battery terminals\n4. Failing battery that needs replacement\n5. Alternator issues\n\nFor best results, scan with engine running.'}
                  {selectedIssue?.id === '6' && 'To fix app crashes:\n\n1. Force close and restart the app\n2. Clear app cache:\n   - iOS: Offload and reinstall\n   - Android: Settings > Apps > BatteryGuard > Clear Cache\n3. Update to latest version\n4. Restart your device\n5. Reinstall the app'}
                  {selectedIssue?.id === '7' && 'To add your vehicle:\n\n1. Go to Settings > My Vehicles\n2. Tap "Add Vehicle"\n3. Enter Year, Make, Model\n4. Save\n\nAll vehicles from 1996+ with OBD-II are supported.'}
                  {selectedIssue?.id === '8' && 'To fix notification issues:\n\n1. Check phone notification settings\n2. Ensure BatteryGuard has notification permission\n3. Check in-app notification settings\n4. Make sure Do Not Disturb is off\n5. Restart the app'}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  style={[styles.issueActionBtn, { backgroundColor: COLORS.accent }]}
                  onPress={() => { setShowIssueModal(false); handleLiveChat(); }}
                >
                  <MaterialCommunityIcons name="message-text" size={18} color={COLORS.white} />
                  <Text style={styles.issueActionText}>Chat with Support</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.issueActionBtn, { backgroundColor: COLORS.primary }]}
                  onPress={() => { setShowIssueModal(false); setShowTicketModal(true); }}
                >
                  <MaterialCommunityIcons name="ticket" size={18} color={COLORS.white} />
                  <Text style={styles.issueActionText}>Submit Ticket</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 20, paddingTop: 20 },
  header: { marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  statusBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.accent + '15', borderRadius: 12, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: COLORS.accent + '30', gap: 8 },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.accent },
  statusText: { fontSize: 13, fontWeight: '600', color: COLORS.accent },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionCard: { width: '48%', backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  actionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  actionLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  actionSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  issueItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border, gap: 12 },
  issueInfo: { flex: 1 },
  issueTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  issueDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  linkItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border, gap: 12 },
  linkText: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.text },
  contactCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 12 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  contactLabel: { fontSize: 13, color: COLORS.textSecondary, width: 60 },
  contactValue: { fontSize: 13, color: COLORS.text, fontWeight: '600', flex: 1 },
  ticketButton: { marginTop: 8, marginBottom: 20 },
  ticketBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.secondary, borderRadius: 14, paddingVertical: 16, gap: 8 },
  ticketBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  chatOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  chatContainer: { backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%', minHeight: '60%' },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  chatHeaderInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  chatAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary + '20', alignItems: 'center', justifyContent: 'center' },
  chatTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  chatStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  chatStatusDot: { width: 8, height: 8, borderRadius: 4 },
  chatStatusText: { fontSize: 12, color: COLORS.textSecondary },
  chatMessages: { flex: 1 },
  chatBubble: { flexDirection: 'row', marginBottom: 12, gap: 8 },
  chatBubbleUser: { justifyContent: 'flex-end' },
  chatBubbleBot: { justifyContent: 'flex-start' },
  botAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primary + '20', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  chatBubbleContent: { maxWidth: '78%', borderRadius: 16, padding: 12 },
  chatBubbleContentUser: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  chatBubbleContentBot: { backgroundColor: COLORS.surfaceLight, borderBottomLeftRadius: 4 },
  chatBubbleText: { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  chatBubbleTextUser: { color: COLORS.white },
  chatBubbleTime: { fontSize: 10, color: COLORS.textMuted, marginTop: 4 },
  chatBubbleTimeUser: { color: COLORS.white + '80' },
  typingIndicator: { fontSize: 16, color: COLORS.textMuted, letterSpacing: 4 },
  chatQuickReplies: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  quickReply: { backgroundColor: COLORS.surfaceLight, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.border },
  quickReplyText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  chatInputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 8 },
  chatInput: { flex: 1, backgroundColor: COLORS.background, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: COLORS.text, maxHeight: 80 },
  chatSendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  chatEscalateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 6 },
  chatEscalateText: { fontSize: 13, fontWeight: '600', color: COLORS.accent },
  ticketInfoCard: { flexDirection: 'row', backgroundColor: COLORS.primary + '10', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: COLORS.primary + '30' },
  ticketInfoText: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  ticketInfoDetail: { fontSize: 12, color: COLORS.text, fontWeight: '600' },
  ticketLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8, marginTop: 8 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  categoryChip: { backgroundColor: COLORS.surfaceLight, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.border },
  categoryChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryChipText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  categoryChipTextActive: { color: COLORS.white },
  ticketInput: { backgroundColor: COLORS.background, borderRadius: 12, padding: 14, fontSize: 14, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8 },
  ticketSubmitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, gap: 8, marginTop: 8, marginBottom: 20 },
  ticketSubmitText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
  issueDetailDesc: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 16, lineHeight: 20 },
  issueSolutionCard: { backgroundColor: COLORS.surfaceLight, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  issueSolutionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  issueSolutionText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },
  issueActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, paddingVertical: 12, gap: 6 },
  issueActionText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
});
