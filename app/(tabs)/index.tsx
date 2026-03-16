import { ScrollView, View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';
import {
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  ShieldCheck,
  BadgeDollarSign,
  Radar,
  CalendarClock,
  Car,
  MapPinCheck,
} from 'lucide-react-native';
import { colors } from '../../src/theme/tokens';
import { useFadeSlideIn } from '../../src/utils/animations';
import { useT } from '../../src/i18n/useTranslation';
import { StepList } from '../../src/components/ui/StepList';

export default function LandingScreen() {
  const t = useT();
  const fadeIn = useFadeSlideIn();

  return (
    <ScrollView className="flex-1 bg-white">
      <Animated.View style={[{ flex: 1 }, fadeIn]}>
        {/* ===== HERO SECTION ===== */}
        <LinearGradient colors={['#102a43', '#243b53', '#334e68']} className="px-6 pb-8 pt-6">
          {/* Top bar: Logo */}
          <View className="flex-row items-center gap-2">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15">
              <Plane size={20} strokeWidth={2.2} color={colors.amber[400]} />
            </View>
            <Text className="text-xl font-bold tracking-tight text-white">
              Air<Text className="text-amber-400">oota</Text>
            </Text>
          </View>

          {/* Hero content */}
          <View className="mt-8 items-center">
            <Text className="text-center text-3xl font-bold leading-tight tracking-tight text-white">
              {t('機場接送，安心出發')}
            </Text>
            <Text className="mt-3 text-center text-base font-medium text-navy-200">
              {t('專業司機 · 固定價格 · 即時追蹤')}
            </Text>
          </View>
        </LinearGradient>

        {/* ===== CTA BUTTONS ===== */}
        <View className="relative z-10 -mt-1 px-6">
          <View className="flex-row gap-3">
            <Link href="/book?type=pickup" asChild>
              <Pressable className="flex-1 items-center gap-3 rounded-2xl bg-amber-500 px-4 py-5">
                <View className="h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                  <PlaneLanding size={24} strokeWidth={2} color={colors.navy[900]} />
                </View>
                <Text className="text-sm font-bold text-navy-900">{t('預約接機')}</Text>
              </Pressable>
            </Link>

            <Link href="/book?type=dropoff" asChild>
              <Pressable className="flex-1 items-center gap-3 rounded-2xl bg-amber-500 px-4 py-5">
                <View className="h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                  <PlaneTakeoff size={24} strokeWidth={2} color={colors.navy[900]} />
                </View>
                <Text className="text-sm font-bold text-navy-900">{t('預約送機')}</Text>
              </Pressable>
            </Link>
          </View>
        </View>

        {/* ===== TRUST SIGNALS ===== */}
        <View className="mt-10 px-6">
          <View className="flex-row gap-3">
            {/* Licensed Drivers */}
            <View className="flex-1 items-center gap-2.5 rounded-2xl bg-navy-50 px-3 py-5">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-teal-100">
                <ShieldCheck size={20} strokeWidth={2} color={colors.teal[600]} />
              </View>
              <Text className="text-center text-sm font-bold text-navy-900">{t('合格司機')}</Text>
              <Text className="text-center text-[11px] leading-relaxed text-navy-500">
                {t('所有司機皆持有營業執照')}
              </Text>
            </View>

            {/* Fixed Pricing */}
            <View className="flex-1 items-center gap-2.5 rounded-2xl bg-navy-50 px-3 py-5">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <BadgeDollarSign size={20} strokeWidth={2} color={colors.amber[600]} />
              </View>
              <Text className="text-center text-sm font-bold text-navy-900">{t('固定價格')}</Text>
              <Text className="text-center text-[11px] leading-relaxed text-navy-500">
                {t('預訂時確認價格，絕無加價')}
              </Text>
            </View>

            {/* Flight Tracking */}
            <View className="flex-1 items-center gap-2.5 rounded-2xl bg-navy-50 px-3 py-5">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-navy-100">
                <Radar size={20} strokeWidth={2} color={colors.navy[600]} />
              </View>
              <Text className="text-center text-sm font-bold text-navy-900">{t('航班追蹤')}</Text>
              <Text className="text-center text-[11px] leading-relaxed text-navy-500">
                {t('即時監控航班，自動調整接機時間')}
              </Text>
            </View>
          </View>
        </View>

        {/* ===== HOW IT WORKS ===== */}
        <View className="mt-10 px-6">
          <Text className="mb-6 text-center text-lg font-bold text-navy-900">{t('如何預約')}</Text>

          <StepList
            circleSize={36}
            gap={20}
            spacing={32}
            items={[
              <View className="pt-1">
                <View className="flex-row items-center gap-2">
                  <CalendarClock size={18} strokeWidth={2} color={colors.teal[600]} />
                  <Text className="text-sm font-bold text-navy-900">{t('選擇機場與時間')}</Text>
                </View>
                <Text className="mt-1 text-xs text-navy-500">{t('輸入航班資訊與乘車時間')}</Text>
              </View>,
              <View className="pt-1">
                <View className="flex-row items-center gap-2">
                  <Car size={18} strokeWidth={2} color={colors.teal[600]} />
                  <Text className="text-sm font-bold text-navy-900">{t('確認車型與價格')}</Text>
                </View>
                <Text className="mt-1 text-xs text-navy-500">
                  {t('選擇適合的車型，價格透明')}
                </Text>
              </View>,
              <View className="pt-1">
                <View className="flex-row items-center gap-2">
                  <MapPinCheck size={18} strokeWidth={2} color={colors.teal[600]} />
                  <Text className="text-sm font-bold text-navy-900">{t('安心出發')}</Text>
                </View>
                <Text className="mt-1 text-xs text-navy-500">
                  {t('司機準時抵達，享受舒適旅程')}
                </Text>
              </View>,
            ]}
          />
        </View>

        {/* Bottom spacer for floating tab bar */}
        <View className="pb-24" />
      </Animated.View>
    </ScrollView>
  );
}
