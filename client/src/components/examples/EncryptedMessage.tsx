import EncryptedMessage from '../EncryptedMessage';
import { encryptMessage } from '@/lib/encryption';
import { AppProvider } from '@/contexts/AppContext';

export default function EncryptedMessageExample() {
  const message = "Evacuation required at sector 7. Proceed to safe zone Alpha immediately.";
  const encrypted = encryptMessage(message);

  return (
    <AppProvider>
      <div className="p-4 space-y-4">
        <EncryptedMessage 
          encrypted={encrypted}
          sender="Soldier-001"
          timestamp="2min ago"
          currentLang="en"
        />
      </div>
    </AppProvider>
  );
}
