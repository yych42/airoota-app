import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  FlatList,
  Platform,
} from 'react-native';
import { Clock } from 'lucide-react-native';
import { colors } from '../../theme/tokens';

interface TimePickerProps {
  value: string; // HH:MM
  onChange: (time: string) => void;
  label?: string;
  placeholder?: string;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

// ─── Period helpers ──────────────────────────────────────────────────

type Period = '凌晨' | '清晨' | '上午' | '中午' | '下午' | '傍晚' | '晚上';

function getPeriod(hour: number): Period {
  if (hour < 5) return '凌晨';
  if (hour < 7) return '清晨';
  if (hour < 12) return '上午';
  if (hour < 13) return '中午';
  if (hour < 17) return '下午';
  if (hour < 19) return '傍晚';
  return '晚上';
}

function getPeriodBg(period: Period): string {
  switch (period) {
    case '清晨':
      return 'bg-orange-50';
    case '上午':
    case '中午':
      return 'bg-sky-50';
    case '下午':
      return 'bg-sky-50';
    case '傍晚':
      return 'bg-amber-50';
    case '凌晨':
    case '晚上':
      return 'bg-indigo-50';
    default:
      return '';
  }
}

// ─── Presets ─────────────────────────────────────────────────────────

const PRESETS = [
  { label: '清晨', time: '06:00' },
  { label: '上午', time: '08:00' },
  { label: '上午', time: '10:00' },
  { label: '中午', time: '12:00' },
  { label: '下午', time: '14:00' },
  { label: '下午', time: '16:00' },
  { label: '傍晚', time: '18:00' },
  { label: '晚上', time: '20:00' },
  { label: '晚上', time: '22:00' },
] as const;

// ─── Data ────────────────────────────────────────────────────────────

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5); // 00-55 step 5

const ITEM_HEIGHT = 44;

