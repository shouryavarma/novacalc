import React, { useState, useEffect, useRef } from 'react';
import { View, Animated, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { SplashScreen } from './src/screens/SplashScreen';
import { CalculatorScreen } from './src/screens/CalculatorScreen';
import { colors } from './src/theme/colors';

function LoadingScreen({ onFinish }: { onFinish: () => void }) {
  const barWidth = useRef(new Animated.Value(0)).current;
  const [step, setStep] = useState('Initializing engine...');
  const [label] = useState('Loading modules');

  const steps = [
    { p: 0.15, s: 'Initializing engine...' },
    { p: 0.30, s: 'Loading UI components...' },
    { p: 0.45, s: 'Configuring display...' },
    { p: 0.60, s: 'Loading 30+ functions...' },
    { p: 0.75, s: 'Preparing storage...' },
    { p: 0.90, s: 'Finalizing...' },
    { p: 1.0, s: 'Ready!' },
  ];

  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      if (i >= steps.length) { clearInterval(iv); return; }
      Animated.timing(barWidth, {
        toValue: steps[i].p,
        duration: 200,
        useNativeDriver: false,
      }).start();
      setStep(steps[i].s);
      i++;
    }, 200);
    const timer = setTimeout(onFinish, 1800);
    return () => { clearInterval(iv); clearTimeout(timer); };
  }, []);

  return (
    <View style={local.loader}>
      <View style={local.track}>
        <Animated.View style={[local.bar, { width: barWidth.interpolate({
          inputRange: [0, 1], outputRange: ['0%', '100%'],
        }) }]} />
      </View>
      <Text style={local.lbl}>{step}</Text>
      <Text style={local.step}>{label}</Text>
    </View>
  );
}

export default function App() {
  const [phase, setPhase] = useState<'splash' | 'loading' | 'calc'>('splash');

  return (
    <SafeAreaProvider>
      <StatusBar style="light" hidden />
      <View style={local.root}>
        {phase === 'splash' && (
          <SplashScreen onFinish={() => setPhase('loading')} />
        )}
        {phase === 'loading' && (
          <LoadingScreen onFinish={() => setPhase('calc')} />
        )}
        {phase === 'calc' && <CalculatorScreen />}
      </View>
    </SafeAreaProvider>
  );
}

const local = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  loader: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20,
    backgroundColor: colors.bg,
  },
  track: {
    width: 260, height: 3,
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden',
  },
  bar: { height: '100%', backgroundColor: colors.accent1, borderRadius: 10 },
  lbl: { fontSize: 11, color: colors.textTer, letterSpacing: 0.5 },
  step: { fontSize: 12, color: colors.textSec },
});
