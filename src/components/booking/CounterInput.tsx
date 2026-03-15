import { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Minus, Plus } from 'lucide-react-native';
import { colors } from '../../theme/tokens';

interface CounterInputProps {
  label: string;
  sublabel?: string;
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  min?: number;
  max?: number;
}

const CELL_H = 28;
const VISIBLE_H = 40;
const FADE_H = 10;
const PAD = (VISIBLE_H - CELL_H) / 2;
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function RollingNumber({ value }: { value: number }) {
  const offset = useSharedValue(value * CELL_H - PAD);

  useEffect(() => {
    offset.value = withSpring(value * CELL_H - PAD, {
      damping: 60,
      stiffness: 2500,
    });
  }, [value, offset]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -offset.value }],
  }));

  return (
    <View style={{ height: VISIBLE_H, width: 40, overflow: 'hidden' }}>
      <Animated.View style={animStyle}>
        {DIGITS.map((d) => (
          <View
            key={d}
            style={{
              height: CELL_H,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.navy[900],
              }}
            >
              {d}
            </Text>
          </View>
        ))}
      </Animated.View>
      <LinearGradient
        colors={[colors.navy[50], 'rgba(240,244,248,0)']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: FADE_H }}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(240,244,248,0)', colors.navy[50]]}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: FADE_H }}
        pointerEvents="none"
      />
    </View>
  );
}

export default function CounterInput({
  label,
  sublabel,
  value,
  onDecrement,
  onIncrement,
  min = 0,
  max = 10,
}: CounterInputProps) {
  return (
    <View className="flex-row items-center justify-between py-3">
      <View className="flex-1 mr-4">
        <Text className="text-base font-medium text-navy-900">{label}</Text>
        {sublabel ? (
          <Text className="text-sm text-navy-400 mt-0.5">{sublabel}</Text>
        ) : null}
      </View>
      <View className="flex-row items-center">
        <Pressable
          onPress={onDecrement}
          disabled={value <= min}
          className={`h-9 w-9 items-center justify-center rounded-full border ${
            value <= min
              ? 'border-navy-100 bg-navy-50'
              : 'border-navy-200 bg-white'
          }`}
        >
          <Minus
            size={16}
            color={value <= min ? colors.navy[300] : colors.navy[700]}
          />
        </Pressable>
        <RollingNumber value={value} />
        <Pressable
          onPress={onIncrement}
          disabled={value >= max}
          className={`h-9 w-9 items-center justify-center rounded-full border ${
            value >= max
              ? 'border-navy-100 bg-navy-50'
              : 'border-navy-200 bg-white'
          }`}
        >
          <Plus
            size={16}
            color={value >= max ? colors.navy[300] : colors.navy[700]}
          />
        </Pressable>
      </View>
    </View>
  );
}
