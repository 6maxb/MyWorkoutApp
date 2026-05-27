import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Colors } from '@/constants/Colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: styles.header,
        headerTintColor: Colors.text,
        headerTitleStyle: styles.headerTitle,
        sceneStyle: styles.scene,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.mutedText,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Aujourd'hui", tabBarLabel: "Aujourd'hui" }} />
      <Tabs.Screen name="history" options={{ title: 'Archives', tabBarLabel: 'Archives' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.background,
  },
  headerTitle: {
    color: Colors.text,
    fontWeight: '700',
  },
  scene: {
    backgroundColor: Colors.background,
  },
  tabBar: {
    backgroundColor: Colors.tabBar,
    borderTopColor: Colors.border,
    height: 66,
    paddingBottom: 10,
    paddingTop: 8,
  },
});
