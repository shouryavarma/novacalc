import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface Settings {
  largeDisplay: boolean; sound: boolean; autoSave: boolean; idleTimeout: number;
}

interface Props {
  settings: Settings;
  onUpdate: (s: Settings) => void;
  onClose: () => void;
}

export const SettingsScreen: React.FC<Props> = ({ settings, onUpdate, onClose }) => {
  const toggle = (key: keyof Settings) => {
    if (key === 'idleTimeout') return;
    onUpdate({ ...settings, [key]: !settings[key] });
  };

  const Toggle: React.FC<{ value: boolean; onToggle: () => void }> = ({ value, onToggle }) => (
    <TouchableOpacity
      onPress={onToggle}
      style={[local.toggle, value && local.toggleOn]}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
    >
      <View style={[local.knob, value && local.knobOn]} />
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={local.head}>
        <Text style={local.title}>Settings</Text>
        <TouchableOpacity onPress={onClose} style={local.btn}>
          <Ionicons name="close-outline" size={16} color={colors.textSec} />
        </TouchableOpacity>
      </View>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Group title="Display">
          <Row
            label="Large Display"
            desc="Increase font sizes"
            control={<Toggle value={settings.largeDisplay} onToggle={() => toggle('largeDisplay')} />}
          />
          <Row
            label="Sound Effects"
            desc="Button click sounds"
            control={<Toggle value={settings.sound} onToggle={() => toggle('sound')} />}
          />
        </Group>
        <Group title="Session">
          <Row
            label="Auto-Save History"
            desc="Persist calculations between sessions"
            control={<Toggle value={settings.autoSave} onToggle={() => toggle('autoSave')} />}
          />
          <Row
            label="Inactivity Timeout"
            desc={`${settings.idleTimeout === 0 ? 'Never' : settings.idleTimeout / 60 + ' min'}`}
            control={<Toggle value={settings.idleTimeout > 0} onToggle={() => onUpdate({ ...settings, idleTimeout: settings.idleTimeout > 0 ? 0 : 600 })} />}
          />
        </Group>
        <Group title="About">
          <Text style={{ fontSize: 12, color: colors.textTer, lineHeight: 18 }}>
            NovaCalc v1.0.0{'\n'}
            Built with React Native + mathjs{'\n'}
            Glassmorphism design · Landscape optimized
          </Text>
        </Group>
      </ScrollView>
    </View>
  );
};

const Group: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={{ marginBottom: 20 }}>
    <Text style={{
      fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8,
      color: colors.textSec, marginBottom: 8,
    }}>{title}</Text>
    {children}
  </View>
);

const Row: React.FC<{ label: string; desc: string; control: React.ReactNode }> = ({ label, desc, control }) => (
  <View style={local.row}>
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 13, color: colors.text }}>{label}</Text>
      <Text style={{ fontSize: 10, color: colors.textTer, marginTop: 2 }}>{desc}</Text>
    </View>
    {control}
  </View>
);

const local = StyleSheet.create({
  head: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, borderBottomWidth: 1, borderBottomColor: colors.glassBorder,
    backgroundColor: colors.surface,
  },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  btn: { width: 30, height: 30, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  toggle: {
    width: 38, height: 20, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)', padding: 2,
    justifyContent: 'center',
  },
  toggleOn: { backgroundColor: colors.accent1 },
  knob: { width: 16, height: 16, borderRadius: 8, backgroundColor: colors.text },
  knobOn: { alignSelf: 'flex-end' },
});
