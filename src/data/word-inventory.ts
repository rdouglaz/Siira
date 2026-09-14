export type Language = "zh" | "de";

export type Difficulty = "beginner" | "intermediate" | "advanced";

import { chineseNumbers, germanNumbers } from "./numbers";
export interface WordEntry {
  id: string;
  language: Language;
  category: string;
  target: string;           // Chinese characters / German word
  romanization: string;     // Pinyin with tone marks for Chinese, pronunciation guide for German
  meaning: string;          // English meaning
  example?: string;         // Optional example sentence
  exampleRomanization?: string; // Romanization of example
  exampleMeaning?: string;  // English meaning of example
  difficulty: Difficulty;
  partOfSpeech?: string;    // noun, verb, adjective, etc.
}

// ============================================
// CHINESE WORD INVENTORY
// ============================================

const chineseInventory: WordEntry[] = [
  // --- PINYIN / ALPHABET BASICS ---
  { id: "zh-pinyin-a", language: "zh", category: "pinyin-basics", target: "a", romanization: "ā á ǎ à", meaning: "Vowel 'a' with four tones", difficulty: "beginner", partOfSpeech: "vowel" },
  { id: "zh-pinyin-o", language: "zh", category: "pinyin-basics", target: "o", romanization: "ō ó ǒ ò", meaning: "Vowel 'o' with four tones", difficulty: "beginner", partOfSpeech: "vowel" },
  { id: "zh-pinyin-e", language: "zh", category: "pinyin-basics", target: "e", romanization: "ē é ě è", meaning: "Vowel 'e' with four tones", difficulty: "beginner", partOfSpeech: "vowel" },
  { id: "zh-pinyin-i", language: "zh", category: "pinyin-basics", target: "i", romanization: "ī í ǐ ì", meaning: "Vowel 'i' with four tones", difficulty: "beginner", partOfSpeech: "vowel" },
  { id: "zh-pinyin-u", language: "zh", category: "pinyin-basics", target: "u", romanization: "ū ú ǔ ù", meaning: "Vowel 'u' with four tones", difficulty: "beginner", partOfSpeech: "vowel" },
  { id: "zh-pinyin-ü", language: "zh", category: "pinyin-basics", target: "ü", romanization: "ǖ ǘ ǚ ǜ", meaning: "Vowel 'ü' with four tones", difficulty: "beginner", partOfSpeech: "vowel" },
  { id: "zh-pinyin-b", language: "zh", category: "pinyin-basics", target: "b", romanization: "b", meaning: "Initial 'b' (unaspirated p)", difficulty: "beginner", partOfSpeech: "consonant" },
  { id: "zh-pinyin-p", language: "zh", category: "pinyin-basics", target: "p", romanization: "p", meaning: "Initial 'p' (aspirated)", difficulty: "beginner", partOfSpeech: "consonant" },
  { id: "zh-pinyin-m", language: "zh", category: "pinyin-basics", target: "m", romanization: "m", meaning: "Initial 'm'", difficulty: "beginner", partOfSpeech: "consonant" },
  { id: "zh-pinyin-f", language: "zh", category: "pinyin-basics", target: "f", romanization: "f", meaning: "Initial 'f'", difficulty: "beginner", partOfSpeech: "consonant" },
  { id: "zh-pinyin-d", language: "zh", category: "pinyin-basics", target: "d", romanization: "d", meaning: "Initial 'd' (unaspirated t)", difficulty: "beginner", partOfSpeech: "consonant" },
  { id: "zh-pinyin-t", language: "zh", category: "pinyin-basics", target: "t", romanization: "t", meaning: "Initial 't' (aspirated)", difficulty: "beginner", partOfSpeech: "consonant" },
  { id: "zh-pinyin-n", language: "zh", category: "pinyin-basics", target: "n", romanization: "n", meaning: "Initial 'n'", difficulty: "beginner", partOfSpeech: "consonant" },
  { id: "zh-pinyin-l", language: "zh", category: "pinyin-basics", target: "l", romanization: "l", meaning: "Initial 'l'", difficulty: "beginner", partOfSpeech: "consonant" },
  { id: "zh-pinyin-g", language: "zh", category: "pinyin-basics", target: "g", romanization: "g", meaning: "Initial 'g' (unaspirated k)", difficulty: "beginner", partOfSpeech: "consonant" },
  { id: "zh-pinyin-k", language: "zh", category: "pinyin-basics", target: "k", romanization: "k", meaning: "Initial 'k' (aspirated)", difficulty: "beginner", partOfSpeech: "consonant" },
  { id: "zh-pinyin-h", language: "zh", category: "pinyin-basics", target: "h", romanization: "h", meaning: "Initial 'h'", difficulty: "beginner", partOfSpeech: "consonant" },
  { id: "zh-pinyin-j", language: "zh", category: "pinyin-basics", target: "j", romanization: "j", meaning: "Initial 'j' (like 'jeep')", difficulty: "beginner", partOfSpeech: "consonant" },
  { id: "zh-pinyin-q", language: "zh", category: "pinyin-basics", target: "q", romanization: "q", meaning: "Initial 'q' (like 'cheap')", difficulty: "beginner", partOfSpeech: "consonant" },
  { id: "zh-pinyin-x", language: "zh", category: "pinyin-basics", target: "x", romanization: "x", meaning: "Initial 'x' (like 'she')", difficulty: "beginner", partOfSpeech: "consonant" },
  { id: "zh-pinyin-zh", language: "zh", category: "pinyin-basics", target: "zh", romanization: "zh", meaning: "Initial 'zh' (retroflex)", difficulty: "beginner", partOfSpeech: "consonant" },
  { id: "zh-pinyin-ch", language: "zh", category: "pinyin-basics", target: "ch", romanization: "ch", meaning: "Initial 'ch' (retroflex aspirated)", difficulty: "beginner", partOfSpeech: "consonant" },
  { id: "zh-pinyin-sh", language: "zh", category: "pinyin-basics", target: "sh", romanization: "sh", meaning: "Initial 'sh' (retroflex)", difficulty: "beginner", partOfSpeech: "consonant" },
  { id: "zh-pinyin-r", language: "zh", category: "pinyin-basics", target: "r", romanization: "r", meaning: "Initial 'r' (retroflex)", difficulty: "beginner", partOfSpeech: "consonant" },
  { id: "zh-pinyin-z", language: "zh", category: "pinyin-basics", target: "z", romanization: "z", meaning: "Initial 'z' (like 'pizza')", difficulty: "beginner", partOfSpeech: "consonant" },
  { id: "zh-pinyin-c", language: "zh", category: "pinyin-basics", target: "c", romanization: "c", meaning: "Initial 'c' (like 'cats')", difficulty: "beginner", partOfSpeech: "consonant" },
  { id: "zh-pinyin-s", language: "zh", category: "pinyin-basics", target: "s", romanization: "s", meaning: "Initial 's'", difficulty: "beginner", partOfSpeech: "consonant" },

  // --- NUMBERS (full 0–100, hundreds, 1000 — see numbers.ts) ---
  ...chineseNumbers,

  // --- COMMON 1-2 CHARACTER WORDS ---
  { id: "zh-word-you", language: "zh", category: "common-words", target: "你", romanization: "nǐ", meaning: "You", difficulty: "beginner", partOfSpeech: "pronoun", example: "你好吗？", exampleRomanization: "nǐ hǎo ma?", exampleMeaning: "How are you?" },
  { id: "zh-word-me", language: "zh", category: "common-words", target: "我", romanization: "wǒ", meaning: "I / Me", difficulty: "beginner", partOfSpeech: "pronoun", example: "我很好", exampleRomanization: "wǒ hěn hǎo", exampleMeaning: "I'm fine" },
  { id: "zh-word-good", language: "zh", category: "common-words", target: "好", romanization: "hǎo", meaning: "Good", difficulty: "beginner", partOfSpeech: "adjective", example: "很好", exampleRomanization: "hěn hǎo", exampleMeaning: "Very good" },
  { id: "zh-word-bad", language: "zh", category: "common-words", target: "坏", romanization: "huài", meaning: "Bad", difficulty: "beginner", partOfSpeech: "adjective" },
  { id: "zh-word-big", language: "zh", category: "common-words", target: "大", romanization: "dà", meaning: "Big", difficulty: "beginner", partOfSpeech: "adjective", example: "大象", exampleRomanization: "dà xiàng", exampleMeaning: "Elephant" },
  { id: "zh-word-small", language: "zh", category: "common-words", target: "小", romanization: "xiǎo", meaning: "Small", difficulty: "beginner", partOfSpeech: "adjective", example: "小鸟", exampleRomanization: "xiǎo niǎo", exampleMeaning: "Small bird" },
  { id: "zh-word-eat", language: "zh", category: "common-words", target: "吃", romanization: "chī", meaning: "Eat", difficulty: "beginner", partOfSpeech: "verb", example: "吃饭", exampleRomanization: "chī fàn", exampleMeaning: "Eat rice/meal" },
  { id: "zh-word-drink", language: "zh", category: "common-words", target: "喝", romanization: "hē", meaning: "Drink", difficulty: "beginner", partOfSpeech: "verb", example: "喝水", exampleRomanization: "hē shuǐ", exampleMeaning: "Drink water" },
  { id: "zh-word-go", language: "zh", category: "common-words", target: "去", romanization: "qù", meaning: "Go", difficulty: "beginner", partOfSpeech: "verb", example: "去学校", exampleRomanization: "qù xué xiào", exampleMeaning: "Go to school" },
  { id: "zh-word-come", language: "zh", category: "common-words", target: "来", romanization: "lái", meaning: "Come", difficulty: "beginner", partOfSpeech: "verb", example: "来这儿", exampleRomanization: "lái zhèr", exampleMeaning: "Come here" },
  { id: "zh-word-want", language: "zh", category: "common-words", target: "要", romanization: "yào", meaning: "Want / Need", difficulty: "beginner", partOfSpeech: "verb", example: "我要水", exampleRomanization: "wǒ yào shuǐ", exampleMeaning: "I want water" },
  { id: "zh-word-have", language: "zh", category: "common-words", target: "有", romanization: "yǒu", meaning: "Have / There is", difficulty: "beginner", partOfSpeech: "verb", example: "有没有？", exampleRomanization: "yǒu méi yǒu?", exampleMeaning: "Do you have it?" },
  { id: "zh-word-not-have", language: "zh", category: "common-words", target: "没有", romanization: "méi yǒu", meaning: "Don't have / There isn't", difficulty: "beginner", partOfSpeech: "verb" },
  { id: "zh-word-know", language: "zh", category: "common-words", target: "知道", romanization: "zhī dào", meaning: "Know", difficulty: "beginner", partOfSpeech: "verb", example: "我知道", exampleRomanization: "wǒ zhī dào", exampleMeaning: "I know" },
  { id: "zh-word-understand", language: "zh", category: "common-words", target: "明白", romanization: "míng bai", meaning: "Understand", difficulty: "beginner", partOfSpeech: "verb", example: "我明白", exampleRomanization: "wǒ míng bai", exampleMeaning: "I understand" },
  { id: "zh-word-like", language: "zh", category: "common-words", target: "喜欢", romanization: "xǐ huān", meaning: "Like", difficulty: "beginner", partOfSpeech: "verb", example: "我喜欢", exampleRomanization: "wǒ xǐ huān", exampleMeaning: "I like it" },
  { id: "zh-word-love", language: "zh", category: "common-words", target: "爱", romanization: "ài", meaning: "Love", difficulty: "beginner", partOfSpeech: "verb", example: "我爱你", exampleRomanization: "wǒ ài nǐ", exampleMeaning: "I love you" },
  { id: "zh-word-thank", language: "zh", category: "common-words", target: "谢谢", romanization: "xiè xie", meaning: "Thank you", difficulty: "beginner", partOfSpeech: "phrase", example: "谢谢你", exampleRomanization: "xiè xie nǐ", exampleMeaning: "Thank you" },
  { id: "zh-word-sorry", language: "zh", category: "common-words", target: "对不起", romanization: "duì bu qǐ", meaning: "Sorry", difficulty: "beginner", partOfSpeech: "phrase" },
  { id: "zh-word-excuse", language: "zh", category: "common-words", target: "没关系", romanization: "méi guān xi", meaning: "It's okay / No problem", difficulty: "beginner", partOfSpeech: "phrase" },
  { id: "zh-word-yes", language: "zh", category: "common-words", target: "是", romanization: "shì", meaning: "Yes / Is / Am / Are", difficulty: "beginner", partOfSpeech: "verb", example: "是的", exampleRomanization: "shì de", exampleMeaning: "Yes" },
  { id: "zh-word-no", language: "zh", category: "common-words", target: "不", romanization: "bù", meaning: "No / Not", difficulty: "beginner", partOfSpeech: "adverb", example: "不是", exampleRomanization: "bù shì", exampleMeaning: "No / Not correct" },
  { id: "zh-word-right", language: "zh", category: "common-words", target: "对", romanization: "duì", meaning: "Right / Correct", difficulty: "beginner", partOfSpeech: "adjective" },
  { id: "zh-word-wrong", language: "zh", category: "common-words", target: "错", romanization: "cuò", meaning: "Wrong", difficulty: "beginner", partOfSpeech: "adjective" },
  { id: "zh-word-now", language: "zh", category: "common-words", target: "现在", romanization: "xiàn zài", meaning: "Now", difficulty: "beginner", partOfSpeech: "noun", example: "现在几点？", exampleRomanization: "xiàn zài jǐ diǎn?", exampleMeaning: "What time is it now?" },
  { id: "zh-word-today", language: "zh", category: "common-words", target: "今天", romanization: "jīn tiān", meaning: "Today", difficulty: "beginner", partOfSpeech: "noun" },
  { id: "zh-word-tomorrow", language: "zh", category: "common-words", target: "明天", romanization: "míng tiān", meaning: "Tomorrow", difficulty: "beginner", partOfSpeech: "noun" },
  { id: "zh-word-yesterday", language: "zh", category: "common-words", target: "昨天", romanization: "zuó tiān", meaning: "Yesterday", difficulty: "beginner", partOfSpeech: "noun" },
  { id: "zh-word-morning", language: "zh", category: "common-words", target: "早上", romanization: "zǎo shang", meaning: "Morning", difficulty: "beginner", partOfSpeech: "noun", example: "早上好", exampleRomanization: "zǎo shang hǎo", exampleMeaning: "Good morning" },
  { id: "zh-word-evening", language: "zh", category: "common-words", target: "晚上", romanization: "wǎn shang", meaning: "Evening", difficulty: "beginner", partOfSpeech: "noun", example: "晚上好", exampleRomanization: "wǎn shang hǎo", exampleMeaning: "Good evening" },
  { id: "zh-word-water", language: "zh", category: "common-words", target: "水", romanization: "shuǐ", meaning: "Water", difficulty: "beginner", partOfSpeech: "noun", example: "喝水", exampleRomanization: "hē shuǐ", exampleMeaning: "Drink water" },
  { id: "zh-word-rice", language: "zh", category: "common-words", target: "饭", romanization: "fàn", meaning: "Rice / Meal", difficulty: "beginner", partOfSpeech: "noun", example: "吃饭", exampleRomanization: "chī fàn", exampleMeaning: "Eat a meal" },
  { id: "zh-word-bread", language: "zh", category: "common-words", target: "面包", romanization: "miàn bāo", meaning: "Bread", difficulty: "beginner", partOfSpeech: "noun" },
  { id: "zh-word-tea", language: "zh", category: "common-words", target: "茶", romanization: "chá", meaning: "Tea", difficulty: "beginner", partOfSpeech: "noun", example: "喝茶", exampleRomanization: "hē chá", exampleMeaning: "Drink tea" },
  { id: "zh-word-coffee", language: "zh", category: "common-words", target: "咖啡", romanization: "kā fēi", meaning: "Coffee", difficulty: "beginner", partOfSpeech: "noun" },
  { id: "zh-word-milk", language: "zh", category: "common-words", target: "牛奶", romanization: "niú nǎi", meaning: "Milk", difficulty: "beginner", partOfSpeech: "noun" },
  { id: "zh-word-fruit", language: "zh", category: "common-words", target: "水果", romanization: "shuǐ guǒ", meaning: "Fruit", difficulty: "beginner", partOfSpeech: "noun" },
  { id: "zh-word-apple", language: "zh", category: "common-words", target: "苹果", romanization: "píng guǒ", meaning: "Apple", difficulty: "beginner", partOfSpeech: "noun" },
  { id: "zh-word-banana", language: "zh", category: "common-words", target: "香蕉", romanization: "xiāng jiāo", meaning: "Banana", difficulty: "beginner", partOfSpeech: "noun" },
  { id: "zh-word-school", language: "zh", category: "common-words", target: "学校", romanization: "xué xiào", meaning: "School", difficulty: "beginner", partOfSpeech: "noun" },
  { id: "zh-word-teacher", language: "zh", category: "common-words", target: "老师", romanization: "lǎo shī", meaning: "Teacher", difficulty: "beginner", partOfSpeech: "noun" },
  { id: "zh-word-student", language: "zh", category: "common-words", target: "学生", romanization: "xué shēng", meaning: "Student", difficulty: "beginner", partOfSpeech: "noun" },
  { id: "zh-word-friend", language: "zh", category: "common-words", target: "朋友", romanization: "péng you", meaning: "Friend", difficulty: "beginner", partOfSpeech: "noun" },
  { id: "zh-word-family", language: "zh", category: "common-words", target: "家", romanization: "jiā", meaning: "Home / Family", difficulty: "beginner", partOfSpeech: "noun", example: "回家", exampleRomanization: "huí jiā", exampleMeaning: "Go home" },
  { id: "zh-word-dad", language: "zh", category: "common-words", target: "爸爸", romanization: "bà ba", meaning: "Dad", difficulty: "beginner", partOfSpeech: "noun" },
  { id: "zh-word-mom", language: "zh", category: "common-words", target: "妈妈", romanization: "mā ma", meaning: "Mom", difficulty: "beginner", partOfSpeech: "noun" },
  { id: "zh-word-name", language: "zh", category: "common-words", target: "名字", romanization: "míng zi", meaning: "Name", difficulty: "beginner", partOfSpeech: "noun", example: "你叫什么名字？", exampleRomanization: "nǐ jiào shén me míng zi?", exampleMeaning: "What's your name?" },
  { id: "zh-word-time", language: "zh", category: "common-words", target: "时间", romanization: "shí jiān", meaning: "Time", difficulty: "beginner", partOfSpeech: "noun" },
  { id: "zh-word-money", language: "zh", category: "common-words", target: "钱", romanization: "qián", meaning: "Money", difficulty: "beginner", partOfSpeech: "noun" },
  { id: "zh-word-expensive", language: "zh", category: "common-words", target: "贵", romanization: "guì", meaning: "Expensive", difficulty: "beginner", partOfSpeech: "adjective" },
  { id: "zh-word-cheap", language: "zh", category: "common-words", target: "便宜", romanization: "pián yi", meaning: "Cheap", difficulty: "beginner", partOfSpeech: "adjective" },
  { id: "zh-word-how-much", language: "zh", category: "common-words", target: "多少钱", romanization: "duō shao qián", meaning: "How much?", difficulty: "beginner", partOfSpeech: "phrase" },

  // --- COMMON 3-CHARACTER WORDS / SHORT PHRASES ---
  { id: "zh-phrase-hello", language: "zh", category: "phrases", target: "你好", romanization: "nǐ hǎo", meaning: "Hello", difficulty: "beginner", partOfSpeech: "greeting" },
  { id: "zh-phrase-goodbye", language: "zh", category: "phrases", target: "再见", romanization: "zài jiàn", meaning: "Goodbye", difficulty: "beginner", partOfSpeech: "greeting" },
  { id: "zh-phrase-good-morning", language: "zh", category: "phrases", target: "早上好", romanization: "zǎo shang hǎo", meaning: "Good morning", difficulty: "beginner", partOfSpeech: "greeting" },
  { id: "zh-phrase-good-night", language: "zh", category: "phrases", target: "晚安", romanization: "wǎn ān", meaning: "Good night", difficulty: "beginner", partOfSpeech: "greeting" },
  { id: "zh-phrase-how-are-you", language: "zh", category: "phrases", target: "你好吗？", romanization: "nǐ hǎo ma?", meaning: "How are you?", difficulty: "beginner" },
  { id: "zh-phrase-im-fine", language: "zh", category: "phrases", target: "我很好", romanization: "wǒ hěn hǎo", meaning: "I'm fine", difficulty: "beginner" },
  { id: "zh-phrase-thanks", language: "zh", category: "phrases", target: "谢谢你", romanization: "xiè xie nǐ", meaning: "Thank you", difficulty: "beginner" },
  { id: "zh-phrase-welcome", language: "zh", category: "phrases", target: "不客气", romanization: "bú kè qì", meaning: "You're welcome", difficulty: "beginner" },
  { id: "zh-phrase-sorry", language: "zh", category: "phrases", target: "对不起", romanization: "duì bu qǐ", meaning: "Sorry", difficulty: "beginner" },
  { id: "zh-phrase-excuse-me", language: "zh", category: "phrases", target: "请问", romanization: "qǐng wèn", meaning: "Excuse me / May I ask", difficulty: "beginner" },
  { id: "zh-phrase-dont-understand", language: "zh", category: "phrases", target: "我不明白", romanization: "wǒ bù míng bai", meaning: "I don't understand", difficulty: "beginner" },
  { id: "zh-phrase-repeat", language: "zh", category: "phrases", target: "请再说一遍", romanization: "qǐng zài shuō yī biàn", meaning: "Please say it again", difficulty: "beginner" },
  { id: "zh-phrase-slower", language: "zh", category: "phrases", target: "请说慢一点", romanization: "qǐng shuō màn yī diǎn", meaning: "Please speak slower", difficulty: "intermediate" },
  { id: "zh-phrase-what", language: "zh", category: "phrases", target: "这是什么？", romanization: "zhè shì shén me?", meaning: "What is this?", difficulty: "beginner" },
  { id: "zh-phrase-where", language: "zh", category: "phrases", target: "在哪里？", romanization: "zài nǎ lǐ?", meaning: "Where is it?", difficulty: "beginner" },
  { id: "zh-phrase-bathroom", language: "zh", category: "phrases", target: "厕所在哪里？", romanization: "cè suǒ zài nǎ lǐ?", meaning: "Where is the bathroom?", difficulty: "beginner" },
  { id: "zh-phrase-help", language: "zh", category: "phrases", target: "帮帮我", romanization: "bāng bāng wǒ", meaning: "Help me", difficulty: "beginner" },
  { id: "zh-phrase-yes", language: "zh", category: "phrases", target: "是的", romanization: "shì de", meaning: "Yes", difficulty: "beginner" },
  { id: "zh-phrase-no", language: "zh", category: "phrases", target: "不是", romanization: "bù shì", meaning: "No", difficulty: "beginner" },
  { id: "zh-phrase-ok", language: "zh", category: "phrases", target: "好的", romanization: "hǎo de", meaning: "OK / Alright", difficulty: "beginner" },
  { id: "zh-phrase-problem", language: "zh", category: "phrases", target: "没问题", romanization: "méi wèn tí", meaning: "No problem", difficulty: "beginner" },
  { id: "zh-phrase-wait", language: "zh", category: "phrases", target: "等一下", romanization: "děng yī xià", meaning: "Wait a moment", difficulty: "beginner" },
  { id: "zh-phrase-i-want", language: "zh", category: "phrases", target: "我要这个", romanization: "wǒ yào zhè ge", meaning: "I want this", difficulty: "beginner" },
  { id: "zh-phrase-how-much", language: "zh", category: "phrases", target: "多少钱？", romanization: "duō shǎo qián?", meaning: "How much?", difficulty: "beginner" },
  { id: "zh-phrase-too-expensive", language: "zh", category: "phrases", target: "太贵了", romanization: "tài guì le", meaning: "Too expensive", difficulty: "beginner" },
  { id: "zh-phrase-cheaper", language: "zh", category: "phrases", target: "能便宜点吗？", romanization: "néng pián yi diǎn ma?", meaning: "Can it be cheaper?", difficulty: "intermediate" },
  { id: "zh-phrase-delicious", language: "zh", category: "phrases", target: "很好吃", romanization: "hěn hǎo chī", meaning: "Delicious", difficulty: "beginner" },
  { id: "zh-phrase-check-please", language: "zh", category: "phrases", target: "买单", romanization: "mǎi dān", meaning: "Check / Bill please", difficulty: "beginner" },

  // --- SELF-INTRODUCTION & EVERYDAY SITUATIONS ---
  { id: "zh-phrase-intro-name", language: "zh", category: "phrases", target: "我叫……", romanization: "wǒ jiào...", meaning: "My name is...", difficulty: "beginner" },
  { id: "zh-phrase-intro-from", language: "zh", category: "phrases", target: "我来自……", romanization: "wǒ lái zì...", meaning: "I'm from...", difficulty: "beginner" },
  { id: "zh-phrase-intro-age", language: "zh", category: "phrases", target: "我今年二十五岁", romanization: "wǒ jīn nián èr shí wǔ suì", meaning: "I'm 25 years old", difficulty: "beginner" },
  { id: "zh-phrase-intro-student", language: "zh", category: "phrases", target: "我是学生", romanization: "wǒ shì xué shēng", meaning: "I'm a student", difficulty: "beginner" },
  { id: "zh-phrase-intro-learning", language: "zh", category: "phrases", target: "我在学中文", romanization: "wǒ zài xué Zhōng wén", meaning: "I'm learning Chinese", difficulty: "beginner" },
  { id: "zh-phrase-intro-live", language: "zh", category: "phrases", target: "我住在北京", romanization: "wǒ zhù zài Běi jīng", meaning: "I live in Beijing", difficulty: "beginner" },
  { id: "zh-phrase-intro-nice", language: "zh", category: "phrases", target: "很高兴认识你", romanization: "hěn gāo xìng rèn shi nǐ", meaning: "Nice to meet you", difficulty: "beginner" },
  { id: "zh-phrase-intro-where-from", language: "zh", category: "phrases", target: "你是哪里人？", romanization: "nǐ shì nǎ lǐ rén?", meaning: "Where are you from?", difficulty: "beginner" },
  { id: "zh-phrase-intro-like", language: "zh", category: "phrases", target: "我喜欢喝茶", romanization: "wǒ xǐ huan hē chá", meaning: "I like drinking tea", difficulty: "beginner" },
  { id: "zh-phrase-intro-job", language: "zh", category: "phrases", target: "我是老师", romanization: "wǒ shì lǎo shī", meaning: "I'm a teacher", difficulty: "beginner" },
  { id: "zh-phrase-intro-phone", language: "zh", category: "phrases", target: "我的电话号码是……", romanization: "wǒ de diàn huà hào mǎ shì...", meaning: "My phone number is...", difficulty: "intermediate" },
  { id: "zh-phrase-daily-weather", language: "zh", category: "phrases", target: "今天天气很好", romanization: "jīn tiān tiān qì hěn hǎo", meaning: "The weather is nice today", difficulty: "beginner" },
  { id: "zh-phrase-daily-eaten", language: "zh", category: "phrases", target: "你吃了吗？", romanization: "nǐ chī le ma?", meaning: "Have you eaten? (friendly greeting)", difficulty: "intermediate" },
  { id: "zh-phrase-daily-together", language: "zh", category: "phrases", target: "我们一起去吧", romanization: "wǒ men yì qǐ qù ba", meaning: "Let's go together", difficulty: "intermediate" },
  { id: "zh-phrase-daily-tomorrow", language: "zh", category: "phrases", target: "明天见", romanization: "míng tiān jiàn", meaning: "See you tomorrow", difficulty: "beginner" },
  { id: "zh-phrase-daily-careful", language: "zh", category: "phrases", target: "路上小心", romanization: "lù shang xiǎo xīn", meaning: "Take care on the way", difficulty: "intermediate" },

  // --- COMMON VERBS (additional) ---
  { id: "zh-verb-sleep", language: "zh", category: "common-words", target: "睡觉", romanization: "shuì jiào", meaning: "Sleep", difficulty: "beginner", partOfSpeech: "verb" },
  { id: "zh-verb-wake", language: "zh", category: "common-words", target: "起床", romanization: "qǐ chuáng", meaning: "Wake up / Get up", difficulty: "beginner", partOfSpeech: "verb" },
  { id: "zh-verb-read", language: "zh", category: "common-words", target: "看", romanization: "kàn", meaning: "Read / Watch / Look", difficulty: "beginner", partOfSpeech: "verb", example: "看书", exampleRomanization: "kàn shū", exampleMeaning: "Read a book" },
  { id: "zh-verb-write", language: "zh", category: "common-words", target: "写", romanization: "xiě", meaning: "Write", difficulty: "beginner", partOfSpeech: "verb" },
  { id: "zh-verb-speak", language: "zh", category: "common-words", target: "说", romanization: "shuō", meaning: "Speak", difficulty: "beginner", partOfSpeech: "verb", example: "说中文", exampleRomanization: "shuō zhōng wén", exampleMeaning: "Speak Chinese" },
  { id: "zh-verb-listen", language: "zh", category: "common-words", target: "听", romanization: "tīng", meaning: "Listen", difficulty: "beginner", partOfSpeech: "verb", example: "听音乐", exampleRomanization: "tīng yīn yuè", exampleMeaning: "Listen to music" },
  { id: "zh-verb-learn", language: "zh", category: "common-words", target: "学", romanization: "xué", meaning: "Learn / Study", difficulty: "beginner", partOfSpeech: "verb", example: "学习", exampleRomanization: "xué xí", exampleMeaning: "Study" },
  { id: "zh-verb-work", language: "zh", category: "common-words", target: "工作", romanization: "gōng zuò", meaning: "Work", difficulty: "intermediate", partOfSpeech: "verb/noun" },
  { id: "zh-verb-play", language: "zh", category: "common-words", target: "玩", romanization: "wán", meaning: "Play / Have fun", difficulty: "beginner", partOfSpeech: "verb" },
  { id: "zh-verb-buy", language: "zh", category: "common-words", target: "买", romanization: "mǎi", meaning: "Buy", difficulty: "beginner", partOfSpeech: "verb", example: "买菜", exampleRomanization: "mǎi cài", exampleMeaning: "Buy vegetables" },
  { id: "zh-verb-sell", language: "zh", category: "common-words", target: "卖", romanization: "mài", meaning: "Sell", difficulty: "intermediate", partOfSpeech: "verb" },

  // --- ADJECTIVES ---
  { id: "zh-adj-hot", language: "zh", category: "common-words", target: "热", romanization: "rè", meaning: "Hot", difficulty: "beginner", partOfSpeech: "adjective" },
  { id: "zh-adj-cold", language: "zh", category: "common-words", target: "冷", romanization: "lěng", meaning: "Cold", difficulty: "beginner", partOfSpeech: "adjective" },
  { id: "zh-adj-happy", language: "zh", category: "common-words", target: "开心", romanization: "kāi xīn", meaning: "Happy", difficulty: "beginner", partOfSpeech: "adjective" },
  { id: "zh-adj-sad", language: "zh", category: "common-words", target: "难过", romanization: "nán guò", meaning: "Sad", difficulty: "beginner", partOfSpeech: "adjective" },
  { id: "zh-adj-tired", language: "zh", category: "common-words", target: "累", romanization: "lèi", meaning: "Tired", difficulty: "beginner", partOfSpeech: "adjective" },
  { id: "zh-adj-busy", language: "zh", category: "common-words", target: "忙", romanization: "máng", meaning: "Busy", difficulty: "beginner", partOfSpeech: "adjective" },
  { id: "zh-adj-easy", language: "zh", category: "common-words", target: "容易", romanization: "róng yì", meaning: "Easy", difficulty: "beginner", partOfSpeech: "adjective" },
  { id: "zh-adj-hard", language: "zh", category: "common-words", target: "难", romanization: "nán", meaning: "Difficult / Hard", difficulty: "beginner", partOfSpeech: "adjective" },
  { id: "zh-adj-new", language: "zh", category: "common-words", target: "新", romanization: "xīn", meaning: "New", difficulty: "beginner", partOfSpeech: "adjective" },
  { id: "zh-adj-old", language: "zh", category: "common-words", target: "旧", romanization: "jiù", meaning: "Old", difficulty: "beginner", partOfSpeech: "adjective" },

  // --- PEOPLE & RELATIONSHIPS ---
  { id: "zh-person-man", language: "zh", category: "common-words", target: "男人", romanization: "nán rén", meaning: "Man", difficulty: "beginner", partOfSpeech: "noun" },
  { id: "zh-person-woman", language: "zh", category: "common-words", target: "女人", romanization: "nǚ rén", meaning: "Woman", difficulty: "beginner", partOfSpeech: "noun" },
  { id: "zh-person-child", language: "zh", category: "common-words", target: "孩子", romanization: "hái zi", meaning: "Child", difficulty: "beginner", partOfSpeech: "noun" },
  { id: "zh-person-doctor", language: "zh", category: "common-words", target: "医生", romanization: "yī shēng", meaning: "Doctor", difficulty: "beginner", partOfSpeech: "noun" },

  // --- PLACES ---
  { id: "zh-place-hospital", language: "zh", category: "common-words", target: "医院", romanization: "yī yuàn", meaning: "Hospital", difficulty: "beginner", partOfSpeech: "noun" },
  { id: "zh-place-store", language: "zh", category: "common-words", target: "商店", romanization: "shāng diàn", meaning: "Store / Shop", difficulty: "beginner", partOfSpeech: "noun" },
  { id: "zh-place-restaurant", language: "zh", category: "common-words", target: "饭店", romanization: "fàn diàn", meaning: "Restaurant", difficulty: "beginner", partOfSpeech: "noun" },
  { id: "zh-place-station", language: "zh", category: "common-words", target: "车站", romanization: "chē zhàn", meaning: "Station", difficulty: "beginner", partOfSpeech: "noun" },
  { id: "zh-place-airport", language: "zh", category: "common-words", target: "机场", romanization: "jī chǎng", meaning: "Airport", difficulty: "intermediate", partOfSpeech: "noun" },

  // --- TRANSPORT ---
  { id: "zh-trans-car", language: "zh", category: "common-words", target: "车", romanization: "chē", meaning: "Car / Vehicle", difficulty: "beginner", partOfSpeech: "noun" },
  { id: "zh-trans-bus", language: "zh", category: "common-words", target: "公交车", romanization: "gōng jiāo chē", meaning: "Bus", difficulty: "beginner", partOfSpeech: "noun" },
  { id: "zh-trans-taxi", language: "zh", category: "common-words", target: "出租车", romanization: "chū zū chē", meaning: "Taxi", difficulty: "beginner", partOfSpeech: "noun" },
  { id: "zh-trans-subway", language: "zh", category: "common-words", target: "地铁", romanization: "dì tiě", meaning: "Subway / Metro", difficulty: "intermediate", partOfSpeech: "noun" },
  { id: "zh-trans-train", language: "zh", category: "common-words", target: "火车", romanization: "huǒ chē", meaning: "Train", difficulty: "beginner", partOfSpeech: "noun" },
];

