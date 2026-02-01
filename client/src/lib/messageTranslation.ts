/**
 * Message Translation Service
 * Translates user-generated content (encrypted messages) to different languages
 * Uses free translation APIs
 */

export type Language = 'en' | 'hi' | 'ur' | 'pa';

// Language codes for translation APIs
const languageCodeMap: Record<Language, string> = {
  en: 'en',
  hi: 'hi',
  ur: 'ur',
  pa: 'pa',
};

/**
 * Translate message content to target language
 * Uses MyMemory Translation API (free, no API key required)
 * @param text - Text to translate
 * @param targetLang - Target language code
 * @param sourceLang - Source language code (default: 'en')
 * @returns Promise resolving to translated text
 */
export async function translateMessage(
  text: string,
  targetLang: Language,
  sourceLang: Language = 'en'
): Promise<string> {
  // If source and target are same, return original text
  if (sourceLang === targetLang) {
    return text;
  }

  // If text is empty, return it as is
  if (!text.trim()) {
    return text;
  }

  try {
    const sourceCode = languageCodeMap[sourceLang];
    const targetCode = languageCodeMap[targetLang];

    // Use MyMemory Translation API (free, no API key)
    const encodedText = encodeURIComponent(text);
    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${sourceCode}|${targetCode}`;

    const response = await fetch(url);
    const data = await response.json();

    // Check if translation was successful
    if (data.responseStatus === 200 && data.responseData.translatedText) {
      return data.responseData.translatedText;
    }

    // If translation fails, return original text
    console.warn('Translation failed for:', text);
    return text;
  } catch (error) {
    console.error('Translation error:', error);
    // Return original text on error
    return text;
  }
}

/**
 * Detect language of text
 * Uses free language detection
 * @param text - Text to detect language for
 * @returns Detected language code
 */
export async function detectLanguage(text: string): Promise<Language> {
  if (!text.trim()) {
    return 'en';
  }

  try {
    // Simple pattern-based detection for common scripts
    // Hindi script detection
    if (/[\u0900-\u097F]/.test(text)) {
      return 'hi';
    }

    // Urdu script detection
    if (/[\u0600-\u06FF]/.test(text)) {
      return 'ur';
    }

    // Punjabi script detection
    if (/[\u0A00-\u0A7F]/.test(text)) {
      return 'pa';
    }

    // Default to English
    return 'en';
  } catch (error) {
    console.error('Language detection error:', error);
    return 'en';
  }
}

/**
 * Translate message to multiple languages
 * Useful for creating multilingual versions
 * @param text - Text to translate
 * @param targetLanguages - Target languages
 * @param sourceLang - Source language
 * @returns Promise resolving to object with translations
 */
export async function translateToMultiple(
  text: string,
  targetLanguages: Language[],
  sourceLang: Language = 'en'
): Promise<Record<Language, string>> {
  const results: Record<Language, string> = {
    en: text,
    hi: text,
    ur: text,
    pa: text,
  };

  // Translate to each target language
  const promises = targetLanguages.map(async (lang) => {
    if (lang === sourceLang) {
      results[lang] = text;
    } else {
      results[lang] = await translateMessage(text, lang, sourceLang);
    }
  });

  await Promise.all(promises);

  return results;
}

/**
 * Cache for translations to avoid repeated API calls
 * Uses localStorage for persistence
 */
class TranslationCache {
  private cacheKey = 'rakshak_message_translations';

  get(): Record<string, string> {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  }

  set(key: string, value: string): void {
    try {
      const cache = this.get();
      cache[key] = value;
      localStorage.setItem(this.cacheKey, JSON.stringify(cache));
    } catch {
      console.warn('Failed to cache translation');
    }
  }

  getTranslation(originalText: string, targetLang: Language): string | null {
    const cache = this.get();
    const cacheKey = `${originalText}|${targetLang}`;
    return cache[cacheKey] || null;
  }

  setTranslation(originalText: string, targetLang: Language, translation: string): void {
    const cacheKey = `${originalText}|${targetLang}`;
    this.set(cacheKey, translation);
  }
}

export const translationCache = new TranslationCache();

/**
 * Translate message with caching
 * @param text - Text to translate
 * @param targetLang - Target language
 * @param sourceLang - Source language
 * @returns Promise resolving to translated text
 */
export async function translateMessageCached(
  text: string,
  targetLang: Language,
  sourceLang: Language = 'en'
): Promise<string> {
  // Check cache first
  const cached = translationCache.getTranslation(text, targetLang);
  if (cached) {
    return cached;
  }

  // Translate and cache
  const translated = await translateMessage(text, targetLang, sourceLang);
  translationCache.setTranslation(text, targetLang, translated);

  return translated;
}
