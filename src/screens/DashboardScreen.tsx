import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { LampCard } from '../components/LampCard';
import { SensorCard } from '../components/SensorCard';
import { useMqtt } from '../context/MqttContext';
import { useTheme } from '../context/ThemeContext';

export function DashboardScreen() {
  const { colors } = useTheme();
  const { status, error, temperature, humidity, lamp, pendingCommand, notice, connect, sendLampCommand } =
    useMqtt();

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <View style={styles.statusRow}>
        <ConnectionStatus status={status} />
        {(status === 'error' || status === 'disconnected') && (
          <Pressable
            accessibilityRole="button"
            onPress={() => connect()}
            style={[styles.reconnect, { borderColor: colors.primary }]}
          >
            <Text style={{ color: colors.primary, fontWeight: '700' }}>Reconectar</Text>
          </Pressable>
        )}
      </View>

      {status === 'error' && error !== null && (
        <View style={[styles.banner, { borderColor: colors.danger, backgroundColor: colors.surface }]}>
          <Text style={{ color: colors.danger }}>{error}</Text>
        </View>
      )}

      {notice !== null && (
        <View style={[styles.banner, { borderColor: colors.warning, backgroundColor: colors.surface }]}>
          <Text style={{ color: colors.warning }}>{notice}</Text>
        </View>
      )}

      <View style={styles.sensors}>
        <SensorCard
          label="Temperatura"
          icon="thermometer-outline"
          value={temperature?.value ?? null}
          unit=" °C"
          updatedAt={temperature?.updatedAt ?? null}
        />
        <SensorCard
          label="Umidade"
          icon="water-outline"
          value={humidity?.value ?? null}
          unit="%"
          updatedAt={humidity?.updatedAt ?? null}
        />
      </View>

      <LampCard lamp={lamp} pending={pendingCommand} onCommand={sendLampCommand} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reconnect: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  banner: { padding: 12, borderRadius: 10, borderWidth: 1 },
  sensors: { flexDirection: 'row', gap: 12 },
});
