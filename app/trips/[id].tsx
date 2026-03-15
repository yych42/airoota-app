import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Plane,
  Clock,
  MapPin,
  Calendar,
  Star,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  AlertCircle,
  Receipt,
  BookOpen,
} from 'lucide-react-native';
import { useBookingStore } from '../../src/store/booking';
import { airportGuides } from '../../src/data/airports';
import { formatDateFull, stateLabel, stateColor, formatPrice } from '../../src/utils/format';
import { useFadeSlideIn } from '../../src/utils/animations';
import { useT } from '../../src/i18n/useTranslation';
import { useLanguageStore } from '../../src/store/language';
import { colors } from '../../src/theme/tokens';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { upcomingBookings, pastBookings } = useBookingStore();
  const t = useT();
  const fadeIn = useFadeSlideIn();
  const { locale } = useLanguageStore();

  const [guideOpen, setGuideOpen] = useState(false);
  const [arrivalOpen, setArrivalOpen] = useState(false);

  const allBookings = [...upcomingBookings, ...pastBookings];
  const booking = allBookings.find((b) => b.id === id);

  if (!booking) {
    return (
      <View className="flex-1 bg-white">
        <View
          className="flex-row items-center px-5 pb-3"
          style={{ paddingTop: insets.top + 8 }}
        >
          <Pressable onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={22} color={colors.navy[800]} />
          </Pressable>
          <Text className="text-lg font-semibold text-navy-900">{t('行程詳情')}</Text>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-navy-50">
            <Plane size={28} color={colors.navy[300]} />
          </View>
          <Text className="text-lg font-semibold text-navy-700">{t('找不到此行程')}</Text>
          <Text className="mt-2 text-center text-sm text-navy-400">
            {t('此行程可能已被刪除或不存在')}
          </Text>
          <Pressable className="mt-6" onPress={() => router.back()}>
            <View className="rounded-xl bg-navy-900 px-6 py-3">
              <Text className="text-sm font-medium text-white">{t('返回')}</Text>
            </View>
          </Pressable>
        </View>
      </View>
    );
  }

  const isCompleted = booking.state === 'completed';
  const isUpcoming = upcomingBookings.some((b) => b.id === id);
  const guide = airportGuides[booking.airport.code.toLowerCase()];
  const sc = stateColor(booking.state);

  return (
    <View className="flex-1 bg-navy-50">
      {/* Sticky header */}
      <View
        className="z-10 border-b border-navy-100 bg-white px-5 pb-3"
        style={{ paddingTop: insets.top + 8 }}
      >
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={22} color={colors.navy[800]} />
          </Pressable>
          <Text className="flex-1 text-lg font-semibold text-navy-900">{t('行程詳情')}</Text>
          <View className={`rounded-full px-2.5 py-1 ${sc.bg}`}>
            <Text className={`text-xs font-medium ${sc.text}`}>
              {stateLabel(booking.state, locale)}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}
      >
        <Animated.View style={fadeIn}>
          <View className="px-5 pt-5">
          {/* Trip type badge */}
          <View className="mb-4 flex-row">
            <View className={`rounded-full px-3 py-1 ${isUpcoming ? 'bg-amber-100' : 'bg-navy-100'}`}>
              <Text className={`text-xs font-medium ${isUpcoming ? 'text-amber-700' : 'text-navy-600'}`}>
                {isUpcoming ? t('即將到來') : t('已完成')}
              </Text>
            </View>
          </View>

          {/* Trip summary - airport code + destination */}
          <View className="mb-6 items-center rounded-2xl bg-white p-6">
            <View className="flex-row items-center">
              <Text className="text-3xl font-bold text-navy-900">
                {booking.airport.code}
              </Text>
              <View className="mx-4 flex-row items-center">
                <View className="h-px w-6 bg-navy-200" />
                <Plane size={18} color={colors.navy[400]} />
                <View className="h-px w-6 bg-navy-200" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-navy-500">{t('目的地')}</Text>
                <Text className="text-base font-semibold text-navy-800" numberOfLines={1}>
                  {booking.address}
                </Text>
              </View>
            </View>
          </View>

          {/* Date / Time / Price grid */}
          <View className="mb-5 flex-row gap-3">
            <View className="flex-1 items-center rounded-xl bg-white p-3">
              <Calendar size={16} color={colors.navy[400]} />
              <Text className="mt-1.5 text-[10px] text-navy-400">{t('日期')}</Text>
              <Text className="mt-0.5 text-sm font-semibold text-navy-800">
                {booking.date}
              </Text>
            </View>
            <View className="flex-1 items-center rounded-xl bg-white p-3">
              <Clock size={16} color={colors.navy[400]} />
              <Text className="mt-1.5 text-[10px] text-navy-400">{t('時間')}</Text>
              <Text className="mt-0.5 text-sm font-semibold text-navy-800">
                {booking.time}
              </Text>
            </View>
            <View className="flex-1 items-center rounded-xl bg-white p-3">
              <Receipt size={16} color={colors.navy[400]} />
              <Text className="mt-1.5 text-[10px] text-navy-400">費用</Text>
              <Text className="mt-0.5 text-sm font-semibold text-navy-800">
                ${booking.price}
              </Text>
            </View>
          </View>

          {/* Driver card */}
          {booking.driver && (
            <View className="mb-4 rounded-xl bg-white p-4">
              <Text className="mb-3 text-sm font-semibold text-navy-800">{t('您的司機')}</Text>
              <View className="flex-row items-center">
                <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-navy-800">
                  <Text className="text-base font-bold text-white">
                    {booking.driver.name.charAt(0)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-navy-800">
                    {booking.driver.name}
                  </Text>
                  <View className="mt-0.5 flex-row items-center">
                    <Star size={12} color={colors.amber[500]} />
                    <Text className="ml-1 text-sm text-navy-600">
                      {booking.driver.rating}
                    </Text>
                    <Text className="ml-2 text-xs text-navy-400">
                      {booking.driver.vehicle} {booking.driver.vehicleColor}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Airport guide accordion - for pickup trips */}
          {booking.tripType === 'pickup' && guide && (
            <View className="mb-3 rounded-xl bg-white">
              <Pressable onPress={() => setGuideOpen(!guideOpen)}>
                <View className="flex-row items-center justify-between p-4">
                  <View className="flex-row items-center">
                    <BookOpen size={16} color={colors.teal[600]} />
                    <Text className="ml-2 text-sm font-semibold text-navy-800">
                      {guide.name} {t('接機指南')}
                    </Text>
                  </View>
                  {guideOpen ? (
                    <ChevronUp size={18} color={colors.navy[400]} />
                  ) : (
                    <ChevronDown size={18} color={colors.navy[400]} />
                  )}
                </View>
              </Pressable>
              {guideOpen && (
                <View className="border-t border-navy-100 px-4 pb-4 pt-3">
                  {guide.steps.map((step, i) => (
                    <View key={i} className="mb-3 flex-row">
                      <View className="mr-3 mt-0.5 h-6 w-6 items-center justify-center rounded-full bg-teal-100">
                        <Text className="text-xs font-bold text-teal-700">{i + 1}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-navy-800">
                          {step.title}
                        </Text>
                        <Text className="mt-0.5 text-xs text-navy-400">{step.desc}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Arrival notes accordion - for pickup trips */}
          {booking.tripType === 'pickup' && guide && (
            <View className="mb-4 rounded-xl bg-white">
              <Pressable onPress={() => setArrivalOpen(!arrivalOpen)}>
                <View className="flex-row items-center justify-between p-4">
                  <View className="flex-row items-center">
                    <AlertCircle size={16} color={colors.amber[500]} />
                    <Text className="ml-2 text-sm font-semibold text-navy-800">
                      {t('抵達資訊')}
                    </Text>
                  </View>
                  {arrivalOpen ? (
                    <ChevronUp size={18} color={colors.navy[400]} />
                  ) : (
                    <ChevronDown size={18} color={colors.navy[400]} />
                  )}
                </View>
              </Pressable>
              {arrivalOpen && (
                <View className="border-t border-navy-100 px-4 pb-4 pt-3">
                  {guide.arrivalNotes.map((note, i) => (
                    <View key={i} className="mb-2 flex-row items-start">
                      <View className="mr-2 mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400" />
                      <Text className="flex-1 text-sm text-navy-600">{note.text}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Route summary */}
          <View className="mb-4 rounded-xl bg-white p-4">
            <Text className="mb-3 text-sm font-semibold text-navy-800">{t('路線')}</Text>
            <View className="flex-row">
              {/* Vertical line */}
              <View className="mr-3 items-center" style={{ width: 20 }}>
                <View className="h-3 w-3 rounded-full bg-teal-500" />
                <View className="w-0.5 flex-1 bg-navy-200" />
                <View className="h-3 w-3 rounded-full bg-amber-500" />
              </View>
              <View className="flex-1">
                <View className="mb-6">
                  <Text className="text-xs text-navy-400">
                    {booking.tripType === 'pickup' ? t('接機地點') : t('出發地')}
                  </Text>
                  <Text className="mt-0.5 text-sm font-medium text-navy-800">
                    {booking.tripType === 'pickup'
                      ? booking.airport.nameZh
                      : booking.address}
                  </Text>
                </View>
                <View>
                  <Text className="text-xs text-navy-400">
                    {booking.tripType === 'pickup' ? t('目的地') : t('機場')}
                  </Text>
                  <Text className="mt-0.5 text-sm font-medium text-navy-800">
                    {booking.tripType === 'pickup'
                      ? booking.address
                      : booking.airport.nameZh}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Receipt section - only for completed */}
          {isCompleted && (
            <View className="mb-4 rounded-xl bg-white p-4">
              <View className="mb-3 flex-row items-center">
                <Receipt size={16} color={colors.navy[600]} />
                <Text className="ml-2 text-sm font-semibold text-navy-800">{t('收據明細')}</Text>
              </View>
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-sm text-navy-500">{t('基本車資')}</Text>
                <Text className="text-sm font-medium text-navy-700">
                  {formatPrice(booking.price - 150)}
                </Text>
              </View>
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-sm text-navy-500">{t('過路費')}</Text>
                <Text className="text-sm font-medium text-navy-700">
                  {formatPrice(100)}
                </Text>
              </View>
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-sm text-navy-500">{t('服務費')}</Text>
                <Text className="text-sm font-medium text-navy-700">
                  {formatPrice(50)}
                </Text>
              </View>
              <View className="border-t border-navy-100 pt-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-base font-semibold text-navy-800">{t('合計')}</Text>
                  <Text className="text-base font-bold text-navy-900">
                    {formatPrice(booking.price)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* CTA button */}
          <Pressable
            onPress={() => {
              if (isUpcoming) {
                // Modify trip
              } else {
                router.push('/book');
              }
            }}
          >
            <View className="items-center rounded-xl bg-amber-500 py-3.5">
              <Text className="text-sm font-semibold text-navy-900">
                {isUpcoming ? t('修改行程') : t('預訂類似行程')}
              </Text>
            </View>
          </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
