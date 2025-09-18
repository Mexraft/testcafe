'use server';
/**
 * @fileOverview Flow to generate a dynamic flowchart visually representing the interpreted logic.
 *
 * - generateInteractiveFlowchart - A function that handles the flowchart generation process.
 * - GenerateInteractiveFlowchartInput - The input type for the generateInteractiveFlowchart function.
 * - GenerateInteractiveFlowchartOutput - The return type for the generateInteractiveFlowchart function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInteractiveFlowchartInputSchema = z.object({
  problemStatementSummary: z
    .string()
    .describe('A summary of the problem statement.'),
});
export type GenerateInteractiveFlowchartInput = z.infer<typeof GenerateInteractiveFlowchartInputSchema>;

const GenerateInteractiveFlowchartOutputSchema = z.object({
  flowchartData: z.string().describe('A string representation of the flowchart data.'),
});
export type GenerateInteractiveFlowchartOutput = z.infer<typeof GenerateInteractiveFlowchartOutputSchema>;

export async function generateInteractiveFlowchart(
  input: GenerateInteractiveFlowchartInput
): Promise<GenerateInteractiveFlowchartOutput> {
  return generateInteractiveFlowchartFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInteractiveFlowchartPrompt',
  input: {schema: GenerateInteractiveFlowchartInputSchema},
  output: {schema: GenerateInteractiveFlowchartOutputSchema},
  prompt: `You are an expert system for converting problem statements into flowcharts.

Based on the following problem statement summary, generate a flowchart data structure that visually represents the interpreted logic.

Problem Statement Summary: {{{problemStatementSummary}}}

The flowchart data should be a valid JSON string with the following structure:
{
  "nodes": [
    {
      "id": "node1",
      "label": "Start",
      "description": "Starting point"
    }
  ],
  "edges": [
    {
      "source": "node1",
      "target": "node2"
    }
  ]
}

IMPORTANT:
1. The response must be a valid JSON string that can be parsed with JSON.parse()
2. Do not include any markdown formatting, code blocks, or additional text
3. Ensure all strings are properly escaped
4. Remove any control characters from the response
5. The output must be a single, valid JSON object`
});

const generateInteractiveFlowchartFlow = ai.defineFlow(
  {
    name: 'generateInteractiveFlowchartFlow',
    inputSchema: GenerateInteractiveFlowchartInputSchema,
    outputSchema: GenerateInteractiveFlowchartOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
