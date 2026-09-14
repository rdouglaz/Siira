import type { WordEntry } from "./word-inventory";

// ─── Rule-based number inventories (real content, generated from language rules) ──

const ZH_DIGIT_CHARS = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
const ZH_DIGIT_PINYIN = ["líng", "yī", "èr", "sān", "sì", "wǔ", "liù", "qī", "bā", "jiǔ"];

const EN_ONES = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const EN_TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function enNumberName(n: number): string {
  if (n < 20) return EN_ONES[n];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const o = n % 10;
    return o === 0 ? EN_TENS[t] : `${EN_TENS[t]}-${EN_ONES[o].toLowerCase()}`;
  }
  if (n === 1000) return "One thousand";
  const h = Math.floor(n / 100);
  return `${EN_ONES[h]} hundred`;
}

function zhNumber(n: number): { target: string; romanization: string } {
  if (n <= 10) {
    return {
      target: n === 10 ? "十" : ZH_DIGIT_CHARS[n],
      romanization: n === 10 ? "shí" : ZH_DIGIT_PINYIN[n],
    };
  }
  if (n < 20) {
    return { target: `十${ZH_DIGIT_CHARS[n - 10]}`, romanization: `shí ${ZH_DIGIT_PINYIN[n - 10]}` };
  }
  if (n < 100) {
    const t = Math.floor(n / 10);
    const o = n % 10;
    const tens = `${ZH_DIGIT_CHARS[t]}十`;
    const tensPy = `${ZH_DIGIT_PINYIN[t]} shí`;
    if (o === 0) return { target: tens, romanization: tensPy };
    return { target: `${tens}${ZH_DIGIT_CHARS[o]}`, romanization: `${tensPy} ${ZH_DIGIT_PINYIN[o]}` };
  }
  if (n === 1000) return { target: "一千", romanization: "yī qiān" };
  const h = Math.floor(n / 100);
  return { target: `${ZH_DIGIT_CHARS[h]}百`, romanization: `${ZH_DIGIT_PINYIN[h]} bǎi` };
}

const ZH_NUMBER_EXAMPLES: Record<number, { example: string; exampleRomanization: string; exampleMeaning: string }> = {
  0: { example: "零度", exampleRomanization: "líng dù", exampleMeaning: "Zero degrees" },
  1: { example: "一个", exampleRomanization: "yī gè", exampleMeaning: "One (with measure word)" },
  2: { example: "两个", exampleRomanization: "liǎng gè", exampleMeaning: "Two (for counting)" },
  10: { example: "十二", exampleRomanization: "shí èr", exampleMeaning: "Twelve" },
};

export const chineseNumbers: WordEntry[] = (() => {
  const entries: WordEntry[] = [];
  const push = (n: number) => {
    const { target, romanization } = zhNumber(n);
    const ex = ZH_NUMBER_EXAMPLES[n];
    entries.push({
      id: `zh-num-${n}`,
      language: "zh",
      category: "numbers",
      target,
      romanization,
      meaning: enNumberName(n),
      difficulty: n >= 100 || n > 30 ? "intermediate" : "beginner",
      partOfSpeech: "number",
      ...(ex ?? {}),
    });
  };
  for (let n = 0; n <= 100; n++) push(n);
  for (let h = 200; h <= 900; h += 100) push(h);
  push(1000);
  return entries;
})();

// ─── German ────────────────────────────────────────────────────────────────────

const DE_UNITS = ["null", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun"];
const DE_UNIT_IPA = ["[nʊl]", "[aɪns]", "[tsvaɪ]", "[dʁaɪ]", "[fiːɐ]", "[fʏnf]", "[zɛks]", "[ˈziːbn̩]", "[axt]", "[nɔʏn]"];
const DE_TEENS = ["zehn", "elf", "zwölf", "dreizehn", "vierzehn", "fünfzehn", "sechzehn", "siebzehn", "achtzehn", "neunzehn"];
const DE_TEEN_IPA = ["[tseːn]", "[ɛlf]", "[tsvœlf]", "[ˈdʁaɪtseːn]", "[ˈfɪɐtseːn]", "[ˈfʏnftseːn]", "[ˈzɛçtseːn]", "[ˈziːptseːn]", "[ˈaxtseːn]", "[ˈnɔʏntseːn]"];
const DE_TENS = ["", "", "zwanzig", "dreißig", "vierzig", "fünfzig", "sechzig", "siebzig", "achtzig", "neunzig"];
const DE_TEN_IPA = ["", "", "[ˈtsvantsɪç]", "[ˈdʁaɪsɪç]", "[ˈfiːɐtsɪç]", "[ˈfʏnftsɪç]", "[ˈzɛçtsɪç]", "[ˈziːptsɪç]", "[ˈaxtsɪç]", "[ˈnɔʏntsɪç]"];
// Compound glue: unit stem + "und" + ten stem (e.g. einundzwanzig)
const DE_COMPOUND_STEM = ["", "aɪn", "tsvaɪ", "dʁaɪ", "fiːɐ", "fʏnf", "zɛks", "ziːb", "axt", "nɔʏn"];
const DE_COMPOUND_UNIT = ["", "ein", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun"];
const DE_TEN_BASE = ["", "", "tsvantsɪç", "dʁaɪsɪç", "fɪɐtsɪç", "fʏnftsɪç", "zɛçtsɪç", "ziːptsɪç", "axtsɪç", "nɔʏntsɪç"];
const DE_HUNDRED_STEM = ["", "aɪn", "tsvaɪ", "dʁaɪ", "fiːɐ", "fʏnf", "zɛks", "ziːbn̩", "axt", "nɔʏn"];
const DE_HUNDRED_UNIT = ["", "ein", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun"];

function deNumber(n: number): { target: string; romanization: string } {
  if (n <= 9) return { target: DE_UNITS[n], romanization: DE_UNIT_IPA[n] };
  if (n <= 19) return { target: DE_TEENS[n - 10], romanization: DE_TEEN_IPA[n - 10] };
  if (n < 100) {
    const t = Math.floor(n / 10);
    const o = n % 10;
    if (o === 0) return { target: DE_TENS[t], romanization: DE_TEN_IPA[t] };
    return {
      target: `${DE_COMPOUND_UNIT[o]}und${DE_TENS[t]}`,
      romanization: `[${DE_COMPOUND_STEM[o]}ʊntˈ${DE_TEN_BASE[t]}]`,
    };
  }
  if (n === 1000) return { target: "eintausend", romanization: "[ˈaɪntaʊznt]" };
  const h = Math.floor(n / 100);
  return {
    target: `${DE_HUNDRED_UNIT[h]}hundert`,
    romanization: `[ˈ${DE_HUNDRED_STEM[h]}hʊndɐt]`,
  };
}

export const germanNumbers: WordEntry[] = (() => {
  const entries: WordEntry[] = [];
  const push = (n: number) => {
    const { target, romanization } = deNumber(n);
    entries.push({
      id: `de-num-${n}`,
      language: "de",
      category: "numbers",
      target,
      romanization,
      meaning: enNumberName(n),
      difficulty: n >= 100 || n > 30 ? "intermediate" : "beginner",
      partOfSpeech: "number",
      ...(n === 1
        ? { example: "eins, zwei, drei", exampleMeaning: "One, two, three" }
        : {}),
    });
  };
  for (let n = 0; n <= 100; n++) push(n);
  for (let h = 200; h <= 900; h += 100) push(h);
  push(1000);
  return entries;
})();
