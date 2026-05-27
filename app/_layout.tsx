import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Colors } from '@/constants/Colors';
import { DatabaseProvider } from '@/context/DatabaseProvider';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <DatabaseProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            contentStyle: styles.content,
            headerShadowVisible: false,
            headerStyle: styles.header,
            headerTintColor: Colors.text,
            headerTitleStyle: styles.headerTitle,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="session/[id]" options={{ title: 'Séance' }} />
        </Stack>
      </DatabaseProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.background,
  },
  headerTitle: {
    color: Colors.text,
    fontWeight: '700',
  },
  root: {
    flex: 1,
  },
});
