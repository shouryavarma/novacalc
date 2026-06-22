import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle,
  Animated,
} from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  label: string;
  variant?: 'num' | 'op' | 'eq' | 'clr' | 'fn' | 'log' | 'pw' | 'mem' | 'cn' | 'bs';
  onPress: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const CalcButton: React.FC<Props> = ({
  label, variant = 'num', onPress, onLongPress, style, textStyle,
}) => {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.94, useNativeDriver: true, friction: 8, tension: 200,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1, useNativeDriver: true, friction: 5, tension: 100,
    }).start();
  };

  const btnStyles: Record<string, any> = {
    num: { bg: colors.card, txt: colors.text },
    op: { bg: 'rgba(0,206,201,0.05)', txt: colors.cyan, border: 'rgba(0,206,201,0.08)' },
    eq: { bg: colors.accent1, txt: colors.bg, border: 'transparent' },
    clr: { bg: 'rgba(255,107,107,0.05)', txt: colors.red, border: 'rgba(255,107,107,0.08)' },
    fn: { bg: 'rgba(162,155,254,0.04)', txt: colors.fnTrig, border: 'rgba(162,155,254,0.06)' },
    log: { bg: 'rgba(0,206,201,0.04)', txt: colors.fnLog, border: 'rgba(0,206,201,0.06)' },
    pw: { bg: 'rgba(253,203,110,0.04)', txt: colors.fnPwr, border: 'rgba(253,203,110,0.06)' },
    mem: { bg: 'rgba(116,185,255,0.04)', txt: colors.fnMem, border: 'rgba(116,185,255,0.06)' },
    cn: { bg: 'rgba(253,121,168,0.04)', txt: colors.fnConst, border: 'rgba(253,121,168,0.06)' },
    bs: { bg: 'rgba(253,203,110,0.05)', txt: colors.orange, border: 'rgba(253,203,110,0.08)' },
  };

  const s = btnStyles[variant];
  const isEq = variant === 'eq';

  return (
    <Animated.View style={{ transform: [{ scale }], flex: 1 }}>
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
        style={[
          localStyles.btn,
          { backgroundColor: s.bg, borderColor: s.border || colors.glassBorder },
          style,
        ]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Text
          style={[
            localStyles.btnText,
            { color: s.txt },
            isEq && localStyles.eqText,
            variant === 'num' && localStyles.numText,
            variant === 'fn' && localStyles.fnText,
            variant === 'log' && localStyles.fnText,
            variant === 'mem' && localStyles.memText,
            textStyle,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const localStyles = StyleSheet.create({
  btn: {
    minHeight: 40, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, paddingHorizontal: 4,
  },
  btnText: { fontSize: 13, fontWeight: '600' },
  eqText: { fontSize: 18, fontWeight: '800' },
  numText: { fontSize: 16, fontWeight: '700' },
  fnText: { fontSize: 11 },
  memText: { fontSize: 10 },
});
