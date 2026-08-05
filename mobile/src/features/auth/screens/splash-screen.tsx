import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { Fonts, Spacing } from '@/constants/theme';

import { useSplashMotion } from '../hooks/use-splash-motion';

export function SplashScreenView() {
  const hasHiddenSplash = useRef(false);
  const { glowStyle, loaderStyle } = useSplashMotion();

  const handleLayout = useCallback(() => {
    if (hasHiddenSplash.current) {
      return;
    }

    hasHiddenSplash.current = true;
    void SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} onLayout={handleLayout}>
      <View style={styles.background}>
        <Animated.View entering={FadeInDown.duration(900).delay(80)} style={styles.orbTop} />
        <Animated.View entering={FadeInUp.duration(900).delay(120)} style={styles.orbBottom} />
        <Animated.View style={[styles.glowRing, glowStyle]}>
          <Image
            source={require('@/assets/images/logo-glow.png')}
            style={styles.glowImage}
            contentFit="cover"
          />
        </Animated.View>

        <View style={styles.content}>
          <Animated.View entering={FadeInDown.duration(700).delay(140)} style={styles.logoWrap}>
            <View style={styles.logoFrame}>
              <Image
                source={require('@/assets/images/splash-icon.png')}
                style={styles.logo}
                contentFit="contain"
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(700).delay(220)} style={styles.textBlock}>
            <View style={styles.kickerPill}>
              <Animated.Text style={styles.kicker}>Football social network</Animated.Text>
            </View>
            <Animated.Text style={styles.title}>10in</Animated.Text>
            <Animated.Text style={styles.subtitle}>
              Clubs, matchs, chat et communauté dans une seule expérience mobile.
            </Animated.Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(700).delay(320)} style={styles.loaderSection}>
            <View style={styles.loaderTrack}>
              <Animated.View style={[styles.loaderDot, loaderStyle]} />
            </View>
            <Animated.Text style={styles.loaderLabel}>Initialisation de la session...</Animated.Text>
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default SplashScreenView;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#09090B',
  },
  background: {
    flex: 1,
    backgroundColor: '#09090B',
    paddingHorizontal: Spacing.four,
    overflow: 'hidden',
  },
  orbTop: {
    position: 'absolute',
    top: -48,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 180,
    backgroundColor: '#22C55E',
    opacity: 0.12,
  },
  orbBottom: {
    position: 'absolute',
    bottom: -60,
    left: -32,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: '#14532D',
    opacity: 0.24,
  },
  glowRing: {
    position: 'absolute',
    alignSelf: 'center',
    top: '16%',
    width: 300,
    height: 300,
    borderRadius: 300,
  },
  glowImage: {
    width: '100%',
    height: '100%',
    opacity: 0.95,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.five,
    maxWidth: 460,
    alignSelf: 'center',
    width: '100%',
  },
  logoWrap: {
    padding: 12,
    borderRadius: 32,
    backgroundColor: 'rgba(24, 24, 27, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  logoFrame: {
    width: 118,
    height: 118,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F1115',
  },
  logo: {
    width: 92,
    height: 92,
  },
  textBlock: {
    alignItems: 'center',
    gap: Spacing.three,
  },
  kickerPill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.28)',
  },
  kicker: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FAFAFA',
    fontSize: 56,
    lineHeight: 58,
    fontWeight: '800',
    letterSpacing: -1.8,
    fontFamily: Fonts.sans,
  },
  subtitle: {
    color: '#A1A1AA',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 320,
    fontWeight: '500',
  },
  loaderSection: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.two,
  },
  loaderTrack: {
    width: '68%',
    maxWidth: 280,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#27272A',
    overflow: 'hidden',
  },
  loaderDot: {
    width: 44,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#22C55E',
    shadowColor: '#22C55E',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },
  loaderLabel: {
    color: '#FAFAFA',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});