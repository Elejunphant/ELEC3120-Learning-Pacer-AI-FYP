import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    message:
      'TTS is now handled client-side via browser SpeechSynthesis. No server-side API call is needed.',
  });
}
