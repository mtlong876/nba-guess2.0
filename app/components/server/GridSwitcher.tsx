
import GridShared from '../client/GridShared';
import { getPlayerData } from '../../actions/playerActions';
import { revalidateTag } from 'next/cache'
import { Suspense } from 'react';

const tables = [
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
		daily: true,
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
	const allPlayerData = await Promise.all(
		tables.map(async (table) => {
			const { csvData, playerFilename } = await getPlayerData(
				table.difficulty,
				table.daily
			);
			return { csvData, playerFilename };
		})
	);
	//revalidateTag('players')
	return (
		<div>
			<h1>NBA Guess Grids</h1>
			<Suspense fallback={<div>Loading grids...</div>}>
				<GridShared tables={tables} allPlayerData={allPlayerData} />
			</Suspense>
		</div>
	);
}