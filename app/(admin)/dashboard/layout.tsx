import AdminNavigationSidebar from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex ml-72">
      <AdminNavigationSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
