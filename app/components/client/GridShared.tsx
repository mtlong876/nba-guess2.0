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
    daily?: boolean; // optional prop to indicate if it's a daily grid
};
type Difficulty = "easy" | "medium" | "hard" | "chaos" | "recentP" | "recentS";
type Status = "incomplete" | "completed" | "failed";
const difficulties: Difficulty[] = [
  "easy", "medium", "hard", "chaos", "recentP", "recentS"
];

export default function GridShared({tables, allPlayerData,dailyId,daily}: GridSharedProps) {
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
    const [guessed, setGuessed] = useState<Record<Difficulty, number>>({
        easy: 0,
        medium: 0,
        hard: 0,
        chaos: 0,
        recentP: 0,
        recentS: 0,
    });

    useEffect(() => {
        const loadPlayerNames = async () => {
        const names = await getAllPlayerNames();
        setAllPlayerNames(names);
        };
        loadPlayerNames();
        if (daily) {
            const savedDailyId = localStorage.getItem('dailyId');
            if (savedDailyId) {
                if (savedDailyId !== dailyId.toString()){
                    localStorage.setItem('dailyId', dailyId.toString());
                    localStorage.removeItem('guessed');
                    difficulties.forEach(diff => {
                        localStorage.removeItem(`dailyInitials_${diff}`);
                        localStorage.removeItem(`dailyName_${diff}`);
                        localStorage.removeItem(`status_${diff}`);
                        localStorage.removeItem(`guesses_${diff}`);
                    });
                    setStatus({
                        easy: "incomplete",
                        medium: "incomplete",
                        hard: "incomplete",
                        chaos: "incomplete",
                        recentP: "incomplete",
                        recentS: "incomplete",
                    });
                }
            }else{
                localStorage.setItem('dailyId', dailyId.toString());
                localStorage.removeItem('guessed');
                    difficulties.forEach(diff => {
                        localStorage.removeItem(`status_${diff}`);
                        localStorage.removeItem(`guesses_${diff}`);
                    });
                    setStatus({
                        easy: "incomplete",
                        medium: "incomplete",
                        hard: "incomplete",
                        chaos: "incomplete",
                        recentP: "incomplete",
                        recentS: "incomplete",
                    });
            }
        }else{
            difficulties.forEach(diff => {
                localStorage.removeItem(`random_status_${diff}`);
                localStorage.removeItem(`random_guesses_${diff}`);
            });
            setStatus({
                        easy: "incomplete",
                        medium: "incomplete",
                        hard: "incomplete",
                        chaos: "incomplete",
                        recentP: "incomplete",
                        recentS: "incomplete",
            });
        }
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
    let shareString = "";
    if (daily){
        shareString = "Nba-guess: " + Math.floor((dailyId-1753282834)/86400) + " " + difficulties.map(diff => {
            if (guessed[diff] === 3) return "🥇"; // gold
            if (guessed[diff] === 2) return "🥈"; // silver
            if (guessed[diff] === 1) return "🥉"; // bronze
            return "❌"; // red cross
        }).join("") + " https://NBA-Guess.com";
    }else{
        shareString = "Nba-guess: " + difficulties.map(diff => {
            if (guessed[diff] === 3) return "🥇"; // gold
            if (guessed[diff] === 2) return "🥈"; // silver
            if (guessed[diff] === 1) return "🥉"; // bronze
            return "❌"; // red cross
        }).join("") + " https://NBA-Guess.com";
    }

    useEffect(() => {
        if (!didMount.current) {
            didMount.current = true;
            return;
        }
        if (daily) {
            localStorage.setItem('guessed', JSON.stringify(guessed));
        }
    }, [guessed]);

    useEffect(() => {
        if (loadedRef.current) return;
        loadedRef.current = true;
        if(daily) {
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
            const storedGuessed = localStorage.getItem('guessed');
            if (storedGuessed) {
                const parsedGuessed = JSON.parse(storedGuessed);
                setGuessed(prev => ({ ...prev, ...parsedGuessed }));
            }
            if (changed) {
                setStatus(loadedStatus);
            }
        }
        setStatusLoaded(true);
    }, []);

    if (!statusLoaded){ return null;}

    return (
        <div>
            <div style={{ marginBottom: '20px' }}>
            {allCompleteOrFailed && (
                <button onClick={() => setShowPopup(true)}>
                    Show Popup
                </button>
            )}
            </div>
            {process.env.NEXT_PUBLIC_DEV_MODE == "ON" && (
                <button
                onClick={() => {
                    setGuessed({
                        easy: 0,
                        medium: 0,
                        hard: 0,
                        chaos: 0,
                        recentP: 0,
                        recentS: 0,
                    });
                    localStorage.removeItem('guessed');
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
                    Reset Guessed
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
                        setGuessed={(newGuessed) =>
                            setGuessed(prev => ({
                            ...prev,
                            [table.difficulty as Difficulty]: newGuessed
                            }))
                        }
                        dailyId={dailyId}
                    />
                ))}
            </GridSwitcherClient>
            {showPopup && (
                <div
                    style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'white',
                        border: '1px solid #000000ff',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        padding: '24px',
                        zIndex: 1000,
                        minWidth: '300px',
                        minHeight: '150px',
                        backgroundColor: '#ffd29fff',
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