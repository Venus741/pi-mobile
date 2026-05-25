import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/theme';
import { useFinances } from '@/contexts/finances-context';
import type { Expense, PaymentMethod } from '@/types/expense';
import { PAYMENT_METHODS } from '@/types/expense';
import { centsFromInput, formatBRLAmount, formatBRLInput } from '@/utils/currency';
import {
  dateBRToISO,
  dateISOToBR,
  formatDateInput,
  getTodayDateBR,
  isValidDateBR,
} from '@/utils/date';

type ExpenseForm = {
  name: string;
  valueCents: number;
  description: string;
  paymentMethod: PaymentMethod;
  date: string;
};

const emptyForm = (): ExpenseForm => ({
  name: '',
  valueCents: 0,
  description: '',
  paymentMethod: 'Pix',
  date: getTodayDateBR(),
});

function PaymentMethodSelector({
  value,
  onChange,
}: {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}) {
  return (
    <View style={styles.paymentField}>
      <Text style={styles.fieldLabel}>Forma de pagamento</Text>
      <View style={styles.paymentOptions}>
        {PAYMENT_METHODS.map((method) => {
          const selected = value === method;
          return (
            <Pressable
              key={method}
              style={[styles.paymentOption, selected && styles.paymentOptionSelected]}
              onPress={() => onChange(method)}>
              <Text
                style={[
                  styles.paymentOptionText,
                  selected && styles.paymentOptionTextSelected,
                ]}>
                {method}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function CurrencyInput({
  valueCents,
  onChangeCents,
  style,
  placeholder,
  multiline,
}: {
  valueCents: number;
  onChangeCents: (cents: number) => void;
  style?: object;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <TextInput
      style={style}
      value={valueCents > 0 ? formatBRLInput(valueCents) : ''}
      onChangeText={(text) => onChangeCents(centsFromInput(text))}
      placeholder={placeholder}
      placeholderTextColor="#9BA1A6"
      keyboardType="numeric"
      multiline={multiline}
    />
  );
}

export default function FinancesScreen() {
  const router = useRouter();
  const { expenses, setExpenses } = useFinances();
  const [walletCents, setWalletCents] = useState(0);

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createForm, setCreateForm] = useState<ExpenseForm>(emptyForm);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editForm, setEditForm] = useState<ExpenseForm>(emptyForm);

  const [infoMenuVisible, setInfoMenuVisible] = useState(false);

  const totalExpensesCents = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.valueCents, 0),
    [expenses],
  );

  const hasSalary = walletCents > 0;
  const walletBalanceCents = hasSalary ? walletCents - totalExpensesCents : 0;
  const isWalletNegative = hasSalary && walletBalanceCents < 0;
  const walletDisplay = formatBRLAmount(walletBalanceCents);

  const hasEditChanges = useMemo(() => {
    if (!editingExpense) return false;
    return (
      editForm.name !== editingExpense.name ||
      editForm.valueCents !== editingExpense.valueCents ||
      editForm.description !== editingExpense.description ||
      editForm.paymentMethod !== (editingExpense.paymentMethod ?? 'Pix') ||
      editForm.date !==
        (editingExpense.date ? dateISOToBR(editingExpense.date) : getTodayDateBR())
    );
  }, [editingExpense, editForm]);

  const openCreateModal = () => {
    setCreateForm(emptyForm());
    setCreateModalVisible(true);
  };

  const closeCreateModal = () => {
    setCreateModalVisible(false);
    setCreateForm(emptyForm());
  };

  const handleRegisterExpense = () => {
    if (!createForm.name.trim() || createForm.valueCents <= 0) return;

    if (!isValidDateBR(createForm.date)) {
      Alert.alert('Data inválida', 'Informe a data no formato DD/MM/AAAA.');
      return;
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      name: createForm.name.trim(),
      valueCents: createForm.valueCents,
      description: createForm.description.trim(),
      paymentMethod: createForm.paymentMethod,
      date: dateBRToISO(createForm.date),
    };

    setExpenses((prev) => [newExpense, ...prev]);
    closeCreateModal();
  };

  const openEditModal = useCallback((expense: Expense) => {
    setEditingExpense(expense);
    setEditForm({
      name: expense.name,
      valueCents: expense.valueCents,
      description: expense.description,
      paymentMethod: expense.paymentMethod ?? 'Pix',
      date: expense.date ? dateISOToBR(expense.date) : getTodayDateBR(),
    });
    setEditModalVisible(true);
  }, []);

  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditingExpense(null);
    setEditForm(emptyForm());
  };

  const handleSaveEdit = () => {
    if (!editingExpense || !hasEditChanges) return;
    if (!editForm.name.trim() || editForm.valueCents <= 0) return;

    if (!isValidDateBR(editForm.date)) {
      Alert.alert('Data inválida', 'Informe a data no formato DD/MM/AAAA.');
      return;
    }

    setExpenses((prev) =>
      prev.map((item) =>
        item.id === editingExpense.id
          ? {
              ...item,
              name: editForm.name.trim(),
              valueCents: editForm.valueCents,
              description: editForm.description.trim(),
              paymentMethod: editForm.paymentMethod,
              date: dateBRToISO(editForm.date),
            }
          : item,
      ),
    );
    closeEditModal();
  };

  const handleRemoveExpense = () => {
    if (!editingExpense) return;
    setExpenses((prev) => prev.filter((item) => item.id !== editingExpense.id));
    closeEditModal();
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <Pressable
      style={({ pressed }) => [styles.expenseItem, pressed && styles.expenseItemPressed]}
      onPress={() => openEditModal(item)}>
      <Text style={styles.expenseName}>{item.name}</Text>
      <Text style={styles.expenseValue}>R$ {formatBRLAmount(item.valueCents)}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <CurrencyInput
          valueCents={walletCents}
          onChangeCents={setWalletCents}
          style={styles.walletInput}
          placeholder="Adicionar salário"
        />
        <Text
          style={[
            styles.walletLabel,
            isWalletNegative && styles.walletLabelNegative,
          ]}>
          Minha carteira: R$ {walletDisplay}
        </Text>
      </View>

      <View style={styles.body}>
        <View style={styles.actionRow}>
          <Pressable
            style={({ pressed }) => [
              styles.registerButton,
              styles.registerButtonFlex,
              pressed && styles.buttonPressed,
            ]}
            onPress={openCreateModal}>
            <Text style={styles.registerButtonText}>registrar gasto</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.infoButton, pressed && styles.buttonPressed]}
            onPress={() => setInfoMenuVisible(true)}
            accessibilityLabel="Informações dos gastos">
            <MaterialIcons name="info" size={28} color={AppColors.background} />
          </Pressable>
        </View>

        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          renderItem={renderExpenseItem}
          style={styles.expenseList}
          contentContainerStyle={styles.expenseListContent}
          ListEmptyComponent={
            <Text style={styles.emptyList}>Nenhum gasto registrado ainda.</Text>
          }
        />
      </View>

      <Modal visible={createModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Registrar gasto</Text>

            <TextInput
              style={styles.modalInput}
              value={createForm.name}
              onChangeText={(name) => setCreateForm((prev) => ({ ...prev, name }))}
              placeholder="Nome"
              placeholderTextColor="#9BA1A6"
            />

            <CurrencyInput
              valueCents={createForm.valueCents}
              onChangeCents={(valueCents) => setCreateForm((prev) => ({ ...prev, valueCents }))}
              style={styles.modalInput}
              placeholder="Valor"
            />

            <View style={styles.paymentField}>
              <Text style={styles.fieldLabel}>Data do gasto</Text>
              <TextInput
                style={styles.modalInput}
                value={createForm.date}
                onChangeText={(text) =>
                  setCreateForm((prev) => ({ ...prev, date: formatDateInput(text) }))
                }
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#9BA1A6"
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            <PaymentMethodSelector
              value={createForm.paymentMethod}
              onChange={(paymentMethod) => setCreateForm((prev) => ({ ...prev, paymentMethod }))}
            />

            <TextInput
              style={[styles.modalInput, styles.modalDescriptionInput]}
              value={createForm.description}
              onChangeText={(description) => setCreateForm((prev) => ({ ...prev, description }))}
              placeholder="Descrição"
              placeholderTextColor="#9BA1A6"
              multiline
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <Pressable style={styles.modalSecondaryButton} onPress={closeCreateModal}>
                <Text style={styles.modalSecondaryText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalPrimaryButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleRegisterExpense}>
                <Text style={styles.modalPrimaryText}>registrar</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={editModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Detalhes do gasto</Text>

              <TextInput
                style={styles.modalInput}
                value={editForm.name}
                onChangeText={(name) => setEditForm((prev) => ({ ...prev, name }))}
                placeholder="Nome"
                placeholderTextColor="#9BA1A6"
              />

              <CurrencyInput
                valueCents={editForm.valueCents}
                onChangeCents={(valueCents) => setEditForm((prev) => ({ ...prev, valueCents }))}
                style={styles.modalInput}
                placeholder="Valor"
              />

              <View style={styles.paymentField}>
                <Text style={styles.fieldLabel}>Data do gasto</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editForm.date}
                  onChangeText={(text) =>
                    setEditForm((prev) => ({ ...prev, date: formatDateInput(text) }))
                  }
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor="#9BA1A6"
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>

              <PaymentMethodSelector
                value={editForm.paymentMethod}
                onChange={(paymentMethod) => setEditForm((prev) => ({ ...prev, paymentMethod }))}
              />

              <TextInput
                style={[styles.modalInput, styles.modalDescriptionInput]}
                value={editForm.description}
                onChangeText={(description) =>
                  setEditForm((prev) => ({ ...prev, description }))
                }
                placeholder="Descrição"
                placeholderTextColor="#9BA1A6"
                multiline
                textAlignVertical="top"
              />

              <View style={styles.modalActionsColumn}>
                <Pressable
                  style={({ pressed }) => [
                    styles.modalPrimaryButton,
                    !hasEditChanges && styles.modalButtonDisabled,
                    pressed && hasEditChanges && styles.buttonPressed,
                  ]}
                  onPress={handleSaveEdit}
                  disabled={!hasEditChanges}>
                  <Text style={styles.modalPrimaryText}>salvar alteração</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.modalDangerButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={handleRemoveExpense}>
                  <Text style={styles.modalDangerText}>remover</Text>
                </Pressable>

                <Pressable style={styles.modalSecondaryButton} onPress={closeEditModal}>
                  <Text style={styles.modalSecondaryText}>Fechar</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={infoMenuVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setInfoMenuVisible(false)} />
          <View style={styles.infoMenuContent}>
            <Text style={styles.modalTitle}>Opções</Text>

            <Pressable
              style={({ pressed }) => [styles.infoMenuOption, pressed && styles.buttonPressed]}
              onPress={() => {
                setInfoMenuVisible(false);
                router.push('/info');
              }}>
              <Text style={styles.infoMenuOptionText}>Ranking de gastos</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.infoMenuOption, pressed && styles.buttonPressed]}
              onPress={() => {
                setInfoMenuVisible(false);
                router.push('/history');
              }}>
              <Text style={styles.infoMenuOptionText}>Veja gastos passados</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    justifyContent: 'flex-start',
  },
  walletInput: {
    borderWidth: 1,
    borderColor: AppColors.secondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: AppColors.secondary,
    alignSelf: 'stretch',
  },
  walletLabel: {
    marginTop: 12,
    fontSize: 24,
    fontWeight: '600',
    color: AppColors.secondary,
  },
  walletLabelNegative: {
    color: AppColors.negative,
  },
  body: {
    flex: 3,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  registerButton: {
    backgroundColor: AppColors.secondary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  registerButtonFlex: {
    flex: 1,
  },
  infoButton: {
    backgroundColor: AppColors.secondary,
    width: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonText: {
    color: AppColors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  expenseList: {
    flex: 1,
  },
  expenseListContent: {
    paddingBottom: 24,
    gap: 8,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: AppColors.secondary,
    borderRadius: 8,
  },
  expenseItemPressed: {
    opacity: 0.85,
  },
  expenseName: {
    fontSize: 16,
    color: AppColors.secondary,
    fontWeight: '500',
    flex: 1,
    marginRight: 12,
  },
  expenseValue: {
    fontSize: 16,
    color: AppColors.secondary,
    fontWeight: '600',
  },
  emptyList: {
    textAlign: 'center',
    color: '#9BA1A6',
    marginTop: 24,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
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
  },
  modalInput: {
    borderWidth: 1,
    borderColor: AppColors.secondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: AppColors.secondary,
  },
  modalDescriptionInput: {
    minHeight: 100,
    paddingTop: 12,
  },
  paymentField: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.secondary,
  },
  paymentOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paymentOption: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.secondary,
  },
  paymentOptionSelected: {
    backgroundColor: AppColors.secondary,
  },
  paymentOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.secondary,
  },
  paymentOptionTextSelected: {
    color: AppColors.background,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalActionsColumn: {
    gap: 10,
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
  modalDangerButton: {
    backgroundColor: '#c62828',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalDangerText: {
    color: AppColors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonDisabled: {
    opacity: 0.4,
  },
  infoMenuContent: {
    backgroundColor: AppColors.background,
    borderRadius: 16,
    padding: 20,
    gap: 12,
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
  },
  infoMenuOption: {
    backgroundColor: AppColors.secondary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  infoMenuOptionText: {
    color: AppColors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});
