import { useState, useEffect } from 'react';
import { MessageSquare, Shield, Lock, Unlock } from 'lucide-react';
import { messageStore } from '@/lib/storage';
import { decryptMessage } from '@/lib/encryption';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AlertMessage {
  id: string;
  encrypted: string;
  timestamp: string;
  sender: string;
  type: string;
}

export default function CivilianMessages() {
  const [messages, setMessages] = useState<AlertMessage[]>([]);

  useEffect(() => {
    const loadMessages = async () => {
      const allMessages: AlertMessage[] = [];
      await messageStore.iterate((value: AlertMessage) => {
        allMessages.push(value);
      });
      setMessages(allMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    };
    loadMessages();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Emergency Messages</h1>
      </div>
      
      <div className="space-y-4">
        {messages.length === 0 ? (
          <p className="text-muted-foreground text-center py-10">No emergency messages received.</p>
        ) : (
          messages.map((msg) => (
            <Card key={msg.id} className="border-l-4 border-l-primary">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">{msg.sender}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] gap-1">
                    <Lock className="h-3 w-3" />
                    ENCRYPTED
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-muted/30 p-3 rounded-md border border-dashed">
                  <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground uppercase tracking-wider">
                    <Unlock className="h-3 w-3" />
                    Decrypted Content
                  </div>
                  <p className="text-sm font-medium">
                    {decryptMessage(msg.encrypted)}
                  </p>
                </div>
                <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                  <span>Secured by Rakshak Sindoor</span>
                  <span>{new Date(msg.timestamp).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
