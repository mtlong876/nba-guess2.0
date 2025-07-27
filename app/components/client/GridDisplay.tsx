'use client';
import { useState, useEffect,useRef} from 'react';
import { checkPlayerGuess,checkDailyGuess,getDailyName} from '../../actions/playerActions';
import { on } from 'events';
import { get } from 'http';

type GridDisplayProps = {
  csvData: { [key: string]: string }[];
  difficulty: "easy"| "medium"| "hard"| "chaos"| "recentP"| "recentS";
  daily: boolean;
  playerFilename: string;
  allPlayerNames: string[];
  onStatusChange?: (difficulty: "easy"| "medium"| "hard"| "chaos"| "recentP"| "recentS", status: "incomplete" | "completed" | "failed") => void;
  setScore: (newScore: number) => void;
  setMulti: (newMulti: number) => void;
  dailyId: number;
};
const defaultValues = {
  points: 200,
  guesses:3
}
export default function GridDisplay({ csvData, difficulty ,daily,playerFilename,allPlayerNames, onStatusChange,setScore,setMulti,dailyId}: GridDisplayProps) {
  const [visibleColumns, setVisibleColumns] = useState<{ [key: string]: boolean }>({});
  const [points, setPoints] = useState(defaultValues.points);
  const [status, setStatus] = useState<"incomplete" | "completed" | "failed">("incomplete");
  const [currentGuessesLeft, setCurrentGuessesLeft] = useState<number>(defaultValues.guesses); // Replace with actual logic to track guesses left
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [correctGuess , setCorrectGuess] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const headers = csvData.length > 0 ? Object.keys(csvData[0]) : [];
 


  const getPointCost = (header: string) => headerPointCost[header] ?? 10;
  const headerPointCost: { [key: string]: number } = {
  "Season": 50,
  "Team": 75,
  "MIN": 5,
  "GP/GS": 15,
  "PTS": 25,
  "REB": 10,
  "AST": 10,
  "STL": 10,
  "BLK": 10,
  // "TOV": 5,
  // "PF": 5,
  "FG%": 5,
  "3P%": 5,
  "FT%": 5
  };
  let changingDiffculty: "easy" | "medium" | "hard" | "chaos" | "recentP" | "recentS" | null = difficulty;
  
useEffect(() => {
  if (status === "completed" || status === "failed") {
    getDailyName(difficulty).then((name) => {
      console.log("Daily player name:", name);
      setPlayerName(name); // if you want to display it
    });
  }
}, [status, difficulty]);
  

  useEffect(() => {
    console.log("difficulty changed:", difficulty);
    changingDiffculty = difficulty;
    
    const savedStatus = localStorage.getItem(`status_${difficulty}`);
    const savedGuesses = localStorage.getItem(`guesses_${difficulty}`);
    const savedPoints = localStorage.getItem(`points_${difficulty}`);
    const savedVisible = localStorage.getItem(`visibleColumns_${difficulty}`);
    setStatus((savedStatus as "completed" | "failed" | null) || "incomplete");
    if (savedVisible) {
      try {
        setVisibleColumns(JSON.parse(savedVisible));
      } catch (error) {
        console.error('Error parsing saved visible columns:', error);
      }
    } else {
      setVisibleColumns({});
    }
    if (savedPoints) {
      try {
        setPoints(parseInt(savedPoints, 10));
      } catch (error) {
        console.error('Error parsing saved points:', error);
        setPoints(defaultValues.points); // Reset to default if parsing fails
      }
    } else {
      setPoints(defaultValues.points); // Reset to default if no saved points
    }
    if (savedGuesses) {
      try {
        setCurrentGuessesLeft(parseInt(savedGuesses, 10));
      } catch (error) {
        console.error('Error parsing saved guesses:', error);
        setCurrentGuessesLeft(defaultValues.guesses); // Reset to default if parsing fails
      }
    } else {
      setCurrentGuessesLeft(defaultValues.guesses); // Reset to default if no saved guesses
    }
    changingDiffculty = null;
  }, [difficulty]);


  useEffect(() => {
    if (difficulty != changingDiffculty) {
      return;
    }
    saveProgress();
  },[status,visibleColumns,points,currentGuessesLeft]);

  const saveProgress = () => {
    localStorage.setItem(`status_${difficulty}`, status);
    localStorage.setItem(`visibleColumns_${difficulty}`, JSON.stringify(visibleColumns));
    localStorage.setItem(`points_${difficulty}`, points.toString());
    localStorage.setItem(`guesses_${difficulty}`, currentGuessesLeft.toString());
    // console.log(`Progress saved for ${difficulty}:`, {
    //   status,
    //   visibleColumns,
    //   points,
    //   currentGuessesLeft
    // });
  }

  const toggleAllColumns = () => {
    const allVisible: { [key: string]: boolean } = {};
    headers.forEach(header => {
      allVisible[header] = true;
    });
    setVisibleColumns(allVisible);
  }

  const toggleColumn = (column: string) => {
    const cost = getPointCost(column);
    if (!visibleColumns[column] && points >= cost && status === "incomplete") {
      setVisibleColumns(prev => ({
        ...prev,
        [column]: true
      }));
      setPoints(prev => prev - cost);
    }
  };

 
  const handleComplete = () => {
    setCorrectGuess(true);
    setStatus("completed");
    onStatusChange?.(difficulty, "completed");
    setScore(points);
    toggleAllColumns(); // Show all columns on complete
    switch (currentGuessesLeft) {
      case 3:{
        setMulti(2);
        break;
      }
      case 2:{
        setMulti(1.5);
        break;
      }
      case 1:{
        setMulti(1);
        break;
      }
    }
    setCurrentGuessesLeft(0); // Reset guesses left
  };

  // Example: Call this when the user runs out of guesses
  const handleFail = () => {
    setStatus("failed");
    onStatusChange?.(difficulty, "failed");
    setCurrentGuessesLeft(0);
    setPoints(0);
    toggleAllColumns(); // Show all columns on fail
  };


  const isCurrentPlayerGuessed = correctGuess; // Replace with actual logic to check if the current player is guessed
  const isInputDisabled = status != "incomplete" // Disable input if player is guessed or no guesses left
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    const isCurrentPlayerGuessed = correctGuess || false;
    
    if (e.key === 'Enter' && !isChecking && currentGuessesLeft > 0 && !isCurrentPlayerGuessed) {
      handleGuess();
    }
  };

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
          console.log("Daily guess result:", result);
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
        Player Stats:
        {(status === "completed" || status === "failed") && (
          <span style={{ marginLeft: 12, color: "#4CAF50", fontWeight: "bold" }}>
            {playerName}
          </span>
        )}
      </h2>
      <div style={{ marginBottom: '10px', fontWeight: 'bold', fontSize: '18px' }}>
        Points: {points}
      </div>
      {/* Status display */}
      {status === "completed" && (
        <div style={{ color: "#4CAF50", fontWeight: "bold", marginBottom: 8 }}>Completed!</div>
      )}
      {status === "failed" && (
        <div style={{ color: "#ff4444", fontWeight: "bold", marginBottom: 8 }}>Failed!</div>
      )}
      {/* Reset Progress button */}
      {process.env.NEXT_PUBLIC_DEV_MODE == "ON" && (
        <div style={{ marginBottom: '10px' }}>
          <button
            onClick={() => {
              localStorage.removeItem(`visibleColumns_${difficulty}`);
              localStorage.removeItem(`points_${difficulty}`);
              localStorage.removeItem(`status_${difficulty}`);
              localStorage.removeItem(`guesses_${difficulty}`);
              setCurrentGuessesLeft(defaultValues.guesses); // Reset guesses left
              setVisibleColumns({});
              setPoints(defaultValues.points); // Reset points
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
      { process.env.NEXT_PUBLIC_DEV_MODE == "ON" && (
        <div style={{ marginBottom: 10 }}>
          <button onClick={handleComplete} style={{ marginRight: 8 }}>Simulate Complete</button>
          <button onClick={handleFail}>Give up</button>
        </div>
      )}
      {/* Table */}
      {csvData.length > 0 ? (
        <table style={{ 
          borderCollapse: 'collapse', 
          width: '100%',
          tableLayout: 'fixed'
        }}>
          <thead>
            {/* Point cost row */}
            <tr>
              {headers.map((header) => (
                <th
                  key={`cost-${header}`}
                  style={{
                    border: '1px solid #ddd',
                    padding: '4px',
                    textAlign: 'center',
                    backgroundColor: '#fffbe6',
                    fontWeight: 'normal',
                    fontSize: '12px'
                  }}
                >
                  Cost: {getPointCost(header)}
                </th>
              ))}
            </tr>
            {/* Button row */}
            <tr>
              {headers.map((header) => (
                <th 
                  key={`btn-${header}`}
                  style={{ 
                    border: '1px solid #ddd', 
                    padding: '4px',
                    textAlign: 'center',
                    backgroundColor: '#f9f9f9',
                    width: `${100 / headers.length}%`
                  }}
                >
                  <button
                    onClick={() => {
                      toggleColumn(header);
                    }}
                    disabled={visibleColumns[header] || status !== "incomplete"}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: visibleColumns[header] 
                        ? '#4CAF50' 
                        : '#e0e0e0',
                      color: visibleColumns[header] 
                        ? 'white' 
                        : 'black',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: visibleColumns[header] ? 'not-allowed' : 'pointer',
                      fontSize: '11px',
                      opacity: visibleColumns[header] ? 0.6 : 1,
                      width: '100%'
                    }}
                  >
                    {visibleColumns[header] ? '👁️' : '🚫'}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Header row - now second */}
            <tr>
              {headers.map((header) => (
                <td 
                  key={header}
                  style={{ 
                    border: '1px solid #ddd', 
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
                    border: '1px solid #ddd',
                    padding: '8px',
                    textAlign: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {visibleColumns[header] ? row[header] : "‎"}
                </td>
              ))}
            </tr>
          ))}
          </tbody>
        </table>
      ) : (
        <p>No data available</p>
      )}

      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
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