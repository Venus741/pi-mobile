import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import type { Expense } from '@/types/expense';

type FinancesContextValue = {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
};

const FinancesContext = createContext<FinancesContextValue | null>(null);

export function FinancesProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const value = useMemo(() => ({ expenses, setExpenses }), [expenses]);

  return <FinancesContext.Provider value={value}>{children}</FinancesContext.Provider>;
}

export function useFinances() {
  const context = useContext(FinancesContext);
  if (!context) {
    throw new Error('useFinances deve ser usado dentro de FinancesProvider');
  }
  return context;
}
