import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  message: string;
  visible: boolean;
  type?: 'info' | 'success' | 'error';
  onHide: () => void;
}

export const Toast: React.FC<Props> = ({ message, visible, type = 'info', onHide }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 20, duration: 200, useNativeDriver: true }),
        ]).start(() => onHide());
      }, 2000);
    }
  }, [visible]);

  if (!visible) return null;

  const borderColors = { info: colors.accent1, success: colors.green, error: colors.red };

  return (
    <Animated.View
      style={[
        local.toast,
        { opacity, transform: [{ translateY }], borderLeftColor: borderColors[type] },
      ]}
    >
      <Text style={local.text}>{message}</Text>
    </Animated.View>
  );
};

const local = StyleSheet.create({
  toast: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.glassBorder,
    borderLeftWidth: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  text: { fontSize: 13, color: colors.text },
});
