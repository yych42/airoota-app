import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Home, CalendarDays, User } from 'lucide-react-native';
import { colors } from '../../src/theme/tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useT } from '../../src/i18n/useTranslation';

function TabIcon({ icon: Icon, focused }: { icon: typeof Home; focused: boolean }) {
  return (
    <View className="items-center justify-center">
      {focused && (
        <View className="absolute rounded-full bg-amber-50" style={{ top: -8, bottom: -8, left: -8, right: -8 }} />
      )}
      <Icon
        size={22}
        strokeWidth={focused ? 2.5 : 2}
        color={focused ? colors.amber[500] : colors.navy[400]}
      />
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const t = useT();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderTopWidth: 1,
          borderTopColor: colors.navy[100],
          paddingBottom: insets.bottom,
          paddingTop: 4,
          height: 56 + insets.bottom,
        },
        tabBarActiveTintColor: colors.amber[500],
        tabBarInactiveTintColor: colors.navy[400],
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('首頁'),
          tabBarIcon: ({ focused }) => <TabIcon icon={Home} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: t('我的行程'),
          tabBarIcon: ({ focused }) => <TabIcon icon={CalendarDays} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('個人資料'),
          tabBarIcon: ({ focused }) => <TabIcon icon={User} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
