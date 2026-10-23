import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { formatTime } from '../utils/format';

interface Props {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: number | null;
  unit: string;
  updatedAt: number | null;
}

export function SensorCard({ label, icon, value, unit, updatedAt }: Props) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Ionicons name={icon} size={20} color={colors.primary} />
        <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      </View>
      <Text style={[styles.value, { color: colors.text }]}>
        {value === null ? '—' : `${value}${unit}`}
      </Text>
      <Text style={[styles.time, { color: colors.textMuted }]}>
        {updatedAt === null ? 'Aguardando dados...' : `Atualizado às ${formatTime(updatedAt)}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 1, gap: 6 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { fontSize: 14, fontWeight: '600' },
  value: { fontSize: 32, fontWeight: '700' },
  time: { fontSize: 12 },
});
