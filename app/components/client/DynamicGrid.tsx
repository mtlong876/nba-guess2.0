'use client';

import { useState, useEffect } from 'react';
import { getGameData } from '../../actions/playerActions';
import GridDisplay from './GridDisplay';

type DynamicGridProps = {
  gameId: string;
  difficulty: string;
};

export default function DynamicGrid({ gameId, difficulty }: DynamicGridProps) {
  const [csvData, setCsvData] = useState<{ [key: string]: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!gameId) return;
      
      try {
        const data = await getGameData(gameId);
        if (data) {
          setCsvData(data.csvData);
        }
      } catch (error) {
        console.error('Error loading game data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [gameId]);

  if (loading) {
    return <div>Loading game data...</div>;
  }

  return (
    <GridDisplay 
      csvData={csvData} 
      difficulty={difficulty}
    />
  );
}