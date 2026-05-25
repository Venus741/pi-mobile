import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';

type RegisterForm = {
  email: string;
  password: string;
  confirmPassword: string;
};

const emptyRegisterForm = (): RegisterForm => ({
  email: '',
  password: '',
  confirmPassword: '',
});

export default function HomeScreen() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [registerForm, setRegisterForm] = useState<RegisterForm>(emptyRegisterForm);

  const handleLogin = () => {
    if (login(username, password)) {
      router.push('/finances');
      return;
    }

    Alert.alert('Acesso negado', 'Usuário ou senha incorretos.');
  };

  const openRegisterModal = () => {
    setRegisterForm(emptyRegisterForm());
    setRegisterModalVisible(true);
  };

  const closeRegisterModal = () => {
    setRegisterModalVisible(false);
    setRegisterForm(emptyRegisterForm());
  };

  const handleRegister = () => {
    if (registerForm.password !== registerForm.confirmPassword) {
      Alert.alert('Cadastro', 'As senhas não coincidem.');
      return;
    }

    const result = register(registerForm.email, registerForm.password);
    if (!result.success) {
      Alert.alert('Cadastro', result.message ?? 'Não foi possível cadastrar.');
      return;
    }

    Alert.alert('Cadastro realizado', 'Use seu e-mail e senha para entrar.');
    closeRegisterModal();
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

          <Pressable onPress={openRegisterModal}>
            <Text style={styles.registerLink}>registre-se</Text>
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={handleLogin}>
          <Text style={styles.buttonText}>entrar</Text>
        </Pressable>
      </View>

      <Modal visible={registerModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Criar conta</Text>

            <TextInput
              style={styles.input}
              value={registerForm.email}
              onChangeText={(email) => setRegisterForm((prev) => ({ ...prev, email }))}
              placeholder="E-mail"
              placeholderTextColor="#9BA1A6"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={styles.input}
              value={registerForm.password}
              onChangeText={(password) => setRegisterForm((prev) => ({ ...prev, password }))}
              placeholder="Senha"
              placeholderTextColor="#9BA1A6"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={styles.input}
              value={registerForm.confirmPassword}
              onChangeText={(confirmPassword) =>
                setRegisterForm((prev) => ({ ...prev, confirmPassword }))
              }
              placeholder="Confirmar senha"
              placeholderTextColor="#9BA1A6"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalActions}>
              <Pressable style={styles.modalSecondaryButton} onPress={closeRegisterModal}>
                <Text style={styles.modalSecondaryText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalPrimaryButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleRegister}>
                <Text style={styles.modalPrimaryText}>Cadastrar</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  registerLink: {
    color: AppColors.secondary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginTop: 4,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: AppColors.background,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.secondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalPrimaryButton: {
    flex: 1,
    backgroundColor: AppColors.secondary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalPrimaryText: {
    color: AppColors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  modalSecondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppColors.secondary,
  },
  modalSecondaryText: {
    color: AppColors.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
});
