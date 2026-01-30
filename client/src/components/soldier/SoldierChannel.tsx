import { useState, useEffect } from 'react';
import { Radio, Plus, Send, Shield, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import EncryptedMessage from '@/components/EncryptedMessage';
import { encryptMessage } from '@/lib/encryption';
import { useApp } from '@/contexts/AppContext';
import { messageStore } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

export default function SoldierChannel() {
  const { language, user } = useApp();
  const { toast } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

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
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const id = Date.now().toString();
    const messageData = {
      id,
      text: newMessage,
      sender: user?.displayName || 'Soldier Command',
      timestamp: new Date().toISOString(),
      type: 'channel'
    };

    await messageStore.setItem(`channel_${id}`, messageData);
    setMessages([messageData, ...messages]);
    setNewMessage('');
    setIsSending(false);
    toast({ title: "Message Broadcasted", description: "Sent to all units and civilians" });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Radio className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-tactical font-bold">Important Channel</h1>
        </div>
      </div>

      <Card className="mb-6 border-primary/20 bg-muted/30">
        <CardContent className="pt-6">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Broadcast emergency update..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="pr-10"
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <Button type="submit" disabled={isSending}>
              <Send className="h-4 w-4 mr-2" />
              Broadcast
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4 overflow-auto flex-1 pb-6">
        {messages.length === 0 && (
          <p className="text-center text-muted-foreground py-10 italic">No broadcasted messages yet.</p>
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
