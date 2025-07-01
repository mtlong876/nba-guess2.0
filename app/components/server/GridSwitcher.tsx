import GridSwitcherClient from '../client/GridSwitcherClient';
import GridContainer from './GridContainer';
import { getPlayerData } from '../../actions/playerActions';

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
	return (
		<div>
			<h1>NBA Guess Grids</h1>
			<GridSwitcherClient tables={tables} playerData={allPlayerData}>
				{tables.map((table, index) => (
					<GridContainer
						key={index}
						csvData={allPlayerData[index].csvData}
						difficulty={table.difficulty}
					/>
				))}
			</GridSwitcherClient>
		</div>
	);
}