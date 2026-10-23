import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { useMqtt } from '../context/MqttContext';
import { useTheme } from '../context/ThemeContext';

export function SettingsScreen() {
  const { colors, mode, setMode } = useTheme();
  const { status, error, brokerUrl, connect, disconnect } = useMqtt();
  const [draftUrl, setDraftUrl] = useState(brokerUrl);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Mantém o campo em sincronia quando a URL salva é carregada do AsyncStorage.
  useEffect(() => {
    setDraftUrl(brokerUrl);
  }, [brokerUrl]);

  const isActive = status === 'connected' || status === 'connecting';

  const handleConnect = () => {
    const url = draftUrl.trim();
    if (!/^wss?:\/\/.+/i.test(url)) {
      setValidationError('Informe uma URL WebSocket começando com ws:// ou wss://');
      return;
    }
    setValidationError(null);
    connect(url);
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <ConnectionStatus status={status} />
      {status === 'error' && error !== null && <Text style={{ color: colors.danger }}>{error}</Text>}

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>URL WebSocket do broker</Text>
        <TextInput
          value={draftUrl}
          onChangeText={setDraftUrl}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          placeholder="wss://broker.hivemq.com:8884/mqtt"
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            { color: colors.text, backgroundColor: colors.surface, borderColor: validationError ? colors.danger : colors.border },
          ]}
        />
        {validationError !== null && <Text style={{ color: colors.danger }}>{validationError}</Text>}
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          HiveMQ público: wss://broker.hivemq.com:8884/mqtt (TLS) ou ws://broker.hivemq.com:8000/mqtt. A porta
          1883 é MQTT sobre TCP e não funciona neste app.
        </Text>
      </View>

      <View style={styles.buttons}>
        <Pressable
          accessibilityRole="button"
          onPress={handleConnect}
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
            {isActive ? 'Salvar e reconectar' : 'Conectar'}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={disconnect}
          disabled={status === 'disconnected'}
          style={[
            styles.button,
            styles.outline,
            { borderColor: colors.primary, opacity: status === 'disconnected' ? 0.4 : 1 },
          ]}
        >
          <Text style={[styles.buttonText, { color: colors.primary }]}>Desconectar</Text>
        </Pressable>
      </View>

      <View style={[styles.themeRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.text }]}>Tema escuro</Text>
        <Switch
          value={mode === 'dark'}
          onValueChange={(value) => setMode(value ? 'dark' : 'light')}
          trackColor={{ true: colors.primary, false: colors.border }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 18 },
  field: { gap: 8 },
  label: { fontSize: 16, fontWeight: '600' },
  input: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15 },
  hint: { fontSize: 12, lineHeight: 18 },
  buttons: { flexDirection: 'row', gap: 12 },
  button: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 10 },
  outline: { borderWidth: 2 },
  buttonText: { fontSize: 15, fontWeight: '700' },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
});
