import { useState } from 'react';
import { Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getTranslation, type Language } from '@/lib/i18n';

interface LoginFormProps {
  role: 'soldier' | 'civilian';
  language: Language;
  onLogin: (username: string, password: string, rememberMe: boolean) => void;
  onBack?: () => void;
  onSwitchToSignup?: () => void;
}

export default function LoginForm({ role, language, onLogin, onBack, onSwitchToSignup }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password, rememberMe);
  };

  const isSoldier = role === 'soldier';

  return (
    <Card className={`w-full max-w-md ${isSoldier ? 'dark border-primary' : ''}`}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          {isSoldier ? (
            <Shield className="h-16 w-16 text-primary" />
          ) : (
            <User className="h-16 w-16 text-primary" />
          )}
        </div>
        <CardTitle className={isSoldier ? 'font-tactical text-2xl' : 'text-2xl'}>
          {getTranslation(language, isSoldier ? 'soldierPortal' : 'civilianPortal')}
        </CardTitle>
        <CardDescription>
          {getTranslation(language, 'login')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">{getTranslation(language, 'username')}</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              data-testid="input-username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{getTranslation(language, 'password')}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              data-testid="input-password"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              data-testid="checkbox-remember-me"
            />
            <Label htmlFor="remember" className="cursor-pointer">
              {getTranslation(language, 'rememberMe')}
            </Label>
          </div>
          <div className="flex flex-col gap-2">
            <Button type="submit" className="w-full" data-testid="button-login-submit">
              {getTranslation(language, 'login')}
            </Button>
            
            <div className="flex gap-2">
              {onBack && (
                <Button type="button" variant="outline" onClick={onBack} className="flex-1" data-testid="button-back">
                  Back
                </Button>
              )}
              {onSwitchToSignup && (
                <Button type="button" variant="ghost" onClick={onSwitchToSignup} className="flex-1" data-testid="button-switch-to-signup">
                  Create Account
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
