import AdminNavigationSidebar from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex ml-64">
      <AdminNavigationSidebar />
      <main className="flex-1 overflow-auto pt-16">{children}</main>
    </div>
  );
}
