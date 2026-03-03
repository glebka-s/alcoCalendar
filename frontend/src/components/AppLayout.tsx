import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function AppLayout() {
  return (
    <div className="flex flex-col h-full bg-background">
      <main className="flex-1 min-h-0 overflow-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
