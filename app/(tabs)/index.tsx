import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/theme';

const VALID_USER = 'admin';
const VALID_PASSWORD = 'admin';

export default function HomeScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (username === VALID_USER && password === VALID_PASSWORD) {
      router.push('/finances');
      return;
    }

    Alert.alert('Acesso negado', 'Usuário ou senha incorretos.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <MaterialIcons name="attach-money" size={115} color={AppColors.secondary} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Controle seus gastos de forma prática e intuitiva
        </Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Usuário"
            placeholderTextColor="#9BA1A6"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Senha"
            placeholderTextColor="#9BA1A6"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={handleLogin}>
          <Text style={styles.buttonText}>entrar</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  topSection: {
    alignItems: 'center',
    paddingTop: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 24,
  },
  subtitle: {
    color: AppColors.secondary,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 280,
  },
  form: {
    width: '100%',
    maxWidth: 280,
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: AppColors.secondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: AppColors.secondary,
    width: '100%',
  },
  button: {
    backgroundColor: AppColors.secondary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 240,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: AppColors.background,
    fontSize: 18,
    fontWeight: '600',
    textTransform: 'lowercase',
  },
});
