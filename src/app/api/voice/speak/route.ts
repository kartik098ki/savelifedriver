import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { textHindi, textEnglish } = await request.json();

    if (!textHindi) {
      return NextResponse.json({ error: 'textHindi is required' }, { status: 400 });
    }

    const gnaniApiKey = process.env.GNANI_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    // If external Gnani TTS configured
    if (gnaniApiKey) {
      // Integration hook for Gnani voice synthesis
      return NextResponse.json({
        success: true,
        provider: 'GNANI',
        textHindi,
      });
    }

    // If OpenAI Audio Speech API configured
    if (openaiApiKey) {
      try {
        const ttsRes = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: 'tts-1',
            input: textHindi,
            voice: 'onyx',
          }),
        });

        if (ttsRes.ok) {
          const audioBuffer = await ttsRes.arrayBuffer();
          return new Response(audioBuffer, {
            headers: {
              'Content-Type': 'audio/mpeg',
            },
          });
        }
      } catch (err) {
        console.warn('OpenAI TTS failed, falling back to client synthesis', err);
      }
    }

    // Default fallback: return text metadata for client-side Web Speech synthesis
    return NextResponse.json({
      success: true,
      provider: 'WEB_SPEECH_FALLBACK',
      textHindi,
      textEnglish,
    });
  } catch (error) {
    console.error('Error in voice speak API:', error);
    return NextResponse.json({ error: 'Failed to process voice request' }, { status: 500 });
  }
}