export default function TimePicker({
  value,
  onChange,
  label,
  placeholder = '選擇時間',
}: TimePickerProps) {
  const [visible, setVisible] = useState(false);

  // Parse current value
  const parsedHour = value ? parseInt(value.split(':')[0], 10) : 8;
  const parsedMinute = value ? parseInt(value.split(':')[1], 10) : 0;

  const [selectedHour, setSelectedHour] = useState(parsedHour);
  const [selectedMinute, setSelectedMinute] = useState(parsedMinute);

  const hourListRef = useRef<FlatList>(null);
  const minuteListRef = useRef<FlatList>(null);

  const handleOpen = () => {
    const h = value ? parseInt(value.split(':')[0], 10) : 8;
    const m = value ? parseInt(value.split(':')[1], 10) : 0;
    // Round minute to nearest 5
    const roundedM = Math.round(m / 5) * 5;
    setSelectedHour(h);
    setSelectedMinute(roundedM >= 60 ? 55 : roundedM);
    setVisible(true);
  };

  // Auto-scroll when modal opens
  useEffect(() => {
    if (visible) {
      const timeout = setTimeout(() => {
        hourListRef.current?.scrollToIndex({
          index: selectedHour,
          animated: true,
          viewPosition: 0.3,
        });
        const minuteIndex = Math.floor(selectedMinute / 5);
        minuteListRef.current?.scrollToIndex({
          index: minuteIndex,
          animated: true,
          viewPosition: 0.3,
        });
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [visible]);

  const scrollToHour = useCallback((hour: number) => {
    setSelectedHour(hour);
    hourListRef.current?.scrollToIndex({
      index: hour,
      animated: true,
      viewPosition: 0.3,
    });
  }, []);

  const scrollToMinute = useCallback((minute: number) => {
    setSelectedMinute(minute);
    const idx = Math.floor(minute / 5);
    minuteListRef.current?.scrollToIndex({
      index: idx,
      animated: true,
      viewPosition: 0.3,
    });
  }, []);

  const handlePreset = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    scrollToHour(h);
    scrollToMinute(m);
  };

  const handleConfirm = () => {
    onChange(`${pad(selectedHour)}:${pad(selectedMinute)}`);
    setVisible(false);
  };

  const confirmLabel = `確認 ${pad(selectedHour)}:${pad(selectedMinute)}`;

  return (
    <>
      {/* Trigger button */}
      <Pressable
        onPress={handleOpen}
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
        <Clock size={18} color={colors.navy[400]} />
      </Pressable>

      {/* Time picker modal */}
      <Modal visible={visible} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/40 justify-center items-center"
          onPress={() => setVisible(false)}
        >
          <Pressable
            className="bg-white rounded-2xl mx-5 w-[340px] overflow-hidden"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View className="px-4 pt-4 pb-3 border-b border-navy-100">
              <Text className="text-base font-semibold text-navy-900">
                選擇時間
              </Text>
            </View>

            {/* Quick presets */}
            <View className="px-4 pt-3 pb-2">
              <Text className="text-xs text-navy-400 mb-2">快速選擇</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {PRESETS.map((preset) => {
                  const isActive =
                    `${pad(selectedHour)}:${pad(selectedMinute)}` === preset.time;
                  return (
                    <Pressable
                      key={preset.time}
                      onPress={() => handlePreset(preset.time)}
                      className={`px-3 py-1.5 rounded-full ${
                        isActive ? 'bg-amber-500' : 'bg-navy-50'
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          isActive ? 'text-white' : 'text-navy-600'
                        }`}
                      >
                        {preset.label} {preset.time}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Two-column picker */}
            <View className="flex-row px-4 pt-2 pb-3" style={{ height: 260 }}>
              {/* Hours column */}
              <View className="flex-1 mr-2">
                <Text className="text-xs text-navy-400 mb-1 text-center">
                  時
                </Text>
                <FlatList
                  ref={hourListRef}
                  data={HOURS}
                  keyExtractor={(item) => `h-${item}`}
                  showsVerticalScrollIndicator={false}
                  getItemLayout={(_, index) => ({
                    length: ITEM_HEIGHT,
                    offset: ITEM_HEIGHT * index,
                    index,
                  })}
                  onScrollToIndexFailed={() => {}}
                  renderItem={({ item: hour }) => {
                    const isSelected = hour === selectedHour;
                    const period = getPeriod(hour);
                    const periodBg = getPeriodBg(period);

                    return (
                      <Pressable
                        onPress={() => scrollToHour(hour)}
                        className={`flex-row items-center justify-between rounded-lg px-3 ${
                          isSelected ? 'bg-amber-500' : periodBg
                        }`}
                        style={{ height: ITEM_HEIGHT, marginBottom: 2 }}
                      >
                        <Text
                          className={`text-xs ${
                            isSelected ? 'text-white' : 'text-navy-400'
                          }`}
                        >
                          {period}
                        </Text>
                        <Text
                          className={`text-base font-medium ${
                            isSelected ? 'text-white' : 'text-navy-800'
                          }`}
                          style={{
                            fontVariant: ['tabular-nums'],
                            fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                          }}
                        >
                          {pad(hour)}
                        </Text>
                      </Pressable>
                    );
                  }}
                />
              </View>

              {/* Minutes column */}
              <View className="flex-1 ml-2">
                <Text className="text-xs text-navy-400 mb-1 text-center">
                  分
                </Text>
                <FlatList
                  ref={minuteListRef}
                  data={MINUTES}
                  keyExtractor={(item) => `m-${item}`}
                  showsVerticalScrollIndicator={false}
                  getItemLayout={(_, index) => ({
                    length: ITEM_HEIGHT,
                    offset: ITEM_HEIGHT * index,
                    index,
                  })}
                  onScrollToIndexFailed={() => {}}
                  renderItem={({ item: minute }) => {
                    const isSelected = minute === selectedMinute;

                    return (
                      <Pressable
                        onPress={() => scrollToMinute(minute)}
                        className={`items-center justify-center rounded-lg ${
                          isSelected ? 'bg-amber-500' : 'bg-navy-50'
                        }`}
                        style={{ height: ITEM_HEIGHT, marginBottom: 2 }}
                      >
                        <Text
                          className={`text-base font-medium ${
                            isSelected ? 'text-white' : 'text-navy-800'
                          }`}
                          style={{
                            fontVariant: ['tabular-nums'],
                            fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                          }}
                        >
                          {pad(minute)}
                        </Text>
                      </Pressable>
                    );
                  }}
                />
              </View>
            </View>

            {/* Confirm button */}
            <View className="px-4 pb-4">
              <Pressable
                onPress={handleConfirm}
                className="bg-amber-500 rounded-xl py-3.5 items-center"
              >
                <Text className="text-base font-semibold text-white">
                  {confirmLabel}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
