import { useEffect, useState } from 'react';
import { MessageSquare, Shield, Clock, MapPin, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { messageStore } from '@/lib/storage';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';

interface CivilianAlert {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  type: 'attack' | 'general' | 'instruction';
  locationName?: string;
}

interface GovResponse {
  id: string;
  alertId: string;
  text: string;
  sender: string;
  timestamp: string;
  locationName?: string;
}

interface CivilianReply {
  id: string;
  alertId: string;
  text: string;
  sender: string;
  timestamp: string;
  role: 'civilian';
}

interface ConversationThread {
  alert: CivilianAlert;
  responses: GovResponse[];
  civilianReplies: CivilianReply[];
}

export default function CivilianDirectChat() {
  const { user, language } = useApp();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ConversationThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<ConversationThread | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const loadConversations = async () => {
      // Load all alerts sent by this civilian
      const myAlerts: CivilianAlert[] = [];
      await messageStore.iterate((value: any, key: string) => {
        if (key?.startsWith('govchat_') && value.sender === user?.displayName) {
          myAlerts.push({
            id: value.id,
            text: value.text,
            sender: value.sender,
            timestamp: value.timestamp,
            type: value.type,
            locationName: value.locationName,
          });
        }
      });

      // For each alert, find government responses and civilian replies
      const threads: ConversationThread[] = [];
      for (const alert of myAlerts) {
        const responses: GovResponse[] = [];
        const civilianReplies: CivilianReply[] = [];
        
        await messageStore.iterate((value: any, key: string) => {
          if (key?.startsWith('govresponse_') && value.alertId === alert.id) {
            responses.push({
              id: value.id,
              alertId: value.alertId,
              text: value.text,
              sender: value.sender || 'Government Command',
              timestamp: value.timestamp,
              locationName: value.locationName,
            });
          }
          if (key?.startsWith('civilian_reply_') && value.alertId === alert.id) {
            civilianReplies.push({
              id: value.id,
              alertId: value.alertId,
              text: value.text,
              sender: value.sender,
              timestamp: value.timestamp,
              role: 'civilian',
            });
          }
        });

        // Only include threads that have government responses
        if (responses.length > 0) {
          threads.push({
            alert,
            responses: responses.sort((a, b) => 
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            ),
            civilianReplies: civilianReplies.sort((a, b) => 
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            ),
          });
        }
      }

      // Sort by most recent response
      threads.sort((a, b) => {
        const aLatest = a.responses[a.responses.length - 1]?.timestamp || a.alert.timestamp;
        const bLatest = b.responses[b.responses.length - 1]?.timestamp || b.alert.timestamp;
        return new Date(bLatest).getTime() - new Date(aLatest).getTime();
      });

      setConversations(threads);

      // Auto-select first thread if none selected
      if (!selectedThread && threads.length > 0) {
        setSelectedThread(threads[0]);
      }
    };

    loadConversations();

    const handleUpdate = () => loadConversations();
    window.addEventListener('govchat:updated', handleUpdate);
    window.addEventListener('govresponse:updated', handleUpdate);
    window.addEventListener('civilian-reply:updated', handleUpdate);
    const intervalId = window.setInterval(loadConversations, 3000);

    return () => {
      window.removeEventListener('govchat:updated', handleUpdate);
      window.removeEventListener('govresponse:updated', handleUpdate);
      window.removeEventListener('civilian-reply:updated', handleUpdate);
      window.clearInterval(intervalId);
    };
  }, [user?.displayName, selectedThread]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || isSending || !selectedThread) return;

    setIsSending(true);
    const id = Date.now().toString();

    const replyData: CivilianReply = {
      id,
      alertId: selectedThread.alert.id,
      text: replyText.trim(),
      sender: user?.displayName || 'Civilian',
      timestamp: new Date().toISOString(),
      role: 'civilian',
    };

    try {
      await messageStore.setItem(`civilian_reply_${id}`, replyData);
      
      // Trigger update events
      window.dispatchEvent(new CustomEvent('civilian-reply:updated'));
      window.dispatchEvent(new CustomEvent('govchat:updated'));
      
      setReplyText('');
      toast({
        title: 'Reply Sent',
        description: 'Your response has been sent to the government.',
      });
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to send reply. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="p-6 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Direct Chat from Government</h1>
            <p className="text-sm text-muted-foreground">
              View government responses to your reports
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left: Conversation List */}
        <Card className="w-96 flex flex-col rounded-none border-l-0 border-t-0 border-b-0">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center justify-between">
              <span>Your Conversations</span>
              <Badge variant="default">{conversations.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-4">
            <div className="space-y-3">
              {conversations.length === 0 && (
                <p className="text-center text-muted-foreground py-10 italic">
                  No government responses yet
                </p>
              )}
              {conversations.map((thread) => (
                <Card
                  key={thread.alert.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedThread?.alert.id === thread.alert.id
                      ? 'border-primary border-2'
                      : ''
                  }`}
                  onClick={() => setSelectedThread(thread)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge
                        variant={
                          thread.alert.type === 'attack'
                            ? 'destructive'
                            : 'default'
                        }
                      >
                        {thread.alert.type.toUpperCase()}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {thread.responses.length} replies
                      </Badge>
                    </div>
                    {thread.alert.locationName && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3" />
                        {thread.alert.locationName}
                      </div>
                    )}
                    <p className="text-sm line-clamp-2 mb-2">{thread.alert.text}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Last reply:{' '}
                      {new Date(
                        thread.responses[thread.responses.length - 1].timestamp
                      ).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right: Conversation Thread */}
        <Card className="flex-1 flex flex-col rounded-none border-0">
          <CardHeader className="flex-shrink-0 border-b">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {selectedThread ? (
                <span>
                  Conversation: {selectedThread.alert.type.toUpperCase()}
                  {selectedThread.alert.locationName && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      {selectedThread.alert.locationName}
                    </span>
                  )}
                </span>
              ) : (
                <span>Select a conversation</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-6">
            {!selectedThread ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground italic">
                  Select a conversation to view government responses
                </p>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="space-y-4 pb-4">
                  {/* Your Original Report */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">YOUR REPORT</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(selectedThread.alert.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <Card className="bg-muted/30">
                      <CardContent className="pt-4">
                        <p className="text-sm">{selectedThread.alert.text}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Separator className="my-4" />

                  {/* Conversation Thread - Interleaved responses and replies */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm">Conversation</span>
                    </div>
                    <div className="space-y-3">
                      {/* Merge and sort all messages by timestamp */}
                      {[...selectedThread.responses.map(r => ({ ...r, type: 'gov' as const })),
                        ...selectedThread.civilianReplies.map(r => ({ ...r, type: 'civilian' as const }))]
                        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                        .map((message) => (
                          <div key={message.id}>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={message.type === 'gov' ? 'default' : 'outline'}>
                                {message.type === 'gov' ? 'GOVERNMENT' : 'YOU'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {message.sender}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                · {new Date(message.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <Card className={message.type === 'gov' ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'}>
                              <CardContent className="pt-4">
                                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                              </CardContent>
                            </Card>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            )}
          </CardContent>
          
          {/* Reply Input - Only show if thread is selected */}
          {selectedThread && (
            <div className="border-t p-4 flex-shrink-0">
              <form onSubmit={handleSendReply} className="flex gap-2">
                <Input
                  placeholder="Type your reply to government..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  disabled={isSending}
                  className="flex-1"
                />
                <Button type="submit" disabled={isSending || !replyText.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </form>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
