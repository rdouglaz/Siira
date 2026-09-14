import type { Language } from "../context/AppContext"

export interface WordBreakdown {
  word: string
  romanization?: string
  translation: string
  tone?: 1 | 2 | 3 | 4 | 0 // Chinese tones; 0 = neutral
  note?: string // grammar note for German
}

export interface Exchange {
  id: string
  userText: string // English — what the user "said"
  aiText: string // Target language
  aiRomanization?: string // Pinyin for ZH
  aiTranslation: string
  breakdown: WordBreakdown[]
}

// ─── Chinese: Default ────────────────────────────────────────────────────────

const zhDefault: Exchange[] = [
  {
    id: "zh-d1",
    userText: "Hello! I want to practice my Chinese.",
    aiText: "你好！很高兴认识你！我叫小明。",
    aiRomanization: "Nǐ hǎo! Hěn gāoxìng rènshí nǐ! Wǒ jiào Xiǎomíng.",
    aiTranslation: "Hello! Very pleased to meet you! My name is Xiaoming.",
    breakdown: [
      { word: "你好", romanization: "nǐ hǎo", translation: "Hello", tone: 3 },
      { word: "很", romanization: "hěn", translation: "Very", tone: 3 },
      { word: "高兴", romanization: "gāoxìng", translation: "Happy / Pleased", tone: 1 },
      { word: "认识", romanization: "rènshí", translation: "To know / meet", tone: 4 },
      { word: "我叫", romanization: "wǒ jiào", translation: "My name is (lit. I am called)", tone: 3 },
    ],
  },
  {
    id: "zh-d2",
    userText: "Nice to meet you too. My Chinese isn't great yet.",
    aiText: "没关系！慢慢来，别着急。你学多久了？",
    aiRomanization: "Méiguānxi! Màn màn lái, bié zháojí. Nǐ xué duō jiǔ le?",
    aiTranslation: "No worries! Take it slowly, don't rush. How long have you been learning?",
    breakdown: [
      { word: "没关系", romanization: "méiguānxi", translation: "No worries / It's fine", tone: 2 },
      { word: "慢慢来", romanization: "màn màn lái", translation: "Take it slow", tone: 4 },
      { word: "别", romanization: "bié", translation: "Don't", tone: 2 },
      { word: "着急", romanization: "zháojí", translation: "Rush / Anxious", tone: 2 },
      { word: "多久", romanization: "duō jiǔ", translation: "How long", tone: 1 },
    ],
  },
  {
    id: "zh-d3",
    userText: "About two months.",
    aiText: "两个月！真的？你已经说得很好了！继续加油！",
    aiRomanization: "Liǎng gè yuè! Zhēn de? Nǐ yǐjīng shuō de hěn hǎo le! Jìxù jiāyóu!",
    aiTranslation: "Two months! Really? You're already speaking very well! Keep going!",
    breakdown: [
      { word: "两个月", romanization: "liǎng gè yuè", translation: "Two months", tone: 3 },
      { word: "真的", romanization: "zhēn de", translation: "Really?", tone: 1 },
      { word: "已经", romanization: "yǐjīng", translation: "Already", tone: 3 },
      { word: "继续", romanization: "jìxù", translation: "Continue", tone: 4 },
      { word: "加油", romanization: "jiāyóu", translation: "Keep going! (lit. add oil)", tone: 1 },
    ],
  },
  {
    id: "zh-d4",
    userText: "How do I say 'I'm hungry'?",
    aiText: "我饿了！就是这样说。来，你也说说看！",
    aiRomanization: "Wǒ è le! Jiù shì zhèyàng shuō. Lái, nǐ yě shuō shuō kàn!",
    aiTranslation: "I'm hungry! That's how you say it. Come on, you try it too!",
    breakdown: [
      { word: "我", romanization: "wǒ", translation: "I / Me", tone: 3 },
      { word: "饿了", romanization: "è le", translation: "Hungry (now)", tone: 4 },
      { word: "就是", romanization: "jiù shì", translation: "That's exactly / Just is", tone: 4 },
      { word: "这样", romanization: "zhèyàng", translation: "Like this / This way", tone: 4 },
      { word: "说说看", romanization: "shuō shuō kàn", translation: "Try saying it", tone: 1 },
    ],
  },
  {
    id: "zh-d5",
    userText: "我饿了！",
    aiText: "太棒了！发音非常准确！要不要学一些食物词汇？",
    aiRomanization: "Tài bàng le! Fāyīn fēicháng zhǔnquè! Yào bu yào xué yīxiē shíwù cíhuì?",
    aiTranslation: "Excellent! Your pronunciation is very accurate! Do you want to learn some food vocabulary?",
    breakdown: [
      { word: "太棒了", romanization: "tài bàng le", translation: "Excellent! / Amazing!", tone: 4 },
      { word: "发音", romanization: "fāyīn", translation: "Pronunciation", tone: 1 },
      { word: "非常", romanization: "fēicháng", translation: "Extremely / Very", tone: 1 },
      { word: "准确", romanization: "zhǔnquè", translation: "Accurate", tone: 3 },
      { word: "食物词汇", romanization: "shíwù cíhuì", translation: "Food vocabulary", tone: 2 },
    ],
  },
  {
    id: "zh-d6",
    userText: "Yes please!",
    aiText: "好！我们从简单的开始。苹果、香蕉、米饭——跟我说！",
    aiRomanization: "Hǎo! Wǒmen cóng jiǎndān de kāishǐ. Píngguǒ, xiāngjiāo, mǐfàn — gēn wǒ shuō!",
    aiTranslation: "Great! Let's start with simple ones. Apple, banana, rice — repeat after me!",
    breakdown: [
      { word: "从...开始", romanization: "cóng...kāishǐ", translation: "Start from...", tone: 2 },
      { word: "苹果", romanization: "píngguǒ", translation: "Apple", tone: 2 },
      { word: "香蕉", romanization: "xiāngjiāo", translation: "Banana", tone: 1 },
      { word: "米饭", romanization: "mǐfàn", translation: "Cooked rice", tone: 3 },
      { word: "跟我说", romanization: "gēn wǒ shuō", translation: "Repeat after me", tone: 1 },
    ],
  },
]

