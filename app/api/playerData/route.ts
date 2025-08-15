import { NextResponse } from 'next/server';
import { getPlayerData } from '@/app/actions/playerActions';

export async function GET(req: Request) {
  try{
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`) {
      return new Response('Unauthorized', { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const difficulty = searchParams.get('difficulty') || 'easy';
    const daily = searchParams.get('daily') === 'true';
    const data = await getPlayerData(difficulty, daily);
    return NextResponse.json(data);
  }catch (error) {
    console.error('Error generating player data:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}