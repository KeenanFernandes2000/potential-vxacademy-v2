import React from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import SubAdminSidebar from "@/components/subAdminSidebar";

const SubAdminLayout = () => {
  return (
    <SidebarProvider>
      <SubAdminSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SubAdminLayout;
