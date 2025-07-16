import {generateDailyData} from "../actions/playerActions";

export async function GET(req: Request) {
  try {
    // Generate daily data
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }
    await generateDailyData();
    
    // Return the daily data as JSON
    return new Response("daily updated", {
      status: 200,
    });
  } catch (error) {
    console.error('Error generating daily data:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}