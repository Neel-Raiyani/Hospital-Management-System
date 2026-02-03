import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/Sidebar';
import { UserSidebar } from './UserSidebar';
import { SiteHeader } from './SiteHeader';

const Layout: React.FC = () => {
    return (
        <SidebarProvider>
            <Toaster position="top-right" />
            <UserSidebar />
            <SidebarInset>
                <SiteHeader showSearch={false} />
                <main className="flex-1 overflow-auto bg-[#F8FAFC]">
                    <div className="container mx-auto px-4 pb-4 md:px-8 md:pb-8 pt-2">
                        <Outlet />
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default Layout;
