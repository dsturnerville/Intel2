import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Building2 } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full overflow-x-hidden">
        <AppSidebar />
        <SidebarInset className="flex-1 min-w-0">
          {/* Mobile header with menu trigger */}
          <header className="md:hidden sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-background px-4">
            <SidebarTrigger className="h-8 w-8" />
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold">DispoFlow</span>
            </div>
          </header>
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
