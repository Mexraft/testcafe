'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileText, Wand2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Wand2 className="mr-2 h-4 w-4 animate-pulse" />
          Analyzing...
        </>
      ) : (
        <>
          <Wand2 className="mr-2 h-4 w-4" />
          Analyze Requirements
        </>
      )}
    </Button>
  );
}

export function RequirementInputForm({
  onSubmit,
}: {
  onSubmit: (requirements: string) => Promise<void>;
}) {
  const [requirements, setRequirements] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(requirements);
  };

  return (
    <Card className="w-full shadow-lg animate-fade-in">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-md">
                <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
                <CardTitle className="font-headline">Start with Your Requirements</CardTitle>
                <CardDescription>
                Paste your product requirements, specifications, or problem statement below.
                </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6 bg-accent/30 border-accent/50">
            <Wand2 className="h-4 w-4 text-accent-foreground" />
            <AlertTitle>How It Works</AlertTitle>
            <AlertDescription>
              Our AI will analyze your text to understand the core logic, generate a visual flowchart, and then create a comprehensive set of test cases for you to review.
            </AlertDescription>
          </Alert>
          <Textarea
            placeholder="e.g., The system shall allow users to log in with their email and password. Upon successful login, the user should be redirected to their dashboard..."
            className="min-h-[300px] text-base"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            required
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
