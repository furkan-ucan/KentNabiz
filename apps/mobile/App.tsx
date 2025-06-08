import React from 'react';
import { PaperProvider, Text, Card } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { paperTheme } from './src/theme/paperTheme';
import { StyleSheet, View } from 'react-native';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <View style={styles.container}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.title}>
                🏙️ KentNabız Mobil
              </Text>
              <Text variant="bodyLarge" style={styles.subtitle}>
                Mobil uygulama başarıyla kuruldu!
              </Text>
              <Text variant="bodyMedium" style={styles.description}>
                • Redux Toolkit ✅{'\n'}• React Navigation ✅{'\n'}• React Native Paper ✅{'\n'}•
                Shared Package ✅{'\n'}• TypeScript ✅
              </Text>
            </Card.Content>
          </Card>
        </View>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
  },
  card: {
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#20476D',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#475569',
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
    color: '#475569',
  },
});
