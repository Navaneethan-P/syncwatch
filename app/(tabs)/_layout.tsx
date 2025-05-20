import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Chrome as Home, Film, Settings } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontFamily: 'Poppins-Medium',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          tabBarLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="watch"
        options={{
          title: 'Watch',
          tabBarIcon: ({ color, size }) => <Film size={size} color={color} />,
          tabBarLabel: 'Watch',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
          tabBarLabel: 'Settings',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});