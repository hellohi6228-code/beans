import { ALLERGEN_LABEL, CATEGORY_LABEL, ListingPart } from './types';
import { money, priceParts, smallWeightParts, weightParts } from './units';

// One place that turns a listing into the lines every screen shows, so a
// case of snacks and a sack of coffee read the same way everywhere.

/** Net weight of one full case, in kg. */
export const caseKg = (l: ListingPart) => (l.unitsPerCase ?? 0) * (l.unitKg ?? 0);

/** The headline price, and the one under it. Always both kg and lb. */
export function priceLines(l: ListingPart): { main: string; sub: string } {
  const p = priceParts(l.pricePerKg);
  if (l.sellBy === 'case' && l.pricePerCase) {
    return { main: `${money(l.pricePerCase)} / case`, sub: `${p.perKg} · ${p.perLb}` };
  }
  return { main: p.perKg, sub: p.perLb };
}

/** "24 × 200 g / 7.05 oz · 4.8 kg / 10.58 lb a case", or null for weight listings. */
export function packLine(l: ListingPart): string | null {
  if (l.sellBy !== 'case' || !l.unitsPerCase || !l.unitKg) return null;
  const unit = smallWeightParts(l.unitKg);
  const total = weightParts(caseKg(l));
  return `${l.unitsPerCase} × ${unit.g} / ${unit.oz} · ${total.kg} / ${total.lb} a case`;
}

export function availableLine(l: ListingPart): string {
  if (l.sellBy === 'case') return `${l.casesAvailable ?? 0} cases available`;
  const w = weightParts(l.lotKg);
  return `${w.kg} / ${w.lb} available`;
}

export function minLine(l: ListingPart): string | null {
  if (!l.minOrder) return null;
  if (l.sellBy === 'case') return `Min ${l.minOrder} ${l.minOrder === 1 ? 'case' : 'cases'}`;
  const w = weightParts(l.minOrder);
  return `Min ${w.kg} / ${w.lb}`;
}

export const shipsLine = (l: ListingPart) =>
  l.shipsFrom === 'us' ? 'US stock' : `From China · ${l.leadDays ?? '?'} days`;

export function trustLine(l: ListingPart): string | null {
  const parts = [l.fdaRegistered ? 'FDA registered' : null, l.englishLabel ? 'English label' : null].filter(Boolean);
  return parts.length ? parts.join(' · ') : null;
}

export const allergenLine = (l: ListingPart) =>
  l.allergens.length ? `Contains ${l.allergens.map((a) => ALLERGEN_LABEL[a].toLowerCase()).join(', ')}` : 'No major allergens';

export const categoryLabel = (l: ListingPart) => CATEGORY_LABEL[l.category];
