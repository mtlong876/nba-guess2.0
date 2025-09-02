export const dynamic = "force-dynamic";

import { getAllPlayerNamesPicker } from "../actions/playerActions";
import GridSwitcher from "./components/server/GridSwitcherCreated";
import { Suspense } from 'react';
type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};


export default async function Home({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const playersParam = resolvedSearchParams.players as string;
  const playerIds = playersParam ? playersParam.split(',') : [];

  if (playerIds.length !== 6) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Error</h1>
        <p>
          Expected exactly 6 player IDs, but received {playerIds.length}.
        </p>
        <p>
          Please provide 6 comma-separated player IDs in the URL: 
          <code>?players=456,2544,101,123,2,112</code>
        </p>
      </div>
    );
  }
   const allPlayerNames = await getAllPlayerNamesPicker();
  
  // Create a map of playerIds to filenames
  const playerIdToFilename = new Map<string, string>();
  
  playerIds.forEach(playerId => {
    const playerData = allPlayerNames.find(p => 
      p.filename.includes(`_${playerId}.csv`) || p.filename.includes(`_${playerId}_`)
    );
    if (playerData) {
      playerIdToFilename.set(playerId, playerData.filename);
    }
  });
    //console.log('Player ID to Filename Map:', playerIdToFilename);
  // Check if all player IDs were found
  const missingIds = playerIds.filter(id => !playerIdToFilename.has(id));
  if (missingIds.length > 0) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Error</h1>
        <p>Could not find files for player IDs: {missingIds.join(', ')}</p>
      </div>
    );
  }
  if (playerIdToFilename.size !== 6) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Error</h1>
        <p>
          Mismatch in player IDs and filenames. Expected 6 filenames, but found {playerIdToFilename.size}.
        </p>
      </div>
    );
  }
  return (
    <div>
        <Suspense fallback={<div>Loading grids...</div>}> 
            <GridSwitcher playerIds={playerIdToFilename}/>
        </Suspense>
    </div>
  );
}