// ─── Chinese: Restaurant ─────────────────────────────────────────────────────

const zhRestaurant: Exchange[] = [
  {
    id: "zh-r1",
    userText: "Hello, I'd like a table for two please.",
    aiText: "欢迎光临！两位？请跟我来，这边请坐！",
    aiRomanization: "Huānyíng guānglín! Liǎng wèi? Qǐng gēn wǒ lái, zhèbiān qǐng zuò!",
    aiTranslation: "Welcome! Two people? Please follow me, sit here!",
    breakdown: [
      { word: "欢迎光临", romanization: "huānyíng guānglín", translation: "Welcome (formal)", tone: 1 },
      { word: "两位", romanization: "liǎng wèi", translation: "Two guests", tone: 3 },
      { word: "跟我来", romanization: "gēn wǒ lái", translation: "Follow me", tone: 1 },
      { word: "这边", romanization: "zhèbiān", translation: "This side / Over here", tone: 4 },
      { word: "请坐", romanization: "qǐng zuò", translation: "Please sit", tone: 3 },
    ],
  },
  {
    id: "zh-r2",
    userText: "What do you recommend today?",
    aiText: "今天推荐我们的招牌菜——麻婆豆腐，非常好吃！",
    aiRomanization: "Jīntiān tuījiàn wǒmen de zhāopái cài — Mápó dòufu, fēicháng hǎochī!",
    aiTranslation: "Today I recommend our signature dish — Mapo Tofu, it's incredibly delicious!",
    breakdown: [
      { word: "今天", romanization: "jīntiān", translation: "Today", tone: 1 },
      { word: "推荐", romanization: "tuījiàn", translation: "Recommend", tone: 1 },
      { word: "招牌菜", romanization: "zhāopái cài", translation: "Signature dish", tone: 1 },
      { word: "麻婆豆腐", romanization: "mápó dòufu", translation: "Mapo Tofu", tone: 2 },
      { word: "好吃", romanization: "hǎochī", translation: "Delicious (lit. good eat)", tone: 3 },
    ],
  },
  {
    id: "zh-r3",
    userText: "I'll have the Mapo Tofu. Is it spicy?",
    aiText: "是的，很辣！但我们可以做不辣的版本。您喜欢哪种？",
    aiRomanization: "Shì de, hěn là! Dàn wǒmen kěyǐ zuò bù là de bǎnběn. Nín xǐhuān nǎ zhǒng?",
    aiTranslation: "Yes, it's very spicy! But we can make a non-spicy version. Which do you prefer?",
    breakdown: [
      { word: "很辣", romanization: "hěn là", translation: "Very spicy", tone: 3 },
      { word: "但", romanization: "dàn", translation: "But / However", tone: 4 },
      { word: "可以", romanization: "kěyǐ", translation: "Can / May", tone: 3 },
      { word: "不辣", romanization: "bù là", translation: "Not spicy", tone: 4 },
      { word: "版本", romanization: "bǎnběn", translation: "Version", tone: 3 },
    ],
  },
  {
    id: "zh-r4",
    userText: "Spicy please! And one pot of tea.",
    aiText: "好的！要绿茶还是红茶？我们的龙井茶很有名！",
    aiRomanization: "Hǎo de! Yào lǜchá háishì hóngchá? Wǒmen de Lóngjǐng chá hěn yǒumíng!",
    aiTranslation: "Great! Green tea or black tea? Our Longjing tea is very famous!",
    breakdown: [
      { word: "绿茶", romanization: "lǜchá", translation: "Green tea", tone: 4 },
      { word: "还是", romanization: "háishì", translation: "Or (choice)", tone: 2 },
      { word: "红茶", romanization: "hóngchá", translation: "Black tea (red tea)", tone: 2 },
      { word: "龙井茶", romanization: "lóngjǐng chá", translation: "Longjing / Dragon Well tea", tone: 2 },
      { word: "有名", romanization: "yǒumíng", translation: "Famous", tone: 3 },
    ],
  },
  {
    id: "zh-r5",
    userText: "Longjing tea please. How much is the bill?",
    aiText: "一共九十八块钱。您现金付款还是微信支付？",
    aiRomanization: "Yīgòng jiǔshí bā kuài qián. Nín xiànjīn fùkuǎn háishì Wēixìn zhīfù?",
    aiTranslation: "That's 98 yuan in total. Cash or WeChat Pay?",
    breakdown: [
      { word: "一共", romanization: "yīgòng", translation: "In total", tone: 1 },
      { word: "九十八", romanization: "jiǔshí bā", translation: "Ninety-eight", tone: 3 },
      { word: "块钱", romanization: "kuài qián", translation: "Yuan (money)", tone: 4 },
      { word: "现金", romanization: "xiànjīn", translation: "Cash", tone: 4 },
      { word: "微信支付", romanization: "wēixìn zhīfù", translation: "WeChat Pay", tone: 1 },
    ],
  },
]

