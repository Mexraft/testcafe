"use server";
/**
 * @fileOverview Flow to generate a dynamic flowchart visually representing the interpreted logic.
 *
 * - generateInteractiveFlowchart - A function that handles the flowchart generation process.
 * - GenerateInteractiveFlowchartInput - The input type for the generateInteractiveFlowchart function.
 * - GenerateInteractiveFlowchartOutput - The return type for the generateInteractiveFlowchart function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const GenerateInteractiveFlowchartInputSchema = z.object({
  problemStatementSummary: z
    .string()
    .describe("A summary of the problem statement."),
});
export type GenerateInteractiveFlowchartInput = z.infer<
  typeof GenerateInteractiveFlowchartInputSchema
>;

const GenerateInteractiveFlowchartOutputSchema = z.object({
  flowchartData: z
    .string()
    .describe("A string representation of the flowchart data."),
});
export type GenerateInteractiveFlowchartOutput = z.infer<
  typeof GenerateInteractiveFlowchartOutputSchema
>;

export async function generateInteractiveFlowchart(
  input: GenerateInteractiveFlowchartInput
): Promise<GenerateInteractiveFlowchartOutput> {
  return generateInteractiveFlowchartFlow(input);
}

const prompt = ai.definePrompt({
  name: "generateInteractiveFlowchartPrompt",
  input: { schema: GenerateInteractiveFlowchartInputSchema },
  output: { schema: GenerateInteractiveFlowchartOutputSchema },
  prompt: `You are an expert system for converting problem statements into flowcharts.

Based on the following problem statement summary, generate a flowchart data structure that visually represents the interpreted logic.

Problem Statement Summary: {{{problemStatementSummary}}}

The flowchart data should be a valid JSON string with the following structure:
{
  "nodes": [
    {
      "id": "node1",
      "label": "Start",
      "description": ["Starting point", "anothe feature point", "required all the points"]
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
5. The output must be a single, valid JSON object`,
});

// const generateInteractiveFlowchartFlow = ai.defineFlow(
//   {
//     name: "generateInteractiveFlowchartFlow",
//     inputSchema: GenerateInteractiveFlowchartInputSchema,
//     outputSchema: GenerateInteractiveFlowchartOutputSchema,
//   },
//   async (input) => {
//     const { output } = await prompt(input);
//     return output!;
//   }
// );

const MAX_ATTEMPTS = 5;

// 1. Main extraction prompt
const generatePrompt = ai.definePrompt({
  name: "generateInteractiveFlowchartPrompt",
  input: { schema: GenerateInteractiveFlowchartInputSchema },
  output: { schema: GenerateInteractiveFlowchartOutputSchema },
  prompt: `You are an expert system for converting problem statements into flowcharts.

Problem Statement Summary: {{{problemStatementSummary}}}

Generate a flowchart JSON with the following rules:
- Must strictly match schema: { "nodes": [...], "edges": [...] }
- Must include unique node IDs (node1, node2, ...)
- If you make assumptions, include them in "assumptions"
- If input is ambiguous, add clarifications to "openQuestions"
- Do not include markdown/code blocks
- Output must be a single valid JSON object`,
});

// 2. Diagnostic / refinement prompt
const refinePrompt = ai.definePrompt({
  name: "refineFlowchartPrompt",
  input: {
    schema: z.object({
      lastOutput: z.string(),
      issues: z.array(z.string()),
      originalProblem: z.string(),
    }),
  },
  output: { schema: GenerateInteractiveFlowchartOutputSchema },
  prompt: `The last attempt produced invalid or incomplete JSON.

Original Problem: {{{originalProblem}}}
Last Output: {{{lastOutput}}}
Issues: {{{issues}}}

Fix the JSON so it:
1. Passes schema validation
2. Covers all steps in the problem
3. Includes assumptions for inferred logic
4. Adds openQuestions if ambiguous
Return only the corrected JSON object.`,
});

// 3. Validator
function validateFlowchart(json: any): string[] {
  const issues: string[] = [];

  // Basic structure checks
  if (!json.nodes || !Array.isArray(json.nodes))
    issues.push("Missing or invalid nodes array");
  if (!json.edges || !Array.isArray(json.edges))
    issues.push("Missing or invalid edges array");

  // Node uniqueness
  const nodeIds = new Set();
  json.nodes?.forEach((n: any) => {
    if (nodeIds.has(n.id)) issues.push(`Duplicate node id: ${n.id}`);
    nodeIds.add(n.id);
  });

  // Edge validity
  json.edges?.forEach((e: any) => {
    if (!nodeIds.has(e.source)) issues.push(`Edge source missing: ${e.source}`);
    if (!nodeIds.has(e.target)) issues.push(`Edge target missing: ${e.target}`);
  });

  return issues;
}

// 4. Agent flow with iteration
const generateInteractiveFlowchartFlow = ai.defineFlow(
  {
    name: "generateInteractiveFlowchartFlow",
    inputSchema: GenerateInteractiveFlowchartInputSchema,
    outputSchema: GenerateInteractiveFlowchartOutputSchema,
  },
  async (input) => {
    let attempt = 0;
    let output: any = null;
    let issues: string[] = [];

    while (attempt < MAX_ATTEMPTS) {
      attempt++;

      if (attempt === 1) {
        // First attempt: run main prompt
        const { output: firstOutput } = await generatePrompt(input);
        output = firstOutput;
      } else {
        // Refinement attempt
        const { output: refined } = await refinePrompt({
          lastOutput: JSON.stringify(output),
          issues,
          originalProblem: input.problemStatementSummary,
        });
        output = refined;
      }

      try {
        const parsed = typeof output === "string" ? JSON.parse(output) : output;
        issues = validateFlowchart(parsed);

        if (issues.length === 0) {
          // ✅ Success
          return parsed;
        }
      } catch (err) {
        issues = ["Invalid JSON parse error"];
      }
    }

    // ❌ Give best-effort with issues attached
    return {
      ...output,
      openQuestions: [
        ...(output?.openQuestions || []),
        `Agent stopped after ${MAX_ATTEMPTS} attempts with unresolved issues: ${issues.join(
          ", "
        )}`,
      ],
    };
  }
);
