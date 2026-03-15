import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { CheckCircle } from 'lucide-react-native';

import { useBookingStore } from '../../src/store/booking';
import { formatPrice, formatDate } from '../../src/utils/format';
import { colors } from '../../src/theme/tokens';
import { useFadeSlideIn, useSlideUp } from '../../src/utils/animations';
import { useT } from '../../src/i18n/useTranslation';

const confettiDots = [
  { color: 'bg-amber-400', top: 32, left: 24, size: 'h-2.5 w-2.5' },
  { color: 'bg-teal-400', top: 18, left: 80, size: 'h-2 w-2' },
  { color: 'bg-amber-300', top: 48, left: 140, size: 'h-3 w-3' },
  { color: 'bg-teal-300', top: 12, right: 100, size: 'h-2 w-2' },
  { color: 'bg-amber-500', top: 56, right: 60, size: 'h-2.5 w-2.5' },
  { color: 'bg-teal-500', top: 28, right: 30, size: 'h-2 w-2' },
  { color: 'bg-amber-200', top: 64, left: 60, size: 'h-1.5 w-1.5' },
  { color: 'bg-teal-200', top: 40, right: 140, size: 'h-1.5 w-1.5' },
];

function ConfettiDot({ dot, index }: { dot: typeof confettiDots[number]; index: number }) {
  const anim = useSlideUp(index * 80);
  return (
    <Animated.View
      className={`absolute rounded-full ${dot.color} ${dot.size}`}
      style={[
        {
          top: dot.top,
          ...(dot.left !== undefined ? { left: dot.left } : {}),
          ...(dot.right !== undefined ? { right: dot.right } : {}),
        },
        anim,
      ]}
    />
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-start justify-between py-1.5">
      <Text className="text-sm text-navy-500 w-20">{label}</Text>
      <Text className="text-sm text-navy-900 font-medium flex-1 text-right">
        {value}
      </Text>
    </View>
  );
}

export default function BookingConfirmed() {
  const router = useRouter();
  const { currentBooking } = useBookingStore();
  const t = useT();
  const fadeIn = useFadeSlideIn();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Animated.View style={[{ flex: 1 }, fadeIn]}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Confetti dots area */}
          <View className="relative h-20 mx-5 mt-4">
            {confettiDots.map((dot, i) => (
              <ConfettiDot key={i} dot={dot} index={i} />
            ))}
          </View>

          {/* Success icon + text */}
          <View className="items-center px-5 mb-8">
            <View className="h-20 w-20 rounded-full bg-teal-100 items-center justify-center mb-5">
              <CheckCircle size={44} color={colors.teal[500]} />
            </View>
            <Text className="text-2xl font-bold text-navy-900 mb-2">
              {t('預訂成功！')}
            </Text>
            <Text className="text-base text-navy-500 text-center leading-6">
              {t('您的司機將在 2 小時內確認。')}{'\n'}{t('我們會發送通知給您。')}
            </Text>
          </View>

          {/* Trip summary card */}
          {currentBooking && (
            <View className="mx-5 bg-navy-50 rounded-2xl p-5 border border-navy-100 mb-8">
              <Text className="text-lg font-semibold text-navy-900 mb-3">
                {t('行程資訊')}
              </Text>
              <View className="gap-1">
                <SummaryRow
                  label={t('服務類型')}
                  value={
                    currentBooking.tripType === 'pickup'
                      ? t('機場接機')
                      : t('送機服務')
                  }
                />
                <SummaryRow
                  label={t('機場')}
                  value={currentBooking.airport.nameZh}
                />
                <SummaryRow
                  label={t('日期')}
                  value={formatDate(currentBooking.date)}
                />
                <SummaryRow label={t('時間')} value={currentBooking.time} />
                {currentBooking.tripType === 'pickup' &&
                  currentBooking.flightNumber ? (
                  <SummaryRow
                    label={t('航班')}
                    value={currentBooking.flightNumber}
                  />
                ) : null}
                <SummaryRow label={t('地址')} value={currentBooking.address} />
                <SummaryRow
                  label={t('車型')}
                  value={currentBooking.vehicle.nameZh}
                />
                <View className="h-px bg-navy-200 my-2" />
                <View className="flex-row items-center justify-between">
                  <Text className="text-base font-bold text-navy-900">
                    {t('合計')}
                  </Text>
                  <Text className="text-lg font-bold text-amber-600">
                    {formatPrice(currentBooking.price)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Action buttons */}
          <View className="px-5 gap-3">
            <Pressable
              onPress={() => router.replace('/trips/active')}
              className="py-4 rounded-2xl items-center bg-amber-500"
            >
              <Text className="text-base font-semibold text-white">
                {t('查看行程詳情')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.replace('/')}
              className="py-4 rounded-2xl items-center border border-navy-200 bg-white"
            >
              <Text className="text-base font-semibold text-navy-700">
                {t('返回首頁')}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}
