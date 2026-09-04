// Beans shows every weight and every price in BOTH kg and lb, everywhere.
export const KG_PER_LB = 0.45359237;
export const LB_PER_KG = 1 / KG_PER_LB;

export type Unit = 'kg' | 'lb';

export const kgToLb = (kg: number) => kg * LB_PER_KG;
export const lbToKg = (lb: number) => lb * KG_PER_LB;

export const toKg = (value: number, unit: Unit) => (unit === 'kg' ? value : lbToKg(value));
export const fromKg = (kg: number, unit: Unit) => (unit === 'kg' ? kg : kgToLb(kg));

/** Trims trailing zeros: 25 -> "25", 55.115 -> "55.12" */
export function num(n: number, decimals = 2) {
  if (!isFinite(n)) return '0';
  const fixed = n.toFixed(decimals);
  return fixed.replace(/\.?0+$/, '');
}

export const money = (usd: number) =>
  '$' + usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** "25 kg / 55.12 lb" */
export const weightBoth = (kg: number) => `${num(kg)} kg / ${num(kgToLb(kg))} lb`;

/** "$12.40/kg · $5.62/lb" */
export const priceBoth = (pricePerKg: number) =>
  `${money(pricePerKg)}/kg · ${money(pricePerKg * KG_PER_LB)}/lb`;

/** "$12.40 per kg" + "$5.62 per lb" as two separate strings */
export const priceParts = (pricePerKg: number) => ({
  perKg: `${money(pricePerKg)}/kg`,
  perLb: `${money(pricePerKg * KG_PER_LB)}/lb`,
});

export const weightParts = (kg: number) => ({
  kg: `${num(kg)} kg`,
  lb: `${num(kgToLb(kg))} lb`,
});

export const lotTotal = (pricePerKg: number, lotKg: number) => pricePerKg * lotKg;
