export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen">
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
