import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
        if (!unsplashKey) {
            return NextResponse.json({ error: 'Unsplash fallback key missing in environment variables' }, { status: 500 });
        }

        try {
            // Unsplash search logic
            const query = prompt.split(',')[0].substring(0, 50); // Get main keywords
            const unsplashUrl = `https://api.unsplash.com/search/photos?page=1&query=${encodeURIComponent(query)}&client_id=${unsplashKey}&per_page=1&orientation=landscape`;
            const unRes = await fetch(unsplashUrl);
            if (!unRes.ok) {
                return NextResponse.json({ error: 'Failed to fetch fallback image from Unsplash' }, { status: 500 });
            }
            const unData = await unRes.json();
            if (unData.results && unData.results.length > 0) {
                return NextResponse.json({ imageUrl: unData.results[0].urls.regular });
            } else {
                return NextResponse.json({ error: 'No fallback images found on Unsplash' }, { status: 404 });
            }
        } catch (unsplashErr) {
            console.error('Error in Unsplash fallback API:', unsplashErr);
            return NextResponse.json({ error: 'Failed during Unsplash fallback API' }, { status: 500 });
        }

    } catch (error) {
        console.error('Error in /api/generate-image:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
