import type { Expense } from '@/types/expense';

export type RankedExpenseGroup = {
  name: string;
  valueCents: number;
};

export function buildValueRanking(expenses: Expense[]): RankedExpenseGroup[] {
  const grouped = new Map<string, RankedExpenseGroup>();

  for (const expense of expenses) {
    const key = expense.name.trim().toLowerCase();
    const existing = grouped.get(key);

    if (existing) {
      existing.valueCents += expense.valueCents;
      continue;
    }

    grouped.set(key, {
      name: expense.name.trim(),
      valueCents: expense.valueCents,
    });
  }

  return Array.from(grouped.values()).sort((a, b) => b.valueCents - a.valueCents);
}
