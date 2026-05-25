export const PAYMENT_METHODS = ['Crédito', 'Débito', 'Pix'] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export type Expense = {
  id: string;
  name: string;
  valueCents: number;
  description: string;
  paymentMethod: PaymentMethod;
  /** Data no formato ISO (AAAA-MM-DD) */
  date: string;
};
