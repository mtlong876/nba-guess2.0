import { getPlayerData } from '../../actions/playerActions';
import GridDisplay from '../client/GridDisplay';

type GridContainerProps = {
  difficulty: string;
  csvData?: any;
};

export default async function GridContainer({ difficulty,csvData }: GridContainerProps) {

  return (
    <GridDisplay 
      csvData={csvData} 
      difficulty={difficulty}
    />
  );
}