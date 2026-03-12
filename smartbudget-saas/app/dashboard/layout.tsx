import Sidebar from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col px-3 pb-24 pt-3 sm:px-4 sm:pb-28 sm:pt-4 lg:p-6">
          <Topbar />
          <main className="flex-1">{children}</main>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
