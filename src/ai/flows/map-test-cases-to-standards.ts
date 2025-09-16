'use server';
/**
 * @fileOverview Maps generated test cases to relevant compliance standards.
 *
 * - mapTestCasesToStandards - A function that maps test cases to compliance standards.
 * - MapTestCasesToStandardsInput - The input type for the mapTestCasesToStandards function.
 * - MapTestCasesToStandardsOutput - The return type for the mapTestCasesToStandards function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MapTestCasesToStandardsInputSchema = z.object({
  testCases: z
    .array(z.string())
    .describe('An array of generated test case descriptions.'),
  requirements: z
    .string()
    .describe('The requirements document used to generate the test cases.'),
});
export type MapTestCasesToStandardsInput = z.infer<
  typeof MapTestCasesToStandardsInputSchema
>;

const MapTestCasesToStandardsOutputSchema = z.object({
  testCaseToStandardsMap: z.record(z.string(), z.array(z.string())).describe(
    'A map where keys are test case descriptions and values are arrays of relevant compliance standards (e.g., FDA, IEC 62304).'
  ),
});
export type MapTestCasesToStandardsOutput = z.infer<
  typeof MapTestCasesToStandardsOutputSchema
>;

export async function mapTestCasesToStandards(
  input: MapTestCasesToStandardsInput
): Promise<MapTestCasesToStandardsOutput> {
  return mapTestCasesToStandardsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mapTestCasesToStandardsPrompt',
  input: {schema: MapTestCasesToStandardsInputSchema},
  output: {schema: MapTestCasesToStandardsOutputSchema},
  prompt: `You are an expert in healthcare regulatory compliance.
Given a set of test case descriptions and the requirements document they are derived from, determine the relevant compliance standards for each test case.

Test Case Descriptions:
{{#each testCases}}
- {{{this}}}
{{/each}}

Requirements Document:
{{{requirements}}}

For each test case description, identify the relevant compliance standards (e.g., FDA, IEC 62304, ISO 9001, ISO 13485, ISO 27001) based on the requirements document.  If no standards apply to a test case, return an empty array for that test case.

Return a JSON object where the keys are the test case descriptions and the values are lists of relevant compliance standards.
Example:
{
  "testCaseToStandardsMap": {
    "Verify user can log in with valid credentials.": ["FDA", "IEC 62304"],
    "Verify user cannot log in with invalid credentials.": ["ISO 9001"],
    "Check for UI responsiveness on mobile devices.": []
  }
}
`,
});

const mapTestCasesToStandardsFlow = ai.defineFlow(
  {
    name: 'mapTestCasesToStandardsFlow',
    inputSchema: MapTestCasesToStandardsInputSchema,
    outputSchema: MapTestCasesToStandardsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
