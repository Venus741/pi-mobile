import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/theme';
import { useFinances } from '@/contexts/finances-context';
import { formatBRLAmount } from '@/utils/currency';
import { dateISOToBR } from '@/utils/date';
import {
  buildMonthYearPeriods,
  filterExpensesByPeriod,
  type MonthYearPeriod,
} from '@/utils/expense-period';

export default function HistoryScreen() {
  const router = useRouter();
  const { expenses } = useFinances();
  const [selectedPeriod, setSelectedPeriod] = useState<MonthYearPeriod | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  const periods = useMemo(() => buildMonthYearPeriods(expenses), [expenses]);

  useEffect(() => {
    if (periods.length === 0) {
      setSelectedPeriod(null);
      return;
    }

    const stillValid = selectedPeriod && periods.some((p) => p.key === selectedPeriod.key);
    if (!stillValid) {
      setSelectedPeriod(periods[0]);
    }
  }, [periods, selectedPeriod]);

  const filteredExpenses = useMemo(() => {
    if (!selectedPeriod) return [];
    return filterExpensesByPeriod(expenses, selectedPeriod.key);
  }, [expenses, selectedPeriod]);

  const monthTotalCents = useMemo(
    () => filteredExpenses.reduce((sum, expense) => sum + expense.valueCents, 0),
    [filteredExpenses],
  );

  return (
    <SafeAreaView style={styles.container}>
      <Pressable
        style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
        onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={28} color={AppColors.secondary} />
      </Pressable>

      <Text style={styles.title}>Veja gastos passados</Text>

      <View style={styles.content}>
        <Text style={styles.fieldLabel}>Mês/ano</Text>
        <Pressable
          style={({ pressed }) => [styles.selectInput, pressed && styles.buttonPressed]}
          onPress={() => periods.length > 0 && setPickerVisible(true)}
          disabled={periods.length === 0}>
          <Text style={styles.selectInputText}>
            {selectedPeriod?.label ?? 'Nenhum período disponível'}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={24} color={AppColors.secondary} />
        </Pressable>

        {selectedPeriod && (
          <Text style={styles.totalLabel}>
            Total do mês: R$ {formatBRLAmount(monthTotalCents)}
          </Text>
        )}

        <FlatList
          data={filteredExpenses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyList}>
              {periods.length === 0
                ? 'Nenhum gasto registrado com data.'
                : 'Nenhum gasto neste período.'}
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.expenseRow}>
              <View style={styles.expenseInfo}>
                <Text style={styles.expenseName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.expenseDate}>
                  {item.date ? dateISOToBR(item.date) : '—'}
                </Text>
              </View>
              <Text style={styles.expenseValue}>R$ {formatBRLAmount(item.valueCents)}</Text>
            </View>
          )}
        />
      </View>

      <Modal visible={pickerVisible} animationType="fade" transparent>
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerBackdrop} onPress={() => setPickerVisible(false)} />
          <View style={styles.pickerContent}>
            <Text style={styles.pickerTitle}>Selecione mês/ano</Text>
            {periods.map((period) => (
              <Pressable
                key={period.key}
                style={({ pressed }) => [
                  styles.pickerOption,
                  selectedPeriod?.key === period.key && styles.pickerOptionSelected,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => {
                  setSelectedPeriod(period);
                  setPickerVisible(false);
                }}>
                <Text
                  style={[
                    styles.pickerOptionText,
                    selectedPeriod?.key === period.key && styles.pickerOptionTextSelected,
                  ]}>
                  {period.label}
                </Text>
              </Pressable>
            ))}
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
  backButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: AppColors.secondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.secondary,
    marginBottom: 8,
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: AppColors.secondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  selectInputText: {
    fontSize: 16,
    color: AppColors.secondary,
    flex: 1,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.secondary,
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 32,
    gap: 8,
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: AppColors.secondary,
    borderRadius: 8,
    gap: 12,
  },
  expenseInfo: {
    flex: 1,
    gap: 4,
  },
  expenseName: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.secondary,
  },
  expenseDate: {
    fontSize: 13,
    color: AppColors.secondary,
    opacity: 0.8,
  },
  expenseValue: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.secondary,
  },
  emptyList: {
    textAlign: 'center',
    color: '#9BA1A6',
    marginTop: 24,
    fontSize: 14,
  },
  pickerOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  pickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContent: {
    backgroundColor: AppColors.background,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.secondary,
    padding: 8,
    textAlign: 'center',
  },
  pickerOption: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  pickerOptionSelected: {
    backgroundColor: AppColors.secondary,
  },
  pickerOptionText: {
    fontSize: 16,
    color: AppColors.secondary,
    textAlign: 'center',
  },
  pickerOptionTextSelected: {
    color: AppColors.background,
    fontWeight: '600',
  },
});
