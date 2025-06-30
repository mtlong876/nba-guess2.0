'use client';

import { useState, ReactNode } from 'react';

type GridSelectorProps = {
  children: ReactNode[];
  tableCount: number;
};
const difficulties = ['easy', 'medium', 'hard', 'chaos', 'recentP', 'recentS'];
export default function GridSelector({ children, tableCount }: GridSelectorProps) {
  const [selected, setSelected] = useState(0);

  return (
    <div>
      <div>
        {Array.from({ length: tableCount }, (_, i) => (
          <button key={i} onClick={() => setSelected(i)}>
            {difficulties[i]}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 20 }}>
        {children[selected]}
      </div>
    </div>
  );
}