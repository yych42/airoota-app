import {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';

/**
 * Replaces `.animate-pulse-ring`
 * Scale from 0.8 -> 1.3, opacity from 0.8 -> 0, repeating.
 */
export function usePulseRing() {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0.8);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.3, { duration: 1500, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
    opacity.value = withRepeat(
      withTiming(0, { duration: 1500, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
  }, [scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return animatedStyle;
}

/**
 * Replaces `.animate-pulse-dot`
 * Opacity cycles 1 -> 0.4 -> 1, repeating.
 */
export function usePulseDot() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return animatedStyle;
}

/**
 * Replaces `.animate-slide-up`
 * translateY from 20 -> 0, opacity from 0 -> 1.
 */
export function useSlideUp(delay: number = 0) {
  const translateY = useSharedValue(20);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) }),
    );
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) }),
    );
  }, [translateY, opacity, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return animatedStyle;
}

/**
 * Replaces `.page-transition`
 * translateY from 8 -> 0, opacity from 0 -> 1.
 */
export function useFadeSlideIn() {
  const translateY = useSharedValue(8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withTiming(0, {
      duration: 400,
      easing: Easing.out(Easing.ease),
    });
    opacity.value = withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.ease),
    });
  }, [translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return animatedStyle;
}

/**
 * Returns 3 animated styles for a searching-dots animation with staggered delays.
 * Each dot scales 1 -> 1.4 -> 1, with 200ms stagger between dots.
 */
export function useSearchingDots() {
  const scale1 = useSharedValue(1);
  const scale2 = useSharedValue(1);
  const scale3 = useSharedValue(1);
  const opacity1 = useSharedValue(0.4);
  const opacity2 = useSharedValue(0.4);
  const opacity3 = useSharedValue(0.4);

  useEffect(() => {
    const bounce = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );

    const fadeIn = withRepeat(
      withSequence(
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 400, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );

    scale1.value = bounce;
    opacity1.value = fadeIn;

    scale2.value = withDelay(200, bounce);
    opacity2.value = withDelay(200, fadeIn);

    scale3.value = withDelay(400, bounce);
    opacity3.value = withDelay(400, fadeIn);
  }, [scale1, scale2, scale3, opacity1, opacity2, opacity3]);

  const dot1 = useAnimatedStyle(() => ({
    transform: [{ scale: scale1.value }],
    opacity: opacity1.value,
  }));

  const dot2 = useAnimatedStyle(() => ({
    transform: [{ scale: scale2.value }],
    opacity: opacity2.value,
  }));

  const dot3 = useAnimatedStyle(() => ({
    transform: [{ scale: scale3.value }],
    opacity: opacity3.value,
  }));

  return [dot1, dot2, dot3] as const;
}
