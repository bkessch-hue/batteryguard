import { Platform, StyleSheet } from 'react-native';

const isWeb = Platform.OS === 'web';

const safariOverrides = isWeb ? {
  scrollContainer: {
    WebkitOverflowScrolling: 'touch',
    overflowY: 'auto',
  },
  flexColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  safeBottom: {
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  },
  viewportFix: {
    minHeight: '100vh',
    minHeight: '-webkit-fill-available',
  },
  noOverflow: {
    overflow: 'hidden',
  },
  smoothScroll: {
    scrollBehavior: 'smooth',
    WebkitOverflowScrolling: 'touch',
  },
  flexGapWorkaround: {
    marginHorizontal: -5,
  },
  flexGapChild: {
    marginHorizontal: 5,
  },
} : {};

const baseStyles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: '#0A0E21',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#0A0E21',
    ...(isWeb ? {
      minHeight: '100vh',
      minHeight: '-webkit-fill-available',
    } : {}),
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#0A0E21',
    ...(isWeb ? {
      WebkitOverflowScrolling: 'touch',
      overflowY: 'auto',
    } : {}),
  },
  centeredContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webInput: {
    ...(isWeb ? {
      outlineStyle: 'none',
      outlineWidth: 0,
      WebkitAppearance: 'none',
      appearance: 'none',
    } : {}),
  },
  webButton: {
    ...(isWeb ? {
      cursor: 'pointer',
      userSelect: 'none',
      WebkitTapHighlightColor: 'transparent',
    } : {}),
  },
  webCard: {
    ...(isWeb ? {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    } : {}),
  },
  webLink: {
    ...(isWeb ? {
      cursor: 'pointer',
      textDecorationLine: 'none',
    } : {}),
  },
  noSelect: {
    userSelect: 'none',
    WebkitUserSelect: 'none',
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexColumn: {
    flexDirection: 'column',
  },
  hideScrollbar: {
    ...(isWeb ? {
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    } : {}),
  },
});

export const webStyles = safariOverrides;
export default baseStyles;
