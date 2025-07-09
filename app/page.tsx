import dynamic from 'next/dynamic'
const GridSwitcher = dynamic(() => import('./components/server/GridSwitcher'))
//import GridSwitcher from "./components/server/GridSwitcher";
export default function Home() {
  return (
    <div> 
     <GridSwitcher/>
     </div>
  );
}
