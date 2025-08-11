
import GridShared from '../client/GridShared';
import { getPlayerData,getDailyId } from '../../actions/playerActions';
import { revalidateTag } from 'next/cache'
export const dynamic = "force-dynamic";

type Difficulty = "easy" | "medium" | "hard" | "chaos" | "recentP" | "recentS";

const tables: { title: string; difficulty: Difficulty; daily: boolean }[] = [
	{
		title: 'Easy',
		difficulty: 'easy',
		daily: true,
	},
	{
		title: 'Medium',
		difficulty: 'medium',
		daily: true,
	},
	{
		title: 'Hard',
		difficulty: 'hard',
		daily: true,
	},
	{
		title: 'Chaos',
		difficulty: 'chaos',
		daily: true,
	},
	{
		title: 'Recent Players',
		difficulty: 'recentP',
		daily: true,
	},
	{
		title: 'Recent Starters',
		difficulty: 'recentS',
		daily: true,
	},
];

export default async function GridSwitcher() {
	// Pre-fetch all player data on the server
	const dailyId = await getDailyId();
	const allPlayerData = await Promise.all(
		tables.map(async (table) => {
			const { csvData, playerFilename } = await getPlayerData(
				table.difficulty,
				table.daily
			);
			return { csvData: [...csvData].reverse(), playerFilename };
		})
	);
	//console.log('All player data loaded:', allPlayerData);
	//revalidateTag('players')
	return (
		<>
        <div
            style={{
                width: '100%',
                background: '#db6403ff',
                color: '#000000ff',
                padding: '10px 0 10px 10px',
                textAlign: 'left',
                fontSize: '2rem',
                fontWeight: 'bold',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                position: 'sticky',
				margin: 0,
				left: 0,
                top: 0,
                zIndex: 100,
				fontFamily: 'Montserrat, Arial, sans-serif',
            }}
        >
            NBA-Guess: Daily
        </div>
		<div style={{
			padding: '10px 10px',
		}}>
        <GridShared tables={tables} allPlayerData={allPlayerData} dailyId={dailyId} />
		</div>
    </>
	);
}