// ─── Chinese: Greetings ──────────────────────────────────────────────────────

const zhGreetings: Exchange[] = [
  {
    id: "zh-g1",
    userText: "Good morning!",
    aiText: "早上好！今天天气不错啊！你叫什么名字？",
    aiRomanization: "Zǎoshang hǎo! Jīntiān tiānqì bùcuò a! Nǐ jiào shénme míngzì?",
    aiTranslation: "Good morning! The weather is nice today! What's your name?",
    breakdown: [
      { word: "早上好", romanization: "zǎoshang hǎo", translation: "Good morning", tone: 3 },
      { word: "天气", romanization: "tiānqì", translation: "Weather", tone: 1 },
      { word: "不错", romanization: "bùcuò", translation: "Pretty good / Not bad", tone: 4 },
      { word: "叫什么名字", romanization: "jiào shénme míngzì", translation: "What is (your) name?", tone: 4 },
    ],
  },
  {
    id: "zh-g2",
    userText: "My name is Alex. Nice to meet you!",
    aiText: "很高兴认识你，Alex！你从哪里来？",
    aiRomanization: "Hěn gāoxìng rènshí nǐ, Alex! Nǐ cóng nǎlǐ lái?",
    aiTranslation: "Very pleased to meet you, Alex! Where are you from?",
    breakdown: [
      { word: "很高兴", romanization: "hěn gāoxìng", translation: "Very pleased / Happy", tone: 3 },
      { word: "认识", romanization: "rènshí", translation: "To know / meet", tone: 4 },
      { word: "从哪里来", romanization: "cóng nǎlǐ lái", translation: "From where do you come?", tone: 2 },
    ],
  },
  {
    id: "zh-g3",
    userText: "I'm from England. I'm learning Chinese!",
    aiText: "哇，英国人！你的中文说得真不错！是在哪里学的？",
    aiRomanization: "Wā, Yīngguó rén! Nǐ de Zhōngwén shuō de zhēn bùcuò! Shì zài nǎlǐ xué de?",
    aiTranslation: "Wow, you're British! Your Chinese is really good! Where did you learn it?",
    breakdown: [
      { word: "哇", romanization: "wā", translation: "Wow!", tone: 1 },
      { word: "英国人", romanization: "yīngguó rén", translation: "British person", tone: 1 },
      { word: "中文", romanization: "zhōngwén", translation: "Chinese (language)", tone: 1 },
      { word: "说得真不错", romanization: "shuō de zhēn bùcuò", translation: "Speaking really well", tone: 1 },
    ],
  },
  {
    id: "zh-g4",
    userText: "I started learning online. It's fun!",
    aiText: "网络学习真方便！希望我们多交流，互相学习！",
    aiRomanization: "Wǎngluò xuéxí zhēn fāngbiàn! Xīwàng wǒmen duō jiāoliú, hùxiāng xuéxí!",
    aiTranslation: "Online learning is so convenient! I hope we can communicate more and learn from each other!",
    breakdown: [
      { word: "网络", romanization: "wǎngluò", translation: "Internet / Network", tone: 3 },
      { word: "方便", romanization: "fāngbiàn", translation: "Convenient", tone: 1 },
      { word: "交流", romanization: "jiāoliú", translation: "Communicate / Exchange", tone: 1 },
      { word: "互相", romanization: "hùxiāng", translation: "Mutually / Each other", tone: 4 },
    ],
  },
]

