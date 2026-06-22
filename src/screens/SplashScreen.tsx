import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  onFinish: () => void;
}

export const SplashScreen: React.FC<Props> = ({ onFinish }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(onFinish, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={local.container}>
      <Animated.View style={{ opacity, transform: [{ scale }], alignItems: 'center' }}>
        <Text style={local.logo}>NovaCalc</Text>
        <Text style={local.sub}>Scientific Calculator 2026</Text>
        <View style={local.dots}>
          {[0, 1, 2, 3].map((i) => (
            <Dot key={i} delay={i * 0.15} />
          ))}
        </View>
      </Animated.View>
      <Text style={local.version}>v1.0.0</Text>
    </View>
  );
};

const Dot: React.FC<{ delay: number }> = ({ delay }) => {
  const anim = useRef(new Animated.Value(0.4)).current;
  const started = useRef(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (started.current) return;
      started.current = true;
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.4, duration: 400, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [delay, anim]);
  return <Animated.View style={[local.dot, { opacity: anim, transform: [{ scale: anim }] }]} />;
};

const local = StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  logo: {
    fontSize: 56, fontWeight: '800', letterSpacing: -1.5,
    color: colors.accent2,
  },
  sub: {
    fontSize: 14, color: colors.textSec, marginTop: 6,
    letterSpacing: 3, textTransform: 'uppercase',
  },
  dots: { flexDirection: 'row', gap: 5, marginTop: 32 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.accent1 },
  version: {
    position: 'absolute', bottom: 40,
    fontSize: 10, color: colors.textTer, letterSpacing: 1,
  },
});
