'use client';
import { useState, useEffect} from 'react';
import { checkPlayerGuess,checkDailyGuess,getDailyName,getDailyInitials} from '../../actions/playerActions';

type GridDisplayProps = {
  csvData: { [key: string]: string }[];
  difficulty: "easy"| "medium"| "hard"| "chaos"| "recentP"| "recentS";
  daily: boolean;
  playerFilename: string;
  allPlayerNames: string[];
  onStatusChange?: (difficulty: "easy"| "medium"| "hard"| "chaos"| "recentP"| "recentS", status: "incomplete" | "completed" | "failed") => void;
  setGuessed: (newGuessed: number) => void;
  dailyId: number;
};
const defaultValues = {
  guesses:3
}
export default function GridDisplay({ csvData, difficulty ,daily,playerFilename,allPlayerNames, onStatusChange,setGuessed,dailyId}: GridDisplayProps) {
  const [status, setStatus] = useState<"incomplete" | "completed" | "failed">("incomplete");
  const [currentGuessesLeft, setCurrentGuessesLeft] = useState<number>(defaultValues.guesses); // Replace with actual logic to track guesses left
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [correctGuess , setCorrectGuess] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [playerInitials, setPlayerInitials] = useState("");
  const headers = csvData.length > 0 ? Object.keys(csvData[0]) : [];

  function localInitials(difficulty:string) {
    const cachedInitials = localStorage.getItem(`dailyInitials_${difficulty}`);
    if (cachedInitials) {
      setPlayerInitials(cachedInitials);
      return cachedInitials;
    }else{
      getDailyInitials(difficulty).then((initials) => {
        setPlayerInitials(initials);
        localStorage.setItem(`dailyInitials_${difficulty}`, initials);
        return initials;
      });
    }
  }

  useEffect(() => {
    if (status === "completed" || status === "failed") {
      const cachedName = localStorage.getItem(`dailyName_${difficulty}`);
      if (cachedName) {
        setPlayerName(cachedName);
      }else{
      getDailyName(difficulty).then((name) => {
        setPlayerName(name); // if you want to display it
        localStorage.setItem(`dailyName_${difficulty}`, name);
      });
    }
    }
  }, [status, difficulty]);
  

  useEffect(() => {
    console.log("difficulty changed:", difficulty);
    
    const savedStatus = localStorage.getItem(`status_${difficulty}`);
    const savedGuesses = localStorage.getItem(`guesses_${difficulty}`);
    setStatus((savedStatus as "completed" | "failed" | null) || "incomplete");
    if (savedGuesses) {
      try {
        setCurrentGuessesLeft(parseInt(savedGuesses, 10));
        if (parseInt(savedGuesses, 10) == 1) {
          localInitials(difficulty);
        }
      } catch (error) {
        console.error('Error parsing saved guesses:', error);
        setCurrentGuessesLeft(defaultValues.guesses); // Reset to default if parsing fails
      }
    } else {
      setCurrentGuessesLeft(defaultValues.guesses); // Reset to default if no saved guesses
    }
  }, [difficulty]);
 
  const handleComplete = () => {
    setCorrectGuess(true);
    setStatus("completed");
    localStorage.setItem(`status_${difficulty}`, "completed");
    onStatusChange?.(difficulty, "completed");
    switch (currentGuessesLeft) {
      case 3:{
        setGuessed(3);
        break;
      }
      case 2:{
        setGuessed(2);
        break;
      }
      case 1:{
        setGuessed(1);
        break;
      }
    }
    setCurrentGuessesLeft(0); // Reset guesses left
    localStorage.setItem(`guesses_${difficulty}`, "0");
  };

  // Example: Call this when the user runs out of guesses
  const handleFail = () => {
    setStatus("failed");
    localStorage.setItem(`status_${difficulty}`, "failed");
    onStatusChange?.(difficulty, "failed");
    setCurrentGuessesLeft(0);
    localStorage.setItem(`guesses_${difficulty}`, "0");
  };


  const isCurrentPlayerGuessed = status == "completed"; // Replace with actual logic to check if the current player is guessed
  const isInputDisabled = status != "incomplete" // Disable input if player is guessed or no guesses left
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    const isCurrentPlayerGuessed = correctGuess || false;
    
    if (e.key === 'Enter' && !isChecking && currentGuessesLeft > 0 && !isCurrentPlayerGuessed) {
      handleGuess();
    }
  };
  function skipGuess() {
    setGuess('');
    setCurrentGuessesLeft(prev => prev - 1);
    localStorage.setItem(`guesses_${difficulty}`, (currentGuessesLeft - 1).toString());
    if (currentGuessesLeft - 1 <= 0) {
      handleFail();
      setFeedback('No guesses remaining! Please try again tomorrow.');
    }
    if (currentGuessesLeft - 1 == 1)  {
      localInitials(difficulty);
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
        let result: any;
        if (!daily){
          const currentPlayerFilename = playerFilename;
          result = await checkPlayerGuess(guess, currentPlayerFilename);
          setFeedback(result.message);
        }else{
          result = await checkDailyGuess(guess, difficulty);
          setFeedback(result.message);
        }
        if (result.correct) {
          setGuess(''); // Clear input on correct guess
          handleComplete();
          // if (onStatusChange) {
          //   onStatusChange(difficulties[selected], "completed");
          // }
        } else {
          setGuess('');
          setCurrentGuessesLeft(prev => prev - 1);
          localStorage.setItem(`guesses_${difficulty}`, (currentGuessesLeft - 1).toString());
          if (currentGuessesLeft - 1 <= 0) {
            handleFail();
            setFeedback('No guesses remaining! Please try again tomorrow.');
          }
          if (currentGuessesLeft - 1 == 1)  {
            localInitials(difficulty);
          }
        }
      } catch (error) {
        setFeedback('Error checking guess. Please try again.');
      } finally {
        setIsChecking(false);
      }
    };
  return (
    <div>
      <h2>
        Player Name:
        {(status === "completed" || status === "failed") && (
          <span style={{ marginLeft: 12, color: "#4CAF50", fontWeight: "bold" }}>
            {playerName}
          </span>
        )}
        {(currentGuessesLeft === 1) && (
          <span style={{ marginLeft: 12, color: "#4CAF50", fontWeight: "bold" }}>
            {playerInitials|| "Loading..."}
          </span>
        )
        }
      </h2>
      {/* Reset Progress button */}
      {process.env.NEXT_PUBLIC_DEV_MODE == "ON" && (
        <div style={{ marginBottom: '10px' }}>
          <button
            onClick={() => {
              localStorage.removeItem(`status_${difficulty}`);
              localStorage.removeItem(`guesses_${difficulty}`);
              setCurrentGuessesLeft(defaultValues.guesses); // Reset guesses left
              setStatus("incomplete");
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ff4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reset Progress
          </button>
        </div>
      )}
      {/* For demonstration, add buttons to simulate complete/fail */}
      
        
      {/* Table */}
      {csvData.length > 0 ? (
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
            {csvData.map((row, index) => (
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

      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#ffd29fff', borderRadius: '8px' }}>
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
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
    </div>
  );
}