// ─── German: Default ─────────────────────────────────────────────────────────

const deDefault: Exchange[] = [
  {
    id: "de-d1",
    userText: "Hello! I want to practice my German.",
    aiText: "Hallo! Schön, dich kennenzulernen! Ich bin Lena. Wie heißt du?",
    aiTranslation: "Hello! Nice to meet you! I'm Lena. What's your name?",
    breakdown: [
      { word: "Schön", translation: "Beautiful / Nice", note: "adjective" },
      { word: "dich", translation: "You (accusative)", note: "informal 'you'" },
      { word: "kennenzulernen", translation: "To get to know", note: "infinitive, split verb" },
      { word: "Wie heißt du?", translation: "What is your name?", note: "informal" },
    ],
  },
  {
    id: "de-d2",
    userText: "My name is Alex. I'm from England.",
    aiText: "Hallo, Alex! Toll! Wie lange lernst du schon Deutsch?",
    aiTranslation: "Hello, Alex! Great! How long have you been learning German?",
    breakdown: [
      { word: "Toll", translation: "Great / Wonderful", note: "exclamation" },
      { word: "Wie lange", translation: "How long", note: "question phrase" },
      { word: "lernst du", translation: "Are you learning (you)", note: "present tense" },
      { word: "schon", translation: "Already", note: "adverb" },
    ],
  },
  {
    id: "de-d3",
    userText: "I've been learning for about two months.",
    aiText: "Zwei Monate! Das ist super! Dein Deutsch klingt schon sehr gut!",
    aiTranslation: "Two months! That's great! Your German already sounds very good!",
    breakdown: [
      { word: "Zwei Monate", translation: "Two months", note: "plural of Monat" },
      { word: "Das ist super", translation: "That is great", note: "neuter 'das'" },
      { word: "Dein Deutsch", translation: "Your German", note: "possessive + language" },
      { word: "klingt", translation: "Sounds", note: "klingen, 3rd person singular" },
      { word: "sehr gut", translation: "Very good", note: "adverb + adjective" },
    ],
  },
  {
    id: "de-d4",
    userText: "Thank you! How do I say 'I'm hungry' in German?",
    aiText: "Ich bin hungrig! So sagt man das auf Deutsch. Versuch mal!",
    aiTranslation: "I'm hungry! That's how you say it in German. Try it!",
    breakdown: [
      { word: "Ich bin", translation: "I am", note: "sein (to be)" },
      { word: "hungrig", translation: "Hungry", note: "adjective" },
      { word: "So sagt man das", translation: "That's how you say it", note: "impersonal 'man'" },
      { word: "Versuch mal", translation: "Try it!", note: "imperative + modal particle" },
    ],
  },
  {
    id: "de-d5",
    userText: "Ich bin hungrig!",
    aiText: "Perfekt! Ausgezeichnet! Willst du mehr Vokabeln lernen?",
    aiTranslation: "Perfect! Excellent! Do you want to learn more vocabulary?",
    breakdown: [
      { word: "Perfekt", translation: "Perfect", note: "exclamation" },
      { word: "Ausgezeichnet", translation: "Excellent", note: "strong adjective" },
      { word: "Willst du", translation: "Do you want", note: "wollen, informal 2nd person" },
      { word: "mehr Vokabeln", translation: "More vocabulary", note: "Vokabeln = plural" },
      { word: "lernen", translation: "To learn", note: "infinitive" },
    ],
  },
  {
    id: "de-d6",
    userText: "Yes please!",
    aiText: "Wunderbar! Fangen wir mit Essen an: Brot, Wasser, Kaffee. Wiederhole nach mir!",
    aiTranslation: "Wonderful! Let's start with food: bread, water, coffee. Repeat after me!",
    breakdown: [
      { word: "Wunderbar", translation: "Wonderful", note: "exclamation" },
      { word: "Fangen wir an", translation: "Let's start", note: "anfangen (separable verb)" },
      { word: "Brot", translation: "Bread", note: "neuter, das Brot" },
      { word: "Wasser", translation: "Water", note: "neuter, das Wasser" },
      { word: "Wiederhole nach mir", translation: "Repeat after me", note: "imperative" },
    ],
  },
]

