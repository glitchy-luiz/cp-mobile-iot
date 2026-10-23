import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { HistoryItem } from '../types/mqtt';
import { formatTime } from '../utils/format';

export function MessageItem({ item }: { item: HistoryItem }) {
  const { colors } = useTheme();
  const sent = item.direction === 'sent';

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.row}>
        <View style={styles.direction}>
          <Ionicons
            name={sent ? 'arrow-up-circle' : 'arrow-down-circle'}
            size={20}
            color={sent ? colors.primary : colors.success}
          />
          <Text style={[styles.directionText, { color: colors.text }]}>{sent ? 'Enviada' : 'Recebida'}</Text>
        </View>
        <Text style={[styles.time, { color: colors.textMuted }]}>{formatTime(item.timestamp)}</Text>
      </View>
      <Text style={[styles.topic, { color: colors.textMuted }]}>{item.topic}</Text>
      <Text style={[styles.payload, { color: colors.text }]}>{item.payload}</Text>
      {!item.valid && (
        <Text style={[styles.invalid, { color: colors.danger }]}>Payload inválido: ignorado pelo app</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 12, borderRadius: 12, borderWidth: 1, gap: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  direction: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  directionText: { fontSize: 14, fontWeight: '700' },
  time: { fontSize: 12 },
  topic: { fontSize: 12 },
  payload: { fontSize: 15, fontFamily: undefined },
  invalid: { fontSize: 12, fontWeight: '600' },
});
