jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
}));

process.env.EXPO_PUBLIC_API_URL = 'https://api.test.com/api/v1';

jest.mock('expo-crypto', () => ({
  randomUUID: () => '12345678-1234-1234-1234-123456789012',
}));

jest.mock('@/components/ui/toast/ToastProvider', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn()
  }
}));

const mockReanimated = {
  call: jest.fn(),
  createAnimatedComponent: jest.fn((Component) => Component),
  View: 'AnimatedView',
  Text: 'AnimatedText',
  ScrollView: 'AnimatedScrollView',
  Image: 'AnimatedImage',
};

jest.mock('react-native-reanimated', () => ({
  __esModule: true,
  default: mockReanimated,
  ...mockReanimated,
  FadeInUp: {},
  FadeOutUp: { duration: jest.fn(() => ({})) },
  FadeOut: { duration: jest.fn(() => ({})) },
  useSharedValue: jest.fn((init) => ({ value: init })),
  useAnimatedStyle: jest.fn(() => ({})),
  useAnimatedProps: jest.fn(() => ({})),
  withTiming: jest.fn((val) => val),
  withSpring: jest.fn((val) => val),
  withRepeat: jest.fn((val) => val),
  withSequence: jest.fn((val) => val),
  withDelay: jest.fn((delay, val) => val),
  Easing: {
    inOut: jest.fn(),
    quad: jest.fn(),
    sin: jest.fn(),
    ease: jest.fn(),
    out: jest.fn((val) => val),
    cubic: jest.fn(),
    bezier: jest.fn()
  }
}));

jest.mock('react-native-svg', () => ({
  __esModule: true,
  default: 'Svg',
  Path: 'Path'
}));

jest.mock('react-native-worklets', () => ({
  makeShareable: jest.fn(),
  makeMutable: jest.fn(),
  runOnUI: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Ionicons: (props) => <View {...props} testID="mock-ionicons" />,
    Feather: (props) => <View {...props} testID="mock-feather" />,
    FontAwesome: (props) => <View {...props} testID="mock-fontawesome" />,
    MaterialIcons: (props) => <View {...props} testID="mock-materialicons" />,
    AntDesign: (props) => <View {...props} testID="mock-antdesign" />
  };
});

jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  const mockIcon = (props) => <View {...props} testID="mock-lucide-icon" />;
  return {
    Mail: mockIcon,
    Lock: mockIcon,
    User: mockIcon,
    Eye: mockIcon,
    EyeOff: mockIcon,
    AlertCircle: mockIcon,
    ArrowRight: mockIcon
  };
});



const originalConsoleError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('overlapping act()')) return;
  originalConsoleError(...args);
};

