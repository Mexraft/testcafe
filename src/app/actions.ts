'use server';

import { summarizeRequirements } from '@/ai/flows/summarize-requirements';
import { generateInteractiveFlowchart } from '@/ai/flows/generate-interactive-flowchart';
import { generateTestCasesAgentic } from '@/ai/flows/generate-test-cases';
import { mapTestCasesToStandards } from '@/ai/flows/map-test-cases-to-standards';
import { FlowchartData, TestCase } from '@/lib/types';

export async function generateUnderstandingAction(requirements: string): Promise<{
  summary?: string;
  flowchartData?: FlowchartData;
  error?: string;
}> {
  try {
    if (!requirements.trim()) {
      return { error: 'Requirements cannot be empty.' };
    }

    const { summary } = await summarizeRequirements({ documentContent: requirements });

    const { flowchartData } = await generateInteractiveFlowchart({
      problemStatementSummary: summary,
    });
    
    const parsedFlowchartData: FlowchartData = JSON.parse(flowchartData);

    return { summary, flowchartData: parsedFlowchartData };
  } catch (error) {
    console.error('Error in generateUnderstandingAction:', error);
    return {
      error: 'Failed to process requirements. The AI model may have returned an unexpected format.',
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
    const { testCases: testCasesString } = await generateTestCasesAgentic({
      confirmedUnderstanding,
    });

    const parsedTestCases = testCasesString
      .split('\n')
      .map(line => line.trim().replace(/^(-|\*)\s*/, ''))
      .filter(line => line.length > 0);

    if (parsedTestCases.length === 0) {
      return { error: 'No test cases were generated.' };
    }

    const { testCaseToStandardsMap } = await mapTestCasesToStandards({
      testCases: parsedTestCases,
      requirements: originalRequirements,
    });
    
    const finalTestCases: TestCase[] = parsedTestCases.map((desc, index) => ({
      id: `TC-${String(index + 1).padStart(3, '0')}`,
      description: desc,
      standards: testCaseToStandardsMap[desc] || [],
    }));

    return { testCases: finalTestCases };
  } catch (error) {
    console.error('Error in generateTestsAction:', error);
    return { error: 'Failed to generate test cases. The AI model may have returned an unexpected format.' };
  }
}
