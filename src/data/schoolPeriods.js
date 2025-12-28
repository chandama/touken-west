/**
 * Japanese Sword School Timeline Data
 *
 * Comprehensive mapping of sword schools to their active periods,
 * organized by tradition (den) and including sub-schools.
 *
 * Period year ranges:
 * - Heian: 794-1184
 * - Kamakura: 1185-1332
 * - Nanbokucho: 1333-1391
 * - Muromachi: 1392-1573
 * - Momoyama: 1573-1600
 * - Edo: 1600-1868
 *
 * Sources:
 * - nihonto.com
 * - japanesesword.net
 * - studyingjapaneseswords.com
 * - markussesko.com
 * - sho-shin.com
 * - Various scholarly sources
 *
 * Generated from schoolPeriods.csv on 2025-12-28
 */

// Period definitions with year ranges
export const PERIODS = {
  HEIAN: { id: 'heian', name: 'Heian', startYear: 794, endYear: 1184 },
  KAMAKURA: { id: 'kamakura', name: 'Kamakura', startYear: 1185, endYear: 1332 },
  NANBOKUCHO: { id: 'nanbokucho', name: 'Nanbokucho', startYear: 1333, endYear: 1391 },
  MUROMACHI: { id: 'muromachi', name: 'Muromachi', startYear: 1392, endYear: 1573 },
  MOMOYAMA: { id: 'momoyama', name: 'Momoyama', startYear: 1573, endYear: 1600 },
  EDO: { id: 'edo', name: 'Edo', startYear: 1600, endYear: 1868 },
};

// Sub-periods for more granular timeline
export const SUB_PERIODS = {
  LATE_HEIAN: { name: 'Late Heian', startYear: 1050, endYear: 1184 },
  EARLY_KAMAKURA: { name: 'Early Kamakura', startYear: 1185, endYear: 1230 },
  MID_KAMAKURA: { name: 'Mid Kamakura', startYear: 1230, endYear: 1290 },
  LATE_KAMAKURA: { name: 'Late Kamakura', startYear: 1290, endYear: 1332 },
  EARLY_NANBOKUCHO: { name: 'Early Nanbokucho', startYear: 1333, endYear: 1360 },
  LATE_NANBOKUCHO: { name: 'Late Nanbokucho', startYear: 1360, endYear: 1391 },
  EARLY_MUROMACHI: { name: 'Early Muromachi', startYear: 1392, endYear: 1467 },
  LATE_MUROMACHI: { name: 'Late Muromachi', startYear: 1467, endYear: 1573 },
};

/**
 * School data with active periods
 *
 * Each school has:
 * - name: Display name
 * - tradition: Parent tradition (Gokaden or regional)
 * - province: Province of origin
 * - startYear: Approximate start of activity
 * - endYear: Approximate end of activity
 * - peakStart/peakEnd: Peak period of production (optional)
 * - description: Brief description
 * - notableSmiths: Array of notable smiths (optional)
 */
