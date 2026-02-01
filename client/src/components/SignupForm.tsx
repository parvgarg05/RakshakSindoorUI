import { useState } from 'react';
import { Shield, User, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getTranslation, type Language } from '@/lib/i18n';
import { Progress } from '@/components/ui/progress';

interface SignupFormProps {
  role: 'government' | 'civilian';
  language: Language;
  onSignup: (username: string, password: string, displayName: string, rememberMe: boolean) => void;
  onBack?: () => void;
  onSwitchToLogin?: () => void;
}

function calculatePasswordStrength(password: string): { score: number; feedback: string } {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score += 25;
  else feedback.push('At least 8 characters');

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 25;
  else feedback.push('Upper & lowercase letters');

  if (/\d/.test(password)) score += 25;
  else feedback.push('At least one number');

  if (/[^a-zA-Z0-9]/.test(password)) score += 25;
  else feedback.push('Special character (!@#$%)');

  const feedbackText = feedback.length > 0 ? `Missing: ${feedback.join(', ')}` : 'Strong password!';
  return { score, feedback: feedbackText };
}

export default function SignupForm({ role, language, onSignup, onBack, onSwitchToLogin }: SignupFormProps) {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const passwordStrength = calculatePasswordStrength(password);
  const isGovernment = role === 'government';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (displayName.length < 2) {
      newErrors.displayName = 'Display name must be at least 2 characters';
    }

    if (passwordStrength.score < 75) {
      newErrors.password = 'Password is too weak. ' + passwordStrength.feedback;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSignup(username, password, displayName, rememberMe);
  };

  const getStrengthColor = (score: number) => {
    if (score < 50) return 'bg-destructive';
    if (score < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = (score: number) => {
    if (score < 50) return 'Weak';
    if (score < 75) return 'Medium';
    return 'Strong';
  };

  return (
    <Card className={`w-full max-w-md ${isGovernment ? 'border-primary' : ''}`}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          {isGovernment ? (
            <Shield className="h-16 w-16 text-primary" />
          ) : (
            <User className="h-16 w-16 text-primary" />
          )}
        </div>
        <CardTitle className={isGovernment ? 'font-tactical text-2xl' : 'text-2xl'}>
          {getTranslation(language, isGovernment ? 'governmentPortal' : 'civilianPortal')}
        </CardTitle>
        <CardDescription>
          Create your account
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
              data-testid="input-signup-username"
              placeholder="Choose a unique username"
            />
            {errors.username && (
              <p className="text-sm text-destructive" data-testid="text-error-username">{errors.username}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              data-testid="input-signup-displayname"
              placeholder="Your name as shown to others"
            />
            {errors.displayName && (
              <p className="text-sm text-destructive" data-testid="text-error-displayname">{errors.displayName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{getTranslation(language, 'password')}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="input-signup-password"
                placeholder="Create a strong password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowPassword(!showPassword)}
                data-testid="button-toggle-password"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {password && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Password Strength:</span>
                  <span className={`font-medium ${passwordStrength.score >= 75 ? 'text-green-500' : passwordStrength.score >= 50 ? 'text-yellow-500' : 'text-destructive'}`}>
                    {getStrengthLabel(passwordStrength.score)}
                  </span>
                </div>
                <Progress 
                  value={passwordStrength.score} 
                  className="h-2"
                  data-testid="progress-password-strength"
                />
                <p className="text-xs text-muted-foreground" data-testid="text-password-feedback">
                  {passwordStrength.feedback}
                </p>
              </div>
            )}
            {errors.password && (
              <p className="text-sm text-destructive" data-testid="text-error-password">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                data-testid="input-signup-confirm-password"
                placeholder="Re-enter your password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                data-testid="button-toggle-confirm-password"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive" data-testid="text-error-confirm-password">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              data-testid="checkbox-remember-me"
            />
            <Label htmlFor="rememberMe" className="text-sm cursor-pointer">
              Remember me on this device
            </Label>
          </div>

          <div className="flex flex-col gap-2">
            <Button 
              type="submit" 
              className="w-full"
              data-testid="button-signup"
            >
              Create Account
            </Button>
            
            <div className="flex gap-2">
              {onBack && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="flex-1"
                  data-testid="button-back"
                >
                  Back
                </Button>
              )}
              {onSwitchToLogin && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onSwitchToLogin}
                  className="flex-1"
                  data-testid="button-switch-to-login"
                >
                  Already have an account? Login
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
