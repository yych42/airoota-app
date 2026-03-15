import { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  ChevronLeft,
  ChevronDown,
  Check,
  Plus,
  Minus,
  Trash2,
  Car,
  Crown,
  Truck,
  Bus,
  Users,
  Luggage,
  Plane,
  CreditCard,
  Smartphone,
  MessageCircle,
  Info,
} from 'lucide-react-native';

import { airports } from '../../src/data/airports';
import { vehicles } from '../../src/data/vehicles';
import {
  airportCities,
  cityDistricts,
} from '../../src/data/locations';
import {
  vehicleConstraints,
  childSeatOptions,
  isVehicleDisabled,
  getVehicleCapacityLabel,
} from '../../src/data/vehicles';
import { formatPrice } from '../../src/utils/format';
import { useBookingStore } from '../../src/store/booking';
import { colors } from '../../src/theme/tokens';
import { useFadeSlideIn } from '../../src/utils/animations';
import { useT } from '../../src/i18n/useTranslation';
import { useLanguageStore } from '../../src/store/language';

import DatePicker from '../../src/components/booking/DatePicker';
import TimePicker from '../../src/components/booking/TimePicker';
import CounterInput from '../../src/components/booking/CounterInput';
import ToggleSwitch from '../../src/components/ui/ToggleSwitch';

import type { Airport, Vehicle, VehicleType, TripType } from '../../src/types/booking';

// ─── Reusable components ─────────────────────────────────────────────