export const SCHOOL_PERIODS = [
  // ============================================
  // YAMASHIRO
  // ============================================
  {
    name: 'Sanjo',
    tradition: 'Yamashiro',
    province: 'Yamashiro',
    startYear: 987,
    endYear: 1185,
    peakStart: 987,
    peakEnd: 1100,
    description: 'Oldest Yamashiro school, founded by Munechika c. 1000',
    notableSmiths: ['Munechika', 'Yoshiie', 'Kanenaga'],
  },
  {
    name: 'Gojo',
    tradition: 'Yamashiro',
    province: 'Yamashiro',
    startYear: 1028,
    endYear: 1100,
    description: 'Early Kyoto school, contemporary with Sanjo',
    notableSmiths: ['Kuninaga', 'Kanenaga', 'Kanetsugu'],
  },
  {
    name: 'Tochika',
    tradition: 'Yamashiro',
    province: 'Yamashiro',
    startYear: 1050,
    endYear: 1200,
    description: 'Early Kyoto school',
    notableSmiths: [],
  },
  {
    name: 'Momokawa',
    tradition: 'Yamashiro',
    province: 'Yamashiro',
    startYear: 1050,
    endYear: 1200,
    description: 'Early Kyoto school',
    notableSmiths: [],
  },
  {
    name: 'Ko-Aoe',
    tradition: 'Yamashiro',
    province: 'Bitchu',
    startYear: 1120,
    endYear: 1250,
    description: 'Old Aoe, late Heian to early Kamakura',
    notableSmiths: ['Yasutsugu', 'Sadatsugu', 'Tsunetsugu'],
  },
  {
    name: 'Awataguchi',
    tradition: 'Yamashiro',
    province: 'Yamashiro',
    startYear: 1185,
    endYear: 1320,
    peakStart: 1200,
    peakEnd: 1290,
    description: 'Premier Kamakura-era Kyoto school, known for elegant tanto',
    notableSmiths: ['Kunitomo', 'Hisakuni', 'Kuniyasu', 'Kunitsuna', 'Yoshimitsu'],
  },
  {
    name: 'Bungo',
    tradition: 'Yamashiro',
    province: 'Bungo',
    startYear: 1185,
    endYear: 1300,
    description: 'General Bungo province swordsmiths',
    notableSmiths: ['Yukihira', 'Tomoyuki'],
  },
  {
    name: 'Gassan',
    tradition: 'Yamashiro',
    province: 'Dewa',
    startYear: 1222,
    endYear: 1868,
    description: 'Long-running school known for ayasugi-hada',
    notableSmiths: ['Gassan Sadakazu', 'Gassan Sadayoshi'],
  },
  {
    name: 'Rai',
    tradition: 'Yamashiro',
    province: 'Yamashiro',
    startYear: 1250,
    endYear: 1392,
    peakStart: 1280,
    peakEnd: 1360,
    description: 'Succeeded Awataguchi as foremost Yamashiro school',
    notableSmiths: ['Kuniyuki', 'Kunitoshi', 'Kunimitsu', 'Niji Kunitoshi'],
  },
  {
    name: 'Chu-Aoe',
    tradition: 'Yamashiro',
    province: 'Bitchu',
    startYear: 1250,
    endYear: 1361,
    peakStart: 1280,
    peakEnd: 1320,
    description: 'Middle Aoe, mid-Kamakura to Nanbokucho',
    notableSmiths: ['Tsugunao', 'Moritsugu', 'Tsuguyoshi'],
  },
  {
    name: 'Ayanokoji',
    tradition: 'Yamashiro',
    province: 'Yamashiro',
    startYear: 1264,
    endYear: 1300,
    peakStart: 1264,
    peakEnd: 1333,
    description: 'Early-mid Kamakura school, very classical workmanship',
    notableSmiths: ['Sadatoshi', 'Sadayoshi', 'Nagamasa'],
  },
  {
    name: 'Ko-Enju',
    tradition: 'Yamashiro',
    province: 'Higo',
    startYear: 1275,
    endYear: 1333,
    description: 'Higo school founded by Kunimura, Rai lineage including Kunimura, Kunisuke, Kunitoki, and Kunitomo',
    notableSmiths: [],
  },
  {
    name: 'Ryokai',
    tradition: 'Yamashiro',
    province: 'Yamashiro',
    startYear: 1278,
    endYear: 1400,
    description: 'Late Rai school offshoot',
    notableSmiths: ['Ryokai'],
  },
  {
    name: 'Kanro',
    tradition: 'Yamashiro',
    province: 'Yamashiro',
    startYear: 1300,
    endYear: 1400,
    description: 'Nanbokucho Kyoto school',
    notableSmiths: ['Shigemitsu'],
  },
  {
    name: 'Nakajima Rai',
    tradition: 'Yamashiro',
    province: 'Yamashiro',
    startYear: 1320,
    endYear: 1400,
    description: 'Branch of Rai school at Nakajima',
    notableSmiths: ['Kunimune'],
  },
  {
    name: 'Fujishima',
    tradition: 'Yamashiro',
    province: 'Echizen',
    startYear: 1324,
    endYear: 1644,
    description: 'Founded by Tomoshige who was a Rai Kunitoshi student. Continued into the Edo period',
    notableSmiths: [],
  },
  {
    name: 'Chu-Enju',
    tradition: 'Yamashiro',
    province: 'Higo',
    startYear: 1333,
    endYear: 1392,
    description: 'Nanbokucho Enju Period including Kuniyoshi, Kunikiyo, Kunitsuna, Kunifusa, and Kunishige',
    notableSmiths: [],
  },
  {
    name: 'Nobukuni',
    tradition: 'Yamashiro',
    province: 'Yamashiro',
    startYear: 1334,
    endYear: 1500,
    description: 'Nanbokucho-Muromachi Kyoto school with Soshu influence',
    notableSmiths: ['Nobukuni'],
  },
  {
    name: 'Hasebe',
    tradition: 'Yamashiro',
    province: 'Yamashiro',
    startYear: 1334,
    endYear: 1400,
    description: 'Nanbokucho school known for bold hamon',
    notableSmiths: ['Kunishige', 'Kuninobu'],
  },
  {
    name: 'Aburanokoji',
    tradition: 'Yamashiro',
    province: 'Yamashiro',
    startYear: 1350,
    endYear: 1450,
    description: 'Late Nanbokucho-early Muromachi school',
    notableSmiths: [],
  },
  {
    name: 'Sue-Aoe',
    tradition: 'Yamashiro',
    province: 'Bitchu',
    startYear: 1361,
    endYear: 1457,
    description: 'Late Aoe, Nanbokucho era',
    notableSmiths: ['Tsuguyoshi', 'Yoshitsugu'],
  },
  {
    name: 'Chikushi Ryokai',
    tradition: 'Yamashiro',
    province: 'Tsukushi',
    startYear: 1368,
    endYear: 1487,
    description: '',
    notableSmiths: [],
  },
  {
    name: 'Echizen Rai',
    tradition: 'Yamashiro',
    province: 'Echizen',
    startYear: 1370,
    endYear: 1500,
    description: 'Rai smiths who relocated to Echizen',
    notableSmiths: ['Kuniyasu'],
  },
  {
    name: 'Sanjo Muromachi',
    tradition: 'Yamashiro',
    province: 'Yamashiro',
    startYear: 1392,
    endYear: 1500,
    description: 'Muromachi revival of Sanjo tradition',
    notableSmiths: [],
  },
  {
    name: 'Sue-Enju',
    tradition: 'Yamashiro',
    province: 'Higo',
    startYear: 1392,
    endYear: 1550,
    description: 'Late Enju, Muromachi period',
    notableSmiths: [],
  },
  // ============================================
  // BIZEN
  // ============================================
  {
    name: 'Ko-Bizen',
    tradition: 'Bizen',
    province: 'Bizen',
    startYear: 961,
    endYear: 1237,
    peakStart: 1050,
    peakEnd: 1180,
    description: 'Oldest Bizen school, late Heian period',
    notableSmiths: ['Tomonari', 'Sukenari', 'Sanetsune', 'Masatsune', 'Kanehira'],
  },
  {
    name: 'Ichimonji',
    tradition: 'Bizen',
    province: 'Bizen',
    startYear: 1185,
    endYear: 1370,
    peakStart: 1220,
    peakEnd: 1320,
    description: 'Prominent Kamakura school known for choji hamon',
    notableSmiths: ['Norimune', 'Sukemune', 'Yoshifusa'],
  },
  {
    name: 'Ko-Ichimonji',
    tradition: 'Bizen',
    province: 'Bizen',
    startYear: 1185,
    endYear: 1237,
    description: 'Early Ichimonji, centered in Fukuoka',
    notableSmiths: ['Norimune', 'Sukemune'],
  },
  {
    name: 'Fukuoka Ichimonji',
    tradition: 'Bizen',
    province: 'Bizen',
    startYear: 1220,
    endYear: 1320,
    peakStart: 1240,
    peakEnd: 1290,
    description: 'Main Ichimonji branch in Fukuoka district',
    notableSmiths: ['Yoshifusa', 'Sukezane', 'Sukemitsu', 'Yoshimoto'],
  },
  {
    name: 'Hatakeda',
    tradition: 'Bizen',
    province: 'Bizen',
    startYear: 1232,
    endYear: 1380,
    description: 'Branch school from Osafune lineage',
    notableSmiths: ['Moriie', 'Morishige'],
  },
  {
    name: 'Bizen Saburo',
    tradition: 'Bizen',
    province: 'Bizen',
    startYear: 1232,
    endYear: 1306,
    description: 'Nanbokucho-Muromachi Bizen school',
    notableSmiths: ['Kunimune'],
  },
  {
    name: 'Osafune',
    tradition: 'Bizen',
    province: 'Bizen',
    startYear: 1238,
    endYear: 1591,
    peakStart: 1238,
    peakEnd: 1380,
    description: 'Longest-running Bizen school, over 700 years until great flood',
    notableSmiths: ['Mitsutada', 'Nagamitsu', 'Kagemitsu', 'Sanenaga', 'Kanemitsu'],
  },
  {
    name: 'Katayama Ichimonji',
    tradition: 'Bizen',
    province: 'Bizen',
    startYear: 1250,
    endYear: 1350,
    description: 'Ichimonji branch in Katayama area',
    notableSmiths: ['Norifusa', 'Noritsune'],
  },
  {
    name: 'Kamakura Ichimonji',
    tradition: 'Bizen',
    province: 'Bizen',
    startYear: 1250,
    endYear: 1350,
    description: 'Ichimonji smiths who worked in Kamakura',
    notableSmiths: ['Sukezane', 'Sukeyoshi'],
  },
  {
    name: 'Wake',
    tradition: 'Bizen',
    province: 'Bizen',
    startYear: 1250,
    endYear: 1350,
    description: 'Kamakura-Nanbokucho Bizen school in Wake area',
    notableSmiths: [],
  },
  {
    name: 'Omiya',
    tradition: 'Bizen',
    province: 'Bizen',
    startYear: 1260,
    endYear: 1428,
    description: 'Nanbokucho-era Bizen school',
    notableSmiths: ['Morikage', 'Moritsugu', 'Moromitsu'],
  },
  {
    name: 'Yoshioka Ichimonji',
    tradition: 'Bizen',
    province: 'Bizen',
    startYear: 1278,
    endYear: 1370,
    description: 'Late Ichimonji branch that moved to Yoshioka',
    notableSmiths: ['Sukeyoshi', 'Sukemitsu'],
  },
  {
    name: 'Motoshige',
    tradition: 'Bizen',
    province: 'Bizen',
    startYear: 1303,
    endYear: 1365,
    peakStart: 1330,
    peakEnd: 1360,
    description: 'One of Osafune Shiten-no, Soshu influenced',
    notableSmiths: ['Motoshige'],
  },
  {
    name: 'Yoshii',
    tradition: 'Bizen',
    province: 'Bizen',
    startYear: 1312,
    endYear: 1428,
    description: 'Bizen school in Yoshii area',
    notableSmiths: ['Sukemitsu'],
  },
  {
    name: 'Ukai',
    tradition: 'Bizen',
    province: 'Bizen',
    startYear: 1317,
    endYear: 1450,
    description: 'Nanbokucho-Muromachi Bizen branch',
    notableSmiths: ['Kiyomitsu', 'Mitsusada'],
  },
  {
    name: 'Iwato Ichimonji',
    tradition: 'Bizen',
    province: 'Bizen',
    startYear: 1324,
    endYear: 1420,
    description: 'Also called Shochu Ichimonji, late Ichimonji branch',
    notableSmiths: ['Yoshiuji', 'Yoshikage'],
  },
  {
    name: 'Soden-Bizen',
    tradition: 'Bizen',
    province: 'Bizen',
    startYear: 1333,
    endYear: 1392,
    description: 'Bizen smiths influenced by Soshu techniques',
    notableSmiths: ['Chogi', 'Kanemitsu'],
  },
  {
    name: 'Chogi',
    tradition: 'Bizen',
    province: 'Bizen',
    startYear: 1334,
    endYear: 1392,
    description: 'Exceptional smith combining Bizen and Soshu styles',
    notableSmiths: ['Chogi (Nagayoshi)', 'Kanenaga (Kencho)', 'Nagamori', 'Yoshikage'],
  },
  {
    name: 'Kozori',
    tradition: 'Bizen',
    province: 'Bizen',
    startYear: 1350,
    endYear: 1428,
    peakStart: 1394,
    peakEnd: 1428,
    description: 'Nanbokucho-early Muromachi Osafune offshoot',
    notableSmiths: ['Morimitsu', 'Yasumitsu', 'Moromitsu'],
  },
  {
    name: 'Senoo',
    tradition: 'Bizen',
    province: 'Bizen',
    startYear: 1350,
    endYear: 1450,
    description: 'Nanbokucho-Muromachi Bizen branch',
    notableSmiths: ['Moriyasu'],
  },
  {
    name: 'Oei-Bizen',
    tradition: 'Bizen',
    province: 'Bizen',
    startYear: 1394,
    endYear: 1428,
    description: 'Osafune smiths of the Oei era, high quality',
    notableSmiths: ['Morimitsu', 'Yasumitsu', 'Moromitsu'],
  },
  {
    name: 'Oei-Eikyo',
    tradition: 'Bizen',
    province: 'Bizen',
    startYear: 1394,
    endYear: 1441,
    description: 'Combined Oei-Eikyo era Bizen production',
    notableSmiths: ['Morimitsu', 'Yasumitsu', 'Moromitsu', 'Norimitsu'],
  },
  {
    name: 'Seka Bizen',
    tradition: 'Bizen',
    province: 'Bizen',
    startYear: 1440,
    endYear: 1530,
    description: 'Mid-Muromachi Bizen production',
    notableSmiths: [],
  },
  {
    name: 'Sue-Bizen',
    tradition: 'Bizen',
    province: 'Bizen',
    startYear: 1460,
    endYear: 1591,
    description: 'Late Muromachi Bizen, mass production era',
    notableSmiths: ['Sukesada', 'Kiyomitsu', 'Norimitsu', 'Katsumitsu'],
  },
  // ============================================
  // YAMATO
  // ============================================
  {
    name: 'Nara',
    tradition: 'Yamato',
    province: 'Yamato',
    startYear: 701,
    endYear: 806,
    description: 'Earliest Yamato tradition swords',
    notableSmiths: ['Amakuni', 'Amakura', 'Shinsoku'],
  },
  {
    name: 'Ko-Senjuin',
    tradition: 'Yamato',
    province: 'Yamato',
    startYear: 1151,
    endYear: 1300,
    description: 'Early Senjuin, Heian to early Kamakura',
    notableSmiths: ['Yukinobu'],
  },
  {
    name: 'Ko-Naminohira',
    tradition: 'Yamato',
    province: 'Satsuma',
    startYear: 1159,
    endYear: 1392,
    description: 'Old Naminohira, Heian to Nanbokucho',
    notableSmiths: ['Masakuni', 'Yukiyasu'],
  },
  {
    name: 'Nio',
    tradition: 'Yamato',
    province: 'Bungo',
    startYear: 1204,
    endYear: 1450,
    description: 'Bungo school with Yamato influence',
    notableSmiths: ['Kiyotsuna', 'Kiyonaga'],
  },
  {
    name: 'Shikkake',
    tradition: 'Yamato',
    province: 'Yamato',
    startYear: 1275,
    endYear: 1390,
    description: 'One of five Yamato schools, founded by Norihiro',
    notableSmiths: ['Norihiro', 'Norinaga'],
  },
  {
    name: 'Ko-Uda',
    tradition: 'Yamato',
    province: 'Yamato',
    startYear: 1280,
    endYear: 1350,
    description: 'Early Uda school',
    notableSmiths: ['Kunimitsu'],
  },
  {
    name: 'Kongobyoe',
    tradition: 'Yamato',
    province: 'Chikuzen',
    startYear: 1280,
    endYear: 1570,
    peakStart: 1467,
    peakEnd: 1570,
    description: 'Chikuzen school with Buddhist connections',
    notableSmiths: ['Moritaka', 'Moritsugu'],
  },
  {
    name: 'Ko-Kongobyoe',
    tradition: 'Yamato',
    province: 'Chikuzen',
    startYear: 1280,
    endYear: 1392,
    description: 'Early Kongobyoe, Kamakura-Nanbokucho',
    notableSmiths: [],
  },
  {
    name: 'Tegai',
    tradition: 'Yamato',
    province: 'Yamato',
    startYear: 1288,
    endYear: 1450,
    peakStart: 1288,
    peakEnd: 1350,
    description: 'One of five Yamato schools, known for robust construction',
    notableSmiths: ['Kanenaga', 'Kanekiyo', 'Kaneuji'],
  },
  {
    name: 'Taima',
    tradition: 'Yamato',
    province: 'Yamato',
    startYear: 1288,
    endYear: 1390,
    description: 'One of five Yamato schools',
    notableSmiths: ['Kuniyuki', 'Tomokiyo', 'Kunimitsu'],
  },
  {
    name: 'Hosho',
    tradition: 'Yamato',
    province: 'Yamato',
    startYear: 1290,
    endYear: 1392,
    description: 'Longest surviving of five Yamato schools',
    notableSmiths: ['Sadayoshi', 'Sadamune', 'Sadakiyo'],
  },
  {
    name: 'Chu-Senjuin',
    tradition: 'Yamato',
    province: 'Yamato',
    startYear: 1300,
    endYear: 1392,
    description: 'Early Senjuin, Heian to early Kamakura',
    notableSmiths: ['Yukinobu'],
  },
  {
    name: 'Ko-Mihara',
    tradition: 'Yamato',
    province: 'Bingo',
    startYear: 1312,
    endYear: 1394,
    peakStart: 1306,
    peakEnd: 1350,
    description: 'Old Mihara, founded by Masaie',
    notableSmiths: ['Masaie', 'Masahiro', 'Masamitsu'],
  },
  {
    name: 'Uda',
    tradition: 'Yamato',
    province: 'Yamato',
    startYear: 1320,
    endYear: 1500,
    description: 'Yamato school branch, relocated smiths',
    notableSmiths: ['Kunimitsu', 'Kunifusa', 'Kunimune'],
  },
  {
    name: 'Takagi',
    tradition: 'Yamato',
    province: 'Yamato',
    startYear: 1330,
    endYear: 1450,
    description: 'Nanbokucho-Muromachi Yamato branch',
    notableSmiths: [],
  },
  {
    name: 'Mino Senjuin',
    tradition: 'Yamato',
    province: 'Mino',
    startYear: 1350,
    endYear: 1500,
    description: 'Senjuin smiths who relocated to Mino',
    notableSmiths: [],
  },
  {
    name: 'Naminohira',
    tradition: 'Yamato',
    province: 'Satsuma',
    startYear: 1392,
    endYear: 1868,
    description: 'Longest-running school, nearly 1000 years',
    notableSmiths: ['Masakuni', 'Yukiyasu', 'Yasuyuki'],
  },
  {
    name: 'Chu-Mihara',
    tradition: 'Yamato',
    province: 'Bingo',
    startYear: 1394,
    endYear: 1429,
    description: 'Middle Mihara, Oei to Eikyo era',
    notableSmiths: [],
  },
  {
    name: 'Sue-Mihara',
    tradition: 'Yamato',
    province: 'Bingo',
    startYear: 1429,
    endYear: 1600,
    description: 'Late Mihara through Edo period',
    notableSmiths: ['Masanori', 'Masaoki'],
  },
  // ============================================
  // SOSHU
  // ============================================
  {
    name: 'Soshu',
    tradition: 'Soshu',
    province: 'Sagami',
    startYear: 1250,
    endYear: 1500,
    peakStart: 1290,
    peakEnd: 1350,
    description: 'Kamakura school, pinnacle of sword making',
    notableSmiths: ['Shintogo Kunimitsu', 'Yukimitsu', 'Masamune', 'Sadamune', 'Hiromitsu', 'Akihiro'],
  },
  {
    name: 'Ko-Soshu',
    tradition: 'Soshu',
    province: 'Sagami',
    startYear: 1250,
    endYear: 1290,
    description: 'Early Soshu, before Masamune era',
    notableSmiths: ['Shintogo Kunimitsu', 'Kunitsuna'],
  },
  {
    name: 'Norishige',
    tradition: 'Soshu',
    province: 'Etchu',
    startYear: 1300,
    endYear: 1360,
    description: 'One of Masamune Juttetsu, known for matsukawa-hada',
    notableSmiths: ['Norishige'],
  },
  {
    name: 'O-Sa',
    tradition: 'Soshu',
    province: 'Chikuzen',
    startYear: 1318,
    endYear: 1330,
    peakStart: 1330,
    peakEnd: 1380,
    description: 'Kyushu school founded by Samonji',
    notableSmiths: ['Samonji'],
  },
  {
    name: 'Go',
    tradition: 'Soshu',
    province: 'Etchu',
    startYear: 1320,
    endYear: 1380,
    description: 'Go Yoshihiro, one of Masamune Juttetsu',
    notableSmiths: ['Yoshihiro'],
  },
  {
    name: 'Sue-Sa',
    tradition: 'Soshu',
    province: 'Chikuzen',
    startYear: 1330,
    endYear: 1360,
    description: 'Sue-Sa Ichimon smiths, students of O-Sa',
    notableSmiths: ['Yukihiro', 'Yasuyoshi', 'Hiroyuki'],
  },
  {
    name: 'Tametsugu',
    tradition: 'Soshu',
    province: 'Kaga',
    startYear: 1330,
    endYear: 1450,
    description: 'Kaga school, Soshu influenced',
    notableSmiths: ['Tametsugu'],
  },
  {
    name: 'Sekishu',
    tradition: 'Soshu',
    province: 'Iwami',
    startYear: 1350,
    endYear: 1600,
    description: 'Iwami province swordsmiths',
    notableSmiths: [],
  },
  {
    name: 'Nagato Sa',
    tradition: 'Soshu',
    province: 'Nagato',
    startYear: 1380,
    endYear: 1500,
    description: 'Sa school branch in Nagato province',
    notableSmiths: [],
  },
  {
    name: 'Hirado Sa',
    tradition: 'Soshu',
    province: 'Hizen',
    startYear: 1450,
    endYear: 1570,
    description: 'Sa school branch in Hirado area',
    notableSmiths: [],
  },
  {
    name: 'Oishi Sa',
    tradition: 'Soshu',
    province: 'Chikuzen',
    startYear: 1450,
    endYear: 1550,
    description: 'Sa school branch at Oishi',
    notableSmiths: [],
  },
  {
    name: 'Shimada',
    tradition: 'Soshu',
    province: 'Suruga',
    startYear: 1455,
    endYear: 1868,
    peakStart: 1467,
    peakEnd: 1600,
    description: 'Suruga school, Soshu influenced',
    notableSmiths: ['Yoshisuke', 'Hirosuke', 'Sukemune'],
  },
  // ============================================
  // MINO
  // ============================================
  {
    name: 'Shizu',
    tradition: 'Mino',
    province: 'Mino',
    startYear: 1288,
    endYear: 1380,
    peakStart: 1319,
    peakEnd: 1344,
    description: 'Founded by Shizu Saburo Kaneuji after studying under Masamune',
    notableSmiths: ['Kaneuji'],
  },
  {
    name: 'Yamato Shizu',
    tradition: 'Mino',
    province: 'Yamato',
    startYear: 1288,
    endYear: 1350,
    description: 'Students Kaneuji left in Yamato',
    notableSmiths: ['Kaneuji (Nidai)'],
  },
  {
    name: 'Fujishima',
    tradition: 'Mino',
    province: 'Kaga',
    startYear: 1334,
    endYear: 1500,
    description: 'Mino-style school in Kaga province',
    notableSmiths: ['Tomoshige'],
  },
  {
    name: 'Naoe Shizu',
    tradition: 'Mino',
    province: 'Mino',
    startYear: 1344,
    endYear: 1450,
    description: 'Kaneuji students who settled in Naoe village',
    notableSmiths: ['Kanetsugu', 'Kanenobu', 'Kanetomo', 'Kanetoshi'],
  },
  {
    name: 'Seki',
    tradition: 'Mino',
    province: 'Mino',
    startYear: 1400,
    endYear: 1600,
    peakStart: 1467,
    peakEnd: 1573,
    description: 'Major Mino production center',
    notableSmiths: ['Kanesada', 'Kanemoto', 'Kanefusa'],
  },
  // ============================================
  // BINGO
  // ============================================
  {
    name: 'Hokke',
    tradition: 'Bingo',
    province: 'Bingo',
    startYear: 1280,
    endYear: 1400,
    peakStart: 1333,
    peakEnd: 1391,
    description: 'Bingo school in Ashida area',
    notableSmiths: ['Kaneyasu', 'Kanekiyo'],
  },
  // ============================================
  // KO-KYO
  // ============================================
  {
    name: 'Miike',
    tradition: 'Ko-Kyo',
    province: 'Chikugo',
    startYear: 1074,
    endYear: 1185,
    description: 'Ancient Kyushu school, one of oldest',
    notableSmiths: ['Tenta Mitsuyo'],
  },
  // ============================================
  // BUNGO
  // ============================================
  {
    name: 'Takada',
    tradition: 'Bungo',
    province: 'Bungo',
    startYear: 1334,
    endYear: 1600,
    description: 'Major Bungo school, Bizen influenced',
    notableSmiths: ['Tomoyuki', 'Tokiyuki', 'Munekage'],
  },
  // ============================================
  // DEWA
  // ============================================
  {
    name: 'Mogusa',
    tradition: 'Dewa',
    province: 'Dewa',
    startYear: 1150,
    endYear: 1300,
    description: 'Early Dewa school',
    notableSmiths: ['Nagamasa'],
  },
  // ============================================
  // ECHIZEN
  // ============================================
  {
    name: 'Echizen',
    tradition: 'Echizen',
    province: 'Echizen',
    startYear: 1350,
    endYear: 1600,
    description: 'Echizen province swordsmiths',
    notableSmiths: ['Yasutsugu'],
  },
  // ============================================
  // ECHIGO
  // ============================================
  {
    name: 'Echigo',
    tradition: 'Echigo',
    province: 'Echigo',
    startYear: 1400,
    endYear: 1600,
    description: 'Echigo province swordsmiths',
    notableSmiths: [],
  },
  // ============================================
  // KAGA
  // ============================================
  {
    name: 'Kaga',
    tradition: 'Kaga',
    province: 'Kaga',
    startYear: 1350,
    endYear: 1600,
    description: 'Kaga province swordsmiths',
    notableSmiths: ['Sanekage'],
  },
  // ============================================
  // INABA
  // ============================================
  {
    name: 'Inaba',
    tradition: 'Inaba',
    province: 'Inaba',
    startYear: 1350,
    endYear: 1500,
    description: 'Inaba province swordsmiths',
    notableSmiths: [],
  },
  // ============================================
  // VARIOUS
  // ============================================
  {
    name: 'Hoju',
    tradition: 'Various',
    province: 'Various',
    startYear: 1330,
    endYear: 1450,
    description: 'Smiths using Hoju name across provinces',
    notableSmiths: [],
  },
  {
    name: 'Hojoji',
    tradition: 'Various',
    province: 'Various',
    startYear: 1330,
    endYear: 1450,
    description: 'Related to Hoju school',
    notableSmiths: [],
  },
  {
    name: 'Nitta',
    tradition: 'Various',
    province: 'Kozuke',
    startYear: 1350,
    endYear: 1500,
    description: 'Kozuke province school',
    notableSmiths: [],
  },

];

