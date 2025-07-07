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
  const [guessesRemaining, setGuessesRemaining] = useState<{ [key: number]: number }>({});
  const [correctGuesses, setCorrectGuesses] = useState<{ [key: number]: boolean }>({});
  const difficulties: ("easy" | "medium" | "hard" | "chaos" | "recentP" | "recentS")[] = ["easy", "medium", "hard", "chaos", "recentP", "recentS"];
  const prevStatusRef = useRef<{ [key: number]: string }>({});

  useEffect(() => {
    const initialGuesses: { [key: number]: number } = {};
    tables.forEach((_, index) => {
      initialGuesses[index] = 3; // Starting value of 3
    });
    setGuessesRemaining(initialGuesses);
  }, [tables]);

  // Load player names on component mount

  const currentGuessesLeft = guessesRemaining[selected] || 0;
  const isCurrentPlayerGuessed = correctGuesses[selected] || false;

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
            </button>
          );
        })}
      </div>
      
      <div>
        {children[selected]}
      </div>

    </div>
  );
}