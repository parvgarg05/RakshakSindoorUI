import { useState } from 'react';
import { Lock, Unlock, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { decryptMessage } from '@/lib/encryption';
import { getTranslation, type Language } from '@/lib/i18n';

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
  const decrypted = isDecrypted ? decryptMessage(encrypted) : encrypted;

  return (
    <Card className="p-4 hover-elevate" data-testid="card-encrypted-message">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={isDecrypted ? 'default' : 'secondary'} className="gap-1">
              {isDecrypted ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
              {isDecrypted ? getTranslation(currentLang, 'decrypted') : getTranslation(currentLang, 'encrypted')}
            </Badge>
            <span className="text-xs text-muted-foreground">{sender}</span>
            <span className="text-xs text-muted-foreground">{timestamp}</span>
          </div>
          <p className={`text-sm ${isDecrypted ? 'font-normal' : 'font-mono text-xs blur-[2px]'}`} data-testid="text-message-content">
            {decrypted}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setIsDecrypted(!isDecrypted)}
            data-testid="button-toggle-decrypt"
          >
            <Languages className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
