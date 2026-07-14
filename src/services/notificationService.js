import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  async registerForPushNotifications() {
    if (!Device.isDevice) {
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('battery-alerts', {
        name: 'Battery Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#00D4FF',
      });
    }

    return true;
  }

  async sendBatteryAlert(title, body, data = {}) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        ...(Platform.OS === 'android' && { channelId: 'battery-alerts' }),
      },
      trigger: null,
    });
  }

  async sendLowBatteryAlert(healthPercent) {
    await this.sendBatteryAlert(
      'Battery Alert',
      `Your battery health is at ${healthPercent}%. Consider checking or replacing it soon.`,
      { type: 'low_battery', healthPercent }
    );
  }

  async sendCriticalBatteryAlert(healthPercent) {
    await this.sendBatteryAlert(
      'Critical Battery Warning',
      `Your battery health is at ${healthPercent}%! Immediate replacement recommended.`,
      { type: 'critical_battery', healthPercent }
    );
  }

  async sendChargeCompleteAlert() {
    await this.sendBatteryAlert(
      'Battery Charged',
      'Your battery has reached full charge. Disconnect charger to prevent overcharging.',
      { type: 'charge_complete' }
    );
  }

  async sendMaintenanceReminder(title, message) {
    await this.sendBatteryAlert(
      title || 'Maintenance Reminder',
      message,
      { type: 'maintenance' }
    );
  }

  async sendScanCompleteAlert(healthPercent, status) {
    await this.sendBatteryAlert(
      'Scan Complete',
      `Battery health: ${healthPercent}% - Status: ${status}`,
      { type: 'scan_complete', healthPercent, status }
    );
  }

  async schedulePeriodicCheck() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Battery Check Reminder',
        body: 'It\'s been a week since your last battery scan. Check your battery health now!',
        data: { type: 'periodic_reminder' },
      },
      trigger: {
        seconds: 60 * 60 * 24 * 7,
        repeats: true,
      },
    });
  }
}

export default new NotificationService();
