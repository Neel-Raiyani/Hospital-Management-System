import { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { Outlet, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/Sidebar';
import { ReceptionistSidebar } from './ReceptionistSidebar';
import { ReceptionistHeader } from './ReceptionistHeader';
import { PageLoader, PageTransition } from '@/components/ui/PageTransition';

export function ReceptionistLayout() {
    const location = useLocation();

    return (
        <SidebarProvider>
            <Toaster position="top-right" />
            <ReceptionistSidebar />
            <SidebarInset>
                <ReceptionistHeader showSearch={true} />
                <main className="flex-1 overflow-auto bg-gray-50">
                    <div className="container mx-auto px-4 pb-4 md:px-8 md:pb-8 pt-2">
                        <Suspense fallback={<PageLoader />}>
                            <PageTransition key={location.pathname}>
                                <Outlet />
                            </PageTransition>
                        </Suspense>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
