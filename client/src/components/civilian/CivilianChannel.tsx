import { useState, useEffect } from 'react';
import { Radio } from 'lucide-react';
import EncryptedMessage from '@/components/EncryptedMessage';
import { encryptMessage } from '@/lib/encryption';
import { useApp } from '@/contexts/AppContext';
import { messageStore } from '@/lib/storage';

export default function CivilianChannel() {
  const { language } = useApp();
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const loadMessages = async () => {
      const all: any[] = [];
      await messageStore.iterate((value: any, key) => {
        if (key.startsWith('channel_')) {
          all.push(value);
        }
      });
      setMessages(all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    };
    loadMessages();

    // Polling for demo purposes
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <Radio className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Important Channel</h1>
      </div>
      <div className="space-y-4 overflow-auto flex-1 pb-6">
        {messages.length === 0 && (
          <p className="text-center text-muted-foreground py-10 italic">No channel broadcasts yet.</p>
        )}
        {messages.map((msg) => (
          <EncryptedMessage
            key={msg.id}
            encrypted={encryptMessage(msg.text)}
            sender={msg.sender}
            timestamp={new Date(msg.timestamp).toLocaleTimeString()}
            currentLang={language}
          />
        ))}
      </div>
    </div>
  );
}
