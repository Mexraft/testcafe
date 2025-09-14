import { TestTube2 } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-card border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <TestTube2 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold font-headline text-foreground">
              AutoTestify
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}
