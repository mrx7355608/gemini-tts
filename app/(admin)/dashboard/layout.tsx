import AdminNavigationSidebar from "@/app/components/AdminSidebar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen">
      <AdminNavigationSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
