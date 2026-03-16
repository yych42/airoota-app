import { Tabs } from 'expo-router';
import { Home, CalendarDays, User } from 'lucide-react-native';
import { useT } from '../../src/i18n/useTranslation';
import TabBar from '../../src/components/ui/TabBar';

export default function TabLayout() {
  const t = useT();

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('首頁'),
          tabBarIcon: ({ color, size, focused }) => (
            <Home size={size} strokeWidth={focused ? 2.5 : 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: t('我的行程'),
          tabBarIcon: ({ color, size, focused }) => (
            <CalendarDays size={size} strokeWidth={focused ? 2.5 : 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('個人資料'),
          tabBarIcon: ({ color, size, focused }) => (
            <User size={size} strokeWidth={focused ? 2.5 : 2} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
