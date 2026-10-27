import { ALLERGEN_LABEL, ALLERGEN_ZH, CATEGORY_LABEL, ListingPart } from './types';
import { money, priceParts, smallWeightParts, weightParts } from './units';

// One place that turns a listing into the lines every screen shows, so a
// case of snacks and a sack of coffee read the same way everywhere. Each line
// carries the Chinese that 1688 and Taobao listings use for the same fact.

/** Net weight of one full case, in kg. */
export const caseKg = (l: ListingPart) => (l.unitsPerCase ?? 0) * (l.unitKg ?? 0);

/** The headline price, and the one under it. Always both kg and lb. */
export function priceLines(l: ListingPart): { main: string; sub: string } {
  const p = priceParts(l.pricePerKg);
  if (l.sellBy === 'case' && l.pricePerCase) {
    return { main: `${money(l.pricePerCase)} / case 箱`, sub: `${p.perKg} · ${p.perLb}` };
  }
  return { main: p.perKg, sub: p.perLb };
}

/** "24 × 200 g / 7.05 oz · 4.8 kg / 10.58 lb a case · 箱规 24×200g", or null for weight listings. */
export function packLine(l: ListingPart): string | null {
  if (l.sellBy !== 'case' || !l.unitsPerCase || !l.unitKg) return null;
  const unit = smallWeightParts(l.unitKg);
  const total = weightParts(caseKg(l));
  return `${l.unitsPerCase} × ${unit.g} / ${unit.oz} · ${total.kg} / ${total.lb} a case · 箱规 ${l.unitsPerCase}×${unit.g.replace(' ', '')}`;
}

export function availableLine(l: ListingPart): string {
  if (l.sellBy === 'case') return `${l.casesAvailable ?? 0} cases available · 库存${l.casesAvailable ?? 0}箱`;
  const w = weightParts(l.lotKg);
  return `${w.kg} / ${w.lb} available · 库存 ${w.kg}`;
}

export function minLine(l: ListingPart): string | null {
  if (!l.minOrder) return null;
  if (l.sellBy === 'case') return `Min ${l.minOrder} ${l.minOrder === 1 ? 'case' : 'cases'} · 起订量 ${l.minOrder}箱`;
  const w = weightParts(l.minOrder);
  return `Min ${w.kg} / ${w.lb} · 起订量 ${w.kg}`;
}

export const shipsLine = (l: ListingPart) =>
  l.shipsFrom === 'us' ? 'US stock · 美国现货' : `From China · ${l.leadDays ?? '?'} days · 中国发货`;

export function trustLine(l: ListingPart): string | null {
  const en = [l.fdaRegistered ? 'FDA registered' : null, l.englishLabel ? 'English label' : null].filter(Boolean);
  const zh = [l.fdaRegistered ? 'FDA注册' : null, l.englishLabel ? '英文标签' : null].filter(Boolean);
  return en.length ? `${en.join(' · ')} · ${zh.join('、')}` : null;
}

export const allergenLine = (l: ListingPart) =>
  l.allergens.length
    ? `Contains ${l.allergens.map((a) => ALLERGEN_LABEL[a].toLowerCase()).join(', ')} · 含${l.allergens.map((a) => ALLERGEN_ZH[a]).join('、')}`
    : 'No major allergens · 不含主要过敏原';

export const shippingLine = (l: ListingPart) =>
  l.shippingIncluded ? 'Shipping included · 包邮' : 'Shipping not included · 不包邮';

export const categoryLabel = (l: ListingPart) => CATEGORY_LABEL[l.category];
