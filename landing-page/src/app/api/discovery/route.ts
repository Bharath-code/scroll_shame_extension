import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    // In a production environment, you would save this to a database (Supabase/Neon).
    // For the Discovery phase, we log it to Vercel Logs for immediate analysis.
    console.log('[Product Discovery Payload]:', JSON.stringify(payload, null, 2));

    return NextResponse.json({ 
      success: true, 
      message: 'Discovery data received. 🫡',
      receivedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Discovery API Error]:', error);
    return NextResponse.json({ success: false, error: 'Malformed payload' }, { status: 400 });
  }
}

// OPTIONS for CORS (if needed for browser extension)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
