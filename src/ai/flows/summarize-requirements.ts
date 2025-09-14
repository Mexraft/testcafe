// Summarize the requirements, constraints, and objectives from a document or problem statement using Gemini.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeRequirementsInputSchema = z.object({
  documentContent: z.string().describe('The content of the document or problem statement.'),
});
export type SummarizeRequirementsInput = z.infer<typeof SummarizeRequirementsInputSchema>;

const SummarizeRequirementsOutputSchema = z.object({
  summary: z.string().describe('A summary of the key requirements, constraints, and objectives.'),
});
export type SummarizeRequirementsOutput = z.infer<typeof SummarizeRequirementsOutputSchema>;

export async function summarizeRequirements(input: SummarizeRequirementsInput): Promise<SummarizeRequirementsOutput> {
  return summarizeRequirementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeRequirementsPrompt',
  input: {schema: SummarizeRequirementsInputSchema},
  output: {schema: SummarizeRequirementsOutputSchema},
  prompt: `Summarize the key requirements, constraints, and objectives from the following document or problem statement:\n\n{{{documentContent}}}`,
});

const summarizeRequirementsFlow = ai.defineFlow(
  {
    name: 'summarizeRequirementsFlow',
    inputSchema: SummarizeRequirementsInputSchema,
    outputSchema: SummarizeRequirementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
