import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { MessageItem } from '../components/MessageItem';
import { useMqtt } from '../context/MqttContext';
import { useTheme } from '../context/ThemeContext';

export function HistoryScreen() {
  const { colors } = useTheme();
  const { history } = useMqtt();

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      data={history}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <MessageItem item={item} />}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={
        <Text style={[styles.empty, { color: colors.textMuted }]}>
          Nenhuma mensagem ainda. Conecte-se ao broker e inicie o simulador para ver o tráfego aqui.
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, flexGrow: 1 },
  separator: { height: 10 },
  empty: { textAlign: 'center', marginTop: 48, fontSize: 15, lineHeight: 22 },
});
