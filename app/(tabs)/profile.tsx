import { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';
import {
  CreditCard,
  Globe,
  Bell,
  Headphones,
  Info,
  LogOut,
  ChevronRight,
  Plus,
  Check,
} from 'lucide-react-native';
import { colors } from '../../src/theme/tokens';
import { useLanguageStore } from '../../src/store/language';
import { useFadeSlideIn } from '../../src/utils/animations';
import { useT } from '../../src/i18n/useTranslation';
import ToggleSwitch from '../../src/components/ui/ToggleSwitch';

export default function ProfileScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { locale, setLocale } = useLanguageStore();
  const t = useT();
  const fadeIn = useFadeSlideIn();

  const user = {
    initial: '王',
    name: '王小明',
    phone: '+886 912-345-678',
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <Animated.View style={[{ flex: 1 }, fadeIn]}>
        {/* Profile header */}
        <LinearGradient colors={['#102a43', '#243b53', '#334e68']} className="px-6 pb-10 pt-8">
          <View className="items-center">
            {/* Avatar */}
            <View
              className="h-20 w-20 items-center justify-center rounded-full bg-amber-500/20"
              style={{ borderWidth: 4, borderColor: 'rgba(247, 201, 72, 0.3)' }}
            >
              <Text className="text-2xl font-bold text-amber-400">{user.initial}</Text>
            </View>
            {/* Name & phone */}
            <Text className="mt-4 text-xl font-bold text-white">{user.name}</Text>
            <Text className="mt-1 text-sm text-navy-300">{user.phone}</Text>
          </View>
        </LinearGradient>

        {/* Settings sections */}
        <View className="relative z-10 -mt-4 gap-4 px-5">
          {/* Payment Methods */}
          <View className="overflow-hidden rounded-2xl border border-navy-100/80 bg-white shadow-sm">
            <View className="px-5 py-4">
              <View className="flex-row items-center gap-2">
                <CreditCard size={14} strokeWidth={2.2} color={colors.navy[400]} />
                <Text className="text-xs font-semibold uppercase tracking-wider text-navy-400">
                  {t('付款方式')}
                </Text>
              </View>
            </View>

            {/* Existing card */}
            <View className="flex-row items-center gap-4 border-t border-navy-50 px-5 py-4">
              <View className="h-10 w-14 items-center justify-center rounded-lg bg-navy-900">
                <Text className="text-[10px] font-bold tracking-wider text-white">VISA</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-navy-900">**** **** **** 4242</Text>
                <Text className="mt-0.5 text-xs text-navy-400">{t('到期日 12/27')}</Text>
              </View>
              <View className="h-6 w-6 items-center justify-center rounded-full bg-teal-100">
                <Check size={14} strokeWidth={3} color={colors.teal[600]} />
              </View>
            </View>

            {/* Add new payment */}
            <Pressable className="flex-row items-center gap-3 border-t border-navy-50 px-5 py-4">
              <View className="h-10 w-14 items-center justify-center rounded-lg border-2 border-dashed border-navy-200">
                <Plus size={16} strokeWidth={2.5} color={colors.navy[400]} />
              </View>
              <Text className="text-sm font-medium text-amber-600">{t('新增付款方式')}</Text>
            </Pressable>
          </View>

          {/* Language setting */}
          <View className="overflow-hidden rounded-2xl border border-navy-100/80 bg-white shadow-sm">
            <View className="px-5 py-4">
              <View className="flex-row items-center gap-2">
                <Globe size={14} strokeWidth={2.2} color={colors.navy[400]} />
                <Text className="text-xs font-semibold uppercase tracking-wider text-navy-400">
                  {t('語言設定')}
                </Text>
              </View>
            </View>

            <View className="flex-row gap-3 border-t border-navy-50 px-5 py-4">
              <Pressable
                onPress={() => setLocale('zh')}
                className={`flex-1 rounded-xl py-2.5 ${
                  locale === 'zh' ? 'bg-navy-900' : 'bg-navy-50'
                }`}
              >
                <Text
                  className={`text-center text-sm font-semibold ${
                    locale === 'zh' ? 'text-white' : 'text-navy-500'
                  }`}
                >
                  {t('繁體中文')}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setLocale('en')}
                className={`flex-1 rounded-xl py-2.5 ${
                  locale === 'en' ? 'bg-navy-900' : 'bg-navy-50'
                }`}
              >
                <Text
                  className={`text-center text-sm font-semibold ${
                    locale === 'en' ? 'text-white' : 'text-navy-500'
                  }`}
                >
                  English
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Notifications */}
          <View className="overflow-hidden rounded-2xl border border-navy-100/80 bg-white shadow-sm">
            <View className="flex-row items-center justify-between px-5 py-4">
              <View className="flex-row items-center gap-3">
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-navy-50">
                  <Bell size={18} strokeWidth={2} color={colors.navy[600]} />
                </View>
                <Text className="text-[15px] font-semibold text-navy-900">{t('通知設定')}</Text>
              </View>
              <ToggleSwitch
                value={notificationsEnabled}
                onToggle={() => setNotificationsEnabled(!notificationsEnabled)}
              />
            </View>
          </View>

          {/* Links section */}
          <View className="overflow-hidden rounded-2xl border border-navy-100/80 bg-white shadow-sm">
            {/* Help Center */}
            <Pressable
              onPress={() => router.push('/help')}
              className="flex-row items-center justify-between px-5 py-4"
            >
              <View className="flex-row items-center gap-3">
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-navy-50">
                  <Headphones size={18} strokeWidth={2} color={colors.navy[600]} />
                </View>
                <Text className="text-[15px] font-semibold text-navy-900">{t('客服中心')}</Text>
              </View>
              <ChevronRight size={18} strokeWidth={2.5} color={colors.navy[300]} />
            </Pressable>

            {/* About Us */}
            <Pressable className="flex-row items-center justify-between border-t border-navy-50 px-5 py-4">
              <View className="flex-row items-center gap-3">
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-navy-50">
                  <Info size={18} strokeWidth={2} color={colors.navy[600]} />
                </View>
                <Text className="text-[15px] font-semibold text-navy-900">{t('關於我們')}</Text>
              </View>
              <ChevronRight size={18} strokeWidth={2.5} color={colors.navy[300]} />
            </Pressable>
          </View>

          {/* Sign Out */}
          <Pressable className="flex-row items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50/50 px-5 py-4">
            <LogOut size={18} strokeWidth={2.2} color="#ef4444" />
            <Text className="text-[15px] font-semibold text-red-500">{t('登出')}</Text>
          </Pressable>
        </View>

        {/* Bottom spacer for tab bar */}
        <View className="pb-28" />
      </Animated.View>
    </ScrollView>
  );
}
