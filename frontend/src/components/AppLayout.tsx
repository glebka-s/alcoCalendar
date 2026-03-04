import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

export default function AppLayout() {
  return (
    <div className="dark min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-[220px]">
        <div className="min-h-screen">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
