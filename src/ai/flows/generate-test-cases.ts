'use server';

/**
 * @fileOverview A test case generation AI agent that iteratively generates test cases based on the confirmed understanding of requirements.
 *
 * - generateTestCasesAgentic - A function that initiates the agentic test case generation process.
 * - GenerateTestCasesInput - The input type for the generateTestCasesAgentic function.
 * - GenerateTestCasesOutput - The return type for the generateTestCasesAgentic function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTestCasesInputSchema = z.object({
  confirmedUnderstanding: z
    .string()
    .describe(
      'The confirmed understanding of the requirements and specifications.'
    ),
});
export type GenerateTestCasesInput = z.infer<
  typeof GenerateTestCasesInputSchema
>;

const GenerateTestCasesOutputSchema = z.object({
  testCases: z
    .string()
    .describe(
      'A list of generated test cases based on the confirmed understanding.'
    ),
});
export type GenerateTestCasesOutput = z.infer<
  typeof GenerateTestCasesOutputSchema
>;

export async function generateTestCasesAgentic(
  input: GenerateTestCasesInput
): Promise<GenerateTestCasesOutput> {
  return generateTestCasesFlow(input);
}

const generateTestCasesPrompt = ai.definePrompt({
  name: 'generateTestCasesPrompt',
  input: {schema: GenerateTestCasesInputSchema},
  output: {schema: GenerateTestCasesOutputSchema},
  prompt: `You are a test case generation expert. Based on the confirmed understanding of the requirements and specifications, generate a comprehensive set of test cases.

Confirmed Understanding: {{{confirmedUnderstanding}}}

Generate test cases that cover various scenarios and edge cases to ensure full test coverage.`,
});

const generateTestCasesFlow = ai.defineFlow(
  {
    name: 'generateTestCasesFlow',
    inputSchema: GenerateTestCasesInputSchema,
    outputSchema: GenerateTestCasesOutputSchema,
  },
  async input => {
    const {output} = await generateTestCasesPrompt(input);
    return output!;
  }
);
