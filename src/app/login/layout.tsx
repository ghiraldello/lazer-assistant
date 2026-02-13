export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Login page uses a clean layout without sidebar/header
  return <>{children}</>;
}