// ============================================
// GERMAN WORD INVENTORY
// ============================================

const germanInventory: WordEntry[] = [
  // --- ALPHABET / PRONUNCIATION ---
  { id: "de-alpha-a", language: "de", category: "alphabet", target: "A", romanization: "[aː] (ah)", meaning: "Letter A", difficulty: "beginner", partOfSpeech: "letter" },
  { id: "de-alpha-b", language: "de", category: "alphabet", target: "B", romanization: "[beː] (bay)", meaning: "Letter B", difficulty: "beginner", partOfSpeech: "letter" },
  { id: "de-alpha-c", language: "de", category: "alphabet", target: "C", romanization: "[tseː] (tsay)", meaning: "Letter C", difficulty: "beginner", partOfSpeech: "letter" },
  { id: "de-alpha-d", language: "de", category: "alphabet", target: "D", romanization: "[deː] (day)", meaning: "Letter D", difficulty: "beginner", partOfSpeech: "letter" },
  { id: "de-alpha-e", language: "de", category: "alphabet", target: "E", romanization: "[eː] (ay)", meaning: "Letter E", difficulty: "beginner", partOfSpeech: "letter" },
  { id: "de-alpha-f", language: "de", category: "alphabet", target: "F", romanization: "[ɛf] (eff)", meaning: "Letter F", difficulty: "beginner", partOfSpeech: "letter" },
  { id: "de-alpha-g", language: "de", category: "alphabet", target: "G", romanization: "[ɡeː] (gay)", meaning: "Letter G", difficulty: "beginner", partOfSpeech: "letter" },
  { id: "de-alpha-h", language: "de", category: "alphabet", target: "H", romanization: "[haː] (hah)", meaning: "Letter H", difficulty: "beginner", partOfSpeech: "letter" },
  { id: "de-alpha-i", language: "de", category: "alphabet", target: "I", romanization: "[iː] (ee)", meaning: "Letter I", difficulty: "beginner", partOfSpeech: "letter" },
  { id: "de-alpha-j", language: "de", category: "alphabet", target: "J", romanization: "[jɔt] (yot)", meaning: "Letter J", difficulty: "beginner", partOfSpeech: "letter" },
  { id: "de-alpha-k", language: "de", category: "alphabet", target: "K", romanization: "[kaː] (kah)", meaning: "Letter K", difficulty: "beginner", partOfSpeech: "letter" },
  { id: "de-alpha-l", language: "de", category: "alphabet", target: "L", romanization: "[ɛl] (ell)", meaning: "Letter L", difficulty: "beginner", partOfSpeech: "letter" },
  { id: "de-alpha-m", language: "de", category: "alphabet", target: "M", romanization: "[ɛm] (emm)", meaning: "Letter M", difficulty: "beginner", partOfSpeech: "letter" },
  { id: "de-alpha-n", language: "de", category: "alphabet", target: "N", romanization: "[ɛn] (enn)", meaning: "Letter N", difficulty: "beginner", partOfSpeech: "letter" },
  { id: "de-alpha-o", language: "de", category: "alphabet", target: "O", romanization: "[oː] (oh)", meaning: "Letter O", difficulty: "beginner", partOfSpeech: "letter" },
  { id: "de-alpha-p", language: "de", category: "alphabet", target: "P", romanization: "[peː] (pay)", meaning: "Letter P", difficulty: "beginner", partOfSpeech: "letter" },
  { id: "de-alpha-q", language: "de", category: "alphabet", target: "Q", romanization: "[kuː] (koo)", meaning: "Letter Q", difficulty: "beginner", partOfSpeech: "letter" },
  { id: "de-alpha-r", language: "de", category: "alphabet", target: "R", romanization: "[ɛʁ] (err)", meaning: "Letter R", difficulty: "beginner", partOfSpeech: "letter" },
  { id: "de-alpha-s", language: "de", category: "alphabet", target: "S", romanization: "[ɛs] (ess)", meaning: "Letter S", difficulty: "beginner", partOfSpeech: "letter" },
  { id: "de-alpha-t", language: "de", category: "alphabet", target: "T", romanization: "[teː] (tay)", meaning: "Letter T", difficulty: "beginner", partOfSpeech: "letter" },
  { id: "de-alpha-u", language: "de", category: "alphabet", target: "U", romanization: "[uː] (oo)", meaning: "Letter U", difficulty: "beginner", partOfSpeech: "letter" },
  { id: "de-alpha-v", language: "de", category: "alphabet", target: "V", romanization: "[faʊ] (fow)", meaning: "Letter V", difficulty: "beginner", partOfSpeech: "letter" },
  { id: "de-alpha-w", language: "de", category: "alphabet", target: "W", romanization: "[veː] (vay)", meaning: "Letter W", difficulty: "beginner", partOfSpeech: "letter" },
  { id: "de-alpha-x", language: "de", category: "alphabet", target: "X", romanization: "[ɪks] (iks)", meaning: "Letter X", difficulty: "beginner", partOfSpeech: "letter" },
  { id: "de-alpha-y", language: "de", category: "alphabet", target: "Y", romanization: "[ʏpsilɔn] (uep-si-lon)", meaning: "Letter Y", difficulty: "beginner", partOfSpeech: "letter" },
  { id: "de-alpha-z", language: "de", category: "alphabet", target: "Z", romanization: "[tsɛt] (tset)", meaning: "Letter Z", difficulty: "beginner", partOfSpeech: "letter" },
  { id: "de-alpha-ä", language: "de", category: "alphabet", target: "Ä", romanization: "[ɛː] (eh)", meaning: "Umlaut Ä", difficulty: "beginner", partOfSpeech: "letter" },
  { id: "de-alpha-ö", language: "de", category: "alphabet", target: "Ö", romanization: "[øː] (uh with rounded lips)", meaning: "Umlaut Ö", difficulty: "beginner", partOfSpeech: "letter" },
  { id: "de-alpha-ü", language: "de", category: "alphabet", target: "Ü", romanization: "[yː] (ee with rounded lips)", meaning: "Umlaut Ü", difficulty: "beginner", partOfSpeech: "letter" },
  { id: "de-alpha-ß", language: "de", category: "alphabet", target: "ß", romanization: "[ɛsˈtsɛt] (ess-tset)", meaning: "Sharp S (Eszett)", difficulty: "beginner", partOfSpeech: "letter" },

  // --- NUMBERS (full 0–100, hundreds, 1000 — see numbers.ts) ---
  ...germanNumbers,

  // --- COMMON SHORT WORDS ---
  { id: "de-word-hallo", language: "de", category: "common-words", target: "Hallo", romanization: "[ˈhaloː]", meaning: "Hello", difficulty: "beginner", partOfSpeech: "greeting", example: "Hallo, wie geht's?", exampleMeaning: "Hello, how are you?" },
  { id: "de-word-tschüss", language: "de", category: "common-words", target: "Tschüss", romanization: "[tʃʏs]", meaning: "Bye (informal)", difficulty: "beginner", partOfSpeech: "greeting" },
  { id: "de-word-guten-morgen", language: "de", category: "common-words", target: "Guten Morgen", romanization: "[ˈɡuːtn̩ ˈmɔʁɡn̩]", meaning: "Good morning", difficulty: "beginner", partOfSpeech: "greeting" },
  { id: "de-word-guten-tag", language: "de", category: "common-words", target: "Guten Tag", romanization: "[ˈɡuːtn̩ taːk]", meaning: "Good day", difficulty: "beginner", partOfSpeech: "greeting" },
  { id: "de-word-guten-abend", language: "de", category: "common-words", target: "Guten Abend", romanization: "[ˈɡuːtn̩ ˈaːbn̩t]", meaning: "Good evening", difficulty: "beginner", partOfSpeech: "greeting" },
  { id: "de-word-gute-nacht", language: "de", category: "common-words", target: "Gute Nacht", romanization: "[ˈɡuːtə naxt]", meaning: "Good night", difficulty: "beginner", partOfSpeech: "greeting" },
  { id: "de-word-danke", language: "de", category: "common-words", target: "Danke", romanization: "[ˈdaŋkə]", meaning: "Thank you", difficulty: "beginner", partOfSpeech: "interjection", example: "Danke schön", exampleMeaning: "Thank you very much" },
  { id: "de-word-bitte", language: "de", category: "common-words", target: "Bitte", romanization: "[ˈbɪtə]", meaning: "Please / You're welcome", difficulty: "beginner", partOfSpeech: "interjection", example: "Bitte sehr", exampleMeaning: "You're very welcome" },
  { id: "de-word-ja", language: "de", category: "common-words", target: "Ja", romanization: "[jaː]", meaning: "Yes", difficulty: "beginner", partOfSpeech: "particle" },
  { id: "de-word-nein", language: "de", category: "common-words", target: "Nein", romanization: "[naɪn]", meaning: "No", difficulty: "beginner", partOfSpeech: "particle" },
  { id: "de-word-gut", language: "de", category: "common-words", target: "Gut", romanization: "[ɡuːt]", meaning: "Good", difficulty: "beginner", partOfSpeech: "adjective", example: "Das ist gut", exampleMeaning: "That is good" },
  { id: "de-word-schlecht", language: "de", category: "common-words", target: "Schlecht", romanization: "[ʃlɛçt]", meaning: "Bad", difficulty: "beginner", partOfSpeech: "adjective" },
  { id: "de-word-groß", language: "de", category: "common-words", target: "Groß", romanization: "[ɡʁoːs]", meaning: "Big / Tall", difficulty: "beginner", partOfSpeech: "adjective" },
  { id: "de-word-klein", language: "de", category: "common-words", target: "Klein", romanization: "[klaɪn]", meaning: "Small", difficulty: "beginner", partOfSpeech: "adjective" },
  { id: "de-word-wasser", language: "de", category: "common-words", target: "Wasser", romanization: "[ˈvasɐ]", meaning: "Water", difficulty: "beginner", partOfSpeech: "noun", example: "Ein Wasser, bitte", exampleMeaning: "A water, please" },
  { id: "de-word-brot", language: "de", category: "common-words", target: "Brot", romanization: "[bʁoːt]", meaning: "Bread", difficulty: "beginner", partOfSpeech: "noun" },
  { id: "de-word-essen", language: "de", category: "common-words", target: "Essen", romanization: "[ˈɛsn̩]", meaning: "Food / To eat", difficulty: "beginner", partOfSpeech: "noun/verb", example: "Ich esse", exampleMeaning: "I eat" },
  { id: "de-word-trinken", language: "de", category: "common-words", target: "Trinken", romanization: "[ˈtʁɪŋkn̩]", meaning: "To drink", difficulty: "beginner", partOfSpeech: "verb", example: "Ich trinke Wasser", exampleMeaning: "I drink water" },
  { id: "de-word-gehen", language: "de", category: "common-words", target: "Gehen", romanization: "[ˈɡeːn̩]", meaning: "To go / Walk", difficulty: "beginner", partOfSpeech: "verb", example: "Ich gehe nach Hause", exampleMeaning: "I'm going home" },
  { id: "de-word-kommen", language: "de", category: "common-words", target: "Kommen", romanization: "[ˈkɔmən]", meaning: "To come", difficulty: "beginner", partOfSpeech: "verb" },
  { id: "de-word-sein", language: "de", category: "common-words", target: "Sein", romanization: "[zaɪn]", meaning: "To be", difficulty: "beginner", partOfSpeech: "verb", example: "Ich bin müde", exampleMeaning: "I am tired" },
  { id: "de-word-haben", language: "de", category: "common-words", target: "Haben", romanization: "[ˈhaːbn̩]", meaning: "To have", difficulty: "beginner", partOfSpeech: "verb", example: "Ich habe Zeit", exampleMeaning: "I have time" },
  { id: "de-word-machen", language: "de", category: "common-words", target: "Machen", romanization: "[ˈmaxn̩]", meaning: "To do / Make", difficulty: "beginner", partOfSpeech: "verb", example: "Was machst du?", exampleMeaning: "What are you doing?" },
  { id: "de-word-können", language: "de", category: "common-words", target: "Können", romanization: "[ˈkœnən]", meaning: "Can / To be able to", difficulty: "beginner", partOfSpeech: "verb", example: "Ich kann Deutsch", exampleMeaning: "I can speak German" },
  { id: "de-word-wollen", language: "de", category: "common-words", target: "Wollen", romanization: "[ˈvɔlən]", meaning: "To want", difficulty: "beginner", partOfSpeech: "verb", example: "Ich will schlafen", exampleMeaning: "I want to sleep" },
  { id: "de-word-müssen", language: "de", category: "common-words", target: "Müssen", romanization: "[ˈmʏsn̩]", meaning: "Must / Have to", difficulty: "beginner", partOfSpeech: "verb", example: "Ich muss gehen", exampleMeaning: "I have to go" },
  { id: "de-word-sollen", language: "de", category: "common-words", target: "Sollen", romanization: "[ˈzɔlən]", meaning: "Should / Supposed to", difficulty: "intermediate", partOfSpeech: "verb" },
  { id: "de-word-wissen", language: "de", category: "common-words", target: "Wissen", romanization: "[ˈvɪsn̩]", meaning: "To know (facts)", difficulty: "beginner", partOfSpeech: "verb", example: "Ich weiß es nicht", exampleMeaning: "I don't know" },
  { id: "de-word-kennen", language: "de", category: "common-words", target: "Kennen", romanization: "[ˈkɛnən]", meaning: "To know (people/places)", difficulty: "beginner", partOfSpeech: "verb", example: "Ich kenne ihn", exampleMeaning: "I know him" },
  { id: "de-word-denken", language: "de", category: "common-words", target: "Denken", romanization: "[ˈdɛŋkn̩]", meaning: "To think", difficulty: "beginner", partOfSpeech: "verb", example: "Ich denke an dich", exampleMeaning: "I'm thinking of you" },
  { id: "de-word-glauben", language: "de", category: "common-words", target: "Glauben", romanization: "[ˈɡlaʊbn̩]", meaning: "To believe / Think", difficulty: "beginner", partOfSpeech: "verb", example: "Ich glaube schon", exampleMeaning: "I think so" },
  { id: "de-word-verstehen", language: "de", category: "common-words", target: "Verstehen", romanization: "[fɛɐˈʃteːn]", meaning: "To understand", difficulty: "beginner", partOfSpeech: "verb", example: "Ich verstehe nicht", exampleMeaning: "I don't understand" },
  { id: "de-word-sprechen", language: "de", category: "common-words", target: "Sprechen", romanization: "[ˈʃpʁɛçn̩]", meaning: "To speak", difficulty: "beginner", partOfSpeech: "verb", example: "Sprechen Sie Englisch?", exampleMeaning: "Do you speak English?" },
  { id: "de-word-lernen", language: "de", category: "common-words", target: "Lernen", romanization: "[ˈlɛrn̩]", meaning: "To learn", difficulty: "beginner", partOfSpeech: "verb", example: "Ich lerne Deutsch", exampleMeaning: "I'm learning German" },
  { id: "de-word-arbeiten", language: "de", category: "common-words", target: "Arbeiten", romanization: "[ˈaʁbaɪtn̩]", meaning: "To work", difficulty: "beginner", partOfSpeech: "verb" },
  { id: "de-word-spielen", language: "de", category: "common-words", target: "Spielen", romanization: "[ˈʃpiːln̩]", meaning: "To play", difficulty: "beginner", partOfSpeech: "verb" },
  { id: "de-word-kaufen", language: "de", category: "common-words", target: "Kaufen", romanization: "[ˈkaʊfn̩]", meaning: "To buy", difficulty: "beginner", partOfSpeech: "verb", example: "Ich kaufe Brot", exampleMeaning: "I'm buying bread" },
  { id: "de-word-verkaufen", language: "de", category: "common-words", target: "Verkaufen", romanization: "[fɛɐˈkaʊfn̩]", meaning: "To sell", difficulty: "intermediate", partOfSpeech: "verb" },
  { id: "de-word-lesen", language: "de", category: "common-words", target: "Lesen", romanization: "[ˈleːzn̩]", meaning: "To read", difficulty: "beginner", partOfSpeech: "verb", example: "Ich lese ein Buch", exampleMeaning: "I'm reading a book" },
  { id: "de-word-schreiben", language: "de", category: "common-words", target: "Schreiben", romanization: "[ˈʃʁaɪbn̩]", meaning: "To write", difficulty: "beginner", partOfSpeech: "verb" },
  { id: "de-word-schlafen", language: "de", category: "common-words", target: "Schlafen", romanization: "[ˈʃlaːfn̩]", meaning: "To sleep", difficulty: "beginner", partOfSpeech: "verb", example: "Ich schlafe gut", exampleMeaning: "I sleep well" },
  { id: "de-word-aufstehen", language: "de", category: "common-words", target: "Aufstehen", romanization: "[ˈaʊfˌʃteːn]", meaning: "To get up", difficulty: "beginner", partOfSpeech: "verb" },
  { id: "de-word-wohnen", language: "de", category: "common-words", target: "Wohnen", romanization: "[ˈvoːnən]", meaning: "To live / Reside", difficulty: "beginner", partOfSpeech: "verb", example: "Ich wohne in Berlin", exampleMeaning: "I live in Berlin" },
  { id: "de-word-kommen-aus", language: "de", category: "common-words", target: "Auskommen", romanization: "[ˈaʊsˌkɔmən]", meaning: "To come from", difficulty: "beginner", partOfSpeech: "verb", example: "Ich komme aus Deutschland", exampleMeaning: "I come from Germany" },

  // --- PRONOUNS ---
  { id: "de-pronoun-ich", language: "de", category: "common-words", target: "ich", romanization: "[ɪç]", meaning: "I", difficulty: "beginner", partOfSpeech: "pronoun" },
  { id: "de-pronoun-du", language: "de", category: "common-words", target: "du", romanization: "[duː]", meaning: "You (informal)", difficulty: "beginner", partOfSpeech: "pronoun" },
  { id: "de-pronoun-er", language: "de", category: "common-words", target: "er", romanization: "[eːɐ]", meaning: "He", difficulty: "beginner", partOfSpeech: "pronoun" },
  { id: "de-pronoun-sie", language: "de", category: "common-words", target: "sie", romanization: "[ziː]", meaning: "She / They / You (formal)", difficulty: "beginner", partOfSpeech: "pronoun" },
  { id: "de-pronoun-es", language: "de", category: "common-words", target: "es", romanization: "[ɛs]", meaning: "It", difficulty: "beginner", partOfSpeech: "pronoun" },
  { id: "de-pronoun-wir", language: "de", category: "common-words", target: "wir", romanization: "[viːɐ]", meaning: "We", difficulty: "beginner", partOfSpeech: "pronoun" },
  { id: "de-pronoun-ihr", language: "de", category: "common-words", target: "ihr", romanization: "[iːɐ]", meaning: "You (plural informal)", difficulty: "beginner", partOfSpeech: "pronoun" },
  { id: "de-pronoun-sie-formal", language: "de", category: "common-words", target: "Sie", romanization: "[ziː]", meaning: "You (formal)", difficulty: "beginner", partOfSpeech: "pronoun" },

  // --- COMMON NOUNS ---
  { id: "de-noun-mann", language: "de", category: "common-words", target: "Mann", romanization: "[man]", meaning: "Man", difficulty: "beginner", partOfSpeech: "noun (der)" },
  { id: "de-noun-frau", language: "de", category: "common-words", target: "Frau", romanization: "[fʁaʊ]", meaning: "Woman", difficulty: "beginner", partOfSpeech: "noun (die)" },
  { id: "de-noun-kind", language: "de", category: "common-words", target: "Kind", romanization: "[kɪnt]", meaning: "Child", difficulty: "beginner", partOfSpeech: "noun (das)" },
  { id: "de-noun-freund", language: "de", category: "common-words", target: "Freund", romanization: "[fʁɔʏnt]", meaning: "Friend (male)", difficulty: "beginner", partOfSpeech: "noun (der)" },
  { id: "de-noun-freundin", language: "de", category: "common-words", target: "Freundin", romanization: "[fʁɔʏntɪn]", meaning: "Friend (female)", difficulty: "beginner", partOfSpeech: "noun (die)" },
  { id: "de-noun-familie", language: "de", category: "common-words", target: "Familie", romanization: "[faˈmiːliə]", meaning: "Family", difficulty: "beginner", partOfSpeech: "noun (die)" },
  { id: "de-noun-vater", language: "de", category: "common-words", target: "Vater", romanization: "[ˈfaːtɐ]", meaning: "Father", difficulty: "beginner", partOfSpeech: "noun (der)" },
  { id: "de-noun-mutter", language: "de", category: "common-words", target: "Mutter", romanization: "[ˈmʊtɐ]", meaning: "Mother", difficulty: "beginner", partOfSpeech: "noun (die)" },
  { id: "de-noun-bruder", language: "de", category: "common-words", target: "Bruder", romanization: "[ˈbʁuːdɐ]", meaning: "Brother", difficulty: "beginner", partOfSpeech: "noun (der)" },
  { id: "de-noun-schwester", language: "de", category: "common-words", target: "Schwester", romanization: "[ˈʃvɛstɐ]", meaning: "Sister", difficulty: "beginner", partOfSpeech: "noun (die)" },
  { id: "de-noun-haus", language: "de", category: "common-words", target: "Haus", romanization: "[haʊs]", meaning: "House", difficulty: "beginner", partOfSpeech: "noun (das)" },
  { id: "de-noun-wohnung", language: "de", category: "common-words", target: "Wohnung", romanization: "[voːnʊŋ]", meaning: "Apartment", difficulty: "beginner", partOfSpeech: "noun (die)" },
  { id: "de-noun-zimmer", language: "de", category: "common-words", target: "Zimmer", romanization: "[ˈtsɪmɐ]", meaning: "Room", difficulty: "beginner", partOfSpeech: "noun (das)" },
  { id: "de-noun-tür", language: "de", category: "common-words", target: "Tür", romanization: "[tyːɐ]", meaning: "Door", difficulty: "beginner", partOfSpeech: "noun (die)" },
  { id: "de-noun-fenster", language: "de", category: "common-words", target: "Fenster", romanization: "[ˈfɛnstɐ]", meaning: "Window", difficulty: "beginner", partOfSpeech: "noun (das)" },
  { id: "de-noun-tisch", language: "de", category: "common-words", target: "Tisch", romanization: "[tɪʃ]", meaning: "Table", difficulty: "beginner", partOfSpeech: "noun (der)" },
  { id: "de-noun-stuhl", language: "de", category: "common-words", target: "Stuhl", romanization: "[ʃtuːl]", meaning: "Chair", difficulty: "beginner", partOfSpeech: "noun (der)" },
  { id: "de-noun-bett", language: "de", category: "common-words", target: "Bett", romanization: "[bɛt]", meaning: "Bed", difficulty: "beginner", partOfSpeech: "noun (das)" },
  { id: "de-noun-auto", language: "de", category: "common-words", target: "Auto", romanization: "[ˈaʊtoː]", meaning: "Car", difficulty: "beginner", partOfSpeech: "noun (das)" },
  { id: "de-noun-fahrrad", language: "de", category: "common-words", target: "Fahrrad", romanization: "[ˈfaːʁaːt]", meaning: "Bicycle", difficulty: "beginner", partOfSpeech: "noun (das)" },
  { id: "de-noun-bahn", language: "de", category: "common-words", target: "Bahn", romanization: "[baːn]", meaning: "Train / Railway", difficulty: "beginner", partOfSpeech: "noun (die)" },
  { id: "de-noun-bus", language: "de", category: "common-words", target: "Bus", romanization: "[bʊs]", meaning: "Bus", difficulty: "beginner", partOfSpeech: "noun (der)" },
  { id: "de-noun-flugzeug", language: "de", category: "common-words", target: "Flugzeug", romanization: "[ˈflʊktsɔʏk]", meaning: "Airplane", difficulty: "intermediate", partOfSpeech: "noun (das)" },
  { id: "de-noun-schule", language: "de", category: "common-words", target: "Schule", romanization: "[ˈʃuːlə]", meaning: "School", difficulty: "beginner", partOfSpeech: "noun (die)" },
  { id: "de-noun-lehrer", language: "de", category: "common-words", target: "Lehrer", romanization: "[ˈleːʁɐ]", meaning: "Teacher (male)", difficulty: "beginner", partOfSpeech: "noun (der)" },
  { id: "de-noun-lehrerin", language: "de", category: "common-words", target: "Lehrerin", romanization: "[ˈleːʁəʁɪn]", meaning: "Teacher (female)", difficulty: "beginner", partOfSpeech: "noun (die)" },
  { id: "de-noun-schüler", language: "de", category: "common-words", target: "Schüler", romanization: "[ˈʃyːlɐ]", meaning: "Student (male)", difficulty: "beginner", partOfSpeech: "noun (der)" },
  { id: "de-noun-schülerin", language: "de", category: "common-words", target: "Schülerin", romanization: "[ˈʃyːləʁɪn]", meaning: "Student (female)", difficulty: "beginner", partOfSpeech: "noun (die)" },
  { id: "de-noun-buch", language: "de", category: "common-words", target: "Buch", romanization: "[buːx]", meaning: "Book", difficulty: "beginner", partOfSpeech: "noun (das)" },
  { id: "de-noun-zeitung", language: "de", category: "common-words", target: "Zeitung", romanization: "[ˈtsaɪtʊŋ]", meaning: "Newspaper", difficulty: "intermediate", partOfSpeech: "noun (die)" },
  { id: "de-noun-handynummer", language: "de", category: "common-words", target: "Handynummer", romanization: "[ˈhandiˌnʊmɐ]", meaning: "Phone number", difficulty: "beginner", partOfSpeech: "noun (die)" },

  // --- TIME ---
  { id: "de-time-jetzt", language: "de", category: "common-words", target: "jetzt", romanization: "[jɛtst]", meaning: "Now", difficulty: "beginner", partOfSpeech: "adverb" },
  { id: "de-time-heute", language: "de", category: "common-words", target: "heute", romanization: "[ˈhɔɪtə]", meaning: "Today", difficulty: "beginner", partOfSpeech: "adverb" },
  { id: "de-time-morgen", language: "de", category: "common-words", target: "morgen", romanization: "[ˈmɔʁɡn̩]", meaning: "Tomorrow / Morning", difficulty: "beginner", partOfSpeech: "adverb" },
  { id: "de-time-gestern", language: "de", category: "common-words", target: "gestern", romanization: "[ˈɡɛstɐn]", meaning: "Yesterday", difficulty: "beginner", partOfSpeech: "adverb" },
  { id: "de-time-woche", language: "de", category: "common-words", target: "Woche", romanization: "[ˈvɔxə]", meaning: "Week", difficulty: "beginner", partOfSpeech: "noun (die)" },
  { id: "de-time-monat", language: "de", category: "common-words", target: "Monat", romanization: "[ˈmoːnaːt]", meaning: "Month", difficulty: "beginner", partOfSpeech: "noun (der)" },
  { id: "de-time-jahr", language: "de", category: "common-words", target: "Jahr", romanization: "[jaːɐ]", meaning: "Year", difficulty: "beginner", partOfSpeech: "noun (das)" },
  { id: "de-time-uhr", language: "de", category: "common-words", target: "Uhr", romanization: "[uːɐ]", meaning: "Clock / O'clock", difficulty: "beginner", partOfSpeech: "noun (die)", example: "Es ist drei Uhr", exampleMeaning: "It's three o'clock" },
  { id: "de-time-minute", language: "de", category: "common-words", target: "Minute", romanization: "[miˈnuːtə]", meaning: "Minute", difficulty: "beginner", partOfSpeech: "noun (die)" },
  { id: "de-time-stunde", language: "de", category: "common-words", target: "Stunde", romanization: "[ˈʃtʊndə]", meaning: "Hour", difficulty: "beginner", partOfSpeech: "noun (die)" },

  // --- COMMON ADJECTIVES ---
  { id: "de-adj-gut", language: "de", category: "common-words", target: "gut", romanization: "[ɡuːt]", meaning: "Good", difficulty: "beginner", partOfSpeech: "adjective" },
  { id: "de-adj-schlecht", language: "de", category: "common-words", target: "schlecht", romanization: "[ʃlɛçt]", meaning: "Bad", difficulty: "beginner", partOfSpeech: "adjective" },
  { id: "de-adj-groß", language: "de", category: "common-words", target: "groß", romanization: "[ɡʁoːs]", meaning: "Big / Large / Tall", difficulty: "beginner", partOfSpeech: "adjective" },
  { id: "de-adj-klein", language: "de", category: "common-words", target: "klein", romanization: "[klaɪn]", meaning: "Small / Little", difficulty: "beginner", partOfSpeech: "adjective" },
  { id: "de-adj-neu", language: "de", category: "common-words", target: "neu", romanization: "[nɔʏ]", meaning: "New", difficulty: "beginner", partOfSpeech: "adjective" },
  { id: "de-adj-alt", language: "de", category: "common-words", target: "alt", romanization: "[alt]", meaning: "Old", difficulty: "beginner", partOfSpeech: "adjective" },
  { id: "de-adj-jung", language: "de", category: "common-words", target: "jung", romanization: "[jʊŋ]", meaning: "Young", difficulty: "beginner", partOfSpeech: "adjective" },
  { id: "de-adj-schnell", language: "de", category: "common-words", target: "schnell", romanization: "[ʃnɛl]", meaning: "Fast / Quick", difficulty: "beginner", partOfSpeech: "adjective" },
  { id: "de-adj-langsam", language: "de", category: "common-words", target: "langsam", romanization: "[ˈlaŋzaːm]", meaning: "Slow", difficulty: "beginner", partOfSpeech: "adjective" },
  { id: "de-adj-heiß", language: "de", category: "common-words", target: "heiß", romanization: "[haɪs]", meaning: "Hot", difficulty: "beginner", partOfSpeech: "adjective" },
  { id: "de-adj-kalt", language: "de", category: "common-words", target: "kalt", romanization: "[kalt]", meaning: "Cold", difficulty: "beginner", partOfSpeech: "adjective" },
  { id: "de-adj-warm", language: "de", category: "common-words", target: "warm", romanization: "[varm]", meaning: "Warm", difficulty: "beginner", partOfSpeech: "adjective" },
  { id: "de-adj-schön", language: "de", category: "common-words", target: "schön", romanization: "[ʃøːn]", meaning: "Beautiful / Nice", difficulty: "beginner", partOfSpeech: "adjective" },
  { id: "de-adj-hässlich", language: "de", category: "common-words", target: "hässlich", romanization: "[ˈhɛslɪç]", meaning: "Ugly", difficulty: "intermediate", partOfSpeech: "adjective" },
  { id: "de-adj-teuer", language: "de", category: "common-words", target: "teuer", romanization: "[ˈtɔʏɐ]", meaning: "Expensive", difficulty: "beginner", partOfSpeech: "adjective" },
  { id: "de-adj-billig", language: "de", category: "common-words", target: "billig", romanization: "[ˈbɪlɪç]", meaning: "Cheap", difficulty: "beginner", partOfSpeech: "adjective" },
  { id: "de-adj-müde", language: "de", category: "common-words", target: "müde", romanization: "[ˈmyːdə]", meaning: "Tired", difficulty: "beginner", partOfSpeech: "adjective" },
  { id: "de-adj-hungrig", language: "de", category: "common-words", target: "hungrig", romanization: "[ˈhʊŋɡʁɪç]", meaning: "Hungry", difficulty: "beginner", partOfSpeech: "adjective" },
  { id: "de-adj-durstig", language: "de", category: "common-words", target: "durstig", romanization: "[ˈdʊʁstɪç]", meaning: "Thirsty", difficulty: "beginner", partOfSpeech: "adjective" },
  { id: "de-adj-krank", language: "de", category: "common-words", target: "krank", romanization: "[kʁaŋk]", meaning: "Sick", difficulty: "beginner", partOfSpeech: "adjective" },
  { id: "de-adj-gesund", language: "de", category: "common-words", target: "gesund", romanization: "[ɡəˈzʊnt]", meaning: "Healthy", difficulty: "beginner", partOfSpeech: "adjective" },

  // --- COMMON PHRASES ---
  { id: "de-phrase-how-are-you", language: "de", category: "phrases", target: "Wie geht's?", romanization: "[viː ɡɛts]", meaning: "How are you? (informal)", difficulty: "beginner" },
  { id: "de-phrase-im-fine", language: "de", category: "phrases", target: "Mir geht's gut", romanization: "[miːɐ ɡɛts ɡuːt]", meaning: "I'm fine", difficulty: "beginner" },
  { id: "de-phrase-thanks", language: "de", category: "phrases", target: "Danke schön", romanization: "[ˈdaŋkə ʃøːn]", meaning: "Thank you very much", difficulty: "beginner" },
  { id: "de-phrase-youre-welcome", language: "de", category: "phrases", target: "Bitte schön", romanization: "[ˈbɪtə ʃøːn]", meaning: "You're welcome", difficulty: "beginner" },
  { id: "de-phrase-excuse", language: "de", category: "phrases", target: "Entschuldigung!", romanization: "[ɛntˈʃʊldɪɡʊŋ]", meaning: "Excuse me / Sorry!", difficulty: "beginner" },
  { id: "de-phrase-dont-understand", language: "de", category: "phrases", target: "Ich verstehe nicht", romanization: "[ɪç fɛɐˈʃteːnə nɪçt]", meaning: "I don't understand", difficulty: "beginner" },
  { id: "de-phrase-speak-english", language: "de", category: "phrases", target: "Sprechen Sie Englisch?", romanization: "[ˈʃpʁɛçnə ziː ˈɛŋlɪʃ]", meaning: "Do you speak English? (formal)", difficulty: "beginner" },
  { id: "de-phrase-what-is-your-name", language: "de", category: "phrases", target: "Wie heißen Sie?", romanization: "[viː ˈhaɪsn̩ ziː]", meaning: "What is your name? (formal)", difficulty: "beginner" },
  { id: "de-phrase-my-name-is", language: "de", category: "phrases", target: "Ich heiße...", romanization: "[ɪç ˈhaɪsə]", meaning: "My name is...", difficulty: "beginner" },
  { id: "de-phrase-where-from", language: "de", category: "phrases", target: "Woher kommen Sie?", romanization: "[voːɐ ˈkɔmən ziː]", meaning: "Where are you from? (formal)", difficulty: "beginner" },
  { id: "de-phrase-im-from", language: "de", category: "phrases", target: "Ich komme aus...", romanization: "[ɪç ˈkɔmə aʊs]", meaning: "I'm from...", difficulty: "beginner" },
  { id: "de-phrase-where-is", language: "de", category: "phrases", target: "Wo ist...?", romanization: "[voː ɪst]", meaning: "Where is...?", difficulty: "beginner" },
  { id: "de-phrase-bathroom", language: "de", category: "phrases", target: "Wo ist die Toilette?", romanization: "[voː ɪst diː tɔɪˈlɛtə]", meaning: "Where is the bathroom?", difficulty: "beginner" },
  { id: "de-phrase-how-much", language: "de", category: "phrases", target: "Was kostet das?", romanization: "[vas ˈkɔstət das]", meaning: "How much does that cost?", difficulty: "beginner" },
  { id: "de-phrase-i-want", language: "de", category: "phrases", target: "Ich möchte...", romanization: "[ɪç ˈmœçtə]", meaning: "I would like...", difficulty: "beginner" },
  { id: "de-phrase-i-want-water", language: "de", category: "phrases", target: "Ich möchte Wasser", romanization: "[ɪç ˈmœçtə ˈvasɐ]", meaning: "I would like water", difficulty: "beginner" },
  { id: "de-phrase-the-bill", language: "de", category: "phrases", target: "Die Rechnung, bitte", romanization: "[diː ˈʁɛçnʊŋ ˈbɪtə]", meaning: "The check, please", difficulty: "beginner" },
  { id: "de-phrase-delicious", language: "de", category: "phrases", target: "Das schmeckt gut", romanization: "[das ʃmɛkt ɡuːt]", meaning: "That tastes good", difficulty: "beginner" },
  { id: "de-phrase-help", language: "de", category: "phrases", target: "Hilfe!", romanization: "[ˈhɪlfə]", meaning: "Help!", difficulty: "beginner" },
  { id: "de-phrase-emergency", language: "de", category: "phrases", target: "Rufen Sie die Polizei!", romanization: "[ˈʁuːfn̩ ziː diː pɔliˈt͡saɪ]", meaning: "Call the police!", difficulty: "intermediate" },
  { id: "de-phrase-i-dont-know", language: "de", category: "phrases", target: "Ich weiß nicht", romanization: "[ɪç vaɪs nɪçt]", meaning: "I don't know", difficulty: "beginner" },
  { id: "de-phrase-what-does-it-mean", language: "de", category: "phrases", target: "Was bedeutet das?", romanization: "[vas bəˈdɔɪtət das]", meaning: "What does that mean?", difficulty: "beginner" },
  { id: "de-phrase-repeat-please", language: "de", category: "phrases", target: "Können Sie das wiederholen?", romanization: "[ˈkœnən ziː das ˌviːdɐˈhoːln̩]", meaning: "Can you repeat that?", difficulty: "intermediate" },
  { id: "de-phrase-speak-slower", language: "de", category: "phrases", target: "Können Sie langsamer sprechen?", romanization: "[ˈkœnən ziː ˈlaŋzaːmɐ ˈʃpʁɛçn̩]", meaning: "Can you speak slower?", difficulty: "intermediate" },
  { id: "de-phrase-yes", language: "de", category: "phrases", target: "Ja, bitte", romanization: "[jaː ˈbɪtə]", meaning: "Yes, please", difficulty: "beginner" },
  { id: "de-phrase-no-thanks", language: "de", category: "phrases", target: "Nein, danke", romanization: "[naɪn ˈdaŋkə]", meaning: "No, thanks", difficulty: "beginner" },
  { id: "de-phrase-of-course", language: "de", category: "phrases", target: "Natürlich", romanization: "[naˈtyːʁlɪç]", meaning: "Of course / Naturally", difficulty: "beginner" },
  { id: "de-phrase-maybe", language: "de", category: "phrases", target: "Vielleicht", romanization: "[fiːlˈlaɪçt]", meaning: "Maybe / Perhaps", difficulty: "beginner" },
  { id: "de-phrase-never-mind", language: "de", category: "phrases", target: "Macht nichts", romanization: "[maxt nɪçts]", meaning: "Never mind / It doesn't matter", difficulty: "beginner" },

  // --- SELF-INTRODUCTION & EVERYDAY SITUATIONS ---
  { id: "de-phrase-intro-name", language: "de", category: "phrases", target: "Mein Name ist...", romanization: "[maɪn ˈnaːmə ɪst]", meaning: "My name is...", difficulty: "beginner" },
  { id: "de-phrase-intro-age", language: "de", category: "phrases", target: "Ich bin 25 Jahre alt", romanization: "[ɪç bɪn ˈfʏnfʊntˈtsvantsɪç ˈjaːʁə alt]", meaning: "I'm 25 years old", difficulty: "beginner" },
  { id: "de-phrase-intro-learning", language: "de", category: "phrases", target: "Ich lerne Deutsch", romanization: "[ɪç ˈlɛrnə dɔʏtʃ]", meaning: "I'm learning German", difficulty: "beginner" },
  { id: "de-phrase-intro-live", language: "de", category: "phrases", target: "Ich wohne in Berlin", romanization: "[ɪç ˈvoːnə ɪn bɛʁˈliːn]", meaning: "I live in Berlin", difficulty: "beginner" },
  { id: "de-phrase-intro-nice", language: "de", category: "phrases", target: "Freut mich!", romanization: "[fʁɔʏt mɪç]", meaning: "Nice to meet you!", difficulty: "beginner" },
  { id: "de-phrase-intro-student", language: "de", category: "phrases", target: "Ich bin Student", romanization: "[ɪç bɪn ʃtuˈdɛnt]", meaning: "I'm a student", difficulty: "beginner" },
  { id: "de-phrase-intro-job", language: "de", category: "phrases", target: "Was machst du beruflich?", romanization: "[vas maxst duː bəˈʁuːflɪç]", meaning: "What do you do for work?", difficulty: "intermediate" },
  { id: "de-phrase-intro-like", language: "de", category: "phrases", target: "Ich mag Kaffee", romanization: "[ɪç maːk ˈkafe]", meaning: "I like coffee", difficulty: "beginner" },
  { id: "de-phrase-intro-phone", language: "de", category: "phrases", target: "Meine Nummer ist...", romanization: "[ˈmaɪnə ˈnʊmɐ ɪst]", meaning: "My number is...", difficulty: "intermediate" },
  { id: "de-phrase-daily-weather", language: "de", category: "phrases", target: "Schönes Wetter heute!", romanization: "[ˈʃøːnəs ˈvɛtɐ ˈhɔʏtə]", meaning: "Nice weather today!", difficulty: "beginner" },
  { id: "de-phrase-daily-hungry", language: "de", category: "phrases", target: "Ich habe Hunger", romanization: "[ɪç ˈhaːbə ˈhʊŋɐ]", meaning: "I'm hungry", difficulty: "beginner" },
  { id: "de-phrase-daily-together", language: "de", category: "phrases", target: "Lass uns zusammen gehen", romanization: "[las ʊns tsuˈzamən ˈɡeːən]", meaning: "Let's go together", difficulty: "intermediate" },
  { id: "de-phrase-daily-tomorrow", language: "de", category: "phrases", target: "Bis morgen!", romanization: "[bɪs ˈmɔʁɡn̩]", meaning: "See you tomorrow!", difficulty: "beginner" },
  { id: "de-phrase-daily-takecare", language: "de", category: "phrases", target: "Pass auf dich auf!", romanization: "[pas aʊf dɪç aʊf]", meaning: "Take care of yourself!", difficulty: "intermediate" },
];

