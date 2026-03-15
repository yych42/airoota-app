import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Plane,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Star,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Navigation,
  Headphones,
} from 'lucide-react-native';
import { defaultActiveBooking, mockDriver, useBookingStore } from '../../src/store/booking';
import { airportGuides, airportCoords } from '../../src/data/airports';
import { driverPos, destPos } from '../../src/data/mock';
import { colors } from '../../src/theme/tokens';
import { usePulseRing, usePulseDot, useSearchingDots } from '../../src/utils/animations';
import LiveMap from '../../src/components/maps/LiveMap';
import { useT } from '../../src/i18n/useTranslation';
import { useLanguageStore } from '../../src/store/language';
import type { BookingState } from '../../src/types/booking';

type DemoState = 'pending' | 'assigned' | 'en-route' | 'in-progress' | 'completed';

const demoStates: { key: DemoState; label: string }[] = [
  { key: 'pending', label: '等待配對' },
  { key: 'assigned', label: '已配對' },
  { key: 'en-route', label: '司機出發' },
  { key: 'in-progress', label: '行程中' },
  { key: 'completed', label: '已完成' },
];

const tipOptions = [50, 100, 200];

export default function ActiveTripScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentBooking } = useBookingStore();
  const booking = currentBooking ?? defaultActiveBooking;
  const guide = airportGuides[booking.airport.code.toLowerCase()];
  const t = useT();
  const { locale } = useLanguageStore();

  const [activeState, setActiveState] = useState<DemoState>('pending');
  const [guideOpen, setGuideOpen] = useState(false);
  const [arrivalOpen, setArrivalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [customTip, setCustomTip] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Animation hooks
  const pulseRingStyle = usePulseRing();
  const pulseDotStyle = usePulseDot();
  const [dot1Style, dot2Style, dot3Style] = useSearchingDots();

  const handleSubmit = () => {
    setSubmitted(true);
  };

  // Airport guide accordion component
  const AirportGuideAccordion = () => {
    if (!guide) return null;
    return (
      <View className="mt-4 rounded-xl border border-navy-100 bg-white">
        <Pressable onPress={() => setGuideOpen(!guideOpen)}>
          <View className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <MapPin size={16} color={colors.teal[600]} />
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
                  <Text className="text-sm font-medium text-navy-800">{step.title}</Text>
                  <Text className="mt-0.5 text-xs text-navy-400">{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  // Arrival notes accordion
  const ArrivalNotesAccordion = () => {
    if (!guide) return null;
    return (
      <View className="mt-3 rounded-xl border border-navy-100 bg-white">
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
    );
  };

  // Trip summary card
  const TripSummaryCard = () => (
    <View className="rounded-xl border border-navy-100 bg-white p-4">
      <View className="mb-3 flex-row items-center">
        <Plane size={16} color={colors.navy[600]} />
        <Text className="ml-2 text-sm font-semibold text-navy-800">{t('行程摘要')}</Text>
      </View>
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-xs text-navy-400">{t('航班')}</Text>
        <Text className="text-sm font-medium text-navy-700">{booking.flightNumber}</Text>
      </View>
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-xs text-navy-400">{t('日期')}</Text>
        <Text className="text-sm font-medium text-navy-700">{booking.date}</Text>
      </View>
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-xs text-navy-400">{t('時間')}</Text>
        <Text className="text-sm font-medium text-navy-700">{booking.time}</Text>
      </View>
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-xs text-navy-400">
          {booking.tripType === 'pickup' ? t('機場') : t('出發地')}
        </Text>
        <Text className="text-sm font-medium text-navy-700">{booking.airport.nameZh}</Text>
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-navy-400">
          {booking.tripType === 'pickup' ? t('目的地') : t('機場')}
        </Text>
        <Text className="flex-1 text-right text-sm font-medium text-navy-700" numberOfLines={1}>
          {booking.address}
        </Text>
      </View>
    </View>
  );

  // Driver card
  const DriverCard = ({ compact = false }: { compact?: boolean }) => {
    const driver = mockDriver;
    if (compact) {
      return (
        <View className="rounded-xl border border-navy-100 bg-white p-3">
          <View className="flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-navy-800">
              <Text className="text-sm font-bold text-white">{driver.name.charAt(0)}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-navy-800">{driver.name}</Text>
              <Text className="text-xs text-navy-400">
                {driver.vehicle} {driver.vehicleColor} {driver.plateNumber}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Star size={12} color={colors.amber[500]} />
              <Text className="ml-1 text-sm font-medium text-navy-700">{driver.rating}</Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View className="rounded-xl border border-navy-100 bg-white p-4">
        <View className="mb-3 flex-row items-center">
          <View className="mr-4 h-14 w-14 items-center justify-center rounded-full bg-navy-800">
            <Text className="text-lg font-bold text-white">{driver.name.charAt(0)}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-navy-800">{driver.name}</Text>
            <View className="mt-1 flex-row items-center">
              <Star size={13} color={colors.amber[500]} />
              <Text className="ml-1 text-sm text-navy-600">{driver.rating}</Text>
              <Text className="ml-2 text-xs text-navy-400">{driver.trips} {t('趟行程')}</Text>
            </View>
            <Text className="mt-1 text-xs text-navy-400">
              {driver.vehicle} {driver.vehicleColor} {driver.plateNumber}
            </Text>
          </View>
        </View>
        {/* Call / message buttons */}
        <View className="flex-row gap-3">
          <Pressable className="flex-1">
            <View className="flex-row items-center justify-center rounded-lg border border-navy-200 py-2.5">
              <Phone size={16} color={colors.navy[600]} />
              <Text className="ml-2 text-sm font-medium text-navy-700">{t('撥打電話')}</Text>
            </View>
          </Pressable>
          <Pressable className="flex-1">
            <View className="flex-row items-center justify-center rounded-lg border border-navy-200 py-2.5">
              <MessageCircle size={16} color={colors.navy[600]} />
              <Text className="ml-2 text-sm font-medium text-navy-700">{t('傳送訊息')}</Text>
            </View>
          </Pressable>
        </View>
      </View>
    );
  };

  // Flight status card
  const FlightStatusCard = () => (
    <View className="mt-4 rounded-xl border border-teal-200 bg-teal-50 p-4">
      <View className="mb-2 flex-row items-center">
        <Plane size={16} color={colors.teal[600]} />
        <Text className="ml-2 text-sm font-semibold text-teal-800">{t('航班狀態')}</Text>
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-teal-600">{t('航班')} {booking.flightNumber}</Text>
        <View className="rounded-full bg-teal-100 px-2 py-0.5">
          <Text className="text-xs font-medium text-teal-700">{t('準時')}</Text>
        </View>
      </View>
      <Text className="mt-1 text-xs text-teal-600">
        {t('預計抵達時間：')}{booking.time}
      </Text>
    </View>
  );

  // Render state-specific content
  const renderContent = () => {
    switch (activeState) {
      case 'pending':
        return (
          <View className="px-5">
            {/* Animated pulsing search indicator */}
            <View className="mb-6 items-center py-8">
              <View style={{ width: 96, height: 96, alignItems: 'center', justifyContent: 'center' }}>
                {/* Pulse ring (outer) */}
                <Animated.View
                  style={[
                    {
                      position: 'absolute',
                      width: 96,
                      height: 96,
                      borderRadius: 48,
                      backgroundColor: colors.navy[200],
                    },
                    pulseRingStyle,
                  ]}
                />
                {/* Pulsing dot (inner) */}
                <Animated.View
                  style={[
                    {
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: colors.navy[900],
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                    pulseDotStyle,
                  ]}
                >
                  <Navigation size={20} color={colors.white} />
                </Animated.View>
              </View>
              <Text className="mt-4 text-lg font-semibold text-navy-800">
                {t('正在為您配對最佳司機')}
              </Text>
              {/* Searching dots */}
              <View style={{ flexDirection: 'row', marginTop: 12, gap: 6 }}>
                <Animated.View
                  style={[
                    {
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: colors.navy[400],
                    },
                    dot1Style,
                  ]}
                />
                <Animated.View
                  style={[
                    {
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: colors.navy[400],
                    },
                    dot2Style,
                  ]}
                />
                <Animated.View
                  style={[
                    {
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: colors.navy[400],
                    },
                    dot3Style,
                  ]}
                />
              </View>
              <Text className="mt-3 text-center text-sm text-navy-400">
                {t('通常需要 1-3 分鐘，請稍候')}
              </Text>
            </View>

            <TripSummaryCard />
            <AirportGuideAccordion />
            <ArrivalNotesAccordion />
          </View>
        );

      case 'assigned':
        return (
          <View className="px-5">
            {/* Success banner */}
            <View className="mb-4 flex-row items-center rounded-xl bg-teal-50 p-4">
              <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-teal-500">
                <Check size={16} color={colors.white} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-teal-800">{t('已成功配對司機')}</Text>
                <Text className="text-xs text-teal-600">{t('司機將於預定時間前往接您')}</Text>
              </View>
            </View>

            <DriverCard />
            <FlightStatusCard />
            <AirportGuideAccordion />
            <View className="mt-4">
              <TripSummaryCard />
            </View>
            <ArrivalNotesAccordion />
          </View>
        );

      case 'en-route':
        return (
          <View className="px-5">
            {/* Live Map */}
            <View className="mb-4 overflow-hidden rounded-2xl" style={{ height: 224 }}>
              <LiveMap
                driverLat={driverPos[0]}
                driverLng={driverPos[1]}
                destLat={airportCoords[booking.airport.code]?.[0] ?? destPos[0]}
                destLng={airportCoords[booking.airport.code]?.[1] ?? destPos[1]}
                driverLabel={mockDriver.name}
                destLabel={booking.airport.nameZh}
                routeColor={colors.teal[500]}
                driverProgress={0.3}
              />
            </View>

            {/* ETA overlay */}
            <View className="mb-4 rounded-xl bg-navy-900 p-4">
              <Text className="text-center text-xs text-navy-300">{t('預計抵達')}</Text>
              <Text className="text-center text-xl font-bold text-white">{t('12 分鐘')}</Text>
            </View>

            {/* Floating action buttons */}
            <View className="mb-4 flex-row justify-center gap-4">
              <Pressable>
                <View className="h-12 w-12 items-center justify-center rounded-full bg-navy-800">
                  <MessageCircle size={20} color={colors.white} />
                </View>
              </Pressable>
              <Pressable>
                <View className="h-12 w-12 items-center justify-center rounded-full bg-teal-500">
                  <Phone size={20} color={colors.white} />
                </View>
              </Pressable>
            </View>

            <DriverCard compact />
            <AirportGuideAccordion />
            <ArrivalNotesAccordion />
          </View>
        );

      case 'in-progress':
        return (
          <View className="px-5">
            {/* Live Map */}
            <View className="mb-4 overflow-hidden rounded-2xl" style={{ height: 224 }}>
              <LiveMap
                driverLat={driverPos[0]}
                driverLng={driverPos[1]}
                destLat={destPos[0]}
                destLng={destPos[1]}
                driverLabel={mockDriver.name}
                destLabel={t('目的地')}
                routeColor={colors.amber[500]}
                driverProgress={0.55}
              />
            </View>

            {/* ETA overlay */}
            <View className="mb-4 rounded-xl bg-navy-900 p-4">
              <Text className="text-center text-xs text-navy-300">{t('預計')}</Text>
              <Text className="text-center text-xl font-bold text-white">
                {t('35 分鐘 抵達目的地')}
              </Text>
            </View>

            <DriverCard compact />

            {/* Support button */}
            <Pressable className="mt-4">
              <View className="flex-row items-center justify-center rounded-xl border border-navy-200 py-3">
                <Headphones size={16} color={colors.navy[600]} />
                <Text className="ml-2 text-sm font-medium text-navy-700">{t('聯繫客服')}</Text>
              </View>
            </Pressable>
          </View>
        );

      case 'completed':
        if (submitted) {
          return (
            <View className="items-center px-5 py-16">
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-teal-100">
                <Check size={28} color={colors.teal[600]} />
              </View>
              <Text className="text-xl font-bold text-navy-900">{t('感謝您的評價！')}</Text>
              <Text className="mt-2 text-center text-sm text-navy-400">
                {t('您的回饋幫助我們持續改善服務品質')}
              </Text>
              <Pressable className="mt-8" onPress={() => router.push('/book')}>
                <View className="rounded-xl bg-amber-500 px-8 py-3">
                  <Text className="text-sm font-semibold text-navy-900">{t('預訂回程？')}</Text>
                </View>
              </Pressable>
            </View>
          );
        }

        return (
          <View className="px-5">
            {/* Success checkmark */}
            <View className="mb-6 items-center py-6">
              <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-teal-100">
                <Check size={28} color={colors.teal[600]} />
              </View>
              <Text className="text-lg font-bold text-navy-900">{t('行程已完成')}</Text>
              <Text className="mt-1 text-sm text-navy-400">{t('感謝您選擇 Airoota')}</Text>
            </View>

            <TripSummaryCard />

            {/* Rating section */}
            <View className="mt-4 rounded-xl border border-navy-100 bg-white p-4">
              <Text className="mb-3 text-sm font-semibold text-navy-800">{t('評價此次行程')}</Text>
              <View className="mb-4 flex-row justify-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Pressable key={s} onPress={() => setRating(s)}>
                    <Star
                      size={32}
                      color={s <= rating ? colors.amber[500] : colors.navy[200]}
                      fill={s <= rating ? colors.amber[500] : 'transparent'}
                    />
                  </Pressable>
                ))}
              </View>

              {/* Comment */}
              <TextInput
                className="mb-4 rounded-lg border border-navy-200 px-3 py-2.5 text-sm text-navy-800"
                placeholder={t('分享您的搭乘體驗（選填）')}
                placeholderTextColor={colors.navy[300]}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                value={comment}
                onChangeText={setComment}
                style={{ minHeight: 80 }}
              />

              {/* Tip selection */}
              <Text className="mb-2 text-sm font-semibold text-navy-800">{t('給司機小費')}</Text>
              <View className="mb-4 flex-row gap-2">
                {tipOptions.map((amount) => (
                  <Pressable
                    key={amount}
                    onPress={() => {
                      setSelectedTip(amount);
                      setCustomTip('');
                    }}
                    className="flex-1"
                  >
                    <View
                      className={`items-center rounded-lg border py-2.5 ${
                        selectedTip === amount
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-navy-200'
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          selectedTip === amount ? 'text-amber-700' : 'text-navy-600'
                        }`}
                      >
                        ${amount}
                      </Text>
                    </View>
                  </Pressable>
                ))}
                <View className="flex-1">
                  <TextInput
                    className={`rounded-lg border px-2 py-2.5 text-center text-sm ${
                      customTip ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-navy-200 text-navy-600'
                    }`}
                    placeholder={t('自訂')}
                    placeholderTextColor={colors.navy[300]}
                    keyboardType="numeric"
                    value={customTip}
                    onChangeText={(v) => {
                      setCustomTip(v);
                      setSelectedTip(null);
                    }}
                  />
                </View>
              </View>

              {/* Submit */}
              <Pressable onPress={handleSubmit}>
                <View className="items-center rounded-xl bg-amber-500 py-3.5">
                  <Text className="text-sm font-semibold text-navy-900">{t('送出評價')}</Text>
                </View>
              </Pressable>
            </View>

            {/* Book return trip */}
            <Pressable className="mt-4" onPress={() => router.push('/book')}>
              <View className="items-center rounded-xl border border-navy-200 py-3">
                <Text className="text-sm font-medium text-navy-600">{t('預訂回程？')}</Text>
              </View>
            </Pressable>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-navy-50">
      {/* Header */}
      <View
        className="bg-white px-5 pb-3"
        style={{ paddingTop: insets.top + 8 }}
      >
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={22} color={colors.navy[800]} />
          </Pressable>
          <Text className="text-lg font-semibold text-navy-900">{t('行程追蹤')}</Text>
        </View>
      </View>

      {/* Demo state switcher */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="bg-white border-b border-navy-100"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12 }}
      >
        {demoStates.map((s) => (
          <Pressable
            key={s.key}
            onPress={() => {
              setActiveState(s.key);
              setSubmitted(false);
            }}
          >
            <View
              className={`mr-2 rounded-full px-4 py-2 ${
                activeState === s.key
                  ? 'bg-navy-900'
                  : 'bg-navy-100'
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  activeState === s.key
                    ? 'text-white'
                    : 'text-navy-600'
                }`}
              >
                {t(s.label)}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 32 + insets.bottom }}
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
}
