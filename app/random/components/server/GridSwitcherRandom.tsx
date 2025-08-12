import GridShared from '../../../components/client/GridShared';
import { getPlayerData,getDailyId } from '../../../actions/playerActions';
import { revalidateTag } from 'next/cache'
import TopBar from '../../../components/client/TopBar';
export const dynamic = "force-dynamic";

type Difficulty = "easy" | "medium" | "hard" | "chaos" | "recentP" | "recentS";

const tables: { title: string; difficulty: Difficulty; daily: boolean }[] = [
	{
		title: 'Easy',
		difficulty: 'easy',
		daily: false,
	},
	{
		title: 'Medium',
		difficulty: 'medium',
		daily: false,
	},
	{
		title: 'Hard',
		difficulty: 'hard',
		daily: false,
	},
	{
		title: 'Chaos',
		difficulty: 'chaos',
		daily: false,
	},
	{
		title: 'Recent Players',
		difficulty: 'recentP',
		daily: false,
	},
	{
		title: 'Recent Starters',
		difficulty: 'recentS',
		daily: false,
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
        <TopBar />
		<div style={{
			padding: '10px',
		}}>
        <GridShared tables={tables} allPlayerData={allPlayerData} dailyId={dailyId} daily={false} />
		</div>
    </>
	);
}