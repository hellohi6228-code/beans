import type { Lang } from './i18n';
import { CUISINES, Cuisine } from './types';

// Cuisine → ingredient → the specific things a kitchen orders.
//
// Built backwards from what these restaurants sell most in the US (the dishes
// listed per cuisine), down to what those dishes need. Each cuisine leads with
// what has to come from home — the things a US broadline distributor doesn't
// carry or can't substitute — and ends with what is easier to find. Names are
// English, Chinese, and the cuisine's own language where the app has it;
// `also` holds the spellings and brands people type, for search.
//
// A listing is tagged with item ids like 'korean.jang.gochujang'. Picking a
// cuisine or a group selects everything under it.

type Names = Partial<Record<Exclude<Lang, 'en'>, string>>;

export type Tag = { id: string; en: string; names: Names; also: string[] };
export type Group = Tag & { items: Tag[] };
export type CuisineTree = { dishes: string[]; groups: Group[] };

type RawItem = [key: string, en: string, names?: Names, also?: string[]];
type RawGroup = [key: string, en: string, names: Names, items: RawItem[]];

function tree(cuisine: Cuisine, dishes: string[], groups: RawGroup[]): CuisineTree {
  return {
    dishes,
    groups: groups.map(([gk, en, names, items]) => ({
      id: `${cuisine}.${gk}`,
      en,
      names,
      also: [],
      items: items.map(([ik, ien, inames = {}, also = []]) => ({
        id: `${cuisine}.${gk}.${ik}`,
        en: ien,
        names: inames,
        also,
      })),
    })),
  };
}

