import { MessageSquare } from 'lucide-react';

export default function SoldierMessages() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-tactical font-bold">Messages</h1>
      </div>
      <p className="text-muted-foreground">Encrypted messaging interface</p>
    </div>
  );
}
