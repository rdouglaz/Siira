import { Language, ThemeContent, Difficulty } from "./types";

const THEME_GENERATION_PROMPT = (language: Language, difficulty: Difficulty) => {
  const langName = language === "zh" ? "Mandarin Chinese" : "German";
  const langCode = language === "zh" ? "zh" : "de";
  
  const difficultyGuidance = difficulty === "Beginner" 
    ? "Use simple, high-frequency vocabulary. Keep sentences short (4-8 words). Focus on present tense and basic sentence patterns."
    : "Use intermediate vocabulary with some variety. Include past tense, modal verbs, and slightly longer sentences (8-12 words).";

  const languageSpecificGuidance = language === "zh"
    ? `CHINESE-SPECIFIC REQUIREMENTS:
- Include pinyin with tone numbers (1-4) for ALL Chinese words
- Mark neutral tone as 0
- For vocabulary: provide character, pinyin, tone, translation, part of speech
- For practice sentences: Chinese characters + pinyin + English
- Common mistakes should include tone errors, word order, measure words
- Cultural notes: mention relevant Chinese customs/etiquette`
    : `GERMAN-SPECIFIC REQUIREMENTS:
- Include phonetic pronunciation guide for German words
- For vocabulary: provide German word (with article der/die/das), phonetic, translation, part of speech, gender
- For practice sentences: German + phonetic + English
- Common mistakes should include gender, case (nominative/accusative/dative), verb position, separable verbs
- Cultural notes: mention relevant German customs/formality`;

  return `You are an expert language curriculum designer creating a daily practice theme for ${langName} learners at ${difficulty} level.

${difficultyGuidance}
${languageSpecificGuidance}

GENERATE A COMPLETE THEME as valid JSON with this exact structure:

{
  "title": "Short, engaging theme title (max 40 chars)",
  "description": "2-3 sentence description of what learners will practice",
  "difficulty": "${difficulty}",
  "learningObjectives": [
    "Can-do statement 1",
    "Can-do statement 2", 
    "Can-do statement 3",
    "Can-do statement 4"
  ],
  "keyVocabulary": [
    {
      "word": "word in ${langName}",
      "romanization": "pinyin/phonetic",
      "translation": "English meaning",
      "partOfSpeech": "noun/verb/adjective/etc",
      "tone": 1,
      "audioHint": "pronunciation tip"
    }
  ],
  "cues": [
    {
      "id": "cue-1",
      "order": 1,
      "title": "Short cue title",
      "description": "What this cue practices",
      "scenario": "Role-play setup in English",
      "targetLanguage": "Phrase in ${langName}",
      "romanization": "pinyin/phonetic",
      "translation": "English meaning",
      "keyVocabulary": ["vocab-word-1", "vocab-word-2"],
      "difficulty": "easy",
      "tips": ["Tip 1", "Tip 2"]
    }
  ],
  "practiceSentences": [
    {
      "text": "Sentence in ${langName}",
      "romanization": "pinyin/phonetic",
      "translation": "English",
      "difficulty": "easy"
    }
  ],
  "commonMistakes": [
    {
      "incorrect": "Wrong form",
      "correct": "Right form",
      "romanization": "pinyin/phonetic",
      "explanation": "Why it's wrong",
      "tip": "Memory aid"
    }
  ],
  "culturalNotes": "Optional cultural context"
}

REQUIREMENTS:
- 8-12 vocabulary items
- 4-6 progressive cues (easy → medium → hard)
- 4-6 practice sentences
- 3-4 common mistakes
- For Chinese: ALL vocabulary MUST have tone (1-4 or 0)
- For German: ALL vocabulary MUST have gender (der/die/das)
- Cues should progress logically (greeting → main interaction → closing)
- Return ONLY valid JSON, no markdown, no extra text`;
};

export function getThemeGenerationPrompt(language: Language, difficulty: Difficulty): string {
  return THEME_GENERATION_PROMPT(language, difficulty);
}

export function parseThemeResponse(response: string): ThemeContent | null {
  try {
    // Clean up potential markdown code blocks
    const cleaned = response
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    
    const parsed = JSON.parse(cleaned);
    
    // Validate required fields
    if (!parsed.title || !parsed.cues || !Array.isArray(parsed.cues)) {
      console.error("Invalid theme response: missing required fields");
      return null;
    }
    
    return parsed as ThemeContent;
  } catch (error) {
    console.error("Failed to parse theme response:", error);
    return null;
  }
}

export function validateThemeContent(content: ThemeContent): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!content.title || content.title.length > 50) {
    errors.push("Title missing or too long");
  }
  
  if (!content.keyVocabulary || content.keyVocabulary.length < 8) {
    errors.push("Need at least 8 vocabulary items");
  }
  
  if (!content.cues || content.cues.length < 4) {
    errors.push("Need at least 4 cues");
  }
  
  if (!content.practiceSentences || content.practiceSentences.length < 4) {
    errors.push("Need at least 4 practice sentences");
  }
  
  if (!content.commonMistakes || content.commonMistakes.length < 3) {
    errors.push("Need at least 3 common mistakes");
  }
  
  return { valid: errors.length === 0, errors };
}