import { useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export function useSplashMotion() {
  const { width } = useWindowDimensions();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: 1800,
        easing: Easing.inOut(Easing.cubic),
      }),
      -1,
      true,
    );
  }, [progress]);

  const travelDistance = Math.max(0, Math.min(width * 0.62, 250) - 44);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.5, 1], [0.18, 0.32, 0.18]),
    transform: [
      {
        scale: interpolate(progress.value, [0, 0.5, 1], [0.96, 1.04, 0.96]),
      },
    ],
  }));

  const loaderStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(progress.value, [0, 1], [0, travelDistance]),
      },
    ],
  }));

  return {
    glowStyle,
    loaderStyle,
  };
}