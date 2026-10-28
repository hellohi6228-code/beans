import { allNames } from './i18n';
import { ListingPart } from './types';

// Words that mean the same ingredient in the languages restaurant owners
// order in. Taken from how 1688, Taobao, Weee! and US ethnic wholesalers
// title these products, so 辣条 finds "latiao", 고추장 finds "gochujang" and
// "fish sauce" finds nước mắm.
const GROUPS: string[][] = [
  // Chinese snacks and pantry
  ['latiao', 'spicy strip', 'spicy gluten', '辣条'],
  ['spicy slice', '辣片'],
  ['spicy stick', '辣棒'],
  ['weilong', 'wei long', '卫龙'],
  ['gluten', '面筋'],
  ['konjac', '魔芋', '곤약', 'こんにゃく'],
  ['tofu skin', 'yuba', '豆皮', '腐竹', '湯葉'],
  ['dried tofu', '豆干', '豆腐干'],
  ['tofu', '豆腐', '두부', 'đậu hũ', 'đậu phụ', 'เต้าหู้'],
  ['mala', 'spicy', '麻辣'],
  ['sichuan pepper', '花椒'],
  ['chili oil', 'chili crisp', '辣椒油', '老干妈', 'lao gan ma', 'laoganma', 'ラー油'],
  ['hot pot', 'hotpot', '火锅底料', '火锅'],
  ['doubanjiang', 'broad bean paste', '豆瓣酱'],
  ['luosifen', '螺蛳粉'],
  ['duck neck', '鸭脖'],
  ['beef jerky', '牛肉干', '육포', 'ビーフジャーキー', 'khô bò'],
  ['sunflower seed', '瓜子', '해바라기씨', 'hạt hướng dương'],
  ['goji', '枸杞', '구기자', 'クコ'],
  ['jujube', 'red date', '红枣', '대추', 'なつめ', 'táo đỏ', 'พุทรา'],
  ['shiitake', '香菇', '표고버섯', 'しいたけ', '椎茸', 'nấm đông cô', 'เห็ดหอม'],
  ['wood ear', '木耳', '목이버섯', 'きくらげ', 'nấm mèo', 'เห็ดหูหนู'],
  ['bok choy', '青江菜', '上海青', '小白菜', '청경채', 'チンゲン菜', 'cải thìa'],
  ['napa cabbage', '大白菜', '배추', 'cải thảo', 'ผักกาดขาว'],
  // Sauces most kitchens share
  ['soy sauce', '酱油', '醤油', 'しょうゆ', '간장', 'nước tương', 'xì dầu', 'ซีอิ๊ว', 'salsa de soya'],
  ['oyster sauce', '蚝油', '굴소스', 'オイスターソース', 'dầu hào', 'ซอสหอยนางรม'],
  ['fish sauce', '鱼露', '魚醤', '피시소스', 'nước mắm', 'น้ำปลา', 'patis'],
  ['sesame oil', '香油', '芝麻油', '참기름', 'ごま油', 'dầu mè'],
  ['curry', '咖喱', 'カレー', '카레', 'cà ri', 'แกง'],
  ['coconut milk', '椰浆', '椰奶', '코코넛 밀크', 'ココナッツミルク', 'nước cốt dừa', 'กะทิ', 'leche de coco', 'latte di cocco'],
  ['chili', 'chile', 'chiles', '辣椒', '고추', '唐辛子', 'ớt', 'พริก', 'peperoncino'],
  ['spices', '香料', '향신료', 'スパイス', 'gia vị', 'เครื่องเทศ', 'especias', 'spezie'],
  // Japanese
  ['miso', '味噌', 'みそ', '味增'],
  ['dashi', 'bonito', 'だし', '出汁', 'かつお節', '鰹節', '木鱼花'],
  ['panko', 'パン粉', '面包糠', '빵가루'],
  ['wasabi', 'わさび', '山葵', '芥末', '와사비'],
  ['mirin', 'みりん', '味醂', '味淋', '미림'],
  ['nori', 'seaweed', '海苔', '紫菜', 'のり', 'rong biển', 'สาหร่าย'],
  ['udon', '乌冬', 'うどん', '우동'],
  ['soba', '荞麦面', 'そば', '蕎麦'],
  ['matcha', '抹茶', '말차'],
  ['wagyu', '和牛', '와규'],
  // Korean
  ['gochujang', '고추장'],
  ['gochugaru', '고춧가루', 'korean chili flakes'],
  ['doenjang', '된장', '大酱'],
  ['kimchi', '김치', '泡菜', 'キムチ'],
  // Southeast Asian
  ['rice noodle', 'vermicelli', '米粉', '米线', 'bánh phở', 'bún', 'เส้นหมี่', 'เส้นก๋วยเตี๋ยว', 'pancit', '쌀국수'],
  ['rice paper', 'bánh tráng', '米纸', 'ライスペーパー', '라이스페이퍼'],
  ['lemongrass', '香茅', '레몬그라스', 'レモングラス', 'sả', 'ตะไคร้'],
  ['galangal', '南姜', '高良姜', 'riềng', 'ข่า'],
  ['kaffir lime', 'makrut', 'lá chanh', 'ใบมะกรูด'],
  ['tamarind', '罗望子', '酸角', 'タマリンド', 'มะขาม', 'tamarindo'],
  ['jasmine rice', '茉莉香米', 'ข้าวหอมมะลิ', 'gạo thơm'],
  // Grains, noodles, flour
  ['rice', '大米', '白米', 'お米', '쌀', 'gạo', 'ข้าวสาร', 'arroz', 'riso'],
  ['instant noodle', 'ramen', '方便面', '泡面', '라면', 'ラーメン', 'mì gói', 'บะหมี่กึ่งสำเร็จรูป'],
  ['pasta', '意面', '意大利面', '파스타', 'パスタ', 'mì ý'],
  ['flour', '面粉', '밀가루', '小麦粉', 'bột mì', 'แป้งสาลี', 'harina', 'farina'],
  ['dumpling', 'gyoza', '饺子', '餃子', '만두', 'เกี๊ยว'],
  ['bao', '包子', '바오'],
  // Mexican and Latin
  ['tortilla', 'tortillas', '玉米饼', 'トルティーヤ', '또띠아'],
  ['masa harina', 'masa', 'harina de maíz'],
  ['avocado', '牛油果', '鳄梨', '아보카도', 'アボカド', 'อะโวคาโด', 'aguacate'],
  ['tomatillo', 'tomate verde'],
  // Italian and Mediterranean
  ['olive oil', 'evoo', '橄榄油', '올리브유', 'オリーブオイル', 'dầu ô liu', 'น้ำมันมะกอก', 'aceite de oliva', "olio d'oliva", 'olio extravergine'],
  ['tomato', 'san marzano', '番茄', '西红柿', '토마토', 'トマト', 'cà chua', 'มะเขือเทศ', 'tomate', 'pomodoro', 'pomodori'],
  ['cheese', 'queso', '奶酪', '芝士', '치즈', 'チーズ', 'phô mai', 'ชีส', 'formaggio'],
  ['mozzarella', '马苏里拉', 'モッツァレラ', '모짜렐라'],
  ['parmesan', 'parmigiano', 'parmigiano reggiano', '帕玛森', 'パルミジャーノ', '파르미지아노'],
  ['prosciutto', 'parma ham', '帕尔马火腿', '生ハム', '프로슈토'],
  ['tahini', 'タヒニ', '타히니'],
  ['chickpeas', 'garbanzo', 'garbanzos', '鹰嘴豆', '병아리콩', 'ひよこ豆', 'đậu gà', 'ceci'],
  // Indian
  ['garam masala', 'masala'],
  ['basmati', '巴斯马蒂', 'バスマティ', '바스마티'],
  ['ghee', '酥油', 'ギー'],
  ['paneer'],
  ['lentils', 'dal', 'dhal', '扁豆', '렌틸콩', 'レンズ豆', 'đậu lăng', 'lentejas', 'lenticchie'],
  // Meat and seafood
  ['halal', '清真', '할랄', 'ハラール', 'ฮาลาล'],
  ['pork belly', '五花肉', '삼겹살', '豚バラ', 'ba chỉ', 'หมูสามชั้น'],
  ['pork', '猪肉', '돼지고기', '豚肉', 'thịt heo', 'thịt lợn', 'หมู', 'cerdo', 'maiale'],
  ['beef', '牛肉', '소고기', 'thịt bò', 'เนื้อวัว', 'carne de res', 'manzo'],
  ['chicken', '鸡肉', '닭고기', '鶏肉', 'thịt gà', 'ไก่', 'pollo'],
  ['duck', '鸭', '오리', '鴨', 'vịt', 'เป็ด', 'pato', 'anatra'],
  ['shrimp', 'prawn', '虾', '새우', 'えび', 'エビ', 'tôm', 'กุ้ง', 'camarón', 'camarones', 'gamberi'],
  ['salmon', '三文鱼', '鲑鱼', '연어', 'サーモン', 'cá hồi', 'แซลมอน', 'salmón', 'salmone'],
  ['tuna', '金枪鱼', '참치', 'マグロ', 'cá ngừ', 'ทูน่า', 'atún', 'tonno'],
  // Drinks and snacks
  ['coffee', '咖啡', '커피', 'コーヒー', 'cà phê', 'กาแฟ', 'café', 'caffè'],
  ['green coffee', '咖啡生豆', '生豆', '생두', 'cà phê nhân'],
  ['oolong', '乌龙', '烏龍', 'ウーロン', '우롱'],
  ['green tea', '绿茶', '녹차', '緑茶', 'trà xanh', 'ชาเขียว', 'té verde', 'tè verde'],
  ['black tea', '红茶', '홍차', '紅茶', 'ชาดำ', 'té negro', 'tè nero'],
  ['jasmine', '茉莉', '재스민', 'ジャスミン', 'nhài', 'มะลิ'],
  ['milk tea', '奶茶', '밀크티', 'ミルクティー', 'trà sữa', 'ชานม'],
  ['boba', 'tapioca pearls', '珍珠', 'タピオカ', '버블티', 'trân châu', 'ไข่มุก'],
  ['chips', 'crisps', '薯片', '감자칩', 'ポテトチップス', 'papas fritas', 'patatine'],
  ['snack', '零食', '과자', 'お菓子', 'スナック', 'đồ ăn vặt', 'ขนม', 'botana', 'botanas'],
].map((g) => g.map((w) => w.toLowerCase()));