export const TREE: Record<Cuisine, CuisineTree> = {
  chinese: tree(
    'chinese',
    ["General Tso's chicken", 'Egg rolls', 'Crab rangoon', 'Fried rice', 'Lo mein', 'Mapo tofu', 'Dumplings', 'Hot pot', 'Beef chow fun', 'Kung pao chicken', 'Dan dan noodles'],
    [
      ['sauces', 'Sauces & pastes', { zh: '酱料' }, [
        ['light-soy', 'Light soy sauce', { zh: '生抽' }, ['soy sauce', '酱油', 'pearl river', 'lee kum kee']],
        ['dark-soy', 'Dark soy sauce', { zh: '老抽' }],
        ['oyster', 'Oyster sauce', { zh: '蚝油' }],
        ['hoisin', 'Hoisin sauce', { zh: '海鲜酱' }],
        ['doubanjiang', 'Pixian doubanjiang', { zh: '郫县豆瓣酱' }, ['doubanjiang', '豆瓣酱', 'chili bean paste']],
        ['douchi', 'Fermented black beans', { zh: '豆豉' }, ['douchi', 'black bean sauce']],
        ['chili-oil', 'Chili oil', { zh: '辣椒油' }, ['chili crisp', '老干妈', 'lao gan ma', '红油']],
      ]],
      ['spices', 'Sichuan & spices', { zh: '川味香料' }, [
        ['sichuan-pepper', 'Sichuan peppercorn', { zh: '花椒' }, ['prickly ash', 'mala']],
        ['facing-heaven', 'Facing-heaven chilies', { zh: '朝天椒' }, ['dried chilies', '干辣椒']],
        ['star-anise', 'Star anise', { zh: '八角' }],
        ['five-spice', 'Five-spice powder', { zh: '五香粉' }],
        ['cassia', 'Cassia bark', { zh: '桂皮' }],
      ]],
      ['vinegar-wine', 'Vinegar & cooking wine', { zh: '醋·料酒' }, [
        ['black-vinegar', 'Chinkiang black vinegar', { zh: '镇江香醋' }, ['black vinegar', '香醋', '陈醋']],
        ['shaoxing', 'Shaoxing wine', { zh: '绍兴料酒' }, ['料酒', 'cooking wine']],
        ['rice-vinegar', 'Rice vinegar', { zh: '白米醋' }],
      ]],
      ['hotpot', 'Hot pot', { zh: '火锅' }, [
        ['hotpot-base', 'Hot pot soup base', { zh: '火锅底料' }, ['hotpot', 'little sheep', 'haidilao', '海底捞']],
        ['sesame-paste', 'Sesame paste', { zh: '芝麻酱' }],
        ['sacha', 'Sacha sauce', { zh: '沙茶酱' }, ['bullhead', '牛头牌']],
      ]],
      ['dried', 'Dried goods', { zh: '干货' }, [
        ['shiitake', 'Dried shiitake', { zh: '干香菇' }, ['shiitake', '冬菇', '香菇']],
        ['wood-ear', 'Wood ear mushroom', { zh: '木耳' }],
        ['dried-shrimp', 'Dried shrimp', { zh: '虾米' }],
        ['scallop', 'Dried scallop', { zh: '干贝' }, ['conpoy', '瑶柱']],
        ['goji', 'Goji berries', { zh: '枸杞' }],
        ['red-dates', 'Red dates', { zh: '红枣' }, ['jujube']],
      ]],
      ['noodles', 'Rice, noodles & wrappers', { zh: '米·面·皮' }, [
        ['wonton', 'Wonton wrappers', { zh: '馄饨皮' }, ['云吞皮']],
        ['dumpling-wrap', 'Dumpling wrappers', { zh: '饺子皮' }],
        ['egg-roll-wrap', 'Egg roll wrappers', { zh: '春卷皮' }],
        ['egg-noodles', 'Egg noodles', { zh: '鸡蛋面' }, ['lo mein', '捞面']],
        ['ho-fun', 'Wide rice noodles', { zh: '河粉' }, ['chow fun', 'ho fun']],
        ['jasmine', 'Jasmine rice', { zh: '香米' }, ['茉莉香米']],
      ]],
      ['produce', 'Vegetables & tofu', { zh: '蔬菜·豆腐' }, [
        ['bok-choy', 'Bok choy', { zh: '上海青' }, ['青江菜', '小白菜']],
        ['gai-lan', 'Chinese broccoli', { zh: '芥兰' }, ['gai lan']],
        ['napa', 'Napa cabbage', { zh: '大白菜' }],
        ['chives', 'Garlic chives', { zh: '韭菜' }],
        ['tofu', 'Tofu', { zh: '豆腐' }],
      ]],
      ['snacks', 'Snacks', { zh: '零食' }, [
        ['latiao', 'Latiao', { zh: '辣条' }, ['spicy strip', 'spicy gluten', '卫龙', 'weilong']],
        ['konjac', 'Spicy konjac', { zh: '魔芋爽' }, ['konjac', '魔芋']],
        ['dried-tofu', 'Spiced dried tofu', { zh: '豆干' }],
      ]],
    ]
  ),

  japanese: tree(
    'japanese',
    ['Sushi & sashimi', 'Ramen', 'Tempura', 'Gyoza', 'Chicken katsu', 'Teriyaki', 'Udon', 'Donburi', 'Yakitori', 'Karaage', 'Miso soup'],
    [
      ['fish', 'Sushi fish', { zh: '刺身鱼', ja: '寿司ネタ' }, [
        ['tuna', 'Bluefin & yellowfin tuna', { zh: '金枪鱼', ja: 'マグロ' }, ['maguro', 'toro']],
        ['hamachi', 'Hamachi', { zh: '油甘鱼', ja: 'ハマチ' }, ['yellowtail', 'buri']],
        ['salmon', 'Sashimi-grade salmon', { zh: '刺身三文鱼', ja: 'サーモン' }, ['salmon']],
        ['uni', 'Uni', { zh: '海胆', ja: 'うに' }, ['sea urchin']],
        ['unagi', 'Unagi', { zh: '鳗鱼', ja: 'うなぎ' }, ['eel', 'kabayaki']],
        ['hotate', 'Hokkaido scallops', { zh: '北海道扇贝', ja: 'ホタテ' }, ['hotate', 'scallop']],
        ['tobiko', 'Tobiko & masago', { zh: '飞鱼籽', ja: 'とびこ' }, ['masago', 'roe']],
      ]],
      ['sushi-bar', 'Sushi bar', { zh: '寿司吧台', ja: '寿司' }, [
        ['rice', 'Sushi rice', { zh: '寿司米', ja: 'すし米' }, ['koshihikari', 'calrose', 'short grain rice']],
        ['vinegar', 'Sushi vinegar', { zh: '寿司醋', ja: 'すし酢' }, ['rice vinegar', '米酢']],
        ['nori', 'Nori', { zh: '寿司海苔', ja: '焼き海苔' }, ['seaweed', 'のり']],
        ['wasabi', 'Wasabi', { zh: '芥末', ja: 'わさび' }, ['山葵']],
        ['gari', 'Pickled ginger', { zh: '寿司姜', ja: 'ガリ' }, ['gari', 'sushi ginger']],
      ]],
      ['dashi', 'Dashi & seasoning', { zh: '高汤·调味', ja: '出汁・調味料' }, [
        ['kombu', 'Kombu', { zh: '昆布', ja: '昆布' }],
        ['katsuobushi', 'Katsuobushi', { zh: '木鱼花', ja: '鰹節' }, ['bonito flakes', 'かつお節']],
        ['shoyu', 'Shoyu', { zh: '日式酱油', ja: '醤油' }, ['soy sauce', 'kikkoman', 'yamasa']],
        ['mirin', 'Mirin', { zh: '味醂', ja: 'みりん' }],
        ['sake', 'Cooking sake', { zh: '料理清酒', ja: '料理酒' }, ['sake']],
        ['miso', 'Miso', { zh: '味噌', ja: '味噌' }, ['white miso', 'red miso', 'みそ']],
        ['hondashi', 'Dashi powder', { zh: '日式高汤粉', ja: '顆粒だし' }, ['hondashi', 'ほんだし']],
      ]],
      ['ramen', 'Ramen', { zh: '拉面', ja: 'ラーメン' }, [
        ['noodles', 'Ramen noodles', { zh: '拉面面条', ja: 'ラーメン麺' }, ['sun noodle']],
        ['tonkotsu', 'Tonkotsu soup base', { zh: '豚骨汤底', ja: '豚骨スープ' }, ['tonkotsu']],
        ['menma', 'Menma', { zh: '笋干', ja: 'メンマ' }, ['bamboo shoots']],
        ['naruto', 'Narutomaki', { zh: '鱼板', ja: 'なると' }, ['naruto', 'fish cake']],
        ['mayu', 'Black garlic oil', { zh: '黑蒜油', ja: 'マー油' }, ['mayu']],
      ]],
      ['noodles', 'Udon, soba & somen', { zh: '乌冬·荞麦面', ja: 'うどん・そば' }, [
        ['udon', 'Udon', { zh: '乌冬面', ja: 'うどん' }, ['sanuki']],
        ['soba', 'Soba', { zh: '荞麦面', ja: 'そば' }, ['蕎麦']],
        ['somen', 'Somen', { zh: '素面', ja: 'そうめん' }],
      ]],
      ['fry', 'Tempura & katsu', { zh: '炸物', ja: '揚げ物' }, [
        ['panko', 'Panko', { zh: '面包糠', ja: 'パン粉' }],
        ['tempura-flour', 'Tempura flour', { zh: '天妇罗粉', ja: '天ぷら粉' }],
        ['katakuriko', 'Potato starch', { zh: '片栗粉', ja: '片栗粉' }, ['katakuriko']],
        ['tonkatsu-sauce', 'Tonkatsu sauce', { zh: '猪排酱', ja: 'とんかつソース' }, ['bulldog']],
        ['mayo', 'Japanese mayonnaise', { zh: '日式蛋黄酱', ja: 'マヨネーズ' }, ['kewpie', 'キユーピー']],
      ]],
      ['izakaya', 'Izakaya & finishing', { zh: '居酒屋·点缀', ja: '居酒屋・薬味' }, [
        ['binchotan', 'Binchotan charcoal', { zh: '备长炭', ja: '備長炭' }, ['yakitori charcoal']],
        ['shichimi', 'Shichimi togarashi', { zh: '七味粉', ja: '七味唐辛子' }, ['togarashi']],
        ['yuzu-kosho', 'Yuzu kosho', { zh: '柚子胡椒', ja: '柚子胡椒' }, ['yuzu']],
        ['ponzu', 'Ponzu', { zh: '柚子醋', ja: 'ポン酢' }],
        ['gyoza-wrap', 'Gyoza wrappers', { zh: '饺子皮', ja: '餃子の皮' }],
        ['matcha', 'Matcha', { zh: '抹茶', ja: '抹茶' }],
      ]],
    ]
  ),

  korean: tree(
    'korean',
    ['Korean BBQ (galbi, samgyeopsal, bulgogi)', 'Bibimbap', 'Kimchi jjigae', 'Tteokbokki', 'Japchae', 'Korean fried chicken', 'Sundubu jjigae', 'Naengmyeon', 'Haemul pajeon', 'Budae jjigae'],
    [
      ['jang', 'Jang (pastes & soy)', { zh: '韩式酱料', ko: '장류' }, [
        ['gochujang', 'Gochujang', { zh: '韩式辣酱', ko: '고추장' }, ['sunchang']],
        ['doenjang', 'Doenjang', { zh: '大酱', ko: '된장' }, ['soybean paste']],
        ['ssamjang', 'Ssamjang', { zh: '包饭酱', ko: '쌈장' }],
        ['guk-ganjang', 'Soup soy sauce', { zh: '汤用酱油', ko: '국간장' }, ['ganjang', '간장']],
        ['jin-ganjang', 'Jin ganjang', { zh: '韩式酱油', ko: '진간장' }, ['sempio', 'soy sauce']],
      ]],
      ['chili', 'Gochugaru & chilies', { zh: '韩国辣椒', ko: '고춧가루·고추' }, [
        ['gochugaru-coarse', 'Gochugaru, coarse (kimchi)', { zh: '粗辣椒粉', ko: '굵은 고춧가루' }, ['gochugaru', 'korean chili flakes']],
        ['gochugaru-fine', 'Gochugaru, fine', { zh: '细辣椒粉', ko: '고운 고춧가루' }, ['gochugaru']],
        ['cheongyang', 'Cheongyang chilies', { zh: '青阳辣椒', ko: '청양고추' }],
      ]],
      ['kimchi', 'Kimchi & vegetables', { zh: '泡菜·蔬菜', ko: '김치·채소' }, [
        ['saeujeot', 'Salted shrimp', { zh: '虾酱', ko: '새우젓' }, ['saeujeot']],
        ['aekjeot', 'Anchovy fish sauce', { zh: '鳀鱼露', ko: '멸치액젓' }, ['aekjeot', 'fish sauce']],
        ['napa', 'Napa cabbage', { zh: '大白菜', ko: '배추' }],
        ['radish', 'Korean radish', { zh: '韩国萝卜', ko: '조선무' }, ['daikon']],
        ['perilla-leaves', 'Perilla leaves', { zh: '紫苏叶', ko: '깻잎' }, ['kkaennip']],
        ['kimchi', 'Kimchi', { zh: '韩国泡菜', ko: '김치' }, ['泡菜']],
      ]],
      ['tteok-noodles', 'Rice cakes & noodles', { zh: '年糕·面', ko: '떡·면' }, [
        ['tteokbokki', 'Tteokbokki rice cakes', { zh: '炒年糕', ko: '떡볶이떡' }, ['tteok']],
        ['tteokguk', 'Sliced rice cakes', { zh: '年糕片', ko: '떡국떡' }],
        ['dangmyeon', 'Dangmyeon', { zh: '红薯粉条', ko: '당면' }, ['glass noodles', 'sweet potato noodles']],
        ['naengmyeon', 'Naengmyeon noodles', { zh: '冷面', ko: '냉면' }],
        ['eomuk', 'Fish cakes', { zh: '鱼饼', ko: '어묵' }, ['eomuk', 'odeng', '오뎅']],
        ['ramyeon', 'Ramyeon', { zh: '韩国拉面', ko: '라면' }, ['shin ramyun', '신라면']],
      ]],
      ['dried-seafood', 'Seaweed & dried seafood', { zh: '海藻·海味', ko: '해조류·건어물' }, [
        ['gim', 'Roasted seaweed', { zh: '韩国海苔', ko: '조미김' }, ['gim']],
        ['miyeok', 'Miyeok', { zh: '海带芽', ko: '미역' }, ['wakame']],
        ['dashima', 'Dashima', { zh: '海带', ko: '다시마' }, ['kelp']],
        ['myeolchi', 'Dried anchovies', { zh: '小鱼干', ko: '멸치' }],
        ['hwangtae', 'Dried pollock', { zh: '明太鱼干', ko: '황태' }],
      ]],
      ['bbq', 'BBQ meats', { zh: '烤肉', ko: '고기' }, [
        ['la-galbi', 'LA galbi', { zh: '牛小排', ko: 'LA갈비' }, ['galbi', 'kalbi', 'short rib']],
        ['samgyeopsal', 'Pork belly', { zh: '五花肉', ko: '삼겹살' }, ['samgyeopsal']],
        ['bulgogi', 'Bulgogi beef, sliced', { zh: '烤肉片', ko: '불고기용' }, ['bulgogi']],
      ]],
      ['oils', 'Oils, seeds & syrups', { zh: '油·籽·糖浆', ko: '기름·깨·물엿' }, [
        ['sesame-oil', 'Sesame oil', { zh: '香油', ko: '참기름' }],
        ['perilla-oil', 'Perilla oil', { zh: '紫苏油', ko: '들기름' }],
        ['sesame-seeds', 'Roasted sesame seeds', { zh: '熟芝麻', ko: '볶음참깨' }],
        ['mulyeot', 'Corn syrup', { zh: '玉米糖浆', ko: '물엿' }, ['rice syrup', '조청']],
        ['frying-mix', 'Frying & pancake mix', { zh: '炸粉·煎饼粉', ko: '튀김가루·부침가루' }, ['twigim garu', 'buchim garu']],
      ]],
    ]
  ),

  vietnamese: tree(
    'vietnamese',
    ['Phở', 'Bánh mì', 'Bún chả', 'Gỏi cuốn', 'Cơm tấm', 'Bún bò Huế', 'Bánh xèo', 'Cà phê sữa đá', 'Chè'],
    [
      ['sauces', 'Fish sauce & pastes', { zh: '鱼露·酱', vi: 'nước mắm & mắm' }, [
        ['nuoc-mam', 'Fish sauce', { zh: '鱼露', vi: 'nước mắm' }, ['phu quoc', 'red boat', 'three crabs']],
        ['mam-tom', 'Shrimp paste', { zh: '虾酱', vi: 'mắm tôm' }],
        ['mam-ruoc', 'Fermented shrimp paste (Huế)', { zh: '顺化虾酱', vi: 'mắm ruốc' }],
        ['hoisin', 'Hoisin sauce', { zh: '海鲜酱', vi: 'tương đen' }],
        ['sriracha', 'Sriracha', { zh: '是拉差辣椒酱', vi: 'tương ớt' }, ['huy fong']],
        ['nuoc-mau', 'Caramel sauce', { zh: '焦糖酱', vi: 'nước màu' }],
      ]],
      ['pho', 'Phở spices', { zh: '河粉香料', vi: 'gia vị phở' }, [
        ['star-anise', 'Star anise', { zh: '八角', vi: 'hoa hồi' }],
        ['cinnamon', 'Cinnamon', { zh: '桂皮', vi: 'quế' }],
        ['thao-qua', 'Black cardamom', { zh: '草果', vi: 'thảo quả' }],
        ['rock-sugar', 'Rock sugar', { zh: '冰糖', vi: 'đường phèn' }],
        ['pho-packet', 'Phở spice packet', { zh: '河粉香料包', vi: 'gói gia vị phở' }],
      ]],
      ['noodles', 'Noodles & rice paper', { zh: '粉·米纸', vi: 'bún, phở & bánh tráng' }, [
        ['banh-pho', 'Phở noodles', { zh: '河粉', vi: 'bánh phở' }, ['banh pho']],
        ['bun', 'Rice vermicelli', { zh: '米线', vi: 'bún' }],
        ['bun-hue', 'Thick vermicelli (bún bò Huế)', { zh: '粗米线', vi: 'bún sợi to' }],
        ['banh-trang', 'Rice paper', { zh: '越南米纸', vi: 'bánh tráng' }, ['banh trang', 'spring roll wrappers']],
        ['gao-tam', 'Broken rice', { zh: '碎米', vi: 'gạo tấm' }, ['com tam']],
        ['banh-xeo', 'Bánh xèo flour', { zh: '越式煎饼粉', vi: 'bột bánh xèo' }],
      ]],
      ['herbs', 'Herbs', { zh: '香草', vi: 'rau thơm' }, [
        ['hung-que', 'Thai basil', { zh: '九层塔', vi: 'húng quế' }],
        ['ngo-gai', 'Culantro', { zh: '刺芫荽', vi: 'ngò gai' }],
        ['ngo-om', 'Rice paddy herb', { zh: '田香草', vi: 'ngò om' }],
        ['rau-ram', 'Vietnamese coriander', { zh: '越南香菜', vi: 'rau răm' }],
        ['tia-to', 'Perilla', { zh: '紫苏', vi: 'tía tô' }],
        ['gia', 'Bean sprouts', { zh: '豆芽', vi: 'giá đỗ' }],
      ]],
      ['banh-mi', 'Bánh mì', { zh: '越南法包', vi: 'bánh mì' }, [
        ['baguette', 'Bánh mì rolls', { zh: '越式法棍', vi: 'ổ bánh mì' }],
        ['cha-lua', 'Pork roll', { zh: '越南扎肉', vi: 'chả lụa' }, ['gio lua']],
        ['pate', 'Pâté', { zh: '肝酱', vi: 'pa tê' }],
        ['do-chua', 'Pickled daikon & carrot', { zh: '腌萝卜丝', vi: 'đồ chua' }],
        ['maggi', 'Maggi seasoning', { zh: '美极鲜酱油', vi: 'nước tương Maggi' }, ['maggi']],
      ]],
      ['coffee-che', 'Coffee & chè', { zh: '咖啡·甜品', vi: 'cà phê & chè' }, [
        ['robusta', 'Vietnamese robusta', { zh: '越南罗布斯塔咖啡', vi: 'cà phê robusta' }, ['trung nguyen', 'vietnamese coffee']],
        ['phin', 'Phin filters', { zh: '越南滴漏壶', vi: 'phin' }],
        ['condensed-milk', 'Condensed milk', { zh: '炼乳', vi: 'sữa đặc' }, ['longevity']],
        ['pandan', 'Pandan leaves', { zh: '斑斓叶', vi: 'lá dứa' }],
        ['mung', 'Peeled mung beans', { zh: '去皮绿豆', vi: 'đậu xanh' }],
      ]],
    ]
  ),

  thai: tree(
    'thai',
    ['Pad thai', 'Green curry', 'Red curry', 'Massaman curry', 'Tom yum', 'Tom kha', 'Pad see ew', 'Pad kra pao', 'Som tam', 'Larb', 'Mango sticky rice', 'Thai iced tea'],
    [
      ['curry', 'Curry pastes', { zh: '咖喱酱', th: 'พริกแกง' }, [
        ['red', 'Red curry paste', { zh: '红咖喱酱', th: 'พริกแกงเผ็ด' }, ['maesri', 'mae ploy']],
        ['green', 'Green curry paste', { zh: '绿咖喱酱', th: 'พริกแกงเขียวหวาน' }],
        ['massaman', 'Massaman curry paste', { zh: '马沙文咖喱酱', th: 'พริกแกงมัสมั่น' }],
        ['panang', 'Panang curry paste', { zh: '帕能咖喱酱', th: 'พริกแกงพะแนง' }, ['penang']],
        ['yellow', 'Yellow curry paste', { zh: '黄咖喱酱', th: 'พริกแกงกะหรี่' }],
        ['nam-prik-pao', 'Chili jam', { zh: '泰式辣椒膏', th: 'น้ำพริกเผา' }, ['nam prik pao', 'tom yum']],
      ]],
      ['herbs', 'Fresh herbs', { zh: '香草', th: 'สมุนไพร' }, [
        ['galangal', 'Galangal', { zh: '南姜', th: 'ข่า' }],
        ['lemongrass', 'Lemongrass', { zh: '香茅', th: 'ตะไคร้' }],
        ['makrut', 'Kaffir lime leaves', { zh: '泰国青柠叶', th: 'ใบมะกรูด' }, ['makrut']],
        ['horapa', 'Thai basil', { zh: '九层塔', th: 'โหระพา' }],
        ['kaprao', 'Holy basil', { zh: '圣罗勒', th: 'กะเพรา' }, ['kra pao', 'gaprao']],
        ['prik', 'Thai chilies', { zh: '泰国朝天椒', th: 'พริกขี้หนู' }, ["bird's eye chili"]],
        ['pandan', 'Pandan leaves', { zh: '斑斓叶', th: 'ใบเตย' }],
      ]],
      ['sauces', 'Sauces', { zh: '酱料', th: 'ซอส' }, [
        ['nam-pla', 'Fish sauce', { zh: '鱼露', th: 'น้ำปลา' }, ['squid brand', 'tiparos']],
        ['oyster', 'Oyster sauce', { zh: '蚝油', th: 'ซอสหอยนางรม' }],
        ['golden-mountain', 'Seasoning sauce', { zh: '泰式调味酱油', th: 'ซอสปรุงรส' }, ['golden mountain']],
        ['black-soy', 'Black soy sauce', { zh: '泰式老抽', th: 'ซีอิ๊วดำ' }, ['pad see ew']],
        ['kapi', 'Shrimp paste', { zh: '虾酱', th: 'กะปิ' }, ['kapi']],
        ['sweet-chili', 'Sweet chili sauce', { zh: '泰式甜辣酱', th: 'น้ำจิ้มไก่' }],
      ]],
      ['sour-sweet', 'Sour, sweet & coconut', { zh: '酸·甜·椰', th: 'เปรี้ยว หวาน กะทิ' }, [
        ['tamarind', 'Tamarind pulp', { zh: '罗望子', th: 'มะขามเปียก' }, ['tamarind']],
        ['palm-sugar', 'Palm sugar', { zh: '椰糖', th: 'น้ำตาลปี๊บ' }],
        ['coconut-milk', 'Coconut milk', { zh: '椰浆', th: 'กะทิ' }, ['aroy-d', 'chaokoh']],
        ['coconut-cream', 'Coconut cream', { zh: '椰奶油', th: 'หัวกะทิ' }],
      ]],
      ['rice-noodles', 'Rice & noodles', { zh: '米·粉', th: 'ข้าว เส้น' }, [
        ['jasmine', 'Thai jasmine rice', { zh: '泰国香米', th: 'ข้าวหอมมะลิ' }],
        ['sticky', 'Sticky rice', { zh: '糯米', th: 'ข้าวเหนียว' }, ['glutinous rice']],
        ['sen-lek', 'Rice sticks (pad thai)', { zh: '泰式细河粉', th: 'เส้นเล็ก' }, ['sen lek']],
        ['sen-yai', 'Wide rice noodles', { zh: '泰式宽河粉', th: 'เส้นใหญ่' }, ['sen yai']],
        ['woon-sen', 'Glass noodles', { zh: '粉丝', th: 'วุ้นเส้น' }],
      ]],
      ['som-tam', 'Som tam & produce', { zh: '青木瓜沙拉·蔬菜', th: 'ส้มตำ ผัก' }, [
        ['green-papaya', 'Green papaya', { zh: '青木瓜', th: 'มะละกอดิบ' }],
        ['long-beans', 'Long beans', { zh: '豇豆', th: 'ถั่วฝักยาว' }],
        ['thai-eggplant', 'Thai eggplant', { zh: '泰国圆茄', th: 'มะเขือเปราะ' }],
        ['dried-shrimp', 'Dried shrimp', { zh: '虾米', th: 'กุ้งแห้ง' }],
      ]],
      ['drinks', 'Thai tea & desserts', { zh: '泰式茶·甜品', th: 'ชาไทย ของหวาน' }, [
        ['thai-tea', 'Thai tea mix', { zh: '泰式红茶', th: 'ชาไทย' }, ['chatramue', 'cha tra mue']],
        ['mango', 'Nam dok mai mangoes', { zh: '泰国芒果', th: 'มะม่วงน้ำดอกไม้' }, ['mango']],
        ['condensed', 'Sweetened condensed milk', { zh: '炼乳', th: 'นมข้นหวาน' }],
      ]],
    ]
  ),

  filipino: tree(
    'filipino',
    ['Adobo', 'Sinigang', 'Lumpia', 'Pancit', 'Lechon', 'Kare-kare', 'Sisig', 'Silog breakfasts', 'Chicken inasal', 'Halo-halo', 'Ube desserts'],
    [
      ['vinegar-sauce', 'Vinegars & sauces', { zh: '醋·酱料' }, [
        ['cane-vinegar', 'Cane vinegar', { zh: '甘蔗醋' }, ['sukang iloko', 'sukang maasim', 'datu puti']],
        ['coconut-vinegar', 'Coconut vinegar', { zh: '椰子醋' }, ['sukang tuba']],
        ['sinamak', 'Spiced vinegar', { zh: '辣味醋' }, ['sinamak']],
        ['toyo', 'Filipino soy sauce', { zh: '菲律宾酱油' }, ['toyo', 'silver swan']],
        ['patis', 'Patis', { zh: '鱼露' }, ['fish sauce', 'rufina']],
        ['banana-ketchup', 'Banana ketchup', { zh: '香蕉番茄酱' }, ['jufran', 'ufc']],
        ['lechon-sauce', 'Lechon sauce', { zh: '烤猪酱' }, ['mang tomas', 'liver sauce']],
      ]],
      ['pastes-mixes', 'Bagoong & mixes', { zh: '虾酱·调料包' }, [
        ['bagoong-alamang', 'Bagoong alamang', { zh: '菲律宾虾酱' }, ['bagoong', 'shrimp paste', 'barrio fiesta']],
        ['bagoong-isda', 'Bagoong isda', { zh: '鱼酱' }, ['bagoong monamon', 'anchovy paste']],
        ['sinigang-mix', 'Sinigang mix', { zh: '酸汤料' }, ['sinigang', 'knorr sinigang']],
        ['kare-kare-mix', 'Kare-kare mix', { zh: '花生炖牛尾料' }, ['kare kare']],
        ['atsuete', 'Annatto seeds', { zh: '胭脂树籽' }, ['atsuete', 'achuete', 'achiote']],
      ]],
      ['produce', 'Calamansi & produce', { zh: '青金桔·蔬果' }, [
        ['calamansi', 'Calamansi', { zh: '青金桔' }, ['kalamansi']],
        ['kangkong', 'Water spinach', { zh: '空心菜' }, ['kangkong']],
        ['saba', 'Saba bananas', { zh: '萨巴蕉' }, ['saba']],
        ['gabi', 'Taro', { zh: '芋头' }, ['gabi']],
        ['ampalaya', 'Bitter melon', { zh: '苦瓜' }, ['ampalaya']],
        ['banana-leaves', 'Banana leaves', { zh: '香蕉叶' }],
      ]],
      ['noodles', 'Noodles & wrappers', { zh: '面·春卷皮' }, [
        ['pancit-canton', 'Pancit canton', { zh: '菲律宾炒面' }, ['canton noodles']],
        ['bihon', 'Bihon', { zh: '米粉' }, ['rice sticks']],
        ['sotanghon', 'Sotanghon', { zh: '粉丝' }, ['glass noodles']],
        ['lumpia-wrap', 'Lumpia wrappers', { zh: '春卷皮' }, ['lumpia', 'spring roll wrappers']],
      ]],
      ['meats', 'Cured meats & dried fish', { zh: '腌肉·鱼干' }, [
        ['longganisa', 'Longganisa', { zh: '菲律宾香肠' }, ['longanisa']],
        ['tocino', 'Tocino', { zh: '甜腌猪肉' }],
        ['tuyo', 'Tuyo & daing', { zh: '咸鱼干' }, ['tuyo', 'daing', 'dried fish']],
        ['chicharron', 'Chicharrón', { zh: '猪皮脆' }, ['chicharon']],
      ]],
      ['desserts', 'Halo-halo & ube', { zh: '哈罗哈罗·紫山药' }, [
        ['ube-halaya', 'Ube halaya', { zh: '紫山药酱' }, ['ube', 'purple yam']],
        ['ube-extract', 'Ube extract', { zh: '紫山药香精' }],
        ['macapuno', 'Macapuno', { zh: '椰肉丝' }],
        ['nata', 'Nata de coco', { zh: '椰果' }],
        ['kaong', 'Kaong', { zh: '糖棕果' }, ['sugar palm fruit']],
        ['pinipig', 'Pinipig', { zh: '扁米' }],
      ]],
    ]
  ),

  indian: tree(
    'indian',
    ['Butter chicken', 'Chicken tikka masala', 'Biryani', 'Samosa', 'Saag paneer', 'Chana masala', 'Dal makhani', 'Tandoori chicken', 'Naan', 'Masala dosa', 'Chole bhature', 'Gulab jamun', 'Mango lassi'],
    [
      ['whole', 'Whole spices', { zh: '整粒香料' }, [
        ['jeera', 'Cumin seeds', { zh: '孜然' }, ['jeera']],
        ['elaichi', 'Green cardamom', { zh: '小豆蔻' }, ['elaichi', 'cardamom']],
        ['badi-elaichi', 'Black cardamom', { zh: '黑豆蔻' }, ['badi elaichi']],
        ['laung', 'Cloves', { zh: '丁香' }, ['laung']],
        ['tej-patta', 'Indian bay leaves', { zh: '印度月桂叶' }, ['tej patta']],
        ['rai', 'Mustard seeds', { zh: '芥菜籽' }, ['rai']],
        ['ajwain', 'Ajwain', { zh: '印度藏茴香' }, ['carom']],
        ['hing', 'Asafoetida', { zh: '阿魏' }, ['hing']],
      ]],
      ['masala', 'Ground spices & masalas', { zh: '香料粉' }, [
        ['haldi', 'Turmeric', { zh: '姜黄粉' }, ['haldi']],
        ['kashmiri', 'Kashmiri chili powder', { zh: '克什米尔辣椒粉' }, ['kashmiri', 'lal mirch']],
        ['garam-masala', 'Garam masala', { zh: '印度综合香料' }, ['mdh', 'everest']],
        ['tandoori-masala', 'Tandoori masala', { zh: '唐杜里香料' }],
        ['chaat-masala', 'Chaat masala', { zh: '恰特香料' }],
        ['kasuri-methi', 'Kasuri methi', { zh: '干葫芦巴叶' }, ['fenugreek leaves']],
        ['kesar', 'Saffron', { zh: '藏红花' }, ['kesar']],
      ]],
      ['rice-flour', 'Rice & flours', { zh: '米·面粉' }, [
        ['basmati', 'Aged basmati rice', { zh: '印度香米' }, ['basmati', 'sella', 'india gate']],
        ['atta', 'Atta', { zh: '印度全麦面粉' }, ['chapati flour']],
        ['besan', 'Besan', { zh: '鹰嘴豆粉' }, ['gram flour']],
        ['sooji', 'Sooji', { zh: '粗粒小麦粉' }, ['rava', 'semolina']],
        ['idli-rice', 'Idli rice', { zh: '蒸米糕米' }, ['idli rava']],
      ]],
      ['dal', 'Dals & pulses', { zh: '豆类' }, [
        ['toor', 'Toor dal', { zh: '木豆' }, ['arhar', 'pigeon peas']],
        ['urad', 'Urad dal', { zh: '黑吉豆' }, ['dal makhani', 'black gram']],
        ['chana-dal', 'Chana dal', { zh: '鹰嘴豆瓣' }],
        ['kabuli', 'Kabuli chana', { zh: '鹰嘴豆' }, ['chickpeas', 'chole']],
        ['moong', 'Moong dal', { zh: '绿豆瓣' }],
        ['rajma', 'Rajma', { zh: '红腰豆' }, ['kidney beans']],
      ]],
      ['dairy', 'Ghee & dairy', { zh: '酥油·奶制品' }, [
        ['ghee', 'Ghee', { zh: '印度酥油' }],
        ['paneer', 'Paneer', { zh: '印度奶酪' }],
        ['dahi', 'Dahi', { zh: '印度酸奶' }, ['yogurt', 'curd']],
        ['khoya', 'Khoya', { zh: '浓缩奶块' }, ['mawa']],
      ]],
      ['south', 'South Indian', { zh: '南印度' }, [
        ['curry-leaves', 'Curry leaves', { zh: '咖喱叶' }, ['kadi patta']],
        ['sambar', 'Sambar powder', { zh: '桑巴粉' }],
        ['coconut', 'Frozen grated coconut', { zh: '冷冻椰丝' }],
        ['tamarind', 'Tamarind', { zh: '罗望子' }, ['imli']],
      ]],
      ['pantry', 'Pickles & sweets', { zh: '腌菜·甜点' }, [
        ['achar', 'Mango & lime pickle', { zh: '印度腌菜' }, ['achar', 'pickle']],
        ['jaggery', 'Jaggery', { zh: '印度粗糖' }, ['gur']],
        ['papad', 'Papad', { zh: '印度薄饼' }, ['papadum']],
        ['rose-syrup', 'Rose syrup', { zh: '玫瑰糖浆' }, ['rooh afza']],
        ['gulab-jamun', 'Gulab jamun mix', { zh: '炸奶球粉' }],
      ]],
    ]
  ),

  mediterranean: tree(
    'mediterranean',
    ['Hummus', 'Falafel', 'Shawarma', 'Kebab', 'Gyro', 'Tabbouleh', 'Fattoush', 'Baba ghanoush', 'Dolma', 'Spanakopita', 'Baklava', 'Kunafa', "Man'oushe"],
    [
      ['tahini-legumes', 'Tahini & legumes', { zh: '芝麻酱·豆类' }, [
        ['tahini', 'Tahini', { zh: '中东芝麻酱' }, ['al wadi', 'soom']],
        ['chickpeas', 'Dried chickpeas', { zh: '鹰嘴豆' }, ['garbanzo']],
        ['ful', 'Fava beans', { zh: '蚕豆' }, ['ful medames', 'foul']],
        ['red-lentils', 'Red lentils', { zh: '红扁豆' }],
        ['freekeh', 'Freekeh', { zh: '烤青麦' }],
      ]],
      ['spices', 'Spice blends', { zh: '香料' }, [
        ['zaatar', "Za'atar", { zh: '扎塔香料' }, ['zaatar', 'zatar']],
        ['sumac', 'Sumac', { zh: '漆树粉' }],
        ['aleppo', 'Aleppo pepper', { zh: '阿勒颇辣椒' }, ['pul biber']],
        ['urfa', 'Urfa biber', { zh: '乌尔法辣椒' }, ['isot']],
        ['baharat', 'Seven spice', { zh: '中东七香粉' }, ['baharat']],
        ['shawarma', 'Shawarma spice', { zh: '沙威玛香料' }],
      ]],
      ['dough', 'Breads & doughs', { zh: '饼·面皮' }, [
        ['pita', 'Pita', { zh: '皮塔饼' }, ['pitta']],
        ['lavash', 'Lavash', { zh: '拉瓦什薄饼' }, ['markouk', 'saj bread']],
        ['phyllo', 'Phyllo dough', { zh: '酥皮' }, ['filo', 'fillo']],
        ['kataifi', 'Kataifi dough', { zh: '卡达伊夫面丝' }, ['kunafa dough', 'kadayif']],
        ['bulgur', 'Bulgur', { zh: '碾碎干小麦' }, ['burghul', 'fine bulgur']],
        ['couscous', 'Couscous', { zh: '古斯米' }],
      ]],
      ['cheese', 'Cheese & dairy', { zh: '奶酪·乳品' }, [
        ['feta', 'Feta', { zh: '菲达奶酪' }, ['greek feta']],
        ['halloumi', 'Halloumi', { zh: '哈罗米奶酪' }, ['hellim']],
        ['akkawi', 'Akkawi', { zh: '阿卡维奶酪' }, ['kunafa cheese', 'nabulsi']],
        ['labneh', 'Labneh', { zh: '中东酸奶酪' }],
        ['kashkaval', 'Kashkaval', { zh: '卡什卡瓦尔奶酪' }],
      ]],
      ['olives-oil', 'Olives, oil & molasses', { zh: '橄榄·油·糖浆' }, [
        ['evoo', 'Extra virgin olive oil', { zh: '特级初榨橄榄油' }, ['olive oil', 'evoo']],
        ['kalamata', 'Kalamata olives', { zh: '卡拉马塔橄榄' }, ['olives']],
        ['pomegranate', 'Pomegranate molasses', { zh: '石榴糖浆' }, ['dibs rumman']],
        ['grape-leaves', 'Grape leaves', { zh: '葡萄叶' }, ['vine leaves']],
        ['pickled-turnips', 'Pickled turnips', { zh: '腌芜菁' }, ['lift', 'shawarma pickles']],
      ]],
      ['meat', 'Halal meat', { zh: '清真肉类' }, [
        ['lamb', 'Halal lamb', { zh: '清真羊肉' }],
        ['chicken', 'Halal chicken', { zh: '清真鸡肉' }],
        ['gyro-cones', 'Gyro & shawarma cones', { zh: '沙威玛肉柱' }, ['doner', 'gyro']],
        ['sujuk', 'Sujuk', { zh: '土耳其香肠' }, ['sucuk']],
      ]],
      ['sweets', 'Sweets & coffee', { zh: '甜点·咖啡' }, [
        ['rose-water', 'Rose water', { zh: '玫瑰水' }],
        ['orange-blossom', 'Orange blossom water', { zh: '橙花水' }],
        ['pistachio', 'Antep pistachios', { zh: '安泰普开心果' }, ['pistachio']],
        ['turkish-coffee', 'Turkish coffee', { zh: '土耳其咖啡' }, ['kurukahveci']],
      ]],
    ]
  ),

  mexican: tree(
    'mexican',
    ['Tacos al pastor', 'Carnitas', 'Birria', 'Enchiladas', 'Mole', 'Pozole', 'Tamales', 'Chilaquiles', 'Elote', 'Quesadillas', 'Pupusas', 'Arepas', 'Ceviche', 'Aguas frescas'],
    [
      ['chiles', 'Dried chiles', { zh: '干辣椒', es: 'chiles secos' }, [
        ['guajillo', 'Guajillo', { zh: '瓜希柳辣椒', es: 'chile guajillo' }],
        ['ancho', 'Ancho', { zh: '安丘辣椒', es: 'chile ancho' }],
        ['pasilla', 'Pasilla', { zh: '帕西拉辣椒', es: 'chile pasilla' }],
        ['arbol', 'Chile de árbol', { zh: '树辣椒', es: 'chile de árbol' }, ['arbol']],
        ['mulato', 'Mulato', { zh: '穆拉托辣椒', es: 'chile mulato' }],
        ['morita', 'Chipotle morita', { zh: '烟熏辣椒', es: 'chipotle morita' }, ['chipotle']],
        ['cascabel', 'Cascabel', { zh: '响铃辣椒', es: 'chile cascabel' }],
      ]],
      ['corn', 'Masa & corn', { zh: '玉米面·玉米', es: 'masa y maíz' }, [
        ['masa-harina', 'Masa harina', { zh: '墨西哥玉米面粉', es: 'harina de maíz nixtamalizada' }, ['maseca', 'masienda']],
        ['tortillas', 'Corn tortillas', { zh: '玉米饼', es: 'tortillas de maíz' }],
        ['hominy', 'Hominy', { zh: '白玉米粒', es: 'maíz pozolero' }, ['pozole']],
        ['husks', 'Corn husks', { zh: '玉米叶', es: 'hojas para tamal' }, ['tamale husks']],
        ['masarepa', 'Masarepa', { zh: '阿雷帕玉米粉', es: 'harina P.A.N.' }, ['pan', 'arepa flour']],
      ]],
      ['sauces', 'Sauces & pastes', { zh: '酱料', es: 'salsas y pastas' }, [
        ['chipotle-adobo', 'Chipotles in adobo', { zh: '烟熏辣椒罐头', es: 'chipotles en adobo' }, ['la costeña', 'san marcos']],
        ['achiote', 'Achiote paste', { zh: '胭脂树籽酱', es: 'pasta de achiote' }, ['annatto', 'cochinita']],
        ['mole', 'Mole paste', { zh: '摩尔酱', es: 'pasta de mole' }, ['doña maría', 'mole poblano']],
        ['valentina', 'Hot sauce', { zh: '墨西哥辣酱', es: 'salsa picante' }, ['valentina', 'cholula', 'tapatío']],
      ]],
      ['cheese', 'Cheese & crema', { zh: '奶酪·酸奶油', es: 'quesos y crema' }, [
        ['queso-fresco', 'Queso fresco', { zh: '墨西哥鲜奶酪', es: 'queso fresco' }],
        ['cotija', 'Cotija', { zh: '科蒂哈奶酪', es: 'queso cotija' }],
        ['oaxaca', 'Oaxaca cheese', { zh: '瓦哈卡奶酪', es: 'quesillo' }, ['quesillo']],
        ['chihuahua', 'Queso Chihuahua', { zh: '奇瓦瓦奶酪', es: 'queso Chihuahua' }, ['asadero', 'menonita']],
        ['crema', 'Crema mexicana', { zh: '墨西哥酸奶油', es: 'crema' }],
      ]],
      ['herbs', 'Herbs & spices', { zh: '香草·香料', es: 'hierbas y especias' }, [
        ['oregano', 'Mexican oregano', { zh: '墨西哥牛至', es: 'orégano mexicano' }],
        ['epazote', 'Epazote', { zh: '土荆芥', es: 'epazote' }],
        ['avocado-leaves', 'Avocado leaves', { zh: '牛油果叶', es: 'hoja de aguacate' }],
        ['canela', 'Canela', { zh: '锡兰肉桂', es: 'canela' }, ['ceylon cinnamon']],
        ['jamaica', 'Dried hibiscus', { zh: '洛神花', es: 'flor de jamaica' }, ['jamaica']],
      ]],
      ['produce', 'Produce', { zh: '蔬果', es: 'verduras y frutas' }, [
        ['tomatillo', 'Tomatillos', { zh: '墨西哥绿番茄', es: 'tomate verde' }],
        ['poblano', 'Poblano peppers', { zh: '波布拉诺辣椒', es: 'chile poblano' }],
        ['jalapeno', 'Jalapeños & serranos', { zh: '墨西哥辣椒', es: 'jalapeños y serranos' }, ['jalapeno', 'serrano']],
        ['avocado', 'Hass avocados', { zh: '牛油果', es: 'aguacate' }, ['avocado']],
        ['nopales', 'Nopales', { zh: '仙人掌片', es: 'nopales' }, ['cactus']],
        ['limes', 'Limes', { zh: '青柠', es: 'limones' }],
      ]],
      ['meat', 'Meats', { zh: '肉类', es: 'carnes' }, [
        ['pastor', 'Pork shoulder (pastor, carnitas)', { zh: '猪肩肉', es: 'pierna de cerdo' }, ['al pastor', 'carnitas']],
        ['birria', 'Beef & goat for birria', { zh: '炖肉用牛羊肉', es: 'carne para birria' }, ['birria', 'chivo']],
        ['arrachera', 'Arrachera', { zh: '裙边牛排', es: 'arrachera' }, ['skirt steak']],
        ['chorizo', 'Chorizo', { zh: '墨西哥辣肠', es: 'chorizo' }],
      ]],
      ['sweets', 'Sweets & drinks', { zh: '甜品·饮料', es: 'dulces y bebidas' }, [
        ['piloncillo', 'Piloncillo', { zh: '墨西哥红糖', es: 'piloncillo' }, ['panela']],
        ['chocolate', 'Mexican chocolate', { zh: '墨西哥巧克力', es: 'chocolate de mesa' }, ['abuelita', 'ibarra']],
        ['cajeta', 'Cajeta', { zh: '羊奶焦糖酱', es: 'cajeta' }],
        ['tamarind', 'Tamarind', { zh: '罗望子', es: 'tamarindo' }],
      ]],
    ]
  ),

  italian: tree(
    'italian',
    ['Neapolitan pizza', 'Carbonara', 'Cacio e pepe', 'Amatriciana', 'Lasagna', 'Risotto', 'Gnocchi', 'Burrata', 'Osso buco', 'Arancini', 'Tiramisù', 'Cannoli'],
    [
      ['cheese', 'Cheese', { zh: '奶酪', it: 'formaggi' }, [
        ['parmigiano', 'Parmigiano Reggiano DOP', { zh: '帕玛森奶酪', it: 'Parmigiano Reggiano' }, ['parmesan', 'parmigiano']],
        ['pecorino', 'Pecorino Romano DOP', { zh: '罗马羊奶酪', it: 'Pecorino Romano' }, ['pecorino']],
        ['grana', 'Grana Padano', { zh: '格拉娜帕达诺', it: 'Grana Padano' }],
        ['bufala', 'Mozzarella di bufala', { zh: '水牛马苏里拉', it: 'mozzarella di bufala' }, ['buffalo mozzarella', 'bufala']],
        ['fior-di-latte', 'Fior di latte', { zh: '马苏里拉奶酪', it: 'fior di latte' }, ['mozzarella']],
        ['burrata', 'Burrata', { zh: '布拉塔奶酪', it: 'burrata' }],
        ['ricotta', 'Ricotta', { zh: '乳清奶酪', it: 'ricotta' }],
        ['mascarpone', 'Mascarpone', { zh: '马斯卡彭', it: 'mascarpone' }],
        ['gorgonzola', 'Gorgonzola', { zh: '戈贡佐拉', it: 'gorgonzola' }],
      ]],
      ['salumi', 'Cured meats', { zh: '意式腌肉', it: 'salumi' }, [
        ['guanciale', 'Guanciale', { zh: '风干猪脸肉', it: 'guanciale' }],
        ['pancetta', 'Pancetta', { zh: '意式培根', it: 'pancetta' }],
        ['prosciutto', 'Prosciutto di Parma', { zh: '帕尔马火腿', it: 'prosciutto di Parma' }, ['prosciutto', 'parma ham', 'san daniele']],
        ['mortadella', 'Mortadella', { zh: '摩泰台拉香肠', it: 'mortadella' }],
        ['nduja', "'Nduja", { zh: '辣味软香肠', it: "'nduja" }, ['nduja']],
        ['bresaola', 'Bresaola', { zh: '风干牛肉', it: 'bresaola' }],
      ]],
      ['flour', 'Flour, rice & pasta', { zh: '面粉·米·意面', it: 'farine, riso e pasta' }, [
        ['00', '00 flour', { zh: '00号面粉', it: 'farina 00' }, ['tipo 00', 'caputo', 'pizza flour']],
        ['semola', 'Semola rimacinata', { zh: '粗粒小麦粉', it: 'semola rimacinata' }, ['semolina']],
        ['carnaroli', 'Risotto rice', { zh: '意大利烩饭米', it: 'riso Carnaroli' }, ['carnaroli', 'arborio', 'vialone nano']],
        ['dried-pasta', 'Bronze-cut dried pasta', { zh: '铜模意面', it: 'pasta trafilata al bronzo' }, ['spaghetti', 'rigatoni', 'de cecco', 'rummo']],
        ['polenta', 'Polenta', { zh: '意式玉米粉', it: 'polenta' }],
      ]],
      ['tomatoes', 'Tomatoes', { zh: '番茄', it: 'pomodori' }, [
        ['san-marzano', 'San Marzano DOP', { zh: '圣马扎诺番茄', it: 'pomodoro San Marzano DOP' }, ['san marzano', 'pelati']],
        ['datterini', 'Datterini & piennolo', { zh: '小番茄罐头', it: 'datterini' }, ['piennolo', 'pomodorini']],
        ['passata', 'Passata', { zh: '番茄泥', it: 'passata' }],
        ['concentrato', 'Tomato paste', { zh: '番茄膏', it: 'doppio concentrato' }],
      ]],
      ['oil-vinegar', 'Oil, vinegar & truffle', { zh: '油·醋·松露', it: 'olio, aceto e tartufo' }, [
        ['evoo', 'Extra virgin olive oil', { zh: '特级初榨橄榄油', it: "olio extravergine d'oliva" }, ['olive oil', 'evoo']],
        ['balsamico', 'Aceto balsamico di Modena', { zh: '摩德纳黑醋', it: 'aceto balsamico di Modena' }, ['balsamic']],
        ['truffle', 'Truffle', { zh: '松露', it: 'tartufo' }, ['truffle oil', 'truffle paste']],
      ]],
      ['pantry', 'Pantry', { zh: '干货', it: 'dispensa' }, [
        ['acciughe', 'Anchovies', { zh: '凤尾鱼', it: 'acciughe' }, ['colatura', 'alici']],
        ['capperi', 'Capers', { zh: '刺山柑', it: 'capperi' }, ['pantelleria']],
        ['olives', 'Castelvetrano & Gaeta olives', { zh: '意大利橄榄', it: 'olive' }, ['olives']],
        ['porcini', 'Dried porcini', { zh: '牛肝菌干', it: 'porcini secchi' }, ['porcini']],
        ['calabrian', 'Calabrian chilies', { zh: '卡拉布里亚辣椒', it: 'peperoncino calabrese' }],
        ['pine-nuts', 'Pine nuts', { zh: '松子', it: 'pinoli' }],
      ]],
      ['dolci', 'Dolci & coffee', { zh: '甜品·咖啡', it: 'dolci e caffè' }, [
        ['savoiardi', 'Savoiardi', { zh: '手指饼干', it: 'savoiardi' }, ['ladyfingers']],
        ['pistachio', 'Bronte pistachio cream', { zh: '开心果酱', it: 'crema di pistacchio' }, ['pistachio']],
        ['cannoli', 'Cannoli shells', { zh: '奶油甜馅卷壳', it: 'cialde per cannoli' }],
        ['espresso', 'Espresso beans', { zh: '意式咖啡豆', it: 'caffè in grani' }, ['lavazza', 'illy', 'espresso']],
      ]],
    ]
  ),

  african: tree(
    'african',
    ['Jollof rice', 'Egusi soup', 'Suya', 'Fufu & pounded yam', 'Pepper soup', 'Injera with doro wat', 'Misir wat', 'Kitfo', 'Jerk chicken', 'Oxtail', 'Ackee & saltfish', 'Curry goat', 'Beef patties', 'Rice & peas'],
    [
      ['soups', 'West African soups', { zh: '西非汤料' }, [
        ['egusi', 'Egusi', { zh: '西瓜籽粉' }, ['melon seeds', 'agushi']],
        ['ogbono', 'Ogbono', { zh: '野芒果籽粉' }, ['bush mango seed']],
        ['bitter-leaf', 'Bitter leaf', { zh: '苦叶' }],
        ['ugu', 'Ugu leaves', { zh: '南瓜叶' }, ['fluted pumpkin']],
        ['uziza', 'Uziza', { zh: '西非胡椒叶' }],
        ['crayfish', 'Ground crayfish', { zh: '小龙虾粉' }, ['crayfish']],
        ['stockfish', 'Stockfish', { zh: '鳕鱼干' }, ['okporoko']],
        ['iru', 'Locust beans', { zh: '刺槐豆' }, ['iru', 'dawadawa', 'ogiri']],
      ]],
      ['seasoning', 'Oils & seasonings', { zh: '油·调料' }, [
        ['palm-oil', 'Red palm oil', { zh: '红棕榈油' }, ['palm oil', 'zomi']],
        ['cubes', 'Maggi & Knorr cubes', { zh: '浓汤块' }, ['maggi', 'knorr', 'stock cubes']],
        ['suya', 'Suya spice', { zh: '苏亚香料' }, ['yaji']],
        ['pepper-soup', 'Pepper soup spice', { zh: '胡椒汤香料' }],
        ['ata-rodo', 'Scotch bonnet peppers', { zh: '苏格兰帽椒' }, ['scotch bonnet', 'ata rodo']],
      ]],
      ['swallow', 'Swallows & starches', { zh: '主食粉' }, [
        ['gari', 'Gari', { zh: '木薯粒' }, ['garri', 'eba']],
        ['fufu', 'Fufu flour', { zh: '富富粉' }, ['fufu']],
        ['poundo', 'Pounded yam flour', { zh: '山药泥粉' }, ['poundo', 'iyan']],
        ['semovita', 'Semovita', { zh: '粗粒面粉' }],
        ['yam', 'Puna yam', { zh: '非洲山药' }, ['white yam']],
        ['plantain', 'Plantains', { zh: '大蕉' }, ['plantain']],
        ['cassava', 'Cassava', { zh: '木薯' }, ['yuca']],
      ]],
      ['rice-beans', 'Rice & beans', { zh: '米·豆' }, [
        ['parboiled', 'Parboiled rice', { zh: '蒸谷米' }, ['jollof rice', 'golden penny']],
        ['honey-beans', 'Honey beans', { zh: '蜜豆' }, ['ewa oloyin']],
        ['black-eyed', 'Black-eyed peas', { zh: '眉豆' }, ['cowpeas']],
      ]],
      ['ethiopian', 'Ethiopian', { zh: '埃塞俄比亚' }, [
        ['teff', 'Teff flour', { zh: '苔麸粉' }, ['injera', 'teff']],
        ['berbere', 'Berbere', { zh: '柏柏尔香料' }],
        ['mitmita', 'Mitmita', { zh: '米特米塔辣椒粉' }],
        ['kibbeh', 'Niter kibbeh', { zh: '香料黄油' }, ['spiced butter']],
        ['shiro', 'Shiro powder', { zh: '鹰嘴豆香料粉' }],
        ['korerima', 'Ethiopian cardamom', { zh: '埃塞俄比亚豆蔻' }, ['korerima']],
      ]],
      ['caribbean', 'Caribbean', { zh: '加勒比' }, [
        ['jerk', 'Jerk seasoning', { zh: '牙买加烤肉香料' }, ['walkerswood', 'jerk']],
        ['pimento', 'Pimento berries', { zh: '多香果' }, ['allspice']],
        ['ackee', 'Ackee', { zh: '阿基果' }],
        ['saltfish', 'Saltfish', { zh: '咸鳕鱼' }, ['salt cod', 'bacalao']],
        ['callaloo', 'Callaloo', { zh: '苋菜' }],
        ['curry', 'Jamaican curry powder', { zh: '牙买加咖喱粉' }, ['betapac']],
        ['browning', 'Browning sauce', { zh: '焦糖色酱' }, ['browning']],
        ['goat', 'Goat meat', { zh: '山羊肉' }, ['goat', 'curry goat']],
        ['oxtail', 'Oxtail', { zh: '牛尾' }],
      ]],
    ]
  ),
};

