
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
		<div>
			<h1>NBA Guess Grids: Daily</h1>
			
				<GridShared tables={tables} allPlayerData={allPlayerData} dailyId = {dailyId}/>

		</div>
	);
}