// Chinese, Japanese, Korean and Thai run words together, so a word from
// those is found anywhere inside a query or caption. Everything else must
// match as a whole word, so "res" never matches inside "fresh".
const RUN_TOGETHER = /[฀-๿぀-ヿ㐀-鿿가-힯]/;

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Latin letters including Vietnamese and Spanish accents. Spelled out rather
// than \p{L}, which not every phone JS engine supports.
const LETTER = 'a-z0-9\\u00c0-\\u024f\\u1e00-\\u1eff';
const has = (text: string, word: string) =>
  RUN_TOGETHER.test(word) ? text.includes(word) : new RegExp(`(^|[^${LETTER}])${escape(word)}($|[^${LETTER}])`).test(text);

const runTogether = GROUPS.flatMap((g) => g.filter((w) => RUN_TOGETHER.test(w)).map((w) => [w, g] as const)).sort(
  (a, b) => b[0].length - a[0].length // longest first, so 咖啡生豆 wins over 咖啡
);
const byWord = new Map(GROUPS.flatMap((g) => g.map((w) => [w, g] as const)));

/**
 * A query as a list of terms, each with the words that satisfy it. Known
 * words are cut out of run-together text: 麻辣辣条 is 麻辣 and 辣条.
 */
export function queryTerms(text: string): string[][] {
  const out: string[][] = [];
  for (let w of text.toLowerCase().split(/\s+/).filter(Boolean)) {
    if (RUN_TOGETHER.test(w)) {
      for (const [word, group] of runTogether) {
        if (!w.includes(word)) continue;
        out.push(group);
        w = w.split(word).join(' ');
      }
      for (const rest of w.split(' ').filter(Boolean)) out.push([rest]);
    } else {
      out.push(byWord.get(w) ?? [w]);
    }
  }
  return out;
}

/** What a listing is searched by: its caption, plus its category, cuisines and origin in every language. */
export function searchText(caption: string, l: ListingPart): string {
  const base = caption.toLowerCase();
  const synonyms = GROUPS.filter((g) => g.some((w) => has(base, w))).flat();
  const names = [
    ...allNames.category(l.category),
    ...l.cuisines.flatMap(allNames.cuisine),
    ...(l.shipsFrom === 'us' ? [] : allNames.origin(l.shipsFrom)),
  ].map((s) => s.toLowerCase());
  return [base, ...synonyms, ...names].join(' | ');
}

export const matches = (terms: string[][], hay: string) => terms.every((alts) => alts.some((a) => hay.includes(a)));
