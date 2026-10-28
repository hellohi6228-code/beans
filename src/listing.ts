import { Lang, categoryName, cuisineName, en, line, words } from './i18n';
import { tagById, tagName } from './tags';
import { ListingPart } from './types';
import { money, priceParts, smallWeightParts, weightParts } from './units';

// One place that turns a listing into the lines every screen shows, so a
// case of snacks and a sack of coffee read the same way everywhere. Each line
// is English, then the reader's own language when they have picked one.

/** Net weight of one full case, in kg. */
export const caseKg = (l: ListingPart) => (l.unitsPerCase ?? 0) * (l.unitKg ?? 0);

/** The headline price, and the one under it. Always both kg and lb. */
export function priceLines(l: ListingPart, lang: Lang): { main: string; sub: string } {
  const p = priceParts(l.pricePerKg);
  if (l.sellBy === 'case' && l.pricePerCase) {
    const w = words(lang);
    return { main: `${money(l.pricePerCase)} / box${w ? ` ${w.perCase}` : ''}`, sub: `${p.perKg} · ${p.perLb}` };
  }
  return { main: p.perKg, sub: p.perLb };
}

/** "24 × 200 g / 7.05 oz · 4.8 kg / 10.58 lb a box", or null for weight listings. */
export function packLine(l: ListingPart, lang: Lang): string | null {
  if (l.sellBy !== 'case' || !l.unitsPerCase || !l.unitKg) return null;
  const unit = smallWeightParts(l.unitKg);
  const total = weightParts(caseKg(l));
  return line(
    `${l.unitsPerCase} × ${unit.g} / ${unit.oz} · ${total.kg} / ${total.lb} a box`,
    words(lang)?.pack(l.unitsPerCase, unit.g.replace(' ', ''))
  );
}

export function availableLine(l: ListingPart, lang: Lang): string {
  const w = words(lang);
  if (l.sellBy === 'case') {
    const n = l.casesAvailable ?? 0;
    return line(en.stockCases(n), w?.stockCases(n));
  }
  const kg = weightParts(l.lotKg);
  return line(en.stock(`${kg.kg} / ${kg.lb}`), w?.stock(kg.kg));
}

export function minLine(l: ListingPart, lang: Lang): string | null {
  if (!l.minOrder) return null;
  const w = words(lang);
  if (l.sellBy === 'case') return line(en.minCases(l.minOrder), w?.minCases(l.minOrder));
  const kg = weightParts(l.minOrder);
  return line(en.min(`${kg.kg} / ${kg.lb}`), w?.min(kg.kg));
}

export function shipsLine(l: ListingPart, lang: Lang): string {
  const w = words(lang);
  if (l.shipsFrom === 'us') return line(en.usStock, w?.usStock);
  const o = l.shipsFrom;
  const days = l.leadDays ?? '?';
  return line(en.from(o, en.origin[o], days), w?.from(o, w.origin[o], days));
}

export function trustLine(l: ListingPart, lang: Lang): string | null {
  const w = words(lang);
  // "Registrado ante la FDA, etiqueta en inglés": only the first item keeps its capital.
  const pick = (d: typeof en) =>
    [l.fdaRegistered ? d.fda : null, l.englishLabel ? d.englishLabel : null]
      .filter((s): s is string => !!s)
      .map((s, i) => (i && d !== en ? s[0].toLowerCase() + s.slice(1) : s))
      .join(d === en ? ' · ' : d.sep);
  if (!l.fdaRegistered && !l.englishLabel) return null;
  return line(pick(en), w ? pick(w) : null);
}

export function allergenLine(l: ListingPart, lang: Lang): string {
  const w = words(lang);
  if (!l.allergens.length) return line(en.noAllergens, w?.noAllergens);
  const list = (d: typeof en) => d.contains(l.allergens.map((a) => d.allergen[a]).join(d.sep));
  return line(list(en), w ? list(w) : null);
}

export const dutiesLine = (lang: Lang) => [en.duties, words(lang)?.duties].filter(Boolean).join(' ');

/** What it is: its ingredient tags, else its cuisines, else (older listings) its category. */
export function whatLine(l: ListingPart, lang: Lang): string {
  const tags = l.ingredients.map((id) => tagById(id)).filter((t) => !!t);
  if (tags.length) return tags.map((t) => tagName(t!, lang)).join(' · ');
  if (l.cuisines.length) return l.cuisines.map((c) => cuisineName(c, lang)).join(' · ');
  return l.category ? categoryName(l.category, lang) : '';
}
