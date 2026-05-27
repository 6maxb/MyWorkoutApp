import { Platform, type ViewStyle } from 'react-native';

const shadowByPlatform: ViewStyle = Platform.OS === 'android'
  ? {
      elevation: 3,
    }
  : {
      shadowColor: '#0f172a',
      shadowOpacity: 0.08,
      shadowRadius: 14,
      shadowOffset: {
        width: 0,
        height: 10,
      },
    };

export const Colors = {
  background: '#f5f1e8',
  surface: '#fffdf8',
  card: '#fef9ef',
  text: '#1f2933',
  mutedText: '#6b7280',
  border: '#e7dcc7',
  primary: '#c66a2b',
  primaryMuted: '#f0d1bc',
  success: '#2e7d32',
  danger: '#b42318',
  tabBar: '#fffaf1',
  shadow: shadowByPlatform,
};
