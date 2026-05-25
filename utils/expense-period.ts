import type { Expense } from '@/types/expense';

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export type MonthYearPeriod = {
  key: string;
  label: string;
};

export function getMonthYearKeyFromISO(isoDate: string): string | null {
  const [year, month] = isoDate.split('-');
  if (!year || !month) return null;
  return `${year}-${month}`;
}

export function formatMonthYearLabel(periodKey: string): string {
  const [year, month] = periodKey.split('-');
  const monthIndex = Number(month) - 1;
  if (monthIndex < 0 || monthIndex > 11) return periodKey;
  return `${MONTH_NAMES[monthIndex]}/${year}`;
}

export function buildMonthYearPeriods(expenses: Expense[]): MonthYearPeriod[] {
  const keys = new Set<string>();

  for (const expense of expenses) {
    if (!expense.date) continue;
    const key = getMonthYearKeyFromISO(expense.date);
    if (key) keys.add(key);
  }

  return Array.from(keys)
    .sort((a, b) => b.localeCompare(a))
    .map((key) => ({
      key,
      label: formatMonthYearLabel(key),
    }));
}

export function filterExpensesByPeriod(expenses: Expense[], periodKey: string): Expense[] {
  return expenses
    .filter((expense) => expense.date?.startsWith(periodKey))
    .sort((a, b) => b.date.localeCompare(a.date));
}
