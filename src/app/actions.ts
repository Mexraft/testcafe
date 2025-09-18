"use server";

import { summarizeRequirements } from "@/ai/flows/summarize-requirements";
import { generateInteractiveFlowchart } from "@/ai/flows/generate-interactive-flowchart";
import { generateTestCasesAgentic } from "@/ai/flows/generate-test-cases";
import { mapTestCasesToStandards } from "@/ai/flows/map-test-cases-to-standards";
import { FlowchartData, TestCase } from "@/lib/types";

export async function generateUnderstandingAction(
  requirements: string
): Promise<{
  summary?: string;
  flowchartData?: FlowchartData;
  error?: string;
}> {
  try {
    if (!requirements.trim()) {
      return { error: "Requirements cannot be empty." };
    }

    const { summary } = await summarizeRequirements({
      documentContent: requirements,
    });

    const { flowchartData } = await generateInteractiveFlowchart({
      problemStatementSummary: summary,
    });
    
    // Log the raw data for debugging
    console.log("Raw flowchartData:", flowchartData);
    
    try {
      // Clean the JSON string before parsing
      const cleanedFlowchartData = flowchartData
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
        .trim();
        
      const parsedFlowchartData: FlowchartData = JSON.parse(cleanedFlowchartData);
      return { summary, flowchartData: parsedFlowchartData };
    } catch (parseError) {
      console.error("Error parsing flowchartData:", parseError);
      return {
        error: "Failed to parse the flowchart data. The AI model may have returned an invalid format.",
        summary // Still return the summary even if flowchart parsing fails
      };
    }
  } catch (error) {
    console.error("Error in generateUnderstandingAction:", error);
    return {
      error: "Failed to process requirements. Please try again later.",
    };
  }
}

export async function generateTestsAction(
  confirmedUnderstanding: string,
  originalRequirements: string
): Promise<{
  testCases?: TestCase[];
  error?: string;
}> {
  try {
    // The AI model now returns an object with a testCases property.
    const { testCases: parsedTestCases } = await generateTestCasesAgentic({
      confirmedUnderstanding,
    });

    if (!parsedTestCases || parsedTestCases.length === 0) {
      return { error: "No test cases were generated." };
    }

    const testCaseDescriptions = parsedTestCases.map((tc) => tc.description);

    const { testCaseToStandardsMap } = await mapTestCasesToStandards({
      testCases: testCaseDescriptions,
      requirements: originalRequirements,
    });

    const finalTestCases: TestCase[] = parsedTestCases.map((tc, index) => ({
      id: tc.id,
      description: tc.description,
      standards: testCaseToStandardsMap[tc.description] || [],
    }));

    return { testCases: finalTestCases };
  } catch (error) {
    console.error("Error in generateTestsAction:", error);
    return {
      error:
        "Failed to generate test cases. The AI model may have returned an unexpected format.",
    };
  }
}
