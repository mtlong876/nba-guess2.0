'use client';

import { useState, useEffect,useRef} from 'react';

type GridDisplayProps = {
  csvData: { [key: string]: string }[];
  difficulty: "easy"| "medium"| "hard"| "chaos"| "recentP"| "recentS";
  onStatusChange?: (difficulty: "easy"| "medium"| "hard"| "chaos"| "recentP"| "recentS", status: "incomplete" | "completed" | "failed") => void;
};

export default function GridDisplay({ csvData, difficulty , onStatusChange}: GridDisplayProps) {
  const [visibleColumns, setVisibleColumns] = useState<{ [key: string]: boolean }>({});
  const [points, setPoints] = useState(100); // Start with 100 points
  const [status, setStatus] = useState<"incomplete" | "completed" | "failed">("incomplete");
  const firstLoad = useRef(true);
  const headers = csvData.length > 0 ? Object.keys(csvData[0]) : [];
  useEffect(() => {
    if (difficulty != changingDiffculty) {
      return;
    }
      if (onStatusChange) {
        onStatusChange(difficulty, status);
      }
    }, [status]);

  // Example: Each column costs 10 points to reveal
  const getPointCost = (header: string) => headerPointCost[header] ?? 10;
  const headerPointCost: { [key: string]: number } = {
  "Season": 5,
  "Team": 10,
  "MIN": 10,
  "GP": 10,
  "GS": 10,
  "PTS": 10,
  "REB": 10,
  "AST": 10,
  "STL": 10,
  "BLK": 10,
  "TOV": 10,
  "PF": 10,
  "FG%": 10,
  "3P%": 10,
  "FT%": 10
  };
  let changingDiffculty: "easy" | "medium" | "hard" | "chaos" | "recentP" | "recentS" | null = difficulty; 
  // Reset points and visible columns when difficulty changes
  useEffect(() => {
    changingDiffculty = difficulty;
    const savedStatus = localStorage.getItem(`status_${difficulty}`);
    setStatus((savedStatus as "completed" | "failed" | null) || "incomplete");
    const savedPoints = localStorage.getItem(`points_${difficulty}`);
    const savedVisible = localStorage.getItem(`visibleColumns_${difficulty}`);
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
        setPoints(100); // Reset to default if parsing fails
      }
    } else {
      setPoints(100); // Reset to default if no saved points
    }
    changingDiffculty = null;
    firstLoad.current = true;
  }, [difficulty]);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (difficulty != changingDiffculty) {
      return;
    }
    localStorage.setItem(`visibleColumns_${difficulty}`, JSON.stringify(visibleColumns));
    localStorage.setItem(`points_${difficulty}`, points.toString());
  }, [visibleColumns, difficulty]);

  // Reveal all columns and save status if completed or failed
  useEffect(() => {
    if (difficulty != changingDiffculty) {
      return;
    }
    if (firstLoad.current) {
      firstLoad.current = false;
      return; // Skip saving on first load
    }
    if (status === "completed" || status === "failed") {
      const allVisible: { [key: string]: boolean } = {};
      headers.forEach(header => {
        allVisible[header] = true;
      });
      setVisibleColumns(allVisible);
      console.log(status);
      localStorage.setItem(`status_${difficulty}`, status);
      localStorage.setItem(`visibleColumns_${difficulty}`, JSON.stringify(allVisible));
    }
    //console.log(`Status changed to: ${status}`);
  }, [status, difficulty]);



  const toggleColumn = (column: string) => {
    console.log(`Toggling column: ${column}`);
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  // Example: Call this when the player is correctly guessed
  const handleComplete = () => {
    setStatus("completed");
  };

  // Example: Call this when the user runs out of guesses
  const handleFail = () => {
    setStatus("failed");
  };

  return (
    <div>
      <h2>Player Stats: </h2>
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
      <div style={{ marginBottom: '10px' }}>
        <button
          onClick={() => {
            localStorage.removeItem(`visibleColumns_${difficulty}`);
            localStorage.removeItem(`points_${difficulty}`);
            localStorage.removeItem(`status_${difficulty}`);
            setVisibleColumns({});
            setPoints(100);
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
      {/* For demonstration, add buttons to simulate complete/fail */}
      <div style={{ marginBottom: 10 }}>
        <button onClick={handleComplete} style={{ marginRight: 8 }}>Simulate Complete</button>
        <button onClick={handleFail}>Simulate Fail</button>
      </div>
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
                      const cost = getPointCost(header);
                      if (!visibleColumns[header] && points >= cost && status === "incomplete") {
                        setVisibleColumns(prev => ({
                          ...prev,
                          [header]: true
                        }));
                        setPoints(prev => prev - cost);
                      }
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
                      visibility: visibleColumns[header] ? 'visible' : 'hidden',
                      textAlign: 'center',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {row[header]}
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
  );
}