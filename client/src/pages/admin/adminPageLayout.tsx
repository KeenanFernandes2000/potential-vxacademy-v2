import React, { ReactNode } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import AdminSidebar from "@/components/adminSidebar";

interface AdminPageLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

const AdminPageLayout: React.FC<AdminPageLayoutProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-[#003451]">
        {/* Admin Sidebar */}
        <AdminSidebar />

        {/* Main Content Area */}
        <SidebarInset className="max-w-[100%]">
          <div className="flex flex-col h-full w-full">
            <main className="flex-1 p-6">
              <div className="space-y-6">
                <header className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                      {title}
                    </h1>
                    {description && (
                      <p className="text-white/80 mt-2">{description}</p>
                    )}
                  </div>
                </header>

                <div className="w-full">{children}</div>
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminPageLayout;
