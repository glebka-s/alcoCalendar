import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

export default function AppLayout() {
  return (
    <div className="dark flex h-full flex-col bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto lg:ml-[220px]">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
