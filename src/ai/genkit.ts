
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

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    })
  ],
  // Using a more powerful model for better insights
  model: 'googleai/gemini-1.5-flash-preview-0514',
});
