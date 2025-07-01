'use client';

import { useState, useEffect,useRef } from 'react';
import { checkPlayerGuess, getAllPlayerNames , checkDailyGuess} from '../../actions/playerActions';
import GridDisplay from './GridDisplay';


type GridSwitcherClientProps = {
  tables: {
    title: string;
    difficulty: string;
    daily: boolean;
  }[];
  playerData: {
    csvData: { [key: string]: string }[];
    playerFilename: string;
  }[];
  children: React.ReactNode[];
  onStatusChange?: (difficulty: "easy"| "medium"| "hard"| "chaos"| "recentP"| "recentS", status: "incomplete" | "completed" | "failed") => void;
};

export default function GridSwitcherClient({ tables, playerData, children ,onStatusChange}: GridSwitcherClientProps) {
  const [selected, setSelected] = useState(0);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [allPlayerNames, setAllPlayerNames] = useState<string[]>([]);
  const [guessesRemaining, setGuessesRemaining] = useState<{ [key: number]: number }>({});
  const [correctGuesses, setCorrectGuesses] = useState<{ [key: number]: boolean }>({});
  const difficulties: ("easy" | "medium" | "hard" | "chaos" | "recentP" | "recentS")[] = ["easy", "medium", "hard", "chaos", "recentP", "recentS"];
  const prevStatusRef = useRef<{ [key: number]: string }>({});
  // useEffect(() => {
  //   if (!onStatusChange) return;

  //   const guessesLeft = guessesRemaining[selected] || 0;
  //   const isSolved = correctGuesses[selected] || false;
  //   let status: "incomplete" | "completed" | "failed" = "incomplete";
  //   if (isSolved) status = "completed";
  //   else if (guessesLeft <= 0) status = "failed";

  //   // Only call if status actually changed for this difficulty
  //   if (prevStatusRef.current[selected] !== status) {
  //     console.log(`Status changed to: ${status} for difficulty: ${difficulties[selected]} switcher`);
  //     onStatusChange(difficulties[selected], status);
  //     prevStatusRef.current[selected] = status;
  //   }
  // }, [guessesRemaining, correctGuesses, selected, onStatusChange, tables]);
  // Initialize guesses remaining for each difficulty
  useEffect(() => {
    const initialGuesses: { [key: number]: number } = {};
    tables.forEach((_, index) => {
      initialGuesses[index] = 3; // Starting value of 3
    });
    setGuessesRemaining(initialGuesses);
  }, [tables]);

  // Load player names on component mount
  useEffect(() => {
    const loadPlayerNames = async () => {
      const names = await getAllPlayerNames();
      setAllPlayerNames(names);
    };
    loadPlayerNames();
  }, []);

  const handleGuess = async () => {
    if (guess.trim() === '') {
      setFeedback('Please enter a guess!');
      return;
    }
    
    const currentGuessesLeft = guessesRemaining[selected] || 0;
    if (currentGuessesLeft <= 0) {
      setFeedback('No guesses remaining for this difficulty!');
      return;
    }

    setIsChecking(true);
    
    try {
      let result: any;
      if (!tables[selected].daily){
        const currentPlayerFilename = playerData[selected].playerFilename;
        
        result = await checkPlayerGuess(guess, currentPlayerFilename);
        setFeedback(result.message);
      }else{
        result = await checkDailyGuess(guess, selected);
        setFeedback(result.message);
      }
      if (result.correct) {
        setGuess(''); // Clear input on correct guess
        // Mark this difficulty as correctly guessed
        setCorrectGuesses(prev => ({
          ...prev,
          [selected]: true
        }));
        if (onStatusChange) {
          onStatusChange(difficulties[selected], "completed");
        }
      } else {
        // Decrease guesses remaining for this difficulty
        setGuessesRemaining(prev => ({
          ...prev,
          [selected]: Math.max(0, (prev[selected] || 0) - 1)
        }));
      }
    } catch (error) {
      setFeedback('Error checking guess. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    const currentGuessesLeft = guessesRemaining[selected] || 0;
    const isCurrentPlayerGuessed = correctGuesses[selected] || false;
    
    if (e.key === 'Enter' && !isChecking && currentGuessesLeft > 0 && !isCurrentPlayerGuessed) {
      handleGuess();
    }
  };

  const currentGuessesLeft = guessesRemaining[selected] || 0;
  const isCurrentPlayerGuessed = correctGuesses[selected] || false;
  const isInputDisabled = isChecking || currentGuessesLeft <= 0 || isCurrentPlayerGuessed;

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        {tables.map((table, index) => {
          const guessesLeft = guessesRemaining[index] || 0;
          const isSolved = correctGuesses[index] || false;
          const isFailed = guessesLeft <= 0 && !isSolved;
          
          return (
            <button 
              key={index}
              onClick={() => {
                setSelected(index);
                setFeedback(''); // Clear feedback when switching
                setGuess(''); // Clear guess when switching
              }}
              style={{
                margin: '0 8px',
                padding: '8px 16px',
                backgroundColor: selected === index ? '#4CAF50' : '#f0f0f0',
                color: selected === index ? 'white' : 'black',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              {table.title}
              {isSolved && (
                <span style={{ 
                  position: 'absolute', 
                  top: '-5px', 
                  right: '-5px', 
                  backgroundColor: '#4CAF50', 
                  color: 'white', 
                  borderRadius: '50%', 
                  width: '20px', 
                  height: '20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '12px' 
                }}>
                  ✓
                </span>
              )}
              {isFailed && (
                <span style={{ 
                  position: 'absolute', 
                  top: '-5px', 
                  right: '-5px', 
                  backgroundColor: '#ff4444', 
                  color: 'white', 
                  borderRadius: '50%', 
                  width: '20px', 
                  height: '20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '12px' 
                }}>
                  ✗
                </span>
              )}
              {!isSolved && !isFailed && (
                <span style={{ 
                  position: 'absolute', 
                  top: '-5px', 
                  right: '-5px', 
                  backgroundColor: '#ffa500', 
                  color: 'white', 
                  borderRadius: '50%', 
                  width: '20px', 
                  height: '20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '12px' 
                }}>
                  {guessesLeft}
                </span>
              )}
            </button>
          );
        })}
      </div>
      
      <div>
        {children[selected]}
      </div>

      {/* Player guess input */}
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
            onKeyPress={handleKeyPress}
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