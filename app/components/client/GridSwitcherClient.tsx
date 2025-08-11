'use client';

import { useState} from 'react';


type GridSwitcherClientProps = {
  tables: {
    title: string;
    difficulty: string;
    daily: boolean;
  }[];
  children: React.ReactNode[];
  status: Record<"easy" | "medium" | "hard" | "chaos" | "recentP" | "recentS", "incomplete" | "completed" | "failed">;
};

export default function GridSwitcherClient({ tables, children ,status}: GridSwitcherClientProps) {
  const [selected, setSelected] = useState(0);
  const difficultiesArray = ["easy", "medium", "hard", "chaos", "recentP", "recentS"];
  return (
    <div>
      <div style={{ marginBottom: '20px',
       }}>
        {tables.map((table, index) => {
          const isSolved = status[difficultiesArray[index] as keyof typeof status] === "completed";
          const isFailed = status[difficultiesArray[index] as keyof typeof status] === "failed";
          
          return (
            <button 
              key={index}
              onClick={() => {
                setSelected(index);
              }}
              style={{
                marginRight: '10px',
                padding: '8px 16px',
                backgroundColor: selected === index ? '#4CAF50' : '#f0f0f0',
                color: selected === index ? 'white' : 'black',
                border: '1px solid #000000ff',
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