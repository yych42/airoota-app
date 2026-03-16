import { View, Pressable, StyleSheet, Text, Platform } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/tokens';

const TAB_WIDTH = 80;
const SPRING_CONFIG = { duration: 260, dampingRatio: 0.7 };

export default function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(state.index * TAB_WIDTH, SPRING_CONFIG) }],
  }));

  return (
    <View style={[styles.wrapper, { bottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.pill}>
        <Animated.View style={[styles.indicator, indicatorStyle]} />

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const tintColor = focused ? colors.amber[500] : colors.navy[400];

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : undefined}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}
            >
              {options.tabBarIcon?.({ focused, color: tintColor, size: 22 })}
              <Text style={[styles.label, { color: tintColor, fontWeight: focused ? '600' : '500' }]}>
                {typeof options.title === 'string' ? options.title : route.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  pill: {
    flexDirection: 'row',
    alignSelf: 'center',
    pointerEvents: 'auto',
    backgroundColor: 'rgba(255,255,255,0.7)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' } : {}) as any,
    borderRadius: 28,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    width: TAB_WIDTH - 8,
    borderRadius: 22,
    backgroundColor: colors.amber[50],
  },
  tab: {
    width: TAB_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  label: {
    fontSize: 10,
    marginTop: 2,
  },
});
