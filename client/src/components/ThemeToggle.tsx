import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';

export default function ThemeToggle() {
  const { theme, setTheme } = useApp();

  const isDark = theme === 'dark';

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      data-testid="button-theme-toggle"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`relative h-10 w-10 rounded-full border transition-all duration-200 ${
        isDark
          ? 'border-border bg-slate-900 text-slate-100 hover:bg-slate-800'
          : 'border-border bg-background text-foreground hover:bg-accent/10'
      }`}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
