'use client';

import { useRef, useState ,useEffect } from 'react';
import GridSwitcherClient from '../client/GridSwitcherClient';
import GridDisplay from '../client/GridDisplay';
import { getAllPlayerNames} from '../../actions/playerActions';

type GridSharedProps = {
  tables: any[];
   allPlayerData: any[];
};
type Difficulty = "easy" | "medium" | "hard" | "chaos" | "recentP" | "recentS";
type Status = "incomplete" | "completed" | "failed";
const difficulties: Difficulty[] = [
  "easy", "medium", "hard", "chaos", "recentP", "recentS"
];

export default function GridShared({tables, allPlayerData}: GridSharedProps) {
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
        </div>

    );
}