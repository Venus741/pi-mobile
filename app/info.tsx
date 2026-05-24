import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/theme';
import { useFinances } from '@/contexts/finances-context';
import { formatBRLAmount } from '@/utils/currency';

export default function InfoScreen() {
  const router = useRouter();
  const { expenses } = useFinances();

  const rankedExpenses = useMemo(() => [...expenses].reverse(), [expenses]);

  return (
    <SafeAreaView style={styles.container}>
      <Pressable
        style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
        onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={28} color={AppColors.secondary} />
      </Pressable>

      <Text style={styles.title}>Ranking de gastos</Text>
      <Text style={styles.subtitle}>Do primeiro ao último registrado</Text>

      <FlatList
        data={rankedExpenses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyList}>Nenhum gasto registrado ainda.</Text>
        }
        renderItem={({ item, index }) => (
          <View style={styles.rankingRow}>
            <Text style={styles.rankingPosition}>{index + 1}º</Text>
            <Text style={styles.rankingName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.rankingValue}>R$ {formatBRLAmount(item.valueCents)}</Text>
          </View>
        )}
      />
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
  },
  subtitle: {
    fontSize: 14,
    color: AppColors.secondary,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 10,
  },
  rankingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: AppColors.secondary,
    borderRadius: 8,
  },
  rankingPosition: {
    width: 32,
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.secondary,
  },
  rankingName: {
    flex: 1,
    fontSize: 15,
    color: AppColors.secondary,
  },
  rankingValue: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.secondary,
  },
  emptyList: {
    textAlign: 'center',
    color: '#9BA1A6',
    marginTop: 40,
    fontSize: 14,
  },
});
