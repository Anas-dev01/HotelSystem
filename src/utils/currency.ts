export const formatCurrency = (amount: number | string | null | undefined) => {
  const value = Number(amount);
  const safeValue = Number.isFinite(value) ? value : 0;

  return `₦${safeValue.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