/**
 * Get all unique traditions
 */
export function getTraditions() {
  const traditions = new Set(SCHOOL_PERIODS.map(s => s.tradition));
  return Array.from(traditions).sort();
}

/**
 * Get schools by tradition
 */
export function getSchoolsByTradition(tradition) {
  return SCHOOL_PERIODS.filter(s => s.tradition === tradition);
}

/**
 * Get schools active during a specific year
 */
export function getSchoolsActiveInYear(year) {
  return SCHOOL_PERIODS.filter(s => s.startYear <= year && s.endYear >= year);
}

/**
 * Get schools active during a period range
 */
export function getSchoolsInPeriod(startYear, endYear) {
  return SCHOOL_PERIODS.filter(s =>
    (s.startYear <= endYear && s.endYear >= startYear)
  );
}

/**
 * Search schools by name (case-insensitive partial match)
 */
export function searchSchools(query) {
  const lowerQuery = query.toLowerCase();
  return SCHOOL_PERIODS.filter(s =>
    s.name.toLowerCase().includes(lowerQuery) ||
    s.tradition.toLowerCase().includes(lowerQuery) ||
    s.province.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get timeline data for visualization
 * Returns schools sorted by start year
 */
export function getTimelineData() {
  return [...SCHOOL_PERIODS].sort((a, b) => a.startYear - b.startYear);
}

/**
 * Get all school names for autocomplete
 */
export function getAllSchoolNames() {
  return SCHOOL_PERIODS.map(s => s.name).sort();
}

export default SCHOOL_PERIODS;
