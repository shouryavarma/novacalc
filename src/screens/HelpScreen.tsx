import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface Props { onClose: () => void }

export const HelpScreen: React.FC<Props> = ({ onClose }) => {
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={local.head}>
        <Text style={local.title}>Help & Shortcuts</Text>
        <TouchableOpacity onPress={onClose} style={local.btn}>
          <Ionicons name="close-outline" size={16} color={colors.textSec} />
        </TouchableOpacity>
      </View>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Section title="Keyboard Shortcuts">
          <Line><Key>0-9</Key> Digits · <Key>.</Key> Decimal · <Key>+</Key><Key>-</Key><Key>*</Key><Key>/</Key> Operations</Line>
          <Line><Key>Enter</Key> or <Key>=</Key> Calculate · <Key>Esc</Key> Clear · <Key>Del</Key> CE</Line>
          <Line><Key>Backspace</Key> Delete last · <Key>(</Key> <Key>)</Key> Parentheses</Line>
          <Line><Key>S</Key> sin · <Key>C</Key> cos · <Key>T</Key> tan · <Key>L</Key> log · <Key>N</Key> ln</Line>
          <Line><Key>Ctrl+Z</Key> Undo · <Key>Ctrl+Y</Key> Redo</Line>
        </Section>
        <Section title="Scientific Functions">
          <Line><B>Trigonometry:</B> sin, cos, tan, sinh, cosh, tanh, sin⁻¹, cos⁻¹, tan⁻¹</Line>
          <Line><B>Logarithms:</B> log (base 10), ln (natural), 10ˣ, eˣ</Line>
          <Line><B>Powers & Roots:</B> x², x³, xʸ, √, ∛, ʸ√x</Line>
          <Line><B>Others:</B> x!, 1/x, |x|, Mod, Exp, Rand, π, e</Line>
        </Section>
        <Section title="Memory Functions">
          <Line><B>MC</B> Clear · <B>MR</B> Recall · <B>M+</B> Add · <B>M−</B> Subtract · <B>MS</B> Store</Line>
        </Section>
        <Section title="Angle Modes">
          <Line>Use <B>Deg/Rad</B> toggle or <B>DRG</B> to switch. All trig functions respect the current mode.</Line>
          <Line><B>2nd</B> toggles inverse functions (sin⁻¹, cos⁻¹, tan⁻¹) and alternative behaviors.</Line>
        </Section>
      </ScrollView>
    </View>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={{ marginBottom: 20 }}>
    <Text style={{ fontSize: 13, fontWeight: '700', color: colors.accent2, marginBottom: 8 }}>{title}</Text>
    {children}
  </View>
);
const Line: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={{ fontSize: 12, color: colors.textSec, lineHeight: 20, marginBottom: 4 }}>{children}</Text>
);
const B: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={{ fontWeight: '700', color: colors.text }}>{children}</Text>
);
const Key: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={{
    fontFamily: 'monospace', fontSize: 10, color: colors.text,
    backgroundColor: colors.card, paddingHorizontal: 4, paddingVertical: 1,
    borderRadius: 3, borderWidth: 1, borderColor: colors.glassBorder,
    overflow: 'hidden',
  }}> {children} </Text>
);

const local = StyleSheet.create({
  head: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, borderBottomWidth: 1, borderBottomColor: colors.glassBorder,
    backgroundColor: colors.surface,
  },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  btn: { width: 30, height: 30, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
});
