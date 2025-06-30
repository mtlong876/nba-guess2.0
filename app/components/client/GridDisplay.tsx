'use client';

import { useState, useEffect } from 'react';

type GridDisplayProps = {
  csvData: { [key: string]: string }[];
  difficulty: string;
};

export default function GridDisplay({ csvData, difficulty }: GridDisplayProps) {
  const [visibleColumns, setVisibleColumns] = useState<{ [key: string]: boolean }>({});

  const headers = csvData.length > 0 ? Object.keys(csvData[0]) : [];
  let changingDiffculty = difficulty || 'easy';
  // Load saved state from localStorage when component mounts
  useEffect(() => {
    changingDiffculty = difficulty
    const savedVisible = localStorage.getItem(`visibleColumns_${difficulty}`);
    if (savedVisible) {
      try {
        setVisibleColumns(JSON.parse(savedVisible));
      } catch (error) {
        console.error('Error parsing saved visible columns:', error);
      }
    }
    changingDiffculty = "false"
  }, [difficulty]);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (difficulty != changingDiffculty) {
      return;
    }
    localStorage.setItem(`visibleColumns_${difficulty}`, JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  const toggleColumn = (column: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  return (
    <div>
      <h2>Player Stats: </h2>
      
      {/* Reset Progress button */}
      <div style={{ marginBottom: '10px' }}>
        <button
          onClick={() => {
            localStorage.removeItem(`visibleColumns_${difficulty}`);
            setVisibleColumns({});
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

      {/* Table */}
      {csvData.length > 0 ? (
        <table style={{ 
          borderCollapse: 'collapse', 
          width: '100%',
          tableLayout: 'fixed'
        }}>
          {/* Button row - now at top */}
          <thead>
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
                    onClick={() => toggleColumn(header)}
                    disabled={visibleColumns[header]}
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