export const dynamic = "force-dynamic";
// import dynamic from 'next/dynamic'
// const GridSwitcher = dynamic(() => import('./components/server/GridSwitcher'))
import GridSwitcher from "./components/server/GridSwitcher";
import { Suspense } from 'react';
export default function Home() {
  return (
    <div>
      <Suspense fallback={<div>Loading grids...</div>}> 
        <GridSwitcher/>
      </Suspense>
     </div>
  );
}
