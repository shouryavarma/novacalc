import React from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  expression: string;
  result: string;
  preview: string;
  angleMode: string;
  is2nd: boolean;
  hasMemory: boolean;
  error: boolean;
}

export const Display: React.FC<Props> = ({
  expression, result, preview, angleMode, is2nd, hasMemory, error,
}) => {
  return (
    <View style={local.container}>
      {hasMemory && (
        <View style={local.memBadge}>
          <Text style={local.memText}>M</Text>
        </View>
      )}
      <View style={local.modeRow}>
        <View style={[local.modeChip, angleMode === 'deg' && local.modeActive]}>
          <View style={[local.dot, { backgroundColor: colors.cyan }]} />
          <Text style={[local.modeText, angleMode === 'deg' && local.modeTextActive]}>DEG</Text>
        </View>
        <View style={[local.modeChip, angleMode === 'rad' && local.modeActive]}>
          <View style={[local.dot, { backgroundColor: colors.orange }]} />
          <Text style={[local.modeText, angleMode === 'rad' && local.modeTextActive]}>RAD</Text>
        </View>
        <View style={[local.modeChip, is2nd && local.modeActive]}>
          <Text style={[local.modeText, is2nd && local.modeTextActive]}>2nd</Text>
        </View>
      </View>
      <View style={local.exprArea}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Text style={local.preview}>{preview}</Text>
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Text style={local.expression} selectable>{expression}</Text>
        </ScrollView>
        {result ? (
          <Text style={[local.result, error && local.resultError]} selectable>
            {result}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const local = StyleSheet.create({
  container: {
    padding: 14, justifyContent: 'flex-end',
    backgroundColor: colors.surface,
    minHeight: 120,
  },
  memBadge: {
    position: 'absolute', top: 10, right: 12,
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 10, backgroundColor: 'rgba(116,185,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(116,185,255,0.12)',
  },
  memText: { fontSize: 9, color: colors.fnMem, fontWeight: '600' },
  modeRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  modeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
  },
  modeActive: { backgroundColor: 'rgba(108,92,231,0.12)', borderColor: colors.accent1 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  modeText: { fontSize: 9, color: colors.textTer },
  modeTextActive: { color: colors.accent2 },
  exprArea: { gap: 2 },
  preview: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12, color: colors.textTer, textAlign: 'right', minHeight: 16,
  },
  expression: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 22, color: colors.text, textAlign: 'right', lineHeight: 30,
  },
  result: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 36, fontWeight: '700', color: colors.accent2, textAlign: 'right', lineHeight: 44,
  },
  resultError: { color: colors.red },
});
