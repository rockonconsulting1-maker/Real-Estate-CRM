import { ReactNode } from "react";

interface StickyActionBarProps {
  children: ReactNode;
}

export function StickyActionBar({ children }: StickyActionBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border bg-background pb-safe pt-2 md:hidden shadow-[0_-10px_28px_rgba(25,30,45,.05)]">
      {children}
    </div>
  );
}
