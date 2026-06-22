import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface HistoryEntry {
  expr: string; result: string; time: string; id: number;
}

interface Props {
  history: HistoryEntry[];
  onClear: () => void;
  onSelect: (expr: string) => void;
  onClose: () => void;
}

export const HistoryScreen: React.FC<Props> = ({ history, onClear, onSelect, onClose }) => {
  return (
    <View style={{ flex: 1 }}>
      <View style={local.head}>
        <Text style={local.title}>History</Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <TouchableOpacity onPress={onClear} style={local.btn}>
            <Ionicons name="trash-outline" size={16} color={colors.textSec} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={local.btn}>
            <Ionicons name="close-outline" size={16} color={colors.textSec} />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView style={{ flex: 1, padding: 14 }}>
        {history.length === 0 ? (
          <View style={local.empty}>
            <Ionicons name="time-outline" size={40} color={colors.textTer} />
            <Text style={local.emptyText}>No calculations yet</Text>
          </View>
        ) : (
          history.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => onSelect(item.expr)}
              style={local.item}
            >
              <Text style={local.expr}>{item.expr}</Text>
              <Text style={local.result}>= {item.result}</Text>
              <Text style={local.time}>{item.time}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const local = StyleSheet.create({
  head: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, borderBottomWidth: 1, borderBottomColor: colors.glassBorder,
    backgroundColor: colors.surface,
  },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  btn: { width: 30, height: 30, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  item: {
    padding: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)',
    borderRadius: 7,
  },
  expr: {
    fontFamily: 'monospace', fontSize: 12, color: colors.textSec,
  },
  result: {
    fontFamily: 'monospace', fontSize: 18, fontWeight: '700',
    color: colors.accent2, marginTop: 4,
  },
  time: { fontSize: 10, color: colors.textTer, marginTop: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyText: { color: colors.textTer, fontSize: 14, marginTop: 12 },
});
