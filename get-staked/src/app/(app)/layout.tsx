import { BottomNav } from "@/components/bottom-nav";
import { CoachBubble } from "@/components/coach-bubble";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Main content area */}
      <main className="flex-1 pb-20 relative">
        {children}
        {/* Coach bubble floats on top of content */}
        <CoachBubble />
      </main>
      
      {/* Bottom navigation */}
      <BottomNav />
    </div>
  );
}