// ============================================
// EXPORTS
// ============================================

export const wordInventory = {
  zh: chineseInventory,
  de: germanInventory,
};

// Helper functions
export function getWordsByLanguage(language: Language): WordEntry[] {
  return wordInventory[language] || [];
}

export function getWordsByCategory(language: Language, category: string): WordEntry[] {
  return getWordsByLanguage(language).filter(w => w.category === category);
}

export function getCategories(language: Language): string[] {
  const words = getWordsByLanguage(language);
  return [...new Set(words.map(w => w.category))];
}

export function getWordById(language: Language, id: string): WordEntry | undefined {
  return getWordsByLanguage(language).find(w => w.id === id);
}

export function getAllWordIds(language: Language): string[] {
  return getWordsByLanguage(language).map(w => w.id);
}

// Statistics
export const inventoryStats = {
  zh: {
    total: chineseInventory.length,
    byCategory: chineseInventory.reduce((acc, w) => {
      acc[w.category] = (acc[w.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byDifficulty: chineseInventory.reduce((acc, w) => {
      acc[w.difficulty] = (acc[w.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  },
  de: {
    total: germanInventory.length,
    byCategory: germanInventory.reduce((acc, w) => {
      acc[w.category] = (acc[w.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byDifficulty: germanInventory.reduce((acc, w) => {
      acc[w.difficulty] = (acc[w.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  },
};

// Statistics (computed on demand — no logging at import time)