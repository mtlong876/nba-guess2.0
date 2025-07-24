'use client';
//npx react-scan localhost:3000

import { useRef, useState ,useEffect, use } from 'react';
import GridSwitcherClient from '../client/GridSwitcherClient';
import GridDisplay from '../client/GridDisplay';
import { getAllPlayerNames} from '../../actions/playerActions';
import { get } from 'http';

type GridSharedProps = {
    tables: any[];
    allPlayerData: any[];
    dailyId: number; // or string, depending on your data
};
type Difficulty = "easy" | "medium" | "hard" | "chaos" | "recentP" | "recentS";
type Status = "incomplete" | "completed" | "failed";
const difficulties: Difficulty[] = [
  "easy", "medium", "hard", "chaos", "recentP", "recentS"
];

export default function GridShared({tables, allPlayerData,dailyId}: GridSharedProps) {
    const [showPopup, setShowPopup] = useState(false);
    const didMount = useRef(false);
    const [allCompleteOrFailed, setAllCompleteOrFailed] = useState(false);
    const [allPlayerNames, setAllPlayerNames] = useState<string[]>([]);
    const [status, setStatus] = useState<Record<Difficulty, Status>>({
        easy: "incomplete",
        medium: "incomplete",
        hard: "incomplete",
        chaos: "incomplete",
        recentP: "incomplete",
        recentS: "incomplete",
    });
    const [score, setScore] = useState<Record<Difficulty, number>>({
        easy: 0,
        medium: 0,
        hard: 0,
        chaos: 0,
        recentP: 0,
        recentS: 0,
    });
    const [multi, setMulti] = useState<Record<Difficulty, number>>({
        easy: 0,
        medium: 0,
        hard: 0,
        chaos: 0,
        recentP: 0,
        recentS: 0,
    });
    const totalScore = Object.values(score).reduce((sum, val) => sum + val, 0);
    const totalMulti = Object.values(multi).reduce((sum, val) => sum + val, 0);
    const finalScore = totalScore * totalMulti;
    useEffect(() => {
    const loadPlayerNames = async () => {
      const names = await getAllPlayerNames();
      setAllPlayerNames(names);
    };
    loadPlayerNames();
    }, []);

    
    
    const [statusLoaded, setStatusLoaded] = useState(false);
    const loadedRef = useRef(false);

    const handleStatusChange = (difficulty: Difficulty, newStatus: Status) => {
        setStatus(prevStatus => ({
            ...prevStatus,
            [difficulty]: newStatus,
        }));
    };
    useEffect(() => {
        const allComplete = Object.values(status).every(
            (s) => s === "completed" || s === "failed"
        );
        console.log('All complete or failed:', allComplete);
        setAllCompleteOrFailed(allComplete);
        if (allComplete) {
            setShowPopup(true);
        }
    }, [status]);
    
    const shareString = "Nba-guess: " + Math.floor((dailyId-1753282834)/86400) + " " + difficulties.map(diff =>
        status[diff] === "completed" ? "✅" : "❌"
        ).join("") + " Score: " + finalScore + " https://NBA-Guess.com";

    useEffect(() => {
        if (!didMount.current) {
            didMount.current = true;
            return;
        }
        localStorage.setItem('score', JSON.stringify(score));
        localStorage.setItem('multi', JSON.stringify(multi));
    }, [score,multi]);

    useEffect(() => {
        if (loadedRef.current) return;
        loadedRef.current = true;

        const loadedStatus: Record<Difficulty, Status> = { ...status };
        let changed = false;
        difficulties.forEach((diff) => {
            const stored = localStorage.getItem(`status_${diff}`);
            if (stored === "completed" || stored === "failed" || stored === "incomplete") {
                console.log(`Loaded status for ${diff}:`, stored);
                if (loadedStatus[diff] !== stored) {
                    loadedStatus[diff] = stored;
                    changed = true;
                }
            }
        });
        const storedScore = localStorage.getItem('score');
        if (storedScore) {
            const parsedScore = JSON.parse(storedScore);
            setScore(prev => ({ ...prev, ...parsedScore }));
        }
        const storedMulti = localStorage.getItem('multi');
        if (storedMulti) {
            const parsedMulti = JSON.parse(storedMulti);
            setMulti(prev => ({ ...prev, ...parsedMulti }));
        }
        if (changed) {
            setStatus(loadedStatus);
        }
        setStatusLoaded(true);
    }, []);

    if (!statusLoaded){ return null;}

    return (
        <div>
            <div style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: '16px' }}>
                Total Score: {totalScore} x Multi: {totalMulti} = Final Score: {finalScore}
            </div>
            {process.env.NEXT_PUBLIC_DEV_MODE == "ON" && (
                <button
                onClick={() => {
                    setScore({
                        easy: 0,
                        medium: 0,
                        hard: 0,
                        chaos: 0,
                        recentP: 0,
                        recentS: 0,
                    });
                    setMulti({
                        easy: 0,
                        medium: 0,
                        hard: 0,
                        chaos: 0,
                        recentP: 0,
                        recentS: 0,
                    });
                    localStorage.removeItem('score');
                    localStorage.removeItem('multi');
                }}
                style={{
                    marginBottom: '16px',
                    padding: '10px 20px',
                    backgroundColor: '#ff4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px'
                }}
                >
                    Reset Score & Multiplier
                </button>
            )}
            <GridSwitcherClient
                tables={tables}
                status={status}
            >
                {tables.map((table, index) => (
                    <GridDisplay
                        key={table.difficulty}
                        csvData={allPlayerData[index].csvData}
                        playerFilename={allPlayerData[index].playerFilename}
                        difficulty={table.difficulty}
                        daily={table.daily}
                        allPlayerNames={allPlayerNames}
                        onStatusChange={handleStatusChange}
                        setScore={(newScore) =>
                            setScore(prev => ({
                            ...prev,
                            [table.difficulty as Difficulty]: newScore
                            }))
                        }
                        setMulti={(newMulti) =>
                            setMulti(prev => ({
                            ...prev,
                            [table.difficulty as Difficulty]: newMulti
                            }))
                        }
                    />
                ))}
            </GridSwitcherClient>
            {allCompleteOrFailed && (
                <button onClick={() => setShowPopup(true)}>
                    Show Popup
                </button>
            )}
            {showPopup && (
                <div
                    style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        padding: '24px',
                        zIndex: 1000,
                        minWidth: '300px',
                        minHeight: '150px'
                    }}
                >
                    {/* Close button as red X in top right */}
                    <button
                        onClick={() => setShowPopup(false)}
                        style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: 'none',
                            border: 'none',
                            color: '#ff4444',
                            fontSize: '24px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            lineHeight: '1'
                        }}
                        aria-label="Close"
                    >
                        ×
                    </button>
                    <div style={{ marginBottom: 16,marginTop: 16 }}>
                        <h2 style={{ margin: 0, fontSize: '20px', textAlign: 'center' }}>
                            {allCompleteOrFailed ? "All Grids Completed!" : "Grids In Progress"}
                        </h2>
                        <div style = {{marginTop: 10}}>
                            {shareString.replace('https://NBA-Guess.com', '')}
                            <a href="https://NBA-Guess.com" target="_blank" rel="noopener noreferrer">
                                NBA-Guess.com
                            </a>
                        </div>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(shareString);
                            }}
                            style={{
                                marginTop: 18,
                                padding: '6px 12px',
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Copy to Clipboard
                        </button>
                    </div>
                </div>
            )}
        </div>
        
    );
}