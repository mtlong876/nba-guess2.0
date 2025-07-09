'use client';

import { useRef, useState ,useEffect } from 'react';
import GridSwitcherClient from '../client/GridSwitcherClient';
import GridDisplay from '../client/GridDisplay';
import { getAllPlayerNames } from '../../actions/playerActions';
import { revalidateTag } from 'next/cache'

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

    useEffect(() => {
    const loadPlayerNames = async () => {
      const names = await getAllPlayerNames();
      setAllPlayerNames(names);
      revalidateTag('players')
    };
    loadPlayerNames();
    }, []);
  
    const [statusLoaded, setStatusLoaded] = useState(false);
    const loadedRef = useRef(false);

    const handleStatusChange = (difficulty: Difficulty, newStatus: Status) => {
        console.log(`Status changed for ${difficulty}: ${newStatus}`);
        setStatus(prevStatus => ({
            ...prevStatus,
            [difficulty]: newStatus,
        }));
        // Optionally update localStorage here
        // localStorage.setItem(`status_${difficulty}`, newStatus);
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
        // eslint-disable-next-line
    }, []);

    if (!statusLoaded){ return null;} // or a loading spinner

    return (
        <div>
            <GridSwitcherClient
                tables={tables}
                playerData={allPlayerData}
                onStatusChange={handleStatusChange}
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
                    />
                ))}
            </GridSwitcherClient>
        </div>
    );
}