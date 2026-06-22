import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface Props { onClose: () => void }

export const AboutScreen: React.FC<Props> = ({ onClose }) => {
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={local.head}>
        <Text style={local.title}>About</Text>
        <TouchableOpacity onPress={onClose} style={local.btn}>
          <Ionicons name="close-outline" size={16} color={colors.textSec} />
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <Text style={local.version}>NovaCalc</Text>
        <Text style={local.subtitle}>Scientific Calculator 2026</Text>
        <View style={{ marginTop: 20, alignItems: 'center', gap: 6 }}>
          <Text style={local.info}>Version 1.0.0</Text>
          <Text style={local.info}>Powered by React Native + mathjs</Text>
          <Text style={local.info}>Premium glassmorphism · Landscape optimized</Text>
        </View>
        <View style={local.credits}>
          <Text style={local.creditText}>© 2026 NovaCalc. All rights reserved.</Text>
        </View>
      </View>
    </View>
  );
};

const local = StyleSheet.create({
  head: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, borderBottomWidth: 1, borderBottomColor: colors.glassBorder,
  },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  btn: { width: 30, height: 30, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  version: {
    fontSize: 42, fontWeight: '800',
    color: colors.accent2,
  },
  subtitle: { fontSize: 14, color: colors.textSec, marginTop: 4 },
  info: { fontSize: 13, color: colors.textTer },
  credits: {
    marginTop: 24, paddingTop: 16, borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  creditText: { fontSize: 11, color: colors.textTer },
});
