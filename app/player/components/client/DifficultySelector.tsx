'use client';
import { useState,useEffect, use } from 'react';
import { getAllPlayerNames, getPlayerData } from '@/app/actions/playerActions';

const difficulties = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
  { value: 'chaos', label: 'Chaos' },
  { value: 'extreme', label: 'Extreme'},
  { value: 'recentP', label: 'Recent Players' },
  { value: 'recentS', label: 'Recent Starters' },
];

export default function DifficultySelector({ allPlayerNames }: { allPlayerNames: string[] }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');
  const [currentGuessesLeft, setCurrentGuessesLeft] = useState(3);
  const [guess, setGuess] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [playerInitials, setPlayerInitials] = useState("");
  const [playerData, setPlayerData] = useState<{ csvData: { [key: string]: string }[]; playerFilename: string } | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [correctGuess , setCorrectGuess] = useState(false);
  const [status, setStatus] = useState<"incomplete" | "completed" | "failed">("incomplete");



  const headers = playerData?.csvData && playerData.csvData.length > 0 ? Object.keys(playerData.csvData[0]) : [];


  const getData = async () => {
    const res = await fetch(`/api/playerData?difficulty=${selectedDifficulty}&daily=false`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`, // Replace with your actual token
          // Add other headers if needed
        },
      }
    );
    const data = await res.json();
    setPlayerData({ ...data, csvData: [...data.csvData].reverse() });
    setPlayerName(data.playerFilename.split('_').slice(0, -1).join(' '));
    setCurrentGuessesLeft(3); // Reset guesses for new difficulty
    setGuess('');
    setFeedback('');
    setCorrectGuess(false);
    setStatus("incomplete");
    setPlayerInitials(''); // Reset initials
    localInitials();

  };

  function localInitials() {
      const parts = playerData?.playerFilename.split('_').slice(0,-1);
      if (parts){
        if (parts.length < 2) {
            const initial = playerData?.playerFilename.charAt(0).toUpperCase()
            if (initial) {
                setPlayerInitials(initial);
                return playerData?.playerFilename.charAt(0).toUpperCase();
            }
        }
        const initials: string = parts.map((part: string) => part.charAt(0).toUpperCase()).join(' ');
        setPlayerInitials(initials);
        return initials;
        }
  }

  useEffect(() => {
    getData();
  }, [selectedDifficulty]);


function checkPlayerGuess(guess: string, playerFilename: string) {
  try {
    // Extract player name from filename (remove .csv and ID)
    const actualPlayerName = playerFilename
      .replace('.csv', '')
      .replace(/_\d+$/, '') // Remove ID at end
      .replace(/_/g, ' '); // Replace underscores with spaces    
    const normalizedGuess = guess.toLowerCase().trim();
    const normalizedActual = actualPlayerName.toLowerCase().trim();
    if (normalizedGuess === normalizedActual) {
      return {
        correct: true,
        message: `🎉 Correct! It was ${actualPlayerName}!`,
        playerName: actualPlayerName // Return the actual player name for display
      };
    } else {
      return {
        correct: false,
        message: `❌ Incorrect. Try again!`
      };
    }
  } catch (error) {
    return {
      correct: false,
      message: 'Error checking guess. Please try again.'
    };
  }
}

  const isCurrentPlayerGuessed = status == "completed"; // Replace with actual logic to check if the current player is guessed
  const isInputDisabled = status != "incomplete" // Disable input if player is guessed or no guesses left
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    const isCurrentPlayerGuessed = correctGuess || false;
    
    if (e.key === 'Enter' && !isChecking && currentGuessesLeft > 0 && !isCurrentPlayerGuessed) {
      handleGuess();
    }
  };

  const handleComplete = () => {
    setCorrectGuess(true);
    setStatus("completed");
    setCurrentGuessesLeft(0); // Reset guesses left
  };
  const handleFail = () => {
    setStatus("failed");
    setCurrentGuessesLeft(0);
  };

  function skipGuess() {
      setGuess('');
      setCurrentGuessesLeft(prev => prev - 1);
      if (currentGuessesLeft - 1 <= 0) {
        handleFail();
        setFeedback('No guesses remaining! Please try again tomorrow.');
      }
      if (currentGuessesLeft - 1 == 1)  {
        localInitials();
      }
    }
    const handleGuess = async () => {
        if (guess.trim() === '') {
          setFeedback('Please enter a guess!');
          return;
        }
        
        if (currentGuessesLeft <= 0) {
          setFeedback('No guesses remaining for this difficulty!');
          return;
        }
    
        setIsChecking(true);
        
        try {
          
          const currentPlayerFilename = playerData?.playerFilename;
          if (!currentPlayerFilename) {
            setFeedback('No player data available. Please try again later.');
            return;
          }
          const result = checkPlayerGuess(guess, currentPlayerFilename);
          setFeedback(result.message);
          
          if (result.correct) {
            setGuess(''); // Clear input on correct guess
            handleComplete();
            // if (onStatusChange) {
            //   onStatusChange(difficulties[selected], "completed");
            // }
          } else {
            setGuess('');
            setCurrentGuessesLeft(prev => prev - 1);
            if (currentGuessesLeft - 1 <= 0) {
              handleFail();
              setFeedback('No guesses remaining! Please try again tomorrow.');
            }
            if (currentGuessesLeft - 1 == 1)  {
              localInitials();
            }
          }
        } catch (error) {
          setFeedback('Error checking guess. Please try again.');
        } finally {
          setIsChecking(false);
        }
      };

  return (
    <>
    <div style={{ margin: '40px auto', maxWidth: 400, textAlign: 'center' }}>
      <label htmlFor="difficulty" style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
        Select Difficulty:
      </label>
      <br />
      <select
        id="difficulty"
        value={selectedDifficulty}
        onChange={e => setSelectedDifficulty(e.target.value)}
        style={{
          margin: '20px 0',
          padding: '10px',
          fontSize: '1rem',
          borderRadius: '4px',
          border: '1px solid #ccc',
          width: '100%',
        }}
      >
        {difficulties.map(diff => (
          <option key={diff.value} value={diff.value}>
            {diff.label}
          </option>
        ))}
      </select>
      <br />
      </div>
      <div >
        <h2>
        Player Name:
        {(status === "completed" || status === "failed") && (
          <span style={{ marginLeft: 12, color: "#000000ff", fontWeight: "bold" }}>
            {playerName}
          </span>
        )}
        {(currentGuessesLeft === 1) && (
          <span style={{ marginLeft: 12, color: "#000000ff", fontWeight: "bold" }}>
            {playerInitials|| "Loading..."}
          </span>
        )
        }
      </h2>
      {playerData?.csvData && playerData.csvData.length > 0 ? (
        <table style={{ 
          borderCollapse: 'collapse', 
          width: '100%',
          tableLayout: 'fixed'
        }}>
          <tbody>
            {/* Header row - now second */}
            <tr>
              {headers.map((header) => (
                <td 
                  key={header}
                  style={{ 
                    border: '1px solid #000000ff', 
                    padding: '8px', 
                    backgroundColor: '#f2f2f2',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {header}
                </td>
              ))}
            </tr>
            {/* Data rows */}
            {playerData?.csvData.map((row, index) => (
            <tr key={index}>
              {headers.map((header) => (
                <td
                  key={header}
                  style={{
                    border: '1px solid #000000ff',
                    backgroundColor: '#ffd29fff',
                    padding: '8px',
                    textAlign: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {header != "Team" || currentGuessesLeft<3 ? row[header] : "???"}
                </td>
              ))}
            </tr>
          ))}
          </tbody>
        </table>
      ) : (
        <p>No data available</p>
      )}
    </div>
    <div style={{ marginTop: '10px', padding: '5px', backgroundColor: '#ffd29fff', borderRadius: '8px' }}>
        <h3>
          Guess the Player
          {isCurrentPlayerGuessed && (
            <span style={{ color: '#4CAF50', marginLeft: '10px' }}>✓ Solved!</span>
          )}
          {currentGuessesLeft <= 0 && !isCurrentPlayerGuessed && (
            <span style={{ color: '#ff4444', marginLeft: '10px' }}>✗ No guesses remaining!</span>
          )}
          {currentGuessesLeft > 0 && !isCurrentPlayerGuessed && (
            <span style={{ color: '#ffa500', marginLeft: '10px' }}>
              ({currentGuessesLeft} guess{currentGuessesLeft !== 1 ? 'es' : ''} remaining)
            </span>
          )}
        </h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' ,padding: '0 0 10px 0'}}>
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown = {handleKeyPress}
            placeholder={
              isCurrentPlayerGuessed 
                ? "Player already guessed!" 
                : currentGuessesLeft <= 0 
                  ? "No guesses remaining!" 
                  : "Enter player name..."
            }
            disabled={isInputDisabled}
            list="playerNames"
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              flex: '1',
              maxWidth: '300px',
              opacity: isInputDisabled ? 0.6 : 1,
              backgroundColor: isCurrentPlayerGuessed 
                ? '#d4edda' 
                : currentGuessesLeft <= 0 
                  ? '#f8d7da' 
                  : 'white'
            }}
          />
          <datalist id="playerNames">
            {allPlayerNames.map((playerName, index) => (
              <option key={index} value={playerName}>
                {playerName}
              </option>
            ))}
          </datalist>
          <button
            onClick={handleGuess}
            disabled={isInputDisabled}
            style={{
              padding: '10px 20px',
              backgroundColor: isCurrentPlayerGuessed 
                ? '#4CAF50' 
                : currentGuessesLeft <= 0
                  ? '#ff4444'
                  : isChecking 
                    ? '#cccccc' 
                    : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isInputDisabled ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {isCurrentPlayerGuessed 
              ? 'Solved!' 
              : currentGuessesLeft <= 0
                ? 'Failed!'
                : isChecking 
                  ? 'Checking...' 
                  : 'Guess'
            }
          </button>
          <button
            onClick={skipGuess}
            disabled={isInputDisabled || currentGuessesLeft <= 0}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ffa500',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isInputDisabled || currentGuessesLeft <= 0 ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            Skip
        </button>
        { process.env.NEXT_PUBLIC_DEV_MODE == "ON" && (
          <button onClick={handleComplete} style={{ marginRight: 8 }}>Simulate Complete</button>
          )}
          <button 
          onClick={handleFail}
          disabled={isInputDisabled}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ff4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isInputDisabled ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}>Give up</button>
          <button
            onClick={getData}
            style={{
                padding: '10px 20px',
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
                marginLeft: '8px'
            }}
            >
            Refresh
            </button>
        </div>
        {feedback && (
          <div style={{ 
            marginTop: '10px', 
            padding: '8px', 
            backgroundColor: feedback.includes('🎉') ? '#d4edda' : '#f8d7da', 
            border: `1px solid ${feedback.includes('🎉') ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '4px',
            color: feedback.includes('🎉') ? '#155724' : '#721c24'
          }}>
            {feedback}
          </div>
        )}
      </div>
    </>
  );
}