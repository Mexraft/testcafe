"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/app/Header";
import { RequirementInputForm } from "@/components/app/RequirementInputForm";
import { UnderstandingView } from "@/components/app/UnderstandingView";
import { TestCasesView } from "@/components/app/TestCasesView";
import { Spinner } from "@/components/app/Spinner";
import {
  generateUnderstandingAction,
  generateTestsAction,
} from "@/app/actions";
import type { FlowchartData, TestCase } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  TestTube2,
  Workflow,
  FileText,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import HealthcareFlowchart, {
  healthcareFlowchartDummyData,
} from "@/components/flow/HealthcareFlowchart";
import { useAnalysisWS } from "@/hooks/useAnalysisWS";

type AppState = "home" | "input" | "understanding" | "generating" | "results";
type UnderstandingData = {
  originalRequirements: string;
  summary: string;
  flowchartData: FlowchartData;
};

export default function Home() {
  const [appState, setAppState] = useState<AppState>("home");
  const [understandingData, setUnderstandingData] =
    useState<UnderstandingData | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const { toast } = useToast();

  // WebSocket integration
  const {
    connected,
    progress,
    results,
    error: wsError,
    startAnalysis,
    question,
    answerQuestion,
  } = useAnalysisWS();

  // State for answering backend questions
  const [answerText, setAnswerText] = useState("");
  const charLimit = 5000;
  const overLimit = answerText.length > charLimit;
  const canSubmitAnswer = answerText.trim().length > 0 && !overLimit;
  const [questionOpen, setQuestionOpen] = useState(false);

  useEffect(() => {
    // Reset the answer input when a new question arrives or question clears
    setAnswerText("");
    setQuestionOpen(!!question);
  }, [question]);

  const handleSubmitAnswer = useMemo(() => (
    () => {
      if (!canSubmitAnswer) return;
      try {
        answerQuestion(answerText.trim());
        setAnswerText("");
        // Hide the popup immediately and show loader until results arrive
        setQuestionOpen(false);
        setLoadingMessage("Processing your answer...");
        setAppState("generating");
      } catch (e) {
        // No-op; errors will be surfaced via ws error handler
      }
    }
  ), [answerText, answerQuestion, canSubmitAnswer]);

  const handleFatalError = (message: string) => {
    toast({
      variant: "destructive",
      title: "An Error Occurred",
      description: message,
    });
    setLoadingMessage(null);
    setAppState("input");
  };

  const handleGenerateUnderstanding = async (requirements: string) => {
    // Prefer WebSocket for streaming progress/results; fallback to server action
    if (connected) {
      setLoadingMessage("Connecting to analysis engine...");
      setAppState("generating");
      try {
        startAnalysis(requirements);
      } catch (e: any) {
        // Fallback on failure to send
        console.warn("WS start failed, falling back to server action", e);
        await fallbackGenerateUnderstanding(requirements);
      }
      return;
    }
    await fallbackGenerateUnderstanding(requirements);
  };

  const fallbackGenerateUnderstanding = async (requirements: string) => {
    setLoadingMessage("Analyzing requirements...");
    setAppState("generating");
    try {
      const result = await generateUnderstandingAction(requirements);
      if (result.error) throw new Error(result.error);
      setUnderstandingData({
        originalRequirements: requirements,
        summary: result.summary!,
        flowchartData: result.flowchartData!,
      });
      setAppState("understanding");
    } catch (e: any) {
      handleFatalError(e.message || "Failed to analyze requirements.");
    } finally {
      setLoadingMessage(null);
    }
  };

  // Reflect WS progress/errors into UI and move to understanding when results arrive
  useEffect(() => {
    if (wsError) {
      handleFatalError(wsError);
    }
  }, [wsError]);

  useEffect(() => {
    if (progress) {
      setLoadingMessage(
        progress.message || `Stage: ${progress.stage} (${progress.progress}%)`
      );
    }
  }, [progress]);

  useEffect(() => {
    if (!results) return;
    try {
      const summary = Array.isArray(results.insights)
        ? (results.insights[0] as string)
        : "";

      // Prefer flowChart at top-level if provided by server
      let flowchartDataStr: string | null =
        typeof results.flowChart === "string" ? results.flowChart : null;

      // Fallback: try to locate a JSON blob from conversationHistory content
      if (!flowchartDataStr && Array.isArray(results.conversationHistory)) {
        const candidate = [...results.conversationHistory]
          .reverse()
          .find(
            (e: any) =>
              typeof e?.content === "string" && /\{[\s\S]*\}/.test(e.content)
          );
        if (candidate?.content) {
          flowchartDataStr = candidate.content as string;
        }
      }

      if (!flowchartDataStr || typeof flowchartDataStr !== "string") {
        throw new Error("Flowchart data missing from results");
      }

      // Clean and parse JSON
      const cleaned = flowchartDataStr
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
        .trim();
      const parsedFlowchartData: FlowchartData = JSON.parse(cleaned);

      setUnderstandingData((prev) => ({
        originalRequirements: prev?.originalRequirements || summary,
        summary,
        flowchartData: parsedFlowchartData,
      }));
      setAppState("understanding");
      setLoadingMessage(null);
    } catch (e: any) {
      handleFatalError(e.message || "Failed to parse results from WebSocket.");
    }
  }, [results]);

  const handleGenerateTests = async (summary: string) => {
    if (!understandingData?.originalRequirements) {
      handleFatalError("Original requirements not found. Please start over.");
      return;
    }
    setAppState("generating");
    setLoadingMessage("Generating test cases... This may take a moment.");
    try {
      const result = await generateTestsAction(
        summary,
        understandingData.originalRequirements
      );
      if (result.error) {
        throw new Error(result.error);
      }
      setTestCases(result.testCases!);
      setAppState("results");
    } catch (e: any) {
      handleFatalError(e.message || "Failed to generate test cases.");
    } finally {
      setLoadingMessage(null);
    }
  };

  const handleStartOver = () => {
    setAppState("input");
    setUnderstandingData(null);
    setTestCases([]);
  };

  const handleBackToUnderstanding = () => {
    setAppState("understanding");
  };

  const handleBackToHome = () => {
    setAppState("home");
    setUnderstandingData(null);
    setTestCases([]);
  };

  const renderHomeContent = () => (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-8 py-12">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            AutoTestify
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transform your requirements into comprehensive test cases with
            AI-powered analysis and interactive workflow visualization
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => setAppState("input")}
            className="text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Start Testing
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            asChild
            className="text-lg px-8 py-6 rounded-xl border-2 hover:bg-primary/5 transition-all duration-300"
          >
            <Link href="/healthcare-flow">
              View Demo Flow
              <Workflow className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Interactive Healthcare Flowchart */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Interactive Healthcare System</h2>
          <p className="text-muted-foreground">
            Explore our sample healthcare workflow - drag nodes, zoom, and
            interact with the system
          </p>
        </div>
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-card to-card/50">
          <CardContent className="p-0">
            <div className="h-[600px] rounded-lg overflow-hidden">
              <HealthcareFlowchart data={healthcareFlowchartDummyData} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <TestTube2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-xl">AI-Powered Analysis</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <CardDescription className="text-base leading-relaxed">
              Advanced AI algorithms analyze your requirements and generate
              comprehensive test scenarios automatically
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Workflow className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-xl">Interactive Flowcharts</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <CardDescription className="text-base leading-relaxed">
              Visualize complex workflows with interactive diagrams that help
              you understand system behavior
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <CheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle className="text-xl">Comprehensive Testing</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <CardDescription className="text-base leading-relaxed">
              Generate detailed test cases covering edge cases, user scenarios,
              and system validations
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    if (appState === "generating" || loadingMessage) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 text-center h-96">
          <Spinner />
          <p className="text-lg text-muted-foreground animate-pulse">
            {loadingMessage || "Processing..."}
          </p>
        </div>
      );
    }

    switch (appState) {
      case "home":
        return renderHomeContent();
      case "input":
        return (
          <RequirementInputForm
            onSubmit={handleGenerateUnderstanding}
            onBack={handleBackToHome}
          />
        );
      case "understanding":
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
      case "results":
        return (
          <TestCasesView
            testCases={testCases}
            onStartOver={handleStartOver}
            onBack={handleBackToUnderstanding}
          />
        );
      default:
        return renderHomeContent();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="transition-all duration-500 ease-in-out">
          {renderContent()}
        </div>
      </main>
      {/* Modal for answering backend questions (USER_INPUT) */}
      <Dialog open={questionOpen} onOpenChange={(open) => setQuestionOpen(open)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Additional Information Requested</DialogTitle>
            <DialogDescription>
              {question || "The analysis engine is requesting more details."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="ws-answer">Your Answer</Label>
            <Textarea
              id="ws-answer"
              value={answerText}
              maxLength={charLimit}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Type your response here (max 5000 characters)"
              className={overLimit ? "border-destructive" : ""}
              rows={6}
            />
            <div className={`text-sm text-right ${overLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
              {answerText.length}/{charLimit}
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setAnswerText("")}>Clear</Button>
            <Button onClick={handleSubmitAnswer} disabled={!canSubmitAnswer}>
              Submit Answer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <footer className="border-t bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} AutoTestify. Empowering quality
              through intelligent testing.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
