import { Radio } from 'lucide-react';
import EncryptedMessage from '@/components/EncryptedMessage';
import { encryptMessage } from '@/lib/encryption';
import { useApp } from '@/contexts/AppContext';

export default function CivilianChannel() {
  const { language } = useApp();
  
  const messages = [
    { text: "Evacuation required in your area. Proceed to Safe Zone Alpha immediately.", sender: "Soldier-001", time: "5 min ago" },
    { text: "Medical supplies available at District Hospital. No appointment needed.", sender: "Command", time: "1 hour ago" },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Radio className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Important Channel</h1>
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
