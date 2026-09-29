import { Sidebar } from '@/components/dashboard/Sidebar';
import { ToastHost } from '@/components/ui/demo-toast';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">{children}</main>
      <ToastHost />
    </div>
  );
}
