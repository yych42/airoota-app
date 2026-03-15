import { useState, useMemo } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors } from '../../theme/tokens';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  label?: string;
  placeholder?: string;
}

const WEEKDAY_HEADERS = ['日', '一', '二', '三', '四', '五', '六'];

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatDisplay(value: string): string {
  if (!value) return '';
  // YYYY-MM-DD -> YYYY/MM/DD
  return value.replace(/-/g, '/');
}

function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

interface CalendarDay {
  year: number;
  month: number; // 0-indexed
  day: number;
  isCurrentMonth: boolean;
  dateStr: string;
  isPast: boolean;
}

function buildCalendar(year: number, month: number, todayStr: string): CalendarDay[] {
  const days: CalendarDay[] = [];
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Fill previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    const dateStr = `${y}-${pad(m + 1)}-${pad(d)}`;
    days.push({
      year: y,
      month: m,
      day: d,
      isCurrentMonth: false,
      dateStr,
      isPast: dateStr < todayStr,
    });
  }

  // Fill current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`;
    days.push({
      year,
      month,
      day: d,
      isCurrentMonth: true,
      dateStr,
      isPast: dateStr < todayStr,
    });
  }

  // Fill next month to complete 6 rows (42 cells)
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    const m = month === 11 ? 0 : month + 1;
    const y = month === 11 ? year + 1 : year;
    const dateStr = `${y}-${pad(m + 1)}-${pad(d)}`;
    days.push({
      year: y,
      month: m,
      day: d,
      isCurrentMonth: false,
      dateStr,
      isPast: dateStr < todayStr,
    });
  }

  return days;
}

export default function DatePicker({
  value,
  onChange,
  label,
  placeholder = '選擇日期',
}: DatePickerProps) {
  const [visible, setVisible] = useState(false);
  const todayStr = getToday();

  // Calendar view month/year state
  const initialDate = value ? new Date(value) : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  const days = useMemo(
    () => buildCalendar(viewYear, viewMonth, todayStr),
    [viewYear, viewMonth, todayStr],
  );

  const handleOpen = () => {
    // Reset view to selected date's month or current month
    if (value) {
      const d = new Date(value);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    } else {
      const d = new Date();
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
    setVisible(true);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelect = (day: CalendarDay) => {
    if (day.isPast) return;
    onChange(day.dateStr);
    setVisible(false);
  };

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
            {value ? formatDisplay(value) : placeholder}
          </Text>
        </View>
        <CalendarDays size={18} color={colors.navy[400]} />
      </Pressable>

      {/* Calendar modal */}
      <Modal visible={visible} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/40 justify-center items-center"
          onPress={() => setVisible(false)}
        >
          <Pressable
            className="bg-white rounded-2xl mx-5 w-[340px] overflow-hidden"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Month navigation header */}
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-navy-100">
              <Pressable
                onPress={handlePrevMonth}
                className="h-9 w-9 items-center justify-center rounded-full bg-navy-50"
              >
                <ChevronLeft size={18} color={colors.navy[600]} />
              </Pressable>
              <Text className="text-base font-semibold text-navy-900">
                {viewYear}年 {viewMonth + 1}月
              </Text>
              <Pressable
                onPress={handleNextMonth}
                className="h-9 w-9 items-center justify-center rounded-full bg-navy-50"
              >
                <ChevronRight size={18} color={colors.navy[600]} />
              </Pressable>
            </View>

            {/* Weekday headers */}
            <View className="flex-row px-2 pt-3 pb-1">
              {WEEKDAY_HEADERS.map((d) => (
                <View key={d} className="flex-1 items-center">
                  <Text className="text-xs font-medium text-navy-400">
                    {d}
                  </Text>
                </View>
              ))}
            </View>

            {/* Calendar grid - 6 rows */}
            <View className="px-2 pb-4">
              {Array.from({ length: 6 }).map((_, row) => (
                <View key={row} className="flex-row">
                  {days.slice(row * 7, row * 7 + 7).map((day) => {
                    const isSelected = day.dateStr === value;
                    const isToday = day.dateStr === todayStr;
                    const disabled = day.isPast;

                    return (
                      <Pressable
                        key={day.dateStr}
                        onPress={() => handleSelect(day)}
                        disabled={disabled}
                        className="flex-1 items-center justify-center py-2"
                      >
                        <View
                          className={`h-9 w-9 items-center justify-center rounded-full ${
                            isSelected ? 'bg-amber-500' : ''
                          }`}
                        >
                          <Text
                            className={`text-sm ${
                              isSelected
                                ? 'text-white font-bold'
                                : isToday
                                ? 'text-amber-600 font-bold'
                                : disabled
                                ? 'text-navy-200'
                                : day.isCurrentMonth
                                ? 'text-navy-800'
                                : 'text-navy-300'
                            }`}
                            style={{ fontVariant: ['tabular-nums'] }}
                          >
                            {day.day}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
