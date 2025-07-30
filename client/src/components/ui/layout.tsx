import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export function Layout({ children, className = "" }: LayoutProps) {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {children}
    </div>
  );
}

export function Container({ children, className = "" }: LayoutProps) {
  return (
    <div className={`container mx-auto px-4 ${className}`}>
      {children}
    </div>
  );
}

export function PageHeader({ children, className = "" }: LayoutProps) {
  return (
    <div className={`border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}>
      <div className="container flex h-14 items-center">
        {children}
      </div>
    </div>
  );
}

export function Main({ children, className = "" }: LayoutProps) {
  return (
    <main className={`flex-1 overflow-y-auto p-6 ${className}`}>
      {children}
    </main>
  );
}

export function Sidebar({ children, className = "" }: LayoutProps) {
  return (
    <aside className={`w-64 bg-cred-dark text-white flex-shrink-0 overflow-y-auto ${className}`}>
      {children}
    </aside>
  );
}

export function Content({ children, className = "" }: LayoutProps) {
  return (
    <div className={`flex-1 flex flex-col overflow-hidden ${className}`}>
      {children}
    </div>
  );
}
