'use client';
import { useState } from 'react';

type PlayerSelectorProps = {
  allPlayerNames: { filename: string; name: string }[];
};

export default function PlayerSelector({ allPlayerNames }: PlayerSelectorProps) {
  const [players, setPlayers] = useState<string[]>(['', '', '', '', '', '']);
  const [selectedFilenames, setSelectedFilenames] = useState<string[]>(['', '', '', '', '', '']);
  const [generatedUrl, setGeneratedUrl] = useState<string>('');

  const handlePlayerChange = (index: number, value: string) => {
    const newPlayers = [...players];
    const newFilenames = [...selectedFilenames];
    
    newPlayers[index] = value;
    
    const playerData = allPlayerNames.find(p => p.name === value);
    newFilenames[index] = playerData ? playerData.filename : '';
    
    setPlayers(newPlayers);
    setSelectedFilenames(newFilenames);
  };

  const isPlayerAlreadySelected = (playerName: string, currentIndex: number) => {
    return players.some((player, index) => 
      index !== currentIndex && player === playerName && player !== ''
    );
  };

  const getAvailablePlayersForIndex = (currentIndex: number) => {
    const selectedPlayers = new Set(
      players.filter((player, index) => index !== currentIndex && player !== '')
    );
    return allPlayerNames.filter(playerData => !selectedPlayers.has(playerData.name));
  };

  const handleConfirm = () => {
    const selectedPlayers = players.filter(player => player !== '');
    const selectedFiles = selectedFilenames.filter(filename => filename !== '');
    
    const uniquePlayers = new Set(selectedPlayers);
    if (selectedPlayers.length !== uniquePlayers.size) {
      alert('Error: Duplicate players selected! Please select different players.');
      return;
    }

    if (selectedPlayers.length === 0) {
      alert('Please select at least one player.');
      return;
    }

    const playerIds = selectedFiles.map(filename => {
      const match = filename.match(/_(\d+)\.csv$/);
      return match ? match[1] : '';
    });

    const url = `https://nba-guess.com/createdGame?players=${playerIds.join(',')}`;
    setGeneratedUrl(url);

    console.table(selectedPlayers.map((player, index) => ({ 
      Position: index + 1, 
      PlayerName: player,
      Filename: selectedFiles[index] || 'Not found',
      PlayerID: playerIds[index] || 'Not found'
    })));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Select Up To 6 Players</h2>
      {players.map((player, index) => {
        const isDuplicate = player !== '' && isPlayerAlreadySelected(player, index);
        const availablePlayers = getAvailablePlayersForIndex(index);
        
        return (
          <div key={index} style={{ marginBottom: '15px' }}>
            <label htmlFor={`player-${index}`} style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Player {index + 1}:
            </label>
            <input
              id={`player-${index}`}
              type="text"
              value={player}
              onChange={(e) => handlePlayerChange(index, e.target.value)}
              list={`players-${index}`}
              placeholder={`Enter player ${index + 1} name...`}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                border: isDuplicate ? '2px solid #ff4444' : '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: isDuplicate ? '#ffebee' : 'white'
              }}
            />
            {isDuplicate && (
              <div style={{ color: '#ff4444', fontSize: '14px', marginTop: '5px' }}>
                This player is already selected!
              </div>
            )}
            <datalist id={`players-${index}`}>
              {availablePlayers.map((playerData, nameIndex) => (
                <option key={nameIndex} value={playerData.name} />
              ))}
            </datalist>
          </div>
        );
      })}
      <button
        onClick={handleConfirm}
        style={{
          padding: '12px 24px',
          backgroundColor: '#db6403ff',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginTop: '10px'
        }}
      >
        Confirm
      </button>
      
      {generatedUrl && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          border: '1px solid #ffd29fff',
          borderRadius: '8px',
          backgroundColor: '#ffd29fff'
        }}>
          <h3>Your Custom Game URL:</h3>
          <a
            href={generatedUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#000000ff',
              textDecoration: 'underline',
              fontSize: '16px',
              wordBreak: 'break-all'
            }}
          >
            {generatedUrl}
          </a>
        </div>
      )}
    </div>
  );
}