import GridShared from '../../../components/client/GridShared';
import { getCSVFromFilename,getDailyId } from '../../../actions/playerActions';
import TopBar from '../../../components/client/TopBar';
export const dynamic = "force-dynamic";

type Difficulty = "easy" | "medium" | "hard" | "chaos" | "recentP" | "recentS";

type gridswitcherProps = {
  playerIds: Map<string, string>;
};
const tables: { title: string; difficulty: Difficulty; daily: boolean }[] = [
    {
        title: 'Player 1',
        difficulty: 'easy',
        daily: false,
    },
    {
        title: 'Player 2',
        difficulty: 'medium',
        daily: false,
    },
    {
        title: 'Player 3',
        difficulty: 'hard',
        daily: false,
    },
    {
        title: 'Player 4',
        difficulty: 'chaos',
        daily: false,
    },
    {
        title: 'Player 5',
        difficulty: 'recentP',
        daily: false,
    },
    {
        title: 'Player 6',
        difficulty: 'recentS',
        daily: false,
    },
];

export default async function GridSwitcher(gridswitcherProps: gridswitcherProps) {
    // Pre-fetch all player data on the server
    const dailyId = await getDailyId();
    const playerDataPromises = Array.from(gridswitcherProps.playerIds.values()).map(filename => getCSVFromFilename(filename));
    const allPlayerDataRaw = await Promise.all(playerDataPromises);
    
    // Flip the CSV data for each player
    const allPlayerData = allPlayerDataRaw.map(playerData => ({
        ...playerData,
        csvData: [...playerData.csvData].reverse()
    }));
    
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