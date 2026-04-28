import ZAI from 'z-ai-web-dev-sdk';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { audioData, language } = body; // audioData is base64-encoded audio (webm/opus or wav)

    if (!audioData) {
      return Response.json({ error: 'No audio data provided' }, { status: 400 });
    }

    // Validate that audioData is a non-empty string
    if (typeof audioData !== 'string' || audioData.trim().length === 0) {
      return Response.json(
        { error: 'Invalid audio data: expected a non-empty base64 string' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    // Build the ASR request body according to SDK's CreateAudioASRBody interface
    const asrBody: { file_base64: string; language?: string } = {
      file_base64: audioData,
    };

    // Pass language hint if provided (some ASR models support this)
    if (language && typeof language === 'string') {
      asrBody.language = language;
    }

    const response = await zai.audio.asr.create(asrBody);

    // The SDK returns the parsed JSON from the ASR API.
    // The response shape is typically { text: "..." } but may vary.
    // Handle multiple possible response structures defensively.
    let text = '';

    if (typeof response === 'string') {
      text = response;
    } else if (response && typeof response === 'object') {
      // Standard response: { text: "..." }
      if (typeof response.text === 'string') {
        text = response.text;
      } else if (typeof response.result === 'string') {
        text = response.result;
      } else if (typeof response.transcription === 'string') {
        text = response.transcription;
      } else if (typeof response.data === 'string') {
        text = response.data;
      } else if (typeof response.data === 'object' && response.data !== null && typeof (response.data as Record<string, unknown>).text === 'string') {
        text = (response.data as Record<string, string>).text;
      } else if (Array.isArray(response.results) && response.results.length > 0) {
        // Alternative format: { results: [{ text: "..." }] }
        const firstResult = response.results[0];
        if (firstResult && typeof firstResult.text === 'string') {
          text = firstResult.text;
        } else if (firstResult && typeof firstResult.transcript === 'string') {
          text = firstResult.transcript;
        }
      }
    }

    if (text.trim().length === 0) {
      console.warn('ASR returned an empty transcription. Raw response:', JSON.stringify(response).slice(0, 500));
    }

    return Response.json({ text });
  } catch (error) {
    console.error('ASR error:', error);

    // Provide more specific error messages for known failure modes
    let errorMessage = 'Failed to transcribe audio';
    let statusCode = 500;

    if (error instanceof Error) {
      const msg = error.message;
      if (msg.includes('Configuration file not found') || msg.includes('invalid')) {
        errorMessage = 'Audio transcription service is not configured. Please contact the administrator.';
        statusCode = 503;
      } else if (msg.includes('API request failed with status 413')) {
        errorMessage = 'Audio file is too large. Please try a shorter recording.';
        statusCode = 413;
      } else if (msg.includes('API request failed with status 400')) {
        errorMessage = 'Invalid audio format. Please ensure the audio is in a supported format (wav, webm, mp3).';
        statusCode = 400;
      } else if (msg.includes('API request failed')) {
        errorMessage = 'Audio transcription service returned an error. Please try again.';
      } else if (msg.includes('fetch') || msg.includes('network') || msg.includes('ECONNREFUSED')) {
        errorMessage = 'Could not reach the transcription service. Please check your network connection.';
        statusCode = 503;
      }
    }

    return Response.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: statusCode }
    );
  }
}
