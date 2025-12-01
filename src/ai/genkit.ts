
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Validate API key is configured
if (!process.env.GOOGLE_GENAI_API_KEY) {
  console.warn(
    '⚠️  GOOGLE_GENAI_API_KEY is not set. AI features will not work.\n' +
    '   Get your API key from: https://aistudio.google.com/app/apikey\n' +
    '   Add it to your .env.local file'
  );
}

// Using Gemini 2.5 Flash - latest stable model for generateContent
// Free tier: 15 RPM (requests per minute), 1M TPM (tokens per minute)
export const DEFAULT_MODEL = 'googleai/gemini-2.5-flash';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    })
  ],
  model: DEFAULT_MODEL,
});