// ------------------------------------------------------------- lookups --

const byId = new Map<string, Tag>();
for (const c of CUISINES) {
  for (const g of TREE[c].groups) {
    byId.set(g.id, g);
    for (const i of g.items) byId.set(i.id, i);
  }
}

export const tagById = (id: string) => byId.get(id);

/** "Gochujang 고추장" — English, then the reader's language when it has one. */
export function tagName(t: Pick<Tag, 'en' | 'names'>, lang: Lang): string {
  const other = lang === 'en' ? undefined : t.names[lang];
  return other && other.toLowerCase() !== t.en.toLowerCase() ? `${t.en} ${other}` : t.en;
}

/** Every name a tag goes by, for search. */
export const namesOf = (t: Tag) => [t.en, ...Object.values(t.names), ...t.also].filter((s): s is string => !!s);

/** Every ingredient item, across all cuisines. */
export const ALL_ITEMS: Tag[] = CUISINES.flatMap((c) => TREE[c].groups.flatMap((g) => g.items));

/** The cuisines a set of item ids belongs to. */
export const cuisinesOf = (ids: string[]) => [...new Set(ids.map((id) => id.split('.')[0]))] as Cuisine[];

/**
 * Whether a listing's tags fall under any of the picked ids. Picking a
 * cuisine or a group picks everything under it; nothing picked matches all.
 */
export function tagsMatch(picked: Set<string>, ingredients: string[], cuisines: Cuisine[]): boolean {
  if (picked.size === 0) return true;
  for (const p of picked) {
    if (!p.includes('.') && cuisines.includes(p as Cuisine)) return true;
    for (const id of ingredients) if (id === p || id.startsWith(`${p}.`)) return true;
  }
  return false;
}
