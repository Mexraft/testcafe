'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Check, Edit, RotateCcw, Workflow } from 'lucide-react';
import { Flowchart } from './Flowchart';
import type { FlowchartData } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export function UnderstandingView({
  initialSummary,
  flowchartData,
  onConfirm,
  onBack,
}: {
  initialSummary: string;
  flowchartData: FlowchartData;
  onConfirm: (summary: string) => void;
  onBack: () => void;
}) {
  const [summary, setSummary] = useState(initialSummary);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-3xl font-bold font-headline">Review AI Understanding</h2>
        <p className="mt-2 text-lg text-muted-foreground">
          Confirm the AI's interpretation of your requirements before generating test cases.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-md">
                <BrainCircuit className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>AI-Generated Summary</CardTitle>
                <CardDescription>
                  This is what the AI understood from your document.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4 text-sm">
                <Edit className="h-4 w-4"/>
                <AlertTitle>Editable Summary</AlertTitle>
                <AlertDescription>
                    Feel free to edit the summary below to refine the AI's understanding. The flowchart and subsequent test cases will be based on this text.
                </AlertDescription>
            </Alert>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="min-h-[300px] text-base"
            />
          </CardContent>
        </Card>

        <Card className="shadow-lg lg:sticky lg:top-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-md">
                <Workflow className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Visual Flowchart</CardTitle>
                <CardDescription>
                  A visual representation of the interpreted logic.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Flowchart data={flowchartData} />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
                Happy with the summary? Proceed to generate test cases.
            </p>
            <div className="flex gap-4">
                <Button variant="outline" onClick={onBack}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Start Over
                </Button>
                <Button onClick={() => onConfirm(summary)}>
                    <Check className="mr-2 h-4 w-4" />
                    Confirm & Generate Tests
                </Button>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
