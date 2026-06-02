// Minimal full-screen layout for /login — no TopAppBar, no BottomNav
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full max-w-[390px] mx-auto bg-background flex flex-col items-center justify-center">
      {children}
    </div>
  );
}
