import { useState } from 'react';
import { Lock, Unlock, Languages, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { decryptMessage } from '@/lib/encryption';
import { getTranslation, type Language } from '@/lib/i18n';
import { translateMessageCached, detectLanguage } from '@/lib/messageTranslation';

interface EncryptedMessageProps {
  encrypted: string;
  sender: string;
  timestamp: string;
  currentLang: Language;
  onTranslate?: () => void;
}

export default function EncryptedMessage({ 
  encrypted, 
  sender, 
  timestamp, 
  currentLang,
  onTranslate 
}: EncryptedMessageProps) {
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState<Language>('en');

  const decrypted = isDecrypted ? decryptMessage(encrypted) : encrypted;
  const displayText = translatedText || decrypted;

  const handleDecrypt = () => {
    setIsDecrypted(!isDecrypted);
    // Reset translation when decrypting/encrypting
    if (isDecrypted) {
      setTranslatedText(null);
    }
  };

  const handleTranslate = async () => {
    if (!isDecrypted) {
      alert('Please decrypt message first to translate');
      return;
    }

    if (translatedText) {
      // If already translated, toggle back to original
      setTranslatedText(null);
      return;
    }

    setIsTranslating(true);
    try {
      // Detect source language from decrypted text
      const detectedLang = await detectLanguage(decrypted);
      setSourceLanguage(detectedLang);

      // Translate to current language
      if (detectedLang !== currentLang) {
        const translated = await translateMessageCached(
          decrypted,
          currentLang,
          detectedLang
        );
        setTranslatedText(translated);
      } else {
        alert('Message is already in selected language');
      }
    } catch (error) {
      console.error('Translation failed:', error);
      alert('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <Card className="p-4 hover-elevate" data-testid="card-encrypted-message">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant={isDecrypted ? 'default' : 'secondary'} className="gap-1">
              {isDecrypted ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
              {isDecrypted ? getTranslation(currentLang, 'decrypted') : getTranslation(currentLang, 'encrypted')}
            </Badge>
            {translatedText && (
              <Badge variant="outline" className="gap-1 text-xs">
                {getTranslation(currentLang, 'translate')}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">{sender}</span>
            <span className="text-xs text-muted-foreground">{timestamp}</span>
          </div>
          <p className={`text-sm break-words ${!isDecrypted ? 'font-mono text-xs blur-[2px]' : 'font-normal'}`} data-testid="text-message-content">
            {displayText}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleDecrypt}
            data-testid="button-toggle-decrypt"
            title={isDecrypted ? 'Encrypt' : 'Decrypt'}
          >
            <Lock className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleTranslate}
            disabled={!isDecrypted || isTranslating}
            data-testid="button-translate"
            title={translatedText ? 'Show original' : `Translate to ${currentLang}`}
          >
            {isTranslating ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Languages className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
