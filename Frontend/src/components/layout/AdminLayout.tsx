import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/Sidebar';
import { AppSidebar } from './AppSidebar';
import { SiteHeader } from './SiteHeader';

const AdminLayout: React.FC = () => {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <SiteHeader />
                <main className="flex-1 overflow-auto bg-[#F7FBFC]">
                    <div className="container mx-auto px-4 pb-4 md:px-8 md:pb-8 pt-2">
                        <Outlet />
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default AdminLayout;
