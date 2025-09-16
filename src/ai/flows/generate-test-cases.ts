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

const TestCaseSchema = z.object({
  id: z.string().describe('A unique identifier for the test case, e.g., "TC1".'),
  description: z.string().describe('A detailed description of the test case.'),
});

const GenerateTestCasesOutputSchema = z.object({
  testCases: z
    .array(TestCaseSchema)
    .describe(
      'An array of test case objects.'
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

Generate test cases that cover various scenarios and edge cases to ensure full test coverage.
The output must be a valid JSON object with a "testCases" key, which contains an array of objects. Each object in the array should have an "id" and a "description" property. Do not include anything else in the output.
Example format:
{
  "testCases": [
    {"id": "TC1", "description": "Verify user can log in with valid credentials."},
    {"id": "TC2", "description": "Verify user cannot log in with invalid credentials."}
  ]
}
`,
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
