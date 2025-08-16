import TopBar from '../components/client/TopBar';
import DifficultySelector from '../components/client/DifficultySelector';
import {getAllPlayerNames} from '../actions/playerActions';
export default async function Home() {
  const allPlayerNames = await getAllPlayerNames();
  return (
    <>
      <TopBar />
      <DifficultySelector allPlayerNames = {allPlayerNames || []}/>
    </>
  );
}