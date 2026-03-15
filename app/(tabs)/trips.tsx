import { View, Text, ScrollView, Pressable } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { Plane, ChevronRight, Clock, MapPin, BookOpen } from 'lucide-react-native';
import { useBookingStore, defaultActiveBooking } from '../../src/store/booking';
import { formatDateParts, truncateAddress, daysLabel, stateLabel, stateColor } from '../../src/utils/format';
import { colors } from '../../src/theme/tokens';
import { useFadeSlideIn } from '../../src/utils/animations';
import { useT } from '../../src/i18n/useTranslation';
import { useLanguageStore } from '../../src/store/language';

export default function TripsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentBooking, upcomingBookings, pastBookings } = useBookingStore();
  const activeBooking = currentBooking ?? defaultActiveBooking;
  const t = useT();
  const fadeIn = useFadeSlideIn();
  const { locale } = useLanguageStore();

  const hasActive = !!activeBooking;
  const hasUpcoming = upcomingBookings.length > 0;
  const hasPast = pastBookings.length > 0;
  const isEmpty = !hasActive && !hasUpcoming && !hasPast;

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}
    >
      <Animated.View style={[{ flex: 1 }, fadeIn]}>
        {/* Header */}
        <View
          className="px-5 pb-4"
          style={{ paddingTop: insets.top + 16 }}
        >
          <Text className="text-2xl font-bold text-navy-900">{t('我的行程')}</Text>
        </View>

        {isEmpty ? (
          <View className="flex-1 items-center justify-center px-8 py-24">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-navy-50">
              <Plane size={28} color={colors.navy[300]} />
            </View>
            <Text className="text-center text-lg font-semibold text-navy-700">
              {t('還沒有行程')}
            </Text>
            <Text className="mt-2 text-center text-sm text-navy-400">
              {t('預訂您的第一趟機場接送，行程資訊將會顯示在這裡')}
            </Text>
          </View>
        ) : (
          <View className="px-5">
            {/* Active Trip Card */}
            {hasActive && (
              <Link href="/trips/active" asChild>
                <Pressable>
                  <View className="mb-6 overflow-hidden rounded-2xl bg-navy-900 p-5">
                    {/* Top row: pulse dot + label */}
                    <View className="mb-3 flex-row items-center">
                      <View className="mr-2 h-2.5 w-2.5 rounded-full bg-teal-400" />
                      <Text className="text-xs font-medium text-teal-300">
                        {stateLabel(activeBooking.state, locale)}
                      </Text>
                      <View className="flex-1" />
                      <ChevronRight size={18} color={colors.navy[300]} />
                    </View>

                    {/* Route */}
                    <View className="mb-3 flex-row items-center">
                      <Text className="text-xl font-bold text-white">
                        {activeBooking.airport.code}
                      </Text>
                      <View className="mx-3 flex-row items-center">
                        <View className="h-px w-4 bg-navy-500" />
                        <Plane size={14} color={colors.navy[400]} />
                        <View className="h-px w-4 bg-navy-500" />
                      </View>
                      <Text className="flex-1 text-base text-navy-200" numberOfLines={1}>
                        {truncateAddress(activeBooking.address)}
                      </Text>
                    </View>

                    {/* Date / Time */}
                    <View className="flex-row items-center">
                      <Clock size={13} color={colors.navy[400]} />
                      <Text className="ml-1.5 text-sm text-navy-300">
                        {activeBooking.date} {activeBooking.time}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              </Link>
            )}

            {/* Upcoming Trips */}
            {hasUpcoming && (
              <View className="mb-6">
                <Text className="mb-3 text-base font-semibold text-navy-700">
                  {t('即將到來')}
                </Text>
                {upcomingBookings.map((booking) => {
                  const { month, day } = formatDateParts(booking.date, locale);
                  const sc = stateColor(booking.state);
                  return (
                    <Link key={booking.id} href={`/trips/${booking.id}`} asChild>
                      <Pressable>
                        <View className="mb-3 rounded-xl border border-navy-100 bg-white p-4">
                          <View className="flex-row">
                            {/* Date badge */}
                            <View className="mr-4 h-14 w-14 items-center justify-center rounded-xl bg-navy-50">
                              <Text className="text-xs text-navy-400">{month}</Text>
                              <Text className="text-lg font-bold text-navy-800">{day}</Text>
                            </View>

                            {/* Trip info */}
                            <View className="flex-1">
                              <View className="mb-1 flex-row items-center">
                                <Text className="text-base font-semibold text-navy-800">
                                  {booking.airport.code}
                                </Text>
                                <Text className="mx-1.5 text-navy-300">
                                  {booking.tripType === 'pickup' ? '→' : '←'}
                                </Text>
                                <Text className="flex-1 text-sm text-navy-500" numberOfLines={1}>
                                  {truncateAddress(booking.address, 12)}
                                </Text>
                              </View>

                              <View className="mb-1.5 flex-row items-center">
                                <Clock size={12} color={colors.navy[400]} />
                                <Text className="ml-1 text-sm text-navy-400">
                                  {booking.time}
                                </Text>
                                <Text className="ml-3 text-sm text-amber-600">
                                  {daysLabel(booking.date, locale)}
                                </Text>
                              </View>

                              {booking.driver && (
                                <View className="flex-row items-center">
                                  <View className="mr-1.5 h-4 w-4 items-center justify-center rounded-full bg-navy-200">
                                    <Text className="text-[8px] font-bold text-navy-700">
                                      {booking.driver.name.charAt(0)}
                                    </Text>
                                  </View>
                                  <Text className="text-xs text-navy-500">
                                    {booking.driver.name}
                                  </Text>
                                </View>
                              )}
                            </View>

                            {/* State badge + chevron */}
                            <View className="items-end justify-between">
                              <View className={`rounded-full px-2 py-0.5 ${sc.bg}`}>
                                <Text className={`text-xs font-medium ${sc.text}`}>
                                  {stateLabel(booking.state, locale)}
                                </Text>
                              </View>
                              <ChevronRight size={16} color={colors.navy[300]} />
                            </View>
                          </View>

                          {/* Airport guide link */}
                          {booking.tripType === 'pickup' && (
                            <Pressable
                              onPress={(e) => {
                                e.stopPropagation();
                                router.push(`/guides/${booking.airport.code.toLowerCase()}`);
                              }}
                            >
                              <View className="mt-3 flex-row items-center rounded-lg bg-teal-50 px-3 py-2">
                                <BookOpen size={14} color={colors.teal[600]} />
                                <Text className="ml-2 flex-1 text-xs font-medium text-teal-700">
                                  {booking.airport.nameZh} {t('接機指南')}
                                </Text>
                                <ChevronRight size={14} color={colors.teal[500]} />
                              </View>
                            </Pressable>
                          )}
                        </View>
                      </Pressable>
                    </Link>
                  );
                })}
              </View>
            )}

            {/* Past Trips */}
            {hasPast && (
              <View>
                <Text className="mb-3 text-base font-semibold text-navy-700">
                  {t('過去行程')}
                </Text>
                {pastBookings.map((booking) => {
                  const { month, day } = formatDateParts(booking.date, locale);
                  return (
                    <Link key={booking.id} href={`/trips/${booking.id}`} asChild>
                      <Pressable>
                        <View className="mb-3 rounded-xl border border-navy-100 bg-white p-4">
                          <View className="flex-row items-center">
                            {/* Date badge */}
                            <View className="mr-4 h-12 w-12 items-center justify-center rounded-lg bg-navy-50">
                              <Text className="text-[10px] text-navy-400">{month}</Text>
                              <Text className="text-base font-bold text-navy-600">{day}</Text>
                            </View>

                            {/* Trip info */}
                            <View className="flex-1">
                              <View className="mb-0.5 flex-row items-center">
                                <Text className="text-sm font-semibold text-navy-700">
                                  {booking.airport.code}
                                </Text>
                                <Text className="mx-1.5 text-navy-300">
                                  {booking.tripType === 'pickup' ? '→' : '←'}
                                </Text>
                                <Text className="flex-1 text-sm text-navy-500" numberOfLines={1}>
                                  {truncateAddress(booking.address, 12)}
                                </Text>
                              </View>
                              <Text className="text-xs text-navy-400">
                                {booking.time} {'  '}
                                TWD {booking.price.toLocaleString()}
                              </Text>
                            </View>

                            <ChevronRight size={16} color={colors.navy[300]} />
                          </View>
                        </View>
                      </Pressable>
                    </Link>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}
