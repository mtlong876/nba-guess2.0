import TopBar from '../components/client/TopBar';
import PlayerSelector from './components/client/playerSelector';
import { getAllPlayerNamesPicker } from '../actions/playerActions';

export default async function Home() {
  const allPlayerNames = await getAllPlayerNamesPicker();
  return (
    <>
      <TopBar />
      <PlayerSelector allPlayerNames={allPlayerNames} />
    </>
  );
}