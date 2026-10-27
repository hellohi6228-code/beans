import { CATEGORY_LABEL, Category } from './types';

// Chinese search words, with the English a US listing would use for the same
// thing. Taken from how 1688, Taobao and Weee! title these products, so a
// buyer typing 辣条 finds "latiao spicy strips" and the reverse.
const TERMS: [string, string[]][] = (
  [
    ['辣条', ['latiao', 'spicy strip', 'spicy gluten']],
    ['面筋', ['gluten']],
    ['辣片', ['spicy slice']],
    ['辣棒', ['spicy stick']],
    ['魔芋', ['konjac']],
    ['豆皮', ['tofu skin', 'bean curd']],
    ['豆干', ['dried tofu']],
    ['麻辣', ['mala', 'numbing', 'spicy']],
    ['香辣', ['spicy']],
    ['卫龙', ['weilong', 'wei long']],
    ['零食', ['snack']],
    ['薯片', ['chips', 'crisps']],
    ['瓜子', ['sunflower seed']],
    ['牛肉干', ['beef jerky']],
    ['鸭脖', ['duck neck']],
    ['咖啡豆', ['coffee bean']],
    ['咖啡', ['coffee']],
    ['生豆', ['green coffee', 'green bean']],
    ['乌龙', ['oolong']],
    ['绿茶', ['green tea']],
    ['红茶', ['black tea']],
    ['普洱', ['pu-erh', 'puer']],
    ['茉莉', ['jasmine']],
    ['奶茶', ['milk tea']],
    ['珍珠', ['boba', 'tapioca']],
    ['辣椒油', ['chili oil', 'chili crisp']],
    ['老干妈', ['lao gan ma', 'laoganma']],
    ['火锅底料', ['hot pot', 'hotpot']],
    ['豆瓣酱', ['doubanjiang', 'bean paste']],
    ['酱油', ['soy sauce']],
    ['蚝油', ['oyster sauce']],
    ['花椒', ['sichuan pepper']],
    ['螺蛳粉', ['luosifen']],
    ['米粉', ['rice noodle', 'vermicelli']],
    ['方便面', ['instant noodle', 'ramen']],
    ['面条', ['noodle']],
    ['大米', ['rice']],
    ['饺子', ['dumpling']],
    ['包子', ['bao', 'bun']],
    ['汤圆', ['tangyuan']],
    ['香菇', ['shiitake']],
    ['木耳', ['wood ear']],
    ['枸杞', ['goji']],
    ['红枣', ['jujube', 'red date']],
  ] as [string, string[]][]
).sort((a, b) => b[0].length - a[0].length); // longest first, so 咖啡豆 wins over 咖啡

/**
 * A query as a list of terms, each with the words that satisfy it. Chinese has
 * no spaces, so known words are cut out of it: 麻辣辣条 is 麻辣 and 辣条.
 */
export function queryTerms(text: string): string[][] {
  const out: string[][] = [];
  for (let w of text.toLowerCase().split(/\s+/).filter(Boolean)) {
    for (const [zh, en] of TERMS) {
      if (!w.includes(zh)) continue;
      out.push([zh, ...en]);
      w = w.split(zh).join(' ');
    }
    for (const rest of w.split(' ').filter(Boolean)) out.push([rest]);
  }
  return out;
}

/** What a post is searched by: its caption and category, in both languages. */
export function searchText(caption: string, category: Category): string {
  const base = `${caption} ${CATEGORY_LABEL[category]}`.toLowerCase();
  const both = TERMS.filter(([zh, en]) => base.includes(zh) || en.some((e) => base.includes(e)));
  return [base, ...both.flatMap(([zh, en]) => [zh, ...en])].join(' ');
}

export const matches = (terms: string[][], hay: string) => terms.every((alts) => alts.some((a) => hay.includes(a)));
