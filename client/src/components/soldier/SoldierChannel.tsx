import { Radio, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EncryptedMessage from '@/components/EncryptedMessage';
import { encryptMessage } from '@/lib/encryption';
import { useApp } from '@/contexts/AppContext';

export default function SoldierChannel() {
  const { language } = useApp();
  
  const messages = [
    { text: "All units: Evacuation protocol active in Sector 7. Proceed with caution.", sender: "Command", time: "5 min ago" },
    { text: "Medical supplies required at District Hospital emergency wing.", sender: "Medic-02", time: "20 min ago" },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Radio className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-tactical font-bold">Important Channel</h1>
        </div>
        <Button data-testid="button-add-channel-message">
          <Plus className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>
      <div className="space-y-4">
        {messages.map((msg, idx) => (
          <EncryptedMessage
            key={idx}
            encrypted={encryptMessage(msg.text)}
            sender={msg.sender}
            timestamp={msg.time}
            currentLang={language}
          />
        ))}
      </div>
    </div>
  );
}