// ─── German: Restaurant ──────────────────────────────────────────────────────

const deRestaurant: Exchange[] = [
  {
    id: "de-r1",
    userText: "Good evening! A table for two, please.",
    aiText: "Guten Abend! Herzlich willkommen! Haben Sie reserviert?",
    aiTranslation: "Good evening! A warm welcome! Did you have a reservation?",
    breakdown: [
      { word: "Guten Abend", translation: "Good evening", note: "formal greeting" },
      { word: "Herzlich willkommen", translation: "Warmly welcome", note: "herzlich = warmly" },
      { word: "Haben Sie reserviert", translation: "Did you reserve (formal)", note: "Sie = formal 'you'" },
    ],
  },
  {
    id: "de-r2",
    userText: "No, we don't have a reservation.",
    aiText: "Kein Problem! Wir haben noch Tische frei. Folgen Sie mir bitte!",
    aiTranslation: "No problem! We still have free tables. Please follow me!",
    breakdown: [
      { word: "Kein Problem", translation: "No problem", note: "kein = negation of noun" },
      { word: "noch Tische frei", translation: "Still have tables free", note: "frei = free/available" },
      { word: "Folgen Sie mir", translation: "Follow me (formal)", note: "polite imperative" },
    ],
  },
  {
    id: "de-r3",
    userText: "What do you recommend?",
    aiText: "Heute empfehle ich den Sauerbraten — unser Spezialität! Sehr beliebt!",
    aiTranslation: "Today I recommend the Sauerbraten — our specialty! Very popular!",
    breakdown: [
      { word: "Heute empfehle ich", translation: "Today I recommend", note: "empfehlen = to recommend" },
      { word: "den Sauerbraten", translation: "The Sauerbraten (braised beef)", note: "accusative case" },
      { word: "Spezialität", translation: "Specialty", note: "feminine noun" },
      { word: "Sehr beliebt", translation: "Very popular", note: "beliebt = beloved/popular" },
    ],
  },
  {
    id: "de-r4",
    userText: "I'll have the Sauerbraten. And a German beer!",
    aiText: "Sehr gerne! Welches Bier möchten Sie? Wir haben Hefeweizen und Pilsner.",
    aiTranslation: "With pleasure! Which beer would you like? We have Hefeweizen and Pilsner.",
    breakdown: [
      { word: "Sehr gerne", translation: "With great pleasure", note: "gerne = gladly" },
      { word: "Welches Bier", translation: "Which beer", note: "welch- = which" },
      { word: "möchten Sie", translation: "Would you like (formal)", note: "möchten = would like" },
      { word: "Hefeweizen", translation: "Wheat beer (yeast wheat)", note: "hefe = yeast, weizen = wheat" },
    ],
  },
  {
    id: "de-r5",
    userText: "A Hefeweizen please. Can I have the bill?",
    aiText: "Natürlich! Das macht zusammen neunzehn Euro. Bar oder mit Karte?",
    aiTranslation: "Of course! That comes to 19 euros total. Cash or card?",
    breakdown: [
      { word: "Natürlich", translation: "Of course / Naturally", note: "common filler" },
      { word: "Das macht zusammen", translation: "That comes to (in total)", note: "macht = makes" },
      { word: "neunzehn Euro", translation: "Nineteen euros", note: "neunzehn = 19" },
      { word: "Bar oder mit Karte", translation: "Cash or by card", note: "bar = cash" },
    ],
  },
]

