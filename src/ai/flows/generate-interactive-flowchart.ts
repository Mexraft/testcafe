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

  The flowchart data should be a string representation that can be easily parsed and rendered in a UI.
  Consider using a format like JSON or a simple graph description language.
  Ensure that the flowchart is dynamic and allows users to review, edit, and confirm the understanding of the requirements.
  Provide clear visual cues for different types of nodes and connections.
  Each node should include the id, label and description properties. Edges should include source and target.
  The output must be a valid JSON format and nothing else.
  `,
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
