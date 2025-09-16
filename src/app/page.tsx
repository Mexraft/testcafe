'use client';

import { useState } from 'react';
import { Header } from '@/components/app/Header';
import { RequirementInputForm } from '@/components/app/RequirementInputForm';
import { UnderstandingView } from '@/components/app/UnderstandingView';
import { TestCasesView } from '@/components/app/TestCasesView';
import { Spinner } from '@/components/app/Spinner';
import { generateUnderstandingAction, generateTestsAction } from '@/app/actions';
import type { FlowchartData, TestCase } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

type AppState = 'input' | 'understanding' | 'generating' | 'results';
type UnderstandingData = {
  originalRequirements: string;
  summary: string;
  flowchartData: FlowchartData;
};

export default function Home() {
  const [appState, setAppState] = useState<AppState>('input');
  const [understandingData, setUnderstandingData] = useState<UnderstandingData | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFatalError = (message: string) => {
    toast({
      variant: 'destructive',
      title: 'An Error Occurred',
      description: message,
    });
    setLoadingMessage(null);
    setAppState('input');
  };

  const handleGenerateUnderstanding = async (requirements: string) => {
    setLoadingMessage('Analyzing requirements...');
    setAppState('generating');
    try {
      const result = await generateUnderstandingAction(requirements);
      if (result.error) {
        throw new Error(result.error);
      }
      setUnderstandingData({
        originalRequirements: requirements,
        summary: result.summary!,
        flowchartData: result.flowchartData!,
      });
      setAppState('understanding');
    } catch (e: any) {
      handleFatalError(e.message || 'Failed to analyze requirements.');
    } finally {
      setLoadingMessage(null);
    }
  };

  const handleGenerateTests = async (summary: string) => {
    if (!understandingData?.originalRequirements) {
      handleFatalError('Original requirements not found. Please start over.');
      return;
    }
    setAppState('generating');
    setLoadingMessage('Generating test cases... This may take a moment.');
    try {
      const result = await generateTestsAction(
        summary,
        understandingData.originalRequirements
      );
      if (result.error) {
        throw new Error(result.error);
      }
      setTestCases(result.testCases!);
      setAppState('results');
    } catch (e: any) {
      handleFatalError(e.message || 'Failed to generate test cases.');
    } finally {
      setLoadingMessage(null);
    }
  };

  const handleStartOver = () => {
    setAppState('input');
    setUnderstandingData(null);
    setTestCases([]);
  };

  const handleBackToUnderstanding = () => {
    setAppState('understanding');
  };

  const renderContent = () => {
    if (appState === 'generating' || loadingMessage) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 text-center h-96">
          <Spinner />
          <p className="text-lg text-muted-foreground animate-pulse">{loadingMessage || 'Processing...'}</p>
        </div>
      );
    }

    switch (appState) {
      case 'input':
        return <RequirementInputForm onSubmit={handleGenerateUnderstanding} />;
      case 'understanding':
        return (
          understandingData && (
            <UnderstandingView
              initialSummary={understandingData.summary}
              flowchartData={understandingData.flowchartData}
              onConfirm={handleGenerateTests}
              onBack={handleStartOver}
            />
          )
        );
      case 'results':
        return (
          <TestCasesView
            testCases={testCases}
            onStartOver={handleStartOver}
            onBack={handleBackToUnderstanding}
          />
        );
      default:
        return <RequirementInputForm onSubmit={handleGenerateUnderstanding} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="transition-opacity duration-500 ease-in-out">{renderContent()}</div>
      </main>
      <footer className="text-center py-4 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} AutoTestify. All rights reserved.</p>
      </footer>
    </div>
  );
}
