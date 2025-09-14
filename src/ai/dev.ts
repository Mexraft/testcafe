import { config } from 'dotenv';
config();

import '@/ai/flows/generate-interactive-flowchart.ts';
import '@/ai/flows/summarize-requirements.ts';
import '@/ai/flows/map-test-cases-to-standards.ts';
import '@/ai/flows/generate-test-cases.ts';