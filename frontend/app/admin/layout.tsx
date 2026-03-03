export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Access protection is handled by Next.js middleware via httpOnly cookie.
  return <>{children}</>
}
