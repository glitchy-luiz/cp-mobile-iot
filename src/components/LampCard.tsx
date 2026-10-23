import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { LampReading, LampState } from '../types/mqtt';
import { formatTime } from '../utils/format';

interface Props {
  lamp: LampReading | null;
  pending: LampState | null;
  onCommand: (action: LampState) => void;
}

export function LampCard({ lamp, pending, onCommand }: Props) {
  const { colors } = useTheme();
  const isOn = lamp?.state === 'ON';
  const stateLabel = lamp === null ? 'Desconhecido' : isOn ? 'Ligada' : 'Desligada';

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.info}>
        <Ionicons
          name={isOn ? 'bulb' : 'bulb-outline'}
          size={48}
          color={isOn ? colors.lampOn : colors.textMuted}
        />
        <View style={styles.texts}>
          <Text style={[styles.title, { color: colors.textMuted }]}>Lâmpada</Text>
          <Text style={[styles.state, { color: colors.text }]}>{stateLabel}</Text>
          <Text style={[styles.time, { color: colors.textMuted }]}>
            {lamp === null ? 'Aguardando estado...' : `Atualizado às ${formatTime(lamp.updatedAt)}`}
          </Text>
        </View>
      </View>

      {pending !== null && (
        <View style={styles.pending}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={{ color: colors.textMuted }}>
            Aguardando confirmação ({pending === 'ON' ? 'ligar' : 'desligar'})...
          </Text>
        </View>
      )}

      <View style={styles.buttons}>
        <Pressable
          accessibilityRole="button"
          onPress={() => onCommand('ON')}
          style={({ pressed }) => [styles.button, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]}
        >
          <Text style={[styles.buttonText, { color: colors.onPrimary }]}>Ligar</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => onCommand('OFF')}
          style={({ pressed }) => [
            styles.button,
            styles.outline,
            { borderColor: colors.primary, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={[styles.buttonText, { color: colors.primary }]}>Desligar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 12, borderWidth: 1, gap: 14 },
  info: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  texts: { gap: 2 },
  title: { fontSize: 14, fontWeight: '600' },
  state: { fontSize: 26, fontWeight: '700' },
  time: { fontSize: 12 },
  pending: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttons: { flexDirection: 'row', gap: 12 },
  button: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 10 },
  outline: { borderWidth: 2 },
  buttonText: { fontSize: 16, fontWeight: '700' },
});
