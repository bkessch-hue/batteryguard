import { Platform } from 'react-native';

let browserInfo = null;

export function getBrowserInfo() {
  if (browserInfo) return browserInfo;

  if (Platform.OS !== 'web') {
    browserInfo = { isWeb: false, browser: 'native', supportsBluetooth: false };
    return browserInfo;
  }

  const ua = navigator.userAgent || '';
  const vendor = navigator.vendor || '';

  const isChrome = !!window.chrome && (ua.includes('Chrome') || ua.includes('Chromium'));
  const isEdge = ua.includes('Edg/');
  const isOpera = ua.includes('OPR') || ua.includes('Opera');
  const isSafari = !isChrome && !isEdge && !isOpera && (ua.includes('Safari') || vendor.includes('Apple'));
  const isFirefox = ua.includes('Firefox');

  const browser = isEdge ? 'Edge' : isOpera ? 'Opera' : isChrome ? 'Chrome' : isSafari ? 'Safari' : isFirefox ? 'Firefox' : 'Unknown';

  const supportsWebBluetooth = !!(navigator.bluetooth);

  browserInfo = {
    isWeb: true,
    browser,
    isChrome,
    isSafari,
    isFirefox,
    isEdge,
    isOpera,
    supportsBluetooth: supportsWebBluetooth,
    userAgent: ua,
  };

  return browserInfo;
}

export function getBrowserSpecificStyles() {
  const { isSafari } = getBrowserInfo();

  return {
    scrollContainer: {
      WebkitOverflowScrolling: 'touch',
    },
    ...(isSafari ? {
      gap: 0,
      flexGapWorkaround: true,
    } : {}),
  };
}

export function getSafariViewportFix() {
  const { isSafari } = getBrowserInfo();
  if (!isSafari) return {};

  return {
    minHeight: '100vh',
    minHeight: '-webkit-fill-available',
  };
}

export function getBluetoothUnavailableMessage() {
  const { browser, supportsBluetooth, isSafari } = getBrowserInfo();

  if (supportsBluetooth) {
    return null;
  }

  if (isSafari) {
    return {
      title: 'Bluetooth Not Available in Safari',
      message: 'Safari does not support Web Bluetooth. You can still use Demo Mode to explore all features. For real Bluetooth scanning, please use Chrome, Edge, or Opera.',
      actionText: 'Use Chrome for Bluetooth',
    };
  }

  return {
    title: 'Bluetooth Not Supported',
    message: `Your browser (${browser}) may not support Web Bluetooth. Try Chrome, Edge, or Opera for full Bluetooth scanning. Demo Mode is available in any browser.`,
    actionText: 'Try Demo Mode',
  };
}

export function openChromeForBluetooth() {
  if (Platform.OS !== 'web') return;

  const url = window.location.href;
  window.open(`https://www.google.com/chrome/`, '_blank');
}

export const WEB_VIEWPORT_META = `
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="theme-color" content="#0A0E21" />
`;