function SelectorModal<T extends string>({
  visible,
  onClose,
  title,
  options,
  selected,
  onSelect,
  renderLabel,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: T[];
  selected: T;
  onSelect: (val: T) => void;
  renderLabel?: (val: T) => string;
}) {
  const t = useT();
  const [internalVisible, setInternalVisible] = useState(false);
  const translateY = useSharedValue(400);
  const backdropOpacity = useSharedValue(0);

  // Open: show modal, then animate in
  useEffect(() => {
    if (visible) {
      setInternalVisible(true);
      translateY.value = 400;
      backdropOpacity.value = 0;
    }
  }, [visible, translateY, backdropOpacity]);

  const onShow = () => {
    translateY.value = withSpring(0, { duration: 350, dampingRatio: 0.85 });
    backdropOpacity.value = withTiming(1, { duration: 200 });
  };

  // Close: animate out, then hide modal
  const handleClose = () => {
    translateY.value = withSpring(400, { duration: 250, dampingRatio: 1 });
    backdropOpacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(setInternalVisible)(false);
      runOnJS(onClose)();
    });
  };

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  return (
    <Modal visible={internalVisible} transparent animationType="none" onShow={onShow}>
      <View className="flex-1 justify-end">
        <Animated.View
          style={[
            { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
            backdropStyle,
          ]}
        >
          <Pressable className="flex-1" onPress={handleClose} />
        </Animated.View>
        <Animated.View style={[{ width: '100%' }, sheetStyle]}>
          <Pressable
            className="bg-white rounded-t-2xl"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="flex-row items-center justify-between px-5 pt-5 pb-3 border-b border-navy-100">
              <Text className="text-lg font-semibold text-navy-900">
                {title}
              </Text>
              <Pressable onPress={handleClose}>
                <Text className="text-amber-600 font-medium">{t('完成')}</Text>
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 350 }}>
              {options.map((item) => (
                <Pressable
                  key={item}
                  className={`flex-row items-center justify-between px-5 py-3.5 border-b border-navy-50 ${
                    item === selected ? 'bg-amber-50' : ''
                  }`}
                  onPress={() => {
                    onSelect(item);
                    handleClose();
                  }}
                >
                  <Text
                    className={`text-base ${
                      item === selected
                        ? 'text-amber-700 font-semibold'
                        : 'text-navy-800'
                    }`}
                  >
                    {renderLabel ? renderLabel(item) : item}
                  </Text>
                  {item === selected && (
                    <Check size={18} color={colors.amber[600]} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <Text className="text-sm font-semibold text-navy-500 uppercase tracking-wider mb-2 mt-5">
      {text}
    </Text>
  );
}

function DropdownButton({
  label,
  value,
  placeholder,
  onPress,
}: {
  label?: string;
  value: string;
  placeholder: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between bg-navy-50 rounded-xl px-4 py-3.5 border border-navy-100"
    >
      <View>
        {label ? (
          <Text className="text-xs text-navy-400 mb-0.5">{label}</Text>
        ) : null}
        <Text
          className={`text-base ${
            value ? 'text-navy-900' : 'text-navy-400'
          }`}
        >
          {value || placeholder}
        </Text>
      </View>
      <ChevronDown size={18} color={colors.navy[400]} />
    </Pressable>
  );
}

// ─── Vehicle icon map ────────────────────────────────────────────────

const vehicleIcons: Record<string, typeof Car> = {
  standard: Car,
  premium: Crown,
  suv: Truck,
  van9: Bus,
};

// ─── Payment options ─────────────────────────────────────────────────

const paymentOptions = [
  { id: 'credit-card', labelZh: '信用卡', Icon: CreditCard },
  { id: 'apple-pay', labelZh: 'Apple Pay', Icon: Smartphone },
  { id: 'line-pay', labelZh: 'LINE Pay', Icon: MessageCircle },
] as const;

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-start justify-between">
      <Text className="text-sm text-navy-500 w-20">{label}</Text>
      <Text className="text-sm text-navy-900 font-medium flex-1 text-right">
        {value}
      </Text>
    </View>
  );
}

// ─── Main component ──────────────────────────────────────────────────

export default function BookingFlow() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type?: string }>();
  const tripType: TripType = type === 'dropoff' ? 'dropoff' : 'pickup';

  const { setBooking, addUpcoming } = useBookingStore();

  const t = useT();
  const fadeIn = useFadeSlideIn();
  const { locale } = useLanguageStore();

  // Step state
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 - Trip details
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [specificAddress, setSpecificAddress] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [largeLuggage, setLargeLuggage] = useState(0);
  const [smallLuggage, setSmallLuggage] = useState(0);
  const [childSeats, setChildSeats] = useState(false);
  const [selectedChildSeats, setSelectedChildSeats] = useState<string[]>([]);
  const [wantReceipt, setWantReceipt] = useState(false);
  const [quietRide, setQuietRide] = useState(false);

  // Step 2 - Vehicle selection
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Step 3 - Payment
  const [paymentMethod, setPaymentMethod] = useState('credit-card');

  // Modal states
  const [airportModalVisible, setAirportModalVisible] = useState(false);
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [districtModalVisible, setDistrictModalVisible] = useState(false);
  const [childSeatModalVisible, setChildSeatModalVisible] = useState(false);
  const [childSeatInternalVisible, setChildSeatInternalVisible] = useState(false);
  const childSeatSheetY = useSharedValue(400);
  const childSeatBackdropOpacity = useSharedValue(0);
  const childSeatSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: childSeatSheetY.value }],
  }));
  const childSeatBackdropStyle = useAnimatedStyle(() => ({
    opacity: childSeatBackdropOpacity.value,
  }));

  useEffect(() => {
    if (childSeatModalVisible) {
      setChildSeatInternalVisible(true);
      childSeatSheetY.value = 400;
      childSeatBackdropOpacity.value = 0;
    }
  }, [childSeatModalVisible, childSeatSheetY, childSeatBackdropOpacity]);

  const openChildSeatSheet = () => {
    childSeatSheetY.value = withSpring(0, { duration: 350, dampingRatio: 0.85 });
    childSeatBackdropOpacity.value = withTiming(1, { duration: 200 });
  };

  const closeChildSeatSheet = () => {
    childSeatSheetY.value = withSpring(400, { duration: 250, dampingRatio: 1 });
    childSeatBackdropOpacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(setChildSeatInternalVisible)(false);
      runOnJS(setChildSeatModalVisible)(false);
    });
  };

  // Derived data
  const availableCities = selectedAirport
    ? airportCities[selectedAirport.code] || []
    : [];
  const availableDistricts = city ? cityDistricts[city] || [] : [];

  const fullAddress = [city, district, specificAddress]
    .filter(Boolean)
    .join('');

  const childSeatPrice = selectedChildSeats.length * 200;

  const totalPrice = useMemo(() => {
    if (!selectedVehicle) return 0;
    return selectedVehicle.basePrice + childSeatPrice;
  }, [selectedVehicle, childSeatPrice]);

  // Validation
  const isStep1Valid =
    selectedAirport !== null &&
    date.length > 0 &&
    time.length > 0 &&
    city.length > 0 &&
    district.length > 0 &&
    specificAddress.length > 0 &&
    (tripType === 'dropoff' || flightNumber.length > 0);

  const isStep2Valid = selectedVehicle !== null;

  // Handlers
  const handleAddChildSeat = (seat: string) => {
    setSelectedChildSeats((prev) => [...prev, seat]);
    setChildSeatModalVisible(false);
  };

  const handleRemoveChildSeat = (index: number) => {
    setSelectedChildSeats((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirmBooking = () => {
    if (!selectedAirport || !selectedVehicle) return;

    const booking = {
      id: `b-${Date.now()}`,
      tripType,
      airport: selectedAirport,
      address: fullAddress,
      date,
      time,
      flightNumber,
      vehicle: selectedVehicle,
      price: totalPrice,
      state: 'pending' as const,
      driver: null,
      paymentMethod,
    };

    setBooking(booking);
    addUpcoming(booking);
    router.replace('/book/confirmed');
  };

  // ─── Step indicator (inline) ─────────────────────────────────────

  const stepIndicatorData = [
    { num: 1, label: t('行程資訊') },
    { num: 2, label: t('選擇車型') },
    { num: 3, label: t('確認預訂') },
  ];

  const stepIndicator = (
    <View className="flex-row items-center justify-center py-4 px-6 gap-2">
      {stepIndicatorData.map((s, i) => (
        <View key={s.num} className="flex-row items-center">
          <View
            className={`h-7 w-7 rounded-full items-center justify-center ${
              currentStep >= s.num ? 'bg-amber-500' : 'bg-navy-100'
            }`}
          >
            {currentStep > s.num ? (
              <Check size={14} color="#fff" />
            ) : (
              <Text
                className={`text-xs font-bold ${
                  currentStep >= s.num ? 'text-white' : 'text-navy-400'
                }`}
              >
                {s.num}
              </Text>
            )}
          </View>
          <Text
            className={`text-xs ml-1 ${
              currentStep >= s.num
                ? 'text-navy-900 font-semibold'
                : 'text-navy-400'
            }`}
          >
            {s.label}
          </Text>
          {i < stepIndicatorData.length - 1 && (
            <View
              className={`w-8 h-0.5 mx-2 rounded ${
                currentStep > s.num ? 'bg-amber-500' : 'bg-navy-100'
              }`}
            />
          )}
        </View>
      ))}
    </View>
  );

  // ─── Step 1: Trip Details (inline JSX) ─────────────────────────

  const step1 = (
      <View className="px-5 pb-8">
        {/* Trip type badge */}
        <View className="flex-row mb-4">
          <View
            className={`px-3 py-1.5 rounded-full ${
              tripType === 'pickup' ? 'bg-teal-100' : 'bg-amber-100'
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                tripType === 'pickup' ? 'text-teal-700' : 'text-amber-700'
              }`}
            >
              {tripType === 'pickup' ? t('機場接機') : t('送機服務')}
            </Text>
          </View>
        </View>

        {/* Airport selector */}
        <SectionLabel text={t('機場')} />
        <DropdownButton
          value={selectedAirport?.nameZh || ''}
          placeholder={t('選擇機場')}
          onPress={() => setAirportModalVisible(true)}
        />
        <SelectorModal
          visible={airportModalVisible}
          onClose={() => setAirportModalVisible(false)}
          title={t('選擇機場')}
          options={airports.map((a) => a.code)}
          selected={selectedAirport?.code || ''}
          onSelect={(code) => {
            const airport = airports.find((a) => a.code === code) || null;
            setSelectedAirport(airport);
            setCity('');
            setDistrict('');
          }}
          renderLabel={(code) => {
            const a = airports.find((ap) => ap.code === code);
            return a ? `${a.nameZh} (${a.code})` : code;
          }}
        />

        {/* Date & Time */}
        <SectionLabel text={t('日期與時間')} />
        <View className="flex-row gap-3">
          <View className="flex-1">
            <DatePicker value={date} onChange={setDate} />
          </View>
          <View className="flex-1">
            <TimePicker value={time} onChange={setTime} />
          </View>
        </View>

        {/* Flight number - only for pickup */}
        {tripType === 'pickup' && (
          <>
            <SectionLabel text={t('航班資訊')} />
            <View className="flex-row items-center bg-navy-50 rounded-xl px-4 border border-navy-100">
              <Plane size={18} color={colors.navy[400]} />
              <TextInput
                className="flex-1 py-3.5 pl-3 text-base text-navy-900"
                placeholder={t('航班編號（如 BR872）')}
                placeholderTextColor={colors.navy[400]}
                value={flightNumber}
                onChangeText={setFlightNumber}
                autoCapitalize="characters"
              />
            </View>
          </>
        )}

        {/* Address section */}
        <SectionLabel text={t('地址')} />
        <View className="gap-3">
          <DropdownButton
            label={t('縣市')}
            value={city}
            placeholder={
              selectedAirport ? t('選擇縣市') : t('請先選擇機場')
            }
            onPress={() => {
              if (selectedAirport) setCityModalVisible(true);
            }}
          />
          <SelectorModal
            visible={cityModalVisible}
            onClose={() => setCityModalVisible(false)}
            title={t('選擇縣市')}
            options={availableCities}
            selected={city}
            onSelect={(val) => {
              setCity(val);
              setDistrict('');
            }}
          />

          <DropdownButton
            label={t('鄉鎮市區')}
            value={district}
            placeholder={city ? t('選擇區域') : t('請先選擇縣市')}
            onPress={() => {
              if (city) setDistrictModalVisible(true);
            }}
          />
          <SelectorModal
            visible={districtModalVisible}
            onClose={() => setDistrictModalVisible(false)}
            title={t('選擇區域')}
            options={availableDistricts}
            selected={district}
            onSelect={setDistrict}
          />

          <TextInput
            className="bg-navy-50 rounded-xl px-4 py-3.5 text-base text-navy-900 border border-navy-100"
            placeholder={t('詳細地址（路名、門牌號碼）')}
            placeholderTextColor={colors.navy[400]}
            value={specificAddress}
            onChangeText={setSpecificAddress}
          />
        </View>

        {/* Passenger & luggage counts */}
        <SectionLabel text={t('乘客與行李')} />
        <View className="bg-navy-50 rounded-xl px-4 border border-navy-100">
          <CounterInput
            label={t('乘客人數')}
            value={passengers}
            onDecrement={() => setPassengers((p) => Math.max(1, p - 1))}
            onIncrement={() => setPassengers((p) => Math.min(8, p + 1))}
            min={1}
            max={8}
          />
          <View className="h-px bg-navy-100" />
          <CounterInput
            label={t('大型行李')}
            sublabel={t('28 吋以上行李箱')}
            value={largeLuggage}
            onDecrement={() => setLargeLuggage((l) => Math.max(0, l - 1))}
            onIncrement={() => setLargeLuggage((l) => Math.min(10, l + 1))}
            min={0}
            max={10}
          />
          <View className="h-px bg-navy-100" />
          <CounterInput
            label={t('小型行李')}
            sublabel={t('登機箱、背包')}
            value={smallLuggage}
            onDecrement={() => setSmallLuggage((l) => Math.max(0, l - 1))}
            onIncrement={() => setSmallLuggage((l) => Math.min(10, l + 1))}
            min={0}
            max={10}
          />
        </View>

        {/* Child safety seats */}
        <SectionLabel text={t('兒童安全座椅')} />
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-base text-navy-800">{t('需要兒童安全座椅')}</Text>
          <ToggleSwitch
            value={childSeats}
            onToggle={() => {
              setChildSeats(!childSeats);
              if (childSeats) setSelectedChildSeats([]);
            }}
          />
        </View>
        {childSeats && (
          <View className="bg-navy-50 rounded-xl p-4 border border-navy-100">
            {selectedChildSeats.map((seat, index) => (
              <View
                key={`${seat}-${index}`}
                className="flex-row items-center justify-between py-2"
              >
                <Text className="text-sm text-navy-700 flex-1">{seat}</Text>
                <Pressable onPress={() => handleRemoveChildSeat(index)}>
                  <Trash2 size={16} color={colors.amber[700]} />
                </Pressable>
              </View>
            ))}
            <Pressable
              onPress={() => setChildSeatModalVisible(true)}
              className="flex-row items-center justify-center py-2.5 mt-1 rounded-lg border border-dashed border-navy-200"
            >
              <Plus size={16} color={colors.amber[600]} />
              <Text className="text-sm text-amber-600 font-medium ml-1">
                {t('新增座椅')}
              </Text>
            </Pressable>
            <Text className="text-xs text-navy-400 mt-2">
              {t('每張安全座椅加收 TWD 200')}
            </Text>
          </View>
        )}

        {/* Child seat selector modal */}
        <Modal
          visible={childSeatInternalVisible}
          transparent
          animationType="none"
          onShow={openChildSeatSheet}
        >
          <View className="flex-1 justify-end">
            <Animated.View
              style={[
                { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
                childSeatBackdropStyle,
              ]}
            >
              <Pressable className="flex-1" onPress={closeChildSeatSheet} />
            </Animated.View>
            <Animated.View style={[{ width: '100%' }, childSeatSheetStyle]}>
              <Pressable
                className="bg-white rounded-t-2xl"
                onPress={(e) => e.stopPropagation()}
              >
                <View className="px-5 pt-5 pb-3 border-b border-navy-100">
                  <Text className="text-lg font-semibold text-navy-900">
                    {t('選擇座椅類型')}
                  </Text>
                </View>
                {childSeatOptions.map((option) => (
                  <Pressable
                    key={option}
                    className="px-5 py-4 border-b border-navy-50"
                    onPress={() => handleAddChildSeat(option)}
                  >
                    <Text className="text-base text-navy-800">{option}</Text>
                  </Pressable>
                ))}
                <Pressable
                  className="px-5 py-4 items-center"
                  onPress={closeChildSeatSheet}
                >
                  <Text className="text-base text-navy-400">{t('取消')}</Text>
                </Pressable>
              </Pressable>
            </Animated.View>
          </View>
        </Modal>

        {/* Receipt toggle */}
        <SectionLabel text={t('其他選項')} />
        <View className="bg-navy-50 rounded-xl px-4 py-3 border border-navy-100">
          <View className="flex-row items-center justify-between py-1">
            <Text className="text-base text-navy-800">{t('需要收據')}</Text>
            <ToggleSwitch
              value={wantReceipt}
              onToggle={() => setWantReceipt(!wantReceipt)}
            />
          </View>
          <View className="h-px bg-navy-100 my-2" />
          <View className="flex-row items-center justify-between py-1">
            <View>
              <Text className="text-base text-navy-800">{t('安靜乘車')}</Text>
              <Text className="text-xs text-navy-400">
                {t('司機將減少交談，提供安靜的乘車環境')}
              </Text>
            </View>
            <ToggleSwitch
              value={quietRide}
              onToggle={() => setQuietRide(!quietRide)}
            />
          </View>
        </View>

        {/* Continue button */}
        <Pressable
          onPress={() => setCurrentStep(2)}
          disabled={!isStep1Valid}
          className={`mt-6 py-4 rounded-2xl items-center ${
            isStep1Valid ? 'bg-amber-500' : 'bg-navy-100'
          }`}
        >
          <Text
            className={`text-base font-semibold ${
              isStep1Valid ? 'text-white' : 'text-navy-400'
            }`}
          >
            {t('繼續')}
          </Text>
        </Pressable>
      </View>
  );

  // ─── Step 2: Vehicle Selection (inline JSX) ────────────────────

  const step2 = (
      <View className="px-5 pb-8">
        {/* Counts summary */}
        <View className="flex-row items-center gap-4 mb-5 bg-navy-50 rounded-xl px-4 py-3 border border-navy-100">
          <View className="flex-row items-center gap-1.5">
            <Users size={16} color={colors.navy[500]} />
            <Text className="text-sm text-navy-700 font-medium">
              {locale === 'en' ? `${passengers} passengers` : `${passengers} 位乘客`}
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Luggage size={16} color={colors.navy[500]} />
            <Text className="text-sm text-navy-700 font-medium">
              {locale === 'en' ? `${largeLuggage} large + ${smallLuggage} small luggage` : `${largeLuggage} 大 + ${smallLuggage} 小行李`}
            </Text>
          </View>
        </View>

        {/* Vehicle cards */}
        <View className="gap-3">
          {vehicles.map((v) => {
            const disabled = isVehicleDisabled(
              v.type,
              passengers,
              largeLuggage,
              smallLuggage
            );
            const selected =
              selectedVehicle?.type === v.type && !disabled;
            const IconComp = vehicleIcons[v.type] || Car;

            return (
              <Pressable
                key={v.type}
                onPress={() => {
                  if (!disabled) setSelectedVehicle(v);
                }}
                disabled={disabled}
                className={`rounded-2xl border-2 p-4 ${
                  selected
                    ? 'border-amber-500 bg-amber-50'
                    : disabled
                    ? 'border-navy-100 bg-navy-50 opacity-60'
                    : 'border-navy-100 bg-white'
                }`}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-row items-center gap-3 flex-1">
                    <View
                      className={`h-12 w-12 rounded-xl items-center justify-center ${
                        selected ? 'bg-amber-100' : 'bg-navy-100'
                      }`}
                    >
                      <IconComp
                        size={24}
                        color={
                          selected
                            ? colors.amber[700]
                            : colors.navy[500]
                        }
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-navy-900">
                        {v.nameZh}
                      </Text>
                      <Text className="text-sm text-navy-500 mt-0.5">
                        {v.description}
                      </Text>
                    </View>
                  </View>
                  {selected && (
                    <View className="h-6 w-6 rounded-full bg-amber-500 items-center justify-center">
                      <Check size={14} color="#fff" />
                    </View>
                  )}
                </View>

                <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-navy-100">
                  <Text className="text-xs text-navy-400">
                    {getVehicleCapacityLabel(v.type)}
                  </Text>
                  <Text className="text-lg font-bold text-navy-900">
                    {formatPrice(v.basePrice)}
                  </Text>
                </View>

                {disabled && (
                  <Text className="text-xs text-red-500 font-medium mt-2">
                    {t('載客或行李數量超過此車型上限')}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Included services info box */}
        <View className="flex-row items-start gap-2 bg-teal-50 rounded-xl px-4 py-3 mt-5 border border-teal-100">
          <Info size={16} color={colors.teal[600]} className="mt-0.5" />
          <Text className="text-sm text-teal-700 flex-1">
            {t('包含：免費等候 90 分鐘 · 航班監控 · 舉牌接機')}
          </Text>
        </View>

        {/* Buttons */}
        <View className="flex-row gap-3 mt-6">
          <Pressable
            onPress={() => setCurrentStep(1)}
            className="flex-1 py-4 rounded-2xl items-center border border-navy-200 bg-white"
          >
            <Text className="text-base font-semibold text-navy-700">
              {t('返回')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setCurrentStep(3)}
            disabled={!isStep2Valid}
            className={`flex-1 py-4 rounded-2xl items-center ${
              isStep2Valid ? 'bg-amber-500' : 'bg-navy-100'
            }`}
          >
            <Text
              className={`text-base font-semibold ${
                isStep2Valid ? 'text-white' : 'text-navy-400'
              }`}
            >
              {t('確認車型')}
            </Text>
          </Pressable>
        </View>
      </View>
  );

  // ─── Step 3: Confirmation (inline JSX) ─────────────────────────

  const step3 = (
      <View className="px-5 pb-8">
        {/* Trip summary card */}
        <View className="bg-navy-50 rounded-2xl p-5 border border-navy-100 mb-5">
          <Text className="text-lg font-semibold text-navy-900 mb-4">
            {t('行程摘要')}
          </Text>

          <View className="gap-3">
            <SummaryRow
              label={t('服務類型')}
              value={tripType === 'pickup' ? t('機場接機') : t('送機服務')}
            />
            <SummaryRow
              label={t('機場')}
              value={selectedAirport?.nameZh || ''}
            />
            <SummaryRow label={t('日期')} value={date} />
            <SummaryRow label={t('時間')} value={time} />
            {tripType === 'pickup' && flightNumber ? (
              <SummaryRow label={t('航班')} value={flightNumber} />
            ) : null}
            <SummaryRow label={t('地址')} value={fullAddress} />
            <SummaryRow
              label={t('乘客')}
              value={locale === 'en' ? `${passengers} passengers` : `${passengers} 位`}
            />
            <SummaryRow
              label={t('行李')}
              value={locale === 'en' ? `${largeLuggage} large + ${smallLuggage} small` : `${largeLuggage} 大 + ${smallLuggage} 小`}
            />
            <SummaryRow
              label={t('車型')}
              value={selectedVehicle?.nameZh || ''}
            />
            {selectedChildSeats.length > 0 && (
              <SummaryRow
                label={t('兒童座椅')}
                value={locale === 'en' ? `${selectedChildSeats.length} seats` : `${selectedChildSeats.length} 張`}
              />
            )}
            {wantReceipt && (
              <SummaryRow label={t('收據')} value={t('是')} />
            )}
            {quietRide && (
              <SummaryRow label={t('安靜乘車')} value={t('是')} />
            )}
          </View>
        </View>

        {/* Payment method */}
        <SectionLabel text={t('付款方式')} />
        <View className="gap-2 mb-5">
          {paymentOptions.map(({ id, labelZh, Icon }) => {
            const selected = paymentMethod === id;
            return (
              <Pressable
                key={id}
                onPress={() => setPaymentMethod(id)}
                className={`flex-row items-center gap-3 px-4 py-3.5 rounded-xl border-2 ${
                  selected
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-navy-100 bg-white'
                }`}
              >
                <Icon
                  size={20}
                  color={
                    selected ? colors.amber[600] : colors.navy[500]
                  }
                />
                <Text
                  className={`text-base flex-1 ${
                    selected
                      ? 'text-amber-700 font-semibold'
                      : 'text-navy-800'
                  }`}
                >
                  {t(labelZh)}
                </Text>
                {selected && (
                  <View className="h-5 w-5 rounded-full bg-amber-500 items-center justify-center">
                    <Check size={12} color="#fff" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Price breakdown */}
        <View className="bg-navy-50 rounded-2xl p-5 border border-navy-100 mb-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-base text-navy-600">{t('車資')}</Text>
            <Text className="text-base text-navy-800">
              {formatPrice(selectedVehicle?.basePrice || 0)}
            </Text>
          </View>
          {childSeatPrice > 0 && (
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-base text-navy-600">
                {t('兒童座椅')} x{selectedChildSeats.length}
              </Text>
              <Text className="text-base text-navy-800">
                {formatPrice(childSeatPrice)}
              </Text>
            </View>
          )}
          <View className="h-px bg-navy-200 my-2" />
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold text-navy-900">{t('合計')}</Text>
            <Text className="text-xl font-bold text-amber-600">
              {formatPrice(totalPrice)}
            </Text>
          </View>
        </View>

        {/* Action buttons */}
        <Pressable
          onPress={handleConfirmBooking}
          className="py-4 rounded-2xl items-center bg-amber-500 mb-3"
        >
          <Text className="text-base font-semibold text-white">
            {t('確認預訂')}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setCurrentStep(2)}
          className="py-4 rounded-2xl items-center border border-navy-200 bg-white"
        >
          <Text className="text-base font-semibold text-navy-700">
            {t('返回修改')}
          </Text>
        </Pressable>
      </View>
  );

  // ─── Render ──────────────────────────────────────────────────────

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Animated.View style={[{ flex: 1 }, fadeIn]}>
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-navy-100">
          <Pressable
            onPress={() => {
              if (currentStep > 1) {
                setCurrentStep(currentStep - 1);
              } else {
                router.back();
              }
            }}
            className="h-10 w-10 items-center justify-center rounded-full bg-navy-50"
          >
            <ChevronLeft size={22} color={colors.navy[700]} />
          </Pressable>
          <Text className="flex-1 text-center text-lg font-semibold text-navy-900 mr-10">
            {tripType === 'pickup' ? t('預訂接機') : t('預訂送機')}
          </Text>
        </View>

        {stepIndicator}

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {currentStep === 1 && step1}
          {currentStep === 2 && step2}
          {currentStep === 3 && step3}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}
