import { getPlayerData } from '../../actions/playerActions';
import GridDisplay from '../client/GridDisplay';

type GridContainerProps = {
  difficulty: string;
  daily: boolean;
};

export default async function GridContainer({ difficulty, daily }: GridContainerProps) {
  const { csvData, playerFilename } = await getPlayerData(difficulty, daily);
  
  return (
    <GridDisplay 
      csvData={csvData} 
      difficulty={difficulty}
      playerFilename={playerFilename}
    />
  );
}