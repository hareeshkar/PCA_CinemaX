import AdminSidebar from "./sidebar";
import { signOut } from "@/app/auth/actions";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#050505]">
      {/* The Sidebar (Fixed width) */}
      <div className="w-64 flex-shrink-0">
        <AdminSidebar signOutAction={signOut} />
      </div>

      {/* The Main Content Area (Grows to fill space) */}
      <main className="flex-1 p-8 text-white">{children}</main>
    </div>
  );
}
