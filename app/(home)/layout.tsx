import HomeNavigationSidebar from "../components/HomeNavigationSidebar";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen">
      <HomeNavigationSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
