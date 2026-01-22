export const budgetLevels = [
  2000, 3000, 4000, 5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000,
  45000, 50000,
] as const;

export type BudgetLevel = (typeof budgetLevels)[number];

export function formatCad(amount: number) {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(amount);
}