// ─── German: Greetings ───────────────────────────────────────────────────────

const deGreetings: Exchange[] = [
  {
    id: "de-g1",
    userText: "Good morning!",
    aiText: "Guten Morgen! Wie geht es Ihnen heute?",
    aiTranslation: "Good morning! How are you today?",
    breakdown: [
      { word: "Guten Morgen", translation: "Good morning", note: "morning greeting" },
      { word: "Wie geht es Ihnen", translation: "How are you (formal)", note: "Ihnen = formal dative" },
      { word: "heute", translation: "Today", note: "adverb" },
    ],
  },
  {
    id: "de-g2",
    userText: "I'm doing well, thank you. And you?",
    aiText: "Mir geht es auch gut, danke! Schönes Wetter heute, oder?",
    aiTranslation: "I'm doing well too, thanks! Nice weather today, isn't it?",
    breakdown: [
      { word: "Mir geht es gut", translation: "I am doing well (lit. it goes well to me)", note: "dative 'mir'" },
      { word: "auch", translation: "Also / Too", note: "adverb" },
      { word: "Schönes Wetter", translation: "Nice weather", note: "neuter adjective + noun" },
      { word: "oder?", translation: "Right? / Isn't it?", note: "tag question" },
    ],
  },
  {
    id: "de-g3",
    userText: "Yes, lovely! I'm Alex by the way.",
    aiText: "Sehr angenehm! Ich bin Lena. Woher kommen Sie?",
    aiTranslation: "Very pleased to meet you! I'm Lena. Where are you from?",
    breakdown: [
      { word: "Sehr angenehm", translation: "Very pleasant / Pleased to meet you", note: "formal greeting" },
      { word: "Woher kommen Sie", translation: "Where do you come from (formal)", note: "woher = from where" },
    ],
  },
  {
    id: "de-g4",
    userText: "I'm from England. Nice to meet you!",
    aiText: "England! Wie interessant! Sprechen Sie noch andere Sprachen?",
    aiTranslation: "England! How interesting! Do you speak any other languages?",
    breakdown: [
      { word: "Wie interessant", translation: "How interesting", note: "exclamation with wie" },
      { word: "Sprechen Sie", translation: "Do you speak (formal)", note: "sprechen = to speak" },
      { word: "noch andere", translation: "Any other / Still more", note: "noch = still/even" },
      { word: "Sprachen", translation: "Languages", note: "plural of Sprache" },
    ],
  },
]

// ─── Exports ─────────────────────────────────────────────────────────────────

const exchangeMap: Record<Language, Record<string, Exchange[]>> = {
  zh: {
    default: zhDefault,
    restaurant: zhRestaurant,
    greetings: zhGreetings,
    // Other themes fall back to default
  },
  de: {
    default: deDefault,
    restaurant: deRestaurant,
    greetings: deGreetings,
  },
}

export function getExchanges(lang: Language, themeId: string | null): Exchange[] {
  const themeMap = exchangeMap[lang]
  if (themeId && themeMap[themeId]) return themeMap[themeId]
  return themeMap.default
}
