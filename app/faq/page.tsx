import TopBar from '../components/client/TopBar';
export default function Home() {
  return (
    <div>
      <TopBar />
      <span style={{ padding: '20px', display: 'block', fontSize: '1.25rem' }}>
        <h1>Frequently Asked Questions (FAQ)</h1>
        <h2>Rules:</h2>
        <p>You are given stats of a player and have to guess the players name, as you use up your guesses you will
            receieve extra information about the player. For the first guess you will recieve all of the players averages
            accross all seasons of play, for the second guess you will recieve what teams the player played for during the seasons
            and for the final guess you will recieve the players initials.
        </p>
        <h2>Difficulty definitions</h2>
        <p>
            <strong>Easy:</strong> Started in 500 games while being drafted after 2005<br />
            <strong>Medium:</strong> Started in 500 games while being drafted after 1990<br />
            <strong>Hard:</strong> Started in 500 games while being drafted after 1975<br />
            <strong>Chaos:</strong> Played in 600 games<br />
            <strong>Recent Players:</strong> Played atleast 40 games last season<br />
            <strong>Recent Starters:</strong> Started atleast 40 games last season<br />
            <strong>Extreme:</strong> Played in 100 games, only available on Random: Player or in created games<br />
        </p>
        </span>
     </div>
  );
}